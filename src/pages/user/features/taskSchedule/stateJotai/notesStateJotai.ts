import { atom } from 'jotai';

// Is Star
export const jotaiStateNotesIsStar = atom<'' | 'true' | 'false'>('');

// 
// Display Chat History
export const jotaiNotesModalOpenStatus = atom<boolean>(false);
