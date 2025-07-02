import React, { useState } from 'react';
import axiosCustom from '../../../../config/axiosCustom.ts';
import { useAtomValue } from 'jotai';
import { jotaiStateTaskWorkspaceId } from './stateJotai/taskStateJotai';

// interface for task
interface Task {
    taskTitle: string;
    taskDescription: string;
    taskPriority: string;
    taskDueDate: string;
    taskTags: string[];
}

const TaskListComponentSuggestAiGeneratedTask = ({
    setRefreshParentRandomNum
}: {
    setRefreshParentRandomNum: React.Dispatch<React.SetStateAction<number>>
}) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const workspaceId = useAtomValue(jotaiStateTaskWorkspaceId);

    const fetchTasks = async () => {
        setLoading(true);
        let config = {
            method: 'post',
            url: '/api/task/ai-generated/taskGenerateByLast30Conversation',
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
        <div className='pb-2'>
            <div className="p-4 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-2 text-gray-800">Suggested AI Generated Tasks</h2>

                {!loading && (<div className="flex justify-center mb-2">
                    <button
                        onClick={fetchTasks}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-1 px-2 rounded-lg shadow-lg hover:shadow-xl transition duration-300"
                    >
                        🚀 Generate Tasks by AI 
                    </button>
                </div>)}

                {loading && <p className="text-center text-gray-500 pb-2 text-sm">Loading tasks...</p>} {/* Loading message */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {tasks.map((task, index) => (
                        <div key={index} className="p-2 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                            <h3 className="text-lg font-semibold text-gray-700">{task.taskTitle}</h3>
                            <p className="text-gray-600 text-sm">{task.taskDescription}</p>
                            <p className="text-gray-500 text-sm">Priority: <span className={`font-bold ${task.taskPriority === 'high' ? 'text-red-500' : task.taskPriority === 'medium' ? 'text-yellow-500' : 'text-green-500'}`}>{task.taskPriority}</span></p>
                            <p className="text-gray-500 text-sm">Due Date: <span className="font-semibold">{new Date(task.taskDueDate).toLocaleDateString()}</span></p>
                            <p className="text-gray-500 text-sm">Tags: <span className="font-semibold">{task.taskTags.join(', ')}</span></p>
                            <button
                                onClick={() => addTask(task)}
                                className="mt-1 bg-blue-600 text-white p-1 rounded-lg hover:bg-blue-700 transition"
                            >
                                Add Task
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default TaskListComponentSuggestAiGeneratedTask;