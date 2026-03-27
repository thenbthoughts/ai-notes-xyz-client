import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { DebounceInput } from 'react-debounce-input';
import {
    Archive,
    ChevronDown,
    ChevronRight,
    Flag,
    LayoutGrid,
    LayoutList,
    ListFilter,
    List as LucideListRows,
    LucideSearch,
    LucideX,
    ListTodo,
} from 'lucide-react';

import axiosCustom from '../../../../config/axiosCustom';
import TaskAiTools from './TaskAiTools';

import TaskItem from './TaskItem';
import { tsPageTask } from '../../../../types/pages/tsPageTaskList';
import ComponentTaskListFooter from './ComponentTaskListFooter';
import TaskAddOrEdit from './ComponentTaskEdit/TaskAddOrEdit';
import ComponentTaskStatusListNames from './componentTaskStatusListNames/componentTaskStatusListNames';
import ComponentTaskWorkspace from './componentTaskWorkspace/ComponentTaskWorkspace';
import { jotaiStateTaskWorkspaceId } from './stateJotai/taskStateJotai';
import ComponentTaskListLabels from './ComponentTaskListLabels';
import { atomWithStorage } from 'jotai/utils';

const expandedSectionsAtom = atomWithStorage(`taskList-expanded`, [] as string[]);

export type TaskListLayoutMode = 'grid' | 'list';

const taskListLayoutModeAtom = atomWithStorage<TaskListLayoutMode>(`taskList-layout`, 'grid');

const selectClass =
    'w-full rounded-lg border border-violet-200/50 bg-white/90 py-1.5 px-2 text-xs leading-tight text-zinc-900 shadow-sm backdrop-blur-sm focus:border-fuchsia-400/60 focus:outline-none focus:ring-1 focus:ring-fuchsia-300/35';

/** Playful left accent + header tint per status column (cycles). */
const STATUS_BOARD_ACCENTS = [
    {
        section: 'border-l-[3px] border-l-sky-400 shadow-sky-500/5',
        head: 'bg-gradient-to-r from-sky-100/90 via-cyan-50/50 to-white/80',
        badge: 'bg-sky-200/80 text-sky-900',
        toggle: 'border-sky-200/80 text-sky-700 hover:bg-sky-50',
    },
    {
        section: 'border-l-[3px] border-l-violet-400 shadow-violet-500/5',
        head: 'bg-gradient-to-r from-violet-100/90 via-fuchsia-50/50 to-white/80',
        badge: 'bg-violet-200/80 text-violet-900',
        toggle: 'border-violet-200/80 text-violet-700 hover:bg-violet-50',
    },
    {
        section: 'border-l-[3px] border-l-amber-400 shadow-amber-500/5',
        head: 'bg-gradient-to-r from-amber-100/90 via-orange-50/50 to-white/80',
        badge: 'bg-amber-200/80 text-amber-950',
        toggle: 'border-amber-200/80 text-amber-800 hover:bg-amber-50',
    },
    {
        section: 'border-l-[3px] border-l-emerald-400 shadow-emerald-500/5',
        head: 'bg-gradient-to-r from-emerald-100/90 via-teal-50/50 to-white/80',
        badge: 'bg-emerald-200/80 text-emerald-900',
        toggle: 'border-emerald-200/80 text-emerald-800 hover:bg-emerald-50',
    },
    {
        section: 'border-l-[3px] border-l-rose-400 shadow-rose-500/5',
        head: 'bg-gradient-to-r from-rose-100/90 via-pink-50/50 to-white/80',
        badge: 'bg-rose-200/80 text-rose-900',
        toggle: 'border-rose-200/80 text-rose-800 hover:bg-rose-50',
    },
    {
        section: 'border-l-[3px] border-l-indigo-400 shadow-indigo-500/5',
        head: 'bg-gradient-to-r from-indigo-100/90 via-blue-50/50 to-white/80',
        badge: 'bg-indigo-200/80 text-indigo-900',
        toggle: 'border-indigo-200/80 text-indigo-800 hover:bg-indigo-50',
    },
] as const;

