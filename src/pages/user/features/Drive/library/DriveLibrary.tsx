import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import ReactPaginate from 'react-paginate';
import toast from 'react-hot-toast';
import { LucideFiles, LucideGrid3X3, LucideList } from 'lucide-react';
import { DriveFile } from '../../../../../types/pages/Drive.types';
import { driveGetLibrary } from './driveLibraryAxios';
import {
    jotaiDriveCurrentBucket,
    jotaiDriveRefresh,
    jotaiDriveViewMode,
} from '../stateJotai/driveStateJotai';
import DriveFilters from '../components/DriveFilters';
import DriveFileList from '../components/DriveFileList';
import DriveFileGrid from '../components/DriveFileGrid';
import DrivePreviewHost, {
    openDriveFile,
    openDriveFileEditor,
    ViewerType,
} from '../components/DrivePreviewHost';

const DriveLibrary = () => {
    const [currentBucket] = useAtom(jotaiDriveCurrentBucket);
    const [refresh, setRefresh] = useAtom(jotaiDriveRefresh);
    const [viewMode, setViewMode] = useAtom(jotaiDriveViewMode);

    const [files, setFiles] = useState<DriveFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
    const [viewerType, setViewerType] = useState<ViewerType>(null);

    const [page, setPage] = useState(1);
    const [perPage] = useState(50);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [searchQuery, setSearchQuery] = useState('');
    const [fileTypeFilter, setFileTypeFilter] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<'name' | 'size' | 'date'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    useEffect(() => {
        setPage(1);
    }, [currentBucket, searchQuery, fileTypeFilter, sortBy, sortOrder]);

    useEffect(() => {
        if (!currentBucket) {
            setFiles([]);
            setTotalCount(0);
            setTotalPages(1);
            setLoadError(null);
            return;
        }

        const fetchLibrary = async () => {
            setLoading(true);
            setLoadError(null);
            try {
                const response = await driveGetLibrary({
                    bucketName: currentBucket,
                    page,
                    perPage,
                    search: searchQuery,
                    fileTypes: fileTypeFilter,
                    sortBy,
                    sortOrder,
                });

                setFiles(Array.isArray(response?.files) ? response.files : []);
                setTotalCount(response?.pagination?.totalCount ?? 0);
                setTotalPages(response?.pagination?.totalPages ?? 1);
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : 'Failed to load library';
                setLoadError(message);
                setFiles([]);
                setTotalCount(0);
                setTotalPages(1);
                toast.error('Failed to load library');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchLibrary();
    }, [currentBucket, page, perPage, searchQuery, fileTypeFilter, sortBy, sortOrder, refresh]);

    const handleClearFilters = () => {
        setSearchQuery('');
        setFileTypeFilter([]);
        setSortBy('name');
        setSortOrder('asc');
    };

    const rangeStart = totalCount === 0 ? 0 : (page - 1) * perPage + 1;
    const rangeEnd = Math.min(page * perPage, totalCount);

    return (
        <>
            <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
                <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <button
                        type="button"
                        onClick={() => setViewMode('list')}
                        className={`p-2 transition ${
                            viewMode === 'list'
                                ? 'bg-sky-600 text-white'
                                : 'text-slate-600 hover:bg-slate-50'
                        }`}
                        title="List view"
                        aria-label="List view"
                    >
                        <LucideList size={18} />
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('grid')}
                        className={`p-2 transition ${
                            viewMode === 'grid'
                                ? 'bg-sky-600 text-white'
                                : 'text-slate-600 hover:bg-slate-50'
                        }`}
                        title="Grid view"
                        aria-label="Grid view"
                    >
                        <LucideGrid3X3 size={18} />
                    </button>
                </div>
            </div>

            <div className="mb-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
                <div className="mb-3 flex items-center gap-2 text-sm text-slate-600">
                    <LucideFiles size={18} className="text-sky-600" />
                    <span>All files across your storage</span>
                </div>
                <DriveFilters
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    fileTypeFilter={fileTypeFilter}
                    onFileTypeFilterChange={setFileTypeFilter}
                    sortBy={sortBy}
                    onSortByChange={setSortBy}
                    sortOrder={sortOrder}
                    onSortOrderChange={setSortOrder}
                    onClearFilters={handleClearFilters}
                />
            </div>

            {!loading && !loadError && (
                <div className="mb-2 px-1 text-sm text-slate-500">
                    {totalCount > 0 ? (
                        <>
                            Showing {rangeStart}–{rangeEnd} of {totalCount} file
                            {totalCount === 1 ? '' : 's'}
                            {(searchQuery || fileTypeFilter.length > 0) && (
                                <span className="text-sky-600"> · filtered</span>
                            )}
                        </>
                    ) : currentBucket ? (
                        <span>No files in library — use Sync to refresh from storage</span>
                    ) : (
                        <span>Select a bucket to get started</span>
                    )}
                </div>
            )}

            <div className="min-h-[320px]">
                {loading ? (
                    viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-36 animate-pulse rounded-xl bg-slate-200/80"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-12 animate-pulse rounded-lg bg-slate-200/80"
                                />
                            ))}
                        </div>
                    )
                ) : loadError ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-6 py-16 text-center">
                        <p className="text-sm font-medium text-red-800">Could not load library</p>
                        <p className="mt-1 max-w-md text-xs text-red-600">{loadError}</p>
                        <button
                            type="button"
                            onClick={() => setRefresh((p) => p + 1)}
                            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                        >
                            Retry
                        </button>
                    </div>
                ) : viewMode === 'grid' ? (
                    <DriveFileGrid
                        files={files}
                        showPath
                        emptyLabel="No files found"
                        emptyHint="Try adjusting filters or sync from storage"
                        onFileClick={(file) =>
                            openDriveFile(file, currentBucket, setSelectedFile, setViewerType)
                        }
                        onEditClick={(file) =>
                            openDriveFileEditor(file, setSelectedFile, setViewerType)
                        }
                    />
                ) : (
                    <DriveFileList
                        files={files}
                        showPath
                        onFileClick={(file) =>
                            openDriveFile(file, currentBucket, setSelectedFile, setViewerType)
                        }
                        onEditClick={(file) =>
                            openDriveFileEditor(file, setSelectedFile, setViewerType)
                        }
                    />
                )}
            </div>

            {!loading && !loadError && totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                    <ReactPaginate
                        breakLabel="..."
                        nextLabel="Next"
                        onPageChange={(e) => {
                            setPage(e.selected + 1);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        marginPagesDisplayed={1}
                        pageRangeDisplayed={3}
                        pageCount={totalPages}
                        previousLabel="Prev"
                        renderOnZeroPageCount={null}
                        forcePage={Math.min(page - 1, totalPages - 1)}
                        containerClassName="flex flex-wrap justify-center items-center gap-1"
                        pageClassName="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm"
                        previousClassName="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm"
                        previousLinkClassName="block px-3 py-1.5 text-slate-700"
                        nextClassName="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm"
                        nextLinkClassName="block px-3 py-1.5 text-slate-700"
                        breakClassName="rounded-lg border border-slate-200 bg-white text-sm"
                        breakLinkClassName="block px-3 py-1.5 text-slate-700"
                        activeLinkClassName="!bg-sky-600 !text-white !border-sky-600"
                        pageLinkClassName="block px-3 py-1.5 text-slate-700"
                    />
                </div>
            )}

            <DrivePreviewHost
                selectedFile={selectedFile}
                viewerType={viewerType}
                bucketName={currentBucket}
                onClose={() => {
                    setSelectedFile(null);
                    setViewerType(null);
                }}
                onSave={() => setRefresh((prev) => prev + 1)}
            />
        </>
    );
};

export default DriveLibrary;
