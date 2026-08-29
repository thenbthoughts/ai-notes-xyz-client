import { useState } from 'react';
import type React from 'react';
import { tsPageTask } from "../../../../types/pages/tsPageTaskList";
import { useAtom } from 'jotai';
import { useAtomValue } from 'jotai';
import toast from 'react-hot-toast';
import axiosCustom from '../../../../config/axiosCustom';
import { LucideBell, LucideClock, LucideEdit3, LucideInfo, LucideMessageCircle, LucidePin, LucideTrash2, LucideCopy, LucideFlag } from "lucide-react";
import { taskChatWithAi } from "./utils/taskCrudUtils";
import TaskConfirmModal from './TaskConfirmModal';
import { taskFilterLabelsAtom, taskFilterSearchAtom } from './stateJotai/taskStateJotai';

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
    draggable?: boolean;
    onDragStart?: (e: React.DragEvent, id: string) => void;
};

const PRIORITY_CYCLE = ['very-low', 'low', 'medium', 'high', 'very-high'] as const;

const getNextPriority = (current: string) => {
    const idx = PRIORITY_CYCLE.indexOf(current as typeof PRIORITY_CYCLE[number]);
    if (idx === -1) {
        return PRIORITY_CYCLE[2];
    }
    if (idx === PRIORITY_CYCLE.length - 1) {
        return PRIORITY_CYCLE[0];
    }
    return PRIORITY_CYCLE[idx + 1];
};

