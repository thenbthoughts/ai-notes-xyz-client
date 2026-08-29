import {
    LucideZap,
    LucideChevronUp,
    LucideChevronDown,
    LucideFileText,
    LucideListTodo,
    LucideBookOpen,
    LucideHeart,
    LucideCalendar,
    LucideStar,
    LucideStickyNote,
    LucideRefreshCw,
    LucideAlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useEffect, useState } from 'react';
import { notesQuickDailyNotesAddAxios, notesQuickTaskAddAxios } from '../features/Notes/utils/notesListAxios';
import { infoVaultAddAxios } from '../features/InfoVault/utils/infoVaultListAxios';
import { lifeEventAddAxios } from '../features/LifeEventsList/utils/lifeEventsListAxios';
import toast from 'react-hot-toast';
import axiosCustom from '../../../config/axiosCustom';
import ComponentQuickActionAiChat from './ComponentQuickActionAiChat';
import { panel, panelHeader, panelTitle, panelIconBtn, chipAction } from './homepagePanelStyles';

const quickActionsStorageKey = 'home-quickactions-expanded';

const readQuickActionsExpanded = () => {
    try {
        const raw = localStorage.getItem(quickActionsStorageKey);
        if (raw === 'true') {
            return true;
        }
        if (raw === 'false') {
            return false;
        }
        return true;
    } catch {
        return true;
    }
};

const writeQuickActionsExpanded = (next: boolean) => {
    try {
        localStorage.setItem(quickActionsStorageKey, String(next));
    } catch {
        return;
    }
};

