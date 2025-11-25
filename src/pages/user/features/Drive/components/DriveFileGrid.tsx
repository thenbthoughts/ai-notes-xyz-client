import { DriveFile } from '../../../../../types/pages/Drive.types';
import DriveFileItem from './DriveFileItem';

interface DriveFileGridProps {
    files: DriveFile[];
    onFileClick: (file: DriveFile) => void;
    onEditClick?: (file: DriveFile) => void;
}

const DriveFileGrid = ({ files, onFileClick, onEditClick }: DriveFileGridProps) => {
    if (files.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>No files or folders found</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {files.map((file) => (
                <DriveFileItem
                    key={file._id}
                    file={file}
                    onFileClick={onFileClick}
                    onEditClick={onEditClick}
                    viewMode="grid"
                />
            ))}
        </div>
    );
};

export default DriveFileGrid;

