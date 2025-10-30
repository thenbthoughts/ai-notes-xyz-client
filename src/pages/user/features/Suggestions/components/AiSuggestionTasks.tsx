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
            console.log('autoLoad is true');
            setRandomNum(Math.random());
        } else {
            console.log('autoLoad is false');
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
                return 'bg-red-50 text-red-700 border border-red-300';
            case 'medium':
                return 'bg-yellow-50 text-yellow-700 border border-yellow-300';
            case 'low':
                return 'bg-green-50 text-green-700 border border-green-300';
            default:
                return 'bg-gray-50 text-gray-700 border border-gray-300';
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
                reminderPresetTimeLabel: 'before-1-day',
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
            console.log('response', resTask);

            const docTask = resTask.data;
            console.log('docTask', docTask);
            console.log('typeof docTask._id', typeof docTask._id);
            console.log('docTask._id.length', docTask._id.length);

            if (typeof docTask._id === 'string' && docTask._id.length === 24) {
                console.log('docTask._id is valid');
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

    return (
        <div className="mb-2 bg-white rounded-sm shadow border border-gray-200 p-2 md:p-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 mb-1">
                <div className="flex items-center gap-1.5 flex-1">
                    <LucideZap className="w-4 h-4 text-blue-600" />
                    <h2 className="text-sm md:text-base font-bold text-gray-800">AI Task Suggestions</h2>
                </div>
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                    <button
                        onClick={() => {
                            setAutoLoad(!autoLoad);
                        }}
                        className={`p-1 px-2 rounded-sm transition-colors text-xs flex items-center flex-1 sm:flex-initial justify-center ${autoLoad ? 'bg-green-100 hover:bg-green-200' : 'bg-gray-100 hover:bg-gray-200'}`}
                        title={autoLoad ? 'Auto-load enabled' : 'Auto-load disabled'}
                    >
                        <LucideZap
                            className={`w-3 h-3 md:w-4 md:h-4 ${autoLoad ? 'text-green-600' : 'text-gray-400'} mr-1`}
                        />
                        <span className="">{autoLoad ? 'Auto-load enabled' : 'Auto-load disabled'}</span>
                    </button>
                    <button
                        onClick={() => {
                            setRandomNum(Math.random());
                        }}
                        disabled={requestAiTaskSuggestions.loading}
                        className="p-1 rounded-sm hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Refresh task suggestions"
                    >
                        <LucideRefreshCw
                            className={`w-4 h-4 text-blue-600 ${requestAiTaskSuggestions.loading ? 'animate-spin' : ''}`}
                        />
                    </button>
                </div>
            </div>

            {!autoLoad && taskSuggestions.length === 0 && !requestAiTaskSuggestions.loading && (
                <div className="flex items-center justify-center py-4">
                    <span className="text-xs md:text-sm text-gray-600">Auto-load is disabled. Click refresh to load task suggestions.</span>
                </div>
            )}

            {requestAiTaskSuggestions.loading && (
                <div className="border border-gray-200 rounded-sm p-2 my-2 text-center">
                    <p className="text-xs text-gray-600">
                        <LucideLoader2 className="w-4 h-4 text-gray-600 inline-block ml-1 animate-spin inline-block mr-1" 
                            style={{
                                marginTop: '-2.5px',
                            }}
                        />
                        Loading task suggestions...
                    </p>
                    <p>It may take a 10-15 seconds to load.</p>
                </div>
            )}
            {!requestAiTaskSuggestions.loading && requestAiTaskSuggestions.success.length > 0 && (
                <p className="text-xs text-green-600 border border-green-200 rounded-sm p-2 my-2 bg-green-50">{requestAiTaskSuggestions.success}</p>
            )}
            {!requestAiTaskSuggestions.loading && requestAiTaskSuggestions.error.length > 0 && (
                <p className="text-xs text-red-600 border border-red-200 rounded-sm p-2 my-2 bg-red-50">{requestAiTaskSuggestions.error}</p>
            )}

            {/* list */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {taskSuggestions.map((task: TaskSuggestion, index: number) => {                    
                    return (
                        <div key={task._id || index} className="p-2 rounded-sm border border-gray-200 bg-gray-50">
                            <div className="flex flex-col h-full">
                                <div className="flex-1">
                                    <p className={`text-xs md:text-sm text-gray-800 font-medium mb-1`}>
                                        {task.taskTitle}
                                    </p>
                                    <p className="text-xs text-gray-600 mb-2">
                                        {task.taskDescription}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-1 mb-2">
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-gray-100 text-gray-700">
                                            {task.taskWorkspaceName}
                                        </span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-gray-100 text-gray-700">
                                            Due {formatDueDate(task.taskDueDate)}
                                        </span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-sm ${getPriorityColor(task.taskPriority)}`}>
                                            {task.taskPriority} priority
                                        </span>
                                        {task.taskTags && task.taskTags.length > 0 && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-blue-50 text-blue-700 border border-blue-300">
                                                {task.taskTags[0]}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {task.isAdded}
                                {task.isAdded && (
                                    <div className="text-xs text-green-600 border border-green-200 rounded-sm p-2 my-2 bg-green-50">
                                        <p className="mb-1">Task added successfully!</p>
                                        <a 
                                            href={`/user/task?workspace=${task.taskWorkspaceId}&edit-task-id=${task._id}`}
                                            className="text-blue-600 hover:text-blue-800 underline"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            View Task
                                        </a>
                                    </div>
                                )}
                                {!task.isAdded && (
                                    <button
                                        onClick={() => addTask(task)}
                                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-sm w-full"
                                    >
                                        Add Task
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
};

export default AiSuggestionTasks;