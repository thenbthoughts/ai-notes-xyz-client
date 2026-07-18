import { useEffect, useMemo, useState } from 'react';
import { useAtom } from 'jotai';
import { LucideGrid3X3, LucideList, LucideHardDrive } from 'lucide-react';
import ReactPaginate from 'react-paginate';
import toast from 'react-hot-toast';
import { DriveFile } from '../../../../types/pages/Drive.types';
import {
    getFileTypeCategory,
    FILE_TYPE_FILTER_OPTIONS,
} from './utils/driveFileUtils';
import { driveGetFiles, driveDownloadFile } from './utils/driveAxios';
import {
    jotaiDriveCurrentBucket,
    jotaiDriveCurrentPath,
    jotaiDriveViewMode,
    jotaiDriveRefresh,
} from './stateJotai/driveStateJotai';
import DriveBucketSelector from './components/DriveBucketSelector';
import DriveBreadcrumbs from './components/DriveBreadcrumbs';
import DriveFilters from './components/DriveFilters';
import DriveFileGrid from './components/DriveFileGrid';
import DriveFileList from './components/DriveFileList';
import DriveReindexButton from './components/DriveReindexButton';
import DriveImageViewer from './viewers/DriveImageViewer';
import DriveVideoViewer from './viewers/DriveVideoViewer';
import DrivePdfViewer from './viewers/DrivePdfViewer';
import DriveTextEditor from './editors/DriveTextEditor';
import DriveMarkdownEditor from './editors/DriveMarkdownEditor';

