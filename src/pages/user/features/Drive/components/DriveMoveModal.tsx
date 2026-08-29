import { useEffect, useState } from 'react';
import { LucideFolderInput, LucideCopy, LucideX } from 'lucide-react';
import toast from 'react-hot-toast';
import { DriveFile } from '../../../../../types/pages/Drive.types';
import { driveMove, driveCopy, driveGetFolders } from '../utils/driveAxios';

interface DriveMoveModalProps {
    isOpen: boolean;
    onClose: () => void;
    bucketName: string;
    fileKeys: string[];
    mode: 'move' | 'copy';
    currentPath: string;
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

const DriveMoveModal = ({ isOpen, onClose, bucketName, fileKeys, mode, currentPath, onSuccess }: DriveMoveModalProps) => {
    const [targetPath, setTargetPath] = useState(currentPath);
    const [folders, setFolders] = useState<DriveFile[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTargetPath(currentPath);
            const fetch = async () => {
                try {
                    const res = await driveGetFolders({ bucketName });
                    setFolders(res.folders || []);
                } catch {
                    setFolders([]);
                }
            };
            fetch();
        }
    }, [isOpen, bucketName, currentPath]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const action = mode === 'move' ? driveMove : driveCopy;
            await action({ bucketName, fileKeys, targetPath });
            toast.success(mode === 'move' ? 'Moved' : 'Copied');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(getErrorMessage(error, `Failed to ${mode}`));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 p-4" onClick={() => !saving && onClose()}>
            <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
                    <div className="flex items-center gap-2">
                        {mode === 'move' ? <LucideFolderInput size={18} className="text-sky-600" /> : <LucideCopy size={18} className="text-sky-600" />}
                        <h2 className="text-sm font-semibold text-zinc-100">{mode === 'move' ? 'Move' : 'Copy'} {fileKeys.length} item{fileKeys.length === 1 ? '' : 's'}</h2>
                    </div>
                    <button type="button" onClick={onClose} disabled={saving} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800" aria-label="Close">
                        <LucideX size={18} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-400">Target folder</label>
                        <select value={targetPath} onChange={(e) => setTargetPath(e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none" aria-label="Target folder">
                            <option value="">/ (Root)</option>
                            {folders.map((f) => (
                                <option key={f.fileKey} value={f.filePath}>{f.filePath}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} disabled={saving} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800">Cancel</button>
                        <button type="submit" disabled={saving} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50">{saving ? (mode === 'move' ? 'Moving…' : 'Copying…') : mode === 'move' ? 'Move' : 'Copy'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DriveMoveModal;
