// Portugal national public holidays as MM-DD
export const PT_HOLIDAYS = new Set([
  '01-01', '04-25', '05-01', '06-10',
  '08-15', '10-05', '11-01', '12-01', '12-08', '12-25',
]);

export function isPtHoliday(_year: number, month: number, day: number): boolean {
  const mmdd = `${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return PT_HOLIDAYS.has(mmdd);
}

export function isWeekend(year: number, month: number, day: number): boolean {
  const dow = new Date(year, month, day).getDay();
  return dow === 0 || dow === 6;
}

export function isCustomHoliday(month: number, day: number, customHolidays: string[]): boolean {
  const ddmm = `${String(day).padStart(2, '0')}-${String(month + 1).padStart(2, '0')}`;
  return customHolidays.includes(ddmm);
}

export function isWorkingDay(
  year: number,
  month: number,
  day: number,
  customHolidays: string[],
): boolean {
  return (
    !isWeekend(year, month, day) &&
    !isPtHoliday(year, month, day) &&
    !isCustomHoliday(month, day, customHolidays)
  );
}

export function parseKey(key: string): { y: number; m: number; d: number } {
  const [y, m, d] = key.split('-').map(Number);
  return { y, m, d };
}

export function fmtDate(y: number, m: number, d: number): string {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${String(d).padStart(2, '0')} ${months[m]} ${y}`;
}

export const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
