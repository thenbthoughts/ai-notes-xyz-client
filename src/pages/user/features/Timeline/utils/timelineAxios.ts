import { AxiosRequestConfig, CancelTokenSource } from 'axios';
import axiosCustom from '../../../../../config/axiosCustom';

export type TimelineEntityType =
    | 'task'
    | 'note'
    | 'lifeEvent'
    | 'chatLlmThread'
    | 'infoVault'
    | 'memo'
    | 'comment';

export type TimelineMediaType = 'image' | 'video' | 'audio' | 'file' | '';

export interface TimelineMediaAttachment {
    _id?: string;
    fileType?: TimelineMediaType | string;
    fileUrl?: string;
    fileTitle?: string;
    fileDescription?: string;
    commentText?: string;
    createdAtUtc?: string | null;
    updatedAtUtc?: string | null;
}

export interface TimelineItem {
    _id?: string;
    entityType: TimelineEntityType;
    entityId: string;
    parentEntityType?: TimelineEntityType | string;
    parentEntityId?: string;
    commentId?: string;
    updatedAtUtc?: string;
    createdAtUtc?: string;
    title?: string;
    content?: string;
    workspaceId?: string;
    fileType?: TimelineMediaType;
    fileUrl?: string;
    fileTitle?: string;
    fileDescription?: string;
    photoUrl?: string;
    isAi?: boolean;
    mediaAttachments?: TimelineMediaAttachment[];
}

export interface TimelineGetResponse {
    message: string;
    docs: TimelineItem[];
    count: number;
}

export const timelineGetAxios = async ({
    page = 1,
    perPage = 20,
    axiosCancelTokenSource,
}: {
    page?: number;
    perPage?: number;
    axiosCancelTokenSource?: CancelTokenSource;
}): Promise<TimelineGetResponse> => {
    try {
        const config = {
            method: 'post',
            url: `/api/timeline/crud/timelineGet`,
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                page,
                perPage,
            },
            cancelToken: axiosCancelTokenSource?.token,
        } as AxiosRequestConfig;

        const response = await axiosCustom.request(config);

        return {
            message: response.data.message || '',
            docs: Array.isArray(response.data.docs) ? response.data.docs : [],
            count: typeof response.data.count === 'number' ? response.data.count : 0,
        };
    } catch (error) {
        console.error(error);
        throw error;
    }
};
