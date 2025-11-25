import { useState } from 'react';
import { LucideFilter, LucideX, LucideSearch } from 'lucide-react';
import { DebounceInput } from 'react-debounce-input';

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

const fileTypeOptions = [
    { value: 'image', label: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'] },
    { value: 'video', label: 'Videos', extensions: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'] },
    { value: 'audio', label: 'Audio', extensions: ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'] },
    { value: 'pdf', label: 'PDFs', extensions: ['pdf'] },
    { value: 'document', label: 'Documents', extensions: ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf'] },
    { value: 'code', label: 'Code', extensions: ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs'] },
    { value: 'archive', label: 'Archives', extensions: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'] },
    { value: 'markdown', label: 'Markdown', extensions: ['md', 'markdown'] },
];

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
            onFileTypeFilterChange(fileTypeFilter.filter(t => t !== type));
        } else {
            onFileTypeFilterChange([...fileTypeFilter, type]);
        }
    };

    const hasActiveFilters = searchQuery || fileTypeFilter.length > 0 || sortBy !== 'name' || sortOrder !== 'asc';

    return (
        <div className="bg-white border border-gray-200 rounded-sm mb-4">
            <div className="p-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <LucideFilter size={18} className="text-gray-600" />
                        <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
                        {hasActiveFilters && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                Active
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {hasActiveFilters && (
                            <button
                                onClick={onClearFilters}
                                className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded-sm hover:bg-red-50 transition"
                            >
                                Clear All
                            </button>
                        )}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            {showFilters ? 'Hide' : 'Show'}
                        </button>
                    </div>
                </div>
            </div>

            {showFilters && (
                <div className="p-4 space-y-4">
                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Search by filename
                        </label>
                        <div className="relative">
                            <LucideSearch size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <DebounceInput
                                debounceTimeout={300}
                                type="text"
                                placeholder="Search files..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="w-full pl-8 pr-8 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => onSearchChange('')}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <LucideX size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* File Type Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            File Types
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {fileTypeOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => toggleFileType(option.value)}
                                    className={`px-3 py-1 rounded-sm text-sm transition ${
                                        fileTypeFilter.includes(option.value)
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sort Options */}
                    <div className="flex items-center gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sort by
                            </label>
                            <select
                                value={sortBy}
                                onChange={(e) => onSortByChange(e.target.value as 'name' | 'size' | 'date')}
                                className="px-3 py-1 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value="name">Name</option>
                                <option value="size">Size</option>
                                <option value="date">Date Modified</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Order
                            </label>
                            <select
                                value={sortOrder}
                                onChange={(e) => onSortOrderChange(e.target.value as 'asc' | 'desc')}
                                className="px-3 py-1 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value="asc">Ascending</option>
                                <option value="desc">Descending</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriveFilters;

