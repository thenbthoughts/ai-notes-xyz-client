import { TimelineItem } from './utils/timelineAxios.ts';
import { useNavigate } from 'react-router-dom';
import { DateTime } from 'luxon';

const ComponentTimelineItem = ({
    item,
}: {
    item: TimelineItem;
}) => {
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
            default:
                return 'border-gray-400';
        }
    };

    const formatLocalDateTime = (dateString?: string) => {
        if (!dateString) return '';
        try {
            const date = DateTime.fromISO(dateString);
            return date.toLocaleString(DateTime.DATETIME_SHORT);
        } catch (error) {
            return '';
        }
    };

    const formatRelativeTime = (dateString?: string) => {
        if (!dateString) return '';
        try {
            const date = DateTime.fromISO(dateString);
            const relativeTime = date.toRelative();
            return relativeTime || '';
        } catch (error) {
            return '';
        }
    };

    const handleClick = () => {
        const entityId = item.entityId;
        if (!entityId) return;

        switch (item.entityType) {
            case 'task':
                navigate(`/user/task?action=edit&id=${entityId}`);
                break;
            case 'note':
                navigate(`/user/notes?action=edit&id=${entityId}`);
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
            default:
                break;
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`bg-white border-l-2 ${getEntityColor(item.entityType)} hover:bg-gray-50 transition-colors cursor-pointer py-2 px-3`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wide">
                            {getEntityTypeLabel(item.entityType)}
                        </span>
                        <span className="text-[10px] text-gray-400">
                            {formatLocalDateTime(item.updatedAtUtc || item.createdAtUtc)}
                        </span>
                        <span className="text-[10px] text-gray-300">
                            ({formatRelativeTime(item.updatedAtUtc || item.createdAtUtc)})
                        </span>
                    </div>
                    {item.title && (
                        <h3 className="text-xs font-medium text-gray-900 mb-0.5 truncate">
                            {item.title}
                        </h3>
                    )}
                    {item.content && (
                        <p className="text-[10px] text-gray-600 line-clamp-1">
                            {item.content}
                        </p>
                    )}
                    {!item.title && !item.content && (
                        <p className="text-[10px] text-gray-500 truncate">
                            {getEntityTypeLabel(item.entityType)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ComponentTimelineItem;

