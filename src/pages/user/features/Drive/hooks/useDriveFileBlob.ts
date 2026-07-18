import { useEffect, useRef, useState } from 'react';
import { driveFetchFileBlob } from '../utils/driveAxios';

/**
 * Loads a Drive file via authenticated axios and exposes an object URL.
 * Revokes the URL on change/unmount.
 */
export const useDriveFileBlob = (
    bucketName: string,
    fileKey: string,
    enabled = true
) => {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(enabled);
    const [error, setError] = useState<string | null>(null);
    const blobUrlRef = useRef<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        if (blobUrlRef.current) {
            URL.revokeObjectURL(blobUrlRef.current);
            blobUrlRef.current = null;
        }
        setBlobUrl(null);
        setError(null);

        if (!enabled || !bucketName || !fileKey) {
            setLoading(false);
            return;
        }

        setLoading(true);
        driveFetchFileBlob(bucketName, fileKey)
            .then((blob) => {
                if (cancelled) return;
                const url = URL.createObjectURL(blob);
                blobUrlRef.current = url;
                setBlobUrl(url);
            })
            .catch((err) => {
                if (cancelled) return;
                console.error('Drive file load failed', err);
                setError(err instanceof Error ? err.message : 'Failed to load file');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
                blobUrlRef.current = null;
            }
        };
    }, [bucketName, fileKey, enabled]);

    return { blobUrl, loading, error };
};
