import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import toast from 'react-hot-toast';
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
                setBuckets(response.buckets);
                if (response.buckets.length > 0 && !currentBucket) {
                    setCurrentBucket(response.buckets[0].bucketName);
                }
            } catch (error) {
                toast.error('Failed to load buckets');
            } finally {
                setLoading(false);
            }
        };

        fetchBuckets();
    }, []);

    const handleBucketChange = (bucketName: string) => {
        setCurrentBucket(bucketName);
        setCurrentPath(''); // Reset path when changing buckets
    };

    if (loading) {
        return (
            <select className="p-2 border border-gray-300 rounded-sm bg-gray-100" disabled>
                <option>Loading buckets...</option>
            </select>
        );
    }

    if (buckets.length === 0) {
        return (
            <div className="p-2 border border-gray-300 rounded-sm bg-yellow-50 text-yellow-800">
                No buckets configured. Please add a bucket in settings.
            </div>
        );
    }

    return (
        <select
            className="p-2 border border-gray-300 rounded-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={currentBucket}
            onChange={(e) => handleBucketChange(e.target.value)}
        >
            {buckets.map((bucket) => (
                <option key={bucket._id} value={bucket.bucketName}>
                    {bucket.bucketName} {bucket.prefix ? `(${bucket.prefix})` : ''}
                </option>
            ))}
        </select>
    );
};

export default DriveBucketSelector;

