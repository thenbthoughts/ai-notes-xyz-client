import { DriveFile } from '../../../../../types/pages/Drive.types';
import {
    LucideFile,
    LucideFileText,
    LucideImage,
    LucideVideo,
    LucideFileType,
    LucideMusic,
    LucideArchive,
    LucideFolder,
    LucideFileCode,
} from 'lucide-react';

export const getFileIcon = (file: DriveFile) => {
    if (file.isFolder) {
        return LucideFolder;
    }

    const ext = file.fileType.toLowerCase();
    const contentType = file.contentType?.toLowerCase() || '';

    // Images
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'].includes(ext) ||
        contentType.startsWith('image/')) {
        return LucideImage;
    }

    // Videos
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v'].includes(ext) ||
        contentType.startsWith('video/')) {
        return LucideVideo;
    }

    // Audio
    if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma'].includes(ext) ||
        contentType.startsWith('audio/')) {
        return LucideMusic;
    }

    // PDF
    if (ext === 'pdf' || contentType === 'application/pdf') {
        return LucideFileType;
    }

    // Archives
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext) ||
        contentType.includes('zip') || contentType.includes('archive')) {
        return LucideArchive;
    }

    // Code files
    if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt'].includes(ext)) {
        return LucideFileCode;
    }

    // Text/Markdown
    if (['txt', 'md', 'markdown', 'rtf'].includes(ext) ||
        contentType.startsWith('text/')) {
        return LucideFileText;
    }

    // Default
    return LucideFile;
};

export const getFileTypeCategory = (file: DriveFile): 'image' | 'video' | 'pdf' | 'text' | 'markdown' | 'other' => {
    if (file.isFolder) {
        return 'other';
    }

    const ext = file.fileType.toLowerCase();
    const contentType = file.contentType?.toLowerCase() || '';

    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext) ||
        contentType.startsWith('image/')) {
        return 'image';
    }

    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(ext) ||
        contentType.startsWith('video/')) {
        return 'video';
    }

    if (ext === 'pdf' || contentType === 'application/pdf') {
        return 'pdf';
    }

    if (['md', 'markdown'].includes(ext) || contentType === 'text/markdown') {
        return 'markdown';
    }

    if (['txt', 'rtf'].includes(ext) || contentType.startsWith('text/')) {
        return 'text';
    }

    return 'other';
};

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const isEditableFile = (file: DriveFile): boolean => {
    if (file.isFolder) return false;
    const category = getFileTypeCategory(file);
    return category === 'text' || category === 'markdown';
};

