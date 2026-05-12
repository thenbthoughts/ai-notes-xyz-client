/**
 * AM4 pipeline rows use `synth-v4-{requestId}-{iterationNumber}` from notesGet merge.
 */
import type { AnswerMachineV4StreamPayload, tsMessageItem } from '../../../../../../types/pages/tsNotesAdvanceList';

export type Am4PipelineRenderBlock =
    | {
          type: 'iteration_block';
          iteration: tsMessageItem;
          subQuestions: tsMessageItem[];
          iterationFiles: tsMessageItem[];
          subQuestionFiles: Record<string, tsMessageItem[]>;
      }
    | { type: 'final_answer'; item: tsMessageItem; attachments: tsMessageItem[] }
    | { type: 'orphan_sub_question'; item: tsMessageItem }
    | { type: 'orphan_files'; items: tsMessageItem[] };

function iterationRowKey(iter: tsMessageItem): string | undefined {
    const sp = iter.streamPayload as AnswerMachineV4StreamPayload | undefined;
    if (!sp || sp.kind !== 'iteration') {
        return undefined;
    }
    const docId = sp.iterationDocId?.trim();
    if (docId) {
        return docId;
    }
    const id = String(iter._id);
    return id.startsWith('am4-iter-') ? id.slice('am4-iter-'.length) : id;
}

function subRowIterationKey(sub: tsMessageItem, iterations: tsMessageItem[]): string | undefined {
    const sp = sub.streamPayload as AnswerMachineV4StreamPayload | undefined;
    if (!sp || sp.kind !== 'sub_question') {
        return undefined;
    }

    const syntheticFallback =
        sp.requestId != null && sp.iterationNumber != null
            ? `synth-v4-${sp.requestId}-${sp.iterationNumber}`
            : undefined;

    const resolveFromMatchingIteration = (): string | undefined => {
        if (sp.requestId == null || sp.iterationNumber == null) {
            return syntheticFallback;
        }
        const it = iterations.find((row) => {
            const isp = row.streamPayload as AnswerMachineV4StreamPayload | undefined;
            return (
                isp?.kind === 'iteration' &&
                isp.requestId === sp.requestId &&
                isp.iterationNumber === sp.iterationNumber
            );
        });
        return it ? iterationRowKey(it) ?? syntheticFallback : syntheticFallback;
    };

    const docId = sp.iterationDocId?.trim();
    if (docId) {
        const iterKeyMatches = iterations.some((row) => {
            const isp = row.streamPayload as AnswerMachineV4StreamPayload | undefined;
            return isp?.kind === 'iteration' && iterationRowKey(row) === docId;
        });
        if (iterKeyMatches || docId.startsWith('synth-v4-')) {
            return docId;
        }
        const resolved = resolveFromMatchingIteration();
        return resolved ?? docId;
    }

    return resolveFromMatchingIteration();
}

function sortSubs(a: tsMessageItem, b: tsMessageItem): number {
    const sa = a.streamPayload as AnswerMachineV4StreamPayload | undefined;
    const sb = b.streamPayload as AnswerMachineV4StreamPayload | undefined;
    const stepA = sa?.kind === 'sub_question' && typeof sa.stepIndex === 'number' ? sa.stepIndex : NaN;
    const stepB = sb?.kind === 'sub_question' && typeof sb.stepIndex === 'number' ? sb.stepIndex : NaN;
    if (!Number.isNaN(stepA) && !Number.isNaN(stepB) && stepA !== stepB) {
        return stepA - stepB;
    }
    const ta = new Date(a.updatedAtUtc).getTime();
    const tb = new Date(b.updatedAtUtc).getTime();
    if (ta !== tb) {
        return ta - tb;
    }
    return String(a._id).localeCompare(String(b._id));
}

function stableSubQuestionDocId(sq: tsMessageItem): string {
    const id = String(sq._id);
    return id.startsWith('am4-sq-') ? id.slice('am4-sq-'.length) : id;
}

