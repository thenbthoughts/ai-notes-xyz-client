import { DriveFile } from '../../../../../types/pages/Drive.types';
import { LucideX } from 'lucide-react';
import { useDriveFileBlob } from '../hooks/useDriveFileBlob';

interface DriveVideoViewerProps {
    file: DriveFile;
    bucketName: string;
    onClose: () => void;
}

const DriveVideoViewer = ({ file, bucketName, onClose }: DriveVideoViewerProps) => {
    const { blobUrl, loading, error } = useDriveFileBlob(bucketName, file.fileKey);

    return (
        <div
            className="fixed inset-0 z-[1100] flex items-center justify-center bg-black bg-opacity-75"
            onClick={onClose}
        >
            <div className="relative max-w-7xl max-h-full p-4" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-200 transition z-10"
                >
                    <LucideX size={24} />
                </button>
                {loading && (
                    <div className="text-white text-center py-12">Loading video...</div>
                )}
                {error && (
                    <div className="text-red-300 text-center py-12 bg-black/40 px-4 rounded">
                        {error}
                    </div>
                )}
                {blobUrl && (
                    <video
                        src={blobUrl}
                        controls
                        className="max-w-full max-h-[90vh]"
                        autoPlay
                    >
                        Your browser does not support the video tag.
                    </video>
                )}
                <div className="text-white text-center mt-2">{file.fileName}</div>
            </div>
        </div>
    );
};

export default DriveVideoViewer;
