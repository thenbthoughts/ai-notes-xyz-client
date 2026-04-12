import { LucideArchive, LucideBell, LucideEdit3, LucideStickyNote, LucideTag, LucideTrash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import type { MemoLabel } from './memoTypes';
import type { MemoNavSelection } from './memoTypes';
import { memoNavKey } from './memoTypes';

type MemoSidebarProps = {
  selection: MemoNavSelection;
  labels: MemoLabel[];
  /** Active (non-archived, non-trashed) memos per label id. */
  labelNoteCounts?: ReadonlyMap<string, number>;
  onSelect: (nav: MemoNavSelection) => void;
  onEditLabels: () => void;
  collapsed: boolean;
  onCloseMobile?: () => void;
};

export default function MemoSidebar({
  selection,
  labels,
  labelNoteCounts,
  onSelect,
  onEditLabels,
  collapsed,
  onCloseMobile,
}: MemoSidebarProps) {
  const activeKey = memoNavKey(selection);
  const activeCls = 'bg-[#feefc3] hover:bg-[#feefc3]';

  const itemBase = collapsed
    ? 'flex min-h-10 w-full items-center justify-center rounded-lg px-1.5 text-xs font-medium text-[#3c4043] transition hover:bg-[#f1f3f4] active:bg-[#e8eaed]'
    : 'flex min-h-10 w-full items-center gap-2.5 rounded-r-full py-1.5 pl-3 pr-2 text-xs font-medium text-[#3c4043] transition hover:bg-[#f1f3f4] active:bg-[#e8eaed] sm:gap-3 sm:pl-4 sm:pr-3';

  const Item = ({
    nav,
    icon: Icon,
    label,
    trailing,
    collapsedTitle,
  }: {
    nav: MemoNavSelection;
    icon: typeof LucideStickyNote;
    label: string;
    trailing?: ReactNode;
    /** Tooltip when sidebar is collapsed (e.g. include memo count). */
    collapsedTitle?: string;
  }) => {
    const isActive = memoNavKey(nav) === activeKey;
    return (
      <button
        type="button"
        className={`${itemBase} ${collapsed ? '' : 'text-left'} ${isActive ? activeCls : ''}`}
        title={collapsed ? (collapsedTitle ?? label) : undefined}
        onClick={() => {
          onSelect(nav);
          onCloseMobile?.();
        }}
        style={{ fontFamily: 'Roboto, system-ui, sans-serif' }}
      >
        <Icon className="h-4 w-4 shrink-0 text-[#5f6368]" strokeWidth={2} />
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1 truncate text-left">{label}</span>
            {trailing ? <span className="shrink-0">{trailing}</span> : null}
          </>
        )}
      </button>
    );
  };

  return (
    <aside className="relative flex h-full min-h-0 w-full flex-col bg-white">
      <nav className="flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto overscroll-y-contain px-1 py-1 sm:px-0">
        <Item nav={{ kind: 'notes' }} icon={LucideStickyNote} label="Notes" />
        <Item nav={{ kind: 'reminders' }} icon={LucideBell} label="Reminders" />
        {labels.map((l) => {
          const count = labelNoteCounts?.get(l.id) ?? 0;
          return (
            <Item
              key={l.id}
              nav={{ kind: 'label', labelId: l.id }}
              icon={LucideTag}
              label={l.name}
              collapsedTitle={count > 0 ? `${l.name} (${count})` : l.name}
              trailing={
                count > 0 ? (
                  <span className="rounded-full bg-[#e8eaed] px-1.5 py-0 text-[10px] font-medium tabular-nums text-[#5f6368]">
                    {count}
                  </span>
                ) : undefined
              }
            />
          );
        })}
        <button
          type="button"
          className={itemBase}
          title={collapsed ? 'Edit labels' : undefined}
          onClick={() => {
            onEditLabels();
            onCloseMobile?.();
          }}
          style={{ fontFamily: 'Roboto, system-ui, sans-serif' }}
        >
          <LucideEdit3 className="h-4 w-4 shrink-0 text-[#5f6368]" strokeWidth={2} />
          {!collapsed && <span className="min-w-0 truncate">Edit labels</span>}
        </button>
        <Item nav={{ kind: 'archive' }} icon={LucideArchive} label="Archive" />
        <Item nav={{ kind: 'bin' }} icon={LucideTrash2} label="Bin" />
      </nav>
    </aside>
  );
}
