import { DriveFile } from '../../../../../types/pages/Drive.types';
import DriveFileItem from './DriveFileItem';
import { LucideFolderOpen } from 'lucide-react';

interface DriveFileListProps {
    files: DriveFile[];
    onFileClick: (file: DriveFile) => void;
    onEditClick?: (file: DriveFile) => void;
    showPath?: boolean;
    onRename?: (file: DriveFile) => void;
    onMove?: (file: DriveFile) => void;
    onCopy?: (file: DriveFile) => void;
    onShare?: (file: DriveFile) => void;
    onVersions?: (file: DriveFile) => void;
    dragHandlers?: (file: DriveFile) => { onDragStart: (e: React.DragEvent) => void; onDragOver?: (e: React.DragEvent) => void; onDrop?: (e: React.DragEvent) => void; isDropTarget?: boolean };
}

const DriveFileList = ({ files, onFileClick, onEditClick, showPath = false, onRename, onMove, onCopy, onShare, onVersions, dragHandlers }: DriveFileListProps) => {
    if (files.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
                <LucideFolderOpen size={48} className="mb-3 text-zinc-600" />
                <p className="text-sm font-medium">
                    {showPath ? 'No files found' : 'This folder is empty'}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                    {showPath
                        ? 'Try adjusting filters or sync from storage'
                        : 'Try reindexing or choose another location'}
                </p>
            </div>
        );
    }

    const headerGridClass = showPath
        ? 'grid grid-cols-[minmax(0,1fr)_88px_40px] gap-2 border-b border-zinc-700 bg-zinc-950 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-400 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_160px_120px_44px]'
        : 'grid grid-cols-[minmax(0,1fr)_88px_40px] gap-2 border-b border-zinc-700 bg-zinc-950 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-400 sm:grid-cols-[minmax(0,1fr)_160px_120px_44px]';

    return (
        <div className="overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900">
            <div className={headerGridClass}>
                <div>Name</div>
                {showPath && <div className="hidden sm:block">Path</div>}
                <div className="hidden sm:block">Modified</div>
                <div>Size</div>
                <div />
            </div>
            {files.map((file) => (
                <DriveFileItem
                    key={file._id}
                    file={file}
                    onFileClick={onFileClick}
                    onEditClick={onEditClick}
                    viewMode="list"
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

export default DriveFileList;
