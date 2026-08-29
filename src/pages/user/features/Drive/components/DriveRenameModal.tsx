import { useEffect, useState } from 'react';
import { LucideEdit3, LucideX } from 'lucide-react';
import toast from 'react-hot-toast';
import { DriveFile } from '../../../../../types/pages/Drive.types';
import { driveRename } from '../utils/driveAxios';
import { validateDrivePathSegment } from '../utils/drivePathValidation';

interface DriveRenameModalProps {
    isOpen: boolean;
    onClose: () => void;
    bucketName: string;
    file: DriveFile | null;
    onSuccess: () => void;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
    if (typeof error === 'object' && error && 'response' in error) {
        const data = (error as { response?: { data?: { message?: string } } }).response?.data;
        if (data?.message) return data.message;
    }
    if (error instanceof Error && error.message) return error.message;
    return fallback;
};

const DriveRenameModal = ({ isOpen, onClose, bucketName, file, onSuccess }: DriveRenameModalProps) => {
    const [name, setName] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen && file) setName(file.fileName);
    }, [isOpen, file]);

    if (!isOpen || !file) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const v = validateDrivePathSegment(name.trim(), file.isFolder ? 'folder' : 'file');
        if (!v.valid) {
            toast.error(v.error);
            return;
        }
        setSaving(true);
        try {
            await driveRename({ bucketName, fileKey: file.fileKey, newName: v.normalized });
            toast.success('Renamed');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to rename'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 p-4" onClick={() => !saving && onClose()}>
            <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
                    <div className="flex items-center gap-2">
                        <LucideEdit3 size={18} className="text-sky-600" />
                        <h2 className="text-sm font-semibold text-zinc-100">Rename {file.isFolder ? 'folder' : 'file'}</h2>
                    </div>
                    <button type="button" onClick={onClose} disabled={saving} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800" aria-label="Close">
                        <LucideX size={18} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} autoFocus className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-900" aria-label="New name" />
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} disabled={saving} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800">Cancel</button>
                        <button type="submit" disabled={saving || !name.trim() || name.trim() === file.fileName} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50">{saving ? 'Saving…' : 'Rename'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DriveRenameModal;
