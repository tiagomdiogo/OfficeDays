interface Props {
  working: number;
  goal: number;
  done: number;
}

export function Stats({ working, goal, done }: Props) {
  const pct = working > 0 ? Math.min((done / Math.max(goal, 1)) * 100, 100) : 0;
  const doneClass = done >= goal ? 'over' : done > 0 ? 'under' : '';

  return (
    <>
      <div className="stats">
        <div className="stat">
          <div className="stat-val">{working}</div>
          <div className="stat-label">Working</div>
        </div>
        <div className="stat">
          <div className="stat-val">{goal}</div>
          <div className="stat-label">Goal (60%)</div>
        </div>
        <div className="stat">
          <div className={`stat-val ${doneClass}`}>{done}</div>
          <div className="stat-label">Done</div>
        </div>
      </div>
      <div className="progress-wrap">
        <div
          className={`progress-bar${done >= goal ? ' done' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </>
  );
}