const TaskList: React.FC = () => {
    const [refreshRandomNum, setRefreshRandomNum] = useState(0);
    const [tasks, setTasks] = useState<tsPageTask[]>([]);
    const [searchInput, setSearchInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [priority, setPriority] = useState('');
    const [isArchived, setIsArchived] = useState('not-archived');
    const [isCompleted, setIsCompleted] = useState('not-completed');
    const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

    const [workspaceId, setWorkspaceId] = useAtom(jotaiStateTaskWorkspaceId);

    const [taskStatusList, setTaskStatusList] = useState<{
        _id: string;
        statusTitle: string;
        listPosition: number;
    }[]>([]);

    const [isTaskAddModalIsOpen, setIsTaskAddModalIsOpen] = useState({
        openStatus: false,
        modalType: 'add' as 'add' | 'edit',
        recordId: ''
    });

    const [expandedSections, setExpandedSections] = useAtom(expandedSectionsAtom);
    const [taskLayoutMode, setTaskLayoutMode] = useAtom(taskListLayoutModeAtom);

    useEffect(() => {
        fetchTasks();
    }, [refreshRandomNum]);

    useEffect(() => {
        setRefreshRandomNum(Math.floor(Math.random() * 1_000_000));
    }, [
        isTaskAddModalIsOpen,
        priority,
        isArchived,
        isCompleted,
        workspaceId,
        searchInput,
        selectedLabels
    ]);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const addTaskDialog = searchParams.get('add-task-dialog');
        if (addTaskDialog === 'yes') {
            setIsTaskAddModalIsOpen({
                openStatus: true,
                modalType: 'add',
                recordId: '',
            });
            searchParams.delete('add-task-dialog');
            window.history.replaceState({}, '', window.location.pathname + '?' + searchParams.toString());
        }
    }, []);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const editTaskId = searchParams.get('edit-task-id');
        if (editTaskId) {
            setIsTaskAddModalIsOpen({
                openStatus: true,
                modalType: 'edit',
                recordId: editTaskId,
            });
            searchParams.delete('edit-task-id');
            window.history.replaceState({}, '', window.location.pathname + '?' + searchParams.toString());
        }
    }, []);

    const fetchTasks = async () => {
        setLoading(true);
        const config = {
            method: 'post',
            url: '/api/task/crud/taskGet',
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                searchInput: searchInput || '',
                priority: priority || '',
                isArchived: isArchived || '',
                isCompleted: isCompleted || '',
                taskWorkspaceId: workspaceId || '',
                labelArr: selectedLabels || []
            }
        };

        try {
            const response = await axiosCustom.request(config);
            const tempTaskArr = response.data.docs;
            setTasks(tempTaskArr);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const workspace = searchParams.get('workspace');
        if (workspace) {
            setWorkspaceId(workspace);
        }
    }, []);

    const renderLeft = () => {
        return (
            <div
                className="border-r border-fuchsia-200/40 bg-gradient-to-b from-fuchsia-50/50 via-white to-cyan-50/30 lg:rounded-l-2xl lg:border lg:border-r-0 lg:border-violet-200/50"
                id="task-filter"
            >
                <div className="h-full overflow-y-auto bg-gradient-to-b from-white/50 to-violet-50/20 px-2 py-2 backdrop-blur-[2px]">
                <header className="mb-2 flex items-center gap-1.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-sm shadow-fuchsia-500/25">
                        <LayoutList className="h-3.5 w-3.5 text-white" strokeWidth={2} aria-hidden />
                    </span>
                    <div className="min-w-0">
                        <h2 className="bg-gradient-to-r from-violet-700 to-fuchsia-600 bg-clip-text text-sm font-semibold leading-tight text-transparent">
                            Workspace & filters
                        </h2>
                        <p className="text-[11px] leading-tight text-violet-600/70">Lists · filters</p>
                    </div>
                </header>

                <ComponentTaskWorkspace />

                {workspaceId.length === 24 && (
                    <div className="mt-2 border-t border-violet-100/80 pt-2">
                        <ComponentTaskStatusListNames
                            workspaceId={workspaceId}
                            setTaskStatusList={setTaskStatusList}
                        />
                    </div>
                )}

                <section className="mt-2 space-y-2 border-t border-cyan-100/80 pt-2" aria-label="Task filters">
                    <h3 className="flex items-center gap-1 text-xs font-semibold text-cyan-900">
                        <span className="rounded-md bg-cyan-100 p-0.5">
                            <ListFilter className="h-3 w-3 text-cyan-600" strokeWidth={2} aria-hidden />
                        </span>
                        List filters
                    </h3>

                    <div className="relative">
                        <LucideSearch
                            className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-sky-400"
                            strokeWidth={2}
                        />
                        <DebounceInput
                            debounceTimeout={500}
                            type="search"
                            placeholder="Search tasks…"
                            className="w-full rounded-lg border border-sky-200/70 bg-sky-50/40 py-1.5 pl-7 pr-7 text-xs text-zinc-900 shadow-sm placeholder:text-sky-400/80 backdrop-blur-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-300/40"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            id="task-search"
                            autoComplete="off"
                        />
                        {searchInput.length > 0 && (
                            <button
                                type="button"
                                className="absolute right-1 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-sky-500 transition-colors hover:bg-sky-100 hover:text-sky-800"
                                onClick={() => setSearchInput('')}
                                aria-label="Clear search"
                            >
                                <LucideX className="h-3 w-3" strokeWidth={2} />
                            </button>
                        )}
                    </div>

                    <div>
                        <label className="mb-0.5 flex items-center gap-1 text-[11px] font-medium text-rose-700/90">
                            <Flag className="h-3 w-3 text-rose-500" strokeWidth={2} aria-hidden />
                            Priority
                        </label>
                        <select value={priority} onChange={(e) => setPriority(e.target.value)} className={selectClass}>
                            <option value="">All</option>
                            <option value="very-high">Very high</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                            <option value="very-low">Very low</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-0.5 flex items-center gap-1 text-[11px] font-medium text-amber-800/90">
                            <Archive className="h-3 w-3 text-amber-500" strokeWidth={2} aria-hidden />
                            Archive
                        </label>
                        <select value={isArchived} onChange={(e) => setIsArchived(e.target.value)} className={selectClass}>
                            <option value="">All</option>
                            <option value="archived">Archived</option>
                            <option value="not-archived">Not archived</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-0.5 flex items-center gap-1 text-[11px] font-medium text-emerald-800/90">
                            <ListTodo className="h-3 w-3 text-emerald-500" strokeWidth={2} aria-hidden />
                            Completion
                        </label>
                        <select value={isCompleted} onChange={(e) => setIsCompleted(e.target.value)} className={selectClass}>
                            <option value="">All</option>
                            <option value="completed">Completed</option>
                            <option value="not-completed">Not completed</option>
                        </select>
                    </div>
                </section>

                {workspaceId.length === 24 && (
                    <div className="mt-2 border-t border-fuchsia-100/80 pt-2">
                        <ComponentTaskListLabels
                            workspaceId={workspaceId}
                            selectedLabels={selectedLabels}
                            setSelectedLabels={setSelectedLabels}
                        />
                    </div>
                )}
                </div>
            </div>
        );
    };

    const renderRight = () => {
        return (
            <div
                id="task-list"
                className="mt-3 min-h-[200px] overflow-hidden rounded-xl border border-violet-200/50 bg-gradient-to-br from-white/90 via-fuchsia-50/15 to-cyan-50/25 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7)] backdrop-blur-[2px] lg:mt-0 lg:rounded-none lg:rounded-r-2xl lg:border-l-0 lg:border-t lg:border-b lg:border-r lg:border-violet-200/50"
            >
                <div className="p-2">
                {loading && (
                    <div className="flex justify-center py-6">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-200 border-t-fuchsia-500 border-r-cyan-400" />
                    </div>
                )}

                {!loading && workspaceId.length === 24 && (
                    <div className="space-y-2">
                        <div className="mb-1 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-violet-200/50 bg-white/60 px-2 py-1 shadow-sm backdrop-blur-sm">
                            <span className="text-[11px] font-semibold text-violet-700/90">Task layout</span>
                            <div
                                className="inline-flex rounded-md border border-violet-200/60 bg-white/90 p-0.5 shadow-sm"
                                role="group"
                                aria-label="Switch task layout"
                            >
                                <button
                                    type="button"
                                    onClick={() => setTaskLayoutMode('grid')}
                                    className={
                                        taskLayoutMode === 'grid'
                                            ? 'inline-flex items-center gap-0.5 rounded bg-gradient-to-r from-violet-500 to-fuchsia-500 px-2 py-1 text-[11px] font-bold text-white shadow-sm'
                                            : 'inline-flex items-center gap-0.5 rounded px-2 py-1 text-[11px] font-semibold text-violet-600 transition-colors hover:bg-violet-50'
                                    }
                                    aria-pressed={taskLayoutMode === 'grid'}
                                >
                                    <LayoutGrid className="h-3 w-3" strokeWidth={2} aria-hidden />
                                    Grid
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTaskLayoutMode('list')}
                                    className={
                                        taskLayoutMode === 'list'
                                            ? 'inline-flex items-center gap-0.5 rounded bg-gradient-to-r from-violet-500 to-fuchsia-500 px-2 py-1 text-[11px] font-bold text-white shadow-sm'
                                            : 'inline-flex items-center gap-0.5 rounded px-2 py-1 text-[11px] font-semibold text-violet-600 transition-colors hover:bg-violet-50'
                                    }
                                    aria-pressed={taskLayoutMode === 'list'}
                                >
                                    <LucideListRows className="h-3 w-3" strokeWidth={2} aria-hidden />
                                    List
                                </button>
                            </div>
                        </div>
                        {taskStatusList.map((itemTaskStatus, statusIndex) => {
                            const tempTaskList = tasks.filter((filterTask) => itemTaskStatus._id === filterTask.taskStatusId);
                            const accent =
                                STATUS_BOARD_ACCENTS[statusIndex % STATUS_BOARD_ACCENTS.length] ??
                                STATUS_BOARD_ACCENTS[0];

                            const isExpanded = expandedSections.includes(itemTaskStatus._id);

                            const toggleExpanded = () => {
                                setExpandedSections((prev) => {
                                    let returnArr: string[];
                                    if (prev.includes(itemTaskStatus._id)) {
                                        returnArr = prev.filter((id) => id !== itemTaskStatus._id);
                                    } else {
                                        returnArr = [...prev, itemTaskStatus._id];
                                    }
                                    if (returnArr.length > 50) {
                                        returnArr = returnArr.slice(-50);
                                    }
                                    return returnArr;
                                });
                            };

                            return (
                                <section
                                    key={itemTaskStatus._id}
                                    className={`overflow-hidden rounded-xl border border-violet-100/80 bg-white/95 shadow-md transition-shadow hover:shadow-lg ${accent.section}`}
                                >
                                    <div
                                        className={`flex items-center justify-between gap-2 border-b border-white/60 px-3 py-2.5 ${accent.head}`}
                                    >
                                        <h2 className="min-w-0 text-base font-semibold tracking-tight text-zinc-900">
                                            <span className="truncate">{itemTaskStatus.statusTitle}</span>
                                            {tempTaskList.length > 0 && (
                                                <span
                                                    className={`ml-1.5 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${accent.badge}`}
                                                >
                                                    {tempTaskList.length}
                                                </span>
                                            )}
                                        </h2>
                                        <button
                                            type="button"
                                            onClick={toggleExpanded}
                                            className={`shrink-0 rounded-lg border bg-white/90 p-1.5 shadow-sm transition-colors ${accent.toggle}`}
                                            aria-expanded={isExpanded}
                                            title={isExpanded ? 'Show tasks' : 'Hide tasks'}
                                        >
                                            {isExpanded === false ? (
                                                <ChevronDown className="h-4 w-4" strokeWidth={2} />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" strokeWidth={2} />
                                            )}
                                        </button>
                                    </div>
                                    {isExpanded === false && (
                                        <div className="p-3 pt-2">
                                            {tempTaskList.length === 0 && (
                                                <p className="py-6 text-center text-xs text-violet-500/80">No tasks in this list.</p>
                                            )}
                                            <ul
                                                className={
                                                    taskLayoutMode === 'grid'
                                                        ? 'grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3'
                                                        : 'flex flex-col gap-1.5'
                                                }
                                            >
                                                {tempTaskList.map((task) => (
                                                    <li
                                                        key={task._id}
                                                        className={taskLayoutMode === 'list' ? 'min-w-0' : ''}
                                                    >
                                                        <TaskItem
                                                            task={task}
                                                            taskStatusList={taskStatusList}
                                                            setRefreshRandomNum={setRefreshRandomNum}
                                                            setIsTaskAddModalIsOpen={setIsTaskAddModalIsOpen}
                                                            layout={taskLayoutMode}
                                                        />
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </section>
                            );
                        })}
                    </div>
                )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-0 w-full bg-gradient-to-br from-fuchsia-100/75 via-sky-50/90 to-amber-100/65 pb-20 pt-2">
            <div className="container m-auto max-w-[1600px] px-2">
                <header className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-violet-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/20">
                            <LayoutList className="h-4 w-4 text-white" strokeWidth={2} aria-hidden />
                        </span>
                        <div>
                            <h1 className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 bg-clip-text text-lg font-bold leading-tight tracking-tight text-transparent sm:text-xl">
                                Tasks
                            </h1>
                            <p className="text-[11px] leading-tight text-violet-600/75">Workspace · board</p>
                        </div>
                    </div>
                </header>

                <TaskAiTools setRefreshParentRandomNum={setRefreshRandomNum} />

                <div className="flex flex-col gap-0 lg:flex-row lg:items-stretch">
                    <div className="w-full shrink-0 lg:w-[min(26%,320px)] lg:min-w-[240px]">
                        {renderLeft()}
                    </div>
                    <div className="min-w-0 flex-1">{renderRight()}</div>
                </div>
            </div>

            <ComponentTaskListFooter setIsTaskAddModalIsOpen={setIsTaskAddModalIsOpen} />

            {isTaskAddModalIsOpen.openStatus && (
                <TaskAddOrEdit
                    isTaskAddModalIsOpen={isTaskAddModalIsOpen}
                    setIsTaskAddModalIsOpen={setIsTaskAddModalIsOpen}
                />
            )}
        </div>
    );
};

export default TaskList;
