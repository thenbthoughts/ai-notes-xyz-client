import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const jotaiStateNotesSearch = atom<string>('');
export const jotaiStateNotesWorkspaceId = atom<string>('');
export const jotaiStateNotesWorkspaceRefresh = atom<number>(0);
export const jotaiStateNotesIsStar = atom<'' | 'true' | 'false'>('');
export const jotaiNotesModalOpenStatus = atom<boolean>(false);
export const jotaiNotesSort = atomWithStorage('notes_sort_v1', 'updatedAt');
export const jotaiNotesAutosave = atomWithStorage('notes_autosave_v1', false);
export const jotaiNotesTagFilter = atom<string[]>([]);
export const jotaiNotesFolderFilter = atom<string>('');
export const jotaiNotesBulkSelected = atom<string[]>([]);
export const jotaiNotesMarkdownRaw = atomWithStorage('notes_markdown_raw_v1', false);
