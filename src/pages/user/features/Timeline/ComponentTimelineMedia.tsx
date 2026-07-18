import envKeys from '../../../../config/envKeys';
import { TimelineItem, TimelineMediaAttachment, TimelineMediaType } from './utils/timelineAxios';
import { LucideFile, LucideFileAudio, LucideVideo } from 'lucide-react';

const getUploadFileUrl = (fileUrl: string) =>
    `${envKeys.API_URL}/api/uploads/crud/getFile?fileName=${encodeURIComponent(fileUrl)}`;

const resolveMediaUrl = (fileUrl?: string) => {
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

const collectMediaAttachments = (item: TimelineItem): TimelineMediaAttachment[] => {
    if (Array.isArray(item.mediaAttachments) && item.mediaAttachments.length > 0) {
        return item.mediaAttachments.filter((a) => a.fileUrl && a.fileType);
    }

    if (item.fileUrl && item.fileType) {
        return [
            {
                fileType: item.fileType,
                fileUrl: item.fileUrl,
                fileTitle: item.fileTitle,
                fileDescription: item.fileDescription,
            },
        ];
    }

    if (item.photoUrl) {
        return [
            {
                fileType: 'image',
                fileUrl: item.photoUrl,
                fileTitle: item.fileTitle || item.title,
            },
        ];
    }

    return [];
};

const iconTileClass =
    'inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100';

const ComponentTimelineMediaItem = ({
    attachment,
}: {
    attachment: TimelineMediaAttachment;
}) => {
    const fileType = (attachment.fileType || '') as TimelineMediaType | string;
    const mediaUrl = resolveMediaUrl(attachment.fileUrl);
    const title = attachment.fileTitle || 'Attachment';

    if (!fileType || !mediaUrl) return null;

    if (fileType === 'image') {
        return (
            <a
                href={mediaUrl}
                target="_blank"
                rel="noreferrer"
                title={title}
                className="inline-block shrink-0"
            >
                <img
                    src={mediaUrl}
                    alt={title}
                    className="max-h-20 max-w-[7.5rem] rounded-md border border-gray-200 object-cover"
                    loading="lazy"
                />
            </a>
        );
    }

    if (fileType === 'video') {
        return (
            <a
                href={mediaUrl}
                target="_blank"
                rel="noreferrer"
                title={title}
                className={iconTileClass}
            >
                <LucideVideo size={22} strokeWidth={1.5} />
            </a>
        );
    }

    if (fileType === 'audio') {
        return (
            <a
                href={mediaUrl}
                target="_blank"
                rel="noreferrer"
                title={title}
                className={iconTileClass}
            >
                <LucideFileAudio size={22} strokeWidth={1.5} />
            </a>
        );
    }

    return (
        <a
            href={mediaUrl}
            target="_blank"
            rel="noreferrer"
            title={title}
            className={iconTileClass}
        >
            <LucideFile size={22} strokeWidth={1.5} />
        </a>
    );
};

const ComponentTimelineMedia = ({ item }: { item: TimelineItem }) => {
    const attachments = collectMediaAttachments(item);

    if (attachments.length === 0) return null;

    return (
        <div
            className="mt-2 overflow-x-auto whitespace-nowrap pb-0.5"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="inline-flex items-center gap-1.5">
                {attachments.map((attachment, index) => (
                    <ComponentTimelineMediaItem
                        key={attachment._id || `${attachment.fileUrl}-${index}`}
                        attachment={attachment}
                    />
                ))}
            </div>
        </div>
    );
};

export default ComponentTimelineMedia;
