import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useUserData } from './hooks/useUserData';
import { AuthButton } from './components/AuthButton';
import { Calendar } from './components/Calendar';
import { Stats } from './components/Stats';
import { VacationBar } from './components/VacationBar';
import { HolidaysTab } from './components/HolidaysTab';
import { SettingsTab } from './components/SettingsTab';
import { isWorkingDay, parseKey, isWeekend, isPtHoliday, isCustomHoliday } from './lib/holidays';
import type { TabName } from './types';

interface RangeStart { y: number; m: number; d: number; }

function Toast({ message }: { message: string }) {
  return <div className={`toast${message ? ' show' : ''}`}>{message}</div>;
}

export default function App() {
  const { user, loading, signInWithGoogle, logout } = useAuth();
  const {
    data, toggleOfficeDay,
    addCustomHoliday, removeCustomHoliday,
    addVacation, removeVacation,
    resetAll,
  } = useUserData(user);

  const [viewDate, setViewDate] = useState(new Date());
  const [tab, setTab] = useState<TabName>('calendar');
  const [vacationMode, setVacationMode] = useState(false);
  const [rangeStart, setRangeStart] = useState<RangeStart | null>(null);
  const [toast, setToast] = useState('');

  // Theme: null = follow system, 'light' | 'dark' = user override
  type ThemeOverride = 'light' | 'dark' | null;
  const [themeOverride, setThemeOverride] = useState<ThemeOverride>(() => {
    return (localStorage.getItem('themeOverride') as ThemeOverride) ?? null;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (themeOverride) {
      root.setAttribute('data-theme', themeOverride);
      localStorage.setItem('themeOverride', themeOverride);
    } else {
      root.removeAttribute('data-theme');
      localStorage.removeItem('themeOverride');
    }
  }, [themeOverride]);

  const cycleTheme = useCallback(() => {
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setThemeOverride((current) => {
      if (current === null) return systemDark ? 'light' : 'dark';
      if (current === 'dark') return 'light';
      return null; // back to system
    });
  }, []);

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }, []);

  const handleSignOut = async () => {
    if (confirm('Sign out?')) { await logout(); showToast('Signed out'); }
  };

  const changeMonth = (step: number) => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + step, 1));
  };

  // Compute vacation working days for this month
  const getVacationWorkingDays = useCallback((): Set<string> => {
    const set = new Set<string>();
    for (const v of data.vacations) {
      const s = parseKey(v.start);
      const e = parseKey(v.end);
      const cur = new Date(s.y, s.m, s.d);
      const end = new Date(e.y, e.m, e.d);
      while (cur <= end) {
        const cy = cur.getFullYear(), cm = cur.getMonth(), cd = cur.getDate();
        if (cy === year && cm === month) {
          if (!isWeekend(cy, cm, cd) && !isPtHoliday(cy, cm, cd) && !isCustomHoliday(cm, cd, data.customHolidays)) {
            set.add(`${cy}-${cm}-${cd}`);
          }
        }
        cur.setDate(cur.getDate() + 1);
      }
    }
    return set;
  }, [data.vacations, data.customHolidays, year, month]);

  const vacationDays = getVacationWorkingDays();

  // Working days this month (excluding vacations)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let workingCount = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dayKey = `${year}-${month}-${d}`;
    if (isWorkingDay(year, month, d, data.customHolidays) && !vacationDays.has(dayKey)) {
      workingCount++;
    }
  }

  const monthKey   = `${year}-${month}`;
  const officeDays = data.officeDays[monthKey] ?? [];
  const goal = Math.round(workingCount * 0.6);

  // Day click handler — handles both normal and vacation mode
  const handleDayClick = (day: number) => {
    if (!vacationMode) {
      toggleOfficeDay(year, month, day);
      return;
    }
    if (!rangeStart) {
      setRangeStart({ y: year, m: month, d: day });
    } else {
      const s = new Date(rangeStart.y, rangeStart.m, rangeStart.d);
      const e = new Date(year, month, day);
      if (e < s) addVacation(year, month, day, rangeStart.y, rangeStart.m, rangeStart.d);
      else        addVacation(rangeStart.y, rangeStart.m, rangeStart.d, year, month, day);
      setRangeStart(null);
      showToast('Holiday saved');
    }
  };

  const toggleVacationMode = () => {
    setVacationMode((v) => { if (v) setRangeStart(null); return !v; });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      <Toast message={toast} />
      <div className="app">
        <div className="header">
          <span className="header-title">Office Tracker</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="theme-btn" onClick={cycleTheme} title="Toggle theme">
              {themeOverride === 'light' ? '☀️' : themeOverride === 'dark' ? '🌙' : '💻'}
            </button>
            <AuthButton user={user} onSignIn={signInWithGoogle} onSignOut={handleSignOut} />
          </div>
        </div>

        <div className="card">
          <div className="tabs">
            {(['calendar', 'holidays', 'settings'] as TabName[]).map((t) => (
              <button
                key={t}
                className={`tab-btn${tab === t ? ' active' : ''}`}
                onClick={() => setTab(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {tab === 'calendar' && (
            <div>
              <Calendar
                year={year} month={month}
                officeDays={officeDays}
                vacationDays={vacationDays}
                customHolidays={data.customHolidays}
                vacationMode={vacationMode}
                rangeStart={rangeStart}
                onPrev={() => changeMonth(-1)}
                onNext={() => changeMonth(1)}
                onDayClick={handleDayClick}
              />
              <Stats working={workingCount} goal={goal} done={officeDays.length} />
              <VacationBar
                active={vacationMode}
                rangeStart={rangeStart}
                viewYear={year}
                viewMonth={month}
                onToggle={toggleVacationMode}
              />
            </div>
          )}

          {tab === 'holidays' && (
            <HolidaysTab
              vacations={data.vacations}
              customHolidays={data.customHolidays}
              onRemoveVacation={removeVacation}
              onRemoveCustomHoliday={removeCustomHoliday}
            />
          )}

          {tab === 'settings' && (
            <SettingsTab
              onAddCustomHoliday={addCustomHoliday}
              onResetAll={resetAll}
              onToast={showToast}
            />
          )}
        </div>
      </div>
    </>
  );
}
