import React, { useEffect, useState } from 'react';
import { CheckSquare, Square, Trash2, Plus, Edit, Save, LucideMoreVertical } from 'lucide-react';
import axiosCustom from '../../../../../config/axiosCustom';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import SpeechToTextComponent from '../../../../../components/componentCommon/SpeechToTextComponent';

const createTodoCardFromSubtask = async ({
    subTaskTitle,
    parentTaskId,
}: {
    subTaskTitle: string;
    parentTaskId: string;
}): Promise<{
    success: boolean;
    message: string;
    recordId: string;
}> => {
    try {
        // get task by id
        const response = await axiosCustom.post('/api/task/crud/taskGet', {
            recordId: parentTaskId
        });
        const task = response.data.docs[0];

        if (!task) {
            throw new Error('Task not found');
        }

        const newTask = {
            ...task,
            title: `${task.title} - ${subTaskTitle}`,
            isArchived: false,
            isCompleted: false,
        }

        const data = JSON.stringify(newTask);
        const config = {
            method: 'post',
            url: '/api/task/crud/taskAdd',
            headers: {
                'Content-Type': 'application/json',
            },
            data: data
        };

        const responseInsert = await axiosCustom.request(config);
        return {
            success: true,
            message: 'Task created successfully',
            recordId: responseInsert.data._id,
        };
    } catch (error) {
        console.error('Error adding task:', error);
        let errorMessage = 'An error occurred while adding the task. Please try again.';
        if (error instanceof AxiosError) {
            errorMessage = error.response?.data?.message || errorMessage;
        }
        return {
            success: false,
            message: errorMessage,
            recordId: '',
        };
    }
};

const ComponentSubTaskItem = ({
    subtask,
    setRandomNumLoading,
    parentWorkspaceId,
    parentTaskId,
}: {
    subtask: { _id: string; title: string; taskCompletedStatus: boolean };
    setRandomNumLoading: React.Dispatch<React.SetStateAction<number>>;
    parentWorkspaceId: string;
    parentTaskId: string;
}) => {
    const [axiosEditTitleLoading, setAxiosEditTitleLoading] = useState(false);
    const [showEditTitle, setShowEditTitle] = useState(false);
    const [showMoreOptions, setShowMoreOptions] = useState(false);

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

    const createTodoCardFromSubtaskLocal = async () => {
        try {
            const response = await createTodoCardFromSubtask({
                subTaskTitle: subtask.title,
                parentTaskId: parentTaskId,
            });
            console.log('response', response);
            if (response.success) {
                toast.success(response.message);

                setRandomNumLoading(Math.random() * 1000000);

                // remove the subtask from the list
                await deleteSubtask();

                // redirect to the new task
                window.location.href = `/user/task?workspace=${parentWorkspaceId}&edit-task-id=${response.recordId}`;
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error('Error creating todo card from subtask:', error);
        }
    }

    return (
        <div>
            <div
                className="w-full rounded-lg border border-violet-200/60 bg-gradient-to-br from-white/90 via-fuchsia-50/10 to-cyan-50/20 p-1 shadow-sm"
            >
                <div
                    className='px-1.5'
                >
                    {showEditTitle ? (
                        <textarea
                            value={formData.title}
                            placeholder="Enter subtask"
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                setFormData({ ...formData, title: e.target.value })
                            }}
                            className="mt-0.5 w-full rounded-md border border-slate-200/80 bg-white p-1.5 text-xs text-slate-800 transition placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-200/55"
                            rows={2}
                        />
                    ) : (
                        <span className="text-xs leading-snug text-slate-800">{formData.title}</span>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-px">
                    {showEditTitle && (
                        <span className='px-1 py-0.5'>
                            <SpeechToTextComponent
                                onTranscriptionComplete={(text: string) => {
                                    setFormData({ ...formData, title: formData.title + ' ' + text })
                                }}
                                parentEntityId={parentTaskId}
                            />
                        </span>
                    )}
                    <button
                        onClick={() => updateSubCompleted({ taskCompletedStatus: !subtask.taskCompletedStatus })}
                        className="rounded-md p-1 text-slate-500 transition-colors hover:bg-sky-50 hover:text-slate-800"
                    >
                        {subtask.taskCompletedStatus ? (
                            <CheckSquare size={16} className="text-emerald-600" />
                        ) : (
                            <Square size={16} />
                        )}
                    </button>
                    {showEditTitle ? (
                        <button
                            onClick={() => {
                                updateSubTitle({ title: formData.title })
                                setShowEditTitle(!showEditTitle)
                            }}
                            className="rounded-md p-1 text-slate-500 transition-colors hover:bg-sky-50 hover:text-slate-800"
                        >
                            <Save size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                setShowEditTitle(!showEditTitle)
                            }}
                            className="rounded-md p-1 text-slate-500 transition-colors hover:bg-sky-50 hover:text-slate-800"
                        >
                            <Edit size={16} />
                        </button>
                    )}
                    <button
                        onClick={() => deleteSubtask()}
                        className="rounded-md p-1 text-slate-400 transition-colors hover:bg-sky-100 hover:text-sky-800"
                    >
                        <Trash2 size={16} />
                    </button>
                    <button
                        onClick={() => {
                            setShowMoreOptions(!showMoreOptions)
                        }}
                        className="rounded-md p-1 text-slate-500 transition-colors hover:bg-sky-50 hover:text-slate-800"
                    >
                        <LucideMoreVertical size={16} />
                    </button>
                </div>

                {/* show more options */}
                {showMoreOptions && (
                    <div className="px-1.5 pb-0.5">
                        <button
                            onClick={() => {
                                createTodoCardFromSubtaskLocal();
                            }}
                            className="rounded-md px-1.5 py-0.5 text-[11px] font-medium text-sky-700 transition-colors hover:bg-sky-50 hover:text-sky-900"
                        >
                            Create Todo Card
                        </button>
                    </div>
                )}

                {/* loading */}
                {axiosEditTitleLoading && (
                    <div className="px-1.5 pb-0.5 text-[11px] text-sky-600/90">Saving...</div>
                )}
            </div>
        </div>
    )
}

