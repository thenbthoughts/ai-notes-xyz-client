import { DriveFile } from '../../../../../types/pages/Drive.types';
import DriveFileItem from './DriveFileItem';

interface DriveFileListProps {
    files: DriveFile[];
    onFileClick: (file: DriveFile) => void;
    onEditClick?: (file: DriveFile) => void;
}

const DriveFileList = ({ files, onFileClick, onEditClick }: DriveFileListProps) => {
    if (files.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>No files or folders found</p>
            </div>
        );
    }

    return (
        <div className="border border-gray-200 rounded-sm bg-white">
            {files.map((file) => (
                <DriveFileItem
                    key={file._id}
                    file={file}
                    onFileClick={onFileClick}
                    onEditClick={onEditClick}
                    viewMode="list"
                />
            ))}
        </div>
    );
};

export default DriveFileList;

