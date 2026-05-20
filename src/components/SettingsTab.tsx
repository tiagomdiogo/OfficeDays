import { useState } from 'react';

interface Props {
  onAddCustomHoliday: (ddmm: string) => void;
  onResetAll: () => void;
  onToast: (msg: string) => void;
}

export function SettingsTab({ onAddCustomHoliday, onResetAll, onToast }: Props) {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    if (!/^\d{2}-\d{2}$/.test(input.trim())) {
      onToast('Format: DD-MM');
      return;
    }
    onAddCustomHoliday(input.trim());
    setInput('');
    onToast('Holiday added');
  };

  const handleReset = () => {
    if (confirm('Delete all tracked days, holidays and vacations?')) {
      onResetAll();
      onToast('All data cleared');
    }
  };

  return (
    <div>
      <div className="section-label">Add Bridge / Custom Holiday (DD-MM)</div>
      <div className="input-row">
        <input
          type="text"
          value={input}
          maxLength={5}
          placeholder="e.g. 12-05"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button className="add-btn" onClick={handleAdd}>Add</button>
      </div>
      <button className="reset-btn" onClick={handleReset}>Clear all data</button>
    </div>
  );
}
