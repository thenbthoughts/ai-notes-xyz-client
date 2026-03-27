import {
    LucideZap,
    LucideChevronUp,
    LucideChevronDown,
    LucideFileText,
    LucideListTodo,
    LucidePlus,
    LucideBookOpen,
    LucideHeart,
    LucideCalendar,
    LucideStar,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useState } from 'react';
import { notesQuickDailyNotesAddAxios, notesQuickTaskAddAxios } from '../features/Notes/utils/notesListAxios';
import { infoVaultAddAxios } from '../features/InfoVault/utils/infoVaultListAxios';
import { lifeEventAddAxios } from '../features/LifeEventsList/utils/lifeEventsListAxios';
import toast from 'react-hot-toast';
import axiosCustom from '../../../config/axiosCustom';

const panel =
    'rounded-lg border border-zinc-200/90 bg-white p-2.5 shadow-sm transition hover:shadow';
const panelHeader = 'mb-1.5 flex items-center justify-between gap-1.5';
const panelTitle = 'flex items-center gap-1.5 text-xs font-semibold text-zinc-800';
const panelIconBtn =
    'rounded-md border border-zinc-200 bg-white p-1 text-zinc-600 shadow-sm transition hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-40';
const chipAction =
    'inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2 py-1 text-[11px] font-medium text-zinc-700 shadow-sm transition hover:border-teal-300 hover:bg-teal-50/70 disabled:opacity-50';