const ComponentTaskSubList: React.FC<{
    parentWorkspaceId: string;
    parentTaskId: string;
    newTaskSubtasks: string[]
}> = ({ parentWorkspaceId, parentTaskId, newTaskSubtasks }) => {
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
        <div className="mt-1">
            <div className="mb-0.5 flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold text-violet-900">
                    Subtasks {loading && <span className="font-normal text-fuchsia-600">Loading...</span>}
                </h3>
                <span className="text-[11px] tabular-nums text-violet-600/80">
                    {subtasks.filter(st => st.taskCompletedStatus).length}/{subtasks.length}
                </span>
            </div>
            <div className="space-y-1">
                {subtasks.map((subtask) => (
                    <ComponentSubTaskItem
                        key={subtask._id}
                        subtask={subtask}
                        setRandomNumLoading={setRandomNumLoading}
                        parentTaskId={parentTaskId}
                        parentWorkspaceId={parentWorkspaceId}
                    />
                ))}
                <div className="mt-1.5 gap-1">
                    <textarea
                        value={newSubtask}
                        placeholder="Add a subtask…"
                        onChange={(e) => setNewSubtask(e.target.value)}
                        className="w-full rounded-md border border-slate-200/80 bg-white p-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-200/55"
                        rows={2}
                    />
                    <div className='mt-1 flex items-center gap-1'>
                        <button
                            onClick={() => {
                                onAddSubtask({
                                    argNewSubtask: newSubtask
                                });
                            }}
                            className="flex items-center rounded-md border border-violet-200/80 bg-white px-2 py-1 text-violet-700 shadow-sm transition hover:bg-violet-50"
                        >
                            <Plus size={14} />
                        </button>
                        <span className='px-0.5 py-0.5'>
                            <SpeechToTextComponent
                                onTranscriptionComplete={(text: string) => {
                                    if (text.trim() !== '') {
                                        setNewSubtask((prev: string) => prev.trim() + ' ' + text.trim());
                                    }
                                }}
                                parentEntityId={parentTaskId}
                            />
                        </span>
                    </div>
                </div>
            </div>

            {/* New task sub tasks */}
            {newTaskSubtasks.length > 0 && (
                <div className="mt-1.5 rounded-lg border border-sky-200/80 bg-sky-50/80 p-1.5">
                    <div className="space-y-0.5">
                        {newTaskSubtasks.map((subtask, index) => (
                            <div
                                key={index}
                                className={`
                                    flex flex-wrap items-center gap-1
                                    ${index === newTaskSubtasks.length - 1 ? '' : 'border-b border-sky-100/90'} 
                                    pb-0.5
                                `}
                            >
                                <span className="min-w-0 flex-1 text-[11px] text-slate-700">AI: {subtask}</span>
                                <button
                                    onClick={() => {
                                        onAddSubtask({
                                            argNewSubtask: subtask
                                        });
                                    }}
                                    className="shrink-0 rounded-md bg-gradient-to-r from-sky-500 to-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white shadow-sm shadow-sky-500/20 transition hover:from-sky-400 hover:to-blue-500"
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
