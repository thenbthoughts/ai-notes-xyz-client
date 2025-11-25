import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { LucideGrid, LucideList } from 'lucide-react';
import ReactPaginate from 'react-paginate';
import toast from 'react-hot-toast';
import { DriveFile } from '../../../../types/pages/Drive.types';
import { getFileTypeCategory } from './utils/driveFileUtils';
import { driveGetFiles, driveGetFileUrl } from './utils/driveAxios';
import { jotaiDriveCurrentBucket, jotaiDriveCurrentPath, jotaiDriveViewMode, jotaiDriveRefresh } from './stateJotai/driveStateJotai';
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
    const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
    const [viewerType, setViewerType] = useState<'image' | 'video' | 'pdf' | 'text' | 'markdown' | null>(null);
    const [page, setPage] = useState(1);
    const [perPage] = useState(50);
    const [totalCount, setTotalCount] = useState(0);
    
    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [fileTypeFilter, setFileTypeFilter] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<'name' | 'size' | 'date'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    useEffect(() => {
        if (!currentBucket) {
            setFiles([]);
            setTotalCount(0);
            return;
        }

        const fetchFiles = async () => {
            setLoading(true);
            try {
                // Fetch all files (or a large number) for client-side filtering
                const response = await driveGetFiles({
                    bucketName: currentBucket,
                    parentPath: currentPath,
                    page: 1,
                    perPage: 10000, // Fetch a large number for client-side filtering
                });
                
                // Debug logging
                console.log('Drive files response:', {
                    parentPath: currentPath,
                    totalFiles: response.files.length,
                    folders: response.files.filter(f => f.isFolder).length,
                    files: response.files.filter(f => !f.isFolder).length,
                    allFiles: response.files,
                });
                
                setFiles(response.files);
                setTotalCount(response.pagination.totalCount);
            } catch (error) {
                toast.error('Failed to load files');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchFiles();
    }, [currentBucket, currentPath, refresh]);

    // Reset to page 1 when path or filters change
    useEffect(() => {
        setPage(1);
    }, [currentPath, searchQuery, fileTypeFilter, sortBy, sortOrder]);

    const handleFileClick = (file: DriveFile) => {
        if (file.isFolder) {
            return; // Handled by DriveFileItem
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
                // For other file types, try to download
                const url = driveGetFileUrl(currentBucket, file.fileKey);
                window.open(url, '_blank');
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

    // Filter and sort files
    const filteredAndSortedFiles = files
        .filter(file => {
            // Search filter
            if (searchQuery && !file.fileName.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            // File type filter
            if (!file.isFolder && fileTypeFilter.length > 0) {
                const fileTypeOptions = [
                    { value: 'image', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'] },
                    { value: 'video', extensions: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'] },
                    { value: 'audio', extensions: ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'] },
                    { value: 'pdf', extensions: ['pdf'] },
                    { value: 'document', extensions: ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf'] },
                    { value: 'code', extensions: ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs'] },
                    { value: 'archive', extensions: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'] },
                    { value: 'markdown', extensions: ['md', 'markdown'] },
                ];

                const fileExt = file.fileType.toLowerCase();
                const matchesType = fileTypeFilter.some(filterType => {
                    const option = fileTypeOptions.find(opt => opt.value === filterType);
                    return option?.extensions.includes(fileExt) || false;
                });

                if (!matchesType) return false;
            }

            return true;
        })
        .sort((a, b) => {
            // Always put folders first, then files
            if (a.isFolder !== b.isFolder) {
                return a.isFolder ? -1 : 1; // Folders come first (return -1 means a comes before b)
            }

            // Within folders or files, sort by the selected criteria
            let comparison = 0;
            switch (sortBy) {
                case 'name':
                    comparison = a.fileName.localeCompare(b.fileName);
                    break;
                case 'size':
                    comparison = a.fileSize - b.fileSize;
                    break;
                case 'date':
                    const dateA = a.lastModified ? new Date(a.lastModified).getTime() : 0;
                    const dateB = b.lastModified ? new Date(b.lastModified).getTime() : 0;
                    comparison = dateA - dateB;
                    break;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

    const handleClearFilters = () => {
        setSearchQuery('');
        setFileTypeFilter([]);
        setSortBy('name');
        setSortOrder('asc');
    };

    return (
        <div className="flex min-h-[calc(100vh-60px)]">
            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="container mx-auto px-4 py-4 flex flex-col">
                    <div className="mb-4 flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <DriveBucketSelector />
                            <DriveReindexButton />
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-sm transition ${
                                    viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                            >
                                <LucideGrid size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-sm transition ${
                                    viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                            >
                                <LucideList size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-shrink-0">
                        <DriveBreadcrumbs />

                        {/* Filters */}
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

                    {/* File count */}
                    <div className="flex-shrink-0">
                    {!loading && (
                        <div className="mb-2 text-sm text-gray-600">
                            {filteredAndSortedFiles.length > 0 ? (
                                <>
                                    Showing {Math.min((page - 1) * perPage + 1, filteredAndSortedFiles.length)}-{Math.min(page * perPage, filteredAndSortedFiles.length)} of {filteredAndSortedFiles.length} items
                                    {totalCount !== filteredAndSortedFiles.length && (
                                        <span className="ml-2 text-gray-500">(from {totalCount} total)</span>
                                    )}
                                    {(searchQuery || fileTypeFilter.length > 0) && (
                                        <span className="ml-2 text-blue-600">(filtered)</span>
                                    )}
                                </>
                            ) : totalCount > 0 ? (
                                <span className="text-orange-600">No files match your filters</span>
                            ) : (
                                <span>No files found</span>
                            )}
                        </div>
                    )}
                    </div>

                    {/* Files List/Grid */}
                    <div>
                        {loading ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">Loading files...</p>
                            </div>
                        ) : (
                            <>
                                {(() => {
                                    const startIndex = (page - 1) * perPage;
                                    const endIndex = startIndex + perPage;
                                    const paginatedFiles = filteredAndSortedFiles.slice(startIndex, endIndex);
                                    
                                    return viewMode === 'grid' ? (
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
                                    );
                                })()}
                            </>
                        )}
                    </div>

                    {/* Pagination */}
                    <div className="flex-shrink-0 mt-4">
                    {!loading && filteredAndSortedFiles.length > perPage && (
                        <div className="flex justify-center">
                            <ReactPaginate
                                breakLabel="..."
                                nextLabel="next >"
                                onPageChange={(e) => {
                                    setPage(e.selected + 1);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                marginPagesDisplayed={1}
                                pageRangeDisplayed={3}
                                pageCount={Math.ceil(filteredAndSortedFiles.length / perPage)}
                                previousLabel="< previous"
                                renderOnZeroPageCount={null}
                                forcePage={page - 1}
                                containerClassName="flex flex-wrap justify-center items-center gap-1 sm:space-x-1"
                                pageClassName="border border-gray-300 rounded-sm hover:bg-gray-200 text-base sm:text-lg m-0.5"
                                previousClassName="border border-gray-300 rounded-sm hover:bg-gray-200 text-base sm:text-lg m-0.5"
                                previousLinkClassName="text-gray-700 px-2 sm:px-3"
                                nextClassName="border border-gray-300 rounded-sm hover:bg-gray-200 text-base sm:text-lg m-0.5"
                                nextLinkClassName="text-gray-700 px-2 sm:px-3"
                                breakClassName="border border-gray-300 rounded-sm text-base sm:text-lg m-0.5"
                                breakLinkClassName="text-gray-700 px-2 sm:px-3"
                                activeLinkClassName="bg-blue-500 text-white"
                                pageLinkClassName="text-gray-700 px-2 sm:px-3"
                            />
                        </div>
                    )}
                    </div>
                </div>
            </div>

            {/* Viewers and Editors */}
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

