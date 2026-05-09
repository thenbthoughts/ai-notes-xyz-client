import envKeys from '../../../../../../config/envKeys';
import type { AnswerMachineV3StreamPayload, tsMessageItem } from '../../../../../../types/pages/tsNotesAdvanceList';
import AuthenticatedStoredArtifactRow from './AuthenticatedStoredArtifactRow';

function extractArtifactPayloads(
    rows: tsMessageItem[],
): Array<Pick<Extract<AnswerMachineV3StreamPayload, { kind: 'file_artifact' }>, 'storedFileUrl' | 'mimeType' | 'originalName' | 'purpose' | 'description'>> {
    const out: Array<
        Pick<
            Extract<AnswerMachineV3StreamPayload, { kind: 'file_artifact' }>,
            'storedFileUrl' | 'mimeType' | 'originalName' | 'purpose' | 'description'
        >
    > = [];
    for (const row of rows) {
        const sp = row.streamPayload as AnswerMachineV3StreamPayload | undefined;
        if (!sp || sp.kind !== 'file_artifact') {
            continue;
        }
        out.push({
            storedFileUrl: sp.storedFileUrl,
            mimeType: sp.mimeType,
            originalName: sp.originalName,
            purpose: sp.purpose,
            description: sp.description,
        });
    }
    return out;
}

/**
 * Direct getFile URL (no auth header in the link). Prefer {@link AuthenticatedStoredArtifactRow} for UX.
 */
export function buildAnswerMachineV3GetFileUrl(storedFileUrl: string, inlinePreview?: boolean): string {
    const base = `${envKeys.API_URL}/api/uploads/crud/getFile?fileName=${encodeURIComponent(storedFileUrl)}`;
    return inlinePreview ? `${base}&inline=1` : base;
}

/** Previews Answer Machine Files V3 artifacts inside the pipeline card (mirrors shell-import previews). */
export default function AnswerMachineV3FileArtifacts({ items }: { items: tsMessageItem[] }) {
    const files = extractArtifactPayloads(items);
    if (!files.length) {
        return null;
    }

    return (
        <div className="mt-3 space-y-3 border-t border-zinc-200/60 pt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Files</p>
            <div className="space-y-3">
                {files.map((f, index) => (
                    <AuthenticatedStoredArtifactRow
                        key={`${f.storedFileUrl}-${index}`}
                        storedFileUrl={f.storedFileUrl}
                        originalName={f.originalName}
                        mimeType={f.mimeType}
                        purpose={f.purpose}
                        description={f.description}
                    />
                ))}
            </div>
        </div>
    );
}
