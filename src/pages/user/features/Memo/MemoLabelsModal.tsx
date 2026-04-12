import { LucideTrash2, LucideX } from 'lucide-react';
import { useState } from 'react';
import type { MemoLabel } from './memoTypes';

type MemoLabelsModalProps = {
  open: boolean;
  labels: MemoLabel[];
  onClose: () => void;
  onAdd: (name: string) => Promise<unknown>;
  onRename: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export default function MemoLabelsModal({
  open,
  labels,
  onClose,
  onAdd,
  onRename,
  onDelete,
}: MemoLabelsModalProps) {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  if (!open) return null;

  const startEdit = (l: MemoLabel) => {
    setEditingId(l.id);
    setEditValue(l.name);
  };

  const commitEdit = async () => {
    if (!editingId) return;
    const v = editValue.trim();
    if (!v) return;
    await onRename(editingId, v);
    setEditingId(null);
    setEditValue('');
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 touch-manipulation"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className="relative flex max-h-[min(90dvh,32rem)] w-full max-w-md flex-col rounded-t-2xl border border-[#dadce0] bg-white shadow-xl sm:rounded-2xl"
        style={{ fontFamily: 'Roboto, system-ui, sans-serif' }}
      >
        <div className="flex items-center justify-between border-b border-[#e8eaed] bg-[#fafafa] px-3 py-2">
          <h2 className="text-base font-medium tracking-tight text-[#3c4043]">Edit labels</h2>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#5f6368] hover:bg-[#f1f3f4]"
            aria-label="Close"
            onClick={onClose}
          >
            <LucideX className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
          <div className="flex gap-1.5">
            <input
              className="min-h-9 flex-1 rounded-full border border-[#dadce0] bg-white px-3 text-sm text-[#3c4043] outline-none placeholder:text-[#5f6368] transition focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20"
              placeholder="Create new label"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void (async () => {
                    const v = newName.trim();
                    if (!v) return;
                    await onAdd(v);
                    setNewName('');
                  })();
                }
              }}
            />
            <button
              type="button"
              className="min-h-9 shrink-0 rounded-full bg-[#1a73e8] px-4 text-xs font-medium text-white shadow-sm transition hover:bg-[#1765cc] active:bg-[#1557b0]"
              onClick={() => {
                void (async () => {
                  const v = newName.trim();
                  if (!v) return;
                  await onAdd(v);
                  setNewName('');
                })();
              }}
            >
              Add
            </button>
          </div>
          <ul className="overflow-hidden rounded-xl border border-[#e8eaed] bg-white shadow-sm">
            {labels.length === 0 ? (
              <li className="px-3 py-6 text-center text-xs leading-relaxed text-[#5f6368] sm:text-sm">
                No labels yet. Create one above — then assign them from each memo.
              </li>
            ) : (
              labels.map((l) => (
                <li
                  key={l.id}
                  className="flex min-h-10 items-center gap-1.5 border-b border-[#f1f3f4] px-2 py-1.5 last:border-b-0 sm:px-3"
                >
                  {editingId === l.id ? (
                    <>
                      <input
                        className="min-h-9 flex-1 rounded-lg border border-[#dadce0] px-2 text-sm text-[#3c4043] outline-none placeholder:text-[#5f6368] focus:ring-2 focus:ring-[#1a73e8]/25"
                        placeholder="Label name"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => void commitEdit()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') void commitEdit();
                          if (e.key === 'Escape') {
                            setEditingId(null);
                            setEditValue('');
                          }
                        }}
                        autoFocus
                      />
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="min-h-9 flex-1 rounded-lg px-1.5 text-left text-sm text-[#3c4043] transition hover:bg-[#f8f9fa]"
                        onClick={() => startEdit(l)}
                      >
                        {l.name}
                      </button>
                      <button
                        type="button"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-rose-600 hover:bg-rose-50"
                        aria-label={`Delete ${l.name}`}
                        onClick={() => {
                          if (
                            typeof window !== 'undefined' &&
                            window.confirm(`Delete label "${l.name}"? Memos stay but are unlabeled from this tag.`)
                          ) {
                            void onDelete(l.id);
                          }
                        }}
                      >
                        <LucideTrash2 className="h-3.5 w-3.5" strokeWidth={2} />
                      </button>
                    </>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
