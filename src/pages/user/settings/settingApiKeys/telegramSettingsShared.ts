export type TelegramChatOption = {
    chatId: string;
    messageThreadId: number | null;
    label: string;
    type: string;
};

export function chatOptionKey(c: TelegramChatOption): string {
    return `${c.chatId}:::${c.messageThreadId ?? ''}`;
}

export function parseChatOptionKey(value: string): {
    chatId: string;
    messageThreadId: number | null;
} {
    const v = value.trim();
    const sep = ':::';
    const i = v.indexOf(sep);
    if (i === -1) {
        return { chatId: v, messageThreadId: null };
    }
    const chatId = v.slice(0, i);
    const rest = v.slice(i + sep.length);
    if (!rest) return { chatId, messageThreadId: null };
    const n = Number(rest);
    return {
        chatId,
        messageThreadId: !Number.isNaN(n) && n > 0 ? n : null,
    };
}
