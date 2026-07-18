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

    const ext = (file.fileType || '').toLowerCase();
    const contentType = file.contentType?.toLowerCase() || '';

    if (
        ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'].includes(ext) ||
        contentType.startsWith('image/')
    ) {
        return LucideImage;
    }

    if (
        ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v'].includes(ext) ||
        contentType.startsWith('video/')
    ) {
        return LucideVideo;
    }

    if (
        ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma'].includes(ext) ||
        contentType.startsWith('audio/')
    ) {
        return LucideMusic;
    }

    if (ext === 'pdf' || contentType === 'application/pdf') {
        return LucideFileType;
    }

    if (
        ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext) ||
        contentType.includes('zip') ||
        contentType.includes('archive')
    ) {
        return LucideArchive;
    }

    if (
        ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt'].includes(
            ext
        )
    ) {
        return LucideFileCode;
    }

    if (['txt', 'md', 'markdown', 'rtf'].includes(ext) || contentType.startsWith('text/')) {
        return LucideFileText;
    }

    return LucideFile;
};

export const getFileIconClass = (file: DriveFile): string => {
    if (file.isFolder) return 'text-amber-500 fill-amber-400/30';

    const ext = (file.fileType || '').toLowerCase();
    const contentType = file.contentType?.toLowerCase() || '';

    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'].includes(ext) || contentType.startsWith('image/')) {
        return 'text-emerald-600';
    }
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v'].includes(ext) || contentType.startsWith('video/')) {
        return 'text-violet-600';
    }
    if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma'].includes(ext) || contentType.startsWith('audio/')) {
        return 'text-pink-600';
    }
    if (ext === 'pdf' || contentType === 'application/pdf') {
        return 'text-red-600';
    }
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) {
        return 'text-orange-600';
    }
    if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs'].includes(ext)) {
        return 'text-sky-600';
    }
    if (['md', 'markdown', 'txt'].includes(ext)) {
        return 'text-slate-600';
    }
    return 'text-slate-500';
};

export const getFileTypeCategory = (
    file: DriveFile
): 'image' | 'video' | 'pdf' | 'text' | 'markdown' | 'other' => {
    if (file.isFolder) {
        return 'other';
    }

    const ext = (file.fileType || '').toLowerCase();
    const contentType = file.contentType?.toLowerCase() || '';

    if (
        ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext) ||
        contentType.startsWith('image/')
    ) {
        return 'image';
    }

    if (
        ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(ext) ||
        contentType.startsWith('video/')
    ) {
        return 'video';
    }

    if (ext === 'pdf' || contentType === 'application/pdf') {
        return 'pdf';
    }

    if (['md', 'markdown'].includes(ext) || contentType === 'text/markdown') {
        return 'markdown';
    }

    if (
        [
            'txt',
            'rtf',
            'log',
            'csv',
            'json',
            'xml',
            'yml',
            'yaml',
            'toml',
            'ini',
            'cfg',
            'conf',
            'js',
            'ts',
            'jsx',
            'tsx',
            'mjs',
            'cjs',
            'py',
            'java',
            'cpp',
            'c',
            'h',
            'hpp',
            'cs',
            'php',
            'rb',
            'go',
            'rs',
            'swift',
            'kt',
            'sh',
            'bash',
            'zsh',
            'ps1',
            'sql',
            'html',
            'htm',
            'css',
            'scss',
            'less',
            'vue',
            'svelte',
        ].includes(ext) ||
        contentType.startsWith('text/') ||
        contentType === 'application/json' ||
        contentType === 'application/javascript' ||
        contentType === 'application/typescript'
    ) {
        return 'text';
    }

    return 'other';
};

export const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '—';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
};

export const formatModifiedDate = (value?: string): string => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const isEditableFile = (file: DriveFile): boolean => {
    if (file.isFolder) return false;
    const category = getFileTypeCategory(file);
    return category === 'text' || category === 'markdown';
};

export const FILE_TYPE_FILTER_OPTIONS = [
    { value: 'image', label: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'] },
    { value: 'video', label: 'Videos', extensions: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'] },
    { value: 'audio', label: 'Audio', extensions: ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'] },
    { value: 'pdf', label: 'PDFs', extensions: ['pdf'] },
    {
        value: 'document',
        label: 'Documents',
        extensions: ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf'],
    },
    {
        value: 'code',
        label: 'Code',
        extensions: ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs'],
    },
    { value: 'archive', label: 'Archives', extensions: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'] },
    { value: 'markdown', label: 'Markdown', extensions: ['md', 'markdown'] },
] as const;
