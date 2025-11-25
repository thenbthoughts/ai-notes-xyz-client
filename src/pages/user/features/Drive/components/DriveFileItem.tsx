import { DriveFile } from '../../../../../types/pages/Drive.types';
import { getFileIcon, formatFileSize, isEditableFile } from '../utils/driveFileUtils';
import { LucideDownload, LucideTrash2, LucideEdit } from 'lucide-react';
import { useAtom } from 'jotai';
import { jotaiDriveCurrentBucket, jotaiDriveCurrentPath, jotaiDriveRefresh } from '../stateJotai/driveStateJotai';
import { driveDeleteFile, driveGetFileUrl } from '../utils/driveAxios';
import toast from 'react-hot-toast';
import { useState } from 'react';

interface DriveFileItemProps {
    file: DriveFile;
    onFileClick: (file: DriveFile) => void;
    onEditClick?: (file: DriveFile) => void;
    viewMode: 'grid' | 'list';
}

const DriveFileItem = ({ file, onFileClick, onEditClick, viewMode }: DriveFileItemProps) => {
    const [currentBucket] = useAtom(jotaiDriveCurrentBucket);
    const [, setCurrentPath] = useAtom(jotaiDriveCurrentPath);
    const [, setRefresh] = useAtom(jotaiDriveRefresh);
    const [deleting, setDeleting] = useState(false);

    const Icon = getFileIcon(file);
    const editable = isEditableFile(file);

    const handleFolderClick = () => {
        if (file.isFolder) {
            // For folders, filePath is the relative path from bucket root (after bucket prefix)
            // This is what we use as parentPath when querying children
            // So when clicking a folder, we navigate to its filePath
            const folderPath = file.filePath || '';
            console.log('Navigating to folder:', {
                fileName: file.fileName,
                filePath: file.filePath,
                fileKey: file.fileKey,
                fileKeyArr: file.fileKeyArr,
                parentPath: file.parentPath,
                folderPath,
            });
            setCurrentPath(folderPath);
        } else {
            onFileClick(file);
        }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm(`Are you sure you want to delete "${file.fileName}"?`)) {
            return;
        }

        setDeleting(true);
        try {
            await driveDeleteFile({
                bucketName: currentBucket,
                fileKey: file.fileKey,
            });
            toast.success('File deleted successfully');
            setRefresh((prev) => prev + 1);
        } catch (error) {
            toast.error('Failed to delete file');
        } finally {
            setDeleting(false);
        }
    };

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        const url = driveGetFileUrl(currentBucket, file.fileKey);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onEditClick) {
            onEditClick(file);
        }
    };

    if (viewMode === 'list') {
        return (
            <div
                className="flex items-center gap-4 p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition"
                onClick={handleFolderClick}
            >
                <Icon size={24} className="text-gray-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{file.fileName}</div>
                    <div className="text-sm text-gray-500">
                        {file.isFolder ? 'Folder' : formatFileSize(file.fileSize)}
                        {file.lastModified && ` • ${new Date(file.lastModified).toLocaleDateString()}`}
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {editable && onEditClick && (
                        <button
                            onClick={handleEdit}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded-sm transition"
                            title="Edit"
                        >
                            <LucideEdit size={18} />
                        </button>
                    )}
                    {!file.isFolder && (
                        <button
                            onClick={handleDownload}
                            className="p-1 text-green-600 hover:bg-green-50 rounded-sm transition"
                            title="Download"
                        >
                            <LucideDownload size={18} />
                        </button>
                    )}
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="p-1 text-red-600 hover:bg-red-50 rounded-sm transition disabled:opacity-50"
                        title="Delete"
                    >
                        <LucideTrash2 size={18} />
                    </button>
                </div>
            </div>
        );
    }

    // Grid view
    return (
        <div
            className="border border-gray-200 rounded-sm p-4 hover:shadow-md cursor-pointer transition bg-white"
            onClick={handleFolderClick}
        >
            <div className="flex flex-col items-center text-center">
                <Icon size={48} className="text-gray-600 mb-2" />
                <div className="font-medium text-sm text-gray-900 truncate w-full mb-1" title={file.fileName}>
                    {file.fileName}
                </div>
                <div className="text-xs text-gray-500 mb-3">
                    {file.isFolder ? 'Folder' : formatFileSize(file.fileSize)}
                </div>
                <div className="flex items-center gap-2">
                    {editable && onEditClick && (
                        <button
                            onClick={handleEdit}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded-sm transition"
                            title="Edit"
                        >
                            <LucideEdit size={16} />
                        </button>
                    )}
                    {!file.isFolder && (
                        <button
                            onClick={handleDownload}
                            className="p-1 text-green-600 hover:bg-green-50 rounded-sm transition"
                            title="Download"
                        >
                            <LucideDownload size={16} />
                        </button>
                    )}
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="p-1 text-red-600 hover:bg-red-50 rounded-sm transition disabled:opacity-50"
                        title="Delete"
                    >
                        <LucideTrash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DriveFileItem;

