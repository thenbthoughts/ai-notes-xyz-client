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
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-violet-200 border-t-fuchsia-500 border-r-amber-400" />
                </div>
            )}

            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                {tasks.map((task, index) => (
                    <div
                        key={index}
                        className="rounded-xl border border-violet-200/60 bg-gradient-to-br from-white via-violet-50/40 to-amber-50/30 p-2 text-left shadow-md shadow-violet-200/15 transition-all hover:-translate-y-0.5 hover:border-fuchsia-300/70 hover:shadow-lg hover:shadow-fuchsia-200/20"
                    >
                        <h3 className="text-sm font-semibold leading-tight text-violet-950">{task.taskTitle}</h3>
                        <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-zinc-600">{task.taskDescription}</p>
                        <p className="mt-0.5 text-[10px] text-zinc-500">
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
                        <p className="text-[10px] text-zinc-500">
                            Due{' '}
                            <span className="font-medium text-zinc-800">
                                {new Date(task.taskDueDate).toLocaleDateString()}
                            </span>
                        </p>
                        <p className="text-[10px] text-zinc-500 line-clamp-1">
                            {task.taskTags.join(', ')}
                        </p>
                        <button
                            type="button"
                            onClick={() => addTask(task)}
                            className="mt-1.5 inline-flex w-full items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 py-1.5 text-[11px] font-bold text-white shadow-md shadow-teal-500/20 transition hover:from-cyan-400 hover:via-teal-400 hover:to-emerald-400"
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
            <div className="rounded-xl border-2 border-transparent bg-gradient-to-r from-violet-300 via-fuchsia-300 to-amber-300 p-[2px] shadow-lg shadow-fuchsia-500/10">
                <div className="rounded-[10px] bg-gradient-to-br from-violet-50/95 via-white to-amber-50/50 p-2 backdrop-blur-sm">
                <div className="mb-1.5 flex items-center gap-1.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-md shadow-fuchsia-500/30">
                        <Sparkles className="h-3.5 w-3.5 text-amber-200" strokeWidth={2} aria-hidden />
                    </span>
                    <div className="min-w-0">
                        <h2 className="bg-gradient-to-r from-violet-700 to-fuchsia-600 bg-clip-text text-sm font-bold leading-tight text-transparent">
                            AI tools
                        </h2>
                        <p className="text-[11px] leading-tight text-fuchsia-600/80">Generate · workspace chat</p>
                    </div>
                </div>

                <div className="mb-2 flex flex-wrap gap-1.5">
                    <button
                        type="button"
                        onClick={() => setCallGenerateAiTaskListRandomNum(Math.floor(Math.random() * 1_000_000))}
                        className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-2 py-1.5 text-xs font-bold text-white shadow-md shadow-violet-500/25 transition hover:from-violet-500 hover:to-fuchsia-500"
                    >
                        <Sparkles className="h-3 w-3 text-amber-200" strokeWidth={2} aria-hidden />
                        Generate
                    </button>
                    <button
                        type="button"
                        onClick={() => taskWorkspaceChatWithAi({ taskWorkspaceId: workspaceId })}
                        className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-sky-600 to-cyan-600 px-2 py-1.5 text-xs font-bold text-white shadow-md shadow-cyan-500/25 transition hover:from-sky-500 hover:to-cyan-500"
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
        </div>
    );
}

export default TaskAiTools;