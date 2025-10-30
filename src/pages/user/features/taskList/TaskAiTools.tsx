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
            {loading && <p className="text-center text-gray-500 pb-2 text-sm">Loading tasks...</p>} {/* Loading message */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {tasks.map((task, index) => (
                    <div key={index} className="p-2 border border-gray-300 rounded-sm bg-gray-50 hover:bg-gray-100 transition">
                        <h3 className="text-lg font-semibold text-gray-700">{task.taskTitle}</h3>
                        <p className="text-gray-600 text-sm">{task.taskDescription}</p>
                        <p className="text-gray-500 text-sm">Priority: <span className={`font-bold ${task.taskPriority === 'high' ? 'text-red-500' : task.taskPriority === 'medium' ? 'text-yellow-500' : 'text-green-500'}`}>{task.taskPriority}</span></p>
                        <p className="text-gray-500 text-sm">Due Date: <span className="font-semibold">{new Date(task.taskDueDate).toLocaleDateString()}</span></p>
                        <p className="text-gray-500 text-sm">Tags: <span className="font-semibold">{task.taskTags.join(', ')}</span></p>
                        <button
                            onClick={() => addTask(task)}
                            className="mt-1 bg-blue-600 text-white p-1 rounded-sm hover:bg-blue-700 transition"
                        >
                            Add Task
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
        <div className='pb-2'>
            <div className="p-4 bg-white rounded-sm shadow-md">
                <h2 className="text-xl font-bold mb-2 text-gray-800">AI Tools</h2>

                <div className="flex justify-center mb-2">
                    <button
                        onClick={() => setCallGenerateAiTaskListRandomNum(Math.floor(Math.random() * 1_000_000))}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-1 px-2 rounded-sm shadow-lg hover:shadow-xl transition duration-300 mx-1 cursor-pointer"
                    >
                        🚀 Generate Tasks by AI
                    </button>
                    <button
                        onClick={() => taskWorkspaceChatWithAi({ taskWorkspaceId: workspaceId })}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-1 px-2 rounded-sm shadow-lg hover:shadow-xl transition duration-300 mx-1 cursor-pointer"
                    >
                        Workspace Chat with AI
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