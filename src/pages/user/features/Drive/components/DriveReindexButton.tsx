import { useState } from 'react';
import { useAtom } from 'jotai';
import { LucideRefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { jotaiDriveCurrentBucket, jotaiDriveCurrentPath, jotaiDriveRefresh } from '../stateJotai/driveStateJotai';
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
            toast.success(`Indexed ${result.indexed} files${result.errors > 0 ? ` (${result.errors} errors)` : ''}`);
            setRefresh((prev) => prev + 1);
        } catch (error) {
            toast.error('Failed to reindex bucket');
        } finally {
            setIndexing(false);
        }
    };

    return (
        <button
            onClick={handleReindex}
            disabled={indexing || !currentBucket}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <LucideRefreshCw size={18} className={indexing ? 'animate-spin' : ''} />
            <span>{indexing ? 'Indexing...' : 'Reindex'}</span>
        </button>
    );
};

export default DriveReindexButton;