const QuickActionsComponent = () => {
    const [isActionsExpanded, setIsActionsExpanded] = useState(() => {
        return readQuickActionsExpanded();
    });
    const [pendingAction, setPendingAction] = useState<string | null>(null);
    const [lastFailed, setLastFailed] = useState<{ action: string; msg: string } | null>(null);
    const [lastClickAt, setLastClickAt] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        writeQuickActionsExpanded(isActionsExpanded);
    }, [isActionsExpanded]);

    const isBusy = pendingAction !== null;

    const debounceGuard = () => {
        const now = Date.now();
        if (now - lastClickAt < 400) {
            return true;
        }
        setLastClickAt(now);
        return false;
    };

    const retryLast = () => {
        if (!lastFailed) {
            return;
        }
        const act = lastFailed.action;
        if (act === 'dailyNotes') {
            void notesQuickDailyNotesAddAxiosLocal();
        } else if (act === 'dailyTask') {
            void notesQuickTaskAddAxiosLocal();
        } else if (act === 'task') {
            void addTaskLocal();
        } else if (act === 'notes') {
            void addNotesLocal();
        } else if (act === 'infoVault') {
            void addInfoVaultLocal();
        } else if (act === 'lifeEvent') {
            void addLifeEventLocal();
        } else if (act === 'aboutToday') {
            void addAboutTodayLocal();
        }
    };

    const notesQuickDailyNotesAddAxiosLocal = async () => {
        if (isBusy) {
            return;
        }
        if (debounceGuard()) {
            return;
        }
        setPendingAction('dailyNotes');
        try {
            const result = await notesQuickDailyNotesAddAxios();
            if (result.success.length > 0) {
                toast.success(`Quick Daily Notes added: ${result.recordId.slice(0, 6)}`);
                setLastFailed(null);
                navigate(`/user/notes?action=edit&id=${result.recordId}&workspace=${result.workspaceId}`);
            } else {
                toast.error(result.error);
                setLastFailed({ action: 'dailyNotes', msg: result.error });
            }
        } catch (error) {
            const msg = String(error);
            toast.error(msg);
            setLastFailed({ action: 'dailyNotes', msg });
        } finally {
            setPendingAction(null);
        }
    };

    const notesQuickTaskAddAxiosLocal = async () => {
        if (isBusy) {
            return;
        }
        if (debounceGuard()) {
            return;
        }
        setPendingAction('dailyTask');
        try {
            const result = await notesQuickTaskAddAxios();
            if (result.success.length > 0) {
                toast.success(`Quick Task added: ${result.recordId.slice(0, 6)}`);
                setLastFailed(null);
                navigate(`/user/task?workspace=${result.workspaceId}&edit-task-id=${result.recordId}`);
            } else {
                toast.error(result.error);
                setLastFailed({ action: 'dailyTask', msg: result.error });
            }
        } catch (error) {
            const msg = String(error);
            toast.error(msg);
            setLastFailed({ action: 'dailyTask', msg });
        } finally {
            setPendingAction(null);
        }
    };

    const addTaskLocal = async () => {
        if (isBusy) {
            return;
        }
        if (debounceGuard()) {
            return;
        }
        setPendingAction('task');
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
                setLastFailed({ action: 'task', msg: 'No workspace' });
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
                toast.success(`Task added: ${taskTitle}`);
                setLastFailed(null);
                navigate(`/user/task?workspace=${taskWorkspaceId}&edit-task-id=${doc._id}`);
            } else {
                toast.error('An error occurred while adding the task. Please try again.');
                setLastFailed({ action: 'task', msg: 'Failed to add task' });
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred while adding the task. Please try again.');
            setLastFailed({ action: 'task', msg: String(error) });
        } finally {
            setPendingAction(null);
        }
    };

    const addNotesLocal = async () => {
        if (isBusy) {
            return;
        }
        if (debounceGuard()) {
            return;
        }
        setPendingAction('notes');
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
                setLastFailed({ action: 'notes', msg: 'No workspace' });
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
                toast.success(`Notes added: ${notesTitle}`);
                setLastFailed(null);
                navigate(`/user/notes?action=edit&id=${doc._id}&workspace=${notesWorkspaceId}`);
            } else {
                toast.error('An error occurred while adding the notes. Please try again.');
                setLastFailed({ action: 'notes', msg: 'Failed to add notes' });
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred while adding the notes. Please try again.');
            setLastFailed({ action: 'notes', msg: String(error) });
        } finally {
            setPendingAction(null);
        }
    };

    const addInfoVaultLocal = async () => {
        if (isBusy) {
            return;
        }
        if (debounceGuard()) {
            return;
        }
        setPendingAction('infoVault');
        try {
            const result = await infoVaultAddAxios();
            if (result.success && typeof result.success === 'string' && result.success.length > 0) {
                toast.success(`Info Vault added: ${result.recordId.slice(0, 6)}`);
                setLastFailed(null);
                navigate(`/user/info-vault?action=edit&id=${result.recordId}`);
            } else {
                toast.error(result.error);
                setLastFailed({ action: 'infoVault', msg: result.error });
            }
        } catch (error) {
            toast.error(String(error));
            setLastFailed({ action: 'infoVault', msg: String(error) });
        } finally {
            setPendingAction(null);
        }
    };

    const addLifeEventLocal = async () => {
        if (isBusy) {
            return;
        }
        if (debounceGuard()) {
            return;
        }
        setPendingAction('lifeEvent');
        try {
            const result = await lifeEventAddAxios();
            if (result.success && typeof result.success === 'string' && result.success.length > 0) {
                toast.success(`Life Event added: ${result.recordId.slice(0, 6)}`);
                setLastFailed(null);
                navigate(`/user/life-events?action=edit&id=${result.recordId}`);
            } else {
                toast.error(result.error);
                setLastFailed({ action: 'lifeEvent', msg: result.error });
            }
        } catch (error) {
            toast.error(String(error));
            setLastFailed({ action: 'lifeEvent', msg: String(error) });
        } finally {
            setPendingAction(null);
        }
    };

    const addAboutTodayLocal = async () => {
        if (isBusy) {
            return;
        }
        if (debounceGuard()) {
            return;
        }
        setPendingAction('aboutToday');
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
                toast.success(`Found existing About Today: ${title}`);
                setLastFailed(null);
                navigate(`/user/life-events?action=edit&id=${existingEvent._id}`);
                return;
            }

            const result = await axiosCustom.post('/api/life-events/crud/lifeEventsAdd', {
                title: title,
                description: 'About Today',
            });

            const doc = result.data.doc;
            if (typeof doc._id === 'string' && doc._id.length === 24) {
                toast.success(`About Today added: ${title}`);
                setLastFailed(null);
                navigate(`/user/life-events?action=edit&id=${doc._id}`);
            } else {
                toast.error('An error occurred while adding About Today. Please try again.');
                setLastFailed({ action: 'aboutToday', msg: 'Failed to add' });
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred while adding About Today. Please try again.');
            setLastFailed({ action: 'aboutToday', msg: String(error) });
        } finally {
            setPendingAction(null);
        }
    };

    return (
        <div className={`${panel} border-l-4 border-l-cyan-400`}>
            <div className={panelHeader}>
                <h2 className={panelTitle}>
                    <LucideZap className="h-3.5 w-3.5 text-cyan-500" strokeWidth={2} />
                    Quick actions
                </h2>
                <button
                    type="button"
                    onClick={() => {
                        setIsActionsExpanded((prev) => {
                            return !prev;
                        });
                    }}
                    className={panelIconBtn}
                    aria-label={isActionsExpanded ? 'Collapse quick actions' : 'Expand quick actions'}
                    title="Toggle"
                >
                    {isActionsExpanded ? (
                        <LucideChevronUp className="h-3.5 w-3.5" strokeWidth={2} />
                    ) : (
                        <LucideChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
                    )}
                </button>
            </div>

            <div className={`flex flex-wrap gap-1.5 ${isActionsExpanded ? '' : 'hidden'}`}>
                <ComponentQuickActionAiChat />
                <button
                    type="button"
                    onClick={() => {
                        void notesQuickDailyNotesAddAxiosLocal();
                    }}
                    className={chipAction}
                    disabled={isBusy}
                    aria-label="Add quick daily notes"
                >
                    <LucideFileText className="h-3.5 w-3.5" strokeWidth={2} />
                    Quick daily notes
                </button>
                <button
                    type="button"
                    onClick={() => {
                        void notesQuickTaskAddAxiosLocal();
                    }}
                    className={chipAction}
                    disabled={isBusy}
                    aria-label="Add quick daily task"
                >
                    <LucideListTodo className="h-3.5 w-3.5" strokeWidth={2} />
                    Quick daily task
                </button>
                <button
                    type="button"
                    onClick={() => {
                        void addNotesLocal();
                    }}
                    className={chipAction}
                    disabled={isBusy}
                    aria-label="Add notes"
                >
                    <LucideFileText className="h-3.5 w-3.5" strokeWidth={2} />
                    Add notes
                </button>
                <button
                    type="button"
                    onClick={() => {
                        navigate('/user/memo');
                    }}
                    className={chipAction}
                    disabled={isBusy}
                    aria-label="Open memo"
                >
                    <LucideStickyNote className="h-3.5 w-3.5" strokeWidth={2} />
                    Memo
                </button>
                <button
                    type="button"
                    onClick={() => {
                        void addTaskLocal();
                    }}
                    className={chipAction}
                    disabled={isBusy}
                    aria-label="Add task"
                >
                    <LucideStar className="h-3.5 w-3.5" strokeWidth={2} />
                    Add task
                </button>
                <button
                    type="button"
                    onClick={() => {
                        void addInfoVaultLocal();
                    }}
                    className={chipAction}
                    disabled={isBusy}
                    aria-label="Add info vault entry"
                >
                    <LucideBookOpen className="h-3.5 w-3.5" strokeWidth={2} />
                    Info vault
                </button>
                <button
                    type="button"
                    onClick={() => {
                        void addLifeEventLocal();
                    }}
                    className={chipAction}
                    disabled={isBusy}
                    aria-label="Add life event"
                >
                    <LucideHeart className="h-3.5 w-3.5" strokeWidth={2} />
                    Life event
                </button>
                <button
                    type="button"
                    onClick={() => {
                        void addAboutTodayLocal();
                    }}
                    className={chipAction}
                    disabled={isBusy}
                    aria-label="Add about today life event"
                >
                    <LucideCalendar className="h-3.5 w-3.5" strokeWidth={2} />
                    About today
                </button>
            </div>
            {isBusy && (
                <p className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-cyan-300">
                    <LucideRefreshCw className="h-3 w-3 animate-spin" strokeWidth={2} />
                    Working: {pendingAction}…
                </p>
            )}
            {lastFailed && !isBusy && (
                <div className="mt-2 flex items-center gap-1 rounded-lg border border-amber-800 bg-amber-950/40 px-2 py-1">
                    <LucideAlertCircle className="h-3 w-3 shrink-0 text-amber-400" strokeWidth={2} />
                    <span className="flex-1 truncate text-[10px] font-medium text-amber-200">{lastFailed.msg || `Failed: ${lastFailed.action}`}</span>
                    <button
                        type="button"
                        onClick={retryLast}
                        className="rounded-md border border-amber-700 bg-zinc-900 px-1.5 py-0.5 text-[10px] font-bold text-amber-100 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                        aria-label="Retry last quick action"
                    >
                        Retry
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setLastFailed(null);
                        }}
                        className="rounded-md border border-zinc-700 bg-zinc-800 px-1 py-0.5 text-[10px] font-semibold text-zinc-300 hover:bg-zinc-700"
                        aria-label="Dismiss quick action error"
                    >
                        Dismiss
                    </button>
                </div>
            )}
        </div>
    );
};

export default QuickActionsComponent;
