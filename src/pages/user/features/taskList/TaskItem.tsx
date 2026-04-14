import type React from 'react';
import { tsPageTask } from "../../../../types/pages/tsPageTaskList";

import axiosCustom from '../../../../config/axiosCustom';
import { LucideBell, LucideClock, LucideEdit3, LucideInfo, LucideMessageCircle, LucidePin, LucideTrash2 } from "lucide-react";
import { taskChatWithAi } from "./utils/taskCrudUtils";

export type TaskItemLayout = 'grid' | 'list';

export type TaskItemProps = {
    task: tsPageTask;
    taskStatusList: {
        _id: string;
        statusTitle: string;
        listPosition: number;
    }[];
    setRefreshRandomNum: (value: React.SetStateAction<number>) => void;
    setIsTaskAddModalIsOpen: React.Dispatch<
        React.SetStateAction<{
            openStatus: boolean;
            modalType: 'add' | 'edit';
            recordId: string;
        }>
    >;
    layout?: TaskItemLayout;
};

const TaskItem = ({
    task,
    taskStatusList,
    setRefreshRandomNum,
    setIsTaskAddModalIsOpen,
    layout = 'grid',
}: TaskItemProps) => {
    const axiosChangeTaskList = async (taskStatusId: string): Promise<void> => {
        const data = {
            id: task._id,
            taskStatusId: taskStatusId,
            taskWorkspaceId: task.taskWorkspaceId,
        };

        try {
            await axiosCustom.post('/api/task/crud/taskEdit', data);
            setRefreshRandomNum(Math.floor(Math.random() * 1_000_000));
        } catch (error) {
            console.error('Error updating task group:', error);
        }
    };

    const axiosChangeTaskPin = async ({
        isTaskPinned,
    }: {
        isTaskPinned: boolean,
    }): Promise<void> => {
        const data = {
            id: task._id,
            isTaskPinned,
            taskWorkspaceId: task.taskWorkspaceId,
        };

        try {
            await axiosCustom.post('/api/task/crud/taskEdit', data);
            setRefreshRandomNum(Math.floor(Math.random() * 1_000_000));
        } catch (error) {
            console.error('Error updating task group:', error);
        }
    };

    const axiosDeleteTask = async (taskId: string): Promise<void> => {
        const confirmDelete = window.confirm("Are you sure you want to delete this task?");
        if (!confirmDelete) return;

        const data = JSON.stringify({ id: taskId });
        const config = {
            method: 'post',
            url: '/api/task/crud/taskDelete',
            headers: {
                'Content-Type': 'application/json',
            },
            data: data,
        };

        try {
            const response = await axiosCustom.request(config);
            if (response.status === 200) {
                setRefreshRandomNum(Math.floor(Math.random() * 1_000_000));
            } else {
                console.error('Failed to delete task:', response.statusText);
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'very-high':
                return 'border-fuchsia-400/70 bg-gradient-to-r from-fuchsia-100 to-violet-100 text-violet-900';
            case 'high':
                return 'border-rose-400/70 bg-gradient-to-r from-rose-100 to-orange-100 text-rose-900';
            case 'medium':
                return 'border-amber-400/70 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-950';
            case 'low':
                return 'border-cyan-400/70 bg-gradient-to-r from-cyan-100 to-sky-100 text-sky-900';
            default:
                return 'border-violet-200 bg-violet-50/80 text-violet-900';
        }
    };

    const LABEL_CHIP_STYLES = [
        'border-sky-300/80 bg-sky-100/90 text-sky-900',
        'border-violet-300/80 bg-violet-100/90 text-violet-900',
        'border-amber-300/80 bg-amber-100/90 text-amber-950',
        'border-emerald-300/80 bg-emerald-100/90 text-emerald-900',
        'border-pink-300/80 bg-pink-100/90 text-pink-900',
        'border-orange-300/80 bg-orange-100/90 text-orange-900',
    ] as const;

    const labelChipClass = (label: string) => {
        let h = 0;
        for (let i = 0; i < label.length; i++) h = (h + label.charCodeAt(i) * (i + 1)) % 997;
        return LABEL_CHIP_STYLES[Math.abs(h) % LABEL_CHIP_STYLES.length] ?? LABEL_CHIP_STYLES[0];
    };

    const now = new Date();
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    const isOverdue = dueDate && dueDate < now && !task.isCompleted;

    const reminderActiveCount = (() => {
        const presetLabels = task.dueDateReminderPresetLabels ?? [];
        const dueAbsIso = task.dueDateReminderAbsoluteTimesIso ?? [];
        const dueCrons = task.dueDateReminderCronExpressions ?? [];
        const absIso = task.remainderAbsoluteTimesIso ?? [];
        const crons = task.remainderCronExpressions ?? [];
        const n =
            presetLabels.length +
            dueAbsIso.length +
            dueCrons.length +
            absIso.length +
            crons.length;
        if (n > 0) return n;
        const sched = task.remainderScheduledTimes ?? [];
        if (sched.length > 0) return sched.length;
        return 0;
    })();

    const normIsoArr = (v: string[] | undefined): string[] =>
        (v ?? []).filter((x) => typeof x === 'string' && x.trim()).sort();

    const dueRemPending = normIsoArr(task.dueDateReminderScheduledTimes);
    const dueRemSent = normIsoArr(task.dueDateReminderScheduledTimesCompleted);
    const remPending = normIsoArr(task.remainderScheduledTimes);
    const remSent = normIsoArr(task.remainderScheduledTimesCompleted);
    const sendQueueTotal =
        dueRemPending.length + dueRemSent.length + remPending.length + remSent.length;

    const fmtQueueTime = (iso: string) => {
        try {
            const d = new Date(iso);
            if (Number.isNaN(d.getTime())) return iso;
            return d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
        } catch {
            return iso;
        }
    };

    let isUpdatedNow = false;
    if (task.updatedAtUtc) {
        const updatedAt = new Date(task.updatedAtUtc);
        const timeDiff = now.getTime() - updatedAt.getTime();
        const minutesDiff = Math.floor(timeDiff / (1000 * 60));
        if (minutesDiff < 5) {
            isUpdatedNow = true;
        }
    }

    const chip =
        'inline-flex items-center gap-0.5 rounded border px-1.5 py-0.5 text-[10px] font-medium leading-tight';

    const isList = layout === 'list';

    const chips = (
        <div className={`flex flex-wrap gap-0.5 ${isList ? 'mt-0.5' : 'mt-1'}`}>
            {task.labels &&
                task.labels.length > 0 &&
                task.labels.map((label) => (
                    <span key={label} className={chip + ' ' + labelChipClass(label)}>
                        {label}
                    </span>
                ))}

            {task.isCompleted && (
                <span className={chip + ' border-emerald-400/60 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-900'}>
                    Done
                </span>
            )}
            {task.isArchived && (
                <span className={chip + ' border-violet-300 bg-violet-100/90 text-violet-900'}>Archived</span>
            )}
            {task.priority && (
                <span className={chip + ' ' + getPriorityColor(task.priority)}>
                    {task.priority.replace('-', ' ')}
                </span>
            )}

            {dueDate && (
                <span
                    className={
                        chip +
                        (isOverdue
                            ? ' border-rose-400 bg-rose-100 text-rose-900'
                            : ' border-indigo-200 bg-indigo-50/90 text-indigo-900')
                    }
                >
                    <LucideClock className="h-3 w-3 shrink-0" strokeWidth={2} />
                    {dueDate.toLocaleDateString()}{' '}
                    <span className="hidden sm:inline">
                        {dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </span>
            )}
            {reminderActiveCount > 0 && (
                <span
                    className={chip + ' border-amber-300/80 bg-amber-50/95 text-amber-950'}
                    title="Email reminders scheduled"
                >
                    <LucideBell className="h-3 w-3 shrink-0" strokeWidth={2} />
                    {reminderActiveCount} reminder{reminderActiveCount === 1 ? '' : 's'}
                </span>
            )}
        </div>
    );

    const sendQueueBlock =
        sendQueueTotal > 0 ? (
            <details className="mt-1 rounded-md border border-amber-200/60 bg-amber-50/35 px-1.5 py-1 text-[10px] text-zinc-700 sm:text-[11px]">
                <summary className="cursor-pointer list-none font-medium text-amber-950 [&::-webkit-details-marker]:hidden">
                    <span className="inline-flex items-center gap-0.5">
                        <LucideBell className="h-3 w-3 shrink-0" strokeWidth={2} />
                        Email queue ({sendQueueTotal} instant{sendQueueTotal === 1 ? '' : 's'})
                    </span>
                </summary>
                <div className="mt-1 space-y-1 border-t border-amber-100/80 pt-1">
                    {(dueRemPending.length > 0 || dueRemSent.length > 0) && (
                        <div>
                            <p className="font-medium text-sky-900">Due-date reminders</p>
                            {dueRemPending.length > 0 && (
                                <p className="text-zinc-600">
                                    Pending:{' '}
                                    {dueRemPending.map((iso) => fmtQueueTime(iso)).join(' · ')}
                                </p>
                            )}
                            {dueRemSent.length > 0 && (
                                <p className="text-zinc-500 line-through">
                                    Sent: {dueRemSent.map((iso) => fmtQueueTime(iso)).join(' · ')}
                                </p>
                            )}
                        </div>
                    )}
                    {(remPending.length > 0 || remSent.length > 0) && (
                        <div>
                            <p className="font-medium text-amber-950">Task remainder</p>
                            {remPending.length > 0 && (
                                <p className="text-zinc-600">
                                    Pending: {remPending.map((iso) => fmtQueueTime(iso)).join(' · ')}
                                </p>
                            )}
                            {remSent.length > 0 && (
                                <p className="text-zinc-500 line-through">
                                    Sent: {remSent.map((iso) => fmtQueueTime(iso)).join(' · ')}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </details>
        ) : null;

    const selectEl = (
        <select
            value={task.taskStatusId}
            onChange={(e) => axiosChangeTaskList(e.target.value)}
            className={
                'min-w-0 rounded-md border border-zinc-200/80 bg-white py-1 pl-1.5 pr-6 text-xs leading-tight text-zinc-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 ' +
                (isList ? 'w-full max-w-full sm:w-auto sm:max-w-[160px]' : 'max-w-full flex-1 sm:max-w-[132px]')
            }
        >
            {taskStatusList.map((taskStatus) => (
                <option key={taskStatus._id} value={taskStatus._id}>
                    {taskStatus.statusTitle}
                </option>
            ))}
        </select>
    );

    const iconButtons = (
        <div className="flex items-center gap-px">
            <button
                type="button"
                onClick={() => axiosDeleteTask(task._id)}
                className="rounded-md border border-transparent p-1 text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600"
                aria-label="Delete task"
            >
                <LucideTrash2 className="h-4 w-4" strokeWidth={2} />
            </button>
            <button
                type="button"
                onClick={() => setIsTaskAddModalIsOpen({ openStatus: true, modalType: 'edit', recordId: task._id })}
                className="rounded-md border border-transparent p-1 text-violet-500 transition-colors hover:bg-violet-100 hover:text-violet-800"
                aria-label="Edit task"
            >
                <LucideEdit3 className="h-4 w-4" strokeWidth={2} />
            </button>
            <button
                type="button"
                onClick={() => setIsTaskAddModalIsOpen({ openStatus: true, modalType: 'edit', recordId: task._id })}
                className="rounded-md border border-transparent p-1 text-sky-500 transition-colors hover:bg-sky-100 hover:text-sky-900"
                aria-label="View task details"
            >
                <LucideInfo className="h-4 w-4" strokeWidth={2} />
            </button>
            <button
                type="button"
                onClick={() => axiosChangeTaskPin({ isTaskPinned: !task.isTaskPinned })}
                className={
                    (task.isTaskPinned
                        ? 'border-amber-300 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 '
                        : 'border-transparent text-amber-600/80 hover:bg-amber-50 ') +
                    'rounded-md border p-1 transition-colors'
                }
                aria-label="Pin task"
            >
                <LucidePin
                    className={`h-4 w-4 ${task.isTaskPinned ? 'fill-amber-400' : ''}`}
                    strokeWidth={2}
                />
            </button>
            {isList && (
                <button
                    type="button"
                    onClick={() => taskChatWithAi(task._id)}
                    className="rounded-md border border-zinc-200/80 bg-indigo-600 p-1 text-white shadow-sm transition-colors hover:bg-indigo-500"
                    title="AI chat"
                    aria-label="AI chat"
                >
                    <LucideMessageCircle className="h-4 w-4 text-white/95" strokeWidth={2} />
                </button>
            )}
        </div>
    );

    const shellClass =
        (isUpdatedNow
            ? 'ring-2 ring-indigo-400/40 ring-offset-1 ring-offset-zinc-50 '
            : '') +
        'group overflow-hidden border border-zinc-200/60 bg-white shadow-sm transition-shadow hover:border-zinc-300 hover:shadow-md ' +
        (isList
            ? 'rounded-lg p-1.5 sm:p-2'
            : 'h-full rounded-xl p-2 sm:p-2.5');

    if (isList) {
        return (
            <div className={shellClass}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
                    <div className="min-w-0 flex-1">
                        <h3 className="min-w-0 text-sm font-semibold leading-snug text-zinc-900">
                            {task.title}
                        </h3>
                        {chips}
                        {sendQueueBlock}
                    </div>
                    <div className="flex min-w-0 shrink-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-end sm:gap-2">
                        {selectEl}
                        {iconButtons}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={shellClass}>
            <div className="flex items-start justify-between gap-1">
                <h3 className="min-w-0 text-sm font-semibold leading-snug text-zinc-900">
                    {task.title}
                </h3>
            </div>

            {chips}
            {sendQueueBlock}

            <div className="mt-1.5 flex flex-wrap items-center gap-1">
                {selectEl}
                {iconButtons}
            </div>

            <button
                type="button"
                onClick={() => taskChatWithAi(task._id)}
                className="mt-1.5 inline-flex w-full items-center justify-center gap-1 rounded-lg border border-indigo-600/20 bg-indigo-600 py-1.5 text-[11px] font-medium text-white shadow-sm transition-colors hover:bg-indigo-500"
            >
                <LucideMessageCircle className="h-3.5 w-3.5 text-white/95" strokeWidth={2} />
                AI chat
            </button>
        </div>
    );
};

export default TaskItem;
