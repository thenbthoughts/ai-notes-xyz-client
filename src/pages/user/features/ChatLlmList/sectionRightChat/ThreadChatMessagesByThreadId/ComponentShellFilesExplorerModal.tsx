import { useState, useEffect, useCallback, useMemo, useRef, type ChangeEvent } from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Folder, FileText, Download, RefreshCw, ArrowLeft, Search, FileSpreadsheet, FileCode, FolderOpen, HardDrive, Copy, Check, Trash2, Upload, FileArchive, AppWindow } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosCustom from '../../../../../../config/axiosCustom';

export interface ShellFileItem {
    name: string;
    relativePath: string;
    isDir: boolean;
    size: number;
    mtimeMs: number;
    extension: string;
    mimeType: string;
    itemCount?: number;
    fileCount?: number;
    folderCount?: number;
    truncated?: boolean;
}

const formatNestedCounts = (item: ShellFileItem): string => {
    const folders = item.folderCount ?? 0;
    const files = item.fileCount ?? item.itemCount ?? 0;
    const plus = item.truncated ? '+' : '';
    const parts: string[] = [];
    if (folders > 0) parts.push(`${folders}${plus} folder${folders === 1 && !item.truncated ? '' : 's'}`);
    if (files > 0 || parts.length === 0) parts.push(`${files}${plus} file${files === 1 && !item.truncated ? '' : 's'}`);
    return parts.join(' · ');
};

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (ms: number): string => {
    if (!ms) return '';
    try {
        return new Date(ms).toLocaleString([], {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return '';
    }
};

const getFileIcon = (ext: string, isDir: boolean) => {
    if (isDir) {
        return <Folder className="h-4 w-4 text-amber-500 fill-amber-500/20 shrink-0" />;
    }
    if (['.xlsx', '.xls', '.csv'].includes(ext)) {
        return <FileSpreadsheet className="h-4 w-4 text-emerald-600 shrink-0" />;
    }
    if (['.py', '.js', '.ts', '.html', '.css', '.json', '.sh'].includes(ext)) {
        return <FileCode className="h-4 w-4 text-sky-600 shrink-0" />;
    }
    return <FileText className="h-4 w-4 text-zinc-500 shrink-0" />;
};

const triggerBrowserDownload = (data: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

const blobErrorMessage = async (err: any, fallback: string): Promise<string> => {
    const data = err?.response?.data;
    if (data instanceof Blob) {
        try {
            const parsed = JSON.parse(await data.text());
            if (parsed?.message) return String(parsed.message);
        } catch {
            // keep fallback
        }
    }
    return err?.response?.data?.message || fallback;
};

const shellFilesTableStyles = {
    table: {
        style: {
            backgroundColor: '#18181b',
            color: '#d4d4d8',
            minWidth: '1120px',
        },
    },
    tableWrapper: {
        style: {
            backgroundColor: '#18181b',
            minWidth: '1120px',
        },
    },
    headRow: {
        style: {
            backgroundColor: '#09090b',
            color: '#a1a1aa',
            minHeight: '36px',
            minWidth: '1120px',
            borderBottomStyle: 'solid' as const,
            borderBottomWidth: '1px',
            borderBottomColor: '#27272a',
        },
    },
    headCells: {
        style: {
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '0.04em',
            textTransform: 'uppercase' as const,
            color: '#71717a',
            backgroundColor: '#09090b',
            paddingLeft: '12px',
            paddingRight: '12px',
            whiteSpace: 'nowrap' as const,
        },
    },
    cells: {
        style: {
            fontSize: '12px',
            color: '#a1a1aa',
            backgroundColor: 'inherit',
            paddingLeft: '12px',
            paddingRight: '12px',
            paddingTop: '8px',
            paddingBottom: '8px',
            overflow: 'hidden',
        },
    },
    rows: {
        style: {
            backgroundColor: '#18181b',
            color: '#d4d4d8',
            minHeight: '44px',
            minWidth: '1120px',
            '&:not(:last-of-type)': {
                borderBottomStyle: 'solid' as const,
                borderBottomWidth: '1px',
                borderBottomColor: '#27272a',
            },
            '&:hover': {
                backgroundColor: '#134e4a',
                color: '#e4e4e7',
            },
        },
        highlightOnHoverStyle: {
            backgroundColor: '#134e4a',
            color: '#e4e4e7',
            transitionDuration: '0.1s',
            outline: 'none',
        },
        stripedStyle: {
            backgroundColor: '#1c1917',
            color: '#d4d4d8',
        },
    },
    pagination: {
        style: {
            backgroundColor: '#18181b',
            color: '#a1a1aa',
            borderTop: '1px solid #27272a',
            minHeight: '44px',
        },
    },
    noData: {
        style: {
            backgroundColor: '#18181b',
            color: '#a1a1aa',
        },
    },
    progress: {
        style: {
            backgroundColor: '#18181b',
            color: '#a1a1aa',
        },
    },
};

const WORKSPACE_ROOT = 'ai-notes-xyz-agent-workspace';
const DESKTOP_TAB_NAME = 'agent-workspace-desktop';

export type ShellWorkspaceKind = 'agent' | 'agentOpencode';

const SHELL_FOLDER_BY_KIND: Record<ShellWorkspaceKind, string> = {
    agent: 'agent',
    agentOpencode: 'agent-opencode',
};

/** Thread folder on Agent Workspace. Agent (beta): shell/agent/{id}. Agent (Opencode): shell/agent-opencode/{id}. */
export const shellWorkspaceThreadPath = ({
    threadId,
    workspaceKind = 'agent',
    initialPath,
}: {
    threadId?: string;
    workspaceKind?: ShellWorkspaceKind;
    initialPath?: string;
}): string => {
    if (initialPath) return initialPath;
    const folder = SHELL_FOLDER_BY_KIND[workspaceKind] || SHELL_FOLDER_BY_KIND.agent;
    if (threadId) return `${WORKSPACE_ROOT}/shell/${folder}/${threadId}`;
    return WORKSPACE_ROOT;
};

const workspaceKindTitle = (workspaceKind: ShellWorkspaceKind): string =>
    workspaceKind === 'agentOpencode' ? 'Agent (Opencode) Files Explorer' : 'Agent Workspace Files Explorer';

const workspaceKindAccent = (workspaceKind: ShellWorkspaceKind): 'teal' | 'cyan' =>
    workspaceKind === 'agentOpencode' ? 'cyan' : 'teal';

/** Must run in the click handler before any await, or the browser blocks the tab. */
const openDesktopTabOnClick = (): Window | null => {
    try {
        return window.open('', DESKTOP_TAB_NAME);
    } catch {
        return null;
    }
};

const navigateDesktopTab = (tab: Window | null, tabUrl: string): boolean => {
    if (!tabUrl) return false;
    if (!tab || tab.closed) {
        const opened = window.open(tabUrl, DESKTOP_TAB_NAME);
        return Boolean(opened && !opened.closed);
    }
    try {
        const href = tab.location.href;
        if (!href || href === 'about:blank' || href === 'about:blank/') {
            tab.location.href = tabUrl;
        }
        tab.focus();
        return true;
    } catch {
        // Cross-origin: the named tab is already on the desktop.
        tab.focus();
        return true;
    }
};

export default function ComponentShellFilesExplorerModal({
    isOpen,
    onClose,
    threadId,
    initialPath,
    workspaceKind = 'agent',
}: {
    isOpen: boolean;
    onClose: () => void;
    threadId?: string;
    initialPath?: string;
    workspaceKind?: ShellWorkspaceKind;
}) {
    const defaultStartPath = shellWorkspaceThreadPath({ threadId, workspaceKind, initialPath });
    const title = workspaceKindTitle(workspaceKind);
    const accent = workspaceKindAccent(workspaceKind);
    const accentIconWrap =
        accent === 'cyan'
            ? 'bg-cyan-950/40 text-cyan-400 ring-cyan-500/20'
            : 'bg-teal-950/40 text-teal-600 ring-teal-500/20';
    const accentCode =
        accent === 'cyan' ? 'font-medium text-cyan-400 bg-cyan-950/40' : 'font-medium text-teal-400 bg-teal-950/40';
    const accentPathCode =
        accent === 'cyan'
            ? 'text-cyan-300 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-700/80'
            : 'text-teal-300 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-700/80';
    const accentCopy =
        accent === 'cyan' ? 'text-cyan-400 hover:text-cyan-300' : 'text-teal-400 hover:text-teal-300';
    const accentRootBtn =
        accent === 'cyan'
            ? 'font-semibold text-cyan-500 hover:underline shrink-0'
            : 'font-semibold text-teal-600 hover:underline shrink-0';
    const accentUploadBtn =
        accent === 'cyan'
            ? 'flex items-center gap-1.5 rounded-lg border border-cyan-700/70 bg-cyan-950/40 px-2.5 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-900/40 disabled:opacity-50'
            : 'flex items-center gap-1.5 rounded-lg border border-teal-700/70 bg-teal-950/40 px-2.5 py-1.5 text-xs font-medium text-teal-300 hover:bg-teal-900/40 disabled:opacity-50';
    const accentUploadMenuHover =
        accent === 'cyan' ? 'hover:bg-cyan-950/50' : 'hover:bg-teal-950/50';
    const accentSpinner = accent === 'cyan' ? 'text-cyan-500' : 'text-teal-600';
    const [currentPath, setCurrentPath] = useState(defaultStartPath);
    const [files, setFiles] = useState<ShellFileItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [downloadingPath, setDownloadingPath] = useState<string | null>(null);
    const [openingLibrePath, setOpeningLibrePath] = useState<string | null>(null);
    const [deletingPath, setDeletingPath] = useState<string | null>(null);
    const [pendingDelete, setPendingDelete] = useState<ShellFileItem | null>(null);
    const [copiedPath, setCopiedPath] = useState<string | null>(null);
    const [zipBusy, setZipBusy] = useState<'download' | 'upload' | string | null>(null);
    const [uploadMenuOpen, setUploadMenuOpen] = useState(false);
    const filesInputRef = useRef<HTMLInputElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);
    const uploadMenuRef = useRef<HTMLDivElement>(null);

    const fetchFiles = useCallback(async (dirPath: string) => {
        setLoading(true);
        try {
            const res = await axiosCustom.get('/api/chat-llm/shell-files/list', {
                params: { relativeDir: dirPath },
            });
            if (res.data) {
                if (res.data.files) setFiles(res.data.files);
                if (res.data.relativeDir) setCurrentPath(res.data.relativeDir);
            }
        } catch (err: any) {
            console.error('Fetch workspace files error:', err);
            const msg = err?.response?.data?.message || 'Failed to load Agent Workspace files';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            const startPath = shellWorkspaceThreadPath({ threadId, workspaceKind, initialPath });
            setCurrentPath(startPath);
            setPendingDelete(null);
            setUploadMenuOpen(false);
            fetchFiles(startPath);
        }
    }, [isOpen, threadId, initialPath, workspaceKind, fetchFiles]);

    useEffect(() => {
        if (!uploadMenuOpen) return undefined;
        const onDocClick = (event: MouseEvent) => {
            if (uploadMenuRef.current && !uploadMenuRef.current.contains(event.target as Node)) {
                setUploadMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, [uploadMenuOpen]);

    const handleNavigateUp = () => {
        if (!currentPath || currentPath === WORKSPACE_ROOT) return;
        const parts = currentPath.split('/');
        parts.pop();
        const parentPath = parts.join('/') || WORKSPACE_ROOT;
        fetchFiles(parentPath);
    };

    const handleNavigateDir = (item: ShellFileItem) => {
        if (item.isDir) {
            fetchFiles(item.relativePath);
        }
    };

    const handleOpenInLibreOffice = async (item: ShellFileItem) => {
        if (item.isDir) return;
        const desktopTab = openDesktopTabOnClick();
        setOpeningLibrePath(item.relativePath);
        const openReq = axiosCustom.post('/api/chat-llm/libreoffice/open', {
            relativePath: item.relativePath,
        });
        try {
            const desktopRes = await axiosCustom.get('/api/chat-llm/libreoffice/desktop');
            const tabUrl =
                (typeof desktopRes.data?.desktopAuthUrl === 'string' && desktopRes.data.desktopAuthUrl) ||
                (typeof desktopRes.data?.desktopUrl === 'string' && desktopRes.data.desktopUrl) ||
                '';
            const tabOpened = navigateDesktopTab(desktopTab, tabUrl);
            if (!tabOpened && tabUrl) {
                toast.error('Pop-up blocked. Allow pop-ups for this site, then click Open again.');
            }
        } catch (desktopErr) {
            console.error('Agent Workspace desktop tab error:', desktopErr);
            toast.error('Could not open Agent Workspace desktop in a new tab');
            if (desktopTab && !desktopTab.closed) {
                try {
                    const href = desktopTab.location.href;
                    if (!href || href === 'about:blank' || href === 'about:blank/') {
                        desktopTab.close();
                    }
                } catch {
                    /* already on desktop */
                }
            }
        }

        try {
            const res = await openReq;
            toast.success(res.data?.message || `Opened ${item.name} in Agent Workspace`);
        } catch (err: any) {
            console.error('Open in Agent Workspace error:', err);
            const apiMsg =
                (typeof err?.response?.data?.message === 'string' && err.response.data.message) ||
                (typeof err?.response?.data?.error === 'string' && err.response.data.error) ||
                '';
            toast.error(apiMsg || `Failed to open ${item.name} in Agent Workspace`);
        } finally {
            setOpeningLibrePath(null);
        }
    };

    const handleDownloadFile = async (item: ShellFileItem) => {
        if (item.isDir) return;
        setDownloadingPath(item.relativePath);
        try {
            const response = await axiosCustom.get('/api/chat-llm/shell-files/download', {
                params: { relativePath: item.relativePath },
                responseType: 'blob',
            });
            triggerBrowserDownload(new Blob([response.data]), item.name);
            toast.success(`Downloaded ${item.name}`);
        } catch (err: any) {
            console.error('Download shell file error:', err);
            toast.error(`Failed to download ${item.name}`);
        } finally {
            setDownloadingPath(null);
        }
    };

    const handleDeleteFile = async (item: ShellFileItem) => {
        setPendingDelete(null);
        setDeletingPath(item.relativePath);
        try {
            await axiosCustom.post('/api/chat-llm/shell-files/delete', {
                relativePath: item.relativePath,
            });
            toast.success(`Deleted ${item.name}`);
            fetchFiles(currentPath);
        } catch (err: any) {
            console.error('Delete shell file error:', err);
            const msg = err?.response?.data?.message || `Failed to delete ${item.name}`;
            toast.error(msg);
        } finally {
            setDeletingPath(null);
        }
    };

    const handleDownloadFolderZip = async (dirPath: string, label?: string) => {
        const folderLabel = label || dirPath.split('/').filter(Boolean).pop() || 'folder';
        setZipBusy(dirPath === currentPath ? 'download' : dirPath);
        try {
            const response = await axiosCustom.get('/api/chat-llm/shell-files/download-zip', {
                params: { relativeDir: dirPath },
                responseType: 'blob',
            });
            triggerBrowserDownload(new Blob([response.data], { type: 'application/zip' }), `${folderLabel}.zip`);
            toast.success(`Downloaded ${folderLabel}.zip`);
        } catch (err: any) {
            console.error('Download folder zip error:', err);
            toast.error(await blobErrorMessage(err, `Failed to download ${folderLabel}.zip`));
        } finally {
            setZipBusy(null);
        }
    };

    const handleUploadFiles = async (e: ChangeEvent<HTMLInputElement>) => {
        const picked = e.target.files ? Array.from(e.target.files) : [];
        e.target.value = '';
        setUploadMenuOpen(false);
        if (picked.length === 0) return;
        setZipBusy('upload');
        try {
            const form = new FormData();
            form.append('relativeDir', currentPath);
            for (const file of picked) {
                const rel =
                    (file as File & { webkitRelativePath?: string }).webkitRelativePath ||
                    file.name;
                form.append('file', file);
                form.append('relativePath', rel);
            }
            const res = await axiosCustom.post('/api/chat-llm/shell-files/upload', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success(res.data?.message || `Uploaded ${picked.length} file(s)`);
            fetchFiles(currentPath);
        } catch (err: any) {
            console.error('Upload files error:', err);
            toast.error(err?.response?.data?.message || 'Failed to upload');
        } finally {
            setZipBusy(null);
        }
    };

    const handleCopyPath = (pathStr: string) => {
        navigator.clipboard.writeText(pathStr);
        setCopiedPath(pathStr);
        toast.success('Path copied to clipboard!');
        setTimeout(() => setCopiedPath(null), 2000);
    };

    const pathSegments = currentPath.split('/').filter(Boolean);

    const filteredFiles = files.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        f.relativePath.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    const columns = useMemo<TableColumn<ShellFileItem>[]>(
        () => [
            {
                name: 'Name',
                selector: (row) => row.name,
                sortable: true,
                grow: 2,
                minWidth: '240px',
                wrap: false,
                cell: (row) =>
                    row.isDir ? (
                        <button
                            type="button"
                            onClick={() => handleNavigateDir(row)}
                            className="flex min-w-[220px] w-full items-center gap-2 text-left font-medium text-zinc-200 hover:text-teal-400"
                        >
                            {getFileIcon(row.extension, true)}
                            <span className="min-w-0 truncate whitespace-nowrap">{row.name}</span>
                            {(row.fileCount !== undefined ||
                                row.folderCount !== undefined ||
                                (row.itemCount !== undefined && row.itemCount > 0)) && (
                                <span className="shrink-0 rounded-full bg-amber-900/40 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">
                                    {formatNestedCounts(row)}
                                </span>
                            )}
                        </button>
                    ) : (
                        <div className="flex min-w-[220px] w-full items-center gap-2 text-zinc-300">
                            {getFileIcon(row.extension, false)}
                            <span className="min-w-0 truncate whitespace-nowrap font-mono text-[11px] text-zinc-200">
                                {row.name}
                            </span>
                        </div>
                    ),
            },
            {
                name: 'Size',
                selector: (row) => (row.isDir ? -1 : row.size),
                sortable: true,
                width: '90px',
                cell: (row) => (
                    <span className="font-mono text-[11px] text-zinc-500">
                        {row.isDir ? '—' : formatFileSize(row.size)}
                    </span>
                ),
            },
            {
                name: 'Last Modified',
                selector: (row) => row.mtimeMs || 0,
                sortable: true,
                minWidth: '108px',
                grow: 0,
                cell: (row) => (
                    <span className="whitespace-nowrap text-[11px] text-zinc-500">
                        {formatDate(row.mtimeMs)}
                    </span>
                ),
            },
            {
                name: 'Actions',
                selector: (row) => row.relativePath,
                width: '240px',
                right: true,
                button: true,
                ignoreRowClick: true,
                allowOverflow: true,
                cell: (row) => (
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        {row.isDir ? (
                            <>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleNavigateDir(row);
                                    }}
                                    className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[11px] font-medium text-zinc-300 shadow-sm hover:bg-zinc-800"
                                >
                                    Open
                                </button>
                                <button
                                    type="button"
                                    disabled={zipBusy !== null}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        void handleDownloadFolderZip(row.relativePath, row.name);
                                    }}
                                    className="inline-flex items-center gap-1 rounded-md bg-teal-600 px-2 py-0.5 text-[11px] font-medium text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
                                    title="Download folder as zip"
                                >
                                    {zipBusy === row.relativePath ? (
                                        <RefreshCw className="h-3 w-3 animate-spin" />
                                    ) : (
                                        <FileArchive className="h-3 w-3" />
                                    )}
                                    <span className="hidden lg:inline">ZIP</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    disabled={openingLibrePath === row.relativePath}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        void handleOpenInLibreOffice(row);
                                    }}
                                    className="inline-flex items-center gap-1 rounded-md border border-sky-700/70 bg-sky-950/50 px-2 py-0.5 text-[11px] font-medium text-sky-200 shadow-sm hover:bg-sky-900/50 disabled:opacity-50"
                                    title="Open in Agent Workspace desktop"
                                >
                                    {openingLibrePath === row.relativePath ? (
                                        <RefreshCw className="h-3 w-3 animate-spin" />
                                    ) : (
                                        <AppWindow className="h-3 w-3" />
                                    )}
                                    <span className="hidden lg:inline">Open</span>
                                </button>
                                <button
                                    type="button"
                                    disabled={downloadingPath === row.relativePath}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        void handleDownloadFile(row);
                                    }}
                                    className="inline-flex items-center gap-1 rounded-md bg-teal-600 px-2 py-0.5 text-[11px] font-medium text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
                                    title="Download file"
                                >
                                    {downloadingPath === row.relativePath ? (
                                        <RefreshCw className="h-3 w-3 animate-spin" />
                                    ) : (
                                        <Download className="h-3 w-3" />
                                    )}
                                    <span className="hidden lg:inline">Download</span>
                                </button>
                            </>
                        )}
                        <button
                            type="button"
                            disabled={deletingPath === row.relativePath}
                            onClick={(e) => {
                                e.stopPropagation();
                                setPendingDelete(row);
                            }}
                            className="inline-flex items-center justify-center rounded-md border border-red-200 bg-red-950/40 p-1 text-red-600 shadow-sm transition hover:bg-red-900/40 disabled:opacity-50"
                            title={`Delete ${row.isDir ? 'folder' : 'file'}`}
                        >
                            {deletingPath === row.relativePath ? (
                                <RefreshCw className="h-3 w-3 animate-spin text-red-600" />
                            ) : (
                                <Trash2 className="h-3 w-3" />
                            )}
                        </button>
                    </div>
                ),
            },
            {
                name: 'Full Relative Path',
                selector: (row) => row.relativePath,
                sortable: true,
                grow: 3,
                minWidth: '280px',
                wrap: false,
                cell: (row) => (
                    <div className="flex min-w-[260px] w-full items-center justify-between gap-1">
                        <code
                            className="min-w-0 truncate whitespace-nowrap rounded border border-zinc-700/60 bg-zinc-950 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400"
                            title={row.relativePath}
                        >
                            {row.relativePath}
                        </code>
                        <button
                            type="button"
                            onClick={() => handleCopyPath(row.relativePath)}
                            className="shrink-0 p-1 text-zinc-400 hover:text-teal-600"
                            title="Copy relative path"
                        >
                            {copiedPath === row.relativePath ? (
                                <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                                <Copy className="h-3 w-3" />
                            )}
                        </button>
                    </div>
                ),
            },
        ],
        [copiedPath, deletingPath, downloadingPath, openingLibrePath, zipBusy]
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 p-2 sm:p-4 backdrop-blur-sm">
            <div className="flex h-[90vh] w-full max-w-6xl flex-col rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-4 sm:px-6 py-3">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg ring-1 shrink-0 ${accentIconWrap}`}>
                            <HardDrive className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-sm sm:text-base font-semibold text-zinc-100 truncate">{title}</h2>
                            <p className="text-[11px] sm:text-xs text-zinc-500 truncate">
                                Thread folder:{' '}
                                <code className={`font-mono px-1 py-0.5 rounded ${accentCode}`}>
                                    {shellWorkspaceThreadPath({ threadId, workspaceKind })}
                                </code>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-700/60 hover:text-zinc-300 transition"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Toolbar & Breadcrumbs */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-zinc-800 bg-zinc-900 px-4 sm:px-6 py-2">
                    {/* Path Breadcrumbs */}
                    <div className="flex items-center gap-1 overflow-x-auto text-xs text-zinc-400 py-1 max-w-xl">
                        <button
                            type="button"
                            disabled={currentPath === WORKSPACE_ROOT}
                            onClick={handleNavigateUp}
                            className="mr-1.5 flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-950 px-2 py-0.5 font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Up</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => fetchFiles(WORKSPACE_ROOT)}
                            className={accentRootBtn}
                        >
                            {WORKSPACE_ROOT}
                        </button>

                        {pathSegments.slice(1).map((seg, idx) => {
                            const segPath = pathSegments.slice(0, idx + 2).join('/');
                            return (
                                <div key={segPath} className="flex items-center gap-1 shrink-0">
                                    <span className="text-zinc-300">/</span>
                                    <button
                                        type="button"
                                        onClick={() => fetchFiles(segPath)}
                                        className="font-medium text-zinc-200 hover:text-teal-600 hover:underline"
                                    >
                                        {seg}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Search & Refresh */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-initial">
                            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search by name or path..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full sm:w-52 rounded-lg border border-zinc-700 bg-zinc-950 py-1.5 pl-8 pr-3 text-xs text-zinc-200 focus:border-teal-500 focus:bg-zinc-900 focus:outline-none"
                            />
                        </div>
                        <input
                            ref={filesInputRef}
                            type="file"
                            multiple
                            className="hidden"
                            onChange={handleUploadFiles}
                        />
                        <input
                            ref={folderInputRef}
                            type="file"
                            multiple
                            className="hidden"
                            onChange={handleUploadFiles}
                            {...({ webkitdirectory: '', directory: '' } as Record<string, string>)}
                        />
                        <div className="relative shrink-0" ref={uploadMenuRef}>
                            <button
                                type="button"
                                disabled={zipBusy !== null}
                                onClick={() => setUploadMenuOpen((open) => !open)}
                                className={accentUploadBtn}
                                title="Upload files, a folder, or a zip (zips are extracted)"
                            >
                                {zipBusy === 'upload' ? (
                                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Upload className="h-3.5 w-3.5" />
                                )}
                                <span>Upload</span>
                            </button>
                            {uploadMenuOpen && (
                                <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-lg">
                                    <button
                                        type="button"
                                        className={`flex w-full px-3 py-1.5 text-left text-xs text-zinc-200 ${accentUploadMenuHover}`}
                                        onClick={() => filesInputRef.current?.click()}
                                    >
                                        Files or ZIP
                                    </button>
                                    <button
                                        type="button"
                                        className={`flex w-full px-3 py-1.5 text-left text-xs text-zinc-200 ${accentUploadMenuHover}`}
                                        onClick={() => folderInputRef.current?.click()}
                                    >
                                        Folder
                                    </button>
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            disabled={zipBusy !== null}
                            onClick={() => handleDownloadFolderZip(currentPath)}
                            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 shrink-0 disabled:opacity-50"
                            title="Download this folder as a zip"
                        >
                            {zipBusy === 'download' ? (
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <FileArchive className="h-3.5 w-3.5" />
                            )}
                            <span>Download ZIP</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => fetchFiles(currentPath)}
                            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 shrink-0"
                        >
                            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Current Active Path Bar */}
                <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/60 px-4 sm:px-6 py-1.5 text-xs">
                    <div className="flex items-center gap-2 overflow-hidden text-zinc-400 min-w-0">
                        <span className="font-semibold text-zinc-500 shrink-0 text-[11px]">Current Location:</span>
                        <code className={`truncate font-mono text-[10px] sm:text-[11px] ${accentPathCode}`}>
                            {currentPath}
                        </code>
                    </div>
                    <button
                        type="button"
                        onClick={() => handleCopyPath(currentPath)}
                        className={`flex items-center gap-1 text-[11px] font-medium ${accentCopy} shrink-0`}
                    >
                        {copiedPath === currentPath ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                        <span>Copy Path</span>
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-auto p-3 sm:p-5">
                    <div className="overflow-x-auto rounded-xl border border-zinc-700/80 bg-zinc-900 shadow-sm">
                        <DataTable
                            columns={columns}
                            data={filteredFiles}
                            progressPending={loading}
                            progressComponent={
                                <div className="flex h-48 flex-col items-center justify-center text-zinc-400">
                                    <RefreshCw className={`h-8 w-8 animate-spin ${accentSpinner}`} />
                                    <p className="mt-2 text-xs font-medium">Loading workspace files...</p>
                                </div>
                            }
                            noDataComponent={
                                <div className="flex h-48 flex-col items-center justify-center text-zinc-400">
                                    <FolderOpen className="h-10 w-10 text-zinc-300" />
                                    <p className="mt-2 text-sm font-medium text-zinc-400">No files or folders found</p>
                                    <p className="text-xs text-zinc-400">This directory is empty or no matches found.</p>
                                </div>
                            }
                            customStyles={shellFilesTableStyles}
                            highlightOnHover
                            pointerOnHover
                            responsive
                            striped
                            pagination
                            paginationPerPage={25}
                            paginationRowsPerPageOptions={[10, 25, 50, 100]}
                            onRowClicked={(row) => {
                                if (row.isDir) handleNavigateDir(row);
                            }}
                        />
                    </div>
                </div>

                {pendingDelete && (
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-red-900/60 bg-red-950/40 px-4 sm:px-6 py-2.5">
                        <p className="text-xs text-red-100 min-w-0">
                            Delete {pendingDelete.isDir ? 'folder' : 'file'}{' '}
                            <span className="font-semibold">“{pendingDelete.name}”</span>? This cannot be undone.
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={() => setPendingDelete(null)}
                                disabled={deletingPath === pendingDelete.relativePath}
                                className="rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDeleteFile(pendingDelete)}
                                disabled={deletingPath === pendingDelete.relativePath}
                                className="rounded-lg bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-500 disabled:opacity-50"
                            >
                                {deletingPath === pendingDelete.relativePath ? 'Deleting…' : 'Delete'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-950 px-4 sm:px-6 py-2.5 text-xs text-zinc-500">
                    <span>Showing {filteredFiles.length} item(s)</span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-zinc-600 bg-zinc-900 px-4 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-800 shadow-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
