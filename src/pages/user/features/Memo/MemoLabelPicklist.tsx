import type { MemoLabel } from './memoTypes';

type MemoLabelPicklistProps = {
  labels: MemoLabel[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  idPrefix: string;
  /** `list` = scrollable checkboxes; `pills` = wrap row of toggles (cards, composer). */
  layout?: 'list' | 'pills';
  disabled?: boolean;
};

export default function MemoLabelPicklist({
  labels,
  selectedIds,
  onChange,
  idPrefix,
  layout = 'list',
  disabled = false,
}: MemoLabelPicklistProps) {
  const set = new Set(selectedIds);

  const toggle = (labelId: string) => {
    if (disabled) return;
    const next = new Set(set);
    if (next.has(labelId)) {
      next.delete(labelId);
    } else {
      next.add(labelId);
    }
    onChange([...next]);
  };

  if (labels.length === 0) {
    return (
      <p className="mb-0 text-[11px] leading-relaxed text-[#5f6368]" style={{ fontFamily: 'Roboto, system-ui, sans-serif' }}>
        No labels yet. Use <span className="font-medium text-[#3c4043]">Edit labels</span> in the sidebar.
      </p>
    );
  }

  if (layout === 'pills') {
    return (
      <div
        className="flex flex-wrap gap-1"
        role="group"
        aria-label="Choose labels"
        style={{ fontFamily: 'Roboto, system-ui, sans-serif' }}
      >
        {labels.map((l) => {
          const selected = set.has(l.id);
          const inputId = `${idPrefix}-pill-${l.id}`;
          return (
            <button
              key={l.id}
              id={inputId}
              type="button"
              aria-pressed={selected}
              disabled={disabled}
              onClick={() => toggle(l.id)}
              className={`min-h-[28px] max-w-full truncate rounded-full border px-2 py-0.5 text-left text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                selected
                  ? 'border-[#f9ab00] bg-[#feefc3] text-[#3c4043] shadow-sm'
                  : 'border-[#dadce0] bg-white text-[#5f6368] hover:border-[#bdc1c6] hover:bg-[#f8f9fa]'
              }`}
            >
              {l.name}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <fieldset className="mb-0">
      <legend className="sr-only">Choose labels</legend>
      <ul className="flex max-h-32 flex-col gap-0 overflow-y-auto rounded-lg border border-[#e8eaed] bg-[#fafafa] p-1 sm:max-h-36">
        {labels.map((l) => {
          const checked = set.has(l.id);
          const inputId = `${idPrefix}-${l.id}`;
          return (
            <li key={l.id}>
              <label
                htmlFor={inputId}
                className="flex min-h-8 cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-xs text-[#3c4043] hover:bg-white"
                style={{ fontFamily: 'Roboto, system-ui, sans-serif' }}
              >
                <input
                  id={inputId}
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  className="h-3.5 w-3.5 shrink-0 rounded border-[#dadce0] text-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]/30 disabled:cursor-not-allowed disabled:opacity-50"
                  onChange={() => toggle(l.id)}
                />
                <span className="min-w-0 truncate">{l.name}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
