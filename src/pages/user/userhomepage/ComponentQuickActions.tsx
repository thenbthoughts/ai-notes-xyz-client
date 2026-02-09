import { LucideZap, LucideChevronUp, LucideChevronDown, LucideFileText, LucideListTodo, LucidePlus, LucideBookOpen, LucideHeart, LucideCalendar, LucideStar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useState } from 'react';
import { notesQuickDailyNotesAddAxios, notesQuickTaskAddAxios } from '../features/Notes/utils/notesListAxios';
import { infoVaultAddAxios } from '../features/InfoVault/utils/infoVaultListAxios';
import { lifeEventAddAxios } from '../features/LifeEventsList/utils/lifeEventsListAxios';
import toast from 'react-hot-toast';
import axiosCustom from '../../../config/axiosCustom';


const QuickActionsComponent = () => {
    const [isActionsExpanded, setIsActionsExpanded] = useState(true);
    const [isAddThreadLoading, setIsAddThreadLoading] = useState(false);

    const navigate = useNavigate();

    const notesQuickDailyNotesAddAxiosLocal = async () => {
        const result = await notesQuickDailyNotesAddAxios();
        if (result.success.length > 0) {
            toast.success('Quick Daily Notes added successfully');
            navigate(`/user/notes?action=edit&id=${result.recordId}&workspace=${result.workspaceId}`)
        } else {
            toast.error(result.error);
        }
    }

    const notesQuickTaskAddAxiosLocal = async () => {
        const result = await notesQuickTaskAddAxios();
        if (result.success.length > 0) {
            toast.success('Quick Task added successfully');
            navigate(`/user/task?workspace=${result.workspaceId}&edit-task-id=${result.recordId}`)
        } else {
            toast.error(result.error);
        }
    }

    const addNewThread = async () => {
        setIsAddThreadLoading(true);
        try {
            const result = await axiosCustom.post(
                '/api/chat-llm/threads-crud/threadsAdd',
                {
                    isPersonalContextEnabled: false,
                    isAutoAiContextSelectEnabled: false,

                    // selected model
                    aiModelProvider: 'openrouter',
                    aiModelName: 'openrouter/auto',
                }
            );

            const tempThreadId = result?.data?.thread?._id;
            if (tempThreadId) {
                if (typeof tempThreadId === 'string') {
                    const redirectUrl = `/user/chat?id=${tempThreadId}`;
                    navigate(redirectUrl);
                }
            }

            toast.success('New thread added successfully!');
        } catch (error) {
            alert('Error adding new thread: ' + error);
        } finally {
            setIsAddThreadLoading(false);
        }
    };

    const addTaskLocal = async () => {
        try {
            // Get or create Daily Task workspace
            let taskWorkspaceId = '';
            const workspaceResult = await axiosCustom.post('/api/task-workspace/crud/taskWorkspaceGet');
            if (workspaceResult.data.docs && workspaceResult.data.docs.length > 0) {
                const workspaceArr = workspaceResult.data.docs;
                workspaceArr.forEach((item: { _id: string; title: string }) => {
                    if (item.title === 'Daily Task') {
                        taskWorkspaceId = item._id;
                    }
                });
            }

            if (taskWorkspaceId === '') {
                const createResult = await axiosCustom.request({
                    method: 'post',
                    url: '/api/task-workspace/crud/taskWorkspaceAdd',
                    headers: { 'Content-Type': 'application/json' },
                    data: { title: 'Daily Task', description: 'Daily Task' },
                });
                if (createResult.data.doc) {
                    taskWorkspaceId = createResult.data.doc._id;
                }
            }

            if (taskWorkspaceId === '') {
                toast.error('No task workspace found. Please create a task workspace first.');
                return;
            }

            // Create new task with date-time title
            const now = new Date();
            const dateTimeStr = now.toISOString().replace('T', ' ').substring(0, 19);
            const taskTitle = `Task - ${dateTimeStr}`;

            const taskResult = await axiosCustom.post('/api/task/crud/taskAdd', {
                taskWorkspaceId: taskWorkspaceId,
                title: taskTitle,
                description: '',
                completed: false,
                list: 'To Do'
            });

            const doc = taskResult.data.doc || taskResult.data;
            if (typeof doc._id === 'string' && doc._id.length === 24) {
                toast.success('Task added successfully');
                navigate(`/user/task?workspace=${taskWorkspaceId}&edit-task-id=${doc._id}`);
            } else {
                toast.error('An error occurred while adding the task. Please try again.');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred while adding the task. Please try again.');
        }
    }

    const addNotesLocal = async () => {
        try {
            // Get or create Quick Daily Notes workspace
            let notesWorkspaceId = '';
            const workspaceResult = await axiosCustom.post('/api/notes-workspace/crud/notesWorkspaceGet');
            if (workspaceResult.data.docs && workspaceResult.data.docs.length > 0) {
                const workspaceArr = workspaceResult.data.docs;
                workspaceArr.forEach((item: { _id: string; title: string }) => {
                    if (item.title === 'Quick Daily Notes') {
                        notesWorkspaceId = item._id;
                    }
                });
            }

            if (notesWorkspaceId === '') {
                const createResult = await axiosCustom.request({
                    method: 'post',
                    url: '/api/notes-workspace/crud/notesWorkspaceAdd',
                    headers: { 'Content-Type': 'application/json' },
                    data: { title: 'Quick Daily Notes', description: 'Quick Daily Notes' },
                });
                if (createResult.data.doc) {
                    notesWorkspaceId = createResult.data.doc._id;
                }
            }

            if (notesWorkspaceId === '') {
                toast.error('No notes workspace found. Please create a notes workspace first.');
                return;
            }

            // Create new notes with date-time title
            const now = new Date();
            const dateTimeStr = now.toISOString().replace('T', ' ').substring(0, 19);
            const notesTitle = `Notes - ${dateTimeStr}`;

            const notesResult = await axiosCustom.post('/api/notes/crud/notesAdd', {
                notesWorkspaceId: notesWorkspaceId,
                title: notesTitle
            });

            const doc = notesResult.data.doc;
            if (typeof doc._id === 'string' && doc._id.length === 24) {
                toast.success('Notes added successfully');
                navigate(`/user/notes?action=edit&id=${doc._id}&workspace=${notesWorkspaceId}`);
            } else {
                toast.error('An error occurred while adding the notes. Please try again.');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred while adding the notes. Please try again.');
        }
    }

    const addInfoVaultLocal = async () => {
        const result = await infoVaultAddAxios();
        if (result.success && typeof result.success === 'string' && result.success.length > 0) {
            toast.success('Info Vault added successfully');
            navigate(`/user/info-vault?action=edit&id=${result.recordId}`)
        } else {
            toast.error(result.error);
        }
    }

    const addLifeEventLocal = async () => {
        const result = await lifeEventAddAxios();
        if (result.success && typeof result.success === 'string' && result.success.length > 0) {
            toast.success('Life Event added successfully');
            navigate(`/user/life-events?action=edit&id=${result.recordId}`)
        } else {
            toast.error(result.error);
        }
    }

    const addAboutTodayLocal = async () => {
        try {
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
            const title = `Today's Events on ${today}`;

            // First check if life event with this title already exists
            const getResult = await axiosCustom.post('/api/life-events/crud/lifeEventsGet', {
                titleExact: title,
                page: 1,
                perPage: 1
            });

            if (getResult.data.docs && getResult.data.docs.length > 0) {
                // Life event already exists, navigate to edit it
                const existingEvent = getResult.data.docs[0];
                toast.success('Found existing About Today entry');
                navigate(`/user/life-events?action=edit&id=${existingEvent._id}`);
                return;
            }

            // Life event doesn't exist, create new one
            const result = await axiosCustom.post('/api/life-events/crud/lifeEventsAdd', {
                title: title,
                description: 'About Today'
            });

            const doc = result.data.doc;
            if (typeof doc._id === 'string' && doc._id.length === 24) {
                toast.success('About Today added successfully');
                navigate(`/user/life-events?action=edit&id=${doc._id}`)
            } else {
                toast.error('An error occurred while adding About Today. Please try again.');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred while adding About Today. Please try again.');
        }
    }

    return (
        <div className="text-left p-2 border border-amber-400 rounded-sm shadow-md bg-gradient-to-r from-amber-100 to-amber-300 mb-1 hover:bg-amber-200 transition duration-300">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-bold text-amber-800">
                    <LucideZap size={16} className="inline mr-1" style={{ position: 'relative', top: '-2px' }} />
                    Quick Actions
                </h2>
                <button
                    onClick={() => setIsActionsExpanded(!isActionsExpanded)}
                    className="p-0.5 rounded-sm bg-white bg-opacity-50 hover:bg-opacity-70 transition duration-200"
                    title="Toggle Expand"
                >
                    {isActionsExpanded ?
                        <LucideChevronUp size={14} className="text-amber-600" /> :
                        <LucideChevronDown size={14} className="text-amber-600" />
                    }
                </button>
            </div>

            {isActionsExpanded && (
                <div className="space-y-1">
                    <div className="flex gap-1.5 flex-wrap">
                        <button
                            onClick={() => {
                                addNewThread();
                            }}
                            disabled={isAddThreadLoading}
                            className="flex items-center px-2.5 py-1 bg-white bg-opacity-70 rounded-sm text-xs font-medium text-amber-700 hover:bg-opacity-90 transition duration-200 transform hover:scale-105"
                        >
                            <LucidePlus size={12} className="mr-0.5" />
                            AI Chat
                        </button>
                        <button
                            onClick={() => {
                                notesQuickDailyNotesAddAxiosLocal();
                            }}
                            className="flex items-center px-2.5 py-1 bg-white bg-opacity-70 rounded-sm text-xs font-medium text-amber-700 hover:bg-opacity-90 transition duration-200 transform hover:scale-105"
                        >
                            <LucideFileText size={12} className="mr-0.5" />
                            Quick Daily Notes
                        </button>
                        <button
                            onClick={() => {
                                notesQuickTaskAddAxiosLocal();
                            }}
                            className="flex items-center px-2.5 py-1 bg-white bg-opacity-70 rounded-sm text-xs font-medium text-amber-700 hover:bg-opacity-90 transition duration-200 transform hover:scale-105"
                        >
                            <LucideListTodo size={12} className="mr-0.5" />
                            Quick Daily Task
                        </button>
                        <button
                            onClick={() => {
                                addNotesLocal();
                            }}
                            className="flex items-center px-2.5 py-1 bg-white bg-opacity-70 rounded-sm text-xs font-medium text-amber-700 hover:bg-opacity-90 transition duration-200 transform hover:scale-105"
                        >
                            <LucideFileText size={12} className="mr-0.5" />
                            Add Notes
                        </button>
                        <button
                            onClick={() => {
                                addTaskLocal();
                            }}
                            className="flex items-center px-2.5 py-1 bg-white bg-opacity-70 rounded-sm text-xs font-medium text-amber-700 hover:bg-opacity-90 transition duration-200 transform hover:scale-105"
                        >
                            <LucideStar size={12} className="mr-0.5" />
                            Add Task
                        </button>
                        <button
                            onClick={() => {
                                addInfoVaultLocal();
                            }}
                            className="flex items-center px-2.5 py-1 bg-white bg-opacity-70 rounded-sm text-xs font-medium text-amber-700 hover:bg-opacity-90 transition duration-200 transform hover:scale-105"
                        >
                            <LucideBookOpen size={12} className="mr-0.5" />
                            Add Info Vault
                        </button>
                        <button
                            onClick={() => {
                                addLifeEventLocal();
                            }}
                            className="flex items-center px-2.5 py-1 bg-white bg-opacity-70 rounded-sm text-xs font-medium text-amber-700 hover:bg-opacity-90 transition duration-200 transform hover:scale-105"
                        >
                            <LucideHeart size={12} className="mr-0.5" />
                            Add Life Event
                        </button>
                        <button
                            onClick={() => {
                                addAboutTodayLocal();
                            }}
                            className="flex items-center px-2.5 py-1 bg-white bg-opacity-70 rounded-sm text-xs font-medium text-amber-700 hover:bg-opacity-90 transition duration-200 transform hover:scale-105"
                        >
                            <LucideCalendar size={12} className="mr-0.5" />
                            Add About Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuickActionsComponent;