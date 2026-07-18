import { DriveFile } from '../../../../../types/pages/Drive.types';
import { LucideX } from 'lucide-react';
import { useDriveFileBlob } from '../hooks/useDriveFileBlob';

interface DrivePdfViewerProps {
    file: DriveFile;
    bucketName: string;
    onClose: () => void;
}

const DrivePdfViewer = ({ file, bucketName, onClose }: DrivePdfViewerProps) => {
    const { blobUrl, loading, error } = useDriveFileBlob(bucketName, file.fileKey);

    return (
        <div
            className="fixed inset-0 z-[1100] flex items-center justify-center bg-black bg-opacity-75"
            onClick={onClose}
        >
            <div className="relative w-full h-full p-4" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-200 transition z-10"
                >
                    <LucideX size={24} />
                </button>
                {loading && (
                    <div className="flex items-center justify-center h-full text-white">
                        Loading PDF...
                    </div>
                )}
                {error && (
                    <div className="flex items-center justify-center h-full text-red-300">
                        {error}
                    </div>
                )}
                {blobUrl && (
                    <iframe
                        src={blobUrl}
                        className="w-full h-full border-0"
                        title={file.fileName}
                    />
                )}
                <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 px-3 py-1 rounded">
                    {file.fileName}
                </div>
            </div>
        </div>
    );
};

export default DrivePdfViewer;
