import { LucideLoader2, LucideZap } from "lucide-react";
import { useEffect, useState } from "react";
import axiosCustom from "../../../../../config/axiosCustom";
import toast from "react-hot-toast";

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

    const [
        randomNum,
        setRandomNum
    ] = useState(Math.random());

    useEffect(() => {
        const controller = new AbortController();
        fetchTaskSuggestions(controller.signal);

        return () => {
            controller.abort();
        };
    }, [randomNum]);

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
        <div className="mb-2 bg-white rounded-lg shadow border border-gray-200 p-2 md:p-3">
            <div className="flex items-center gap-1.5 mb-1">
                <LucideZap className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm md:text-base font-bold text-gray-800">AI Task Suggestions</h2>
            </div>
            <button
                onClick={() => {
                    setRandomNum(Math.random());
                }}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
            >Refresh</button>

            {requestAiTaskSuggestions.loading && (
                <div className="border border-gray-200 rounded p-2 my-2 text-center">
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
                <p className="text-xs text-green-600 border border-green-200 rounded p-2 my-2 bg-green-50">{requestAiTaskSuggestions.success}</p>
            )}
            {!requestAiTaskSuggestions.loading && requestAiTaskSuggestions.error.length > 0 && (
                <p className="text-xs text-red-600 border border-red-200 rounded p-2 my-2 bg-red-50">{requestAiTaskSuggestions.error}</p>
            )}

            {/* list */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {taskSuggestions.map((task: TaskSuggestion, index: number) => {                    
                    return (
                        <div key={task._id || index} className="p-2 rounded border border-gray-200 bg-gray-50">
                            <div className="flex flex-col h-full">
                                <div className="flex-1">
                                    <p className={`text-xs md:text-sm text-gray-800 font-medium mb-1`}>
                                        {task.taskTitle}
                                    </p>
                                    <p className="text-xs text-gray-600 mb-2">
                                        {task.taskDescription}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-1 mb-2">
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                                            {task.taskWorkspaceName}
                                        </span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                                            Due {formatDueDate(task.taskDueDate)}
                                        </span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${getPriorityColor(task.taskPriority)}`}>
                                            {task.taskPriority} priority
                                        </span>
                                        {task.taskTags && task.taskTags.length > 0 && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-300">
                                                {task.taskTags[0]}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {task.isAdded}
                                {task.isAdded && (
                                    <div className="text-xs text-green-600 border border-green-200 rounded p-2 my-2 bg-green-50">
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
                                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded w-full"
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