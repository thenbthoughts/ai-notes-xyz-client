import { AxiosRequestConfig } from 'axios';
import axiosCustom from '../../../../../config/axiosCustom';
import { DriveFilesResponse } from '../../../../../types/pages/Drive.types';

export const driveGetFiles = async (params: {
    bucketName: string;
    parentPath?: string;
    page?: number;
    perPage?: number;
}): Promise<DriveFilesResponse> => {
    try {
        const config: AxiosRequestConfig = {
            method: 'post',
            url: '/api/drive/files',
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                bucketName: params.bucketName,
                parentPath: params.parentPath || '',
                page: params.page || 1,
                perPage: params.perPage || 10000,
            },
        };
        const response = await axiosCustom.request(config);
        return response.data;
    } catch (error) {
        console.error('Error fetching files:', error);
        throw error;
    }
};
