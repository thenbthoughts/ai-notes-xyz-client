import { REMINDER_LABEL_TO_MS, type ReminderLabelToMsItem } from '../../../../../constants/reminderLabelToMsArr.ts';

export type IReminderLabelToMsArr = ReminderLabelToMsItem;
export const reminderLabelToMsArr: IReminderLabelToMsArr[] = REMINDER_LABEL_TO_MS;

/** Compact selects — neutral chrome, indigo focus */
const taskEditSelectBase =
    'rounded-lg border border-zinc-200/90 bg-white py-1.5 pl-2 pr-1.5 text-xs leading-tight text-zinc-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 sm:py-2 sm:pl-2.5 sm:pr-2';

export const taskEditSelectClass = `w-full min-w-0 ${taskEditSelectBase}`;

/** Inline / toolbar selects (avoid full width next to labels) */
export const taskEditSelectInlineClass = `w-auto min-w-[7rem] ${taskEditSelectBase}`;

export const taskEditInputClass =
    'w-full rounded-lg border border-zinc-200/90 bg-white py-1.5 px-2 text-xs text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 sm:py-2 sm:px-2.5';