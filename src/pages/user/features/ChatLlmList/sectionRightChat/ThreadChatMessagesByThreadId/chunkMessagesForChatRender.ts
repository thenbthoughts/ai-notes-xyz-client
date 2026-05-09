import type { tsMessageItem } from '../../../../../../types/pages/tsNotesAdvanceList';

export type ChatMessageRenderChunk =
    | { kind: 'single'; message: tsMessageItem }
    | { kind: 'am3_pipeline_group'; messages: tsMessageItem[] };

/** Collapse consecutive synthetic `answer_machine_v3_stream` rows into one UI block. */
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
        } else {
            out.push({ kind: 'single', message: m });
            i++;
        }
    }
    return out;
}
