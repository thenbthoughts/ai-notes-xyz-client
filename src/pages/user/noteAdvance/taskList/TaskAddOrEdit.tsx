import { Fragment, useEffect, useState } from 'react';
import axiosCustom from '../../../../config/axiosCustom';
import ComponentTaskSubList from './componentTaskSubList/ComponentTaskSubList';
import ComponentTaskCommentList from './componentTaskCommentList/ComponentTaskCommentList';
import { LucideDelete } from 'lucide-react';
import ComponentSelectWorkspace from './ComponentTaskEdit/ComponentSelectWorkspace';

const TaskAddOrEdit: React.FC<{
    isTaskAddModalIsOpen: {
        openStatus: boolean;
        modalType: 'add' | 'edit';
        recordId: string;
    };
    setIsTaskAddModalIsOpen: React.Dispatch<React.SetStateAction<{
        openStatus: boolean;
        modalType: 'add' | 'edit';
        recordId: string;
    }>>;
}> = ({ isTaskAddModalIsOpen, setIsTaskAddModalIsOpen }) => {
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [comments, setComments] = useState<{ text: string; date: string }[]>([]);
    const [status, setStatus] = useState('todo'); // New state for status
    const [dueDate, setDueDate] = useState(''); // New state for due date
    const [labels, setLabels] = useState<string[]>([]); // New state for labels
    const [newLabel, setNewLabel] = useState(''); // New state for new label
    const [isAddingLabel, setIsAddingLabel] = useState(false); // State to control label input visibility

    const [formData, setFormData] = useState({
        priority: '',
        isArchived: false,
        isCompleted: false,
    });

    const [workspaceId, setWorkspaceId] = useState('');
    const [taskStatusId, setTaskStatusId] = useState('');

    const [taskCommentsReloadRandomNum, setTaskCommentsReloadRandomNum] = useState(Math.random());

    const [taskAiSuggestionLoading, setTaskAiSuggestionLoading] = useState(false);
    const [taskAiSuggestion, setTaskAiSuggestion] = useState({
        display: false,
        newTaskTitle: '',
        newTaskDescription: '',
        newTaskPriority: '',
        newTaskDueDate: '',
        newTaskTags: [] as string[],
        newTaskSubtasks: [] as string[],
        newTaskAiSuggestion: '',
    });

    useEffect(() => {
        const fetchTaskById = async () => {
            if (isTaskAddModalIsOpen.modalType === 'edit' && isTaskAddModalIsOpen.recordId) {
                const config = {
                    method: 'post',
                    url: '/api/task/crud/taskGet',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    data: { recordId: isTaskAddModalIsOpen.recordId }
                };

                try {
                    const response = await axiosCustom.request(config);
                    const taskArr = response.data.docs;
                    if (taskArr.length === 1) {
                        const taskInfo = taskArr[0];
                        setTaskTitle(taskInfo.title);
                        setTaskDescription(taskInfo.description);
                        setComments(taskInfo.comments || []); // Assuming comments are part of the task info
                        setStatus(taskInfo.taskStatus || 'Uncategorized'); // Set status from task info
                        setDueDate(taskInfo.dueDate || ''); // Set due date from task info
                        setLabels(taskInfo?.labels); // Set labels from task info

                        setWorkspaceId(taskInfo.taskWorkspaceId || '');

                        setFormData({
                            isArchived: taskInfo.isArchived || false,
                            isCompleted: taskInfo.isCompleted || false,
                            priority: taskInfo.priority || '',
                        });
                    } else {
                        toggleModal();
                    }
                } catch (error) {
                    console.error('Error fetching task:', error);
                }
            } else {
                setTaskTitle(''); // Reset task title
                setTaskDescription(''); // Reset task description
                setComments([]); // Reset comments
                setStatus('Uncategorized'); // Reset status
                setDueDate(''); // Reset due date
                setLabels([]); // Reset labels
                setNewLabel(''); // Reset new label
                setIsAddingLabel(false); // Reset label input visibility
            }
        };

        fetchTaskById();
    }, [isTaskAddModalIsOpen]);

    const toggleModal = () => {
        setIsTaskAddModalIsOpen({
            ...isTaskAddModalIsOpen,
            openStatus: !isTaskAddModalIsOpen.openStatus
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskTitle.trim()) return;

        let url = '/api/task/crud/taskAdd';
        if (isTaskAddModalIsOpen.modalType === 'edit') {
            url = '/api/task/crud/taskEdit';
        }

        const newTask = {
            title: taskTitle,
            description: taskDescription,
            completed: false,
            list: 'To Do',
            comments: comments.map(comment => comment.text), // Include comments in the task
            status: status, // Include status in the task
            dueDate: dueDate, // Include due date in the task
            labels: labels, // Include labels in the task

            // status
            priority: formData.priority,
            isArchived: formData.isArchived,
            isCompleted: formData.isCompleted,

            // workspace
            taskWorkspaceId: workspaceId,
        } as {
            id?: string;
            title: string;
            description: string;
            completed: boolean;
            list: string;
            comments: string[];
            subtasks: { title: string; completed: boolean }[];
            status: string;
            dueDate: string;
            labels: string[];

            // status
            priority: string;
            isArchived: boolean;
            isCompleted: boolean;

            // workspace
            taskWorkspaceId: string;
            taskStatusId: string;
        };

        if (taskStatusId !== 'EMPTY') {
            newTask.taskStatusId = '';
        }

        if (isTaskAddModalIsOpen.modalType === 'edit') {
            newTask.id = isTaskAddModalIsOpen.recordId;
        }

        const data = JSON.stringify(newTask);
        const config = {
            method: 'post',
            url: url,
            headers: {
                'Content-Type': 'application/json',
            },
            data: data
        };

        try {
            await axiosCustom.request(config);
            setTaskTitle('');
            setTaskDescription('');
            setComments([]);
            setStatus('todo'); // Reset status
            setDueDate(''); // Reset due date
            setLabels([]); // Reset labels
            toggleModal();
        } catch (error) {
            console.error('Error adding task:', error);
            alert('Oops! Something went wrong. Please try again. 😢');
        }
    };

    const handleAddLabel = () => {
        if (newLabel.trim()) {
            setLabels([...labels, newLabel.trim()]);
            setNewLabel('');
            setIsAddingLabel(false);
        }
    };

    const axiosGetTaskAiSuggestionById = async () => {
        setTaskAiSuggestionLoading(true);
        try {
            const response = await axiosCustom.post('/api/task/ai-generated/taskAiSuggestionById', {
                id: isTaskAddModalIsOpen.recordId
            });
            if (response.data.success) {
                const taskInfo = response.data.data.taskInfo;
                setTaskAiSuggestion({
                    display: true,
                    ...taskInfo,
                });
            } else {
                alert('Failed to fetch AI suggestion. Please try again.');
            }
        } catch (error) {
            console.error(error);
        } finally {
            const randomNum = Math.floor(Math.random() * 1000);
            setTaskCommentsReloadRandomNum(randomNum);
            setTaskAiSuggestionLoading(false);
        }
    };

    return (
        <div>
            {isTaskAddModalIsOpen.openStatus && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className='w-full'>
                        <div
                            style={{
                                maxWidth: '800px',
                                padding: '5px',
                                margin: '0 auto',
                            }}
                            className="custom-scrollbar"
                        >
                            <div className="bg-white rounded-lg shadow-lg p-1 relative w-full">
                                <div
                                    style={{
                                        padding: '5px',
                                        overflowY: 'auto',
                                        maxHeight: '80vh',
                                        scrollbarWidth: 'thin',
                                        scrollbarColor: '#4A90E2 #F5F5F5',
                                    }}
                                    className="custom-scrollbar"
                                >
                                    <h2 className="text-lg font-bold mb-2 text-center">
                                        {isTaskAddModalIsOpen.modalType === 'add' ? 'Add Task' : 'Edit Task'}
                                    </h2>

                                    {/* title */}
                                    <div className="py-2">
                                        <input
                                            type="text"
                                            className="border border-gray-300 rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                            placeholder="Enter task title"
                                            value={taskTitle}
                                            onChange={(e) => setTaskTitle(e.target.value)}
                                        />

                                        {/* set current date */}
                                        <div className='mt-1'>
                                            <button
                                                onClick={() => {
                                                    setTaskTitle(new Date().toISOString().split('T')[0])
                                                }}
                                                className="bg-gray-500 text-white text-xs font-medium px-2 py-1 rounded mt-1"
                                            >
                                                Today
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const tomorrow = new Date(
                                                        new Date().setDate(
                                                            new Date().getDate() + 1
                                                        )
                                                    );
                                                    setTaskTitle(tomorrow.toISOString().split('T')[0])
                                                }}
                                                className="bg-gray-500 text-white text-xs font-medium px-2 py-1 rounded mt-1 ml-1"
                                            >
                                                Tomorrow
                                            </button>
                                        </div>

                                        {taskAiSuggestion.display && (
                                            <div className='mt-1'>
                                                <div className='p-1 border rounded-lg bg-blue-100'>
                                                    AI:
                                                    <textarea
                                                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mt-1"
                                                        value={taskAiSuggestion.newTaskTitle}
                                                        onChange={(e) => setTaskAiSuggestion(prev => ({ ...prev, newTaskTitle: e.target.value }))}
                                                    />
                                                    <button
                                                        className='bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded'
                                                        onClick={() => {
                                                            setTaskTitle(taskAiSuggestion.newTaskTitle);
                                                        }}
                                                    >Replace</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {isTaskAddModalIsOpen.modalType === 'edit' && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <button
                                                onClick={() => {
                                                    if (taskAiSuggestionLoading === false) {
                                                        axiosGetTaskAiSuggestionById();
                                                    }
                                                }}
                                                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 text-sm font-medium px-2 py-1 rounded-full shadow-lg"
                                            >
                                                {
                                                    taskAiSuggestionLoading ? 'Loading...' : '🤖 AI'
                                                }
                                            </button>
                                            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full">Status: {status}</span>
                                            <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2 py-1 rounded-full">Due Date: {dueDate || 'No due date'}</span>
                                            {formData.isCompleted && (
                                                <span className={`bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded-full`}>
                                                    Completed
                                                </span>
                                            )}
                                            {formData.isArchived && (
                                                <span className={`bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded-full`}>
                                                    Archived
                                                </span>
                                            )}
                                            {formData.priority && (
                                                <span className={`bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded-full`}>
                                                    Priority: {formData.priority.replace(' ', '-')}
                                                </span>
                                            )}
                                            {labels.map((label, index) => (
                                                <span
                                                    key={index}
                                                    className={`bg-purple-100 text-purple-500 text-sm font-medium px-2 py-1 rounded-full mr-1`}
                                                >
                                                    <span>{label}</span>
                                                    <span
                                                        className="cursor-pointer inline-block ml-4"
                                                        onClick={() => {
                                                            setLabels(labels.filter((_, i) => i !== index));
                                                        }}
                                                        style={{
                                                            position: 'relative',
                                                            top: '3px',
                                                        }}
                                                    >
                                                        <LucideDelete className="w-4 h-4 text-red-500" />
                                                    </span>
                                                </span>
                                            ))}
                                            {taskAiSuggestion.newTaskTags.map((label, index) => (
                                                <span
                                                    key={index}
                                                    className={`bg-blue-100 text-blue-500 text-sm font-medium px-2 py-1 rounded-full mr-1`}
                                                    onClick={() => {
                                                        setLabels([...labels, label.trim()]);
                                                        setTaskAiSuggestion(prev => ({ ...prev, newTaskTags: prev.newTaskTags.filter((_, i) => i !== index) }));
                                                    }}
                                                >
                                                    🤖 AI: {label}
                                                </span>
                                            ))}
                                            <button
                                                onClick={() => setIsAddingLabel(!isAddingLabel)}
                                                className="bg-blue-500 text-white text-sm font-medium px-2 py-1 rounded-full"
                                            >
                                                Add Label
                                            </button>
                                        </div>
                                    )}

                                    {/* status */}
                                    <div className="flex flex-wrap gap-2">
                                        {isTaskAddModalIsOpen.modalType === 'edit' && (
                                            <Fragment>
                                                <div
                                                    className="py-2 flex items-center gap-2 bg-gray-100 rounded-lg p-2 cursor-pointer"
                                                    onClick={() => setFormData({ ...formData, isCompleted: !formData.isCompleted })}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="border border-gray-300 rounded-lg w-4 h-4 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                                        checked={formData.isCompleted}
                                                    />
                                                    <label className="block font-medium">Completed</label>
                                                </div>

                                                {/* archived */}
                                                <div
                                                    className="py-2 flex items-center gap-2 bg-gray-100 rounded-lg p-2 cursor-pointer"
                                                    onClick={() => setFormData({ ...formData, isArchived: !formData.isArchived })}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="border border-gray-300 rounded-lg w-4 h-4 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                                        checked={formData.isArchived}
                                                    />
                                                    <label className="block font-medium">Archived</label>
                                                </div>

                                                {/* priority */}
                                                <div className="py-2 flex items-center gap-2 bg-gray-100 rounded-lg p-2">
                                                    <label className="block font-medium">Priority:</label>
                                                    <select
                                                        className="border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                                        value={formData.priority}
                                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                                    >
                                                        <option value="">Select Priority</option>
                                                        <option value="very-high">Very High</option>
                                                        <option value="high">High</option>
                                                        <option value="medium">Medium</option>
                                                        <option value="low">Low</option>
                                                        <option value="very-low">Very Low</option>
                                                    </select>
                                                </div>
                                            </Fragment>
                                        )}

                                        {/* workspace */}
                                        <div className="py-2 flex items-center gap-2 bg-gray-100 rounded-lg p-2">
                                            <label className="block font-medium">Workspace:</label>
                                            <ComponentSelectWorkspace
                                                workspaceId={workspaceId}
                                                setWorkspaceIdFunc={(workspaceId: string) => {
                                                    setWorkspaceId(workspaceId);
                                                    setTaskStatusId('EMPTY');
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {isAddingLabel && (
                                        <div className="py-2">
                                            <input
                                                type="text"
                                                className="border border-gray-300 rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                                placeholder="Enter label"
                                                value={newLabel}
                                                onChange={(e) => setNewLabel(e.target.value)}
                                            />
                                            <button
                                                onClick={handleAddLabel}
                                                className="mt-2 px-2 py-1 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition duration-200"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    )}

                                    <div className="py-2">
                                        <label className="block mb-1 font-medium">Description:</label>
                                        <textarea
                                            className="border border-gray-300 rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                            placeholder="Enter task description"
                                            value={taskDescription}
                                            onChange={(e) => setTaskDescription(e.target.value)}
                                            rows={5}
                                        ></textarea>

                                        {taskAiSuggestion.display && (
                                            <div className='mt-1'>
                                                <div className='p-1 border rounded-lg bg-blue-100'>
                                                    <span className="font-bold">AI Suggestion:</span>
                                                    <textarea
                                                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mt-1"
                                                        value={taskAiSuggestion.newTaskDescription}
                                                        onChange={(e) => setTaskAiSuggestion(prev => ({ ...prev, newTaskDescription: e.target.value }))}
                                                        rows={5}
                                                    />
                                                    <button
                                                        className='bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded mt-2'
                                                        onClick={() => {
                                                            setTaskDescription(taskAiSuggestion.newTaskDescription);
                                                        }}
                                                    >Replace</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Subtasks */}
                                    {
                                        isTaskAddModalIsOpen.modalType === 'edit' && (
                                            <ComponentTaskSubList
                                                parentTaskId={isTaskAddModalIsOpen.recordId}
                                                newTaskSubtasks={taskAiSuggestion.newTaskSubtasks}
                                            />
                                        )
                                    }

                                    {/* comments */}
                                    {
                                        isTaskAddModalIsOpen.modalType === 'edit' && (
                                            <ComponentTaskCommentList
                                                parentTaskId={isTaskAddModalIsOpen.recordId}
                                                taskCommentsReloadRandomNum={taskCommentsReloadRandomNum}
                                            />
                                        )
                                    }
                                </div>

                                <div className="flex justify-end space-x-1 mt-3">
                                    <button type="button" onClick={toggleModal} className="bg-gray-300 text-gray-700 py-1 px-2 rounded hover:bg-gray-400">Cancel</button>
                                    <button type="button" onClick={handleSubmit} className="bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600">Save</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
};

export default TaskAddOrEdit;