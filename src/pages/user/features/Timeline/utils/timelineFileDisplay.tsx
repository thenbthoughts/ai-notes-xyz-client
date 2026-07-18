import envKeys from '../../../../../config/envKeys';
import { TimelineFileItem } from './timelineFilesAxios';
import { DateTime } from 'luxon';
import { LucideFile, LucideFileAudio, LucideVideo } from 'lucide-react';

const getUploadFileUrl = (fileUrl: string) =>
    `${envKeys.API_URL}/api/uploads/crud/getFile?fileName=${encodeURIComponent(fileUrl)}`;

export const resolveTimelineFileUrl = (fileUrl?: string) => {
    if (!fileUrl) return '';
    if (
        fileUrl.startsWith('http://') ||
        fileUrl.startsWith('https://') ||
        fileUrl.startsWith('data:')
    ) {
        return fileUrl;
    }
    return getUploadFileUrl(fileUrl);
};

export const getSourceLabel = (sourceType: string, parentEntityType: string) => {
    if (sourceType === 'chat') return 'Chat';
    if (sourceType === 'memo') return 'Memo';
    if (sourceType === 'infoVault') return 'Info Vault';
    switch (parentEntityType) {
        case 'task':
            return 'Task';
        case 'note':
            return 'Note';
        case 'lifeEvent':
            return 'Life Event';
        case 'infoVault':
            return 'Info Vault';
        default:
            return parentEntityType || sourceType || 'File';
    }
};

export const formatFileTime = (dateString?: string | null) => {
    if (!dateString) return '';
    try {
        return DateTime.fromISO(dateString).toLocaleString(DateTime.DATETIME_SHORT);
    } catch {
        return '';
    }
};

const iconWrap =
    'flex h-full w-full items-center justify-center bg-zinc-100 text-zinc-500';

export const TimelineFileVisual = ({
    item,
    compact = false,
}: {
    item: TimelineFileItem;
    compact?: boolean;
}) => {
    const mediaUrl = resolveTimelineFileUrl(item.fileUrl);
    const title = item.fileTitle || 'File';
    const fileType = item.fileType || 'file';

    if (!mediaUrl) return null;

    if (fileType === 'image') {
        return (
            <img
                src={mediaUrl}
                alt={title}
                className={
                    compact
                        ? 'h-12 w-12 rounded object-cover'
                        : 'h-full w-full object-cover'
                }
                loading="lazy"
            />
        );
    }

    if (fileType === 'video') {
        return (
            <div className={compact ? 'flex h-12 w-12 items-center justify-center rounded bg-zinc-100' : iconWrap}>
                <LucideVideo size={compact ? 20 : 28} strokeWidth={1.5} />
            </div>
        );
    }

    if (fileType === 'audio') {
        return (
            <div className={compact ? 'flex h-12 w-12 items-center justify-center rounded bg-zinc-100' : iconWrap}>
                <LucideFileAudio size={compact ? 20 : 28} strokeWidth={1.5} />
            </div>
        );
    }

    return (
        <div className={compact ? 'flex h-12 w-12 items-center justify-center rounded bg-zinc-100' : iconWrap}>
            <LucideFile size={compact ? 20 : 28} strokeWidth={1.5} />
        </div>
    );
};
