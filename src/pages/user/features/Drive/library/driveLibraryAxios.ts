import { AxiosRequestConfig } from 'axios';
import axiosCustom from '../../../../../config/axiosCustom';
import { DriveFilesResponse } from '../../../../../types/pages/Drive.types';

export const driveGetLibrary = async (params: {
    bucketName: string;
    page?: number;
    perPage?: number;
    search?: string;
    fileTypes?: string[];
    sortBy?: 'name' | 'size' | 'date';
    sortOrder?: 'asc' | 'desc';
}): Promise<DriveFilesResponse> => {
    try {
        const config: AxiosRequestConfig = {
            method: 'post',
            url: '/api/drive/library',
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                bucketName: params.bucketName,
                page: params.page || 1,
                perPage: params.perPage || 50,
                search: params.search || '',
                fileTypes: params.fileTypes || [],
                sortBy: params.sortBy || 'name',
                sortOrder: params.sortOrder || 'asc',
            },
        };
        const response = await axiosCustom.request(config);
        return response.data;
    } catch (error) {
        console.error('Error fetching library:', error);
        throw error;
    }
};
