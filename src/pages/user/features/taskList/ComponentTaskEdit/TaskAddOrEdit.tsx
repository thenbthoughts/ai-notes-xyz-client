import { Fragment, useEffect, useState } from 'react';
import { LucideDelete } from 'lucide-react';

import axiosCustom from '../../../../../config/axiosCustom';

import ComponentTaskSubList from './ComponentTaskSubList';
import ComponentSelectWorkspace from './ComponentSelectWorkspace';
import ComponentSelectTaskStatus from './ComponentSelectTaskStatus';

import getDateTimeForInputTypeDateTimeLocal from '../../../../../utils/getDateTimeForInputTypeDateTimeLocal';
import { reminderLabelToMsArr, taskEditInputClass, taskEditSelectInlineClass } from './taskEditCons';
import ComponentTaskRemindersPanel from './ComponentTaskRemindersPanel';
import CommentCommonComponent from '../../../../../components/commentCommonComponent/CommentCommonComponent';
import CommonComponentAiFaq from '../../../../../components/commonComponent/commonComponentAiFaq/CommonComponentAiFaq';
import CommonComponentAiKeywords from '../../../../../components/commonComponent/commonComponentAiKeywords/CommonComponentAiKeywords';
import SpeechToTextComponent from '../../../../../components/componentCommon/SpeechToTextComponent';

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

    // due-date presets + remainder (bundle sent on save in edit mode)
    const [dueDateReminderPresetLabels, setDueDateReminderPresetLabels] = useState<string[]>([]);
    const [dueDateReminderAbsoluteTimesIso, setDueDateReminderAbsoluteTimesIso] = useState<string[]>([]);
    const [dueDateReminderCronExpressions, setDueDateReminderCronExpressions] = useState<string[]>([]);
    const [remainderAbsoluteTimesIso, setRemainderAbsoluteTimesIso] = useState<string[]>([]);
    const [remainderCronExpressions, setRemainderCronExpressions] = useState<string[]>([]);
    const [dueDateReminderScheduledTimes, setDueDateReminderScheduledTimes] = useState<string[]>([]);
    const [dueDateReminderScheduledTimesCompleted, setDueDateReminderScheduledTimesCompleted] = useState<string[]>(
        []
    );
    const [remainderScheduledTimes, setRemainderScheduledTimes] = useState<string[]>([]);
    const [remainderScheduledTimesCompleted, setRemainderScheduledTimesCompleted] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        priority: '',
        isArchived: false,
        isCompleted: false,
    });

    const [workspaceId, setWorkspaceId] = useState('');
    const [taskStatusId, setTaskStatusId] = useState('');

    const [_, setTaskCommentsReloadRandomNum] = useState(Math.random());

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
                        setTaskStatusId(taskInfo.taskStatusId || '');

                        setFormData({
                            isArchived: taskInfo.isArchived || false,
                            isCompleted: taskInfo.isCompleted || false,
                            priority: taskInfo.priority || '',
                        });

                        const fromArr = Array.isArray(taskInfo.dueDateReminderPresetLabels)
                            ? taskInfo.dueDateReminderPresetLabels.filter(
                                  (x: unknown) => typeof x === 'string' && x.trim() !== ''
                              )
                            : [];
                        setDueDateReminderPresetLabels(fromArr);

                        const abs = Array.isArray(taskInfo.remainderAbsoluteTimesIso)
                            ? taskInfo.remainderAbsoluteTimesIso
                            : [];
                        setRemainderAbsoluteTimesIso(
                            abs.filter((x: unknown) => typeof x === 'string' && x.trim() !== '')
                        );
                        const crons = Array.isArray(taskInfo.remainderCronExpressions)
                            ? taskInfo.remainderCronExpressions
                            : [];
                        setRemainderCronExpressions(
                            crons.filter((x: unknown) => typeof x === 'string' && x.trim() !== '')
                        );
                        const dueAbs = Array.isArray(
                            (taskInfo as { dueDateReminderAbsoluteTimesIso?: string[] })
                                .dueDateReminderAbsoluteTimesIso
                        )
                            ? (taskInfo as { dueDateReminderAbsoluteTimesIso: string[] })
                                  .dueDateReminderAbsoluteTimesIso
                            : [];
                        setDueDateReminderAbsoluteTimesIso(
                            dueAbs.filter((x: unknown) => typeof x === 'string' && x.trim() !== '')
                        );
                        const dueCr = Array.isArray(
                            (taskInfo as { dueDateReminderCronExpressions?: string[] })
                                .dueDateReminderCronExpressions
                        )
                            ? (taskInfo as { dueDateReminderCronExpressions: string[] })
                                  .dueDateReminderCronExpressions
                            : [];
                        setDueDateReminderCronExpressions(
                            dueCr.filter((x: unknown) => typeof x === 'string' && x.trim() !== '')
                        );

                        const normDates = (v: unknown): string[] => {
                            if (!Array.isArray(v)) return [];
                            return v
                                .map((x: unknown) => {
                                    if (typeof x === 'string' && x.trim()) return x;
                                    return '';
                                })
                                .filter(Boolean)
                                .sort();
                        };
                        setDueDateReminderScheduledTimes(normDates(taskInfo.dueDateReminderScheduledTimes));
                        setDueDateReminderScheduledTimesCompleted(
                            normDates(taskInfo.dueDateReminderScheduledTimesCompleted)
                        );
                        setRemainderScheduledTimes(normDates(taskInfo.remainderScheduledTimes));
                        setRemainderScheduledTimesCompleted(normDates(taskInfo.remainderScheduledTimesCompleted));
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
                setDueDateReminderPresetLabels([]);
                setDueDateReminderAbsoluteTimesIso([]);
                setDueDateReminderCronExpressions([]);
                setRemainderAbsoluteTimesIso([]);
                setRemainderCronExpressions([]);
                setDueDateReminderScheduledTimes([]);
                setDueDateReminderScheduledTimesCompleted([]);
                setRemainderScheduledTimes([]);
                setRemainderScheduledTimesCompleted([]);
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
            taskStatusId: taskStatusId,

            // due date + remainder (edit applies; add flow ignores on server)
            dueDateReminderPresetLabels: dueDateReminderPresetLabels,
            dueDateReminderAbsoluteTimesIso: dueDateReminderAbsoluteTimesIso,
            dueDateReminderCronExpressions: dueDateReminderCronExpressions,
            remainderAbsoluteTimesIso: remainderAbsoluteTimesIso,
            remainderCronExpressions: remainderCronExpressions,
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

            dueDateReminderPresetLabels: string[];
            dueDateReminderAbsoluteTimesIso: string[];
            dueDateReminderCronExpressions: string[];
            remainderAbsoluteTimesIso: string[];
            remainderCronExpressions: string[];
        };

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
            const result = await axiosCustom.request(config);
            setTaskTitle('');
            setTaskDescription('');
            setComments([]);
            setStatus('todo'); // Reset status
            setDueDate(''); // Reset due date
            setLabels([]); // Reset labels
            setDueDateReminderPresetLabels([]);
            setDueDateReminderAbsoluteTimesIso([]);
            setDueDateReminderCronExpressions([]);
            setRemainderAbsoluteTimesIso([]);
            setRemainderCronExpressions([]);
            setDueDateReminderScheduledTimes([]);
            setDueDateReminderScheduledTimesCompleted([]);
            setRemainderScheduledTimes([]);
            setRemainderScheduledTimesCompleted([]);
            if (isTaskAddModalIsOpen.modalType === 'add') {
                let resRecordId = result.data._id;
                // Redirect to task list with workspace parameter
                window.location.href = `/user/task?workspace=${workspaceId}&edit-task-id=${resRecordId}`;
            } else {
                toggleModal();
            }
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
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-white/10 p-1 backdrop-blur-lg sm:p-2">
                    <div className="custom-scrollbar mx-auto w-full max-w-3xl">
                        <div className="relative w-full overflow-hidden rounded-xl border border-sky-100/90 bg-white">
                            <div className="custom-scrollbar max-h-[85vh] overflow-y-auto bg-gradient-to-b from-white/95 via-sky-50/35 to-blue-50/25 p-2 sm:p-3 [scrollbar-width:thin] [scrollbar-color:rgb(186_230_253)_rgb(248_250_252)]">
                                <h2 className="mb-2 bg-gradient-to-r from-slate-600 via-sky-600 to-blue-600 bg-clip-text text-center text-sm font-semibold tracking-tight text-transparent">
                                    {isTaskAddModalIsOpen.modalType === 'add' ? 'Add Task' : 'Edit Task'}
                                </h2>

                                {/* title */}
                                <div className="py-1">
                                    <input
                                        type="text"
                                        className={taskEditInputClass}
                                        placeholder="Enter task title"
                                        value={taskTitle}
                                        onChange={(e) => setTaskTitle(e.target.value)}
                                    />

                                    {/* set current date */}
                                    <div className='mt-0.5 flex flex-wrap items-center gap-1'>
                                        <button
                                            onClick={() => {
                                                setTaskTitle(new Date().toISOString().split('T')[0])
                                            }}
                                            className="rounded-md bg-gradient-to-r from-sky-600 to-blue-700 px-2 py-1 text-[11px] font-semibold text-white shadow-sm shadow-sky-500/15 transition hover:from-sky-500 hover:to-blue-600"
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
                                            className="rounded-md bg-gradient-to-r from-sky-600 to-blue-700 px-2 py-1 text-[11px] font-semibold text-white shadow-sm shadow-sky-500/15 transition hover:from-sky-500 hover:to-blue-600"
                                        >
                                            Tomorrow
                                        </button>

                                        {/* speech to text */}
                                        <span className='px-1 py-0.5'>
                                            <SpeechToTextComponent
                                                onTranscriptionComplete={(text: string) => {
                                                    setTaskTitle((prev: string) => prev.trim() + ' ' + text.trim());
                                                }}
                                                parentEntityId={isTaskAddModalIsOpen.recordId}
                                            />
                                        </span>
                                    </div>

                                    {taskAiSuggestion.display && (
                                        <div className='mt-1'>
                                            <div className="mt-1 rounded-lg border border-sky-200/70 bg-gradient-to-br from-sky-50/90 via-blue-50/50 to-slate-50/40 p-2 shadow-sm">
                                                <span className="text-[11px] font-bold text-sky-900">AI</span>
                                                <textarea
                                                    className={`mt-1 ${taskEditInputClass} min-h-[2.5rem]`}
                                                    value={taskAiSuggestion.newTaskTitle}
                                                    onChange={(e) => setTaskAiSuggestion(prev => ({ ...prev, newTaskTitle: e.target.value }))}
                                                />
                                                <button
                                                    type="button"
                                                    className="mt-1 rounded-md bg-gradient-to-r from-sky-600 to-blue-600 px-2 py-1 text-[11px] font-bold text-white shadow-sm shadow-sky-500/20 transition hover:from-sky-500 hover:to-blue-500"
                                                    onClick={() => {
                                                        setTaskTitle(taskAiSuggestion.newTaskTitle);
                                                    }}
                                                >
                                                    Replace
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {isTaskAddModalIsOpen.modalType === 'edit' && (
                                    <div className="mb-2 flex flex-wrap gap-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (taskAiSuggestionLoading === false) {
                                                    axiosGetTaskAiSuggestionById();
                                                }
                                            }}
                                            className="rounded-md bg-gradient-to-r from-sky-500 to-blue-600 px-2 py-1 text-[11px] font-bold text-white shadow-md shadow-sky-500/25 transition hover:from-sky-400 hover:to-blue-500 disabled:opacity-60"
                                            disabled={taskAiSuggestionLoading}
                                        >
                                            {taskAiSuggestionLoading ? 'Loading…' : 'AI suggest'}
                                        </button>
                                        <span className="rounded-md border border-sky-200/80 bg-sky-100/80 px-1.5 py-0.5 text-[11px] font-semibold text-slate-800">
                                            Status: {status}
                                        </span>
                                        {formData.isCompleted && (
                                            <span className="rounded-md border border-emerald-200/80 bg-emerald-100/90 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-900">
                                                Completed
                                            </span>
                                        )}
                                        {formData.isArchived && (
                                            <span className="rounded-md border border-slate-200/80 bg-slate-100/90 px-1.5 py-0.5 text-[11px] font-semibold text-slate-700">
                                                Archived
                                            </span>
                                        )}
                                        {formData.priority && (
                                            <span className="rounded-md border border-sky-200/75 bg-blue-50/90 px-1.5 py-0.5 text-[11px] font-semibold text-slate-800">
                                                Priority: {formData.priority.replace(' ', '-')}
                                            </span>
                                        )}
                                        {labels.map((label, index) => (
                                            <span
                                                key={index}
                                                className="mr-0.5 inline-flex items-center gap-0.5 rounded-md border border-sky-200/70 bg-sky-50/90 px-1.5 py-0.5 text-[11px] font-semibold text-slate-800"
                                            >
                                                <span>{label}</span>
                                                <button
                                                    type="button"
                                                    className="inline-flex rounded-md p-0.5 text-slate-500 transition hover:bg-sky-100 hover:text-slate-700"
                                                    onClick={() => {
                                                        setLabels(labels.filter((_, i) => i !== index));
                                                    }}
                                                    aria-label={`Remove label ${label}`}
                                                >
                                                    <LucideDelete className="h-3.5 w-3.5" strokeWidth={2} />
                                                </button>
                                            </span>
                                        ))}
                                        {taskAiSuggestion.newTaskTags.map((label, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                className="mr-0.5 rounded-md border border-sky-200/80 bg-gradient-to-r from-sky-50 to-blue-50/80 px-1.5 py-0.5 text-[11px] font-semibold text-slate-800 shadow-sm transition hover:border-sky-400/60"
                                                onClick={() => {
                                                    setLabels([...labels, label.trim()]);
                                                    setTaskAiSuggestion(prev => ({
                                                        ...prev,
                                                        newTaskTags: prev.newTaskTags.filter((_, i) => i !== index),
                                                    }));
                                                }}
                                            >
                                                AI: {label}
                                            </button>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingLabel(!isAddingLabel)}
                                            className="rounded-md bg-gradient-to-r from-sky-600 to-blue-600 px-2 py-1 text-[11px] font-bold text-white shadow-sm shadow-sky-500/20 transition hover:from-sky-500 hover:to-blue-500"
                                        >
                                            Add label
                                        </button>
                                    </div>
                                )}

                                {/* status */}
                                <div className="mt-1 flex flex-wrap gap-1">
                                    {isTaskAddModalIsOpen.modalType === 'edit' && (
                                        <Fragment>
                                            <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-200/60 bg-gradient-to-r from-emerald-50/70 to-sky-50/30 px-2 py-1 shadow-sm transition hover:border-emerald-300/80">
                                                <input
                                                    type="checkbox"
                                                    className="h-3.5 w-3.5 rounded border-sky-300 text-sky-600 focus:ring-sky-400/45"
                                                    checked={formData.isCompleted}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, isCompleted: e.target.checked })
                                                    }
                                                />
                                                <span className="text-xs font-medium text-emerald-900">Completed</span>
                                            </label>

                                            {/* archived */}
                                            <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200/80 bg-gradient-to-r from-slate-50/90 to-sky-50/35 px-2 py-1 shadow-sm transition hover:border-slate-300">
                                                <input
                                                    type="checkbox"
                                                    className="h-3.5 w-3.5 rounded border-sky-300 text-sky-600 focus:ring-sky-400/45"
                                                    checked={formData.isArchived}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, isArchived: e.target.checked })
                                                    }
                                                />
                                                <span className="text-xs font-medium text-slate-700">Archived</span>
                                            </label>

                                            {/* priority */}
                                            <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-sky-200/70 bg-gradient-to-r from-slate-50/90 to-sky-50/45 px-2 py-1 shadow-sm">
                                                <label className="text-xs font-medium text-slate-700">Priority</label>
                                                <select
                                                    className={taskEditSelectInlineClass}
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
                                    <div className="flex min-w-0 flex-[1_1_12rem] flex-wrap items-center gap-1.5 rounded-lg border border-sky-200/65 bg-gradient-to-r from-sky-50/55 to-blue-50/40 px-2 py-1 shadow-sm">
                                        <label className="shrink-0 text-xs font-medium text-slate-700">Workspace</label>
                                        <ComponentSelectWorkspace
                                            workspaceId={workspaceId}
                                            setWorkspaceIdFunc={(workspaceId: string) => {
                                                setWorkspaceId(workspaceId);
                                            }}
                                            modalType={isTaskAddModalIsOpen.modalType}
                                        />
                                    </div>

                                    {/* status */}
                                    <div className="flex min-w-0 flex-[1_1_12rem] flex-wrap items-center gap-1.5 rounded-lg border border-sky-200/65 bg-gradient-to-r from-slate-50/85 to-sky-50/45 px-2 py-1 shadow-sm">
                                        <label className="shrink-0 text-xs font-medium text-slate-700">List status</label>
                                        {workspaceId.length === 24 && (
                                            <ComponentSelectTaskStatus
                                                workspaceId={workspaceId}
                                                taskStatusId={taskStatusId}
                                                setTaskStatusId={(taskStatusId: string) => {
                                                    setTaskStatusId(taskStatusId);
                                                }}
                                                modalType={isTaskAddModalIsOpen.modalType}
                                            />
                                        )}
                                    </div>

                                    {/* due date — add flow only; edit uses Due & email reminders panel */}
                                    {isTaskAddModalIsOpen.modalType === 'add' && (
                                        <div className="flex min-w-0 flex-wrap items-center gap-1.5 rounded-lg border border-sky-200/70 bg-gradient-to-r from-slate-50/90 to-sky-50/45 px-2 py-1 shadow-sm">
                                            <label className="shrink-0 text-xs font-medium text-slate-700">Due date</label>
                                            <input
                                                type="datetime-local"
                                                className="min-w-0 flex-1 rounded-lg border border-slate-200/80 bg-white py-1 px-1.5 text-xs text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-300/40"
                                                value={getDateTimeForInputTypeDateTimeLocal(dueDate)}
                                                onChange={(e) => {
                                                    const newDueDate = new Date(`${e.target.value}`);
                                                    setDueDate(newDueDate.toISOString());
                                                }}
                                            />
                                            {dueDate && (
                                                <button
                                                    type="button"
                                                    onClick={() => setDueDate('')}
                                                    className="shrink-0 rounded-md border border-slate-200/90 bg-gradient-to-r from-slate-500 to-slate-600 px-2 py-1 text-[11px] font-semibold text-white shadow-sm transition hover:from-slate-400 hover:to-slate-500"
                                                >
                                                    Clear
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {isTaskAddModalIsOpen.modalType === 'edit' && (
                                    <ComponentTaskRemindersPanel
                                        dueDate={dueDate}
                                        onDueDateChange={(iso) => setDueDate(iso)}
                                        onDueDateClear={() => setDueDate('')}
                                        dueDateReminderPresetLabels={dueDateReminderPresetLabels}
                                        onDueDateReminderPresetLabelsChange={setDueDateReminderPresetLabels}
                                        dueDateReminderAbsoluteTimesIso={dueDateReminderAbsoluteTimesIso}
                                        onDueDateReminderAbsoluteTimesIsoChange={setDueDateReminderAbsoluteTimesIso}
                                        dueDateReminderCronExpressions={dueDateReminderCronExpressions}
                                        onDueDateReminderCronExpressionsChange={setDueDateReminderCronExpressions}
                                        dueDateReminderScheduledTimes={dueDateReminderScheduledTimes}
                                        dueDateReminderScheduledTimesCompleted={dueDateReminderScheduledTimesCompleted}
                                        remainderAbsoluteTimesIso={remainderAbsoluteTimesIso}
                                        onRemainderAbsoluteTimesIsoChange={setRemainderAbsoluteTimesIso}
                                        remainderCronExpressions={remainderCronExpressions}
                                        onRemainderCronExpressionsChange={setRemainderCronExpressions}
                                        remainderScheduledTimes={remainderScheduledTimes}
                                        remainderScheduledTimesCompleted={remainderScheduledTimesCompleted}
                                        reminderLabelOptions={reminderLabelToMsArr}
                                    />
                                )}

                                {isAddingLabel && (
                                    <div className="mt-1 rounded-lg border border-sky-200/65 bg-gradient-to-br from-sky-50/50 via-blue-50/35 to-slate-50/40 p-2">
                                        <input
                                            type="text"
                                            className={taskEditInputClass}
                                            placeholder="Enter label"
                                            value={newLabel}
                                            onChange={(e) => setNewLabel(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddLabel}
                                            className="mt-1 rounded-md bg-gradient-to-r from-sky-600 to-blue-600 px-2 py-1 text-[11px] font-bold text-white shadow-sm shadow-sky-500/20 transition hover:from-sky-500 hover:to-blue-500"
                                        >
                                            Add
                                        </button>
                                    </div>
                                )}

                                <div className="py-1">
                                    <label className="mb-1 block text-xs font-semibold text-slate-700">Description</label>
                                    <textarea
                                        className={`${taskEditInputClass} min-h-[5rem] p-2`}
                                        placeholder="Enter task description"
                                        value={taskDescription}
                                        onChange={(e) => setTaskDescription(e.target.value)}
                                        rows={4}
                                    ></textarea>

                                    <span className='px-1 py-0.5'>
                                        <SpeechToTextComponent
                                            onTranscriptionComplete={(text: string) => {
                                                setTaskDescription((prev: string) => prev.trim() + '\n' + text.trim());
                                            }}
                                            parentEntityId={isTaskAddModalIsOpen.recordId}
                                        />
                                    </span>

                                    {taskAiSuggestion.display && (
                                        <div className="mt-1.5">
                                            <div className="rounded-lg border border-sky-200/70 bg-gradient-to-br from-sky-50/90 via-blue-50/45 to-slate-50/40 p-2 shadow-sm">
                                                <span className="text-[11px] font-bold text-sky-900">AI suggestion</span>
                                                <textarea
                                                    className={`mt-1 ${taskEditInputClass} min-h-[5rem] p-2`}
                                                    value={taskAiSuggestion.newTaskDescription}
                                                    onChange={(e) =>
                                                        setTaskAiSuggestion((prev) => ({
                                                            ...prev,
                                                            newTaskDescription: e.target.value,
                                                        }))
                                                    }
                                                    rows={4}
                                                />
                                                <button
                                                    type="button"
                                                    className="mt-1 rounded-md bg-gradient-to-r from-sky-600 to-blue-600 px-2 py-1 text-[11px] font-bold text-white shadow-sm shadow-sky-500/20 transition hover:from-sky-500 hover:to-blue-500"
                                                    onClick={() => {
                                                        setTaskDescription(taskAiSuggestion.newTaskDescription);
                                                    }}
                                                >
                                                    Replace
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Subtasks */}
                                {isTaskAddModalIsOpen.modalType === 'edit' && (
                                    <ComponentTaskSubList
                                        parentWorkspaceId={workspaceId}
                                        parentTaskId={isTaskAddModalIsOpen.recordId}
                                        newTaskSubtasks={taskAiSuggestion.newTaskSubtasks}
                                    />
                                )}

                                {/* comment common component */}
                                {isTaskAddModalIsOpen.modalType === 'edit' && (
                                    <CommentCommonComponent
                                        commentType="task"
                                        recordId={isTaskAddModalIsOpen.recordId}
                                    />
                                )}

                                {/* ai faq */}
                                {isTaskAddModalIsOpen.modalType === 'edit' && (
                                    <CommonComponentAiFaq
                                        sourceId={isTaskAddModalIsOpen.recordId}
                                    />
                                )}

                                {/* ai keyword */}
                                {isTaskAddModalIsOpen.modalType === 'edit' && (
                                    <CommonComponentAiKeywords
                                        sourceId={isTaskAddModalIsOpen.recordId}
                                        metadataSourceType="tasks"
                                    />
                                )}
                            </div>

                            <div className="flex justify-end gap-1 border-t border-sky-100/90 bg-gradient-to-r from-sky-50/70 via-white/92 to-blue-50/50 px-2 py-2 backdrop-blur-[1px]">
                                <button
                                    type="button"
                                    onClick={toggleModal}
                                    className="rounded-md border border-sky-200/80 bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-sky-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="rounded-md bg-gradient-to-r from-sky-600 to-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-sky-500/25 transition hover:from-sky-500 hover:to-blue-500"
                                >
                                    {isTaskAddModalIsOpen.modalType === 'add' ? 'Add task' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
};

export default TaskAddOrEdit;