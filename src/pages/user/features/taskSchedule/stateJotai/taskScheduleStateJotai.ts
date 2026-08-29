import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

const safeStorage = {
    getItem: (k: string, v: string) => {
        try {
            const x = localStorage.getItem(k);
            return x === null ? v : x;
        } catch {
            return v;
        }
    },
    setItem: (k: string, v: string) => {
        try {
            localStorage.setItem(k, v);
        } catch {
            return;
        }
    },
    removeItem: (k: string) => {
        try {
            localStorage.removeItem(k);
        } catch {
            return;
        }
    },
    subscribe: () => () => {},
} as never;

export type TaskScheduleTaskTypeFilter =
    | ''
    | 'taskAdd'
    | 'notesAdd'
    | 'customRestApiCall'
    | 'generatedDailySummaryByAi'
    | 'suggestDailyTasksByAi'
    | 'sendMyselfEmail';

export type TaskScheduleActiveFilter = '' | 'active' | 'inactive';

export type TaskScheduleEmailFilter = '' | 'true' | 'false';

export const jotaiTaskScheduleFilterTaskType = atomWithStorage<TaskScheduleTaskTypeFilter>('ts_filter_taskType', '', safeStorage);

export const jotaiTaskScheduleFilterIsActive = atomWithStorage<TaskScheduleActiveFilter>('ts_filter_isActive', '', safeStorage);

export const jotaiTaskScheduleFilterShouldSendEmail = atomWithStorage<TaskScheduleEmailFilter>('ts_filter_email', '', safeStorage);

export const jotaiTaskScheduleSearchTitle = atomWithStorage<string>('ts_filter_title', '', safeStorage);

export const jotaiTaskScheduleSearchDescription = atomWithStorage<string>('ts_filter_desc', '', safeStorage);

export const jotaiTaskScheduleSort = atomWithStorage<string>('ts_sort', 'nextRunAsc', safeStorage);

/** Incremented from toolbar refresh so the list refetches. */
export const jotaiTaskScheduleListRefresh = atom(0);

export const jotaiNotesModalOpenStatus = atom<boolean>(false);
