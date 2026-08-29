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
  onViewModeChange: (mode: 'grid' | 'list') => void;
  sortBy?: 'updated' | 'created' | 'title';
  onSortChange?: (v: 'updated' | 'created' | 'title') => void;
  filterLabelIds?: string[];
  onFilterLabelIdsChange?: (ids: string[]) => void;
  labels?: { id: string; name: string }[];
  onRefresh: () => void;
};

const iconBtn =
  'flex h-8 min-h-[32px] w-8 min-w-[32px] shrink-0 items-center justify-center rounded-full text-[#a1a1aa] transition hover:bg-white/[0.06] active:bg-white/[0.1]';

const viewBtn =
  'flex h-8 min-h-[32px] w-8 min-w-[32px] items-center justify-center rounded-md transition';

export default function MemoToolbar({
  searchQuery,
  onSearchChange,
  onMenuClick,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  filterLabelIds,
  onFilterLabelIdsChange,
  labels,
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
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a1a1aa]"
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
            className="box-border h-9 w-full min-h-[36px] rounded-lg border-0 bg-[#18181b] pl-9 pr-2.5 text-sm text-[#e4e4e7] placeholder:text-[#a1a1aa] outline-none ring-1 ring-transparent transition focus:bg-[#27272a] focus:ring-[#52525b] sm:pr-3"
            style={{ fontFamily: 'Roboto, system-ui, sans-serif' }}
          />
        </div>
      </div>
      <div className="flex flex-wrap shrink-0 items-center justify-end gap-1 border-t border-[#3f3f46] pt-1.5 md:border-t-0 md:pt-0">
        {sortBy && onSortChange ? (
          <select aria-label="Sort memos" value={sortBy} onChange={(e) => onSortChange(e.target.value as 'updated' | 'created' | 'title')} className="h-8 rounded-md border border-[#3f3f46] bg-[#27272a] px-2 text-xs text-[#e4e4e7]">
            <option value="updated">Updated</option><option value="created">Created</option><option value="title">Title</option>
          </select>
        ) : null}

        {filterLabelIds && onFilterLabelIdsChange && labels && labels.length > 0 ? (
          <div className="flex flex-wrap gap-1">{labels.map((l) => {
            const active = filterLabelIds.includes(l.id);
            return <button key={l.id} type="button" aria-label={`Filter ${l.name}`} aria-pressed={active} onClick={() => { if (active) onFilterLabelIdsChange(filterLabelIds.filter((x) => x !== l.id)); else onFilterLabelIdsChange([...filterLabelIds, l.id]); }} className={`rounded-full px-2 py-0.5 text-xs ${active ? 'bg-[#e4e4e7] text-[#18181b]' : 'bg-[#27272a] text-[#a1a1aa] border border-[#3f3f46]'}`}>{l.name}</button>;
          })}</div>
        ) : null}
        <button type="button" className={iconBtn} aria-label="Refresh memos" onClick={onRefresh}>
          <LucideRefreshCw className="h-4 w-4" strokeWidth={2} />
        </button>
        <div
          role="group"
          aria-label="Layout"
          className="flex items-center rounded-lg border border-[#3f3f46] bg-[#18181b] p-0.5"
        >
          <button
            type="button"
            className={`${viewBtn} ${
              viewMode === 'grid' ? 'bg-[#3f3f46] text-[#e4e4e7]' : 'text-[#a1a1aa] hover:text-[#e4e4e7]'
            }`}
            aria-label="Grid view"
            aria-pressed={viewMode === 'grid'}
            title="Grid view"
            onClick={() => onViewModeChange('grid')}
          >
            <LucideLayoutGrid className="h-4 w-4" strokeWidth={2} />
          </button>
          <button
            type="button"
            className={`${viewBtn} ${
              viewMode === 'list' ? 'bg-[#3f3f46] text-[#e4e4e7]' : 'text-[#a1a1aa] hover:text-[#e4e4e7]'
            }`}
            aria-label="List view"
            aria-pressed={viewMode === 'list'}
            title="List view"
            onClick={() => onViewModeChange('list')}
          >
            <LucideList className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