const TaskItem = ({
    task,
    taskStatusList,
    setRefreshRandomNum,
    setIsTaskAddModalIsOpen,
    layout = 'grid',
    draggable = false,
    onDragStart,
}: TaskItemProps) => {
    const [showActions, setShowActions] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedLabels, setSelectedLabels] = useAtom(taskFilterLabelsAtom);
    const searchTerm = useAtomValue(taskFilterSearchAtom);

    const axiosChangeTaskList = async (taskStatusId: string): Promise<void> => {
        const prevStatusId = task.taskStatusId;
        const data = {
            id: task._id,
            taskStatusId: taskStatusId,
            taskWorkspaceId: task.taskWorkspaceId,
        };
        try {
            await axiosCustom.post('/api/task/crud/taskEdit', data);
            setRefreshRandomNum(Math.floor(Math.random() * 1_000_000));
            toast((t) => {
                return (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-100">Status moved</span>
                        <button
                            type="button"
                            onClick={() => {
                                toast.dismiss(t.id);
                                const revertData = {
                                    id: task._id,
                                    taskStatusId: prevStatusId,
                                    taskWorkspaceId: task.taskWorkspaceId,
                                };
                                axiosCustom.post('/api/task/crud/taskEdit', revertData).then(() => {
                                    setRefreshRandomNum(Math.floor(Math.random() * 1_000_000));
                                    toast.success('Undone');
                                }).catch(() => {
                                    toast.error('Undo failed');
                                });
                            }}
                            className="rounded bg-zinc-800 px-2 py-1 text-xs font-medium text-white hover:bg-zinc-700"
                        >
                            Undo
                        </button>
                    </div>
                );
            }, { duration: 4000 });
        } catch (error) {
            console.error('Error updating task group:', error);
            toast.error('Failed to update status');
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

    const axiosChangePriority = async (): Promise<void> => {
        const next = getNextPriority(task.priority || '');
        const data = {
            id: task._id,
            priority: next,
            taskWorkspaceId: task.taskWorkspaceId,
        };
        try {
            await axiosCustom.post('/api/task/crud/taskEdit', data);
            setRefreshRandomNum(Math.floor(Math.random() * 1_000_000));
            toast.success(`Priority: ${next}`);
        } catch (error) {
            console.error('Error updating priority:', error);
            toast.error('Failed to update priority');
        }
    };

    const axiosDuplicateTask = async (): Promise<void> => {
        const payload = {
            title: `${task.title} (copy)`,
            description: task.description || '',
            priority: task.priority || '',
            isArchived: false,
            isCompleted: false,
            labels: task.labels || [],
            dueDate: task.dueDate || '',
            taskWorkspaceId: task.taskWorkspaceId,
            taskStatusId: task.taskStatusId,
        };
        try {
            await axiosCustom.post('/api/task/crud/taskAdd', payload);
            setRefreshRandomNum(Math.floor(Math.random() * 1_000_000));
            toast.success('Task duplicated');
        } catch (error) {
            console.error('Error duplicating task:', error);
            toast.error('Failed to duplicate');
        }
    };

    const doDeleteTask = async (): Promise<void> => {
        const data = JSON.stringify({ id: task._id });
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
                toast((t) => {
                    return (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-100">Task deleted</span>
                            <button
                                type="button"
                                onClick={() => {
                                    toast.dismiss(t.id);
                                    axiosCustom.post('/api/task/crud/taskRestore', { id: task._id }).then(() => {
                                        setRefreshRandomNum(Math.floor(Math.random() * 1_000_000));
                                        toast.success('Restored');
                                    }).catch(() => {
                                        toast.error('Restore failed');
                                    });
                                }}
                                className="rounded bg-zinc-800 px-2 py-1 text-xs font-medium text-white hover:bg-zinc-700"
                                aria-label="Undo delete"
                            >
                                Undo
                            </button>
                        </div>
                    );
                }, { duration: 5000 });
            } else {
                console.error('Failed to delete task:', response.statusText);
                toast.error('Failed to delete task');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            toast.error('Failed to delete task');
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'very-high':
                return 'border-fuchsia-400/70 bg-gradient-to-r from-fuchsia-950 to-violet-950 text-violet-200';
            case 'high':
                return 'border-rose-400/70 bg-gradient-to-r from-rose-950 to-orange-950 text-rose-200';
            case 'medium':
                return 'border-amber-400/70 bg-gradient-to-r from-amber-950 to-yellow-950 text-amber-200';
            case 'low':
                return 'border-cyan-400/70 bg-gradient-to-r from-cyan-950 to-sky-950 text-sky-200';
            default:
                return 'border-violet-700 bg-violet-950/80 text-violet-200';
        }
    };

    const LABEL_CHIP_STYLES = [
        'border-sky-700/80 bg-sky-950/90 text-sky-200',
        'border-violet-700/80 bg-violet-950/90 text-violet-200',
        'border-amber-700/80 bg-amber-950/90 text-amber-200',
        'border-emerald-700/80 bg-emerald-950/90 text-emerald-200',
        'border-pink-700/80 bg-pink-950/90 text-pink-200',
        'border-orange-700/80 bg-orange-950/90 text-orange-200',
    ] as const;

    const labelChipClass = (label: string) => {
        let h = 0;
        for (let i = 0; i < label.length; i++) h = (h + label.charCodeAt(i) * (i + 1)) % 997;
        return LABEL_CHIP_STYLES[Math.abs(h) % LABEL_CHIP_STYLES.length] ?? LABEL_CHIP_STYLES[0];
    };

    const handleLabelClick = (label: string) => {
        if (selectedLabels.includes(label)) {
            setSelectedLabels(selectedLabels.filter((id) => { return id !== label; }));
        } else {
            setSelectedLabels([...selectedLabels, label]);
        }
    };

    const highlightTitle = (title: string, term: string) => {
        if (!term.trim()) {
            return title;
        }
        const lowerTitle = title.toLowerCase();
        const lowerTerm = term.toLowerCase();
        const idx = lowerTitle.indexOf(lowerTerm);
        if (idx === -1) {
            return title;
        }
        const before = title.slice(0, idx);
        const match = title.slice(idx, idx + term.length);
        const after = title.slice(idx + term.length);
        return (
            <>
                {before}
                <mark className="rounded bg-amber-400 px-0.5 text-zinc-900">{match}</mark>
                {after}
            </>
        );
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

    const normIsoArr = (v: string[] | undefined): string[] => {
        return (v ?? []).filter((x) => { return typeof x === 'string' && x.trim(); }).sort();
    };

    const dueRemPending = normIsoArr(task.dueDateReminderScheduledTimes);
    const dueRemSent = normIsoArr(task.dueDateReminderScheduledTimesCompleted);
    const remPending = normIsoArr(task.remainderScheduledTimes);
    const remSent = normIsoArr(task.remainderScheduledTimesCompleted);
    const sendQueueTotal =
        dueRemPending.length + dueRemSent.length + remPending.length + remSent.length;
    const pendingReminderCount = dueRemPending.length + remPending.length;

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

    const subTaskArr = task.subTaskArr ?? [];
    const subCompleted = subTaskArr.filter((s) => { return s.taskCompletedStatus; }).length;
    const subTotal = subTaskArr.length;
    const subProgressPct = subTotal > 0 ? Math.round((subCompleted / subTotal) * 100) : 0;

    const chips = (
        <div className={`flex flex-wrap gap-0.5 ${isList ? 'mt-0.5' : 'mt-1'}`}>
            {task.labels &&
                task.labels.length > 0 &&
                task.labels.map((label) => {
                    return (
                        <button
                            key={label}
                            type="button"
                            onClick={() => handleLabelClick(label)}
                            className={chip + ' ' + labelChipClass(label) + ' hover:opacity-80'}
                            aria-label={`Filter by label ${label}`}
                        >
                            {label}
                        </button>
                    );
                })}

            {task.isCompleted && (
                <span className={chip + ' border-emerald-400/60 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-200'}>
                    Done
                </span>
            )}
            {task.isArchived && (
                <span className={chip + ' border-violet-700 bg-violet-950/90 text-violet-200'}>Archived</span>
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
                            : ' border-indigo-700 bg-indigo-950/90 text-indigo-200')
                    }
                >
                    <LucideClock className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden />
                    {dueDate.toLocaleDateString()}{' '}
                    <span className="hidden sm:inline">
                        {dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </span>
            )}
            {reminderActiveCount > 0 && (
                <span
                    className={chip + ' border-amber-700/80 bg-amber-950/95 text-amber-200'}
                    title="Email reminders scheduled"
                >
                    <LucideBell className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden />
                    {reminderActiveCount} reminder{reminderActiveCount === 1 ? '' : 's'}
                </span>
            )}
            {pendingReminderCount > 0 && (
                <span
                    className={chip + ' border-orange-700 bg-orange-950 text-orange-200'}
                    title="Pending reminders"
                >
                    <LucideBell className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden />
                    {pendingReminderCount} pending
                </span>
            )}
        </div>
    );

    const subtaskBar = subTotal > 0 ? (
        <div className="mt-1">
            <div className="flex items-center justify-between gap-1 text-[10px] text-zinc-400">
                <span>Subtasks {subCompleted}/{subTotal}</span>
                <span className="tabular-nums">{subProgressPct}%</span>
            </div>
            <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${subProgressPct}%` }}
                />
            </div>
        </div>
    ) : null;

    const sendQueueBlock =
        sendQueueTotal > 0 ? (
            <details className="mt-1 rounded-md border border-amber-800/60 bg-amber-950/35 px-1.5 py-1 text-[10px] text-zinc-300 sm:text-[11px]">
                <summary className="cursor-pointer list-none font-medium text-amber-200 [&::-webkit-details-marker]:hidden">
                    <span className="inline-flex items-center gap-0.5">
                        <LucideBell className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden />
                        Email queue ({sendQueueTotal} instant{sendQueueTotal === 1 ? '' : 's'})
                    </span>
                </summary>
                <div className="mt-1 space-y-1 border-t border-amber-800/80 pt-1">
                    {(dueRemPending.length > 0 || dueRemSent.length > 0) && (
                        <div>
                            <p className="font-medium text-sky-200">Due-date reminders</p>
                            {dueRemPending.length > 0 && (
                                <p className="text-zinc-400">
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
                            <p className="font-medium text-amber-200">Task remainder</p>
                            {remPending.length > 0 && (
                                <p className="text-zinc-400">
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
                'min-w-0 max-w-full flex-1 rounded-md border border-zinc-700/80 bg-zinc-900 py-1 pl-1.5 pr-6 text-xs leading-tight text-zinc-100 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 sm:max-w-[160px]'
            }
            aria-label={`Change status for ${task.title}`}
        >
            {taskStatusList.map((taskStatus) => {
                return (
                    <option key={taskStatus._id} value={taskStatus._id}>
                        {taskStatus.statusTitle}
                    </option>
                );
            })}
        </select>
    );

    const iconButtons = (
        <div className="flex items-center gap-px">
            <button
                type="button"
                onClick={() => setDeleteConfirmOpen(true)}
                className="rounded-md border border-transparent p-1 text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600"
                aria-label={`Delete task ${task.title}`}
            >
                <LucideTrash2 className="h-4 w-4" strokeWidth={2} aria-hidden />
            </button>
            <button
                type="button"
                onClick={() => setIsTaskAddModalIsOpen({ openStatus: true, modalType: 'edit', recordId: task._id })}
                className="rounded-md border border-transparent p-1 text-violet-400 transition-colors hover:bg-violet-950 hover:text-violet-200"
                aria-label={`Edit task ${task.title}`}
            >
                <LucideEdit3 className="h-4 w-4" strokeWidth={2} aria-hidden />
            </button>
            <button
                type="button"
                onClick={() => setIsTaskAddModalIsOpen({ openStatus: true, modalType: 'edit', recordId: task._id })}
                className="rounded-md border border-transparent p-1 text-sky-400 transition-colors hover:bg-sky-950 hover:text-sky-200"
                aria-label={`View details for ${task.title}`}
            >
                <LucideInfo className="h-4 w-4" strokeWidth={2} aria-hidden />
            </button>
            <button
                type="button"
                onClick={() => axiosChangeTaskPin({ isTaskPinned: !task.isTaskPinned })}
                className={
                    (task.isTaskPinned
                        ? 'border-amber-700 bg-gradient-to-r from-amber-950 to-orange-950 text-amber-200 '
                        : 'border-transparent text-amber-400/80 hover:bg-amber-950 ') +
                    'rounded-md border p-1 transition-colors'
                }
                aria-label={task.isTaskPinned ? `Unpin task ${task.title}` : `Pin task ${task.title}`}
            >
                <LucidePin
                    className={`h-4 w-4 ${task.isTaskPinned ? 'fill-amber-400' : ''}`}
                    strokeWidth={2}
                    aria-hidden
                />
            </button>
            <button
                type="button"
                onClick={() => axiosDuplicateTask()}
                className="rounded-md border border-transparent p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                aria-label={`Duplicate task ${task.title}`}
            >
                <LucideCopy className="h-4 w-4" strokeWidth={2} aria-hidden />
            </button>
            <button
                type="button"
                onClick={() => axiosChangePriority()}
                className="rounded-md border border-transparent p-1 text-amber-400 transition-colors hover:bg-amber-950 hover:text-amber-200"
                aria-label={`Cycle priority for ${task.title}`}
                title={`Priority: ${task.priority || 'none'}`}
            >
                <LucideFlag className="h-4 w-4" strokeWidth={2} aria-hidden />
            </button>
            <button
                type="button"
                onClick={() => taskChatWithAi(task._id)}
                className="rounded-md border border-zinc-700/80 bg-indigo-600 p-1 text-white shadow-sm transition-colors hover:bg-indigo-700"
                title="AI chat"
                aria-label={`Chat with AI about ${task.title}`}
            >
                <LucideMessageCircle className="h-4 w-4 text-white/95" strokeWidth={2} aria-hidden />
            </button>
        </div>
    );

    const shellClass =
        (isUpdatedNow
            ? 'ring-2 ring-indigo-400/40 ring-offset-1 ring-offset-zinc-50 '
            : '') +
        'group overflow-hidden border border-zinc-700/60 bg-zinc-900 shadow-sm transition-all duration-200 hover:border-zinc-500 hover:shadow-lg hover:-translate-y-0.5 ' +
        (isList
            ? 'rounded-lg p-1.5 sm:p-2'
            : 'h-full rounded-xl p-2 sm:p-2.5');

    const titleButton = (
        <button
            type="button"
            onClick={() => setShowActions((prev) => { return !prev; })}
            className="min-w-0 text-left text-sm font-semibold leading-snug text-zinc-100 transition-colors hover:text-indigo-300"
            aria-expanded={showActions}
            aria-label={`Toggle actions for ${task.title}`}
        >
            {highlightTitle(task.title, searchTerm)}
        </button>
    );

    const actionsVisibleClass = showActions ? 'flex' : 'hidden group-hover:flex';

    return (
        <div
            className={shellClass}
            draggable={draggable}
            onDragStart={(e) => {
                if (onDragStart) onDragStart(e, task._id);
            }}
        >
            <div className="flex items-center gap-1">
                <span className="cursor-grab select-none text-zinc-500" aria-hidden>⋮⋮</span>
                <div className="min-w-0 flex-1">{titleButton}</div>
            </div>
            {chips}
            {subtaskBar}
            {sendQueueBlock}
            <div className={`${actionsVisibleClass} mt-1.5 flex-wrap items-center gap-1`}>
                {selectEl}
                {iconButtons}
            </div>
            <TaskConfirmModal
                isOpen={deleteConfirmOpen}
                title="Delete task?"
                body={`Delete "${task.title}"? This cannot be undone.`}
                confirmLabel="Delete"
                onConfirm={() => {
                    setDeleteConfirmOpen(false);
                    void doDeleteTask();
                }}
                onCancel={() => setDeleteConfirmOpen(false)}
            />
        </div>
    );
};

export default TaskItem;
