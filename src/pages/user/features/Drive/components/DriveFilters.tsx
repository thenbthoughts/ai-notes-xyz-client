import { useState } from 'react';
import { LucideFilter, LucideX, LucideSearch, LucideArrowUpDown } from 'lucide-react';
import { DebounceInput } from 'react-debounce-input';
import { FILE_TYPE_FILTER_OPTIONS } from '../utils/driveFileUtils';

interface DriveFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    fileTypeFilter: string[];
    onFileTypeFilterChange: (types: string[]) => void;
    sortBy: 'name' | 'size' | 'date';
    onSortByChange: (sort: 'name' | 'size' | 'date') => void;
    sortOrder: 'asc' | 'desc';
    onSortOrderChange: (order: 'asc' | 'desc') => void;
    onClearFilters: () => void;
}

const DriveFilters = ({
    searchQuery,
    onSearchChange,
    fileTypeFilter,
    onFileTypeFilterChange,
    sortBy,
    onSortByChange,
    sortOrder,
    onSortOrderChange,
    onClearFilters,
}: DriveFiltersProps) => {
    const [showFilters, setShowFilters] = useState(false);

    const toggleFileType = (type: string) => {
        if (fileTypeFilter.includes(type)) {
            onFileTypeFilterChange(fileTypeFilter.filter((t) => t !== type));
        } else {
            onFileTypeFilterChange([...fileTypeFilter, type]);
        }
    };

    const hasActiveFilters =
        searchQuery || fileTypeFilter.length > 0 || sortBy !== 'name' || sortOrder !== 'asc';

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[200px] flex-1">
                    <LucideSearch
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <DebounceInput
                        debounceTimeout={300}
                        type="text"
                        placeholder="Search in Drive"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full rounded-full border border-slate-200 bg-slate-100 py-2.5 pl-9 pr-9 text-sm text-slate-800 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => onSearchChange('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            aria-label="Clear search"
                        >
                            <LucideX size={16} />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1">
                    <LucideArrowUpDown size={14} className="text-slate-400" />
                    <select
                        value={sortBy}
                        onChange={(e) => onSortByChange(e.target.value as 'name' | 'size' | 'date')}
                        className="border-0 bg-transparent py-1 text-sm text-slate-700 outline-none"
                        aria-label="Sort by"
                    >
                        <option value="name">Name</option>
                        <option value="size">Size</option>
                        <option value="date">Modified</option>
                    </select>
                    <select
                        value={sortOrder}
                        onChange={(e) => onSortOrderChange(e.target.value as 'asc' | 'desc')}
                        className="border-0 bg-transparent py-1 text-sm text-slate-700 outline-none"
                        aria-label="Sort order"
                    >
                        <option value="asc">A → Z</option>
                        <option value="desc">Z → A</option>
                    </select>
                </div>

                <button
                    type="button"
                    onClick={() => setShowFilters((v) => !v)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm transition ${
                        showFilters || fileTypeFilter.length > 0
                            ? 'border-sky-300 bg-sky-50 text-sky-800'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                >
                    <LucideFilter size={16} />
                    Type
                    {fileTypeFilter.length > 0 && (
                        <span className="rounded-full bg-sky-600 px-1.5 text-[10px] font-semibold text-white">
                            {fileTypeFilter.length}
                        </span>
                    )}
                </button>

                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onClearFilters}
                        className="rounded-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                        Clear
                    </button>
                )}
            </div>

            {showFilters && (
                <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-3">
                    {FILE_TYPE_FILTER_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => toggleFileType(option.value)}
                            className={`rounded-full px-3 py-1 text-sm transition ${
                                fileTypeFilter.includes(option.value)
                                    ? 'bg-sky-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DriveFilters;
