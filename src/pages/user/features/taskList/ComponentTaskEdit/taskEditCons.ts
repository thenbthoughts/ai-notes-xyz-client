// Simple calculation of reminder times based on dueDate and preset labels (lowercase, minus)

export interface IReminderLabelToMsArr {
    labelName: string;
    labelNameStr: string;
    subTime: number;
}

export const reminderLabelToMsArr: IReminderLabelToMsArr[] = [
    {
        labelName: "before-60-day",
        labelNameStr: "60 days before",
        subTime: 60 * 24 * 60 * 60 * 1000
    },
    {
        labelName: "before-30-day",
        labelNameStr: "30 days before",
        subTime: 30 * 24 * 60 * 60 * 1000
    },
    {
        labelName: "before-15-day",
        labelNameStr: "15 days before",
        subTime: 15 * 24 * 60 * 60 * 1000
    },
    {
        labelName: "before-5-day",
        labelNameStr: "5 days before",
        subTime: 5 * 24 * 60 * 60 * 1000
    },
    {
        labelName: "before-3-day",
        labelNameStr: "3 days before",
        subTime: 3 * 24 * 60 * 60 * 1000
    },
    {
        labelName: "before-1-day",
        labelNameStr: "1 day before",
        subTime: 24 * 60 * 60 * 1000
    },
    {
        labelName: "before-6-hours",
        labelNameStr: "6 hours before",
        subTime: 6 * 60 * 60 * 1000
    },
    {
        labelName: "before-3-hours",
        labelNameStr: "3 hours before",
        subTime: 3 * 60 * 60 * 1000
    },
    {
        labelName: "before-1-hours",
        labelNameStr: "1 hour before",
        subTime: 60 * 60 * 1000
    },
    {
        labelName: "before-30-mins",
        labelNameStr: "30 minutes before",
        subTime: 30 * 60 * 1000
    },
    {
        labelName: "before-15-mins",
        labelNameStr: "15 minutes before",
        subTime: 15 * 60 * 1000
    },
    {
        labelName: "at-the-time-of-due-date",
        labelNameStr: "At the time of due date",
        subTime: 0
    },
];

/** Compact selects — very light cool blue */
const taskEditSelectBase =
    'rounded-lg border border-sky-100/95 bg-gradient-to-br from-white to-sky-50/50 py-1.5 px-2 text-xs leading-tight text-slate-700 shadow-sm backdrop-blur-sm focus:border-sky-300 focus:outline-none focus:ring-1 focus:ring-sky-200/60';

export const taskEditSelectClass = `w-full min-w-0 ${taskEditSelectBase}`;

/** Inline / toolbar selects (avoid full width next to labels) */
export const taskEditSelectInlineClass = `w-auto min-w-[7rem] ${taskEditSelectBase}`;

export const taskEditInputClass =
    'w-full rounded-lg border border-slate-200/80 bg-white py-1.5 px-2 text-xs text-slate-700 shadow-sm transition placeholder:text-slate-400 focus:border-sky-300 focus:outline-none focus:ring-1 focus:ring-sky-200/50';