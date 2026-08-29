import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
    Download,
    Clock,
    ArrowUpDown,
    Pin,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

import axiosCustom from '../../../../config/axiosCustom';
import TaskAiTools from './TaskAiTools';

import TaskItem from './TaskItem';
import TaskVirtualColumn from './TaskVirtualColumn';
import { tsPageTask } from '../../../../types/pages/tsPageTaskList';
import ComponentTaskListFooter from './ComponentTaskListFooter';
import TaskAddOrEdit from './ComponentTaskEdit/TaskAddOrEdit';
import ComponentTaskStatusListNames from './componentTaskStatusListNames/componentTaskStatusListNames';
import ComponentTaskWorkspace from './componentTaskWorkspace/ComponentTaskWorkspace';
import { jotaiStateTaskWorkspaceId, taskFilterSearchAtom, taskFilterPriorityAtom, taskFilterArchivedAtom, taskFilterCompletedAtom, taskFilterLabelsAtom, taskSortOverdueFirstAtom, taskFilterDueFromAtom, taskFilterDueToAtom, taskFilterPinnedAtom, taskSortByAtom } from './stateJotai/taskStateJotai';
import ComponentTaskListLabels from './ComponentTaskListLabels';
import { atomWithStorage } from 'jotai/utils';

const expandedSectionsAtom = atomWithStorage(`taskList-expanded`, [] as string[]);

export type TaskListLayoutMode = 'grid' | 'list';

const taskListLayoutModeAtom = atomWithStorage<TaskListLayoutMode>(`taskList-layout`, 'grid');

const selectClass =
    'w-full rounded-lg border border-zinc-700/90 bg-zinc-900 py-2 pl-2.5 pr-2 text-xs text-zinc-100 shadow-sm focus:border-indigo-400/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/15';

const STATUS_BOARD_ACCENTS = [
    {
        section: 'border-l-2 border-l-sky-400',
        head: 'border-b border-zinc-800 bg-zinc-950/90',
        badge: 'bg-sky-950 text-sky-300',
        toggle: 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-zinc-800',
    },
    {
        section: 'border-l-2 border-l-violet-400',
        head: 'border-b border-zinc-800 bg-zinc-950/90',
        badge: 'bg-violet-950 text-violet-300',
        toggle: 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-zinc-800',
    },
    {
        section: 'border-l-2 border-l-amber-400',
        head: 'border-b border-zinc-800 bg-zinc-950/90',
        badge: 'bg-amber-950 text-amber-300',
        toggle: 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-zinc-800',
    },
    {
        section: 'border-l-2 border-l-emerald-400',
        head: 'border-b border-zinc-800 bg-zinc-950/90',
        badge: 'bg-emerald-950 text-emerald-300',
        toggle: 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-zinc-800',
    },
    {
        section: 'border-l-2 border-l-rose-400',
        head: 'border-b border-zinc-800 bg-zinc-950/90',
        badge: 'bg-rose-950 text-rose-300',
        toggle: 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-zinc-800',
    },
    {
        section: 'border-l-2 border-l-indigo-400',
        head: 'border-b border-zinc-800 bg-zinc-950/90',
        badge: 'bg-indigo-950 text-indigo-300',
        toggle: 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-zinc-800',
    },
] as const;

const lastWorkspaceKey = "taskList-lastWorkspaceId";

const readLastWorkspace = () => {
    try {
        const raw = localStorage.getItem(lastWorkspaceKey);
        if (typeof raw === "string" && raw.length === 24) {
            return raw;
        }
        return "";
    } catch {
        return "";
    }
};

const writeLastWorkspace = (next: string) => {
    try {
        localStorage.setItem(lastWorkspaceKey, next);
    } catch {
        return;
    }
};

