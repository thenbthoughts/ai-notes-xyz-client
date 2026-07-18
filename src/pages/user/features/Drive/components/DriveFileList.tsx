import { DriveFile } from '../../../../../types/pages/Drive.types';
import DriveFileItem from './DriveFileItem';
import { LucideFolderOpen } from 'lucide-react';

interface DriveFileListProps {
    files: DriveFile[];
    onFileClick: (file: DriveFile) => void;
    onEditClick?: (file: DriveFile) => void;
    showPath?: boolean;
}

const DriveFileList = ({ files, onFileClick, onEditClick, showPath = false }: DriveFileListProps) => {
    if (files.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <LucideFolderOpen size={48} className="mb-3 text-slate-300" />
                <p className="text-sm font-medium">
                    {showPath ? 'No files found' : 'This folder is empty'}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                    {showPath
                        ? 'Try adjusting filters or sync from storage'
                        : 'Try reindexing or choose another location'}
                </p>
            </div>
        );
    }

    const headerGridClass = showPath
        ? 'grid grid-cols-[minmax(0,1fr)_88px_40px] gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_160px_120px_44px]'
        : 'grid grid-cols-[minmax(0,1fr)_88px_40px] gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid-cols-[minmax(0,1fr)_160px_120px_44px]';

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
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
                />
            ))}
        </div>
    );
};

export default DriveFileList;
