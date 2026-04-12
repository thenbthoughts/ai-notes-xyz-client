import {
  LucideLayoutGrid,
  LucideList,
  LucideMenu,
  LucideRefreshCw,
  LucideSearch,
} from 'lucide-react';
import { DebounceInput } from 'react-debounce-input';

type MemoToolbarProps = {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onMenuClick: () => void;
  viewMode: 'grid' | 'list';
  onToggleView: () => void;
  onRefresh: () => void;
};

const iconBtn =
  'flex h-8 min-h-[32px] w-8 min-w-[32px] shrink-0 items-center justify-center rounded-full text-[#5f6368] transition hover:bg-black/[0.06] active:bg-black/[0.1]';

export default function MemoToolbar({
  searchQuery,
  onSearchChange,
  onMenuClick,
  viewMode,
  onToggleView,
  onRefresh,
}: MemoToolbarProps) {
  return (
    <div className="mb-3 flex flex-col gap-2 sm:mb-4 md:flex-row md:items-center md:gap-2">
      <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
        <button type="button" className={`${iconBtn} md:hidden`} aria-label="Memo menu" onClick={onMenuClick}>
          <LucideMenu className="h-4 w-4" strokeWidth={2} />
        </button>
        <div className="relative min-h-9 min-w-0 flex-1">
          <LucideSearch
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5f6368]"
            strokeWidth={2}
          />
          <DebounceInput
            element="input"
            debounceTimeout={300}
            type="search"
            inputMode="search"
            enterKeyHint="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search memos"
            className="box-border h-9 w-full min-h-[36px] rounded-lg border-0 bg-[#f1f3f4] pl-9 pr-2.5 text-sm text-[#3c4043] placeholder:text-[#5f6368] outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-[#dadce0] sm:pr-3"
            style={{ fontFamily: 'Roboto, system-ui, sans-serif' }}
          />
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-end gap-0.5 border-t border-[#e8eaed] pt-1.5 md:border-t-0 md:pt-0">
        <button type="button" className={iconBtn} aria-label="Refresh memos" onClick={onRefresh}>
          <LucideRefreshCw className="h-4 w-4" strokeWidth={2} />
        </button>
        <button type="button" className={iconBtn} aria-label="Toggle layout" onClick={onToggleView}>
          {viewMode === 'grid' ? (
            <LucideList className="h-4 w-4" strokeWidth={2} />
          ) : (
            <LucideLayoutGrid className="h-4 w-4" strokeWidth={2} />
          )}
        </button>
      </div>
    </div>
  );
}
