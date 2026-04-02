import { LucideLoader2, LucideRefreshCw, LucideZap } from "lucide-react";
import { useEffect, useState } from "react";
import axiosCustom from "../../../../../config/axiosCustom";
import toast from "react-hot-toast";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

const autoLoadAtom = atomWithStorage('aiTaskSuggestionsAutoLoad', false);

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
    taskSubtasks: any[];

    taskWorkspaceId: string;
    taskWorkspaceName: string;

    isAdded: boolean;
}

const AiSuggestionTasks = () => {
    const [
        requestAiTaskSuggestions,
        setRequestAiTaskSuggestions
    ] = useState({
        loading: false,
        success: '',
        error: '',
    });
    const [taskSuggestions, setTaskSuggestions] = useState<TaskSuggestion[]>([]);
    const [autoLoad, setAutoLoad] = useAtom(autoLoadAtom);

    const [
        randomNum,
        setRandomNum
    ] = useState(0);

    useEffect(() => {
        if (randomNum === 0) {
            setRequestAiTaskSuggestions({
                loading: false,
                success: '',
                error: '',
            });
            return;
        }

        const controller = new AbortController();
        fetchTaskSuggestions(controller.signal);

        return () => {
            controller.abort();
        };
    }, [randomNum]);

    useEffect(() => {
        if (autoLoad) {
            setRandomNum(Math.random());
        }
    }, [autoLoad]);

    const fetchTaskSuggestions = async (signal?: AbortSignal) => {
        setRequestAiTaskSuggestions({
            loading: true,
            success: '',
            error: '',
        });
        try {
            const response = await axiosCustom.get('/api/suggestions/crud/get-ai-task-suggestions', {
                signal
            });
            if (response.data.data.docs.length > 0) {
                setTaskSuggestions(response.data.data.docs);
                setRequestAiTaskSuggestions({
                    loading: false,
                    success: 'Task suggestions fetched successfully',
                    error: '',
                });
            } else {
                setRequestAiTaskSuggestions({
                    loading: false,
                    success: '',
                    error: 'No task suggestions found',
                });
            }
        } catch (error: any) {
            if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
                // Request was cancelled, don't update state
                return;
            }
            console.error('Error fetching task suggestions:', error);

            setRequestAiTaskSuggestions({
                loading: false,
                success: '',
                error: 'Error fetching task suggestions',
            });
        }
    }

    const getPriorityColor = (priority: string): string => {
        switch (priority) {
            case 'high':
                return 'border border-red-200 bg-red-50 text-red-800';
            case 'medium':
                return 'border border-amber-200 bg-amber-50 text-amber-900';
            case 'low':
                return 'border border-zinc-200 bg-zinc-100 text-zinc-700';
            default:
                return 'border border-zinc-200 bg-zinc-50 text-zinc-700';
        }
    };

    const formatDueDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const addTask = async (task: TaskSuggestion) => {
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
                data: JSON.stringify(newTask)
            };

            const resTask = await axiosCustom.request(config);

            const docTask = resTask.data;

            if (typeof docTask._id === 'string' && docTask._id.length === 24) {
                setTaskSuggestions(prevTaskSuggestions => {
                    return prevTaskSuggestions.map(task => {
                        if (task.taskTitle === docTask.title) {
                            return {
                                ...task,
                                isAdded: true,
                                _id: docTask._id,
                                taskWorkspaceId: docTask.taskWorkspaceId,
                            };
                        }
                        return task;
                    });
                });
            }

            // Optional: Show success message or redirect
            toast.success('Task added successfully!');
        } catch (error) {
            console.error('Error adding task:', error);
            toast.error('Failed to add task. Please try again.');
        }
    }

    const toggleBtn = (on: boolean) =>
        `rounded-sm border px-2 py-1 text-xs font-medium transition-colors ${
            on
                ? 'border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
        }`;

    return (
        <div className="mb-2 rounded-sm border border-zinc-200 bg-white p-2 shadow-sm md:p-3">
            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-1.5">
                    <LucideZap className="h-4 w-4 text-emerald-600" strokeWidth={2} />
                    <h2 className="text-sm font-semibold text-zinc-900">AI task suggestions</h2>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => setAutoLoad(!autoLoad)}
                        className={toggleBtn(autoLoad)}
                        title={autoLoad ? 'Auto-load on' : 'Auto-load off'}
                    >
                        <span className="inline-flex items-center gap-1">
                            <LucideZap
                                className={`h-3.5 w-3.5 ${autoLoad ? 'text-emerald-600' : 'text-zinc-400'}`}
                                strokeWidth={2}
                            />
                            {autoLoad ? 'Auto-load on' : 'Auto-load off'}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setRandomNum(Math.random())}
                        disabled={requestAiTaskSuggestions.loading}
                        className="rounded-sm border border-zinc-200 bg-white p-1.5 text-indigo-600 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Refresh"
                    >
                        <LucideRefreshCw
                            className={`h-4 w-4 ${requestAiTaskSuggestions.loading ? 'animate-spin' : ''}`}
                            strokeWidth={2}
                        />
                    </button>
                </div>
            </div>

            {!autoLoad && taskSuggestions.length === 0 && !requestAiTaskSuggestions.loading && (
                <div className="flex justify-center py-4">
                    <span className="text-xs text-zinc-600">
                        Auto-load is off. Use refresh to load suggestions.
                    </span>
                </div>
            )}

            {requestAiTaskSuggestions.loading && (
                <div className="my-2 rounded-sm border border-zinc-200 bg-zinc-50 p-3 text-center">
                    <p className="inline-flex items-center gap-2 text-xs text-zinc-600">
                        <LucideLoader2 className="h-4 w-4 animate-spin text-emerald-600" strokeWidth={2} />
                        Loading task suggestions…
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-500">May take 10–15 seconds.</p>
                </div>
            )}
            {!requestAiTaskSuggestions.loading && requestAiTaskSuggestions.success.length > 0 && (
                <p className="my-2 rounded-sm border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-800">
                    {requestAiTaskSuggestions.success}
                </p>
            )}
            {!requestAiTaskSuggestions.loading && requestAiTaskSuggestions.error.length > 0 && (
                <p className="my-2 rounded-sm border border-red-200 bg-red-50 p-2 text-xs text-red-800">
                    {requestAiTaskSuggestions.error}
                </p>
            )}

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                {taskSuggestions.map((task: TaskSuggestion, index: number) => {
                    return (
                        <div key={task._id || index} className="rounded-sm border border-zinc-200 bg-zinc-50/80 p-2 shadow-sm">
                            <div className="flex h-full flex-col">
                                <div className="flex-1">
                                    <p className="mb-1 text-xs font-medium text-zinc-900 md:text-sm">{task.taskTitle}</p>
                                    <p className="mb-2 text-xs text-zinc-600">{task.taskDescription}</p>
                                    <div className="mb-2 flex flex-wrap items-center gap-1">
                                        <span className="rounded-sm border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] text-zinc-700">
                                            {task.taskWorkspaceName}
                                        </span>
                                        <span className="rounded-sm border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] text-zinc-700">
                                            Due {formatDueDate(task.taskDueDate)}
                                        </span>
                                        <span
                                            className={`rounded-sm px-1.5 py-0.5 text-[10px] ${getPriorityColor(task.taskPriority)}`}
                                        >
                                            {task.taskPriority} priority
                                        </span>
                                        {task.taskTags && task.taskTags.length > 0 && (
                                            <span className="rounded-sm border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-[10px] text-indigo-800">
                                                {task.taskTags[0]}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {task.isAdded && (
                                    <div className="my-2 rounded-sm border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-900">
                                        <p className="mb-1 font-medium">Task added.</p>
                                        <a
                                            href={`/user/task?workspace=${task.taskWorkspaceId}&edit-task-id=${task._id}`}
                                            className="font-medium text-indigo-600 underline hover:text-indigo-800"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            View task
                                        </a>
                                    </div>
                                )}
                                {!task.isAdded && (
                                    <button
                                        type="button"
                                        onClick={() => void addTask(task)}
                                        className="w-full rounded-sm border border-emerald-700/30 bg-emerald-600 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                                    >
                                        Add task
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AiSuggestionTasks;