import { useEffect, useState } from 'react';
import { LucideFilePlus, LucideX } from 'lucide-react';
import toast from 'react-hot-toast';
import { driveCreateFile } from '../utils/driveAxios';
import {
    ensureCreateFileExtension,
    validateDriveFolderPath,
    validateDrivePathSegment,
} from '../utils/drivePathValidation';
import DriveFolderPathField from './DriveFolderPathField';

interface DriveCreateFileModalProps {
    isOpen: boolean;
    onClose: () => void;
    bucketName: string;
    initialFolderPath: string;
    onSuccess: (folderPath: string) => void;
}

const getAxiosErrorMessage = (error: unknown, fallback: string): string => {
    if (typeof error === 'object' && error && 'response' in error) {
        const data = (error as { response?: { data?: { message?: string } } }).response?.data;
        if (data?.message) return data.message;
    }
    if (error instanceof Error && error.message) return error.message;
    return fallback;
};

const DriveCreateFileModal = ({
    isOpen,
    onClose,
    bucketName,
    initialFolderPath,
    onSuccess,
}: DriveCreateFileModalProps) => {
    const [folderPath, setFolderPath] = useState(initialFolderPath);
    const [fileName, setFileName] = useState('');
    const [fileType, setFileType] = useState<'txt' | 'md'>('txt');
    const [content, setContent] = useState('');
    const [overwrite, setOverwrite] = useState(false);
    const [creating, setCreating] = useState(false);
    const [nameError, setNameError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setFolderPath(initialFolderPath);
            setFileName('');
            setFileType('txt');
            setContent('');
            setOverwrite(false);
            setNameError(null);
        }
    }, [isOpen, initialFolderPath]);

    useEffect(() => {
        if (!fileName.trim()) {
            setNameError(null);
            return;
        }
        const withExt = ensureCreateFileExtension(fileName, fileType);
        const result = validateDrivePathSegment(withExt, 'file');
        setNameError(result.valid ? null : result.error);
    }, [fileName, fileType]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const folderResult = validateDriveFolderPath(folderPath);
        if (!folderResult.valid) {
            toast.error(folderResult.error);
            return;
        }

        if (!fileName.trim()) {
            toast.error('File name is required');
            return;
        }

        const withExt = ensureCreateFileExtension(fileName, fileType);
        const nameResult = validateDrivePathSegment(withExt, 'file');
        if (!nameResult.valid) {
            toast.error(nameResult.error);
            return;
        }

        setCreating(true);
        try {
            await driveCreateFile({
                bucketName,
                folderPath: folderResult.normalized,
                fileName: nameResult.normalized,
                fileType,
                content,
                overwrite,
            });
            toast.success(`${fileType === 'md' ? 'Markdown' : 'Text'} file created`);
            onSuccess(folderResult.normalized);
            onClose();
        } catch (error) {
            toast.error(getAxiosErrorMessage(error, 'Failed to create file'));
        } finally {
            setCreating(false);
        }
    };

    const previewName = fileName.trim()
        ? ensureCreateFileExtension(fileName, fileType)
        : `untitled.${fileType === 'md' ? 'md' : 'txt'}`;

    return (
        <div
            className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 p-4"
            onClick={() => !creating && onClose()}
        >
            <div
                className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-slate-200 bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div className="flex items-center gap-2">
                        <LucideFilePlus size={18} className="text-sky-600" />
                        <h2 className="text-lg font-semibold text-slate-900">Create file</h2>
                    </div>
                    <button
                        type="button"
                        disabled={creating}
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                        aria-label="Close"
                    >
                        <LucideX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                    <div className="space-y-4 overflow-y-auto px-5 py-4">
                        <DriveFolderPathField
                            bucketName={bucketName}
                            value={folderPath}
                            onChange={setFolderPath}
                            disabled={creating}
                        />

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Type</label>
                            <div className="flex overflow-hidden rounded-lg border border-slate-200">
                                <button
                                    type="button"
                                    disabled={creating}
                                    onClick={() => setFileType('txt')}
                                    className={`flex-1 px-3 py-2 text-sm transition ${
                                        fileType === 'txt'
                                            ? 'bg-sky-600 text-white'
                                            : 'bg-white text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    Text (.txt)
                                </button>
                                <button
                                    type="button"
                                    disabled={creating}
                                    onClick={() => setFileType('md')}
                                    className={`flex-1 px-3 py-2 text-sm transition ${
                                        fileType === 'md'
                                            ? 'bg-sky-600 text-white'
                                            : 'bg-white text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    Markdown (.md)
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">File name</label>
                            <input
                                type="text"
                                value={fileName}
                                disabled={creating}
                                onChange={(e) => setFileName(e.target.value)}
                                placeholder={fileType === 'md' ? 'notes.md' : 'notes.txt'}
                                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
                                    nameError
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                                        : 'border-slate-200 focus:border-sky-500 focus:ring-sky-100'
                                }`}
                            />
                            {nameError ? (
                                <p className="text-xs text-red-600">{nameError}</p>
                            ) : (
                                <p className="text-xs text-slate-400">
                                    Will be saved as{' '}
                                    <span className="font-mono text-slate-600">{previewName}</span>
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">
                                Content{' '}
                                <span className="font-normal text-slate-400">(optional)</span>
                            </label>
                            <textarea
                                value={content}
                                disabled={creating}
                                onChange={(e) => setContent(e.target.value)}
                                rows={6}
                                placeholder={
                                    fileType === 'md' ? '# Title\n\nStart writing…' : 'Start writing…'
                                }
                                className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                            />
                        </div>

                        <label className="flex items-center gap-2 text-sm text-slate-600">
                            <input
                                type="checkbox"
                                checked={overwrite}
                                disabled={creating}
                                onChange={(e) => setOverwrite(e.target.checked)}
                                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                            />
                            Overwrite if a file with the same name exists
                        </label>
                    </div>

                    <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
                        <button
                            type="button"
                            disabled={creating}
                            onClick={onClose}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={creating || !fileName.trim() || !!nameError}
                            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <LucideFilePlus size={16} />
                            {creating ? 'Creating…' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DriveCreateFileModal;
