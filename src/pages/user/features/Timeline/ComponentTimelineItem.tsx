import { TimelineItem } from './utils/timelineAxios.ts';
import { useNavigate } from 'react-router-dom';
import { DateTime } from 'luxon';
import ComponentTimelineMedia from './ComponentTimelineMedia.tsx';

const ComponentTimelineItem = ({ item }: { item: TimelineItem }) => {
    const navigate = useNavigate();

    const getEntityTypeLabel = (entityType: string) => {
        switch (entityType) {
            case 'task':
                return 'Task';
            case 'note':
                return 'Note';
            case 'lifeEvent':
                return 'Life Event';
            case 'chatLlmThread':
                return 'Chat';
            case 'infoVault':
                return 'Info Vault';
            case 'memo':
                return 'Memo';
            default:
                return entityType;
        }
    };

    const getEntityColor = (entityType: string) => {
        switch (entityType) {
            case 'task':
                return 'border-green-500';
            case 'note':
                return 'border-blue-500';
            case 'lifeEvent':
                return 'border-purple-500';
            case 'chatLlmThread':
                return 'border-yellow-500';
            case 'infoVault':
                return 'border-indigo-500';
            case 'memo':
                return 'border-pink-500';
            default:
                return 'border-gray-400';
        }
    };

    const formatLocalDateTime = (dateString?: string) => {
        if (!dateString) return '';
        try {
            return DateTime.fromISO(dateString).toLocaleString(DateTime.DATETIME_SHORT);
        } catch {
            return '';
        }
    };

    const formatRelativeTime = (dateString?: string) => {
        if (!dateString) return '';
        try {
            return DateTime.fromISO(dateString).toRelative() || '';
        } catch {
            return '';
        }
    };

    const navigateToEntity = (
        entityType: string,
        entityId: string,
        workspaceId?: string
    ) => {
        if (!entityId) return;

        switch (entityType) {
            case 'task':
                navigate(
                    `/user/task?workspace=${workspaceId || ''}&edit-task-id=${entityId}`
                );
                break;
            case 'note':
                navigate(
                    `/user/notes?action=edit&id=${entityId}&workspace=${workspaceId || ''}`
                );
                break;
            case 'lifeEvent':
                navigate(`/user/life-events?action=edit&id=${entityId}`);
                break;
            case 'chatLlmThread':
                navigate(`/user/chat?action=edit&id=${entityId}`);
                break;
            case 'infoVault':
                navigate(`/user/info-vault?action=edit&id=${entityId}`);
                break;
            case 'memo':
                navigate(`/user/memo`);
                break;
            default:
                break;
        }
    };

    const handleClick = () => {
        navigateToEntity(item.entityType, item.entityId, item.workspaceId);
    };

    const label = getEntityTypeLabel(item.entityType);

    return (
        <div
            onClick={handleClick}
            className={`cursor-pointer border-l-2 bg-white px-3 py-2 transition-colors hover:bg-gray-50 ${getEntityColor(
                item.entityType
            )}`}
        >
            <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wide text-gray-500">
                            {label}
                        </span>
                        {item.isAi && (
                            <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-700">
                                AI
                            </span>
                        )}
                        {(item.fileType || (item.mediaAttachments && item.mediaAttachments.length > 0)) && (
                            <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-medium capitalize text-orange-700">
                                {item.fileType
                                    || (item.mediaAttachments && item.mediaAttachments[0]?.fileType)
                                    || 'file'}
                                {item.mediaAttachments && item.mediaAttachments.length > 1
                                    ? ` · ${item.mediaAttachments.length}`
                                    : ''}
                            </span>
                        )}
                        <span className="text-[10px] text-gray-400">
                            {formatLocalDateTime(item.updatedAtUtc || item.createdAtUtc)}
                        </span>
                        <span className="text-[10px] text-gray-300">
                            ({formatRelativeTime(item.updatedAtUtc || item.createdAtUtc)})
                        </span>
                    </div>

                    {item.title && (
                        <h3 className="mb-0.5 truncate text-xs font-medium text-gray-900">
                            {item.title}
                        </h3>
                    )}

                    {item.content && (
                        <p className="line-clamp-2 text-[10px] text-gray-600">{item.content}</p>
                    )}

                    {!item.title && !item.content && !item.fileType && (
                        <p className="truncate text-[10px] text-gray-500">{label}</p>
                    )}

                    <ComponentTimelineMedia item={item} />
                </div>
            </div>
        </div>
    );
};

export default ComponentTimelineItem;
