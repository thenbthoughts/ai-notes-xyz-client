import { useEffect, useRef, useState } from 'react';
import { DriveFile } from '../../../../../types/pages/Drive.types';
import {
    getFileIcon,
    getFileIconClass,
    formatFileSize,
    formatModifiedDate,
    isEditableFile,
    isImageFile,
} from '../utils/driveFileUtils';
import { LucideDownload, LucideTrash2, LucideEdit, LucideMoreVertical, LucideLink, LucideCopy as LucideCopyIcon, LucideHistory, LucideFolderInput } from 'lucide-react';
import DriveImageThumbnail from './DriveImageThumbnail';
import { useAtom } from 'jotai';
import {
    jotaiDriveCurrentBucket,
    jotaiDriveCurrentPath,
    jotaiDriveRefresh,
} from '../stateJotai/driveStateJotai';
import { driveDownloadFile } from '../utils/driveAxios';
import toast from 'react-hot-toast';

interface DriveFileItemProps {
    file: DriveFile;
    onFileClick: (file: DriveFile) => void;
    onEditClick?: (file: DriveFile) => void;
    viewMode: 'grid' | 'list';
    showPath?: boolean;
    draggableProps?: { onDragStart: (e: React.DragEvent) => void; onDragOver?: (e: React.DragEvent) => void; onDrop?: (e: React.DragEvent) => void; isDropTarget?: boolean };
    onRename?: (file: DriveFile) => void;
    onMove?: (file: DriveFile) => void;
    onCopy?: (file: DriveFile) => void;
    onShare?: (file: DriveFile) => void;
    onVersions?: (file: DriveFile) => void;
}

