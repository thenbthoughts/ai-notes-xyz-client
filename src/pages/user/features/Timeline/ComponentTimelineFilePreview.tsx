import { useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    LucideChevronLeft,
    LucideChevronRight,
    LucideDownload,
    LucideExternalLink,
    LucideFile,
    LucideFileAudio,
    LucideMoreVertical,
    LucideTrash2,
    LucideX,
} from 'lucide-react';
import { TimelineFileItem } from './utils/timelineFilesAxios';
import {
    formatFileTime,
    getSourceLabel,
    resolveTimelineFileUrl,
} from './utils/timelineFileDisplay';
import {
    getTimelineFileGoToPath,
    getTimelineFileOpenLabel,
    timelineFileDeleteAxios,
} from './utils/timelineFileActions';

Modal.setAppElement('#root');

const ComponentTimelineFilePreview = ({
    items,
    index,
    onClose,
    onChangeIndex,
    onDeleted,
}: {
    items: TimelineFileItem[];
    index: number | null;
    onClose: () => void;
    onChangeIndex: (nextIndex: number) => void;
    onDeleted: (deletedItemId: string) => void;
}) => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const isOpen = index != null && index >= 0 && index < items.length;
    const item = isOpen ? items[index] : null;
    const mediaUrl = item ? resolveTimelineFileUrl(item.fileUrl) : '';
    const fileType = item?.fileType || 'file';
    const title = item?.fileTitle || 'File';

    useEffect(() => {
        setMenuOpen(false);
    }, [index]);

    useEffect(() => {
        if (!menuOpen) return;
        const onPointerDown = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        window.addEventListener('mousedown', onPointerDown);
        return () => window.removeEventListener('mousedown', onPointerDown);
    }, [menuOpen]);

    useEffect(() => {
        if (!isOpen || index == null) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (menuOpen) {
                    setMenuOpen(false);
                    return;
                }
                onClose();
                return;
            }
            if (menuOpen) return;
            if (event.key === 'ArrowLeft' && index > 0) {
                onChangeIndex(index - 1);
                return;
            }
            if (event.key === 'ArrowRight' && index < items.length - 1) {
                onChangeIndex(index + 1);
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isOpen, index, items.length, onChangeIndex, onClose, menuOpen]);

    if (!isOpen || !item || !mediaUrl || index == null) {
        return null;
    }

    const canPrev = index > 0;
    const canNext = index < items.length - 1;
    const goToPath = getTimelineFileGoToPath(item);

    const handleDownload = () => {
        setMenuOpen(false);
        window.open(mediaUrl, '_blank', 'noopener,noreferrer');
    };

    const handleGoTo = () => {
        setMenuOpen(false);
        if (!goToPath) {
            toast.error('Cannot open source for this file');
            return;
        }
        onClose();
        navigate(goToPath);
    };

    const handleDelete = async () => {
        if (deleting) return;
        const confirmed = window.confirm('Delete this file?');
        if (!confirmed) return;

        setDeleting(true);
        setMenuOpen(false);
        try {
            await timelineFileDeleteAxios(item);
            toast.success('File deleted');
            onDeleted(item._id);
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete file');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Modal
            isOpen
            onRequestClose={onClose}
            shouldCloseOnOverlayClick
            shouldCloseOnEsc={!menuOpen}
            className="absolute inset-0 flex outline-none"
            overlayClassName="fixed inset-0 z-[1000] bg-black/75"
            contentLabel="File preview"
        >
            <div className="relative flex h-full w-full flex-col">
                <div className="flex shrink-0 items-center justify-between gap-3 px-3 py-2 text-white">
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{title}</p>
                        <p className="truncate text-[11px] text-white/60">
                            {getSourceLabel(item.sourceType, item.parentEntityType)}
                            {' · '}
                            <span className="capitalize">{fileType}</span>
                            {formatFileTime(item.updatedAtUtc || item.createdAtUtc)
                                ? ` · ${formatFileTime(item.updatedAtUtc || item.createdAtUtc)}`
                                : ''}
                            {items.length > 1 ? ` · ${index + 1} / ${items.length}` : ''}
                        </p>
                    </div>
                    <div className="relative flex shrink-0 items-center gap-1" ref={menuRef}>
                        <button
                            type="button"
                            onClick={() => setMenuOpen((open) => !open)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/80 hover:bg-white/10 hover:text-white"
                            title="More options"
                        >
                            <LucideMoreVertical size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/80 hover:bg-white/10 hover:text-white"
                            title="Close"
                        >
                            <LucideX size={18} />
                        </button>

                        {menuOpen && (
                            <div className="absolute right-0 top-9 z-20 min-w-[160px] overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 shadow-xl">
                                <button
                                    type="button"
                                    onClick={handleDownload}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-zinc-800 hover:bg-zinc-50"
                                >
                                    <LucideDownload size={14} className="text-zinc-500" />
                                    Download
                                </button>
                                <button
                                    type="button"
                                    onClick={handleGoTo}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-zinc-800 hover:bg-zinc-50"
                                >
                                    <LucideExternalLink size={14} className="text-zinc-500" />
                                    {getTimelineFileOpenLabel(item)}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                                >
                                    <LucideTrash2 size={14} />
                                    {deleting ? 'Deleting…' : 'Delete'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="relative flex min-h-0 flex-1 items-center justify-center px-12 py-3">
                    {canPrev && (
                        <button
                            type="button"
                            onClick={() => onChangeIndex(index - 1)}
                            className="absolute left-2 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                            title="Previous"
                        >
                            <LucideChevronLeft size={22} />
                        </button>
                    )}

                    {fileType === 'image' && (
                        <img
                            src={mediaUrl}
                            alt={title}
                            className="max-h-full max-w-full rounded-md object-contain shadow-lg"
                        />
                    )}

                    {fileType === 'video' && (
                        <video
                            key={mediaUrl}
                            src={mediaUrl}
                            controls
                            autoPlay
                            className="max-h-full max-w-full rounded-md bg-black shadow-lg"
                        />
                    )}

                    {fileType === 'audio' && (
                        <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-xl bg-white/10 px-6 py-8 text-white backdrop-blur-sm">
                            <LucideFileAudio size={48} strokeWidth={1.25} className="text-white/80" />
                            <p className="max-w-full truncate text-center text-sm">{title}</p>
                            <audio key={mediaUrl} src={mediaUrl} controls autoPlay className="w-full" />
                        </div>
                    )}

                    {fileType !== 'image' && fileType !== 'video' && fileType !== 'audio' && (
                        <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-xl bg-white px-6 py-8 text-center shadow-lg">
                            <LucideFile size={48} strokeWidth={1.25} className="text-zinc-400" />
                            <div>
                                <p className="text-sm font-medium text-zinc-900">{title}</p>
                                <p className="mt-1 text-[11px] text-zinc-400">No inline preview</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleDownload}
                                className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800"
                            >
                                <LucideDownload size={14} />
                                Download
                            </button>
                        </div>
                    )}

                    {canNext && (
                        <button
                            type="button"
                            onClick={() => onChangeIndex(index + 1)}
                            className="absolute right-2 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                            title="Next"
                        >
                            <LucideChevronRight size={22} />
                        </button>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default ComponentTimelineFilePreview;
