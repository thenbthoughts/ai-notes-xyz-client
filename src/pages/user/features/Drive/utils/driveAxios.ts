import { AxiosRequestConfig } from 'axios';
import axiosCustom from '../../../../../config/axiosCustom';
import {
    DriveBucket,
    DriveBucketsResponse,
    DriveFile,
    DriveIndexResponse,
} from '../../../../../types/pages/Drive.types';

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

export const driveGetFileUrl = (bucketName: string, fileKey: string): string => {
    const params = new URLSearchParams();
    params.append('bucketName', bucketName);
    params.append('fileKey', fileKey);
    return `${axiosCustom.defaults.baseURL}/api/drive/file?${params.toString()}`;
};

const parseBlobErrorMessage = async (data: unknown, fallback: string): Promise<string> => {
    try {
        if (data instanceof Blob) {
            const text = await data.text();
            try {
                const j = JSON.parse(text) as { message?: string };
                if (typeof j.message === 'string' && j.message.trim()) {
                    return j.message;
                }
            } catch {
                if (text.trim()) return text.slice(0, 200);
            }
        } else if (typeof data === 'object' && data && 'message' in data) {
            const msg = (data as { message?: unknown }).message;
            if (typeof msg === 'string' && msg.trim()) return msg;
        }
    } catch {
        // ignore parse failures
    }
    return fallback;
};

/** Authenticated file fetch (cookies) — required for Capacitor / cross-origin SPA. */
export const driveFetchFileBlob = async (
    bucketName: string,
    fileKey: string
): Promise<Blob> => {
    try {
        const response = await axiosCustom.get<Blob>('/api/drive/file', {
            params: { bucketName, fileKey },
            responseType: 'blob',
            withCredentials: true,
        });
        const ct = (response.headers['content-type'] || '').toLowerCase();
        if (ct.includes('application/json')) {
            throw new Error(await parseBlobErrorMessage(response.data, 'File request failed'));
        }
        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error && !(error as { isAxiosError?: boolean }).isAxiosError) {
            throw error;
        }
        const axiosErr = error as {
            response?: { data?: unknown; status?: number };
            message?: string;
        };
        const fallback =
            axiosErr.message ||
            (axiosErr.response?.status
                ? `File request failed (${axiosErr.response.status})`
                : 'File request failed');
        throw new Error(await parseBlobErrorMessage(axiosErr.response?.data, fallback));
    }
};

export const driveFetchFileText = async (
    bucketName: string,
    fileKey: string
): Promise<string> => {
    const blob = await driveFetchFileBlob(bucketName, fileKey);
    return blob.text();
};

