import { atom } from 'jotai';

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

export const jotaiTaskScheduleFilterTaskType = atom<TaskScheduleTaskTypeFilter>('');

export const jotaiTaskScheduleFilterIsActive = atom<TaskScheduleActiveFilter>('');

export const jotaiTaskScheduleFilterShouldSendEmail = atom<TaskScheduleEmailFilter>('');

export const jotaiTaskScheduleSearchTitle = atom<string>('');

export const jotaiTaskScheduleSearchDescription = atom<string>('');

/** Incremented from toolbar refresh so the list refetches. */
export const jotaiTaskScheduleListRefresh = atom(0);

export const jotaiNotesModalOpenStatus = atom<boolean>(false);
