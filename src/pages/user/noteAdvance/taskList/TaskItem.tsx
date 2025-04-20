import { tsPageTask } from "../../../../types/pages/tsPageTaskList";

import axiosCustom from '../../../../config/axiosCustom';
import { LucideClock, LucideEdit3, LucideInfo, LucideTrash2, LucideMessageSquare } from "lucide-react";

const TaskItem = ({
    task,
    taskStatusArr,
    setRefreshRandomNum,
    setIsTaskAddModalIsOpen,
}: {
    task: tsPageTask;
    taskStatusArr: string[],
    setRefreshRandomNum: (value: React.SetStateAction<number>) => void;
    setIsTaskAddModalIsOpen: React.Dispatch<React.SetStateAction<{
        openStatus: boolean;
        modalType: "add" | "edit";
        recordId: string;
    }>>
}) => {
    const axiosChangeTaskList = async (taskId: string, taskStatus: string): Promise<void> => {
        const data = JSON.stringify({
            id: taskId,
            taskStatus: taskStatus
        });

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: '/api/task/crud/taskEdit',
            headers: {
                'Content-Type': 'application/json',
            },
            data: data
        };

        try {
            const response = await axiosCustom.request(config); // Use axiosCustom instead of axios
            console.log(JSON.stringify(response.data));
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
                // Update the tasks state to remove the deleted task
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

    const renderTaskNew = () => {
        const isOverdue = false
        return (
            <div
                className="bg-white p-3 rounded-lg shadow-sm mb-2 hover:shadow-md transition-shadow group cursor-pointer"
            // onClick={() => !isEditing && setShowDetails(true)}
            >
                <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-800">{task.title}</h3>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                    {task.description && (
                        <div className="text-gray-500">
                            <LucideMessageSquare size={14} />
                        </div>
                    )}
                    {task.labels && task.labels.length >= 0 && (
                        <div className="flex flex-wrap gap-1">
                            {task.labels.map((label) => {
                                // const labelInfo = availableLabels.find(l => l.name === label);
                                return (
                                    <div
                                        key={label}
                                        className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full`}
                                    >
                                        {label}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {task.dueDate && (
                        // TODO
                        <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                            <LucideClock size={12} />
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center mt-2">
                    <select
                        value={task.taskStatus} // Changed from list to taskStatusCurrent
                        onChange={(e) => axiosChangeTaskList(task._id, e.target.value)}
                        className="border border-gray-300 px-2 py-1 pr-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out hover:bg-blue-50"
                    >
                        {taskStatusArr.map((groupOption) => (
                            <option key={groupOption} value={groupOption} className="p-2 hover:bg-blue-100">
                                {groupOption}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() => axiosDeleteTask(task._id)}
                        className="text-red-600 text-sm p-1 rounded hover:text-red-700 transition ml-2"
                    >
                        <LucideTrash2 size={16} /> {/* Changed size to 16 */}
                    </button>
                    <button
                        onClick={() => setIsTaskAddModalIsOpen({ openStatus: true, modalType: 'edit', recordId: task._id })}
                        className="text-blue-600 text-sm p-1 rounded hover:text-blue-700 transition ml-2"
                    >
                        <LucideEdit3 size={16} /> {/* Changed size to 16 */}
                    </button>
                    <button
                        onClick={() => setIsTaskAddModalIsOpen({ openStatus: true, modalType: 'edit', recordId: task._id })}
                        className="text-blue-600 text-sm p-1 rounded hover:text-blue-700 transition ml-2"
                    >
                        <LucideInfo size={16} /> {/* Changed size to 16 */}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div>
            {renderTaskNew()}
        </div>
    );
}

export default TaskItem;