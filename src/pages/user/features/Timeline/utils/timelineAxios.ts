import { AxiosRequestConfig, CancelTokenSource } from "axios";
import axiosCustom from "../../../../../config/axiosCustom";

export interface TimelineItem {
    _id?: string;
    entityType: 'task' | 'note' | 'lifeEvent' | 'chatLlmThread' | 'infoVault';
    entityId: string;
    updatedAtUtc?: string;
    createdAtUtc?: string;
    // Additional fields from different entity types
    title?: string;
    content?: string;
    [key: string]: any;
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

