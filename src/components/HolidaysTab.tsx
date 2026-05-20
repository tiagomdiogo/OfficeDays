import type { Vacation } from '../types';

interface Props {
  vacations: Vacation[];
  customHolidays: string[];
  onRemoveVacation: (id: string) => void;
  onRemoveCustomHoliday: (ddmm: string) => void;
}

export function HolidaysTab({ vacations, customHolidays, onRemoveVacation, onRemoveCustomHoliday }: Props) {
  return (
    <div>
      <div className="section-label">Booked Holidays</div>
      {vacations.length === 0 ? (
        <div className="holiday-empty">
          No holidays booked yet.<br />Use Holiday Mode on the calendar.
        </div>
      ) : (
        [...vacations].reverse().map((v) => (
          <div key={v.id} className="vacation-item">
            <span>✈ {v.label}</span>
            <button className="vacation-item-remove" onClick={() => onRemoveVacation(v.id)}>×</button>
          </div>
        ))
      )}

      <div className="section-label" style={{ marginTop: 20 }}>Bridge / Custom Public Holidays</div>
      {customHolidays.length === 0 ? (
        <div className="holiday-empty" style={{ padding: '16px 0' }}>None added.</div>
      ) : (
        customHolidays.map((h) => (
          <div key={h} className="tag-item">
            <span>{h}</span>
            <button onClick={() => onRemoveCustomHoliday(h)}>×</button>
          </div>
        ))
      )}
    </div>
  );
}
