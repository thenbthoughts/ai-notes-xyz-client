export interface DriveBucket {
    _id: string;
    bucketName: string;
    endpoint: string;
    region: string;
    prefix: string;
    isActive: boolean;
    createdAtUtc?: string;
    updatedAtUtc?: string;
}

export interface DriveFile {
    _id: string;
    fileKey: string;
    fileKeyArr: string[];
    filePath: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    contentType?: string;
    isFolder: boolean;
    parentPath: string;
    lastModified?: string;
    indexedAt: string;
}

export interface DriveFilesResponse {
    success: boolean;
    files: DriveFile[];
    pagination: {
        page: number;
        perPage: number;
        totalCount: number;
        totalPages: number;
    };
}

export interface DriveBucketsResponse {
    success: boolean;
    buckets: DriveBucket[];
}

export interface DriveIndexResponse {
    success: boolean;
    indexed: number;
    errors: number;
}

export type ViewMode = 'grid' | 'list';

