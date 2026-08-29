import axiosCustom from '../../../../../config/axiosCustom';
import { TimelineFileItem } from './timelineFilesAxios';

export const timelineFileDeleteAxios = async (item: TimelineFileItem): Promise<void> => {
    const recordId = item.sourceRecordId || item._id;

    if (item.sourceType === 'comment') {
        await axiosCustom.post('/api/comment-common/crud/commentCommonDelete', {
            id: recordId,
        });
        return;
    }

    if (item.sourceType === 'chat') {
        await axiosCustom.post('/api/chat-llm/crud/notesDelete', {
            _id: recordId,
        });
        return;
    }

    if (item.sourceType === 'memo') {
        await axiosCustom.post('/api/memo-file/crud/memoFileDelete', {
            memoNoteId: item.parentEntityId,
            filePath: item.fileUrl,
        });
        return;
    }

    if (item.sourceType === 'infoVault') {
        await axiosCustom.post('/api/info-vault/crud/infoVaultEdit', {
            _id: recordId,
            photoUrl: '',
        });
        return;
    }

    throw new Error(`Delete not supported for source: ${item.sourceType}`);
};

export const getTimelineFileGoToPath = (item: TimelineFileItem): string | null => {
    const entityType = item.parentEntityType || '';
    const entityId = item.parentEntityId || '';

    if (!entityId && entityType !== 'memo') return null;

    switch (entityType) {
        case 'task':
            return `/user/task?edit-task-id=${entityId}`;
        case 'note':
            return `/user/notes?action=edit&id=${entityId}`;
        case 'lifeEvent':
            return `/user/life-events?action=edit&id=${entityId}`;
        case 'chatLlmThread':
            return `/user/chat?action=edit&id=${entityId}`;
        case 'infoVault':
            return `/user/info-vault?action=edit&id=${entityId}`;
        case 'memo':
            return `/user/memo`;
        default:
            return null;
    }
};

export const getTimelineFileOpenLabel = (item: TimelineFileItem): string => {
    switch (item.parentEntityType) {
        case 'task':
            return 'Open task';
        case 'note':
            return 'Open note';
        case 'lifeEvent':
            return 'Open life event';
        case 'chatLlmThread':
            return 'Open chat';
        case 'infoVault':
            return 'Open contact';
        case 'memo':
            return 'Open memo';
        default:
            return 'Open source';
    }
};
