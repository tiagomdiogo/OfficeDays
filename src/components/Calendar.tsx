import { MONTH_NAMES, isPtHoliday, isWeekend, isCustomHoliday } from '../lib/holidays';

interface RangeStart {
  y: number; m: number; d: number;
}

interface Props {
  year: number;
  month: number;
  officeDays: number[];
  vacationDays: Set<string>;
  customHolidays: string[];
  vacationMode: boolean;
  rangeStart: RangeStart | null;
  onPrev: () => void;
  onNext: () => void;
  onDayClick: (day: number) => void;
}

const DAY_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function Calendar({
  year, month,
  officeDays, vacationDays, customHolidays,
  vacationMode, rangeStart,
  onPrev, onNext, onDayClick,
}: Props) {
  const today = new Date();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();
  const offset = firstDow === 0 ? 6 : firstDow - 1;

  const cells: React.ReactNode[] = [];

  // Empty cells for offset
  for (let i = 0; i < offset; i++) {
    cells.push(<div key={`e${i}`} className="day empty" />);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dayKey = `${year}-${month}-${d}`;
    const isWknd   = isWeekend(year, month, d);
    const isPtHol  = isPtHoliday(year, month, d);
    const isCustHol = isCustomHoliday(month, d, customHolidays);
    const isHol    = isPtHol || isCustHol;
    const isVac    = vacationDays.has(dayKey);
    const isOff    = officeDays.includes(d);
    const isToday  = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
    const isStart  = rangeStart?.y === year && rangeStart?.m === month && rangeStart?.d === d;

    let className = 'day';
    let clickable = false;
    let title = '';

    if (isWknd) {
      className += ' weekend';
    } else if (isHol) {
      className += ' pt-holiday';
      title = isPtHol ? 'Public holiday' : 'Custom holiday';
    } else if (isVac) {
      className += ' vacation';
      title = 'Holiday';
      if (vacationMode) clickable = true;
    } else {
      className += isOff ? ' office' : ' workday';
      clickable = true;
    }

    if (isStart) className += ' range-start';
    if (isToday) className += ' today-ring';

    cells.push(
      <div
        key={d}
        className={className}
        title={title}
        onClick={clickable ? () => onDayClick(d) : undefined}
      >
        {d}
      </div>
    );
  }

  return (
    <>
      <div className="month-nav">
        <button className="nav-btn" onClick={onPrev}>←</button>
        <span className="month-label">{MONTH_NAMES[month]} {year}</span>
        <button className="nav-btn" onClick={onNext}>→</button>
      </div>

      <div className="day-headers">
        {DAY_HEADERS.map((h, i) => (
          <div key={i} className="day-hdr" style={i >= 5 ? { color: '#ccc' } : undefined}>{h}</div>
        ))}
      </div>

      <div className={`cal-grid${vacationMode ? ' vacation-mode' : ''}`}>
        {cells}
      </div>
    </>
  );
}
