import React, { useEffect, useState } from 'react';
import { CheckSquare, Square, Trash2, Plus } from 'lucide-react';
import axiosCustom from '../../../../../config/axiosCustom';
import { DebounceInput } from 'react-debounce-input';
import toast from 'react-hot-toast';

const ComponentSubTaskItem = ({
    subtask,
    setRandomNumLoading
}: {
    subtask: { _id: string; title: string; taskCompletedStatus: boolean };
    setRandomNumLoading: React.Dispatch<React.SetStateAction<number>>;
}) => {

    const [shouldUpdateSubTitle, setShouldUpdateSubTitle] = useState(false);
    const [axiosEditTitleLoading, setAxiosEditTitleLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: subtask.title,
    });

    const updateSubCompleted = async ({
        taskCompletedStatus,
    }: {
        taskCompletedStatus: boolean;
    }) => {
        const updatedSubtask = subtask;
        if (updatedSubtask) {
            try {
                await axiosCustom.post('/api/task-sub/crud/taskSubEdit', {
                    id: subtask._id,
                    taskCompletedStatus: taskCompletedStatus,
                });
                setRandomNumLoading(Math.random() * 1000000);
                // await fetchSubtasks();
            } catch (error) {
                console.error('Error updating subtask:', error);
            }
        }
    };

    const updateSubTitle = async ({
        title,
    }: {
        title: string;
    }) => {
        setAxiosEditTitleLoading(true);
        try {
            await axiosCustom.post('/api/task-sub/crud/taskSubEdit', {
                id: subtask._id,
                title: title
            });

            toast.success('Sub task title updated successfully');
        } catch (error) {
            console.error('Error updating subtask:', error);
        } finally {
            setAxiosEditTitleLoading(false);
        }
    };

    const deleteSubtask = async () => {
        try {
            await axiosCustom.post(
                '/api/task-sub/crud/taskSubDelete',
                {
                    id: subtask._id
                }
            );
            setRandomNumLoading(Math.random() * 1000000);
            // await fetchSubtasks();
        } catch (error) {
            console.error('Error deleting subtask:', error);
        }
    };

    useEffect(() => {
        if (shouldUpdateSubTitle) {
            updateSubTitle({ title: formData.title })
        }
    }, [formData.title])

    return (
        <div>
            <div className="flex items-center gap-1 w-full">
                {/* completed status */}
                {subtask.taskCompletedStatus ? (
                    <button
                        onClick={() => updateSubCompleted({ taskCompletedStatus: false })}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <CheckSquare size={16} className="text-green-500" />
                    </button>
                ) : (
                    <button
                        onClick={() => updateSubCompleted({ taskCompletedStatus: true })}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <Square size={16} />

                    </button>
                )}

                {/* input title */}
                <DebounceInput
                    debounceTimeout={1000}
                    type="text"
                    value={formData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setShouldUpdateSubTitle(true);
                        setFormData({ ...formData, title: e.target.value })
                    }}
                    className={subtask.taskCompletedStatus ? 'line-through text-gray-500 w-full' : 'w-full'}
                />

                {/* delete subtask button */}
                <button
                    onClick={() => deleteSubtask()}
                    className="text-red-500 hover:text-red-700"
                >
                    <Trash2 size={16} />
                </button>
            </div>
            {axiosEditTitleLoading && (
                <div className="text-gray-500 text-xs">
                    Saving title...
                </div>
            )}
        </div>
    )
}

const ComponentTaskSubList: React.FC<{
    parentTaskId: string;
    newTaskSubtasks: string[]
}> = ({ parentTaskId, newTaskSubtasks }) => {
    const [subtasks, setSubtasks] = useState<{ _id: string; title: string; taskCompletedStatus: boolean }[]>([]);
    const [newSubtask, setNewSubtask] = useState('');
    const [loading, setLoading] = useState(true); // New loading state
    const [randomNumLoading, setRandomNumLoading] = useState(0);

    useEffect(() => {
        fetchSubtasks();
    }, [parentTaskId, randomNumLoading]);

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
                    <ComponentSubTaskItem
                        key={subtask._id}
                        subtask={subtask}
                        setRandomNumLoading={setRandomNumLoading}
                    />
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
