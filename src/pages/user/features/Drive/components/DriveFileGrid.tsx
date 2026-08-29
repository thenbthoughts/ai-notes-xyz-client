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
    onRename?: (file: DriveFile) => void;
    onMove?: (file: DriveFile) => void;
    onCopy?: (file: DriveFile) => void;
    onShare?: (file: DriveFile) => void;
    onVersions?: (file: DriveFile) => void;
    dragHandlers?: (file: DriveFile) => { onDragStart: (e: React.DragEvent) => void; onDragOver?: (e: React.DragEvent) => void; onDrop?: (e: React.DragEvent) => void; isDropTarget?: boolean };
}

const DriveFileGrid = ({
    files,
    onFileClick,
    onEditClick,
    showPath = false,
    emptyLabel = 'This folder is empty',
    emptyHint = 'Try reindexing or choose another location',
    onRename,
    onMove,
    onCopy,
    onShare,
    onVersions,
    dragHandlers,
}: DriveFileGridProps) => {
    if (files.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
                <LucideFolderOpen size={48} className="mb-3 text-zinc-600" />
                <p className="text-sm font-medium">{emptyLabel}</p>
                <p className="mt-1 text-xs text-zinc-500">{emptyHint}</p>
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
                    onRename={onRename}
                    onMove={onMove}
                    onCopy={onCopy}
                    onShare={onShare}
                    onVersions={onVersions}
                    draggableProps={dragHandlers ? dragHandlers(file) : undefined}
                />
            ))}
        </div>
    );
};

export default DriveFileGrid;
