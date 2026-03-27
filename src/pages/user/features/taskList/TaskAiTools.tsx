import React, { useEffect, useState } from 'react';
import axiosCustom from '../../../../config/axiosCustom.ts';
import { useAtomValue } from 'jotai';
import { jotaiStateTaskWorkspaceId } from './stateJotai/taskStateJotai';
import toast from 'react-hot-toast';
import { MessageSquare, Plus, Sparkles } from 'lucide-react';

// interface for task
interface Task {
    taskTitle: string;
    taskDescription: string;
    taskPriority: string;
    taskDueDate: string;
    taskTags: string[];
}

const TaskListComponentSuggestAiGeneratedTask = ({
    setRefreshParentRandomNum,
    callGenerateAiTaskListRandomNum,
}: {
    setRefreshParentRandomNum: React.Dispatch<React.SetStateAction<number>>;
    callGenerateAiTaskListRandomNum: number;
}) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const workspaceId = useAtomValue(jotaiStateTaskWorkspaceId);

    const fetchTasks = async () => {
        setLoading(true);
        let config = {
            method: 'post',
            url: '/api/task/ai-generated/taskGenerateByConversationAll',
        };

        try {
            const response = await axiosCustom.request(config);
            setTasks(response.data.data.docs);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (callGenerateAiTaskListRandomNum >= 1) {
            fetchTasks();
        }
    }, [callGenerateAiTaskListRandomNum]);

    const addTask = async (task: Task) => {
        console.log('Adding task:', task);

        const newTask = {
            title: task.taskTitle,
            description: task.taskDescription,
            priority: task.taskPriority,
            dueDate: task.taskDueDate,
            tags: task.taskTags,

            // workspace
            taskWorkspaceId: workspaceId,
        };

        const config = {
            method: 'post',
            url: '/api/task/crud/taskAdd',
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(newTask),
        };

        try {
            await axiosCustom.request(config);
            console.log('Task added successfully!');
            setRefreshParentRandomNum(Math.floor(Math.random() * 1_000_000));
            setTasks((prevTasks) => prevTasks.filter((t) => t.taskTitle !== task.taskTitle));
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    return (
        <div>
            {loading && (
                <div className="flex justify-center py-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-200 border-t-teal-600" />
                </div>
            )}

            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {tasks.map((task, index) => (
                    <div
                        key={index}
                        className="rounded-lg border border-zinc-200/80 bg-white/90 p-2 text-left shadow-sm transition-shadow hover:border-zinc-300 hover:shadow-md"
                    >
                        <h3 className="text-xs font-semibold leading-tight text-zinc-900">{task.taskTitle}</h3>
                        <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-zinc-600">{task.taskDescription}</p>
                        <p className="mt-0.5 text-[9px] text-zinc-500">
                            Priority:{' '}
                            <span
                                className={
                                    'font-semibold ' +
                                    (task.taskPriority === 'high'
                                        ? 'text-red-600'
                                        : task.taskPriority === 'medium'
                                          ? 'text-amber-600'
                                          : 'text-emerald-600')
                                }
                            >
                                {task.taskPriority}
                            </span>
                        </p>
                        <p className="text-[9px] text-zinc-500">
                            Due{' '}
                            <span className="font-medium text-zinc-800">
                                {new Date(task.taskDueDate).toLocaleDateString()}
                            </span>
                        </p>
                        <p className="text-[9px] text-zinc-500 line-clamp-1">
                            {task.taskTags.join(', ')}
                        </p>
                        <button
                            type="button"
                            onClick={() => addTask(task)}
                            className="mt-1.5 inline-flex w-full items-center justify-center gap-1 rounded-md bg-gradient-to-r from-teal-600 to-emerald-600 py-1 text-[10px] font-semibold text-white shadow-sm shadow-teal-900/10 transition hover:from-teal-500 hover:to-emerald-500"
                        >
                            <Plus className="h-3 w-3" strokeWidth={2} aria-hidden />
                            Add
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const taskWorkspaceChatWithAi = async ({
    taskWorkspaceId,
}: {
    taskWorkspaceId: string;
}) => {
    const toastLoadingId = toast.loading('Starting workspace chat with AI...');
    try {
        const result = await axiosCustom.post('/api/chat-llm/threads-crud/threadsAdd', {
            isPersonalContextEnabled: true,
            aiModelProvider: 'openrouter',
            aiModelName: 'openrouter/auto',
        });

        const tempThreadId = result?.data?.thread?._id;

        let threadId = '';

        if (tempThreadId) {
            if (typeof tempThreadId === 'string') {
                threadId = tempThreadId;
            }
        }

        // get all tasks and add to context
        const config = {
            method: 'post',
            url: '/api/task/crud/taskGet',
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                isArchived: false,
                isCompleted: false,
                taskWorkspaceId: taskWorkspaceId || '',
            }
        };

        const tasksResponse = await axiosCustom.request(config);
        const taskArr = tasksResponse.data.docs;

        if (taskArr.length === 0) {
            toast.error('No tasks found');
            toast.dismiss(toastLoadingId);
            return;
        }

        interface ContextItem {
            _id: string;
        }

        // Prepare contexts array for bulk upsert
        const contexts = taskArr.map((item: ContextItem) => ({
            referenceFrom: 'tasks',
            referenceId: item._id,
        }));

        // Bulk add all contexts
        await axiosCustom.post('/api/chat-llm/threads-context-crud/contextBulkUpsert', {
            threadId: threadId,
            contexts: contexts,
        });

        // success message
        toast.success(
            'Workspace chat with AI started successfully! Please send a message to start the conversation.',
            {
                duration: 3000,
            }
        );

        // redirect to chat page
        window.location.href = `/user/chat?id=${threadId}`;
    } catch (error) {
        console.error('Error workspace chat with AI:', error);
        toast.error('Error workspace chat with AI. Please try again.');
    } finally {
        toast.dismiss(toastLoadingId);
    }
};

const TaskAiTools = ({
    setRefreshParentRandomNum
}: {
    setRefreshParentRandomNum: React.Dispatch<React.SetStateAction<number>>
}) => {
    const [callGenerateAiTaskListRandomNum, setCallGenerateAiTaskListRandomNum] = useState<number>(0);

    const workspaceId = useAtomValue(jotaiStateTaskWorkspaceId);

    return (
        <div className="pb-2">
            <div className="rounded-lg border border-zinc-200/80 bg-white/60 p-2 shadow-sm backdrop-blur-sm">
                <div className="mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-violet-500" strokeWidth={2} aria-hidden />
                    <div className="min-w-0">
                        <h2 className="text-xs font-semibold leading-tight text-zinc-900">AI tools</h2>
                        <p className="text-[10px] leading-tight text-zinc-500">Generate · workspace chat</p>
                    </div>
                </div>

                <div className="mb-2 flex flex-wrap gap-1.5">
                    <button
                        type="button"
                        onClick={() => setCallGenerateAiTaskListRandomNum(Math.floor(Math.random() * 1_000_000))}
                        className="inline-flex items-center gap-1 rounded-md border border-violet-200/80 bg-violet-600 px-2 py-1 text-[11px] font-semibold text-white shadow-sm transition hover:bg-violet-500"
                    >
                        <Sparkles className="h-3 w-3" strokeWidth={2} aria-hidden />
                        Generate
                    </button>
                    <button
                        type="button"
                        onClick={() => taskWorkspaceChatWithAi({ taskWorkspaceId: workspaceId })}
                        className="inline-flex items-center gap-1 rounded-md border border-zinc-800/80 bg-gradient-to-b from-zinc-800 to-zinc-900 px-2 py-1 text-[11px] font-semibold text-zinc-100 shadow-sm transition hover:from-zinc-700 hover:to-zinc-800"
                    >
                        <MessageSquare className="h-3 w-3" strokeWidth={2} aria-hidden />
                        Chat
                    </button>
                </div>

                <TaskListComponentSuggestAiGeneratedTask
                    setRefreshParentRandomNum={setRefreshParentRandomNum}
                    callGenerateAiTaskListRandomNum={callGenerateAiTaskListRandomNum}
                />
            </div>
        </div>
    );
}

export default TaskAiTools;