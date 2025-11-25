import { DriveFile } from '../../../../../types/pages/Drive.types';
import { driveGetFileUrl } from '../utils/driveAxios';
import { LucideX } from 'lucide-react';

interface DriveVideoViewerProps {
    file: DriveFile;
    bucketName: string;
    onClose: () => void;
}

const DriveVideoViewer = ({ file, bucketName, onClose }: DriveVideoViewerProps) => {
    const videoUrl = driveGetFileUrl(bucketName, file.fileKey);

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div className="relative max-w-7xl max-h-full p-4" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-200 transition z-10"
                >
                    <LucideX size={24} />
                </button>
                <video
                    src={videoUrl}
                    controls
                    className="max-w-full max-h-[90vh]"
                    autoPlay
                >
                    Your browser does not support the video tag.
                </video>
                <div className="text-white text-center mt-2">{file.fileName}</div>
            </div>
        </div>
    );
};

export default DriveVideoViewer;

