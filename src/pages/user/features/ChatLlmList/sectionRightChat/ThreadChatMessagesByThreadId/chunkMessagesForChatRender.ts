import type { tsMessageItem } from '../../../../../../types/pages/tsNotesAdvanceList';

export type ChatMessageRenderChunk =
    | { kind: 'single'; message: tsMessageItem };

/** Map chat messages to render chunks (one message per chunk). */
export function chunkMessagesForChatRender(messages: tsMessageItem[]): ChatMessageRenderChunk[] {
    return messages.map((message) => ({ kind: 'single' as const, message }));
}
