import { atom } from 'jotai';

// Search Input
export const jotaiStateNotesSearch = atom<string>('');

// Workspace
export const jotaiStateNotesWorkspaceId = atom<string>('');
export const jotaiStateNotesWorkspaceRefresh = atom<number>(0);

// Is Star
export const jotaiStateNotesIsStar = atom<'' | 'true' | 'false'>('');

// 
// Display Chat History
export const jotaiNotesModalOpenStatus = atom<boolean>(false);
