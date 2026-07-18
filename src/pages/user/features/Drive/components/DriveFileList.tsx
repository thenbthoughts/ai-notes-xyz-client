import { DriveFile } from '../../../../../types/pages/Drive.types';
import DriveFileItem from './DriveFileItem';
import { LucideFolderOpen } from 'lucide-react';

interface DriveFileListProps {
    files: DriveFile[];
    onFileClick: (file: DriveFile) => void;
    onEditClick?: (file: DriveFile) => void;
}

const DriveFileList = ({ files, onFileClick, onEditClick }: DriveFileListProps) => {
    if (files.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <LucideFolderOpen size={48} className="mb-3 text-slate-300" />
                <p className="text-sm font-medium">This folder is empty</p>
                <p className="mt-1 text-xs text-slate-400">Try reindexing or choose another location</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="grid grid-cols-[minmax(0,1fr)_88px_40px] gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid-cols-[minmax(0,1fr)_160px_120px_44px]">
                <div>Name</div>
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
                />
            ))}
        </div>
    );
};

export default DriveFileList;
