import { useState } from 'react';
import { LucideChevronDown, LucideChevronRight } from 'lucide-react';
import type { tsMessageItem } from '../../../../../../types/pages/tsNotesAdvanceList';
import AuthenticatedStoredArtifactRow from './AuthenticatedStoredArtifactRow';

/** Overlap shape for iteration rows in merged AM3/AM4 stream payloads (`priorIteration*` fields). */
export type AnswerMachineIterationPriorPayload = {
    iterationNumber: number;
    priorIterationEvaluationReason?: string;
    priorIterationDraftExcerpt?: string;
    priorIterationWasSatisfactory?: boolean | null;
};

export function AnswerMachineIterationPriorIterationCallout({
    payload,
}: {
    payload: AnswerMachineIterationPriorPayload;
}) {
    const [draftOpen, setDraftOpen] = useState(false);
    if (payload.iterationNumber < 2) {
        return null;
    }
    const reason = (payload.priorIterationEvaluationReason ?? '').trim();
    const excerpt = (payload.priorIterationDraftExcerpt ?? '').trim();
    if (!reason && !excerpt) {
        return null;
    }

    const sat = payload.priorIterationWasSatisfactory;
    const evalPill =
        typeof sat === 'boolean' ? (
            <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    sat ? 'bg-emerald-100/90 text-emerald-900' : 'bg-amber-100/90 text-amber-900'
                }`}
            >
                {sat ? 'Prior pass: evaluator OK' : 'Prior pass: needs improvement'}
            </span>
        ) : null;

    return (
        <div className="mt-2 rounded-lg border border-violet-200/70 bg-violet-50/50 px-2.5 py-2 sm:px-3">
            <div className="flex flex-wrap items-center gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-900">
                    From previous iteration
                </p>
                {evalPill}
            </div>
            {reason ? (
                <p className="mt-1.5 whitespace-pre-wrap text-[11px] leading-snug text-violet-950/90">{reason}</p>
            ) : null}
            {excerpt ? (
                <div className="mt-2 border-t border-violet-200/50 pt-2">
                    <button
                        type="button"
                        aria-expanded={draftOpen}
                        onClick={() => setDraftOpen((v) => !v)}
                        className="flex w-full items-center justify-between gap-2 rounded-md text-left text-[10px] font-medium text-violet-800 hover:bg-violet-100/40"
                    >
                        <span>Prior draft excerpt</span>
                        {draftOpen ? (
                            <LucideChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        ) : (
                            <LucideChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        )}
                    </button>
                    {draftOpen ? (
                        <div className="mt-1 max-h-48 overflow-y-auto whitespace-pre-wrap rounded-md border border-violet-200/60 bg-white/80 p-2 text-[11px] leading-snug text-zinc-800">
                            {excerpt}
                        </div>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}

type StoredFileArtifactFields = {
    storedFileUrl: string;
    mimeType: string;
    originalName: string;
    purpose: string;
    description: string;
};

function extractStoredFileArtifactsFromMessages(rows: tsMessageItem[]): StoredFileArtifactFields[] {
    const out: StoredFileArtifactFields[] = [];
    for (const row of rows) {
        const sp = row.streamPayload as
            | ({
                  kind: string;
                  storedFileUrl?: string;
                  mimeType?: string;
                  originalName?: string;
                  purpose?: string;
                  description?: string;
              } & Record<string, unknown>)
            | undefined;
        const storedFileUrl = typeof sp?.storedFileUrl === 'string' ? sp.storedFileUrl.trim() : '';
        if (!sp || sp.kind !== 'file_artifact' || !storedFileUrl) {
            continue;
        }
        out.push({
            storedFileUrl,
            mimeType: typeof sp.mimeType === 'string' ? sp.mimeType : '',
            originalName: typeof sp.originalName === 'string' ? sp.originalName : '',
            purpose: typeof sp.purpose === 'string' ? sp.purpose : '',
            description: typeof sp.description === 'string' ? sp.description : '',
        });
    }
    return out;
}

/** Previews pipeline file rows that already have an app storage key (AM3/V4 overlap). */
export default function AnswerMachineStoredFileArtifacts({ items }: { items: tsMessageItem[] }) {
    const files = extractStoredFileArtifactsFromMessages(items);
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
