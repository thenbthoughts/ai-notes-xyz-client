import React, { useEffect, useState } from 'react';
import axiosCustom from '../../../../config/axiosCustom.ts';
import { useAtomValue } from 'jotai';
import { jotaiStateTaskWorkspaceId } from './stateJotai/taskStateJotai';
import toast from 'react-hot-toast';

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
                <p className="pb-2 text-center font-mono text-[10px] uppercase tracking-wide text-zinc-500">Loading AI suggestions…</p>
            )}

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {tasks.map((task, index) => (
                    <div
                        key={index}
                        className="rounded-none border border-zinc-300 bg-white p-2.5 text-left shadow-[2px_2px_0_0_rgb(228_228_231)] hover:bg-zinc-50"
                    >
                        <h3 className="text-sm font-semibold text-zinc-900">{task.taskTitle}</h3>
                        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-zinc-600">{task.taskDescription}</p>
                        <p className="mt-1 text-[10px] text-zinc-500">
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
                            className="mt-2 w-full rounded-none border border-emerald-700 bg-emerald-600 py-1 text-[10px] font-bold uppercase tracking-wide text-white hover:bg-emerald-500"
                        >
                            Add task
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
        <div className="pb-3">
            <div className="rounded-none border border-zinc-300 bg-white p-3 shadow-[3px_3px_0_0_rgb(228_228_231)]">
                <h2 className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                    AI tools
                </h2>

                <div className="mb-3 flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setCallGenerateAiTaskListRandomNum(Math.floor(Math.random() * 1_000_000))}
                        className="rounded-none border border-violet-700 bg-violet-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-[2px_2px_0_0_rgb(91_33_182)] hover:bg-violet-500 active:translate-x-px active:translate-y-px active:shadow-none"
                    >
                        Generate tasks
                    </button>
                    <button
                        type="button"
                        onClick={() => taskWorkspaceChatWithAi({ taskWorkspaceId: workspaceId })}
                        className="rounded-none border border-zinc-900 bg-zinc-900 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-[2px_2px_0_0_rgb(63_63_70)] hover:bg-zinc-800 active:translate-x-px active:translate-y-px active:shadow-none"
                    >
                        Workspace chat
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