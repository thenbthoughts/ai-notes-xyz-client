import { LucideChevronDown, LucideChevronUp, LucideCopy, LucideDownload, LucideRefreshCw, LucideX, LucideZap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useAtom, useAtomValue } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

import axiosCustom from '../../../../../config/axiosCustom';
import { suggestionsRefreshAtom } from '../suggestionsRefreshAtom';

const autoLoadAtom = atomWithStorage('aiTaskSuggestionsAutoLoad', false);

const collapsedStorageKey = 'suggestions-tasks-collapsed';
const dismissedStorageKey = 'suggestions-dismissed-tasks';
const priorityStorageKey = 'suggestions-task-priority-filter';
const workspaceStorageKey = 'suggestions-task-workspace-filter';

const readCollapsed = () => {
    try {
        const raw = localStorage.getItem(collapsedStorageKey);
        if (raw === 'true') {
            return true;
        }
        return false;
    } catch {
        return false;
    }
};

const writeCollapsed = (next: boolean) => {
    try {
        localStorage.setItem(collapsedStorageKey, String(next));
    } catch {
        return;
    }
};

const readStorageString = (key: string, fallback: string) => {
    try {
        const raw = localStorage.getItem(key);
        if (raw === null) {
            return fallback;
        }
        return raw;
    } catch {
        return fallback;
    }
};

const writeStorageString = (key: string, value: string) => {
    try {
        localStorage.setItem(key, value);
    } catch {
        return;
    }
};

const readDismissed = (): string[] => {
    try {
        const raw = localStorage.getItem(dismissedStorageKey);
        if (!raw) {
            return [];
        }
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
            return parsed.filter((x) => {
                return typeof x === 'string';
            }) as string[];
        }
        return [];
    } catch {
        return [];
    }
};

const writeDismissed = (ids: string[]) => {
    try {
        localStorage.setItem(dismissedStorageKey, JSON.stringify(ids));
    } catch {
        return;
    }
};

interface TaskSuggestion {
    _id?: string;
    isTask: string;
    taskTitle: string;
    taskAiSuggestion: string;
    taskDescription: string;
    taskStatus: string;
    taskPriority: 'high' | 'medium' | 'low';
    taskDueDate: string;
    taskTags: string[];
    taskSubtasks: unknown[];
    taskWorkspaceId: string;
    taskWorkspaceName: string;
    isAdded: boolean;
}

