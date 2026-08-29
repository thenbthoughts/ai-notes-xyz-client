import type { MemoNote } from './memoTypes';

function csvEscape(v: string): string {
  if (v.includes('"') || v.includes(',') || v.includes('\n')) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export function exportMemosToCsv(notes: MemoNote[]): void {
  const header = ['id', 'title', 'body', 'noteColor', 'labels', 'pinned', 'archived', 'reminderTime', 'createdAt', 'updatedAt'];
  const rows = notes.map((n) => [
    csvEscape(n.id),
    csvEscape(n.title),
    csvEscape(n.body),
    csvEscape(n.noteColor),
    csvEscape(n.labelNames.join('|')),
    String(n.pinned),
    String(n.archived),
    n.reminderTime ? new Date(n.reminderTime).toISOString() : '',
    new Date(n.createdAt).toISOString(),
    new Date(n.updatedAt).toISOString(),
  ].join(','));
  const blob = new Blob([header.join(',') + '\n' + rows.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `memos-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

export function exportMemosToJson(notes: MemoNote[]): void {
  const blob = new Blob([JSON.stringify(notes, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `memos-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}