const QuickActionsComponent = () => {
    const [isActionsExpanded, setIsActionsExpanded] = useState(true);
    const [isAddThreadLoading, setIsAddThreadLoading] = useState(false);

    const navigate = useNavigate();

    const notesQuickDailyNotesAddAxiosLocal = async () => {
        const result = await notesQuickDailyNotesAddAxios();
        if (result.success.length > 0) {
            toast.success('Quick Daily Notes added successfully');
            navigate(`/user/notes?action=edit&id=${result.recordId}&workspace=${result.workspaceId}`);
        } else {
            toast.error(result.error);
        }
    };

    const notesQuickTaskAddAxiosLocal = async () => {
        const result = await notesQuickTaskAddAxios();
        if (result.success.length > 0) {
            toast.success('Quick Task added successfully');
            navigate(`/user/task?workspace=${result.workspaceId}&edit-task-id=${result.recordId}`);
        } else {
            toast.error(result.error);
        }
    };

    const addNewThread = async () => {
        setIsAddThreadLoading(true);
        try {
            let aiModelProvider: 'openrouter' | 'groq' | 'ollama' | 'openai-compatible' = 'openrouter';
            let aiModelName = 'openrouter/auto';
            let aiModelOpenAiCompatibleConfigId: string | null = null;

            try {
                const lastUsedResponse = await axiosCustom.get('/api/chat-llm/threads-crud/lastUsedLlmModel');
                if (lastUsedResponse.data.model) {
                    aiModelProvider = lastUsedResponse.data.model.aiModelProvider;
                    aiModelName = lastUsedResponse.data.model.aiModelName;
                    aiModelOpenAiCompatibleConfigId =
                        lastUsedResponse.data.model.aiModelOpenAiCompatibleConfigId || null;
                }
            } catch (error) {
                console.error('Error fetching last used model:', error);
            }

            const result = await axiosCustom.post('/api/chat-llm/threads-crud/threadsAdd', {
                isPersonalContextEnabled: false,
                isAutoAiContextSelectEnabled: false,
                aiModelProvider: aiModelProvider,
                aiModelName: aiModelName,
                aiModelOpenAiCompatibleConfigId: aiModelOpenAiCompatibleConfigId,
            });

            const tempThreadId = result?.data?.thread?._id;
            if (tempThreadId && typeof tempThreadId === 'string') {
                navigate(`/user/chat?id=${tempThreadId}`);
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

            const now = new Date();
            const dateStr = now.toLocaleDateString('en-CA');
            const timeStr = now.toLocaleTimeString('en-GB', { hour12: false });
            const dateTimeStr = `${dateStr} ${timeStr}`;
            const taskTitle = `Task - ${dateTimeStr}`;

            const taskResult = await axiosCustom.post('/api/task/crud/taskAdd', {
                taskWorkspaceId: taskWorkspaceId,
                title: taskTitle,
                description: '',
                completed: false,
                list: 'To Do',
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
    };

    const addNotesLocal = async () => {
        try {
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

            const now = new Date();
            const dateStr = now.toLocaleDateString('en-CA');
            const timeStr = now.toLocaleTimeString('en-GB', { hour12: false });
            const dateTimeStr = `${dateStr} ${timeStr}`;
            const notesTitle = `Notes - ${dateTimeStr}`;

            const notesResult = await axiosCustom.post('/api/notes/crud/notesAdd', {
                notesWorkspaceId: notesWorkspaceId,
                title: notesTitle,
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
    };

    const addInfoVaultLocal = async () => {
        const result = await infoVaultAddAxios();
        if (result.success && typeof result.success === 'string' && result.success.length > 0) {
            toast.success('Info Vault added successfully');
            navigate(`/user/info-vault?action=edit&id=${result.recordId}`);
        } else {
            toast.error(result.error);
        }
    };

    const addLifeEventLocal = async () => {
        const result = await lifeEventAddAxios();
        if (result.success && typeof result.success === 'string' && result.success.length > 0) {
            toast.success('Life Event added successfully');
            navigate(`/user/life-events?action=edit&id=${result.recordId}`);
        } else {
            toast.error(result.error);
        }
    };

    const addAboutTodayLocal = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const title = `Today's Events on ${today}`;

            const getResult = await axiosCustom.post('/api/life-events/crud/lifeEventsGet', {
                titleExact: title,
                page: 1,
                perPage: 1,
            });

            if (getResult.data.docs && getResult.data.docs.length > 0) {
                const existingEvent = getResult.data.docs[0];
                toast.success('Found existing About Today entry');
                navigate(`/user/life-events?action=edit&id=${existingEvent._id}`);
                return;
            }

            const result = await axiosCustom.post('/api/life-events/crud/lifeEventsAdd', {
                title: title,
                description: 'About Today',
            });

            const doc = result.data.doc;
            if (typeof doc._id === 'string' && doc._id.length === 24) {
                toast.success('About Today added successfully');
                navigate(`/user/life-events?action=edit&id=${doc._id}`);
            } else {
                toast.error('An error occurred while adding About Today. Please try again.');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred while adding About Today. Please try again.');
        }
    };

    return (
        <div className={`${panel} border-l-4 border-l-amber-400/70`}>
            <div className={panelHeader}>
                <h2 className={panelTitle}>
                    <LucideZap className="h-3.5 w-3.5 text-amber-600" strokeWidth={2} />
                    Quick actions
                </h2>
                <button
                    type="button"
                    onClick={() => setIsActionsExpanded(!isActionsExpanded)}
                    className={panelIconBtn}
                    title="Toggle"
                >
                    {isActionsExpanded ? (
                        <LucideChevronUp className="h-3.5 w-3.5" strokeWidth={2} />
                    ) : (
                        <LucideChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
                    )}
                </button>
            </div>

            {isActionsExpanded && (
                <div className="flex flex-wrap gap-1.5">
                    <button
                        type="button"
                        onClick={() => addNewThread()}
                        disabled={isAddThreadLoading}
                        className={chipAction}
                    >
                        <LucidePlus className="h-3.5 w-3.5" strokeWidth={2} />
                        AI chat
                    </button>
                    <button
                        type="button"
                        onClick={() => notesQuickDailyNotesAddAxiosLocal()}
                        className={chipAction}
                    >
                        <LucideFileText className="h-3.5 w-3.5" strokeWidth={2} />
                        Quick daily notes
                    </button>
                    <button
                        type="button"
                        onClick={() => notesQuickTaskAddAxiosLocal()}
                        className={chipAction}
                    >
                        <LucideListTodo className="h-3.5 w-3.5" strokeWidth={2} />
                        Quick daily task
                    </button>
                    <button type="button" onClick={() => addNotesLocal()} className={chipAction}>
                        <LucideFileText className="h-3.5 w-3.5" strokeWidth={2} />
                        Add notes
                    </button>
                    <button type="button" onClick={() => addTaskLocal()} className={chipAction}>
                        <LucideStar className="h-3.5 w-3.5" strokeWidth={2} />
                        Add task
                    </button>
                    <button type="button" onClick={() => addInfoVaultLocal()} className={chipAction}>
                        <LucideBookOpen className="h-3.5 w-3.5" strokeWidth={2} />
                        Info vault
                    </button>
                    <button type="button" onClick={() => addLifeEventLocal()} className={chipAction}>
                        <LucideHeart className="h-3.5 w-3.5" strokeWidth={2} />
                        Life event
                    </button>
                    <button type="button" onClick={() => addAboutTodayLocal()} className={chipAction}>
                        <LucideCalendar className="h-3.5 w-3.5" strokeWidth={2} />
                        About today
                    </button>
                </div>
            )}
        </div>
    );
};

export default QuickActionsComponent;
