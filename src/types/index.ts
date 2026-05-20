export interface Vacation {
  id: string;
  start: string; // "YYYY-M-D"
  end: string;   // "YYYY-M-D"
  label: string;
}

export interface UserData {
  officeDays: Record<string, number[]>; // { "2026-4": [5,6,7] }
  customHolidays: string[];             // ["12-05"]
  vacations: Vacation[];
}

export type TabName = 'calendar' | 'holidays' | 'settings';
