import { atom } from 'jotai';

// Search Input
export const jotaiStateInfoVaultSearch = atom<string>('');

// Is Star
export const jotaiStateInfoVaultIsStar = atom<'' | 'true' | 'false'>('');