const AiSuggestionTasks = () => {
    const [requestAiTaskSuggestions, setRequestAiTaskSuggestions] = useState({
        loading: false,
        success: '',
        error: '',
    });
    const [taskSuggestions, setTaskSuggestions] = useState<TaskSuggestion[]>([]);
    const [autoLoad, setAutoLoad] = useAtom(autoLoadAtom);
    const [randomNum, setRandomNum] = useState(0);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        return readCollapsed();
    });
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const refreshTick = useAtomValue(suggestionsRefreshAtom);
    const [priorityFilter, setPriorityFilter] = useState(() => {
        return readStorageString(priorityStorageKey, '');
    });
    const [workspaceFilter, setWorkspaceFilter] = useState(() => {
        return readStorageString(workspaceStorageKey, '');
    });
    const [searchFilter, setSearchFilter] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
        return readDismissed();
    });
    const pageSize = 6;
    const fetchControllerRef = useRef<AbortController | null>(null);
    const lastFetchFiltersRef = useRef({ priorityFilter: '', workspaceFilter: '', searchFilter: '', page: 1 });

    useEffect(() => {
        writeCollapsed(isCollapsed);
    }, [isCollapsed]);

    useEffect(() => {
        writeStorageString(priorityStorageKey, priorityFilter);
    }, [priorityFilter]);

    useEffect(() => {
        writeStorageString(workspaceStorageKey, workspaceFilter);
    }, [workspaceFilter]);

    useEffect(() => {
        writeDismissed(dismissedIds);
    }, [dismissedIds]);

    useEffect(() => {
        if (refreshTick > 0) {
            setRandomNum(Math.random());
        }
    }, [refreshTick]);

    useEffect(() => {
        if (randomNum === 0) {
            setRequestAiTaskSuggestions({
                loading: false,
                success: '',
                error: '',
            });
            return;
        }
        void fetchTaskSuggestions();
        return () => {
            if (fetchControllerRef.current) {
                fetchControllerRef.current.abort();
            }
        };
    }, [randomNum]);

    useEffect(() => {
        if (autoLoad) {
            setRandomNum(Math.random());
        }
    }, [autoLoad]);

    useEffect(() => {
        if (randomNum !== 0) {
            setPage(1);
            lastFetchFiltersRef.current = { priorityFilter, workspaceFilter, searchFilter, page: 1 };
            void fetchTaskSuggestionsWithParams(priorityFilter, workspaceFilter, searchFilter, 1);
        }
    }, [priorityFilter, workspaceFilter]);

    useEffect(() => {
        const t = window.setTimeout(() => {
            if (randomNum !== 0 && searchFilter !== lastFetchFiltersRef.current.searchFilter) {
                setPage(1);
                lastFetchFiltersRef.current = { priorityFilter, workspaceFilter, searchFilter, page: 1 };
                void fetchTaskSuggestionsWithParams(priorityFilter, workspaceFilter, searchFilter, 1);
            }
        }, 400);
        return () => {
            window.clearTimeout(t);
        };
    }, [searchFilter]);

    const fetchTaskSuggestionsWithParams = async (pf: string, wf: string, sf: string, p: number, signal?: AbortSignal) => {
        if (fetchControllerRef.current) {
            fetchControllerRef.current.abort();
        }
        const controller = signal ? null : new AbortController();
        const activeSignal = signal || (controller ? controller.signal : undefined);
        if (controller) {
            fetchControllerRef.current = controller;
        }
        setRequestAiTaskSuggestions({
            loading: true,
            success: '',
            error: '',
        });
        try {
            const params: Record<string, string | number> = {
                page: p,
                limit: pageSize,
            };
            if (pf) {
                params.priority = pf;
            }
            if (wf) {
                params.workspace = wf;
            }
            if (sf) {
                params.search = sf;
            }
            const response = await axiosCustom.get('/api/suggestions/crud/get-ai-task-suggestions', {
                params,
                signal: activeSignal,
            });
            if (activeSignal && activeSignal.aborted) {
                return;
            }
            const rawDocs = (response.data.data.docs as TaskSuggestion[]) || [];
            const withIds = rawDocs.map((doc, idx) => {
                if (doc._id) {
                    return doc;
                }
                return { ...doc, _id: `local-${idx}-${doc.taskTitle}` };
            });
            const filteredDismissed = withIds.filter((d) => {
                const key = String(d._id || d.taskTitle);
                return !dismissedIds.includes(key);
            });
            setTaskSuggestions(filteredDismissed);
            const count = response.data.data.count as number;
            const tp = response.data.data.totalPages as number;
            setTotal(count);
            setTotalPages(tp || 1);
            if (filteredDismissed.length > 0) {
                setRequestAiTaskSuggestions({
                    loading: false,
                    success: 'Task suggestions fetched successfully',
                    error: '',
                });
            } else {
                if (count === 0) {
                    setRequestAiTaskSuggestions({
                        loading: false,
                        success: '',
                        error: 'No task suggestions found',
                    });
                } else {
                    setRequestAiTaskSuggestions({
                        loading: false,
                        success: '',
                        error: '',
                    });
                }
            }
            setLastUpdated(new Date());
        } catch (error: unknown) {
            const err = error as { name?: string; code?: string };
            if (err.name === 'AbortError' || err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
                return;
            }
            console.error('Error fetching task suggestions:', error);
            setRequestAiTaskSuggestions({
                loading: false,
                success: '',
                error: 'Error fetching task suggestions',
            });
        }
    };

    const fetchTaskSuggestions = async (signal?: AbortSignal) => {
        await fetchTaskSuggestionsWithParams(priorityFilter, workspaceFilter, searchFilter, page, signal);
        lastFetchFiltersRef.current = { priorityFilter, workspaceFilter, searchFilter, page };
    };

    const getPriorityColor = (priority: string): string => {
        if (priority === 'high') {
            return 'border border-zinc-700 bg-zinc-800 text-zinc-100';
        }
        if (priority === 'medium') {
            return 'border border-amber-700 bg-amber-950 text-amber-200';
        }
        if (priority === 'low') {
            return 'border border-zinc-700 bg-zinc-800 text-zinc-300';
        }
        return 'border border-zinc-700 bg-zinc-950 text-zinc-400';
    };

    const formatDueDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            if (Number.isNaN(date.getTime())) {
                return '-';
            }
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } catch {
            return '-';
        }
    };

    const copySuggestion = async (task: TaskSuggestion) => {
        const text = `${task.taskTitle} - ${task.taskDescription}`;
        try {
            await navigator.clipboard.writeText(text);
            toast.success('Suggestion copied');
        } catch {
            toast.error('Copy failed');
        }
    };

    const copyAllSuggestions = async () => {
        const text = taskSuggestions.map((t) => {
            return `- ${t.taskTitle}: ${t.taskDescription} [${t.taskPriority}] (${t.taskWorkspaceName})`;
        }).join('\n');
        if (!text) {
            toast.error('No suggestions to copy');
            return;
        }
        try {
            await navigator.clipboard.writeText(text);
            toast.success('All suggestions copied');
        } catch {
            toast.error('Copy failed');
        }
    };

    const exportAllSuggestions = () => {
        try {
            const header = '# Task Suggestions\n\n';
            const body = taskSuggestions.map((t, idx) => {
                return `## ${idx + 1}. ${t.taskTitle}\n- Description: ${t.taskDescription}\n- Priority: ${t.taskPriority}\n- Workspace: ${t.taskWorkspaceName}\n- Due: ${formatDueDate(t.taskDueDate)}\n- Tags: ${(t.taskTags || []).join(', ')}\n`;
            }).join('\n');
            const content = header + body;
            if (!content || taskSuggestions.length === 0) {
                toast.error('No suggestions to export');
                return;
            }
            const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = 'task-suggestions.md';
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            URL.revokeObjectURL(url);
            toast.success('Exported suggestions');
        } catch {
            toast.error('Export failed');
        }
    };

    const dismissSuggestion = async (task: TaskSuggestion) => {
        const key = String(task._id || task.taskTitle);
        const next = [...dismissedIds, key];
        setDismissedIds(next);
        setTaskSuggestions((prev) => {
            return prev.filter((t) => {
                return String(t._id || t.taskTitle) !== key;
            });
        });
        try {
            await axiosCustom.post('/api/suggestions/crud/dismiss-task-suggestion', {
                suggestionId: key,
                taskTitle: task.taskTitle,
            });
            toast.success('Suggestion dismissed');
        } catch {
            toast.error('Dismiss failed');
        }
    };

    const addTask = async (task: TaskSuggestion) => {
        const previous = taskSuggestions;
        setTaskSuggestions((prevTaskSuggestions) => {
            return prevTaskSuggestions.map((t) => {
                if (t._id && task._id && t._id === task._id) {
                    return { ...t, isAdded: true };
                }
                if (t === task) {
                    return { ...t, isAdded: true };
                }
                return t;
            });
        });
        toast.success(`Adding "${task.taskTitle}"…`);
        try {
            const newTask = {
                title: task.taskTitle,
                description: task.taskDescription,
                completed: false,
                list: 'To Do',
                comments: [],
                status: 'todo',
                dueDate: task.taskDueDate,
                labels: task.taskTags || [],
                priority: task.taskPriority,
                isArchived: false,
                isCompleted: false,
                taskWorkspaceId: task.taskWorkspaceId,
                taskStatusId: '',
                dueDateReminderPresetLabels: ['before-1-day'],
            };
            const config = {
                method: 'post',
                url: '/api/task/crud/taskAdd',
                headers: {
                    'Content-Type': 'application/json',
                },
                data: JSON.stringify(newTask),
            };
            const resTask = await axiosCustom.request(config);
            const docTask = resTask.data;
            if (typeof docTask._id === 'string' && docTask._id.length === 24) {
                setTaskSuggestions((prevTaskSuggestions) => {
                    return prevTaskSuggestions.map((t) => {
                        if (t._id && task._id && t._id === task._id) {
                            return {
                                ...t,
                                isAdded: true,
                                _id: docTask._id,
                                taskWorkspaceId: docTask.taskWorkspaceId,
                            };
                        }
                        if (t === task) {
                            return {
                                ...t,
                                isAdded: true,
                                _id: docTask._id,
                                taskWorkspaceId: docTask.taskWorkspaceId,
                            };
                        }
                        return t;
                    });
                });
            }
            toast.success(`Added "${task.taskTitle}"`);
        } catch (error) {
            console.error('Error adding task:', error);
            setTaskSuggestions(previous);
            toast.error('Failed to add task. Please try again.');
        }
    };

    const toggleBtn = (on: boolean) => {
        if (on) {
            return 'rounded-sm border px-2 py-1 text-xs font-medium transition-colors border-emerald-700 bg-emerald-950 text-emerald-200 hover:bg-emerald-900';
        }
        return 'rounded-sm border px-2 py-1 text-xs font-medium transition-colors border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800';
    };

    const workspaceOptions = (() => {
        const set = new Set<string>();
        taskSuggestions.forEach((t) => {
            if (t.taskWorkspaceName) {
                set.add(t.taskWorkspaceName);
            }
        });
        return Array.from(set);
    })();

    const handlePageChange = (nextPage: number) => {
        if (nextPage < 1 || nextPage > totalPages) {
            return;
        }
        setPage(nextPage);
        lastFetchFiltersRef.current = { priorityFilter, workspaceFilter, searchFilter, page: nextPage };
        void fetchTaskSuggestionsWithParams(priorityFilter, workspaceFilter, searchFilter, nextPage);
    };

    return (
        <div className="mb-2 rounded-sm border border-zinc-700 bg-zinc-900 p-2 shadow-sm md:p-3">
            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-1.5">
                    <LucideZap className="h-4 w-4 text-emerald-600" strokeWidth={2} />
                    <h2 className="text-sm font-semibold text-zinc-100">AI task suggestions</h2>
                    <button
                        type="button"
                        onClick={() => {
                            setIsCollapsed((prev) => {
                                return !prev;
                            });
                        }}
                        className="ml-1 rounded-sm border border-zinc-700 bg-zinc-800 p-1 text-zinc-300 hover:bg-zinc-700"
                        aria-label={isCollapsed ? 'Expand task suggestions' : 'Collapse task suggestions'}
                        title={isCollapsed ? 'Expand' : 'Collapse'}
                    >
                        {isCollapsed ? <LucideChevronDown className="h-3.5 w-3.5" strokeWidth={2} /> : <LucideChevronUp className="h-3.5 w-3.5" strokeWidth={2} />}
                    </button>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                    {lastUpdated && <span className="rounded-sm border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300">Updated {lastUpdated.toLocaleTimeString()}</span>}
                    {total > 0 && <span className="rounded-sm border border-zinc-700 bg-zinc-950 px-1.5 py-0.5 text-[10px] text-zinc-300">{total} total</span>}
                    <button
                        type="button"
                        onClick={() => {
                            setAutoLoad(!autoLoad);
                        }}
                        className={toggleBtn(autoLoad)}
                        title={autoLoad ? 'Auto-load on' : 'Auto-load off'}
                        aria-label={autoLoad ? 'Disable auto-load' : 'Enable auto-load'}
                    >
                        <span className="inline-flex items-center gap-1">
                            <LucideZap className={`h-3.5 w-3.5 ${autoLoad ? 'text-emerald-600' : 'text-zinc-400'}`} strokeWidth={2} />
                            {autoLoad ? 'Auto-load on' : 'Auto-load off'}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            void copyAllSuggestions();
                        }}
                        className="rounded-sm border border-zinc-700 bg-zinc-900 p-1.5 text-zinc-300 hover:bg-zinc-800"
                        title="Copy all suggestions"
                        aria-label="Copy all task suggestions"
                        disabled={taskSuggestions.length === 0}
                    >
                        <LucideCopy className="h-4 w-4" strokeWidth={2} />
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            exportAllSuggestions();
                        }}
                        className="rounded-sm border border-zinc-700 bg-zinc-900 p-1.5 text-zinc-300 hover:bg-zinc-800"
                        title="Export all suggestions"
                        aria-label="Export all task suggestions"
                        disabled={taskSuggestions.length === 0}
                    >
                        <LucideDownload className="h-4 w-4" strokeWidth={2} />
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setRandomNum(Math.random());
                        }}
                        disabled={requestAiTaskSuggestions.loading}
                        className="rounded-sm border border-zinc-700 bg-zinc-900 p-1.5 text-indigo-600 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Refresh"
                        aria-label="Refresh task suggestions"
                    >
                        <LucideRefreshCw className={`h-4 w-4 ${requestAiTaskSuggestions.loading ? 'animate-spin' : ''}`} strokeWidth={2} />
                    </button>
                </div>
            </div>
            {!isCollapsed && (
                <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    <select
                        value={priorityFilter}
                        onChange={(e) => {
                            setPriorityFilter(e.target.value);
                        }}
                        className="rounded-sm border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-200"
                        aria-label="Filter by priority"
                    >
                        <option value="">All priorities</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                    <select
                        value={workspaceFilter}
                        onChange={(e) => {
                            setWorkspaceFilter(e.target.value);
                        }}
                        className="rounded-sm border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-200"
                        aria-label="Filter by workspace"
                    >
                        <option value="">All workspaces</option>
                        {workspaceOptions.map((ws) => {
                            return (
                                <option key={ws} value={ws}>{ws}</option>
                            );
                        })}
                    </select>
                    <input
                        value={searchFilter}
                        onChange={(e) => {
                            setSearchFilter(e.target.value);
                        }}
                        placeholder="Search suggestions"
                        className="rounded-sm border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-200 placeholder:text-zinc-500"
                        aria-label="Search task suggestions"
                    />
                    {(priorityFilter || workspaceFilter || searchFilter) && (
                        <button
                            type="button"
                            onClick={() => {
                                setPriorityFilter('');
                                setWorkspaceFilter('');
                                setSearchFilter('');
                                setPage(1);
                                lastFetchFiltersRef.current = { priorityFilter: '', workspaceFilter: '', searchFilter: '', page: 1 };
                                void fetchTaskSuggestionsWithParams('', '', '', 1);
                            }}
                            className="rounded-sm border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
                            aria-label="Clear filters"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            )}
            {isCollapsed ? (
                <div className="rounded-sm border border-zinc-800 bg-zinc-950/50 px-2 py-2 text-center text-xs text-zinc-500">Collapsed</div>
            ) : (
                <div>
                    {!autoLoad && taskSuggestions.length === 0 && !requestAiTaskSuggestions.loading && !requestAiTaskSuggestions.error && (
                        <div className="flex flex-col items-center justify-center gap-2 py-4">
                            <span className="text-xs text-zinc-400">Auto-load is off. Use refresh to load suggestions.</span>
                            <Link to="/user/chat" className="rounded-sm border border-indigo-700 bg-zinc-900 px-2 py-1 text-xs font-medium text-indigo-200 hover:bg-zinc-800" aria-label="Go to chat">
                                Go to chat
                            </Link>
                        </div>
                    )}
                    {requestAiTaskSuggestions.loading && (
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                            <div className="rounded-sm border border-zinc-700 bg-zinc-950/80 p-2">
                                <div className="h-3 w-3/4 animate-pulse rounded bg-zinc-800" />
                                <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-zinc-800" style={{ animationDelay: '120ms' } as React.CSSProperties} />
                                <div className="mt-2 h-10 animate-pulse rounded bg-zinc-800" style={{ animationDelay: '240ms' } as React.CSSProperties} />
                            </div>
                            <div className="rounded-sm border border-zinc-700 bg-zinc-950/80 p-2">
                                <div className="h-3 w-3/4 animate-pulse rounded bg-zinc-800" />
                                <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-zinc-800" style={{ animationDelay: '120ms' } as React.CSSProperties} />
                                <div className="mt-2 h-10 animate-pulse rounded bg-zinc-800" style={{ animationDelay: '240ms' } as React.CSSProperties} />
                            </div>
                            <div className="rounded-sm border border-zinc-700 bg-zinc-950/80 p-2">
                                <div className="h-3 w-3/4 animate-pulse rounded bg-zinc-800" />
                                <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-zinc-800" style={{ animationDelay: '120ms' } as React.CSSProperties} />
                                <div className="mt-2 h-10 animate-pulse rounded bg-zinc-800" style={{ animationDelay: '240ms' } as React.CSSProperties} />
                            </div>
                        </div>
                    )}
                    {!requestAiTaskSuggestions.loading && requestAiTaskSuggestions.success.length > 0 && (
                        <p className="my-2 rounded-sm border border-emerald-700 bg-emerald-950 p-2 text-xs text-emerald-300">{requestAiTaskSuggestions.success}</p>
                    )}
                    {!requestAiTaskSuggestions.loading && requestAiTaskSuggestions.error.length > 0 && (
                        <div className="my-2 rounded-sm border border-zinc-700 bg-zinc-800 p-2">
                            <p className="text-xs text-zinc-200">{requestAiTaskSuggestions.error}</p>
                            {taskSuggestions.length === 0 && (
                                <div className="mt-2 flex flex-col items-center gap-2">
                                    <p className="text-xs text-zinc-400">No suggestions available. Try chatting to generate new ideas.</p>
                                    <Link
                                        to="/user/chat"
                                        className="rounded-sm border border-indigo-700 bg-zinc-900 px-3 py-1 text-xs font-medium text-indigo-200 hover:bg-zinc-800"
                                        aria-label="Go to chat for suggestions"
                                    >
                                        Go to chat
                                    </Link>
                                </div>
                            )}
                            {taskSuggestions.length === 0 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setRandomNum(Math.random());
                                    }}
                                    className="mt-2 rounded-sm border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800"
                                    aria-label="Retry loading task suggestions"
                                >
                                    Retry
                                </button>
                            )}
                        </div>
                    )}
                    {!requestAiTaskSuggestions.loading && taskSuggestions.length === 0 && requestAiTaskSuggestions.error.length === 0 && autoLoad && (
                        <div className="flex flex-col items-center justify-center gap-2 rounded-sm border border-zinc-800 bg-zinc-950/50 px-3 py-6 text-center">
                            <p className="text-xs text-zinc-400">No task suggestions yet</p>
                            <p className="text-xs text-zinc-500">Generate more activity and refresh.</p>
                            <Link
                                to="/user/chat"
                                className="rounded-sm border border-indigo-700 bg-zinc-900 px-3 py-1 text-xs font-medium text-indigo-200 hover:bg-zinc-800"
                                aria-label="Go to chat to create suggestions"
                            >
                                Go to chat
                            </Link>
                        </div>
                    )}
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {taskSuggestions.map((task: TaskSuggestion, index: number) => {
                            return (
                                <div key={task._id || index} className="rounded-sm border border-zinc-700 bg-zinc-950/80 p-2 shadow-sm">
                                    <div className="flex h-full flex-col">
                                        <div className="flex-1">
                                            <div className="mb-1 flex items-start justify-between gap-1">
                                                <p className="text-xs font-medium text-zinc-100 md:text-sm">{task.taskTitle}</p>
                                                <div className="flex shrink-0 items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            void copySuggestion(task);
                                                        }}
                                                        className="rounded-sm border border-zinc-700 bg-zinc-900 p-1 text-zinc-400 hover:bg-zinc-800"
                                                        aria-label={`Copy suggestion ${task.taskTitle}`}
                                                        title="Copy suggestion"
                                                    >
                                                        <LucideCopy className="h-3 w-3" strokeWidth={2} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            void dismissSuggestion(task);
                                                        }}
                                                        className="rounded-sm border border-zinc-700 bg-zinc-900 p-1 text-zinc-400 hover:bg-zinc-800"
                                                        aria-label={`Dismiss suggestion ${task.taskTitle}`}
                                                        title="Dismiss"
                                                    >
                                                        <LucideX className="h-3 w-3" strokeWidth={2} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="mb-2 text-xs text-zinc-400">{task.taskDescription}</p>
                                            <div className="mb-2 flex flex-wrap items-center gap-1">
                                                <span className="rounded-sm border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-[10px] text-zinc-300">{task.taskWorkspaceName}</span>
                                                <span className="rounded-sm border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-[10px] text-zinc-300">Due {formatDueDate(task.taskDueDate)}</span>
                                                <span className={`rounded-sm px-1.5 py-0.5 text-[10px] ${getPriorityColor(task.taskPriority)}`}>{task.taskPriority} priority</span>
                                                {task.taskTags && task.taskTags.length > 0 && (
                                                    <span className="rounded-sm border border-indigo-700 bg-indigo-950 px-1.5 py-0.5 text-[10px] text-indigo-300">{task.taskTags[0]}</span>
                                                )}
                                            </div>
                                        </div>
                                        {task.isAdded && (
                                            <div className="my-2 rounded-sm border border-emerald-700 bg-emerald-950 p-2 text-xs text-emerald-200">
                                                <p className="mb-1 font-medium">Task added.</p>
                                                <a
                                                    href={`/user/task?workspace=${task.taskWorkspaceId}&edit-task-id=${task._id}`}
                                                    className="font-medium text-indigo-400 underline hover:text-indigo-300"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label={`View task ${task.taskTitle}`}
                                                >
                                                    View task
                                                </a>
                                            </div>
                                        )}
                                        {!task.isAdded && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    void addTask(task);
                                                }}
                                                className="w-full rounded-sm border border-emerald-700/30 bg-emerald-600 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                                                aria-label={`Add task ${task.taskTitle}`}
                                            >
                                                Add task
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {!requestAiTaskSuggestions.loading && totalPages > 1 && (
                        <div className="mt-3 flex items-center justify-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    handlePageChange(page - 1);
                                }}
                                disabled={page <= 1}
                                className="rounded-sm border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
                                aria-label="Previous page"
                            >
                                Prev
                            </button>
                            <span className="text-xs text-zinc-400">Page {page} of {totalPages}</span>
                            <button
                                type="button"
                                onClick={() => {
                                    handlePageChange(page + 1);
                                }}
                                disabled={page >= totalPages}
                                className="rounded-sm border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
                                aria-label="Next page"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AiSuggestionTasks;
