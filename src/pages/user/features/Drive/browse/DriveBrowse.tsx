import { useEffect, useMemo, useState } from 'react';
import { useAtom } from 'jotai';
import { Helmet } from 'react-helmet-async';
import { LucideGrid3X3, LucideList, LucideFolderPlus, LucideTrash2, LucideSearch, LucideUpload, LucideX, LucideHistory, LucideLink } from 'lucide-react';
import ReactPaginate from 'react-paginate';
import toast from 'react-hot-toast';
import { DriveFile } from '../../../../../types/pages/Drive.types';
import { FILE_TYPE_FILTER_OPTIONS } from '../utils/driveFileUtils';
import { driveGetFiles } from './driveBrowseAxios';
import { driveContentSearch, driveGetTrash, driveGetVersions, driveMove, driveTrashEmpty, driveUploadFile } from '../utils/driveAxios';
import { jotaiDriveCurrentBucket, jotaiDriveCurrentPath, jotaiDriveViewMode, jotaiDriveRefresh, jotaiDriveGridSize } from '../stateJotai/driveStateJotai';
import DriveBreadcrumbs from '../components/DriveBreadcrumbs';
import DriveFilters from '../components/DriveFilters';
import DriveFileGrid from '../components/DriveFileGrid';
import DriveFileList from '../components/DriveFileList';
import DrivePreviewHost, { openDriveFile, openDriveFileEditor, ViewerType } from '../components/DrivePreviewHost';
import DriveFolderModal from '../components/DriveFolderModal';
import DriveRenameModal from '../components/DriveRenameModal';
import DriveMoveModal from '../components/DriveMoveModal';
import DriveShareModal from '../components/DriveShareModal';
import DriveQuotaBar from '../components/DriveQuotaBar';

