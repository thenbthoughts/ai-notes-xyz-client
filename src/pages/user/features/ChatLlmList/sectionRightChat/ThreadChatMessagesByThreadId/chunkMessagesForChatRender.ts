import type { tsMessageItem } from '../../../../../../types/pages/tsNotesAdvanceList';

export type ChatMessageRenderChunk =
    | { kind: 'single'; message: tsMessageItem }
    | { kind: 'am3_pipeline_group'; messages: tsMessageItem[] }
    | { kind: 'am4_pipeline_group'; messages: tsMessageItem[] };

/** Collapse consecutive synthetic AM3 / AM4 stream rows into one UI block each. */
export function chunkMessagesForChatRender(messages: tsMessageItem[]): ChatMessageRenderChunk[] {
    const out: ChatMessageRenderChunk[] = [];
    let i = 0;
    while (i < messages.length) {
        const m = messages[i];
        if (m.type === 'answer_machine_v3_stream') {
            const group: tsMessageItem[] = [];
            while (i < messages.length && messages[i].type === 'answer_machine_v3_stream') {
                group.push(messages[i]);
                i++;
            }
            out.push({ kind: 'am3_pipeline_group', messages: group });
            continue;
        }
        if (m.type === 'answer_machine_v4_stream') {
            const group: tsMessageItem[] = [];
            while (i < messages.length && messages[i].type === 'answer_machine_v4_stream') {
                group.push(messages[i]);
                i++;
            }
            out.push({ kind: 'am4_pipeline_group', messages: group });
            continue;
        }
        out.push({ kind: 'single', message: m });
        i++;
    }
    return out;
}
