import { DriveFile } from '../../../../../types/pages/Drive.types';
import DriveFileItem from './DriveFileItem';
import { LucideFolderOpen } from 'lucide-react';

interface DriveFileGridProps {
    files: DriveFile[];
    onFileClick: (file: DriveFile) => void;
    onEditClick?: (file: DriveFile) => void;
    showPath?: boolean;
    emptyLabel?: string;
    emptyHint?: string;
}

const DriveFileGrid = ({
    files,
    onFileClick,
    onEditClick,
    showPath = false,
    emptyLabel = 'This folder is empty',
    emptyHint = 'Try reindexing or choose another location',
}: DriveFileGridProps) => {
    if (files.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <LucideFolderOpen size={48} className="mb-3 text-slate-300" />
                <p className="text-sm font-medium">{emptyLabel}</p>
                <p className="mt-1 text-xs text-slate-400">{emptyHint}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
            {files.map((file) => (
                <DriveFileItem
                    key={file._id}
                    file={file}
                    onFileClick={onFileClick}
                    onEditClick={onEditClick}
                    viewMode="grid"
                    showPath={showPath}
                />
            ))}
        </div>
    );
};

export default DriveFileGrid;