const DriveBrowse = () => {
    const [currentBucket] = useAtom(jotaiDriveCurrentBucket);
    const [currentPath] = useAtom(jotaiDriveCurrentPath);
    const [viewMode, setViewMode] = useAtom(jotaiDriveViewMode);
    const [refresh, setRefresh] = useAtom(jotaiDriveRefresh);
    const [gridSize] = useAtom(jotaiDriveGridSize);
    const [files, setFiles] = useState<DriveFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
    const [viewerType, setViewerType] = useState<ViewerType>(null);
    const [page, setPage] = useState(1);
    const [perPage] = useState(50);
    const [totalCount, setTotalCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [fileTypeFilter, setFileTypeFilter] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<'name' | 'size' | 'date'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [contentSearch, setContentSearch] = useState(false);
    const [contentResults, setContentResults] = useState<DriveFile[] | null>(null);
    const [showTrash, setShowTrash] = useState(false);
    const [trashFiles, setTrashFiles] = useState<DriveFile[]>([]);
    const [trashLoading, setTrashLoading] = useState(false);
    const [folderOpen, setFolderOpen] = useState(false);
    const [renameFile, setRenameFile] = useState<DriveFile | null>(null);
    const [moveKeys, setMoveKeys] = useState<string[]>([]);
    const [moveMode, setMoveMode] = useState<'move' | 'copy'>('move');
    const [moveOpen, setMoveOpen] = useState(false);
    const [shareFile, setShareFile] = useState<DriveFile | null>(null);
    const [versionFile, setVersionFile] = useState<DriveFile | null>(null);
    const [versions, setVersions] = useState<Array<{ content: string; savedAt: string; size: number }>>([]);
    const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
    const [draggingKey, setDraggingKey] = useState<string | null>(null);
    const [dropUploading, setDropUploading] = useState(false);
    const [isDragOverRoot, setIsDragOverRoot] = useState(false);

    useEffect(() => {
        if (!currentBucket) {
            setFiles([]);
            setTotalCount(0);
            setLoadError(null);
            return;
        }
        if (showTrash) return;
        const fetchFiles = async () => {
            setLoading(true);
            setLoadError(null);
            try {
                if (contentSearch && searchQuery.trim()) {
                    const res = await driveContentSearch({ bucketName: currentBucket, query: searchQuery.trim(), page: 1, perPage: 10000 });
                    const list = Array.isArray(res.files) ? res.files : [];
                    const filtered = list.filter((f) => {
                        const parent = (f.parentPath || '').trim();
                        if (parent !== (currentPath || '')) return false;
                        return true;
                    });
                    setFiles(contentSearch ? filtered : list);
                    setContentResults(list);
                    setTotalCount(res.pagination?.totalCount ?? list.length);
                } else {
                    setContentResults(null);
                    const response = await driveGetFiles({ bucketName: currentBucket, parentPath: currentPath, page: 1, perPage: 10000 });
                    setFiles(Array.isArray(response?.files) ? response.files : []);
                    setTotalCount(response?.pagination?.totalCount ?? 0);
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to load files';
                setLoadError(message);
                setFiles([]);
                setTotalCount(0);
                toast.error('Failed to load files');
            } finally {
                setLoading(false);
            }
        };
        fetchFiles();
    }, [currentBucket, currentPath, refresh, showTrash, contentSearch, searchQuery]);

    useEffect(() => {
        setPage(1);
    }, [currentPath, searchQuery, fileTypeFilter, sortBy, sortOrder, showTrash]);

    const fetchTrash = async () => {
        if (!currentBucket) return;
        setTrashLoading(true);
        try {
            const res = await driveGetTrash(currentBucket);
            setTrashFiles(Array.isArray(res.files) ? res.files : []);
        } catch {
            toast.error('Failed to load trash');
        } finally {
            setTrashLoading(false);
        }
    };

    useEffect(() => {
        if (showTrash) fetchTrash();
    }, [showTrash, currentBucket, refresh]);

    const filteredAndSortedFiles = useMemo(() => {
        if (showTrash) return trashFiles;
        if (contentSearch && searchQuery.trim() && contentResults) {
            let list = files;
            if (fileTypeFilter.length > 0) {
                list = list.filter((file) => {
                    if (file.isFolder) return true;
                    const fileExt = (file.fileType || '').toLowerCase();
                    return fileTypeFilter.some((filterType) => {
                        const option = FILE_TYPE_FILTER_OPTIONS.find((opt) => opt.value === filterType);
                        return option ? (option.extensions as readonly string[]).includes(fileExt) : false;
                    });
                });
            }
            return list.sort((a, b) => {
                if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
                let comparison = 0;
                if (sortBy === 'name') comparison = a.fileName.localeCompare(b.fileName);
                if (sortBy === 'size') comparison = (a.fileSize || 0) - (b.fileSize || 0);
                if (sortBy === 'date') {
                    const da = a.lastModified ? new Date(a.lastModified).getTime() : 0;
                    const db = b.lastModified ? new Date(b.lastModified).getTime() : 0;
                    comparison = da - db;
                }
                return sortOrder === 'asc' ? comparison : -comparison;
            });
        }
        return files
            .filter((file) => {
                if (searchQuery && !file.fileName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                if (!file.isFolder && fileTypeFilter.length > 0) {
                    const fileExt = (file.fileType || '').toLowerCase();
                    const matchesType = fileTypeFilter.some((filterType) => {
                        const option = FILE_TYPE_FILTER_OPTIONS.find((opt) => opt.value === filterType);
                        return option ? (option.extensions as readonly string[]).includes(fileExt) : false;
                    });
                    if (!matchesType) return false;
                }
                return true;
            })
            .sort((a, b) => {
                if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
                let comparison = 0;
                if (sortBy === 'name') comparison = a.fileName.localeCompare(b.fileName);
                if (sortBy === 'size') comparison = (a.fileSize || 0) - (b.fileSize || 0);
                if (sortBy === 'date') {
                    const da = a.lastModified ? new Date(a.lastModified).getTime() : 0;
                    const db = b.lastModified ? new Date(b.lastModified).getTime() : 0;
                    comparison = da - db;
                }
                return sortOrder === 'asc' ? comparison : -comparison;
            });
    }, [files, searchQuery, fileTypeFilter, sortBy, sortOrder, showTrash, trashFiles, contentSearch, contentResults]);

    const handleClearFilters = () => {
        setSearchQuery('');
        setFileTypeFilter([]);
        setSortBy('name');
        setSortOrder('asc');
        setContentSearch(false);
    };

    const handleDropMove = async (targetFolderKey: string | null) => {
        if (!draggingKey) return;
        let targetPath = currentPath;
        if (targetFolderKey) {
            const folder = files.find((f) => f.fileKey === targetFolderKey);
            if (folder) targetPath = folder.filePath;
        }
        try {
            await driveMove({ bucketName: currentBucket, fileKeys: [draggingKey], targetPath });
            toast.success('Moved');
            setRefresh((p) => p + 1);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Move failed');
        } finally {
            setDraggingKey(null);
            setDragOverFolder(null);
        }
    };

    const handleRootDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOverRoot(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFiles = Array.from(e.dataTransfer.files);
            setDropUploading(true);
            try {
                for (const f of droppedFiles) {
                    await driveUploadFile({ bucketName: currentBucket, folderPath: currentPath, file: f });
                }
                toast.success(`Uploaded ${droppedFiles.length} file(s)`);
                setRefresh((p) => p + 1);
            } catch {
                toast.error('Upload failed');
            } finally {
                setDropUploading(false);
            }
            return;
        }
        if (draggingKey) handleDropMove(null);
    };

    const openVersions = async (file: DriveFile) => {
        setVersionFile(file);
        try {
            const res = await driveGetVersions({ bucketName: currentBucket, fileKey: file.fileKey });
            setVersions(res.versions || []);
        } catch {
            setVersions([]);
        }
    };

    const handleEmptyTrash = async () => {
        if (!confirm('Permanently delete all trash?')) return;
        try {
            await driveTrashEmpty(currentBucket);
            toast.success('Trash emptied');
            setRefresh((p) => p + 1);
        } catch {
            toast.error('Failed to empty trash');
        }
    };

    const pageCount = Math.ceil(filteredAndSortedFiles.length / perPage) || 1;
    const startIndex = (page - 1) * perPage;
    const paginatedFiles = filteredAndSortedFiles.slice(startIndex, startIndex + perPage);

    const dragHandlers = (file: DriveFile) => {
        return {
            onDragStart: (e: React.DragEvent) => {
                setDraggingKey(file.fileKey);
                e.dataTransfer.setData('text/plain', file.fileKey);
                e.dataTransfer.effectAllowed = 'move';
            },
            onDragOver: file.isFolder ? (e: React.DragEvent) => {
                e.preventDefault();
                setDragOverFolder(file.fileKey);
            } : undefined,
            onDrop: file.isFolder ? (e: React.DragEvent) => {
                e.preventDefault();
                e.stopPropagation();
                const key = e.dataTransfer.getData('text/plain') || draggingKey;
                if (key) {
                    driveMove({ bucketName: currentBucket, fileKeys: [key], targetPath: file.filePath }).then(() => {
                        toast.success('Moved');
                        setRefresh((p) => p + 1);
                    }).catch(() => toast.error('Move failed'));
                }
                setDragOverFolder(null);
                setDraggingKey(null);
            } : undefined,
            isDropTarget: dragOverFolder === file.fileKey,
        };
    };

    return (
        <>
            <Helmet><title>Drive - Browse</title></Helmet>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setFolderOpen(true)} disabled={!currentBucket || showTrash} className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-50" aria-label="New folder">
                        <LucideFolderPlus size={16} /> New folder
                    </button>
                    <button type="button" onClick={() => setShowTrash((v) => !v)} className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm ${showTrash ? 'border-sky-600 bg-sky-950 text-sky-300' : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800'}`} aria-label="Toggle trash">
                        <LucideTrash2 size={16} /> {showTrash ? 'Browsing' : 'Trash'}
                    </button>
                    <label className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400">
                        <input type="checkbox" checked={contentSearch} onChange={(e) => setContentSearch(e.target.checked)} className="h-3.5 w-3.5 rounded border-zinc-600 bg-zinc-900 text-sky-600" aria-label="Search within file content" />
                        <LucideSearch size={12} /> Content
                    </label>
                </div>
                <div className="flex items-center gap-2">
                    <DriveQuotaBar />
                    <div className="hidden items-center gap-1 sm:flex">
                        <span className="text-xs text-zinc-500">Grid size</span>
                        <input type="range" min={0} max={2} step={1} defaultValue={String(gridSize)} onChange={(e) => {
                            try { localStorage.setItem('drive:gridSize', e.target.value); } catch { /* ignore */ }
                        }} className="w-16" aria-label="Grid size" />
                    </div>
                    <div className="flex overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900">
                        <button type="button" onClick={() => setViewMode('list')} className={`p-2 transition ${viewMode === 'list' ? 'bg-sky-600 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`} title="List view" aria-label="List view">
                            <LucideList size={18} />
                        </button>
                        <button type="button" onClick={() => setViewMode('grid')} className={`p-2 transition ${viewMode === 'grid' ? 'bg-sky-600 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`} title="Grid view" aria-label="Grid view">
                            <LucideGrid3X3 size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {showTrash ? (
                <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 p-3">
                    <span className="text-sm font-medium text-zinc-200">Trash</span>
                    <span className="text-xs text-zinc-500">{trashFiles.length} item{trashFiles.length === 1 ? '' : 's'}</span>
                    <div className="ml-auto flex gap-2">
                        <button type="button" onClick={handleEmptyTrash} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700" aria-label="Empty trash">Empty trash</button>
                    </div>
                </div>
            ) : (
                <div className="mb-3 space-y-3 rounded-2xl border border-zinc-700 bg-zinc-900 p-3 shadow-sm sm:p-4" onDragOver={(e) => { e.preventDefault(); setIsDragOverRoot(true); }} onDragLeave={() => setIsDragOverRoot(false)} onDrop={handleRootDrop}>
                    <DriveBreadcrumbs />
                    <DriveFilters searchQuery={searchQuery} onSearchChange={setSearchQuery} fileTypeFilter={fileTypeFilter} onFileTypeFilterChange={setFileTypeFilter} sortBy={sortBy} onSortByChange={setSortBy} sortOrder={sortOrder} onSortOrderChange={setSortOrder} onClearFilters={handleClearFilters} />
                    {isDragOverRoot && <div className="rounded-lg border-2 border-dashed border-sky-600 bg-sky-950/30 p-3 text-center text-xs text-sky-300">Drop files to upload here or drag items to folders to move</div>}
                    {dropUploading && <div className="flex items-center gap-2 text-xs text-zinc-400"><LucideUpload size={14} className="animate-pulse" /> Uploading…</div>}
                </div>
            )}

            {!loading && !loadError && !trashLoading && (
                <div className="mb-2 flex items-center gap-2 px-1 text-sm text-zinc-400">
                    <span>{filteredAndSortedFiles.length} item{filteredAndSortedFiles.length === 1 ? '' : 's'}</span>
                    {totalCount !== filteredAndSortedFiles.length && <span className="text-zinc-500"> · {totalCount} in folder</span>}
                    {(searchQuery || fileTypeFilter.length > 0) && <span className="text-sky-600"> · filtered</span>}
                    {contentSearch && searchQuery && <span className="text-emerald-600"> · content search</span>}
                </div>
            )}

            <div className="min-h-[320px]" onDragOver={(e) => { if (!showTrash) e.preventDefault(); }} onDrop={handleRootDrop}>
                {loading || trashLoading ? (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                        {Array.from({ length: 12 }).map((_, i) => (<div key={i} className="h-36 animate-pulse rounded-xl bg-zinc-800/80" />))}
                    </div>
                ) : loadError ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-900 px-6 py-16 text-center">
                        <p className="text-sm font-medium text-red-400">Could not load files</p>
                        <p className="mt-1 max-w-md text-xs text-zinc-500">{loadError}</p>
                        <button type="button" onClick={() => setRefresh((p) => p + 1)} className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700" aria-label="Retry">Retry</button>
                    </div>
                ) : viewMode === 'grid' ? (
                    <DriveFileGrid files={paginatedFiles} onFileClick={(file) => openDriveFile(file, currentBucket, setSelectedFile, setViewerType)} onEditClick={(file) => openDriveFileEditor(file, setSelectedFile, setViewerType)} onRename={(f) => setRenameFile(f)} onMove={(f) => { setMoveKeys([f.fileKey]); setMoveMode('move'); setMoveOpen(true); }} onCopy={(f) => { setMoveKeys([f.fileKey]); setMoveMode('copy'); setMoveOpen(true); }} onShare={(f) => setShareFile(f)} onVersions={openVersions} dragHandlers={dragHandlers} />
                ) : (
                    <DriveFileList files={paginatedFiles} onFileClick={(file) => openDriveFile(file, currentBucket, setSelectedFile, setViewerType)} onEditClick={(file) => openDriveFileEditor(file, setSelectedFile, setViewerType)} onRename={(f) => setRenameFile(f)} onMove={(f) => { setMoveKeys([f.fileKey]); setMoveMode('move'); setMoveOpen(true); }} onCopy={(f) => { setMoveKeys([f.fileKey]); setMoveMode('copy'); setMoveOpen(true); }} onShare={(f) => setShareFile(f)} onVersions={openVersions} dragHandlers={dragHandlers} />
                )}
            </div>

            {!loading && !loadError && !showTrash && filteredAndSortedFiles.length > perPage && (
                <div className="mt-4 flex justify-center">
                    <ReactPaginate breakLabel="..." nextLabel="Next" onPageChange={(e) => { setPage(e.selected + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} marginPagesDisplayed={1} pageRangeDisplayed={3} pageCount={pageCount} previousLabel="Prev" renderOnZeroPageCount={null} forcePage={Math.min(page - 1, pageCount - 1)} containerClassName="flex flex-wrap justify-center items-center gap-1" pageClassName="rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-sm" previousClassName="rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-sm" previousLinkClassName="block px-3 py-1.5 text-zinc-300" nextClassName="rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-sm" nextLinkClassName="block px-3 py-1.5 text-zinc-300" breakClassName="rounded-lg border border-zinc-700 bg-zinc-900 text-sm" breakLinkClassName="block px-3 py-1.5 text-zinc-300" activeLinkClassName="!bg-sky-600 !text-white !border-sky-600" pageLinkClassName="block px-3 py-1.5 text-zinc-300" />
                </div>
            )}

            <DrivePreviewHost selectedFile={selectedFile} viewerType={viewerType} bucketName={currentBucket} onClose={() => { setSelectedFile(null); setViewerType(null); }} onSave={() => setRefresh((prev) => prev + 1)} />

            <DriveFolderModal isOpen={folderOpen} onClose={() => setFolderOpen(false)} bucketName={currentBucket} parentPath={currentPath} onSuccess={() => setRefresh((p) => p + 1)} />
            <DriveRenameModal isOpen={!!renameFile} onClose={() => setRenameFile(null)} bucketName={currentBucket} file={renameFile} onSuccess={() => setRefresh((p) => p + 1)} />
            <DriveMoveModal isOpen={moveOpen} onClose={() => setMoveOpen(false)} bucketName={currentBucket} fileKeys={moveKeys} mode={moveMode} currentPath={currentPath} onSuccess={() => { setRefresh((p) => p + 1); }} />
            <DriveShareModal isOpen={!!shareFile} onClose={() => setShareFile(null)} bucketName={currentBucket} file={shareFile} />

            {versionFile && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 p-4" onClick={() => setVersionFile(null)}>
                    <div className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-2xl border border-zinc-700 bg-zinc-900 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
                            <div className="flex items-center gap-2">
                                <LucideHistory size={18} className="text-sky-600" />
                                <h2 className="text-sm font-semibold text-zinc-100">Versions - {versionFile.fileName}</h2>
                            </div>
                            <button type="button" onClick={() => setVersionFile(null)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800" aria-label="Close"><LucideX size={18} /></button>
                        </div>
                        <div className="flex-1 overflow-auto p-4">
                            {versions.length === 0 ? (
                                <p className="text-sm text-zinc-500">No versions yet. Edit the file to create history.</p>
                            ) : (
                                <div className="space-y-3">
                                    {versions.map((v, idx) => (
                                        <div key={idx} className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                                            <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
                                                <span>{new Date(v.savedAt).toLocaleString()}</span>
                                                <span>{v.size} bytes</span>
                                            </div>
                                            <pre className="max-h-32 overflow-auto whitespace-pre-wrap text-xs text-zinc-300">{v.content.slice(0, 800)}</pre>
                                            <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(v.content); toast.success('Version copied'); } catch { toast.error('Copy failed'); } }} className="mt-2 inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300" aria-label="Copy version"><LucideLink size={12} /> Copy</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DriveBrowse;
