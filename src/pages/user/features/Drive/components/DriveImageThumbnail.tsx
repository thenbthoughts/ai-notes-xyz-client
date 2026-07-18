import { useEffect, useRef, useState } from 'react';
import { LucideImage } from 'lucide-react';
import { DriveFile } from '../../../../../types/pages/Drive.types';
import { isImageFile } from '../utils/driveFileUtils';
import { useDriveFileBlob } from '../hooks/useDriveFileBlob';

interface DriveImageThumbnailProps {
    file: DriveFile;
    bucketName: string;
    className?: string;
    iconSize?: number;
    lazy?: boolean;
}

const DriveImageThumbnail = ({
    file,
    bucketName,
    className = 'flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-slate-50',
    iconSize = 44,
    lazy = true,
}: DriveImageThumbnailProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(!lazy);
    const isImage = isImageFile(file);

    useEffect(() => {
        if (!lazy || !isImage || !containerRef.current) {
            return;
        }

        const node = containerRef.current;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '120px' }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [lazy, isImage]);

    const { blobUrl, loading, error } = useDriveFileBlob(
        bucketName,
        file.fileKey,
        isImage && visible
    );

    if (!isImage) {
        return null;
    }

    return (
        <div ref={containerRef} className={className}>
            {loading && (
                <div className="h-full w-full animate-pulse bg-slate-200/80" aria-hidden />
            )}
            {!loading && blobUrl && !error && (
                <img
                    src={blobUrl}
                    alt={file.fileName}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    draggable={false}
                />
            )}
            {!loading && (!blobUrl || error) && (
                <LucideImage size={iconSize} className="text-emerald-600" aria-hidden />
            )}
        </div>
    );
};

export default DriveImageThumbnail;
