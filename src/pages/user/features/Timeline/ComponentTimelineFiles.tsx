import { useEffect, useState } from 'react';
import axios, { CancelTokenSource } from 'axios';
import ReactPaginate from 'react-paginate';
import {
    LucideGrid3X3,
    LucideList,
} from 'lucide-react';
import {
    TimelineFileItem,
    timelineFilesGetAxios,
} from './utils/timelineFilesAxios';
import {
    TimelineFileVisual,
    formatFileTime,
    getSourceLabel,
} from './utils/timelineFileDisplay';
import ComponentTimelineTabs from './ComponentTimelineTabs.tsx';
import ComponentTimelineFilePreview from './ComponentTimelineFilePreview.tsx';

const perPage = 24;

const FILE_TYPE_FILTERS = [
    { value: '', label: 'All' },
    { value: 'image', label: 'Images' },
    { value: 'video', label: 'Videos' },
    { value: 'audio', label: 'Audio' },
    { value: 'file', label: 'Files' },
] as const;

type ViewMode = 'grid' | 'list';

const ComponentTimelineFiles = () => {
    const [list, setList] = useState([] as TimelineFileItem[]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [fileType, setFileType] = useState('');
    const [previewIndex, setPreviewIndex] = useState<number | null>(null);

    const pageCount = Math.max(1, Math.ceil(totalCount / perPage));

    useEffect(() => {
        const axiosCancelTokenSource: CancelTokenSource = axios.CancelToken.source();
        fetchList({ axiosCancelTokenSource });
        return () => {
            axiosCancelTokenSource.cancel('Operation canceled by the user.');
        };
    }, [page, fileType]);

    const fetchList = async ({
        axiosCancelTokenSource,
    }: {
        axiosCancelTokenSource: CancelTokenSource;
    }) => {
        try {
            setLoading(true);
            const result = await timelineFilesGetAxios({
                page,
                perPage,
                fileType,
                axiosCancelTokenSource,
            });
            setList(result.docs);
            setTotalCount(result.count);
            setPreviewIndex(null);
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log('Request canceled:', error.message);
            } else {
                console.error(error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (next: string) => {
        setFileType(next);
        setPage(1);
    };

    const openPreview = (item: TimelineFileItem) => {
        const idx = list.findIndex((row) => row._id === item._id);
        if (idx >= 0) setPreviewIndex(idx);
    };

    const renderCount = () => {
        if (totalCount === 0) return null;
        const from = (page - 1) * perPage + 1;
        const to = Math.min(page * perPage, totalCount);
        return (
            <div className="mb-2 text-[10px] font-medium text-zinc-600">
                Showing {from}–{to} of {totalCount}
            </div>
        );
    };

    const renderPagination = () => {
        if (totalCount <= perPage) return null;
        return (
            <div className="mt-4 flex flex-col items-center gap-2 border-t border-zinc-100 pt-3">
                <p className="text-[10px] text-zinc-400">
                    Page {page} of {pageCount}
                </p>
                <ReactPaginate
                    breakLabel="..."
                    nextLabel="Next ›"
                    previousLabel="‹ Prev"
                    onPageChange={(event) => {
                        setPage(event.selected + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    pageRangeDisplayed={3}
                    marginPagesDisplayed={1}
                    pageCount={pageCount}
                    forcePage={page - 1}
                    className="flex flex-wrap items-center justify-center gap-1"
                    pageClassName="min-w-[28px] h-7 flex items-center justify-center"
                    pageLinkClassName="w-full h-full flex items-center justify-center px-2 text-xs rounded-md text-zinc-600 hover:bg-zinc-100 cursor-pointer"
                    activeClassName="bg-zinc-900 text-white rounded-md"
                    activeLinkClassName="hover:bg-transparent text-white cursor-pointer"
                    previousClassName="h-7 flex items-center justify-center"
                    previousLinkClassName="h-full flex items-center justify-center px-2.5 text-xs rounded-md text-zinc-600 hover:bg-zinc-100 cursor-pointer"
                    nextClassName="h-7 flex items-center justify-center"
                    nextLinkClassName="h-full flex items-center justify-center px-2.5 text-xs rounded-md text-zinc-600 hover:bg-zinc-100 cursor-pointer"
                    disabledClassName="opacity-40 cursor-not-allowed"
                    disabledLinkClassName="hover:bg-transparent cursor-not-allowed"
                    breakClassName="min-w-[28px] h-7 flex items-center justify-center text-xs text-zinc-400"
                />
            </div>
        );
    };

    return (
        <div className="p-2">
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-sm font-semibold text-zinc-900">Timeline</h1>
                <div className="flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 p-0.5">
                    <button
                        type="button"
                        onClick={() => setViewMode('grid')}
                        className={`inline-flex h-7 w-7 items-center justify-center rounded ${
                            viewMode === 'grid'
                                ? 'bg-white text-zinc-900 shadow-sm'
                                : 'text-zinc-400 hover:text-zinc-700'
                        }`}
                        title="Grid"
                    >
                        <LucideGrid3X3 size={14} />
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('list')}
                        className={`inline-flex h-7 w-7 items-center justify-center rounded ${
                            viewMode === 'list'
                                ? 'bg-white text-zinc-900 shadow-sm'
                                : 'text-zinc-400 hover:text-zinc-700'
                        }`}
                        title="List"
                    >
                        <LucideList size={14} />
                    </button>
                </div>
            </div>
            <ComponentTimelineTabs />

            {renderCount()}

            <div className="mb-3 flex flex-wrap gap-1">
                {FILE_TYPE_FILTERS.map((filter) => (
                    <button
                        key={filter.value || 'all'}
                        type="button"
                        onClick={() => handleFilterChange(filter.value)}
                        className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                            fileType === filter.value
                                ? 'bg-zinc-900 text-white'
                                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                        }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {loading && (
                <div className="py-8 text-center">
                    <div className="inline-block h-4 w-4 animate-spin rounded-full border-b-2 border-zinc-400" />
                </div>
            )}

            {!loading && list.length === 0 && (
                <div className="py-10 text-center">
                    <p className="text-xs text-zinc-400">No files found.</p>
                </div>
            )}

            {!loading && list.length > 0 && viewMode === 'grid' && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {list.map((item) => (
                        <button
                            key={item._id}
                            type="button"
                            onClick={() => openPreview(item)}
                            className="group overflow-hidden rounded-lg border border-zinc-200 bg-white text-left transition hover:border-zinc-300 hover:shadow-sm"
                        >
                            <div className="aspect-square overflow-hidden bg-zinc-50">
                                <TimelineFileVisual item={item} />
                            </div>
                            <div className="space-y-0.5 p-2">
                                <p className="truncate text-[11px] font-medium text-zinc-800">
                                    {item.fileTitle || 'Untitled'}
                                </p>
                                <p className="truncate text-[10px] uppercase tracking-wide text-zinc-400">
                                    {getSourceLabel(item.sourceType, item.parentEntityType)}
                                    {' · '}
                                    {item.fileType}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {!loading && list.length > 0 && viewMode === 'list' && (
                <div className="divide-y divide-zinc-100 overflow-hidden rounded-lg border border-zinc-200 bg-white">
                    {list.map((item) => (
                        <button
                            key={item._id}
                            type="button"
                            onClick={() => openPreview(item)}
                            className="flex w-full items-center gap-3 px-2.5 py-2 text-left transition hover:bg-zinc-50"
                        >
                            <div className="shrink-0 overflow-hidden rounded">
                                <TimelineFileVisual item={item} compact />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-medium text-zinc-900">
                                    {item.fileTitle || 'Untitled'}
                                </p>
                                <p className="truncate text-[10px] text-zinc-400">
                                    {getSourceLabel(item.sourceType, item.parentEntityType)}
                                    {' · '}
                                    <span className="capitalize">{item.fileType}</span>
                                    {formatFileTime(item.updatedAtUtc || item.createdAtUtc)
                                        ? ` · ${formatFileTime(item.updatedAtUtc || item.createdAtUtc)}`
                                        : ''}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {renderPagination()}

            <ComponentTimelineFilePreview
                items={list}
                index={previewIndex}
                onClose={() => setPreviewIndex(null)}
                onChangeIndex={setPreviewIndex}
                onDeleted={(deletedItemId) => {
                    const nextList = list.filter((row) => row._id !== deletedItemId);
                    setList(nextList);
                    setTotalCount((count) => Math.max(0, count - 1));
                    if (nextList.length === 0) {
                        setPreviewIndex(null);
                        return;
                    }
                    const current = previewIndex ?? 0;
                    const nextIndex = Math.min(current, nextList.length - 1);
                    setPreviewIndex(nextIndex);
                }}
            />
        </div>
    );
};

export default ComponentTimelineFiles;
