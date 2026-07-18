import { useEffect, useMemo, useState } from 'react';
import {
    LucideChevronRight,
    LucideFolder,
    LucideFolderOpen,
    LucideHardDrive,
    LucideLoader2,
} from 'lucide-react';
import { DriveFile } from '../../../../../types/pages/Drive.types';
import { driveGetFiles } from '../browse/driveBrowseAxios';
import { validateDriveFolderPath } from '../utils/drivePathValidation';

interface DriveFolderPathFieldProps {
    bucketName: string;
    value: string;
    onChange: (path: string) => void;
    disabled?: boolean;
}

type FolderMode = 'browse' | 'enter';

const DriveFolderPathField = ({
    bucketName,
    value,
    onChange,
    disabled = false,
}: DriveFolderPathFieldProps) => {
    const [mode, setMode] = useState<FolderMode>('browse');
    /** Path currently being browsed in the picker (may lag value briefly while loading). */
    const [browsePath, setBrowsePath] = useState(value);
    const [childFolders, setChildFolders] = useState<DriveFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [folderError, setFolderError] = useState<string | null>(null);

    // Keep browse path in sync when parent resets value (e.g. modal open)
    useEffect(() => {
        setBrowsePath(value);
    }, [value]);

    useEffect(() => {
        const result = validateDriveFolderPath(value);
        setFolderError(result.valid ? null : result.error);
    }, [value]);

    useEffect(() => {
        if (!bucketName || mode !== 'browse') {
            return;
        }

        let cancelled = false;
        const load = async () => {
            setLoading(true);
            setLoadError(null);
            try {
                const response = await driveGetFiles({
                    bucketName,
                    parentPath: browsePath,
                    page: 1,
                    perPage: 10000,
                });
                if (cancelled) return;
                const folders = (response?.files || []).filter((f) => f.isFolder);
                folders.sort((a, b) => a.fileName.localeCompare(b.fileName));
                setChildFolders(folders);
            } catch {
                if (!cancelled) {
                    setChildFolders([]);
                    setLoadError('Could not load folders');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [bucketName, browsePath, mode]);

    const pathParts = useMemo(
        () => (browsePath ? browsePath.split('/').filter(Boolean) : []),
        [browsePath]
    );

    const navigateTo = (path: string) => {
        if (disabled) return;
        const result = validateDriveFolderPath(path);
        if (!result.valid) {
            setFolderError(result.error);
            return;
        }
        setBrowsePath(result.normalized);
        onChange(result.normalized);
        setFolderError(null);
    };

    const handleEnterChild = (folder: DriveFile) => {
        navigateTo(folder.filePath);
    };

    const handleBreadcrumb = (index: number) => {
        if (index < 0) {
            navigateTo('');
            return;
        }
        navigateTo(pathParts.slice(0, index + 1).join('/'));
    };

    const handleEnterPathChange = (raw: string) => {
        onChange(raw);
        const result = validateDriveFolderPath(raw);
        if (result.valid) {
            setBrowsePath(result.normalized);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-medium text-slate-700">Folder</label>
                <div className="flex overflow-hidden rounded-md border border-slate-200 text-xs">
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => setMode('browse')}
                        className={`px-2.5 py-1 transition ${
                            mode === 'browse'
                                ? 'bg-sky-600 text-white'
                                : 'bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        Browse
                    </button>
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => setMode('enter')}
                        className={`px-2.5 py-1 transition ${
                            mode === 'enter'
                                ? 'bg-sky-600 text-white'
                                : 'bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        Enter
                    </button>
                </div>
            </div>

            {mode === 'browse' ? (
                <div
                    className={`overflow-hidden rounded-xl border bg-slate-50/80 ${
                        folderError ? 'border-red-300' : 'border-slate-200'
                    }`}
                >
                    {/* Breadcrumbs */}
                    <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-white px-2 py-1.5">
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() => handleBreadcrumb(-1)}
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition ${
                                pathParts.length === 0
                                    ? 'bg-sky-50 text-sky-800'
                                    : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            <LucideHardDrive size={14} />
                            Root
                        </button>
                        {pathParts.map((part, index) => {
                            const isLast = index === pathParts.length - 1;
                            return (
                                <div key={`${part}-${index}`} className="flex items-center gap-0.5">
                                    <LucideChevronRight size={14} className="text-slate-300" />
                                    <button
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => handleBreadcrumb(index)}
                                        className={`max-w-[120px] truncate rounded-md px-2 py-1 text-xs transition ${
                                            isLast
                                                ? 'bg-sky-50 font-medium text-sky-800'
                                                : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                        title={part}
                                    >
                                        {part}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Selected path summary */}
                    <div className="flex items-center gap-2 border-b border-slate-100 bg-sky-50/60 px-3 py-2 text-xs text-sky-900">
                        <LucideFolderOpen size={14} className="shrink-0 text-sky-600" />
                        <span className="truncate font-mono">
                            {value ? value : '/ (root)'}
                        </span>
                        <span className="ml-auto shrink-0 rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-sky-700">
                            Selected
                        </span>
                    </div>

                    {/* Folder list */}
                    <div className="max-h-48 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center gap-2 px-3 py-8 text-sm text-slate-500">
                                <LucideLoader2 size={16} className="animate-spin" />
                                Loading folders…
                            </div>
                        ) : loadError ? (
                            <div className="px-3 py-6 text-center text-sm text-red-600">
                                {loadError}
                            </div>
                        ) : childFolders.length === 0 ? (
                            <div className="px-3 py-6 text-center text-sm text-slate-400">
                                No subfolders here — this folder is selected
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-100 bg-white">
                                {childFolders.map((folder) => (
                                    <li key={folder._id || folder.fileKey}>
                                        <button
                                            type="button"
                                            disabled={disabled}
                                            onClick={() => handleEnterChild(folder)}
                                            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-sky-50 disabled:opacity-50"
                                        >
                                            <LucideFolder
                                                size={16}
                                                className="shrink-0 fill-amber-400/30 text-amber-500"
                                            />
                                            <span className="truncate font-medium">
                                                {folder.fileName}
                                            </span>
                                            <LucideChevronRight
                                                size={14}
                                                className="ml-auto shrink-0 text-slate-300"
                                            />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            ) : (
                <input
                    type="text"
                    value={value}
                    disabled={disabled}
                    onChange={(e) => handleEnterPathChange(e.target.value)}
                    placeholder="e.g. docs/notes (leave empty for root)"
                    className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 ${
                        folderError
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                            : 'border-slate-200 focus:border-sky-500 focus:ring-sky-100'
                    }`}
                />
            )}

            {folderError ? (
                <p className="text-xs text-red-600">{folderError}</p>
            ) : mode === 'browse' ? (
                <p className="text-xs text-slate-400">
                    Click a folder to open it. The open folder is where the file will be saved.
                    Switch to Enter to type a new path.
                </p>
            ) : (
                <p className="text-xs text-slate-400">
                    Use letters, numbers, spaces, and ._-()+@[]. Separate nested folders with /.
                </p>
            )}
        </div>
    );
};

export default DriveFolderPathField;
