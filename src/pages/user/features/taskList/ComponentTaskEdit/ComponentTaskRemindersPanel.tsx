import {
    LucideBell,
    LucideCalendarClock,
    LucideChevronDown,
    LucideChevronRight,
    LucideClock,
    LucidePlus,
    LucideTrash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import getDateTimeForInputTypeDateTimeLocal from '../../../../../utils/getDateTimeForInputTypeDateTimeLocal';

import type { IReminderLabelToMsArr } from './taskEditCons';

export type ComponentTaskRemindersPanelProps = {
    dueDate: string;
    onDueDateChange: (isoUtc: string) => void;
    onDueDateClear: () => void;
    dueDateReminderPresetLabels: string[];
    onDueDateReminderPresetLabelsChange: (labels: string[]) => void;
    dueDateReminderAbsoluteTimesIso: string[];
    onDueDateReminderAbsoluteTimesIsoChange: (iso: string[]) => void;
    dueDateReminderCronExpressions: string[];
    onDueDateReminderCronExpressionsChange: (crons: string[]) => void;
    remainderAbsoluteTimesIso: string[];
    onRemainderAbsoluteTimesIsoChange: (iso: string[]) => void;
    remainderCronExpressions: string[];
    onRemainderCronExpressionsChange: (crons: string[]) => void;
    /** Server-computed pending send instants for due-date reminders (read-only) */
    dueDateReminderScheduledTimes?: string[];
    dueDateReminderScheduledTimesCompleted?: string[];
    /** Server-computed pending send instants for task remainder (read-only) */
    remainderScheduledTimes?: string[];
    remainderScheduledTimesCompleted?: string[];
    reminderLabelOptions: IReminderLabelToMsArr[];
};

const fmtWhen = (iso: string) => {
    try {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return iso;
        return d.toLocaleString(undefined, {
            dateStyle: 'short',
            timeStyle: 'short',
        });
    } catch {
        return iso;
    }
};

const ReadOnlySendQueue = ({
    heading,
    pending,
    completed,
    pendingBorderClass,
    completedBorderClass,
}: {
    heading: string;
    pending: string[];
    completed: string[];
    pendingBorderClass: string;
    completedBorderClass: string;
}) => {
    if (pending.length === 0 && completed.length === 0) return null;
    return (
        <div className="mt-2 rounded-md border border-zinc-200/70 bg-zinc-50/50 px-2 py-1.5 sm:px-2.5 sm:py-2">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-600 sm:text-[11px]">
                {heading}
            </p>
            <p className="mb-0.5 text-[9px] text-zinc-500 sm:text-[10px]">
                From server after save; times in your local timezone below.
            </p>
            {pending.length > 0 && (
                <div className="mb-1.5">
                    <p className="mb-0.5 text-[10px] font-medium text-zinc-700 sm:text-[11px]">Pending send</p>
                    <ul className="max-h-28 space-y-0.5 overflow-y-auto [scrollbar-width:thin]">
                        {pending.map((iso) => (
                            <li
                                key={`p-${iso}`}
                                className={`rounded border px-1.5 py-0.5 text-[10px] sm:text-[11px] ${pendingBorderClass}`}
                            >
                                <span className="flex items-center gap-0.5 text-zinc-800">
                                    <LucideClock className="h-3 w-3 shrink-0" strokeWidth={2} />
                                    {fmtWhen(iso)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {completed.length > 0 && (
                <div>
                    <p className="mb-0.5 text-[10px] font-medium text-zinc-700 sm:text-[11px]">Sent</p>
                    <ul className="max-h-24 space-y-0.5 overflow-y-auto [scrollbar-width:thin]">
                        {completed.map((iso) => (
                            <li
                                key={`c-${iso}`}
                                className={`rounded border px-1.5 py-0.5 text-[10px] line-through opacity-90 sm:text-[11px] ${completedBorderClass}`}
                            >
                                <span className="flex items-center gap-0.5 text-zinc-600">
                                    <LucideClock className="h-3 w-3 shrink-0" strokeWidth={2} />
                                    {fmtWhen(iso)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

const ComponentTaskRemindersPanel = ({
    dueDate,
    onDueDateChange,
    onDueDateClear,
    dueDateReminderPresetLabels,
    onDueDateReminderPresetLabelsChange,
    dueDateReminderAbsoluteTimesIso,
    onDueDateReminderAbsoluteTimesIsoChange,
    dueDateReminderCronExpressions,
    onDueDateReminderCronExpressionsChange,
    remainderAbsoluteTimesIso,
    onRemainderAbsoluteTimesIsoChange,
    remainderCronExpressions,
    onRemainderCronExpressionsChange,
    dueDateReminderScheduledTimes = [],
    dueDateReminderScheduledTimesCompleted = [],
    remainderScheduledTimes = [],
    remainderScheduledTimesCompleted = [],
    reminderLabelOptions,
}: ComponentTaskRemindersPanelProps) => {
    const [exactLocal, setExactLocal] = useState('');
    const [cronInput, setCronInput] = useState('');
    const [exactLocalDue, setExactLocalDue] = useState('');
    const [cronInputDue, setCronInputDue] = useState('');
    const [expandedDue, setExpandedDue] = useState(false);
    const [expandedRemainder, setExpandedRemainder] = useState(false);

    const dueValid = useMemo(() => {
        if (!dueDate) return false;
        const d = new Date(dueDate);
        return !Number.isNaN(d.getTime());
    }, [dueDate]);

    const presetRows = useMemo(() => {
        if (!dueValid) return [];
        const due = new Date(dueDate);
        return dueDateReminderPresetLabels
            .map((name) => {
                const opt = reminderLabelOptions.find((o) => o.labelName === name);
                if (!opt) return null;
                const at = new Date(due.getTime() - opt.subTime);
                return { name, labelStr: opt.labelNameStr, at };
            })
            .filter(Boolean) as { name: string; labelStr: string; at: Date }[];
    }, [dueValid, dueDate, dueDateReminderPresetLabels, reminderLabelOptions]);

    const duePresetCount = presetRows.length;
    const dueDateReminderCount =
        duePresetCount +
        dueDateReminderAbsoluteTimesIso.length +
        dueDateReminderCronExpressions.length;
    const remainderCount = remainderAbsoluteTimesIso.length + remainderCronExpressions.length;

    const dueSummaryShort = useMemo(() => {
        if (!dueValid) return null;
        try {
            return new Date(dueDate).toLocaleString(undefined, {
                dateStyle: 'short',
                timeStyle: 'short',
            });
        } catch {
            return null;
        }
    }, [dueValid, dueDate]);

    useEffect(() => {
        if (dueValid || dueDateReminderAbsoluteTimesIso.length > 0 || dueDateReminderCronExpressions.length > 0) {
            setExpandedDue(true);
        }
    }, [dueValid, dueDateReminderAbsoluteTimesIso.length, dueDateReminderCronExpressions.length]);

    useEffect(() => {
        if (remainderCount > 0) {
            setExpandedRemainder(true);
        }
    }, [remainderCount]);

        const addExactDue = () => {
        if (!dueValid) {
            toast.error('Set a task due date first');
            return;
        }
        if (!exactLocalDue.trim()) {
            toast.error('Pick a date and time');
            return;
        }
        const d = new Date(exactLocalDue);
        if (Number.isNaN(d.getTime())) {
            toast.error('Invalid date');
            return;
        }
        const iso = d.toISOString();
        if (dueDateReminderAbsoluteTimesIso.includes(iso)) {
            toast.error('That time is already listed');
            return;
        }
        onDueDateReminderAbsoluteTimesIsoChange([...dueDateReminderAbsoluteTimesIso, iso].sort());
        setExactLocalDue('');
    };

    const addCronDue = () => {
        if (!dueValid) {
            toast.error('Set a task due date first');
            return;
        }
        const c = cronInputDue.trim();
        if (!c) {
            toast.error('Enter a cron expression');
            return;
        }
        if (dueDateReminderCronExpressions.includes(c)) {
            toast.error('That cron is already listed');
            setCronInputDue('');
            return;
        }
        onDueDateReminderCronExpressionsChange([...dueDateReminderCronExpressions, c]);
        setCronInputDue('');
    };

    const addExact = () => {
        if (!exactLocal.trim()) {
            toast.error('Pick a date and time');
            return;
        }
        const d = new Date(exactLocal);
        if (Number.isNaN(d.getTime())) {
            toast.error('Invalid date');
            return;
        }
        const iso = d.toISOString();
        if (remainderAbsoluteTimesIso.includes(iso)) {
            toast.error('That time is already listed');
            return;
        }
        onRemainderAbsoluteTimesIsoChange([...remainderAbsoluteTimesIso, iso].sort());
        setExactLocal('');
    };

    const addCron = () => {
        const c = cronInput.trim();
        if (!c) {
            toast.error('Enter a cron expression');
            return;
        }
        if (remainderCronExpressions.includes(c)) {
            toast.error('That cron is already listed');
            setCronInput('');
            return;
        }
        onRemainderCronExpressionsChange([...remainderCronExpressions, c]);
        setCronInput('');
    };

    return (
        <div className="mt-2 space-y-2">
            {/* —— Due date & relative-to-due reminders —— */}
            <section
                className="rounded-xl border border-zinc-200/60 bg-white shadow-sm"
                aria-labelledby="due-date-reminders-heading"
            >
                <button
                    type="button"
                    id="due-date-reminders-heading"
                    className="flex w-full items-center justify-between gap-2 px-2 py-1.5 text-left sm:px-2.5 sm:py-2"
                    onClick={() => setExpandedDue((e) => !e)}
                    aria-expanded={expandedDue}
                >
                    <div className="flex min-w-0 items-center gap-1">
                        {expandedDue ? (
                            <LucideChevronDown className="h-3.5 w-3.5 shrink-0 text-zinc-500" strokeWidth={2} />
                        ) : (
                            <LucideChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-500" strokeWidth={2} />
                        )}
                        <LucideCalendarClock className="h-3.5 w-3.5 shrink-0 text-zinc-500" strokeWidth={2} />
                        <span className="text-xs font-semibold tracking-tight text-zinc-900 sm:text-sm">
                            Due date reminders
                        </span>
                    </div>
                    <span className="max-w-[min(100%,16rem)] truncate text-right text-[10px] text-zinc-500 sm:text-[11px]">
                        {dueSummaryShort ? (
                            <>
                                <span className="font-medium text-zinc-700">{dueSummaryShort}</span>
                                <span className="text-zinc-400"> · </span>
                            </>
                        ) : (
                            <span className="text-zinc-500">No due date · </span>
                        )}
                        {dueDateReminderCount > 0
                            ? `${dueDateReminderCount} due reminder${dueDateReminderCount === 1 ? '' : 's'}`
                            : 'none set'}
                    </span>
                </button>

                {expandedDue && (
                    <div className="border-t border-zinc-100 px-2 pb-2 pt-1 sm:px-2.5 sm:pb-2.5">
                        <p className="mb-1.5 text-[10px] leading-snug text-zinc-600 sm:text-[11px]">
                            Presets relative to due, plus optional exact times and cron (all require a task due date).
                        </p>
                        <div className="mb-2 flex min-w-0 flex-wrap items-center gap-1.5 rounded-lg border border-zinc-200/70 bg-zinc-50/50 px-2 py-1.5">
                            <label className="shrink-0 text-[10px] font-medium text-zinc-700 sm:text-xs">
                                Task due date
                            </label>
                            <input
                                type="datetime-local"
                                className="min-w-0 flex-1 rounded-lg border border-zinc-200/90 bg-white py-0.5 px-1.5 text-[10px] text-zinc-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 sm:py-1 sm:text-xs"
                                value={getDateTimeForInputTypeDateTimeLocal(dueDate)}
                                onChange={(e) => {
                                    const next = new Date(`${e.target.value}`);
                                    onDueDateChange(next.toISOString());
                                }}
                            />
                            {dueDate && (
                                <button
                                    type="button"
                                    onClick={onDueDateClear}
                                    className="shrink-0 rounded-md border border-zinc-300/90 bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm transition hover:bg-zinc-700 sm:py-1 sm:text-[11px]"
                                >
                                    Clear due
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-2">
                            <div className="min-w-0 rounded-md border border-zinc-200/80 bg-white/90 p-1.5 sm:p-2">
                                <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-zinc-500 sm:text-[11px]">
                                    Scheduled
                                </p>
                                <div className="max-h-48 space-y-1 overflow-y-auto [scrollbar-width:thin]">
                                    {dueDateReminderCount === 0 && (
                                        <p className="text-[10px] leading-snug text-zinc-500 sm:text-xs">
                                            {dueValid
                                                ? 'Add reminders in the column on the right.'
                                                : 'Set a due date to enable these reminders.'}
                                        </p>
                                    )}
                                    {presetRows.map((row) => (
                                        <div
                                            key={`p-${row.name}`}
                                            className="flex items-start justify-between gap-1 rounded border border-zinc-200/70 bg-zinc-50/80 px-1.5 py-1 text-[10px] sm:text-[11px]"
                                        >
                                            <div className="min-w-0">
                                                <span className="font-medium text-zinc-900">Before due</span>
                                                <span className="block truncate text-zinc-700">{row.labelStr}</span>
                                                <span className="flex items-center gap-0.5 text-zinc-600">
                                                    <LucideClock className="h-3 w-3 shrink-0" strokeWidth={2} />
                                                    {row.at.toLocaleString(undefined, {
                                                        dateStyle: 'short',
                                                        timeStyle: 'short',
                                                    })}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                className="shrink-0 rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-red-600"
                                                aria-label={`Remove ${row.labelStr}`}
                                                onClick={() =>
                                                    onDueDateReminderPresetLabelsChange(
                                                        dueDateReminderPresetLabels.filter((x) => x !== row.name)
                                                    )
                                                }
                                            >
                                                <LucideTrash2 className="h-3 w-3" strokeWidth={2} />
                                            </button>
                                        </div>
                                    ))}
                                    {dueDateReminderAbsoluteTimesIso.map((iso) => (
                                        <div
                                            key={`da-${iso}`}
                                            className="flex items-start justify-between gap-1 rounded border border-indigo-200/60 bg-indigo-50/50 px-1.5 py-1 text-[10px] sm:text-[11px]"
                                        >
                                            <div className="min-w-0">
                                                <span className="font-medium text-indigo-950">Exact (due section)</span>
                                                <span className="flex items-center gap-0.5 text-zinc-700">
                                                    <LucideClock className="h-3 w-3 shrink-0" strokeWidth={2} />
                                                    {fmtWhen(iso)}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                className="shrink-0 rounded p-0.5 text-zinc-400 hover:bg-indigo-100 hover:text-red-600"
                                                aria-label="Remove exact time"
                                                onClick={() =>
                                                    onDueDateReminderAbsoluteTimesIsoChange(
                                                        dueDateReminderAbsoluteTimesIso.filter((x) => x !== iso)
                                                    )
                                                }
                                            >
                                                <LucideTrash2 className="h-3 w-3" strokeWidth={2} />
                                            </button>
                                        </div>
                                    ))}
                                    {dueDateReminderCronExpressions.map((expr) => (
                                        <div
                                            key={`dc-${expr}`}
                                            className="flex items-start justify-between gap-1 rounded border border-zinc-200/70 bg-zinc-50/70 px-1.5 py-1 text-[10px] sm:text-[11px]"
                                        >
                                            <div className="min-w-0 font-mono text-[10px] leading-snug text-zinc-900 sm:text-[11px]">
                                                <span className="mr-1 font-sans font-medium text-zinc-700">
                                                    Cron (due section)
                                                </span>
                                                {expr}
                                            </div>
                                            <button
                                                type="button"
                                                className="shrink-0 rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-red-600"
                                                aria-label="Remove cron"
                                                onClick={() =>
                                                    onDueDateReminderCronExpressionsChange(
                                                        dueDateReminderCronExpressions.filter((x) => x !== expr)
                                                    )
                                                }
                                            >
                                                <LucideTrash2 className="h-3 w-3" strokeWidth={2} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="min-w-0 space-y-2 rounded-md border border-zinc-200/80 bg-white/90 p-1.5 sm:p-2">
                                <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500 sm:text-[11px]">
                                    Add
                                </p>
                                {dueValid ? (
                                    <>
                                        <div className="space-y-1 border-b border-zinc-100 pb-2">
                                            <label className="text-[10px] font-medium text-zinc-800 sm:text-[11px]">
                                                Before-due presets
                                            </label>
                                            <div className="flex max-h-28 flex-wrap gap-1 overflow-y-auto [scrollbar-width:thin]">
                                                {reminderLabelOptions.map((label) => {
                                                    const checked = dueDateReminderPresetLabels.includes(
                                                        label.labelName
                                                    );
                                                    return (
                                                        <label
                                                            key={label.labelName}
                                                            className="flex cursor-pointer items-center gap-0.5 rounded border border-zinc-200/80 bg-zinc-50/80 px-1 py-0.5 text-[10px] text-zinc-800 sm:text-[11px]"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                className="h-3 w-3 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500/20"
                                                                checked={checked}
                                                                onChange={() => {
                                                                    onDueDateReminderPresetLabelsChange(
                                                                        checked
                                                                            ? dueDateReminderPresetLabels.filter(
                                                                                  (x) => x !== label.labelName
                                                                              )
                                                                            : [
                                                                                  ...dueDateReminderPresetLabels,
                                                                                  label.labelName,
                                                                              ]
                                                                    );
                                                                }}
                                                            />
                                                            <span className="leading-tight">{label.labelNameStr}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className="space-y-0.5">
                                            <label className="text-[10px] text-zinc-600 sm:text-[11px]">
                                                Exact time
                                            </label>
                                            <div className="flex flex-wrap items-center gap-1">
                                                <input
                                                    type="datetime-local"
                                                    className="min-w-0 flex-1 rounded border border-zinc-200 bg-white py-0.5 px-1 text-[10px] text-zinc-900 sm:py-1 sm:text-xs"
                                                    value={exactLocalDue}
                                                    onChange={(e) => setExactLocalDue(e.target.value)}
                                                />
                                                <button
                                                    type="button"
                                                    className="inline-flex shrink-0 items-center gap-0.5 rounded border border-indigo-200 bg-indigo-600 px-1.5 py-0.5 text-[10px] font-medium text-white hover:bg-indigo-500 sm:text-[11px]"
                                                    onClick={addExactDue}
                                                >
                                                    <LucidePlus className="h-3 w-3" strokeWidth={2} />
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-0.5">
                                            <label className="text-[10px] text-zinc-600 sm:text-[11px]">Cron (UTC)</label>
                                            <div className="flex flex-wrap items-center gap-1">
                                                <input
                                                    type="text"
                                                    className="min-w-0 flex-1 rounded border border-zinc-200 bg-white py-0.5 px-1 font-mono text-[10px] text-zinc-900 sm:py-1 sm:text-[11px]"
                                                    placeholder="0 9 * * *"
                                                    value={cronInputDue}
                                                    onChange={(e) => setCronInputDue(e.target.value)}
                                                />
                                                <button
                                                    type="button"
                                                    className="inline-flex shrink-0 items-center gap-0.5 rounded border border-indigo-200 bg-indigo-600 px-1.5 py-0.5 text-[10px] font-medium text-white hover:bg-indigo-500 sm:text-[11px]"
                                                    onClick={addCronDue}
                                                >
                                                    <LucidePlus className="h-3 w-3" strokeWidth={2} />
                                                    Add
                                                </button>
                                            </div>
                                            <p className="text-[9px] leading-tight text-zinc-500 sm:text-[10px]">
                                                Example: <span className="font-mono">0 9 * * 1-5</span>
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-[10px] leading-snug text-zinc-500 sm:text-xs">
                                        Set a task due date first.
                                    </p>
                                )}
                            </div>
                        </div>

                        <ReadOnlySendQueue
                            heading="Email send queue (due-date reminders)"
                            pending={dueDateReminderScheduledTimes}
                            completed={dueDateReminderScheduledTimesCompleted}
                            pendingBorderClass="border-zinc-200/80 bg-zinc-50/90"
                            completedBorderClass="border-zinc-200/80 bg-zinc-100/80"
                        />
                    </div>
                )}
            </section>

            {/* —— Task remainder (exact / cron, no due required) —— */}
            <section
                className="rounded-xl border border-zinc-200/60 bg-white shadow-sm"
                aria-labelledby="task-remainder-heading"
            >
                <button
                    type="button"
                    id="task-remainder-heading"
                    className="flex w-full items-center justify-between gap-2 px-2 py-1.5 text-left sm:px-2.5 sm:py-2"
                    onClick={() => setExpandedRemainder((e) => !e)}
                    aria-expanded={expandedRemainder}
                >
                    <div className="flex min-w-0 items-center gap-1">
                        {expandedRemainder ? (
                            <LucideChevronDown className="h-3.5 w-3.5 shrink-0 text-zinc-500" strokeWidth={2} />
                        ) : (
                            <LucideChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-500" strokeWidth={2} />
                        )}
                        <LucideBell className="h-3.5 w-3.5 shrink-0 text-zinc-500" strokeWidth={2} />
                        <span className="text-xs font-semibold tracking-tight text-zinc-900 sm:text-sm">
                            Task remainder
                        </span>
                    </div>
                    <span className="text-[10px] text-zinc-500 sm:text-[11px]">
                        {remainderCount > 0
                            ? `${remainderCount} scheduled (exact / cron)`
                            : 'none — optional'}
                    </span>
                </button>

                {expandedRemainder && (
                    <div className="border-t border-zinc-100 px-2 pb-2 pt-1 sm:px-2.5 sm:pb-2.5">
                        <p className="mb-2 text-[10px] leading-snug text-zinc-600 sm:text-[11px]">
                            Email reminders at fixed times or on a schedule. Does not require a task due date.
                        </p>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-2">
                            <div className="min-w-0 rounded-md border border-zinc-200/80 bg-white/90 p-1.5 sm:p-2">
                                <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-zinc-500 sm:text-[11px]">
                                    Scheduled
                                </p>
                                <div className="max-h-40 space-y-1 overflow-y-auto [scrollbar-width:thin]">
                                    {remainderCount === 0 && (
                                        <p className="text-[10px] leading-snug text-zinc-500 sm:text-xs">
                                            Add an exact time or a cron expression on the right.
                                        </p>
                                    )}
                                    {remainderAbsoluteTimesIso.map((iso) => (
                                        <div
                                            key={iso}
                                            className="flex items-start justify-between gap-1 rounded border border-indigo-100 bg-indigo-50/70 px-1.5 py-1 text-[10px] sm:text-[11px]"
                                        >
                                            <div className="min-w-0">
                                                <span className="font-medium text-indigo-950">Exact time</span>
                                                <span className="flex items-center gap-0.5 text-zinc-700">
                                                    <LucideClock className="h-3 w-3 shrink-0" strokeWidth={2} />
                                                    {fmtWhen(iso)}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                className="shrink-0 rounded p-0.5 text-zinc-400 hover:bg-indigo-100 hover:text-red-600"
                                                aria-label="Remove exact time"
                                                onClick={() =>
                                                    onRemainderAbsoluteTimesIsoChange(
                                                        remainderAbsoluteTimesIso.filter((x) => x !== iso)
                                                    )
                                                }
                                            >
                                                <LucideTrash2 className="h-3 w-3" strokeWidth={2} />
                                            </button>
                                        </div>
                                    ))}
                                    {remainderCronExpressions.map((expr) => (
                                        <div
                                            key={expr}
                                            className="flex items-start justify-between gap-1 rounded border border-zinc-200/70 bg-zinc-50/70 px-1.5 py-1 text-[10px] sm:text-[11px]"
                                        >
                                            <div className="min-w-0 font-mono text-[10px] leading-snug text-zinc-900 sm:text-[11px]">
                                                <span className="mr-1 font-sans font-medium text-zinc-700">
                                                    Cron (UTC)
                                                </span>
                                                {expr}
                                            </div>
                                            <button
                                                type="button"
                                                className="shrink-0 rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-red-600"
                                                aria-label="Remove cron"
                                                onClick={() =>
                                                    onRemainderCronExpressionsChange(
                                                        remainderCronExpressions.filter((x) => x !== expr)
                                                    )
                                                }
                                            >
                                                <LucideTrash2 className="h-3 w-3" strokeWidth={2} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="min-w-0 space-y-1.5 rounded-md border border-zinc-200/80 bg-white/90 p-1.5 sm:p-2">
                                <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500 sm:text-[11px]">
                                    Add
                                </p>
                                <div className="space-y-0.5">
                                    <label className="text-[10px] text-zinc-600 sm:text-[11px]">Exact time</label>
                                    <div className="flex flex-wrap items-center gap-1">
                                        <input
                                            type="datetime-local"
                                            className="min-w-0 flex-1 rounded border border-zinc-200 bg-white py-0.5 px-1 text-[10px] text-zinc-900 sm:py-1 sm:text-xs"
                                            value={exactLocal}
                                            onChange={(e) => setExactLocal(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="inline-flex shrink-0 items-center gap-0.5 rounded border border-indigo-200 bg-indigo-600 px-1.5 py-0.5 text-[10px] font-medium text-white hover:bg-indigo-500 sm:text-[11px]"
                                            onClick={addExact}
                                        >
                                            <LucidePlus className="h-3 w-3" strokeWidth={2} />
                                            Add
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-0.5">
                                    <label className="text-[10px] text-zinc-600 sm:text-[11px]">Cron (UTC)</label>
                                    <div className="flex flex-wrap items-center gap-1">
                                        <input
                                            type="text"
                                            className="min-w-0 flex-1 rounded border border-zinc-200 bg-white py-0.5 px-1 font-mono text-[10px] text-zinc-900 sm:py-1 sm:text-[11px]"
                                            placeholder="0 9 * * *"
                                            value={cronInput}
                                            onChange={(e) => setCronInput(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="inline-flex shrink-0 items-center gap-0.5 rounded border border-indigo-200 bg-indigo-600 px-1.5 py-0.5 text-[10px] font-medium text-white hover:bg-indigo-500 sm:text-[11px]"
                                            onClick={addCron}
                                        >
                                            <LucidePlus className="h-3 w-3" strokeWidth={2} />
                                            Add
                                        </button>
                                    </div>
                                    <p className="text-[9px] leading-tight text-zinc-500 sm:text-[10px]">
                                        Example: <span className="font-mono">0 9 * * 1-5</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <ReadOnlySendQueue
                            heading="Email send queue (task remainder)"
                            pending={remainderScheduledTimes}
                            completed={remainderScheduledTimesCompleted}
                            pendingBorderClass="border-zinc-200/80 bg-zinc-50/90"
                            completedBorderClass="border-zinc-200/80 bg-zinc-100/80"
                        />
                    </div>
                )}
            </section>
        </div>
    );
};

export default ComponentTaskRemindersPanel;
