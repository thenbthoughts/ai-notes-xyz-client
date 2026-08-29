import { useState, useEffect } from 'react';
import { LucideFolderPlus, LucideX } from 'lucide-react';
import toast from 'react-hot-toast';
import { driveCreateFolder } from '../utils/driveAxios';
import { validateDrivePathSegment } from '../utils/drivePathValidation';

interface DriveFolderModalProps {
    isOpen: boolean;
    onClose: () => void;
    bucketName: string;
    parentPath: string;
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

const DriveFolderModal = ({ isOpen, onClose, bucketName, parentPath, onSuccess }: DriveFolderModalProps) => {
    const [name, setName] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (isOpen) setName('');
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const v = validateDrivePathSegment(name.trim(), 'folder');
        if (!v.valid) {
            toast.error(v.error);
            return;
        }
        setCreating(true);
        try {
            await driveCreateFolder({ bucketName, parentPath, folderName: v.normalized });
            toast.success('Folder created');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to create folder'));
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 p-4" onClick={() => !creating && onClose()}>
            <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
                    <div className="flex items-center gap-2">
                        <LucideFolderPlus size={18} className="text-sky-600" />
                        <h2 className="text-sm font-semibold text-zinc-100">New folder</h2>
                    </div>
                    <button type="button" onClick={onClose} disabled={creating} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800" aria-label="Close">
                        <LucideX size={18} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
                    <div className="text-xs text-zinc-500">Parent: <span className="text-zinc-300">{parentPath || '/'}</span></div>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Folder name" autoFocus className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-900" aria-label="Folder name" />
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} disabled={creating} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800">Cancel</button>
                        <button type="submit" disabled={creating || !name.trim()} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50">{creating ? 'Creating…' : 'Create'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DriveFolderModal;
