import type { tsMessageItem } from '../../../../../../types/pages/tsNotesAdvanceList';

export type ChatMessageRenderChunk =
    | { kind: 'single'; message: tsMessageItem }
    | { kind: 'am4_pipeline_group'; messages: tsMessageItem[] };

/** Collapse consecutive synthetic AM4 stream rows into one UI block each. Legacy `answer_machine_v3_stream` rows render as single messages. */
export function chunkMessagesForChatRender(messages: tsMessageItem[]): ChatMessageRenderChunk[] {
    const out: ChatMessageRenderChunk[] = [];
    let i = 0;
    while (i < messages.length) {
        const m = messages[i];
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