const DriveFileItem = ({ file, onFileClick, onEditClick, viewMode, showPath = false, draggableProps, onRename, onMove, onCopy, onShare, onVersions }: DriveFileItemProps) => {
    const [currentBucket] = useAtom(jotaiDriveCurrentBucket);
    const [, setCurrentPath] = useAtom(jotaiDriveCurrentPath);
    const [, setRefresh] = useAtom(jotaiDriveRefresh);
    const [deleting, setDeleting] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const Icon = getFileIcon(file);
    const iconClass = getFileIconClass(file);
    const editable = isEditableFile(file);
    const showImagePreview = isImageFile(file);

    useEffect(() => {
        if (!menuOpen) return;
        const onPointerDown = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', onPointerDown);
        return () => document.removeEventListener('mousedown', onPointerDown);
    }, [menuOpen]);

    const handleOpen = () => {
        if (file.isFolder) {
            setCurrentPath(file.filePath || '');
        } else {
            onFileClick(file);
        }
    };

    const handleDelete = async () => {
        setMenuOpen(false);
        const label = file.isFolder ? 'folder from the index' : 'file';
        if (!confirm(`Move this ${label} to trash: "${file.fileName}"?`)) {
            return;
        }

        setDeleting(true);
        try {
            const { driveBulkAction } = await import('../utils/driveAxios');
            await driveBulkAction({ bucketName: currentBucket, action: 'delete', fileKeys: [file.fileKey] });
            toast.success(file.isFolder ? 'Folder trashed' : 'Moved to trash');
            setRefresh((prev) => prev + 1);
        } catch {
            toast.error(file.isFolder ? 'Failed to delete folder' : 'Failed to delete file');
        } finally {
            setDeleting(false);
        }
    };

    const handleDownload = async () => {
        setMenuOpen(false);
        if (!currentBucket) {
            toast.error('No bucket selected');
            return;
        }
        setDownloading(true);
        try {
            await driveDownloadFile(currentBucket, file.fileKey, file.fileName);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to download file');
            console.error(error);
        } finally {
            setDownloading(false);
        }
    };

    const handleEdit = () => {
        setMenuOpen(false);
        onEditClick?.(file);
    };

    const handleCopyPath = async () => {
        setMenuOpen(false);
        try {
            await navigator.clipboard.writeText(file.filePath || file.fileName);
            toast.success('Path copied');
        } catch {
            toast.error('Failed to copy');
        }
    };

    const actionsMenu = (
        <div className="relative" ref={menuRef}>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen((v) => !v);
                }}
                className="rounded-full p-1.5 text-zinc-400 opacity-0 transition group-hover:opacity-100 hover:bg-zinc-800/80 focus:opacity-100"
                title="More actions"
                aria-label="More actions"
            >
                <LucideMoreVertical size={18} />
            </button>
            {menuOpen && (
                <div
                    className="absolute right-0 z-20 mt-1 min-w-[180px] overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                >
                    {editable && onEditClick && (
                        <button
                            type="button"
                            onClick={handleEdit}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800"
                            aria-label="Edit file"
                        >
                            <LucideEdit size={16} />
                            Edit
                        </button>
                    )}
                    {!file.isFolder && (
                        <button
                            type="button"
                            onClick={handleDownload}
                            disabled={downloading}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
                            aria-label="Download file"
                        >
                            <LucideDownload size={16} />
                            {downloading ? 'Downloading…' : 'Download'}
                        </button>
                    )}
                    <button type="button" onClick={handleCopyPath} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800" aria-label="Copy path">
                        <LucideCopyIcon size={16} /> Copy path
                    </button>
                    <button type="button" onClick={() => { setMenuOpen(false); onRename?.(file); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800" aria-label="Rename">
                        <LucideEdit size={16} /> Rename
                    </button>
                    <button type="button" onClick={() => { setMenuOpen(false); onMove?.(file); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800" aria-label="Move">
                        <LucideFolderInput size={16} /> Move
                    </button>
                    <button type="button" onClick={() => { setMenuOpen(false); onCopy?.(file); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800" aria-label="Copy">
                        <LucideCopyIcon size={16} /> Copy
                    </button>
                    {!file.isFolder && (
                        <>
                            <button type="button" onClick={() => { setMenuOpen(false); onShare?.(file); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800" aria-label="Share link">
                                <LucideLink size={16} /> Share link
                            </button>
                            <button type="button" onClick={() => { setMenuOpen(false); onVersions?.(file); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800" aria-label="Version history">
                                <LucideHistory size={16} /> Versions
                            </button>
                        </>
                    )}
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-zinc-800 disabled:opacity-50"
                        aria-label="Delete"
                    >
                        <LucideTrash2 size={16} />
                        {deleting ? 'Deleting…' : file.isFolder ? 'Trash folder' : 'Trash'}
                    </button>
                </div>
            )}
        </div>
    );

    if (viewMode === 'list') {
        const listGridClass = showPath
            ? 'group grid cursor-pointer grid-cols-[minmax(0,1fr)_88px_40px] items-center gap-2 border-b px-3 py-2.5 transition sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_160px_120px_44px]'
            : 'group grid cursor-pointer grid-cols-[minmax(0,1fr)_88px_40px] items-center gap-2 border-b px-3 py-2.5 transition sm:grid-cols-[minmax(0,1fr)_160px_120px_44px]';
        const borderDrop = draggableProps?.isDropTarget ? 'border-sky-600 bg-sky-950/60' : 'border-zinc-800 hover:bg-sky-950/40';

        return (
            <div
                className={`${listGridClass} ${borderDrop}`}
                onClick={handleOpen}
                onDoubleClick={handleOpen}
                draggable={!!draggableProps}
                onDragStart={draggableProps?.onDragStart}
                onDragOver={draggableProps?.onDragOver}
                onDrop={draggableProps?.onDrop}
            >
                <div className="flex min-w-0 items-center gap-3">
                    {showImagePreview ? (
                        <DriveImageThumbnail
                            file={file}
                            bucketName={currentBucket}
                            className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-zinc-950"
                            iconSize={18}
                        />
                    ) : (
                        <Icon size={22} className={`flex-shrink-0 ${iconClass}`} />
                    )}
                    <span className="truncate text-sm font-medium text-zinc-200" title={file.fileName}>
                        {file.fileName}
                    </span>
                </div>
                {showPath && (
                    <div
                        className="hidden truncate text-sm text-zinc-400 sm:block"
                        title={file.filePath || file.parentPath || '—'}
                    >
                        {file.filePath || file.parentPath || '—'}
                    </div>
                )}
                <div className="hidden text-sm text-zinc-400 sm:block">
                    {formatModifiedDate(file.lastModified)}
                </div>
                <div className="text-sm text-zinc-400">
                    {file.isFolder ? '—' : formatFileSize(file.fileSize)}
                </div>
                <div className="flex justify-end">{actionsMenu}</div>
            </div>
        );
    }

    const dropStyle = draggableProps?.isDropTarget ? 'border-sky-600 bg-sky-950/50' : 'border-transparent bg-zinc-900 hover:border-zinc-700 hover:bg-sky-950/40';

    return (
        <div
            className={`group relative flex cursor-pointer flex-col rounded-xl border p-3 transition hover:shadow-sm ${dropStyle}`}
            onClick={handleOpen}
            onDoubleClick={handleOpen}
            draggable={!!draggableProps}
            onDragStart={draggableProps?.onDragStart}
            onDragOver={draggableProps?.onDragOver}
            onDrop={draggableProps?.onDrop}
        >
            <div className="absolute right-1 top-1 z-10">{actionsMenu}</div>
            {showImagePreview ? (
                <DriveImageThumbnail
                    file={file}
                    bucketName={currentBucket}
                    className="mb-3 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-zinc-950"
                />
            ) : (
                <div className="mb-3 flex aspect-[4/3] items-center justify-center rounded-lg bg-zinc-950">
                    <Icon size={44} className={iconClass} />
                </div>
            )}
            <div className="truncate text-sm font-medium text-zinc-200" title={file.fileName}>
                {file.fileName}
            </div>
            {showPath && (
                <div
                    className="mt-0.5 truncate text-xs text-zinc-500"
                    title={file.filePath || file.parentPath || '—'}
                >
                    {file.filePath || file.parentPath || '—'}
                </div>
            )}
            <div className="mt-0.5 text-xs text-zinc-400">
                {file.isFolder ? 'Folder' : formatFileSize(file.fileSize)}
            </div>
        </div>
    );
};

export default DriveFileItem;
