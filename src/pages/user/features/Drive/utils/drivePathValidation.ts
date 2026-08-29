/**
 * Client-side Drive folder/file path validation (mirrors API rules).
 */

const MAX_SEGMENT_LENGTH = 200;
const MAX_PATH_LENGTH = 900;
const SEGMENT_PATTERN = /^[\w.\-()+@[\] ]+$/;

export type DrivePathValidationResult =
    | { valid: true; normalized: string }
    | { valid: false; error: string };

const normalizeSlashes = (value: string): string =>
    value.replace(/\\/g, '/').replace(/\/+/g, '/').trim();

export const validateDriveFolderPath = (rawPath: string): DrivePathValidationResult => {
    const trimmed = normalizeSlashes(rawPath ?? '');
    if (!trimmed || trimmed === '/') {
        return { valid: true, normalized: '' };
    }

    if (trimmed.startsWith('/')) {
        return { valid: false, error: 'Folder path must be relative (no leading slash)' };
    }

    if (/[\x00-\x1f\x7f]/.test(trimmed)) {
        return { valid: false, error: 'Folder path contains invalid control characters' };
    }

    const withoutTrailing = trimmed.replace(/\/+$/, '');
    if (withoutTrailing.length > MAX_PATH_LENGTH) {
        return { valid: false, error: `Folder path must be at most ${MAX_PATH_LENGTH} characters` };
    }

    const segments = withoutTrailing.split('/').filter((s) => s.length > 0);
    for (const segment of segments) {
        const segmentResult = validateDrivePathSegment(segment, 'folder');
        if (!segmentResult.valid) {
            return segmentResult;
        }
    }

    return { valid: true, normalized: segments.join('/') };
};

export const validateDrivePathSegment = (
    rawName: string,
    kind: 'folder' | 'file' = 'file'
): DrivePathValidationResult => {
    const name = (rawName ?? '').trim();
    if (!name) {
        return { valid: false, error: `${kind === 'folder' ? 'Folder' : 'File'} name is required` };
    }

    if (name.includes('/') || name.includes('\\')) {
        return {
            valid: false,
            error: `${kind === 'folder' ? 'Folder' : 'File'} name cannot contain slashes`,
        };
    }

    if (name === '.' || name === '..') {
        return { valid: false, error: `Invalid ${kind} name` };
    }

    if (/[\x00-\x1f\x7f]/.test(name)) {
        return {
            valid: false,
            error: `${kind === 'folder' ? 'Folder' : 'File'} name contains invalid characters`,
        };
    }

    if (name.length > MAX_SEGMENT_LENGTH) {
        return {
            valid: false,
            error: `${kind === 'folder' ? 'Folder' : 'File'} name must be at most ${MAX_SEGMENT_LENGTH} characters`,
        };
    }

    if (!SEGMENT_PATTERN.test(name)) {
        return {
            valid: false,
            error: `${kind === 'folder' ? 'Folder' : 'File'} name may only contain letters, numbers, spaces, and ._-()+@[]`,
        };
    }

    return { valid: true, normalized: name };
};

export const ensureCreateFileExtension = (
    fileName: string,
    fileType: 'txt' | 'md'
): string => {
    const name = fileName.trim();
    const lower = name.toLowerCase();
    if (fileType === 'txt') {
        return lower.endsWith('.txt') ? name : `${name}.txt`;
    }
    if (lower.endsWith('.md') || lower.endsWith('.markdown')) {
        return name;
    }
    return `${name}.md`;
};
