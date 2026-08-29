import toast from 'react-hot-toast';
import { DriveFile } from '../../../../../types/pages/Drive.types';
import { getFileTypeCategory } from '../utils/driveFileUtils';
import { driveDownloadFile } from '../utils/driveAxios';
import DriveImageViewer from '../viewers/DriveImageViewer';
import DriveVideoViewer from '../viewers/DriveVideoViewer';
import DrivePdfViewer from '../viewers/DrivePdfViewer';
import DriveTextEditor from '../editors/DriveTextEditor';
import DriveMarkdownEditor from '../editors/DriveMarkdownEditor';

type ViewerType = 'image' | 'video' | 'pdf' | 'text' | 'markdown' | null;

interface DrivePreviewHostProps {
    selectedFile: DriveFile | null;
    viewerType: ViewerType;
    bucketName: string;
    onClose: () => void;
    onSave?: () => void;
}

const DrivePreviewHost = ({
    selectedFile,
    viewerType,
    bucketName,
    onClose,
    onSave,
}: DrivePreviewHostProps) => {
    if (!selectedFile || !viewerType) return null;

    switch (viewerType) {
        case 'image':
            return (
                <DriveImageViewer file={selectedFile} bucketName={bucketName} onClose={onClose} />
            );
        case 'video':
            return (
                <DriveVideoViewer file={selectedFile} bucketName={bucketName} onClose={onClose} />
            );
        case 'pdf':
            return (
                <DrivePdfViewer file={selectedFile} bucketName={bucketName} onClose={onClose} />
            );
        case 'text':
            return (
                <DriveTextEditor
                    file={selectedFile}
                    bucketName={bucketName}
                    onClose={onClose}
                    onSave={onSave}
                />
            );
        case 'markdown':
            return (
                <DriveMarkdownEditor
                    file={selectedFile}
                    bucketName={bucketName}
                    onClose={onClose}
                    onSave={onSave}
                />
            );
        default:
            return null;
    }
};

export const openDriveFile = async (
    file: DriveFile,
    currentBucket: string,
    setSelectedFile: (file: DriveFile | null) => void,
    setViewerType: (type: ViewerType) => void
) => {
    if (file.isFolder) return;

    const category = getFileTypeCategory(file);
    setSelectedFile(file);

    switch (category) {
        case 'image':
            setViewerType('image');
            break;
        case 'video':
            setViewerType('video');
            break;
        case 'pdf':
            setViewerType('pdf');
            break;
        case 'text':
            setViewerType('text');
            break;
        case 'markdown':
            setViewerType('markdown');
            break;
        default:
            setSelectedFile(null);
            setViewerType(null);
            try {
                await driveDownloadFile(currentBucket, file.fileKey, file.fileName);
            } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Failed to download file');
                console.error(error);
            }
            break;
    }
};

export const openDriveFileEditor = (
    file: DriveFile,
    setSelectedFile: (file: DriveFile | null) => void,
    setViewerType: (type: ViewerType) => void
) => {
    const category = getFileTypeCategory(file);
    setSelectedFile(file);
    if (category === 'markdown') {
        setViewerType('markdown');
    } else if (category === 'text') {
        setViewerType('text');
    }
};

export default DrivePreviewHost;

export type { ViewerType };
