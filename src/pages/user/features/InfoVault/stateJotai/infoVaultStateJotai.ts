import { atom } from 'jotai';

// Search Input
export const jotaiStateInfoVaultSearch = atom<string>('');

// Is Star
export const jotaiStateInfoVaultIsStar = atom<'' | 'true' | 'false'>('');

// Type (infoVaultType; empty = all)
export const jotaiStateInfoVaultTypeFilter = atom<string>('');

// Relationship
export const jotaiStateInfoVaultRelationshipFilter = atom<string>('');

// Archived
export const jotaiStateInfoVaultArchivedFilter = atom<'' | 'true' | 'false'>('');