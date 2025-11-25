import { AxiosRequestConfig } from 'axios';
import axiosCustom from '../../../../../config/axiosCustom';
import { DriveBucket, DriveFilesResponse, DriveBucketsResponse, DriveIndexResponse } from '../../../../../types/pages/Drive.types';

export const driveGetBuckets = async (): Promise<DriveBucketsResponse> => {
    try {
        const config: AxiosRequestConfig = {
            method: 'get',
            url: '/api/drive/buckets',
        };
        const response = await axiosCustom.request(config);
        return response.data;
    } catch (error) {
        console.error('Error fetching buckets:', error);
        throw error;
    }
};

export const driveAddBucket = async (bucketData: {
    bucketName: string;
    endpoint: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    prefix?: string;
}): Promise<{ success: boolean; bucket: DriveBucket }> => {
    try {
        const config: AxiosRequestConfig = {
            method: 'post',
            url: '/api/drive/buckets',
            headers: {
                'Content-Type': 'application/json',
            },
            data: bucketData,
        };
        const response = await axiosCustom.request(config);
        return response.data;
    } catch (error) {
        console.error('Error adding bucket:', error);
        throw error;
    }
};

export const driveUpdateBucket = async (
    id: string,
    bucketData: {
        bucketName?: string;
        endpoint?: string;
        region?: string;
        accessKeyId?: string;
        secretAccessKey?: string;
        prefix?: string;
        isActive?: boolean;
    }
): Promise<{ success: boolean; bucket: DriveBucket | null }> => {
    try {
        const config: AxiosRequestConfig = {
            method: 'put',
            url: `/api/drive/buckets/${id}`,
            headers: {
                'Content-Type': 'application/json',
            },
            data: bucketData,
        };
        const response = await axiosCustom.request(config);
        return response.data;
    } catch (error) {
        console.error('Error updating bucket:', error);
        throw error;
    }
};

export const driveDeleteBucket = async (id: string): Promise<{ success: boolean }> => {
    try {
        const config: AxiosRequestConfig = {
            method: 'delete',
            url: `/api/drive/buckets/${id}`,
        };
        const response = await axiosCustom.request(config);
        return response.data;
    } catch (error) {
        console.error('Error deleting bucket:', error);
        throw error;
    }
};

export const driveReindexBucket = async (
    bucketName: string,
    prefix?: string
): Promise<DriveIndexResponse> => {
    try {
        const config: AxiosRequestConfig = {
            method: 'post',
            url: `/api/drive/index/${bucketName}`,
            headers: {
                'Content-Type': 'application/json',
            },
            data: { prefix },
        };
        const response = await axiosCustom.request(config);
        return response.data;
    } catch (error) {
        console.error('Error reindexing bucket:', error);
        throw error;
    }
};

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

export const driveGetFileUrl = (bucketName: string, fileKey: string): string => {
    const params = new URLSearchParams();
    params.append('bucketName', bucketName);
    params.append('fileKey', fileKey);
    return `${axiosCustom.defaults.baseURL}/api/drive/file?${params.toString()}`;
};

export const driveUpdateFile = async (params: {
    bucketName: string;
    fileKey: string;
    content: string;
}): Promise<{ success: boolean }> => {
    try {
        const config: AxiosRequestConfig = {
            method: 'put',
            url: '/api/drive/file',
            headers: {
                'Content-Type': 'application/json',
            },
            data: params,
        };
        const response = await axiosCustom.request(config);
        return response.data;
    } catch (error) {
        console.error('Error updating file:', error);
        throw error;
    }
};

export const driveDeleteFile = async (params: {
    bucketName: string;
    fileKey: string;
}): Promise<{ success: boolean }> => {
    try {
        const queryParams = new URLSearchParams();
        queryParams.append('bucketName', params.bucketName);
        queryParams.append('fileKey', params.fileKey);

        const config: AxiosRequestConfig = {
            method: 'delete',
            url: `/api/drive/file?${queryParams.toString()}`,
        };
        const response = await axiosCustom.request(config);
        return response.data;
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
};