export const driveDownloadFile = async (
    bucketName: string,
    fileKey: string,
    fileName: string
): Promise<void> => {
    const blob = await driveFetchFileBlob(bucketName, fileKey);
    const safeName = fileName.replace(/["\r\n]/g, '_') || 'download';
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = safeName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
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

export const driveGetFolders = async (params: {
    bucketName: string;
}): Promise<{ success: boolean; folders: DriveFile[] }> => {
    try {
        const config: AxiosRequestConfig = {
            method: 'post',
            url: '/api/drive/folders',
            headers: {
                'Content-Type': 'application/json',
            },
            data: params,
        };
        const response = await axiosCustom.request(config);
        return response.data;
    } catch (error) {
        console.error('Error fetching folders:', error);
        throw error;
    }
};

export const driveCreateFile = async (params: {
    bucketName: string;
    folderPath?: string;
    fileName: string;
    fileType: 'txt' | 'md';
    content?: string;
    overwrite?: boolean;
}): Promise<{ success: boolean; file: DriveFile }> => {
    try {
        const config: AxiosRequestConfig = {
            method: 'post',
            url: '/api/drive/file',
            headers: {
                'Content-Type': 'application/json',
            },
            data: params,
        };
        const response = await axiosCustom.request(config);
        return response.data;
    } catch (error) {
        console.error('Error creating file:', error);
        throw error;
    }
};

export const driveUploadFile = async (params: {
    bucketName: string;
    folderPath?: string;
    file: File;
    fileName?: string;
    overwrite?: boolean;
}): Promise<{ success: boolean; file: DriveFile }> => {
    try {
        const formData = new FormData();
        formData.append('file', params.file);
        formData.append('bucketName', params.bucketName);
        formData.append('folderPath', params.folderPath ?? '');
        if (params.fileName) {
            formData.append('fileName', params.fileName);
        }
        if (params.overwrite) {
            formData.append('overwrite', 'true');
        }

        const config: AxiosRequestConfig = {
            method: 'post',
            url: '/api/drive/upload',
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            data: formData,
        };
        const response = await axiosCustom.request(config);
        return response.data;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

export const driveCreateFolder = async (params: { bucketName: string; parentPath?: string; folderName: string }): Promise<{ success: boolean; folder: DriveFile | null }> => {
    try {
        const config: AxiosRequestConfig = { method: 'post', url: '/api/drive/folder', headers: { 'Content-Type': 'application/json' }, data: params };
        const response = await axiosCustom.request(config);
        return response.data;
    } catch (error) {
        console.error('Error creating folder:', error);
        throw error;
    }
};

export const driveRename = async (params: { bucketName: string; fileKey: string; newName: string }): Promise<{ success: boolean; file: DriveFile | null }> => {
    try {
        const config: AxiosRequestConfig = { method: 'post', url: '/api/drive/rename', headers: { 'Content-Type': 'application/json' }, data: params };
        const response = await axiosCustom.request(config);
        return response.data;
    } catch (error) {
        console.error('Error renaming:', error);
        throw error;
    }
};

export const driveMove = async (params: { bucketName: string; fileKeys: string[]; targetPath: string }): Promise<{ success: boolean; results: Array<{ fileKey: string; success: boolean; message?: string }> }> => {
    try {
        const config: AxiosRequestConfig = { method: 'post', url: '/api/drive/move', headers: { 'Content-Type': 'application/json' }, data: params };
        const response = await axiosCustom.request(config);
        return response.data;
    } catch (error) {
        console.error('Error moving:', error);
        throw error;
    }
};

export const driveCopy = async (params: { bucketName: string; fileKeys: string[]; targetPath: string }): Promise<{ success: boolean; results: Array<{ fileKey: string; success: boolean; message?: string }> }> => {
    try {
        const config: AxiosRequestConfig = { method: 'post', url: '/api/drive/copy', headers: { 'Content-Type': 'application/json' }, data: params };
        const response = await axiosCustom.request(config);
        return response.data;
    } catch (error) {
        console.error('Error copying:', error);
        throw error;
    }
};

export const driveBulkAction = async (params: { bucketName: string; action: string; fileKeys: string[]; targetPath?: string }): Promise<{ success: boolean; fileKeys?: string[] }> => {
    try {
        const config: AxiosRequestConfig = { method: 'post', url: '/api/drive/bulk-action', headers: { 'Content-Type': 'application/json' }, data: params };
        const response = await axiosCustom.request(config);
        return response.data;
    } catch (error) {
        console.error('Error bulk action:', error);
        throw error;
    }
};

export const driveGetQuota = async (bucketName: string): Promise<{ success: boolean; totalBytes: number; count: number }> => {
    try {
        const config: AxiosRequestConfig = { method: 'get', url: `/api/drive/quota/${encodeURIComponent(bucketName)}` };
        const response = await axiosCustom.request(config);
        return response.data;
    } catch (error) {
        console.error('Error quota:', error);
        throw error;
    }
};

export const driveGetTrash = async (bucketName: string): Promise<{ success: boolean; files: DriveFile[] }> => {
    try {
        const config: AxiosRequestConfig = { method: 'get', url: `/api/drive/trash/${encodeURIComponent(bucketName)}` };
        const response = await axiosCustom.request(config);
        return response.data;
    } catch (error) {
        console.error('Error trash:', error);
        throw error;
    }
};

export const driveTrashRestore = async (params: { bucketName: string; fileKeys: string[] }): Promise<{ success: boolean }> => {
    try {
        const config: AxiosRequestConfig = { method: 'post', url: '/api/drive/trash/restore', headers: { 'Content-Type': 'application/json' }, data: params };
        const response = await axiosCustom.request(config);
        return response.data;
    } catch (error) {
        console.error('Error restore:', error);
        throw error;
    }
};

export const driveTrashEmpty = async (bucketName: string): Promise<{ success: boolean }> => {
    try {
        const config: AxiosRequestConfig = { method: 'post', url: '/api/drive/trash/empty', headers: { 'Content-Type': 'application/json' }, data: { bucketName } };
        const response = await axiosCustom.request(config);
        return response.data;
    } catch (error) {
        console.error('Error empty trash:', error);
        throw error;
    }
};

export const driveGetVersions = async (params: { bucketName: string; fileKey: string }): Promise<{ success: boolean; versions: Array<{ content: string; savedAt: string; size: number }> }> => {
    try {
        const config: AxiosRequestConfig = { method: 'get', url: '/api/drive/versions', params };
        const response = await axiosCustom.request(config);
        return response.data;
    } catch (error) {
        console.error('Error versions:', error);
        throw error;
    }
};

export const driveCreateShareLink = async (params: { bucketName: string; fileKey: string; expiresInHours?: number }): Promise<{ success: boolean; token: string; shareUrl: string; expiresAt: string }> => {
    try {
        const config: AxiosRequestConfig = { method: 'post', url: '/api/drive/share-link', headers: { 'Content-Type': 'application/json' }, data: params };
        const response = await axiosCustom.request(config);
        return response.data;
    } catch (error) {
        console.error('Error share link:', error);
        throw error;
    }
};

export const driveContentSearch = async (params: { bucketName: string; query: string; page?: number; perPage?: number }): Promise<{ success: boolean; files: DriveFile[]; pagination: { page: number; perPage: number; totalCount: number; totalPages: number } }> => {
    try {
        const config: AxiosRequestConfig = { method: 'post', url: '/api/drive/content-search', headers: { 'Content-Type': 'application/json' }, data: params };
        const response = await axiosCustom.request(config);
        return response.data;
    } catch (error) {
        console.error('Error content search:', error);
        throw error;
    }
};

