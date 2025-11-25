import { DriveFile } from '../../../../../types/pages/Drive.types';
import { driveGetFileUrl } from '../utils/driveAxios';
import { LucideX } from 'lucide-react';

interface DrivePdfViewerProps {
    file: DriveFile;
    bucketName: string;
    onClose: () => void;
}

const DrivePdfViewer = ({ file, bucketName, onClose }: DrivePdfViewerProps) => {
    const pdfUrl = driveGetFileUrl(bucketName, file.fileKey);

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div className="relative w-full h-full p-4" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-200 transition z-10"
                >
                    <LucideX size={24} />
                </button>
                <iframe
                    src={pdfUrl}
                    className="w-full h-full border-0"
                    title={file.fileName}
                />
                <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 px-3 py-1 rounded">
                    {file.fileName}
                </div>
            </div>
        </div>
    );
};

export default DrivePdfViewer;

