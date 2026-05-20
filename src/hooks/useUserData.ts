import { useEffect, useState, useCallback } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import  type { User } from 'firebase/auth';
import { db } from '../lib/firebase';
import type { UserData, Vacation } from '../types';
import { fmtDate, parseKey } from '../lib/holidays';
import { isWeekend, isPtHoliday, isCustomHoliday } from '../lib/holidays';

const DEFAULT_DATA: UserData = {
  officeDays: {},
  customHolidays: [],
  vacations: [],
};

export function useUserData(user: User | null) {
  const [data, setData] = useState<UserData>(DEFAULT_DATA);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const d = snap.data() as Partial<UserData>;
        setData({
          officeDays:     d.officeDays     ?? {},
          customHolidays: d.customHolidays ?? [],
          vacations:      d.vacations      ?? [],
        });
      } else {
        setData(DEFAULT_DATA);
      }
    });
    return unsub;
  }, [user]);

  const save = useCallback(async (updated: UserData) => {
    if (!user) return;
    setSyncing(true);
    await setDoc(doc(db, 'users', user.uid), updated, { merge: true });
    setSyncing(false);
  }, [user]);

  // ── Office days ──────────────────────────────────────────────────────────────
  const toggleOfficeDay = useCallback((year: number, month: number, day: number) => {
    const key = `${year}-${month}`;
    const current = data.officeDays[key] ?? [];
    const next = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    const updated = { ...data, officeDays: { ...data.officeDays, [key]: next } };
    setData(updated);
    save(updated);
  }, [data, save]);

  // ── Custom holidays ──────────────────────────────────────────────────────────
  const addCustomHoliday = useCallback((ddmm: string) => {
    if (data.customHolidays.includes(ddmm)) return;
    const updated = { ...data, customHolidays: [...data.customHolidays, ddmm] };
    setData(updated);
    save(updated);
  }, [data, save]);

  const removeCustomHoliday = useCallback((ddmm: string) => {
    const updated = { ...data, customHolidays: data.customHolidays.filter((h) => h !== ddmm) };
    setData(updated);
    save(updated);
  }, [data, save]);

  // ── Vacations ────────────────────────────────────────────────────────────────
  const addVacation = useCallback((
    sy: number, sm: number, sd: number,
    ey: number, em: number, ed: number,
  ) => {
    const startKey = `${sy}-${sm}-${sd}`;
    const endKey   = `${ey}-${em}-${ed}`;
    const label = startKey === endKey
      ? fmtDate(sy, sm, sd)
      : `${fmtDate(sy, sm, sd)} – ${fmtDate(ey, em, ed)}`;
    const vac: Vacation = { id: `${Date.now()}`, start: startKey, end: endKey, label };
    const updated = { ...data, vacations: [...data.vacations, vac] };
    setData(updated);
    save(updated);
  }, [data, save]);

  const removeVacation = useCallback((id: string) => {
    const updated = { ...data, vacations: data.vacations.filter((v) => v.id !== id) };
    setData(updated);
    save(updated);
  }, [data, save]);

  // ── Vacation working days for a given month ───────────────────────────────────
  const getVacationWorkingDays = useCallback((
    year: number,
    month: number,
    customHols: string[],
  ): Set<string> => {
    const set = new Set<string>();
    for (const v of data.vacations) {
      const s = parseKey(v.start);
      const e = parseKey(v.end);
      const cur = new Date(s.y, s.m, s.d);
      const end = new Date(e.y, e.m, e.d);
      while (cur <= end) {
        const cy = cur.getFullYear(), cm = cur.getMonth(), cd = cur.getDate();
        if (cy === year && cm === month) {
          if (
            !isWeekend(cy, cm, cd) &&
            !isPtHoliday(cy, cm, cd) &&
            !isCustomHoliday(cm, cd, customHols)
          ) {
            set.add(`${cy}-${cm}-${cd}`);
          }
        }
        cur.setDate(cur.getDate() + 1);
      }
    }
    return set;
  }, [data.vacations]);

  // ── Reset ────────────────────────────────────────────────────────────────────
  const resetAll = useCallback(async () => {
    setData(DEFAULT_DATA);
    await save(DEFAULT_DATA);
  }, [save]);

  return {
    data,
    syncing,
    toggleOfficeDay,
    addCustomHoliday,
    removeCustomHoliday,
    addVacation,
    removeVacation,
    getVacationWorkingDays,
    resetAll,
  };
}
