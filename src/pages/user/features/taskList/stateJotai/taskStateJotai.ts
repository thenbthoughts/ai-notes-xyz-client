import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const jotaiStateTaskWorkspaceId = atom<string>('');

export const taskFilterSearchAtom = atomWithStorage<string>('taskList-search', '');

export const taskFilterPriorityAtom = atomWithStorage<string>('taskList-priority', '');

export const taskFilterArchivedAtom = atomWithStorage<string>('taskList-archived', 'not-archived');

export const taskFilterCompletedAtom = atomWithStorage<string>('taskList-completed', 'not-completed');

export const taskFilterLabelsAtom = atomWithStorage<string[]>('taskList-selectedLabels', [] as string[]);

export const taskSortOverdueFirstAtom = atomWithStorage<boolean>('taskList-overdueFirst', false);

export const taskFilterDueFromAtom = atomWithStorage<string>('taskList-dueFrom', '');

export const taskFilterDueToAtom = atomWithStorage<string>('taskList-dueTo', '');

export const taskFilterPinnedAtom = atomWithStorage<string>('taskList-pinned', '');

export const taskSortByAtom = atomWithStorage<string>('taskList-sortBy', 'title');