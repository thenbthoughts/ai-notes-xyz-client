import type React from 'react';
import { tsPageTask } from "../../../../types/pages/tsPageTaskList";

import axiosCustom from '../../../../config/axiosCustom';
import { LucideClock, LucideEdit3, LucideInfo, LucideMessageCircle, LucidePin, LucideTrash2 } from "lucide-react";
import { taskChatWithAi } from "./utils/taskCrudUtils";

const TaskItem = ({
    task,
    taskStatusList,
    setRefreshRandomNum,
    setIsTaskAddModalIsOpen,
}: {
    task: tsPageTask;
    taskStatusList: {
        _id: string;
        statusTitle: string;
        listPosition: number;
    }[],
    setRefreshRandomNum: (value: React.SetStateAction<number>) => void;
    setIsTaskAddModalIsOpen: React.Dispatch<React.SetStateAction<{
        openStatus: boolean;
        modalType: "add" | "edit";
        recordId: string;
    }>>
}) => {
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
                return 'border-violet-300 bg-violet-100 text-violet-900';
            case 'high':
                return 'border-red-200 bg-red-50 text-red-900';
            case 'medium':
                return 'border-amber-200 bg-amber-50 text-amber-900';
            case 'low':
                return 'border-sky-200 bg-sky-50 text-sky-900';
            default:
                return 'border-zinc-200 bg-zinc-100 text-zinc-800';
        }
    };

    const now = new Date();
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    const isOverdue = dueDate && dueDate < now && !task.isCompleted;

    let isUpdatedNow = false;
    if (task.updatedAtUtc) {
        const updatedAt = new Date(task.updatedAtUtc);
        const timeDiff = now.getTime() - updatedAt.getTime();
        const minutesDiff = Math.floor(timeDiff / (1000 * 60));
        if (minutesDiff < 5) {
            isUpdatedNow = true;
        }
    }

    const chip = 'inline-flex items-center gap-0.5 rounded-none border px-1.5 py-0 text-[10px] font-medium';

    return (
        <div
            className={
                (isUpdatedNow ? 'ring-2 ring-emerald-500 ring-offset-1 ' : '') +
                'group h-full rounded-none border border-zinc-300 bg-white p-2.5 shadow-[2px_2px_0_0_rgb(228_228_231)] transition-shadow hover:shadow-[3px_3px_0_0_rgb(212_212_216)]'
            }
        >
            <div className="flex items-start justify-between gap-2">
                <h3 className="min-w-0 text-sm font-semibold leading-snug text-zinc-900">{task.title}</h3>
            </div>

            <div className="mt-2 flex flex-wrap gap-1">
                {task.labels && task.labels.length > 0 &&
                    task.labels.map((label) => (
                        <span key={label} className={chip + ' border-zinc-200 bg-zinc-50 text-zinc-700'}>
                            {label}
                        </span>
                    ))}

                {task.isCompleted && (
                    <span className={chip + ' border-emerald-300 bg-emerald-50 text-emerald-900'}>Done</span>
                )}
                {task.isArchived && (
                    <span className={chip + ' border-zinc-400 bg-zinc-200 text-zinc-800'}>Archived</span>
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
                                ? ' border-red-300 bg-red-50 text-red-800'
                                : ' border-zinc-200 bg-zinc-50 text-zinc-700')
                        }
                    >
                        <LucideClock className="h-3 w-3 shrink-0" strokeWidth={2} />
                        {dueDate.toLocaleDateString()}{' '}
                        <span className="hidden sm:inline">{dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <select
                    value={task.taskStatusId}
                    onChange={(e) => axiosChangeTaskList(e.target.value)}
                    className="min-w-0 max-w-full flex-1 rounded-none border border-zinc-300 bg-white py-1 pl-1.5 pr-6 text-[11px] text-zinc-800 focus:border-emerald-600 focus:outline-none sm:max-w-[140px]"
                >
                    {taskStatusList.map((taskStatus) => (
                        <option key={taskStatus._id} value={taskStatus._id}>
                            {taskStatus.statusTitle}
                        </option>
                    ))}
                </select>
                <div className="flex items-center gap-0.5">
                    <button
                        type="button"
                        onClick={() => axiosDeleteTask(task._id)}
                        className="rounded-none border border-transparent p-1 text-red-600 hover:bg-red-50"
                        aria-label="Delete task"
                    >
                        <LucideTrash2 size={15} strokeWidth={2} />
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsTaskAddModalIsOpen({ openStatus: true, modalType: 'edit', recordId: task._id })}
                        className="rounded-none border border-transparent p-1 text-emerald-700 hover:bg-emerald-50"
                        aria-label="Edit task"
                    >
                        <LucideEdit3 size={15} strokeWidth={2} />
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsTaskAddModalIsOpen({ openStatus: true, modalType: 'edit', recordId: task._id })}
                        className="rounded-none border border-transparent p-1 text-zinc-600 hover:bg-zinc-100"
                        aria-label="View task details"
                    >
                        <LucideInfo size={15} strokeWidth={2} />
                    </button>
                    <button
                        type="button"
                        onClick={() => axiosChangeTaskPin({ isTaskPinned: !task.isTaskPinned })}
                        className={
                            (task.isTaskPinned ? 'border-amber-300 bg-amber-50 text-amber-800 ' : 'border-transparent text-zinc-500 hover:bg-zinc-100 ') +
                            'rounded-none border p-1'
                        }
                        aria-label="Pin task"
                    >
                        <LucidePin size={15} strokeWidth={2} className={task.isTaskPinned ? 'fill-amber-400' : ''} />
                    </button>
                </div>
            </div>

            <button
                type="button"
                onClick={() => taskChatWithAi(task._id)}
                className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-none border border-violet-300 bg-violet-50 py-1 text-[10px] font-semibold uppercase tracking-wide text-violet-900 hover:bg-violet-100"
            >
                <LucideMessageCircle className="h-3.5 w-3.5" strokeWidth={2} />
                AI chat
            </button>
        </div>
    );
};

export default TaskItem;
