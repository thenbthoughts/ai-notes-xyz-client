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
import { LucideDownload, LucideTrash2, LucideEdit, LucideMoreVertical } from 'lucide-react';
import DriveImageThumbnail from './DriveImageThumbnail';
import { useAtom } from 'jotai';
import {
    jotaiDriveCurrentBucket,
    jotaiDriveCurrentPath,
    jotaiDriveRefresh,
} from '../stateJotai/driveStateJotai';
import { driveDeleteFile, driveDownloadFile } from '../utils/driveAxios';
import toast from 'react-hot-toast';

interface DriveFileItemProps {
    file: DriveFile;
    onFileClick: (file: DriveFile) => void;
    onEditClick?: (file: DriveFile) => void;
    viewMode: 'grid' | 'list';
    showPath?: boolean;
}

const DriveFileItem = ({ file, onFileClick, onEditClick, viewMode, showPath = false }: DriveFileItemProps) => {
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
        if (!confirm(`Delete this ${label}: "${file.fileName}"?`)) {
            return;
        }

        setDeleting(true);
        try {
            await driveDeleteFile({
                bucketName: currentBucket,
                fileKey: file.fileKey,
            });
            toast.success(file.isFolder ? 'Folder removed' : 'File deleted');
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

    const actionsMenu = (
        <div className="relative" ref={menuRef}>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen((v) => !v);
                }}
                className="rounded-full p-1.5 text-slate-500 opacity-0 transition group-hover:opacity-100 hover:bg-slate-200/80 focus:opacity-100"
                title="More actions"
                aria-label="More actions"
            >
                <LucideMoreVertical size={18} />
            </button>
            {menuOpen && (
                <div
                    className="absolute right-0 z-20 mt-1 min-w-[148px] overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                >
                    {editable && onEditClick && (
                        <button
                            type="button"
                            onClick={handleEdit}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
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
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                            <LucideDownload size={16} />
                            {downloading ? 'Downloading…' : 'Download'}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                        <LucideTrash2 size={16} />
                        {deleting ? 'Deleting…' : 'Delete'}
                    </button>
                </div>
            )}
        </div>
    );

    if (viewMode === 'list') {
        const listGridClass = showPath
            ? 'group grid cursor-pointer grid-cols-[minmax(0,1fr)_88px_40px] items-center gap-2 border-b border-slate-100 px-3 py-2.5 transition hover:bg-sky-50/60 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_160px_120px_44px]'
            : 'group grid cursor-pointer grid-cols-[minmax(0,1fr)_88px_40px] items-center gap-2 border-b border-slate-100 px-3 py-2.5 transition hover:bg-sky-50/60 sm:grid-cols-[minmax(0,1fr)_160px_120px_44px]';

        return (
            <div
                className={listGridClass}
                onClick={handleOpen}
                onDoubleClick={handleOpen}
            >
                <div className="flex min-w-0 items-center gap-3">
                    {showImagePreview ? (
                        <DriveImageThumbnail
                            file={file}
                            bucketName={currentBucket}
                            className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-50"
                            iconSize={18}
                        />
                    ) : (
                        <Icon size={22} className={`flex-shrink-0 ${iconClass}`} />
                    )}
                    <span className="truncate text-sm font-medium text-slate-800" title={file.fileName}>
                        {file.fileName}
                    </span>
                </div>
                {showPath && (
                    <div
                        className="hidden truncate text-sm text-slate-500 sm:block"
                        title={file.filePath || file.parentPath || '—'}
                    >
                        {file.filePath || file.parentPath || '—'}
                    </div>
                )}
                <div className="hidden text-sm text-slate-500 sm:block">
                    {formatModifiedDate(file.lastModified)}
                </div>
                <div className="text-sm text-slate-500">
                    {file.isFolder ? '—' : formatFileSize(file.fileSize)}
                </div>
                <div className="flex justify-end">{actionsMenu}</div>
            </div>
        );
    }

    return (
        <div
            className="group relative flex cursor-pointer flex-col rounded-xl border border-transparent bg-white p-3 transition hover:border-slate-200 hover:bg-sky-50/40 hover:shadow-sm"
            onClick={handleOpen}
            onDoubleClick={handleOpen}
        >
            <div className="absolute right-1 top-1 z-10">{actionsMenu}</div>
            {showImagePreview ? (
                <DriveImageThumbnail
                    file={file}
                    bucketName={currentBucket}
                    className="mb-3 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-slate-50"
                />
            ) : (
                <div className="mb-3 flex aspect-[4/3] items-center justify-center rounded-lg bg-slate-50">
                    <Icon size={44} className={iconClass} />
                </div>
            )}
            <div className="truncate text-sm font-medium text-slate-800" title={file.fileName}>
                {file.fileName}
            </div>
            {showPath && (
                <div
                    className="mt-0.5 truncate text-xs text-slate-400"
                    title={file.filePath || file.parentPath || '—'}
                >
                    {file.filePath || file.parentPath || '—'}
                </div>
            )}
            <div className="mt-0.5 text-xs text-slate-500">
                {file.isFolder ? 'Folder' : formatFileSize(file.fileSize)}
            </div>
        </div>
    );
};

export default DriveFileItem;
