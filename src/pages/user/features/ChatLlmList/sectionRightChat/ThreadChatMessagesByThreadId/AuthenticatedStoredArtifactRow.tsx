import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
    downloadStoredUserFile,
    fetchAuthenticatedFileBlob,
} from '../../../../../../utils/authenticatedGetFile';

export type AuthenticatedStoredArtifactRowProps = {
    storedFileUrl: string;
    originalName: string;
    mimeType: string;
    /** Shown as a small badge (e.g. AM3 `purpose`). */
    purpose?: string;
    description?: string;
};

/**
 * Preview + download for user-owned GridFS/S3 paths served by `/api/uploads/crud/getFile`.
 * Uses authenticated blob fetch so downloads work when API and SPA are on different origins.
 */
export default function AuthenticatedStoredArtifactRow({
    storedFileUrl,
    originalName,
    mimeType,
    purpose,
    description,
}: AuthenticatedStoredArtifactRowProps) {
    const name = originalName || storedFileUrl.split('/').pop() || 'file';
    const mime = (mimeType || '').toLowerCase();
    const lower = name.toLowerCase();
    const isPdf = mime.includes('pdf') || lower.endsWith('.pdf');
    const isHtml = mime.includes('html') || lower.endsWith('.html') || lower.endsWith('.htm');
    const isImage = mime.startsWith('image/');

    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const blobUrlRef = useRef<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState(true);
    const [downloadBusy, setDownloadBusy] = useState(false);

    useEffect(() => {
        let cancelled = false;
        if (blobUrlRef.current) {
            URL.revokeObjectURL(blobUrlRef.current);
            blobUrlRef.current = null;
        }
        setBlobUrl(null);
        setPreviewLoading(true);
        fetchAuthenticatedFileBlob(storedFileUrl, { inline: true })
            .then((blob) => {
                if (cancelled) {
                    return;
                }
                const u = URL.createObjectURL(blob);
                blobUrlRef.current = u;
                setBlobUrl(u);
            })
            .catch((err) => {
                if (!cancelled) {
                    console.error('Artifact preview failed', err);
                    toast.error('Could not load file preview. Try Download.');
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setPreviewLoading(false);
                }
            });
        return () => {
            cancelled = true;
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
                blobUrlRef.current = null;
            }
        };
    }, [storedFileUrl]);

    const onDownload = async () => {
        setDownloadBusy(true);
        try {
            await downloadStoredUserFile(storedFileUrl, name);
        } catch (err) {
            console.error('Artifact download failed', err);
            toast.error('Download failed. Check that you are still logged in.');
        } finally {
            setDownloadBusy(false);
        }
    };

    const caption = (
        <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="truncate text-xs font-medium text-zinc-700">{name}</span>
            {purpose ? (
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-600">{purpose}</span>
            ) : null}
        </div>
    );

    const actionButtons = (
        <div className="flex shrink-0 flex-wrap gap-2">
            <button
                type="button"
                disabled={!blobUrl || previewLoading}
                onClick={() => blobUrl && window.open(blobUrl, '_blank', 'noopener,noreferrer')}
                className="text-xs font-medium text-teal-700 hover:text-teal-800 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
                Open
            </button>
            <button
                type="button"
                disabled={downloadBusy}
                onClick={() => void onDownload()}
                className="text-xs font-medium text-zinc-600 hover:text-zinc-800 hover:underline disabled:opacity-50"
            >
                {downloadBusy ? 'Downloading…' : 'Download'}
            </button>
        </div>
    );

    if (isPdf || isHtml) {
        return (
            <div className="overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-50/60">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200/60 bg-white/80 px-2 py-1.5">
                    {caption}
                    {actionButtons}
                </div>
                {previewLoading ? (
                    <div className="p-4 text-center text-xs text-zinc-500">Loading preview…</div>
                ) : blobUrl ? (
                    <iframe
                        title={name}
                        src={blobUrl}
                        className="block h-[min(50vh,420px)] w-full bg-white"
                        sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"
                    />
                ) : (
                    <div className="p-4 text-center text-xs text-zinc-500">Preview unavailable.</div>
                )}
                {description ? (
                    <p className="border-t border-zinc-200/50 px-2 py-1 text-[11px] text-zinc-500">{description}</p>
                ) : null}
            </div>
        );
    }

    if (isImage) {
        return (
            <div className="rounded-xl border border-zinc-200/80 bg-white/70 p-2">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    {caption}
                    <button
                        type="button"
                        disabled={downloadBusy}
                        onClick={() => void onDownload()}
                        className="shrink-0 text-xs font-medium text-teal-700 hover:underline disabled:opacity-50"
                    >
                        {downloadBusy ? '…' : 'Download'}
                    </button>
                </div>
                {previewLoading ? (
                    <div className="py-8 text-center text-xs text-zinc-500">Loading…</div>
                ) : blobUrl ? (
                    <img
                        src={blobUrl}
                        alt={name}
                        className="max-h-[45vh] max-w-full rounded-lg object-contain"
                        loading="lazy"
                    />
                ) : (
                    <div className="py-4 text-center text-xs text-zinc-500">Could not load image.</div>
                )}
                {description ? <p className="mt-1 text-[11px] text-zinc-500">{description}</p> : null}
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-zinc-200/70 bg-zinc-50/80 px-3 py-2">
            {caption}
            <button
                type="button"
                disabled={downloadBusy}
                onClick={() => void onDownload()}
                className="text-sm font-medium text-teal-700 hover:underline disabled:opacity-50"
            >
                {downloadBusy ? 'Downloading…' : 'Download'}
            </button>
            {description ? <p className="mt-1 text-[11px] text-zinc-500">{description}</p> : null}
        </div>
    );
}
