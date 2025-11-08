import { atom } from "jotai";

export const jotaiHideSidebar = atom({
    isOpen: false,
    // true mean open
    // false mean not open
});

export const jotaiChatLlmThreadSetting = atom({
    isOpen: false,
    threadId: '',
});

export const jotaiChatHistoryModalOpen = atom({
    isOpen: false,
    // true mean open
    // false mean not open
});

export const jotaiChatLlmFooterHeight = atom(165);