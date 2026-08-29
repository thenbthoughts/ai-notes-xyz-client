import { useEffect, useMemo, useState } from 'react';

type Cmd = { id: string; label: string; hint: string; run: () => void };

export default function MemoCommandPalette({ commands, open, onClose }: { commands: Cmd[]; open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q) || c.hint.toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center bg-black/40 p-4 pt-[18vh]">
      <button type="button" aria-label="Close command palette" className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl">
        <input
          autoFocus
          aria-label="Command palette search"
          placeholder="Type a command…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
          className="w-full border-b border-zinc-800 bg-transparent px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
        />
        <div className="max-h-64 overflow-y-auto p-1">
          {filtered.length === 0 ? <p className="px-3 py-6 text-center text-xs text-zinc-500">No commands</p> : filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-label={c.label}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-800"
              onClick={() => { c.run(); onClose(); }}
            >
              <span className="font-medium">{c.label}</span>
              <span className="text-xs text-zinc-500">{c.hint}</span>
            </button>
          ))}
        </div>
        <p className="border-t border-zinc-800 px-3 py-1.5 text-[10px] text-zinc-500">Press Esc to close · Enter to run</p>
      </div>
    </div>
  );
}
