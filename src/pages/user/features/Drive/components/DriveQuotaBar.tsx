import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { LucideHardDrive } from 'lucide-react';
import { jotaiDriveCurrentBucket, jotaiDriveRefresh } from '../stateJotai/driveStateJotai';
import { driveGetQuota } from '../utils/driveAxios';
import { formatFileSize } from '../utils/driveFileUtils';

const DriveQuotaBar = () => {
    const [currentBucket] = useAtom(jotaiDriveCurrentBucket);
    const [refresh] = useAtom(jotaiDriveRefresh);
    const [totalBytes, setTotalBytes] = useState(0);
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!currentBucket) {
            setTotalBytes(0);
            setCount(0);
            return;
        }
        const fetch = async () => {
            try {
                const res = await driveGetQuota(currentBucket);
                setTotalBytes(res.totalBytes || 0);
                setCount(res.count || 0);
            } catch {
                setTotalBytes(0);
                setCount(0);
            }
        };
        fetch();
    }, [currentBucket, refresh]);

    if (!currentBucket) return null;

    return (
        <div className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-400">
            <LucideHardDrive size={14} className="text-zinc-500" />
            <span>{count} file{count === 1 ? '' : 's'}</span>
            <span className="h-3 w-px bg-zinc-700" />
            <span>{formatFileSize(totalBytes)} used</span>
            <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-zinc-800 sm:block">
                <div className="h-full bg-sky-600" style={{ width: `${Math.min(100, (totalBytes / (1024 * 1024 * 1024 * 5)) * 100)}%` }} />
            </div>
        </div>
    );
};

export default DriveQuotaBar;
