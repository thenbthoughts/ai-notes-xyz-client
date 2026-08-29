import { useState } from 'react';
import { LucideLink, LucideCopy, LucideX, LucideClock } from 'lucide-react';
import toast from 'react-hot-toast';
import { DriveFile } from '../../../../../types/pages/Drive.types';
import { driveCreateShareLink } from '../utils/driveAxios';

interface DriveShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    bucketName: string;
    file: DriveFile | null;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
    if (typeof error === 'object' && error && 'response' in error) {
        const data = (error as { response?: { data?: { message?: string } } }).response?.data;
        if (data?.message) return data.message;
    }
    if (error instanceof Error && error.message) return error.message;
    return fallback;
};

const DriveShareModal = ({ isOpen, onClose, bucketName, file }: DriveShareModalProps) => {
    const [expiry, setExpiry] = useState(24);
    const [creating, setCreating] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [expiresAt, setExpiresAt] = useState('');

    if (!isOpen || !file) return null;

    const handleCreate = async () => {
        setCreating(true);
        try {
            const res = await driveCreateShareLink({ bucketName, fileKey: file.fileKey, expiresInHours: expiry });
            const fullUrl = `${window.location.origin}${res.shareUrl}`;
            setShareUrl(fullUrl);
            setExpiresAt(res.expiresAt);
            toast.success('Share link created');
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to create share link'));
        } finally {
            setCreating(false);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast.success('Link copied');
        } catch {
            toast.error('Failed to copy');
        }
    };

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
                    <div className="flex items-center gap-2">
                        <LucideLink size={18} className="text-sky-600" />
                        <h2 className="text-sm font-semibold text-zinc-100">Share {file.fileName}</h2>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800" aria-label="Close">
                        <LucideX size={18} />
                    </button>
                </div>
                <div className="space-y-4 px-5 py-4">
                    {!shareUrl ? (
                        <>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-400">Expires in</label>
                                <div className="flex items-center gap-2">
                                    <LucideClock size={16} className="text-zinc-500" />
                                    <select value={expiry} onChange={(e) => setExpiry(Number(e.target.value))} className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100" aria-label="Expiry">
                                        <option value={1}>1 hour</option>
                                        <option value={24}>24 hours</option>
                                        <option value={72}>3 days</option>
                                        <option value={168}>7 days</option>
                                        <option value={720}>30 days</option>
                                    </select>
                                </div>
                            </div>
                            <button type="button" onClick={handleCreate} disabled={creating} className="w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50">{creating ? 'Creating…' : 'Create share link'}</button>
                        </>
                    ) : (
                        <>
                            <div className="rounded-lg border border-zinc-700 bg-zinc-950 p-3">
                                <div className="break-all text-sm text-sky-300">{shareUrl}</div>
                                <div className="mt-2 text-xs text-zinc-500">Expires: {expiresAt ? new Date(expiresAt).toLocaleString() : ''}</div>
                            </div>
                            <button type="button" onClick={handleCopy} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-700" aria-label="Copy share link">
                                <LucideCopy size={16} /> Copy link
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DriveShareModal;