const DriveWrapper = () => {
    const [currentBucket] = useAtom(jotaiDriveCurrentBucket);
    const [currentPath] = useAtom(jotaiDriveCurrentPath);
    const [viewMode, setViewMode] = useAtom(jotaiDriveViewMode);
    const [refresh, setRefresh] = useAtom(jotaiDriveRefresh);

    const [files, setFiles] = useState<DriveFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
    const [viewerType, setViewerType] = useState<
        'image' | 'video' | 'pdf' | 'text' | 'markdown' | null
    >(null);
    const [page, setPage] = useState(1);
    const [perPage] = useState(50);
    const [totalCount, setTotalCount] = useState(0);

    const [searchQuery, setSearchQuery] = useState('');
    const [fileTypeFilter, setFileTypeFilter] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<'name' | 'size' | 'date'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    useEffect(() => {
        if (!currentBucket) {
            setFiles([]);
            setTotalCount(0);
            setLoadError(null);
            return;
        }

        const fetchFiles = async () => {
            setLoading(true);
            setLoadError(null);
            try {
                const response = await driveGetFiles({
                    bucketName: currentBucket,
                    parentPath: currentPath,
                    page: 1,
                    perPage: 10000,
                });

                setFiles(Array.isArray(response?.files) ? response.files : []);
                setTotalCount(response?.pagination?.totalCount ?? 0);
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : 'Failed to load files';
                setLoadError(message);
                setFiles([]);
                setTotalCount(0);
                toast.error('Failed to load files');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchFiles();
    }, [currentBucket, currentPath, refresh]);

    useEffect(() => {
        setPage(1);
    }, [currentPath, searchQuery, fileTypeFilter, sortBy, sortOrder]);

    const handleFileClick = async (file: DriveFile) => {
        if (file.isFolder) {
            return;
        }

        const category = getFileTypeCategory(file);
        setSelectedFile(file);

        switch (category) {
            case 'image':
                setViewerType('image');
                break;
            case 'video':
                setViewerType('video');
                break;
            case 'pdf':
                setViewerType('pdf');
                break;
            case 'text':
                setViewerType('text');
                break;
            case 'markdown':
                setViewerType('markdown');
                break;
            default:
                setSelectedFile(null);
                setViewerType(null);
                try {
                    await driveDownloadFile(currentBucket, file.fileKey, file.fileName);
                } catch (error) {
                    toast.error(
                        error instanceof Error ? error.message : 'Failed to download file'
                    );
                    console.error(error);
                }
                break;
        }
    };

    const handleEditClick = (file: DriveFile) => {
        const category = getFileTypeCategory(file);
        setSelectedFile(file);

        if (category === 'markdown') {
            setViewerType('markdown');
        } else if (category === 'text') {
            setViewerType('text');
        }
    };

    const handleCloseViewer = () => {
        setSelectedFile(null);
        setViewerType(null);
    };

    const handleSave = () => {
        setRefresh((prev) => prev + 1);
    };

    const filteredAndSortedFiles = useMemo(() => {
        return files
            .filter((file) => {
                if (
                    searchQuery &&
                    !file.fileName.toLowerCase().includes(searchQuery.toLowerCase())
                ) {
                    return false;
                }

                if (!file.isFolder && fileTypeFilter.length > 0) {
                    const fileExt = (file.fileType || '').toLowerCase();
                    const matchesType = fileTypeFilter.some((filterType) => {
                        const option = FILE_TYPE_FILTER_OPTIONS.find(
                            (opt) => opt.value === filterType
                        );
                        return option
                            ? (option.extensions as readonly string[]).includes(fileExt)
                            : false;
                    });
                    if (!matchesType) return false;
                }

                return true;
            })
            .sort((a, b) => {
                if (a.isFolder !== b.isFolder) {
                    return a.isFolder ? -1 : 1;
                }

                let comparison = 0;
                switch (sortBy) {
                    case 'name':
                        comparison = a.fileName.localeCompare(b.fileName);
                        break;
                    case 'size':
                        comparison = (a.fileSize || 0) - (b.fileSize || 0);
                        break;
                    case 'date': {
                        const dateA = a.lastModified
                            ? new Date(a.lastModified).getTime()
                            : 0;
                        const dateB = b.lastModified
                            ? new Date(b.lastModified).getTime()
                            : 0;
                        comparison = dateA - dateB;
                        break;
                    }
                }

                return sortOrder === 'asc' ? comparison : -comparison;
            });
    }, [files, searchQuery, fileTypeFilter, sortBy, sortOrder]);

    const handleClearFilters = () => {
        setSearchQuery('');
        setFileTypeFilter([]);
        setSortBy('name');
        setSortOrder('asc');
    };

    const pageCount = Math.ceil(filteredAndSortedFiles.length / perPage) || 1;
    const startIndex = (page - 1) * perPage;
    const paginatedFiles = filteredAndSortedFiles.slice(startIndex, startIndex + perPage);

    return (
        <div className="min-h-[calc(100vh-60px)] bg-slate-50">
            <div className="mx-auto flex max-w-[1600px] flex-col px-3 py-4 sm:px-6">
                {/* Header */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
                            <LucideHardDrive size={22} />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                                Drive
                            </h1>
                            <p className="text-xs text-slate-500">Browse and manage your storage</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <DriveBucketSelector />
                        <DriveReindexButton />
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
                </div>

                {/* Toolbar */}
                <div className="mb-3 space-y-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
                    <DriveBreadcrumbs />
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

                {/* Status */}
                {!loading && !loadError && (
                    <div className="mb-2 px-1 text-sm text-slate-500">
                        {filteredAndSortedFiles.length > 0 ? (
                            <>
                                {filteredAndSortedFiles.length} item
                                {filteredAndSortedFiles.length === 1 ? '' : 's'}
                                {totalCount !== filteredAndSortedFiles.length && (
                                    <span className="text-slate-400">
                                        {' '}
                                        · {totalCount} in folder
                                    </span>
                                )}
                                {(searchQuery || fileTypeFilter.length > 0) && (
                                    <span className="text-sky-600"> · filtered</span>
                                )}
                            </>
                        ) : totalCount > 0 ? (
                            <span className="text-amber-700">No items match your filters</span>
                        ) : currentBucket ? (
                            <span>Folder is empty — use Sync to refresh from storage</span>
                        ) : (
                            <span>Select a bucket to get started</span>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="min-h-[320px]">
                    {loading ? (
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-36 animate-pulse rounded-xl bg-slate-200/80"
                                />
                            ))}
                        </div>
                    ) : loadError ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-6 py-16 text-center">
                            <p className="text-sm font-medium text-red-800">Could not load files</p>
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
                            files={paginatedFiles}
                            onFileClick={handleFileClick}
                            onEditClick={handleEditClick}
                        />
                    ) : (
                        <DriveFileList
                            files={paginatedFiles}
                            onFileClick={handleFileClick}
                            onEditClick={handleEditClick}
                        />
                    )}
                </div>

                {/* Pagination */}
                {!loading && !loadError && filteredAndSortedFiles.length > perPage && (
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
                            pageCount={pageCount}
                            previousLabel="Prev"
                            renderOnZeroPageCount={null}
                            forcePage={Math.min(page - 1, pageCount - 1)}
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
            </div>

            {selectedFile && viewerType === 'image' && (
                <DriveImageViewer
                    file={selectedFile}
                    bucketName={currentBucket}
                    onClose={handleCloseViewer}
                />
            )}
            {selectedFile && viewerType === 'video' && (
                <DriveVideoViewer
                    file={selectedFile}
                    bucketName={currentBucket}
                    onClose={handleCloseViewer}
                />
            )}
            {selectedFile && viewerType === 'pdf' && (
                <DrivePdfViewer
                    file={selectedFile}
                    bucketName={currentBucket}
                    onClose={handleCloseViewer}
                />
            )}
            {selectedFile && viewerType === 'text' && (
                <DriveTextEditor
                    file={selectedFile}
                    bucketName={currentBucket}
                    onClose={handleCloseViewer}
                    onSave={handleSave}
                />
            )}
            {selectedFile && viewerType === 'markdown' && (
                <DriveMarkdownEditor
                    file={selectedFile}
                    bucketName={currentBucket}
                    onClose={handleCloseViewer}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default DriveWrapper;
