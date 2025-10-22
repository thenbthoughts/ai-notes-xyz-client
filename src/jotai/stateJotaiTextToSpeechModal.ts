import { atom } from "jotai";

export const jotaiTtsModalOpenStatus = atom<{
    openStatus: boolean;
    playingStatus: boolean;
    currentTextIndex: number;
    text: string;
    textSplit: string[];
}>({
    openStatus: false,
    playingStatus: false,
    currentTextIndex: 0,
    text: '',
    textSplit: [],
});