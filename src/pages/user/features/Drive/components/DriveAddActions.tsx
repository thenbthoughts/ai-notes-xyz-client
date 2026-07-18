import { useState } from 'react';
import { useAtom } from 'jotai';
import { LucideFilePlus, LucideUpload } from 'lucide-react';
import toast from 'react-hot-toast';
import {
    jotaiDriveCurrentBucket,
    jotaiDriveCurrentPath,
    jotaiDriveRefresh,
} from '../stateJotai/driveStateJotai';
import DriveUploadModal from './DriveUploadModal';
import DriveCreateFileModal from './DriveCreateFileModal';

const DriveAddActions = () => {
    const [currentBucket] = useAtom(jotaiDriveCurrentBucket);
    const [currentPath, setCurrentPath] = useAtom(jotaiDriveCurrentPath);
    const [, setRefresh] = useAtom(jotaiDriveRefresh);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);

    const requireBucket = (): boolean => {
        if (!currentBucket) {
            toast.error('Please select a bucket first');
            return false;
        }
        return true;
    };

    const handleSuccess = (folderPath: string) => {
        if (folderPath !== currentPath) {
            setCurrentPath(folderPath);
        }
        setRefresh((prev) => prev + 1);
    };

    return (
        <>
            <button
                type="button"
                onClick={() => {
                    if (!requireBucket()) return;
                    setUploadOpen(true);
                }}
                disabled={!currentBucket}
                title="Upload a file"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <LucideUpload size={16} />
                <span>Upload</span>
            </button>
            <button
                type="button"
                onClick={() => {
                    if (!requireBucket()) return;
                    setCreateOpen(true);
                }}
                disabled={!currentBucket}
                title="Create a text or markdown file"
                className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <LucideFilePlus size={16} />
                <span>New file</span>
            </button>

            {currentBucket && (
                <>
                    <DriveUploadModal
                        isOpen={uploadOpen}
                        onClose={() => setUploadOpen(false)}
                        bucketName={currentBucket}
                        initialFolderPath={currentPath}
                        onSuccess={handleSuccess}
                    />
                    <DriveCreateFileModal
                        isOpen={createOpen}
                        onClose={() => setCreateOpen(false)}
                        bucketName={currentBucket}
                        initialFolderPath={currentPath}
                        onSuccess={handleSuccess}
                    />
                </>
            )}
        </>
    );
};

export default DriveAddActions;