const TaskList: React.FC = () => {
    const [refreshRandomNum, setRefreshRandomNum] = useState(0);
    const [tasks, setTasks] = useState<tsPageTask[]>([]);
    const [searchInput, setSearchInput] = useAtom(taskFilterSearchAtom);
    const [loading, setLoading] = useState(false);
    const [priority, setPriority] = useAtom(taskFilterPriorityAtom);
    const [isArchived, setIsArchived] = useAtom(taskFilterArchivedAtom);
    const [isCompleted, setIsCompleted] = useAtom(taskFilterCompletedAtom);
    const [selectedLabels, setSelectedLabels] = useAtom(taskFilterLabelsAtom);
    const [overdueFirst, setOverdueFirst] = useAtom(taskSortOverdueFirstAtom);
    const [dueFrom, setDueFrom] = useAtom(taskFilterDueFromAtom);
    const [dueTo, setDueTo] = useAtom(taskFilterDueToAtom);
    const [pinnedFilter, setPinnedFilter] = useAtom(taskFilterPinnedAtom);
    const [sortBy, setSortBy] = useAtom(taskSortByAtom);
    const [dragId, setDragId] = useState<string | null>(null);
    const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);

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
    const [quickAddByStatus, setQuickAddByStatus] = useState<Record<string, string>>({});

    useEffect(() => {
        setRefreshRandomNum(Math.floor(Math.random() * 1_000_000));
    }, [
        isTaskAddModalIsOpen,
        priority,
        isArchived,
        isCompleted,
        workspaceId,
        searchInput,
        selectedLabels,
        dueFrom,
        dueTo,
        pinnedFilter
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

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            const active = document.activeElement as HTMLElement | null;
            if (active) {
                const tag = active.tagName.toLowerCase();
                if (tag === 'input' || tag === 'textarea' || tag === 'select') {
                    return;
                }
                if (active.isContentEditable) {
                    return;
                }
            }
            if (e.key === 'n' && !e.ctrlKey && !e.metaKey && !e.altKey) {
                e.preventDefault();
                setIsTaskAddModalIsOpen({ openStatus: true, modalType: 'add', recordId: '' });
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    const [openActiveTaskCountByStatusId, setOpenActiveTaskCountByStatusId] = useState<
        Record<string, number>
    >({});

    const fetchOpenTaskCountsByTaskStatus = async (signal?: AbortSignal) => {
        if (workspaceId.length !== 24) {
            setOpenActiveTaskCountByStatusId({});
            return;
        }
        const config = {
            method: 'post',
            url: '/api/task/crud/taskGetOpenCountsByTaskStatus',
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                taskWorkspaceId: workspaceId,
            },
            signal,
        };

        try {
            const response = await axiosCustom.request(config);
            if (signal?.aborted) return;
            const rows = response.data.docs as { taskStatusId: string; count: number }[] | undefined;
            if (!Array.isArray(rows)) {
                setOpenActiveTaskCountByStatusId({});
                return;
            }
            const next: Record<string, number> = {};
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                if (typeof row.taskStatusId === 'string') {
                    next[row.taskStatusId] = typeof row.count === 'number' ? row.count : 0;
                }
            }
            setOpenActiveTaskCountByStatusId(next);
        } catch (error) {
            if (axios.isCancel(error) || (error as { code?: string })?.code === 'ERR_CANCELED') {
                return;
            }
            console.error('Error fetching open task counts by status:', error);
        }
    };

    const fetchTasks = async (signal?: AbortSignal) => {
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
                labelArr: selectedLabels || [],
                dueDateFrom: dueFrom || '',
                dueDateTo: dueTo || '',
                isTaskPinned: pinnedFilter || ''
            },
            signal,
        };

        try {
            const response = await axiosCustom.request(config);
            if (signal?.aborted) return;
            const tempTaskArr = response.data.docs;
            setTasks(tempTaskArr);
        } catch (error) {
            if (axios.isCancel(error) || (error as { code?: string })?.code === 'ERR_CANCELED') {
                return;
            }
            console.error('Error fetching tasks:', error);
        } finally {
            if (!signal?.aborted) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        void fetchOpenTaskCountsByTaskStatus(controller.signal);
        void fetchTasks(controller.signal);
        return () => controller.abort();
    }, [refreshRandomNum]);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const workspace = searchParams.get('workspace');
        if (workspace) {
            setWorkspaceId(workspace);
            writeLastWorkspace(workspace);
        } else {
            const last = readLastWorkspace();
            if (last && workspaceId.length !== 24) {
                setWorkspaceId(last);
            }
        }
    }, []);

    const handleQuickAdd = async (statusId: string) => {
        const title = (quickAddByStatus[statusId] || '').trim();
        if (!title) {
            toast.error('Enter a task title');
            return;
        }
        if (workspaceId.length !== 24) {
            toast.error('Select a workspace first');
            return;
        }
        try {
            await axiosCustom.post('/api/task/crud/taskAdd', {
                title,
                taskStatusId: statusId,
                taskWorkspaceId: workspaceId,
            });
            setQuickAddByStatus((prev) => {
                return { ...prev, [statusId]: '' };
            });
            toast.success('Task added');
            setRefreshRandomNum(Math.floor(Math.random() * 1_000_000));
        } catch (error) {
            console.error('Quick add failed', error);
            toast.error('Failed to add task');
        }
    };

    const handleExportCsv = () => {
        if (tasks.length === 0) {
            toast.error('No tasks to export');
            return;
        }
        const headers = ['title', 'statusId', 'priority', 'dueDate', 'labels', 'isCompleted', 'isArchived'];
        const escapeCsv = (v: string) => {
            if (v.includes(',') || v.includes('"') || v.includes('\n')) {
                return '"' + v.replace(/"/g, '""') + '"';
            }
            return v;
        };
        const rows = tasks.map((t) => {
            const due = t.dueDate ? new Date(t.dueDate).toISOString() : '';
            const labels = (t.labels || []).join('|');
            return [
                escapeCsv(t.title || ''),
                escapeCsv(t.taskStatusId || ''),
                escapeCsv(t.priority || ''),
                escapeCsv(due),
                escapeCsv(labels),
                String(t.isCompleted),
                String(t.isArchived),
            ].join(',');
        });
        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tasks-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('CSV exported');
    };

    const sortTasks = (list: tsPageTask[]) => {
        const copy = [...list];
        if (sortBy === 'updated') {
            copy.sort((a, b) => {
                const av = a.updatedAtUtc ? new Date(a.updatedAtUtc).getTime() : 0;
                const bv = b.updatedAtUtc ? new Date(b.updatedAtUtc).getTime() : 0;
                return bv - av;
            });
        } else if (sortBy === 'tags') {
            copy.sort((a, b) => {
                const al = (a.labels || []).length;
                const bl = (b.labels || []).length;
                if (bl !== al) return bl - al;
                return (a.title || '').localeCompare(b.title || '');
            });
        } else if (sortBy === 'title') {
            copy.sort((a, b) => {
                return (a.title || '').localeCompare(b.title || '');
            });
        }
        if (!overdueFirst) {
            return copy;
        }
        const now = new Date().getTime();
        copy.sort((a, b) => {
            const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
            const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
            const aOver = aDue < now && !a.isCompleted ? 0 : 1;
            const bOver = bDue < now && !b.isCompleted ? 0 : 1;
            if (aOver !== bOver) {
                return aOver - bOver;
            }
            if (aDue !== bDue) {
                return aDue - bDue;
            }
            return 0;
        });
        return copy;
    };

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDragId(id);
        e.dataTransfer.effectAllowed = 'move';
        try {
            e.dataTransfer.setData('text/plain', id);
        } catch {
            return;
        }
    };

    const handleDropOnStatus = async (statusId: string) => {
        if (!dragId) return;
        const task = tasks.find((t) => { return t._id === dragId; });
        if (!task) {
            setDragId(null);
            return;
        }
        if (task.taskStatusId === statusId) {
            setDragId(null);
            return;
        }
        const prevStatus = task.taskStatusId;
        setTasks((prev) => {
            return prev.map((t) => {
                if (t._id === dragId) {
                    return { ...t, taskStatusId: statusId };
                }
                return t;
            });
        });
        setDragId(null);
        setDragOverStatus(null);
        try {
            await axiosCustom.post('/api/task/crud/taskEdit', { id: dragId, taskStatusId: statusId, taskWorkspaceId: task.taskWorkspaceId });
            setRefreshRandomNum(Math.floor(Math.random() * 1_000_000));
            toast((tToast) => {
                return (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-100">Moved</span>
                        <button
                            type="button"
                            onClick={() => {
                                toast.dismiss(tToast.id);
                                axiosCustom.post('/api/task/crud/taskEdit', { id: dragId, taskStatusId: prevStatus, taskWorkspaceId: task.taskWorkspaceId }).then(() => {
                                    setRefreshRandomNum(Math.floor(Math.random() * 1_000_000));
                                    toast.success('Undone');
                                }).catch(() => {
                                    toast.error('Undo failed');
                                });
                            }}
                            className="rounded bg-zinc-800 px-2 py-1 text-xs font-medium text-white hover:bg-zinc-700"
                            aria-label="Undo move"
                        >
                            Undo
                        </button>
                    </div>
                );
            }, { duration: 4000 });
        } catch {
            setTasks((prev) => {
                return prev.map((t) => {
                    if (t._id === dragId) {
                        return { ...t, taskStatusId: prevStatus };
                    }
                    return t;
                });
            });
            toast.error('Move failed');
        }
    };

    const openCount = tasks.filter((t) => { return !t.isCompleted && !t.isArchived; }).length;
    const doneCount = tasks.filter((t) => { return t.isCompleted; }).length;
    const totalOpenForProgress = Object.values(openActiveTaskCountByStatusId).reduce((sum, v) => { return sum + v; }, 0);

    const renderLeft = () => {
        return (
            <div
                className="mb-3 rounded-xl border border-zinc-700/60 bg-zinc-900 shadow-sm lg:mb-0 lg:rounded-l-xl lg:rounded-r-none lg:border-r-0"
                id="task-filter"
            >
                <div className="h-full overflow-y-auto px-2.5 py-2.5 sm:px-3 sm:py-3">
                <header className="mb-2 flex items-center gap-1.5 sm:mb-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-sm">
                        <LayoutList className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                    </span>
                    <div className="min-w-0">
                        <h2 className="text-sm font-semibold leading-tight text-zinc-100">
                            Workspace & filters
                        </h2>
                        <p className="text-[11px] leading-tight text-zinc-500">Lists · filters</p>
                    </div>
                </header>

                <ComponentTaskWorkspace />

                {workspaceId.length === 24 && (
                    <div className="mt-2 border-t border-zinc-800 pt-2">
                        <ComponentTaskStatusListNames
                            workspaceId={workspaceId}
                            setTaskStatusList={setTaskStatusList}
                            openActiveTaskCountByStatusId={openActiveTaskCountByStatusId}
                        />
                    </div>
                )}

                <section className="mt-2 space-y-1.5 border-t border-zinc-800 pt-2 sm:space-y-2" aria-label="Task filters">
                    <h3 className="flex items-center gap-1 text-xs font-medium text-zinc-700">
                        <span className="rounded-md bg-zinc-800 p-0.5">
                            <ListFilter className="h-3 w-3 text-zinc-400" strokeWidth={2} aria-hidden />
                        </span>
                        List filters
                    </h3>

                    <div className="relative">
                        <LucideSearch
                            className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400"
                            strokeWidth={2}
                            aria-hidden
                        />
                        <DebounceInput
                            debounceTimeout={500}
                            type="search"
                            placeholder="Search tasks…"
                            className="w-full rounded-lg border border-zinc-700/90 bg-zinc-950/80 py-2 pl-7 pr-7 text-xs text-zinc-100 shadow-sm placeholder:text-zinc-400 focus:border-indigo-400/80 focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            id="task-search"
                            autoComplete="off"
                            aria-label="Search tasks"
                        />
                        {searchInput.length > 0 && (
                            <button
                                type="button"
                                className="absolute right-1 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-700"
                                onClick={() => setSearchInput('')}
                                aria-label="Clear search"
                            >
                                <LucideX className="h-3 w-3" strokeWidth={2} aria-hidden />
                            </button>
                        )}
                    </div>

                    <div>
                        <label className="mb-0.5 flex items-center gap-1 text-[11px] font-medium text-zinc-400">
                            <Flag className="h-3 w-3 text-zinc-400" strokeWidth={2} aria-hidden />
                            Priority
                        </label>
                        <select value={priority} onChange={(e) => setPriority(e.target.value)} className={selectClass} aria-label="Filter by priority">
                            <option value="">All</option>
                            <option value="very-high">Very high</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                            <option value="very-low">Very low</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-0.5 flex items-center gap-1 text-[11px] font-medium text-zinc-400">
                            <Archive className="h-3 w-3 text-zinc-400" strokeWidth={2} aria-hidden />
                            Archive
                        </label>
                        <select value={isArchived} onChange={(e) => setIsArchived(e.target.value)} className={selectClass} aria-label="Filter by archive">
                            <option value="">All</option>
                            <option value="archived">Archived</option>
                            <option value="not-archived">Not archived</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-0.5 flex items-center gap-1 text-[11px] font-medium text-zinc-400">
                            <ListTodo className="h-3 w-3 text-zinc-400" strokeWidth={2} aria-hidden />
                            Completion
                        </label>
                        <select value={isCompleted} onChange={(e) => setIsCompleted(e.target.value)} className={selectClass} aria-label="Filter by completion">
                            <option value="">All</option>
                            <option value="completed">Completed</option>
                            <option value="not-completed">Not completed</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-0.5 flex items-center gap-1 text-[11px] font-medium text-zinc-400">
                            <Pin className="h-3 w-3 text-zinc-400" strokeWidth={2} aria-hidden />
                            Pinned
                        </label>
                        <select value={pinnedFilter} onChange={(e) => setPinnedFilter(e.target.value)} className={selectClass} aria-label="Filter by pinned">
                            <option value="">All</option>
                            <option value="pinned">Pinned only</option>
                            <option value="unpinned">Unpinned only</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-1">
                        <div>
                            <label className="mb-0.5 block text-[11px] font-medium text-zinc-400">Due from</label>
                            <input type="date" value={dueFrom} onChange={(e) => setDueFrom(e.target.value)} className={selectClass} aria-label="Due from date" />
                        </div>
                        <div>
                            <label className="mb-0.5 block text-[11px] font-medium text-zinc-400">Due to</label>
                            <input type="date" value={dueTo} onChange={(e) => setDueTo(e.target.value)} className={selectClass} aria-label="Due to date" />
                        </div>
                    </div>

                    <div>
                        <label className="mb-0.5 flex items-center gap-1 text-[11px] font-medium text-zinc-400">
                            <ArrowUpDown className="h-3 w-3 text-zinc-400" strokeWidth={2} aria-hidden />
                            Sort by
                        </label>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={selectClass} aria-label="Sort tasks">
                            <option value="title">Title</option>
                            <option value="updated">Updated</option>
                            <option value="tags">Tags count</option>
                        </select>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                        <button
                            type="button"
                            onClick={() => setOverdueFirst((prev) => { return !prev; })}
                            className={overdueFirst ? 'inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2 py-1 text-xs font-medium text-white' : 'inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-800'}
                            aria-label="Toggle overdue first sort"
                            aria-pressed={overdueFirst}
                        >
                            <ArrowUpDown className="h-3 w-3" strokeWidth={2} aria-hidden />
                            Overdue first
                        </button>
                        {(dueFrom || dueTo || pinnedFilter) && (
                            <button
                                type="button"
                                onClick={() => { setDueFrom(''); setDueTo(''); setPinnedFilter(''); }}
                                className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
                                aria-label="Clear due and pinned filters"
                            >
                                <LucideX className="h-3 w-3" strokeWidth={2} aria-hidden />
                                Clear
                            </button>
                        )}
                    </div>

                </section>

                {workspaceId.length === 24 && (
                    <div className="mt-2 border-t border-zinc-800 pt-2">
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
                className="mt-2 min-h-[200px] overflow-hidden rounded-xl border border-zinc-700/60 bg-zinc-900 shadow-sm sm:mt-3 lg:mt-0 lg:rounded-none lg:rounded-r-xl lg:border-l-0 lg:border-t lg:border-b lg:border-r lg:border-zinc-700/60"
            >
                <div className="p-2 sm:p-3">
                {loading && (
                    <div className="flex justify-center py-5 sm:py-6">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-600" />
                    </div>
                )}

                {!loading && workspaceId.length === 24 && (
                    <div className="space-y-2 sm:space-y-3">
                        <div className="mb-1 flex flex-wrap items-center justify-between gap-1.5 rounded-lg border border-zinc-700/70 bg-zinc-950/80 px-2 py-1.5 sm:gap-2 sm:px-2.5">
                            <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2">
                                <span className="text-[11px] font-medium text-zinc-700">Task layout</span>
                                <span className="text-[11px] tabular-nums text-zinc-500">
                                    {tasks.length === 1 ? '1 task' : `${tasks.length} tasks`}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <span className="rounded-full bg-emerald-950 px-2 py-0.5 text-[10px] font-semibold text-emerald-300" aria-label={`${openCount} open tasks`}>
                                        {openCount} open
                                    </span>
                                    <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-400" aria-label={`${doneCount} done tasks`}>
                                        {doneCount} done
                                    </span>
                                    {overdueFirst && (
                                        <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-950 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                                            <Clock className="h-3 w-3" strokeWidth={2} aria-hidden />
                                            overdue first
                                        </span>
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={handleExportCsv}
                                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
                                    aria-label="Export tasks CSV"
                                >
                                    <Download className="h-3 w-3" strokeWidth={2} aria-hidden />
                                    Export
                                </button>
                                <div
                                    className="inline-flex rounded-lg border border-zinc-700/80 bg-zinc-900 p-0.5 shadow-sm"
                                    role="group"
                                    aria-label="Switch task layout"
                                >
                                    <button
                                        type="button"
                                        onClick={() => setTaskLayoutMode('grid')}
                                        className={
                                            taskLayoutMode === 'grid'
                                                ? 'inline-flex items-center gap-0.5 rounded-md bg-zinc-900 px-2 py-1 text-[11px] font-medium text-white shadow-sm'
                                                : 'inline-flex items-center gap-0.5 rounded-md px-2 py-1 text-[11px] font-medium text-zinc-400 transition-colors hover:bg-zinc-800'
                                        }
                                        aria-pressed={taskLayoutMode === 'grid'}
                                        aria-label="Grid layout"
                                    >
                                        <LayoutGrid className="h-3 w-3" strokeWidth={2} aria-hidden />
                                        Grid
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTaskLayoutMode('list')}
                                        className={
                                            taskLayoutMode === 'list'
                                                ? 'inline-flex items-center gap-0.5 rounded-md bg-zinc-900 px-2 py-1 text-[11px] font-medium text-white shadow-sm'
                                                : 'inline-flex items-center gap-0.5 rounded-md px-2 py-1 text-[11px] font-medium text-zinc-400 transition-colors hover:bg-zinc-800'
                                        }
                                        aria-pressed={taskLayoutMode === 'list'}
                                        aria-label="List layout"
                                    >
                                        <LucideListRows className="h-3 w-3" strokeWidth={2} aria-hidden />
                                        List
                                    </button>
                                </div>
                            </div>
                        </div>
                        {taskStatusList.map((itemTaskStatus, statusIndex) => {
                            const filtered = tasks.filter((filterTask) => itemTaskStatus._id === filterTask.taskStatusId);
                            const tempTaskList = sortTasks(filtered);
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

                            const openCountForStatus = openActiveTaskCountByStatusId[itemTaskStatus._id] ?? 0;
                            const progressPct = totalOpenForProgress > 0 ? Math.round((openCountForStatus / totalOpenForProgress) * 100) : 0;
                            const quickAddValue = quickAddByStatus[itemTaskStatus._id] || '';

                            const isDragOver = dragOverStatus === itemTaskStatus._id;
                            return (
                                <section
                                    key={itemTaskStatus._id}
                                    onDragOver={(e) => { e.preventDefault(); setDragOverStatus(itemTaskStatus._id); }}
                                    onDragLeave={() => setDragOverStatus(null)}
                                    onDrop={(e) => { e.preventDefault(); void handleDropOnStatus(itemTaskStatus._id); }}
                                    className={`overflow-hidden rounded-xl border bg-zinc-900 shadow-sm transition-all duration-200 hover:shadow-lg ${accent.section} ${isDragOver ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-zinc-700/60'}`}
                                    aria-label={`Tasks for status ${itemTaskStatus.statusTitle}`}
                                >
                                    <div
                                        className={`flex items-center justify-between gap-2 px-2.5 py-2 sm:px-3 sm:py-2.5 ${accent.head}`}
                                    >
                                        <h2 className="min-w-0 text-sm font-semibold tracking-tight text-zinc-100 sm:text-base">
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
                                            className={`shrink-0 rounded-lg border p-1.5 shadow-sm transition-colors ${accent.toggle}`}
                                            aria-expanded={isExpanded}
                                            aria-label={isExpanded ? `Show tasks in ${itemTaskStatus.statusTitle}` : `Hide tasks in ${itemTaskStatus.statusTitle}`}
                                            title={isExpanded ? 'Show tasks' : 'Hide tasks'}
                                        >
                                            {isExpanded === false ? (
                                                <ChevronDown className="h-4 w-4" strokeWidth={2} aria-hidden />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
                                            )}
                                        </button>
                                    </div>
                                    <div className="h-1 w-full bg-zinc-800">
                                        <div
                                            className="h-full bg-indigo-600 transition-all"
                                            style={{ width: `${progressPct}%` }}
                                            aria-hidden
                                        />
                                    </div>
                                    <div className="flex gap-1 px-2 py-1.5 sm:px-3">
                                        <input
                                            type="text"
                                            placeholder={`Add task to ${itemTaskStatus.statusTitle}…`}
                                            value={quickAddValue}
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                setQuickAddByStatus((prev) => { return { ...prev, [itemTaskStatus._id]: v }; });
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    void handleQuickAdd(itemTaskStatus._id);
                                                }
                                            }}
                                            className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
                                            aria-label={`Quick add task to ${itemTaskStatus.statusTitle}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleQuickAdd(itemTaskStatus._id)}
                                            className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                                            aria-label={`Add quick task to ${itemTaskStatus.statusTitle}`}
                                        >
                                            Add
                                        </button>
                                    </div>
                                    {isExpanded === false && (
                                        <div className="p-2 pt-1.5 sm:p-3 sm:pt-2">
                                            {tempTaskList.length === 0 && (
                                                <p className="py-4 text-center text-xs text-zinc-500 sm:py-6">No tasks in {itemTaskStatus.statusTitle} — add one</p>
                                            )}
                                            {tempTaskList.length > 0 && (
                                                <>
                                                    <div className="mb-1 flex items-center gap-1">
                                                        <span className="text-[11px] text-zinc-500">{tempTaskList.length} items {tempTaskList.length > 20 ? '· virtual' : ''}</span>
                                                    </div>
                                                    {tempTaskList.length > 30 ? (
                                                        <TaskVirtualColumn itemCount={tempTaskList.length} rowHeight={taskLayoutMode === 'list' ? 110 : 170} height={420} ariaLabel={`Virtual tasks in ${itemTaskStatus.statusTitle}`}>
                                                            {tempTaskList.map((task) => (
                                                                <div key={task._id} className="p-1">
                                                                    <TaskItem
                                                                        task={task}
                                                                        taskStatusList={taskStatusList}
                                                                        setRefreshRandomNum={setRefreshRandomNum}
                                                                        setIsTaskAddModalIsOpen={setIsTaskAddModalIsOpen}
                                                                        layout={taskLayoutMode}
                                                                        draggable
                                                                        onDragStart={handleDragStart}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </TaskVirtualColumn>
                                                    ) : (
                                                        <ul
                                                            className={
                                                                taskLayoutMode === 'grid'
                                                                    ? 'grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-2 lg:grid-cols-3'
                                                                    : 'flex flex-col gap-1 sm:gap-1.5'
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
                                                                        draggable
                                                                        onDragStart={handleDragStart}
                                                                    />
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </>
                                            )}
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
        <div className="min-h-0 w-full bg-zinc-950 pb-[max(4.5rem,env(safe-area-inset-bottom,0px)+3rem)] pt-2 sm:pb-20 sm:pt-4">
            <Helmet>
                <title>Tasks — AI Notes XYZ</title>
            </Helmet>
            <div className="mx-auto w-full max-w-[1600px] px-2 sm:px-4">
                <header className="mb-2 flex flex-wrap items-center justify-between gap-2 sm:mb-3">
                    <div className="flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-sm">
                            <LayoutList className="h-4 w-4" strokeWidth={2} aria-hidden />
                        </span>
                        <div>
                            <h1 className="text-lg font-semibold leading-tight tracking-tight text-zinc-100 sm:text-xl">
                                Tasks
                            </h1>
                            <p className="text-[11px] leading-tight text-zinc-500">Workspace · board</p>
                        </div>
                        <span className="ml-2 hidden items-center gap-1 sm:inline-flex">
                            <span className="rounded-full bg-emerald-950 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">{openCount} open</span>
                            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] font-semibold text-zinc-400">{doneCount} done</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-1" />
                </header>

                <TaskAiTools setRefreshParentRandomNum={setRefreshRandomNum} />

                <div className="flex flex-col gap-0 lg:flex-row lg:items-stretch lg:gap-0">
                    <div className="w-full shrink-0 lg:w-[min(26%,320px)] lg:min-w-[220px] lg:border-r lg:border-zinc-700/60">
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
