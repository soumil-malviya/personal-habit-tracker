import { useState } from 'react';
import { Edit2 } from 'lucide-react';
import { BRAND } from '../constants/brand';

interface UsernameChipProps {
  username: string;
  onUsernameChange: (name: string) => void;
}

export function UsernameChip({ username, onUsernameChange }: UsernameChipProps) {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState(username);

  const commit = () => {
    const next = temp.trim() || BRAND.defaultUsername;
    onUsernameChange(next);
    setTemp(next);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        type="text"
        value={temp}
        onChange={(e) => setTemp(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') {
            setTemp(username);
            setEditing(false);
          }
        }}
        autoFocus
        maxLength={18}
        className="w-28 sm:w-36 bg-slate-100 dark:bg-slate-900/80 text-sm font-semibold border border-cyan-500/50 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setTemp(username);
        setEditing(true);
      }}
      className="group flex items-center gap-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400 min-w-0 max-w-[10rem] sm:max-w-[12rem]"
      title="Click to change name"
    >
      <span className="truncate">{username}</span>
      <Edit2 className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 shrink-0" />
    </button>
  );
}
