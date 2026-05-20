import { fmtDate } from '../lib/holidays';

interface RangeStart {
  y: number; m: number; d: number;
}

interface Props {
  active: boolean;
  rangeStart: RangeStart | null;
  viewYear: number;
  viewMonth: number;
  onToggle: () => void;
}

export function VacationBar({ active, rangeStart, viewYear, viewMonth, onToggle }: Props) {
  const sameMonth = rangeStart
    ? rangeStart.y === viewYear && rangeStart.m === viewMonth
    : true;

  let hint = 'tap to activate';
  if (active) hint = rangeStart ? 'now click end day' : 'click start day';

  return (
    <>
      <div
        className={`vacation-bar${active ? ' active' : ''}`}
        onClick={onToggle}
      >
        <div className="vacation-bar-left">
          <label className="toggle-switch" onClick={(e) => e.stopPropagation()}>
            <input type="checkbox" checked={active} onChange={onToggle} />
            <div className="toggle-track" />
          </label>
          <span className="vacation-bar-label">✈ Holiday Mode</span>
        </div>
        <span className="vacation-hint">{hint}</span>
      </div>

      {active && rangeStart && !sameMonth && (
        <div className="cross-month-notice">
          Start: {fmtDate(rangeStart.y, rangeStart.m, rangeStart.d)} — now click the end day
        </div>
      )}
    </>
  );
}
