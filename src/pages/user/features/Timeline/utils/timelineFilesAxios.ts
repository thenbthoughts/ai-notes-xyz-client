import { AxiosRequestConfig, CancelTokenSource } from 'axios';
import axiosCustom from '../../../../../config/axiosCustom';

export type TimelineFileMediaType = 'image' | 'video' | 'audio' | 'file' | '';

export type TimelineFileSourceType = 'comment' | 'chat' | 'memo' | 'infoVault' | string;

export interface TimelineFileItem {
    _id: string;
    sourceRecordId?: string;
    fileType: TimelineFileMediaType | string;
    fileUrl: string;
    fileTitle: string;
    fileDescription?: string;
    sourceType: TimelineFileSourceType;
    parentEntityType: string;
    parentEntityId: string;
    createdAtUtc?: string | null;
    updatedAtUtc?: string | null;
}

export interface TimelineFilesGetResponse {
    message: string;
    docs: TimelineFileItem[];
    count: number;
}

export const timelineFilesGetAxios = async ({
    page = 1,
    perPage = 40,
    fileType = '',
    axiosCancelTokenSource,
}: {
    page?: number;
    perPage?: number;
    fileType?: string;
    axiosCancelTokenSource?: CancelTokenSource;
}): Promise<TimelineFilesGetResponse> => {
    try {
        const config = {
            method: 'post',
            url: `/api/timeline/files/timelineFilesGet`,
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                page,
                perPage,
                ...(fileType ? { fileType } : {}),
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
