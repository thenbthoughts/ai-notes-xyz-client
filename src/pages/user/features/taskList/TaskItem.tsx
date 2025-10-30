import { tsPageTask } from "../../../../types/pages/tsPageTaskList";

import axiosCustom from '../../../../config/axiosCustom';
import { LucideClock, LucideEdit3, LucideInfo, LucideMessageCircle, LucidePin, LucideTrash2 } from "lucide-react";
import { taskChatWithAi } from "./utils/taskCrudUtils";

const TaskItem = ({
    task,
    taskStatusList,
    setRefreshRandomNum,
    setIsTaskAddModalIsOpen,
}: {
    task: tsPageTask;
    taskStatusList: {
        _id: string;
        statusTitle: string;
        listPosition: number;
    }[],
    setRefreshRandomNum: (value: React.SetStateAction<number>) => void;
    setIsTaskAddModalIsOpen: React.Dispatch<React.SetStateAction<{
        openStatus: boolean;
        modalType: "add" | "edit";
        recordId: string;
    }>>
}) => {
    const axiosChangeTaskList = async (taskStatusId: string): Promise<void> => {
        const data = {
            id: task._id,
            taskStatusId: taskStatusId,
            taskWorkspaceId: task.taskWorkspaceId,
        };

        try {
            await axiosCustom.post('/api/task/crud/taskEdit', data);
            setRefreshRandomNum(
                Math.floor(
                    Math.random() * 1_000_000
                )
            )
        } catch (error) {
            console.error('Error updating task group:', error);
        }
    };

    const axiosChangeTaskPin = async ({
        isTaskPinned,
    }: {
        isTaskPinned: boolean,
    }): Promise<void> => {
        const data = {
            id: task._id,
            isTaskPinned,
            taskWorkspaceId: task.taskWorkspaceId,
        };

        try {
            await axiosCustom.post('/api/task/crud/taskEdit', data);
            setRefreshRandomNum(
                Math.floor(
                    Math.random() * 1_000_000
                )
            )
        } catch (error) {
            console.error('Error updating task group:', error);
        }
    };

    const axiosDeleteTask = async (taskId: string): Promise<void> => {
        const confirmDelete = window.confirm("Are you sure you want to delete this task?");
        if (!confirmDelete) return;

        const data = JSON.stringify({ id: taskId });
        const config = {
            method: 'post',
            url: '/api/task/crud/taskDelete',
            headers: {
                'Content-Type': 'application/json',
            },
            data: data,
        };

        try {
            const response = await axiosCustom.request(config);
            if (response.status === 200) {
                setRefreshRandomNum(
                    Math.floor(
                        Math.random() * 1_000_000
                    )
                )
            } else {
                console.error('Failed to delete task:', response.statusText);
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'very-high':
                return 'bg-purple-100 text-purple-800';
            case 'high':
                return 'bg-red-100 text-red-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    const renderTaskNew = () => {
        const now = new Date();
        const dueDate = new Date(task.dueDate);
        const isOverdue = task.dueDate && dueDate < now && !task.isCompleted;

        let isUpdatedNow = false;
        if (task.updatedAtUtc) {
            const updatedAt = new Date(task.updatedAtUtc);
            const now = new Date();
            const timeDiff = now.getTime() - updatedAt.getTime();
            const minutesDiff = Math.floor(timeDiff / (1000 * 60));
            if (minutesDiff < 5) {
                isUpdatedNow = true;
            }
        }

        return (
            <div
                className={`
                    bg-white p-3 rounded-sm shadow-sm mb-2 hover:shadow-md transition-shadow group cursor-pointer
                    ${isUpdatedNow ? 'border-2 border-blue-500' : ''}
                `}
            >
                <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-800">{task.title}</h3>
                </div>

                <div className="flex flex-wrap gap-2 mt-2 items-center">
                    {task.labels && task.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {task.labels.map((label) => (
                                <div
                                    key={label}
                                    className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-sm bg-gray-100 text-gray-800"
                                >
                                    {label}
                                </div>
                            ))}
                        </div>
                    )}

                    {task.isCompleted && (
                        <div className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-sm">
                            Completed
                        </div>
                    )}
                    {task.isArchived && (
                        <div className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-sm">
                            Archived
                        </div>
                    )}
                    {task.priority && (
                        <div className={`text-xs px-2 py-0.5 rounded-sm ${getPriorityColor(task?.priority)}`}>
                            Priority: {task.priority.replace('-', ' ')}
                        </div>
                    )}

                    {task.dueDate && (
                        <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-sm ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                            <LucideClock size={12} />
                            <span>
                                {dueDate.toLocaleDateString()}
                                {' '}
                                {dueDate.toLocaleTimeString()}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex items-center mt-2 gap-2">
                    <select
                        value={task.taskStatusId}
                        onChange={(e) => {
                            console.log(e.target.value);
                            axiosChangeTaskList(e.target.value);
                        }}
                        className="border border-gray-300 px-2 py-1 pr-4 rounded-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out hover:bg-blue-50 text-sm"
                        style={{
                            width: '100px',
                        }}
                    >
                        {taskStatusList.map((taskStatus) => (
                            <option key={taskStatus._id} value={taskStatus._id}>
                                {taskStatus.statusTitle}
                            </option>
                        ))}
                    </select>
                    <div className="flex gap-1">
                        <button
                            onClick={() => axiosDeleteTask(task._id)}
                            className="text-red-600 p-1 rounded-sm hover:bg-red-50 transition"
                            aria-label="Delete task"
                        >
                            <LucideTrash2 size={16} />
                        </button>
                        <button
                            onClick={() => setIsTaskAddModalIsOpen({ openStatus: true, modalType: 'edit', recordId: task._id })}
                            className="text-blue-600 p-1 rounded-sm hover:bg-blue-50 transition"
                            aria-label="Edit task"
                        >
                            <LucideEdit3 size={16} />
                        </button>
                        <button
                            onClick={() => setIsTaskAddModalIsOpen({ openStatus: true, modalType: 'edit', recordId: task._id })}
                            className="text-gray-600 p-1 rounded-sm hover:bg-gray-50 transition"
                            aria-label="View task details"
                        >
                            <LucideInfo size={16} />
                        </button>
                        <button
                            onClick={() => {
                                axiosChangeTaskPin({
                                    isTaskPinned: !task.isTaskPinned,
                                })
                            }}
                            className={`text-gray-600 p-1 rounded-sm hover:bg-gray-50 transition`}
                            aria-label="Pin task"
                        >
                            <LucidePin
                                size={24}
                                className={`p-1 rounded-sm ${task.isTaskPinned ? 'text-blue-600 bg-blue-100' : 'text-gray-600'}`}
                            />
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div>
                    <button
                        onClick={() => {
                            // Handle chat with LLM functionality
                            console.log('Chat with LLM for task:', task._id);
                            taskChatWithAi(task._id);
                        }}
                        className="text-purple-600 p-1 rounded-sm hover:bg-purple-50 transition mt-2"
                    >
                        <LucideMessageCircle
                            size={16}
                            className="inline-block mr-2"
                            style={{
                                marginBottom: '5px',
                            }}
                        /> AI chat with task
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full">
            {renderTaskNew()}
        </div>
    );
}

export default TaskItem;