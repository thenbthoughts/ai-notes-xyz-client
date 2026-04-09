import { REMINDER_LABEL_TO_MS, type ReminderLabelToMsItem } from '../../../../../constants/reminderLabelToMsArr.ts';

export type IReminderLabelToMsArr = ReminderLabelToMsItem;
export const reminderLabelToMsArr: IReminderLabelToMsArr[] = REMINDER_LABEL_TO_MS;

/** Compact selects — very light cool blue */
const taskEditSelectBase =
    'rounded-lg border border-sky-100/95 bg-gradient-to-br from-white to-sky-50/50 py-1.5 px-2 text-xs leading-tight text-slate-700 shadow-sm backdrop-blur-sm focus:border-sky-300 focus:outline-none focus:ring-1 focus:ring-sky-200/60';

export const taskEditSelectClass = `w-full min-w-0 ${taskEditSelectBase}`;

/** Inline / toolbar selects (avoid full width next to labels) */
export const taskEditSelectInlineClass = `w-auto min-w-[7rem] ${taskEditSelectBase}`;

export const taskEditInputClass =
    'w-full rounded-lg border border-slate-200/80 bg-white py-1.5 px-2 text-xs text-slate-700 shadow-sm transition placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-1 focus:ring-sky-200/50';