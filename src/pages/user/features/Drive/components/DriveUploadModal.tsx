import { useEffect, useRef, useState } from 'react';
import { LucideUpload, LucideX } from 'lucide-react';
import toast from 'react-hot-toast';
import { driveUploadFile } from '../utils/driveAxios';
import {
    validateDriveFolderPath,
    validateDrivePathSegment,
} from '../utils/drivePathValidation';
import DriveFolderPathField from './DriveFolderPathField';

interface DriveUploadModalProps {
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

const DriveUploadModal = ({
    isOpen,
    onClose,
    bucketName,
    initialFolderPath,
    onSuccess,
}: DriveUploadModalProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [folderPath, setFolderPath] = useState(initialFolderPath);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [customName, setCustomName] = useState('');
    const [overwrite, setOverwrite] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFolderPath(initialFolderPath);
            setSelectedFile(null);
            setCustomName('');
            setOverwrite(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }, [isOpen, initialFolderPath]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const folderResult = validateDriveFolderPath(folderPath);
        if (!folderResult.valid) {
            toast.error(folderResult.error);
            return;
        }

        if (!selectedFile) {
            toast.error('Please choose a file to upload');
            return;
        }

        const nameToUse = customName.trim() || selectedFile.name;
        const nameResult = validateDrivePathSegment(nameToUse, 'file');
        if (!nameResult.valid) {
            toast.error(nameResult.error);
            return;
        }

        setUploading(true);
        try {
            await driveUploadFile({
                bucketName,
                folderPath: folderResult.normalized,
                file: selectedFile,
                fileName: nameResult.normalized,
                overwrite,
            });
            toast.success('File uploaded');
            onSuccess(folderResult.normalized);
            onClose();
        } catch (error) {
            toast.error(getAxiosErrorMessage(error, 'Failed to upload file'));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 p-4"
            onClick={() => !uploading && onClose()}
        >
            <div
                className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div className="flex items-center gap-2">
                        <LucideUpload size={18} className="text-sky-600" />
                        <h2 className="text-lg font-semibold text-slate-900">Upload file</h2>
                    </div>
                    <button
                        type="button"
                        disabled={uploading}
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                        aria-label="Close"
                    >
                        <LucideX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
                    <DriveFolderPathField
                        bucketName={bucketName}
                        value={folderPath}
                        onChange={setFolderPath}
                        disabled={uploading}
                    />

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">File</label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            disabled={uploading}
                            onChange={(e) => {
                                const file = e.target.files?.[0] ?? null;
                                setSelectedFile(file);
                                if (file && !customName) {
                                    setCustomName(file.name);
                                }
                            }}
                            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-sky-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-sky-700 hover:file:bg-sky-100"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">
                            File name <span className="font-normal text-slate-400">(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={customName}
                            disabled={uploading}
                            onChange={(e) => setCustomName(e.target.value)}
                            placeholder="Keep original name if empty"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        />
                    </div>

                    <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input
                            type="checkbox"
                            checked={overwrite}
                            disabled={uploading}
                            onChange={(e) => setOverwrite(e.target.checked)}
                            className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                        Overwrite if a file with the same name exists
                    </label>

                    <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                        <button
                            type="button"
                            disabled={uploading}
                            onClick={onClose}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={uploading || !selectedFile}
                            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <LucideUpload size={16} />
                            {uploading ? 'Uploading…' : 'Upload'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DriveUploadModal;
