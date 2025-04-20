import React, { useEffect, useState } from 'react';
import { CheckSquare, Square, Trash2, Plus } from 'lucide-react';
import axiosCustom from '../../../../../config/axiosCustom';

const ComponentTaskSubList: React.FC<{
    parentTaskId: string;
    newTaskSubtasks: string[]
}> = ({ parentTaskId, newTaskSubtasks }) => {
    const [subtasks, setSubtasks] = useState<{ _id: string; title: string; taskCompletedStatus: boolean }[]>([]);
    const [newSubtask, setNewSubtask] = useState('');
    const [loading, setLoading] = useState(true); // New loading state

    useEffect(() => {
        fetchSubtasks();
    }, [parentTaskId]);

    const fetchSubtasks = async () => {
        setLoading(true); // Set loading to true when fetching
        try {
            const response = await axiosCustom.post('/api/task-sub/crud/taskSubGet', { parentTaskId });
            setSubtasks(response.data.docs);
        } catch (error) {
            console.error('Error fetching subtasks:', error);
        } finally {
            setLoading(false); // Set loading to false after fetching
        }
    };

    const onAddSubtask = async ({
        argNewSubtask
    }: {
        argNewSubtask: string;
    }) => {
        if (argNewSubtask.trim()) {
            try {
                await axiosCustom.post('/api/task-sub/crud/taskSubAdd', {
                    title: argNewSubtask,
                    parentTaskId,
                    taskPosition: subtasks.length + 1 // Assuming taskPosition is based on the current length
                });
                setNewSubtask('');
                await fetchSubtasks();
            } catch (error) {
                console.error('Error adding subtask:', error);
            }
        }
    };

    const updateSubtaskPosition = async ({
        id,
        taskCompletedStatus,
    }: {
        id: string;
        taskCompletedStatus: boolean;
    }) => {
        const updatedSubtask = subtasks.find(subtask => subtask._id === id);
        if (updatedSubtask) {
            try {
                await axiosCustom.post('/api/task-sub/crud/taskSubEdit', {
                    id,
                    taskCompletedStatus: taskCompletedStatus
                });
                await fetchSubtasks();
            } catch (error) {
                console.error('Error updating subtask:', error);
            }
        }
    };

    const deleteSubtask = async (id: string) => {
        try {
            await axiosCustom.post(
                '/api/task-sub/crud/taskSubDelete',
                {
                    id
                }
            );
            await fetchSubtasks();
        } catch (error) {
            console.error('Error deleting subtask:', error);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-medium text-gray-700">
                    Subtasks {loading && <span className="text-blue-500">Loading...</span>} {/* Loading indicator */}
                </h3>
                <span className="text-sm text-gray-500">
                    {subtasks.filter(st => st.taskCompletedStatus).length}/{subtasks.length}
                </span>
            </div>
            <div className="space-y-1">
                {subtasks.map((subtask) => (
                    <div key={subtask._id} className="flex items-center gap-1">
                        {subtask.taskCompletedStatus ? (
                            <button
                                onClick={() => updateSubtaskPosition({ id: subtask._id, taskCompletedStatus: false })}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <CheckSquare size={16} className="text-green-500" />
                            </button>
                        ) : (
                            <button
                                onClick={() => updateSubtaskPosition({ id: subtask._id, taskCompletedStatus: true })}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <Square size={16} />

                            </button>
                        )}
                        <span className={subtask.taskCompletedStatus ? 'line-through text-gray-500' : ''}>
                            {subtask.title}
                        </span>
                        <button
                            onClick={() => deleteSubtask(subtask._id)}
                            className="text-red-500 hover:text-red-700"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
                <div className="flex gap-2 mt-2">
                    <input
                        type="text"
                        value={newSubtask}
                        onChange={(e) => setNewSubtask(e.target.value)}
                        placeholder="✨ Add a new subtask..."
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <button
                        onClick={() => {
                            onAddSubtask({
                                argNewSubtask: newSubtask
                            });
                        }}
                        className="px-3 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition duration-200 flex items-center"
                    >
                        <Plus size={16} />
                    </button>
                </div>
            </div>

            {/* New task sub tasks */}
            {newTaskSubtasks.length > 0 && (
                <div className="bg-blue-100 p-2 rounded mt-2">
                    <div className="space-y-1">
                        {newTaskSubtasks.map((subtask, index) => (
                            <div
                                key={index}
                                className={`
                                    flex items-center gap-1
                                    ${index === newTaskSubtasks.length - 1 ? '' : 'border-b border-gray-300'} 
                                    pb-1
                                `}
                            >
                                <span className="text-sm text-gray-500">AI Suggestion: {subtask}</span>
                                <button
                                    onClick={() => {
                                        onAddSubtask({
                                            argNewSubtask: subtask
                                        });
                                    }} // Pass the title instead of the whole subtask object
                                    className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded hover:bg-blue-600 transition duration-200 ml-2"
                                >
                                    Add
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
};

export default ComponentTaskSubList;
