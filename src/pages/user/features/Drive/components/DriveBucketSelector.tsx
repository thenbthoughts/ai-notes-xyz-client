import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { LucideDatabase } from 'lucide-react';
import { DriveBucket } from '../../../../../types/pages/Drive.types';
import { jotaiDriveCurrentBucket, jotaiDriveCurrentPath } from '../stateJotai/driveStateJotai';
import { driveGetBuckets } from '../utils/driveAxios';

const DriveBucketSelector = () => {
    const [buckets, setBuckets] = useState<DriveBucket[]>([]);
    const [currentBucket, setCurrentBucket] = useAtom(jotaiDriveCurrentBucket);
    const [, setCurrentPath] = useAtom(jotaiDriveCurrentPath);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBuckets = async () => {
            try {
                const response = await driveGetBuckets();
                const list = response?.buckets ?? [];
                setBuckets(list);
                if (list.length > 0 && !currentBucket) {
                    setCurrentBucket(list[0].bucketName);
                }
            } catch {
                toast.error('Failed to load storage buckets');
            } finally {
                setLoading(false);
            }
        };

        fetchBuckets();
        // Intentionally run once on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleBucketChange = (bucketName: string) => {
        setCurrentBucket(bucketName);
        setCurrentPath('');
    };

    if (loading) {
        return (
            <div className="h-9 w-44 animate-pulse rounded-lg bg-slate-200" aria-hidden />
        );
    }

    if (buckets.length === 0) {
        return (
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                <LucideDatabase size={16} />
                <span>No buckets configured.</span>
                <Link to="/user/setting/s3-buckets" className="font-medium underline underline-offset-2">
                    Add in Settings
                </Link>
            </div>
        );
    }

    return (
        <label className="inline-flex items-center gap-2 text-sm text-slate-600">
            <LucideDatabase size={16} className="text-slate-400" />
            <select
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition hover:bg-slate-50 focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                value={currentBucket}
                onChange={(e) => handleBucketChange(e.target.value)}
                aria-label="Storage bucket"
            >
                {buckets.map((bucket) => (
                    <option key={bucket._id} value={bucket.bucketName}>
                        {bucket.bucketName}
                        {bucket.prefix ? ` / ${bucket.prefix}` : ''}
                    </option>
                ))}
            </select>
        </label>
    );
};

export default DriveBucketSelector;
