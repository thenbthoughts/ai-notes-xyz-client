import { useState } from 'react';
import { useAtom } from 'jotai';
import { LucideRefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import {
    jotaiDriveCurrentBucket,
    jotaiDriveCurrentPath,
    jotaiDriveRefresh,
} from '../stateJotai/driveStateJotai';
import { driveReindexBucket } from '../utils/driveAxios';

const DriveReindexButton = () => {
    const [currentBucket] = useAtom(jotaiDriveCurrentBucket);
    const [currentPath] = useAtom(jotaiDriveCurrentPath);
    const [, setRefresh] = useAtom(jotaiDriveRefresh);
    const [indexing, setIndexing] = useState(false);

    const handleReindex = async () => {
        if (!currentBucket) {
            toast.error('Please select a bucket first');
            return;
        }

        setIndexing(true);
        try {
            const result = await driveReindexBucket(currentBucket, currentPath || undefined);
            const indexed = result?.indexed ?? 0;
            const errors = result?.errors ?? 0;
            toast.success(
                `Synced ${indexed} item${indexed === 1 ? '' : 's'}${
                    errors > 0 ? ` (${errors} errors)` : ''
                }`
            );
            setRefresh((prev) => prev + 1);
        } catch {
            toast.error('Failed to sync storage');
        } finally {
            setIndexing(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleReindex}
            disabled={indexing || !currentBucket}
            title={currentPath ? `Sync from current folder` : 'Sync all files from storage'}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
            <LucideRefreshCw size={16} className={indexing ? 'animate-spin text-sky-600' : ''} />
            <span>{indexing ? 'Syncing…' : 'Sync'}</span>
        </button>
    );
};

export default DriveReindexButton;