export function groupAnswerMachineV4PipelineItems(items: tsMessageItem[]): Am4PipelineRenderBlock[] {
    const orderedIterations: tsMessageItem[] = [];
    const seenIter = new Set<string>();
    const finalsByRequest = new Map<string, tsMessageItem>();

    const iterationScopedFiles = new Map<string, tsMessageItem[]>();
    const subScopedFiles = new Map<string, tsMessageItem[]>();
    const looseFilesByRequest = new Map<string, tsMessageItem[]>();

    for (const row of items) {
        const sp = row.streamPayload as AnswerMachineV4StreamPayload | undefined;
        if (!sp) {
            continue;
        }
        if (sp.kind === 'iteration') {
            if (!seenIter.has(row._id)) {
                seenIter.add(row._id);
                orderedIterations.push(row);
            }
            continue;
        }
        if (sp.kind === 'final_answer') {
            finalsByRequest.set(sp.requestId, row);
            continue;
        }
        if (sp.kind !== 'file_artifact') {
            continue;
        }

        const iterKey = sp.iterationDocId?.trim() ?? '';
        const subKey = sp.subQuestionDocId?.trim() ?? '';

        if (subKey) {
            const bucket = subScopedFiles.get(subKey) ?? [];
            bucket.push(row);
            subScopedFiles.set(subKey, bucket);
            continue;
        }

        if (iterKey) {
            const bucket = iterationScopedFiles.get(iterKey) ?? [];
            bucket.push(row);
            iterationScopedFiles.set(iterKey, bucket);
            continue;
        }

        const looseBucket = looseFilesByRequest.get(sp.requestId) ?? [];
        looseBucket.push(row);
        looseFilesByRequest.set(sp.requestId, looseBucket);
    }

    const subsByIterKey = new Map<string, tsMessageItem[]>();
    const orphanSubs: tsMessageItem[] = [];

    for (const row of items) {
        const sp = row.streamPayload as AnswerMachineV4StreamPayload | undefined;
        if (!sp || sp.kind !== 'sub_question') {
            continue;
        }
        const key = subRowIterationKey(row, orderedIterations);
        if (!key) {
            orphanSubs.push(row);
            continue;
        }
        const bucket = subsByIterKey.get(key) ?? [];
        bucket.push(row);
        subsByIterKey.set(key, bucket);
    }

    for (const arr of subsByIterKey.values()) {
        arr.sort(sortSubs);
    }
    orphanSubs.sort(sortSubs);

    const lastIterIndexByRequest = new Map<string, number>();
    orderedIterations.forEach((row, idx) => {
        const sp = row.streamPayload as AnswerMachineV4StreamPayload | undefined;
        if (sp?.kind === 'iteration' && sp.requestId) {
            lastIterIndexByRequest.set(sp.requestId, idx);
        }
    });

    const out: Am4PipelineRenderBlock[] = [];

    orderedIterations.forEach((iter, idx) => {
        const sp = iter.streamPayload as AnswerMachineV4StreamPayload | undefined;
        if (!sp || sp.kind !== 'iteration') {
            return;
        }
        const key = iterationRowKey(iter);
        const subs = key ? (subsByIterKey.get(key) ?? []) : [];
        if (key) {
            subsByIterKey.delete(key);
        }

        const iterationFiles = key ? (iterationScopedFiles.get(key) ?? []) : [];
        if (key && iterationScopedFiles.has(key)) {
            iterationScopedFiles.delete(key);
        }

        const subQuestionFiles: Record<string, tsMessageItem[]> = {};
        for (const sq of subs) {
            const sid = stableSubQuestionDocId(sq);
            const scoped = subScopedFiles.get(sid);
            if (scoped?.length) {
                subQuestionFiles[sid] = scoped;
                subScopedFiles.delete(sid);
            }
        }

        out.push({
            type: 'iteration_block',
            iteration: iter,
            subQuestions: subs,
            iterationFiles,
            subQuestionFiles,
        });

        if (
            sp.requestId != null &&
            lastIterIndexByRequest.get(sp.requestId) === idx &&
            finalsByRequest.has(sp.requestId)
        ) {
            const fin = finalsByRequest.get(sp.requestId)!;
            finalsByRequest.delete(sp.requestId);
            const attachments = looseFilesByRequest.get(sp.requestId) ?? [];
            looseFilesByRequest.delete(sp.requestId);
            out.push({ type: 'final_answer', item: fin, attachments });
        }
    });

    for (const fin of finalsByRequest.values()) {
        const sp = fin.streamPayload as AnswerMachineV4StreamPayload | undefined;
        const rid = sp?.kind === 'final_answer' ? sp.requestId : '';
        const attachments = rid ? (looseFilesByRequest.get(rid) ?? []) : [];
        if (rid) {
            looseFilesByRequest.delete(rid);
        }
        out.push({ type: 'final_answer', item: fin, attachments });
    }

    const orphanBucket: tsMessageItem[] = [];
    for (const arr of subsByIterKey.values()) {
        for (const sq of arr) {
            out.push({ type: 'orphan_sub_question', item: sq });
        }
    }
    for (const sq of orphanSubs) {
        out.push({ type: 'orphan_sub_question', item: sq });
    }

    for (const arr of iterationScopedFiles.values()) {
        orphanBucket.push(...arr);
    }
    for (const arr of subScopedFiles.values()) {
        orphanBucket.push(...arr);
    }
    for (const arr of looseFilesByRequest.values()) {
        orphanBucket.push(...arr);
    }

    if (orphanBucket.length > 0) {
        out.push({ type: 'orphan_files', items: orphanBucket });
    }

    return out;
}
