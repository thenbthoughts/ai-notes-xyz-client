import type { MemoLabel, MemoNote } from './memoTypes';

type MemoLabelBadgeRowProps = {
  note: MemoNote;
  labels: MemoLabel[];
  className?: string;
};

/** Read-only label chips (Google Keep–style). */
export default function MemoLabelBadgeRow({ note, labels, className = '' }: MemoLabelBadgeRowProps) {
  if (note.labelIds.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1 ${className}`} aria-label="Labels">
      {note.labelIds.map((lid, i) => {
        const name = note.labelNames[i] || labels.find((l) => l.id === lid)?.name || '';
        if (!name) return null;
        return (
          <span
            key={lid}
            className="inline-flex max-w-full shrink-0 items-center truncate rounded-full border border-[#dadce0]/70 bg-[#e8eaed] px-2 py-px text-[10px] font-medium text-[#3c4043]"
            style={{ fontFamily: 'Roboto, system-ui, sans-serif' }}
          >
            {name}
          </span>
        );
      })}
    </div>
  );
}
