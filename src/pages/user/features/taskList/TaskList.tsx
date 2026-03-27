import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { DebounceInput } from 'react-debounce-input';
import { ChevronDown, ChevronRight, LucideSearch, LucideX } from 'lucide-react';

import axiosCustom from '../../../../config/axiosCustom';
import TaskAiTools from './TaskAiTools';

import TaskItem from './TaskItem';
import { tsPageTask } from '../../../../types/pages/tsPageTaskList';
import ComponentTaskListFooter from './ComponentTaskListFooter';
import TaskAddOrEdit from './ComponentTaskEdit/TaskAddOrEdit';
import ComponentTaskStatusListNames from './componentTaskStatusListNames/componentTaskStatusListNames';
import ComponentTaskWorkspace from './componentTaskWorkspace/ComponentTaskWorkspace';
import { jotaiStateTaskWorkspaceId } from './stateJotai/taskStateJotai';
import ComponentTaskListLabels from './ComponentTaskListLabels';
import { atomWithStorage } from 'jotai/utils';

const expandedSectionsAtom = atomWithStorage(`taskList-expanded`, [] as string[]);

const selectClass =
    'w-full rounded-none border border-zinc-300 bg-white py-1.5 px-2 text-[11px] text-zinc-800 focus:border-emerald-600 focus:outline-none';

const TaskList: React.FC = () => {
    const [refreshRandomNum, setRefreshRandomNum] = useState(0);
    const [tasks, setTasks] = useState<tsPageTask[]>([]);
    const [searchInput, setSearchInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [priority, setPriority] = useState('');
    const [isArchived, setIsArchived] = useState('not-archived');
    const [isCompleted, setIsCompleted] = useState('not-completed');
    const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

    const [workspaceId, setWorkspaceId] = useAtom(jotaiStateTaskWorkspaceId);

    const [taskStatusList, setTaskStatusList] = useState<{
        _id: string;
        statusTitle: string;
        listPosition: number;
    }[]>([]);

    const [isTaskAddModalIsOpen, setIsTaskAddModalIsOpen] = useState({
        openStatus: false,
        modalType: 'add' as 'add' | 'edit',
        recordId: ''
    });

    const [expandedSections, setExpandedSections] = useAtom(expandedSectionsAtom);

    useEffect(() => {
        fetchTasks();
    }, [refreshRandomNum]);

    useEffect(() => {
        setRefreshRandomNum(Math.floor(Math.random() * 1_000_000));
    }, [
        isTaskAddModalIsOpen,
        priority,
        isArchived,
        isCompleted,
        workspaceId,
        searchInput,
        selectedLabels
    ]);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const addTaskDialog = searchParams.get('add-task-dialog');
        if (addTaskDialog === 'yes') {
            setIsTaskAddModalIsOpen({
                openStatus: true,
                modalType: 'add',
                recordId: '',
            });
            searchParams.delete('add-task-dialog');
            window.history.replaceState({}, '', window.location.pathname + '?' + searchParams.toString());
        }
    }, []);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const editTaskId = searchParams.get('edit-task-id');
        if (editTaskId) {
            setIsTaskAddModalIsOpen({
                openStatus: true,
                modalType: 'edit',
                recordId: editTaskId,
            });
            searchParams.delete('edit-task-id');
            window.history.replaceState({}, '', window.location.pathname + '?' + searchParams.toString());
        }
    }, []);

    const fetchTasks = async () => {
        setLoading(true);
        const config = {
            method: 'post',
            url: '/api/task/crud/taskGet',
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                searchInput: searchInput || '',
                priority: priority || '',
                isArchived: isArchived || '',
                isCompleted: isCompleted || '',
                taskWorkspaceId: workspaceId || '',
                labelArr: selectedLabels || []
            }
        };

        try {
            const response = await axiosCustom.request(config);
            const tempTaskArr = response.data.docs;
            setTasks(tempTaskArr);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const workspace = searchParams.get('workspace');
        if (workspace) {
            setWorkspaceId(workspace);
        }
    }, []);

    const renderLeft = () => {
        return (
            <div
                className="rounded-none border border-zinc-300 bg-white p-3 shadow-[3px_3px_0_0_rgb(228_228_231)]"
                id="task-filter"
            >
                <header className="mb-3 flex items-center gap-2 border-b border-zinc-200 pb-2">
                    <span className="h-6 w-1 shrink-0 bg-emerald-600" aria-hidden />
                    <div>
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                            Workspace & filters
                        </h2>
                    </div>
                </header>

                <ComponentTaskWorkspace />

                {workspaceId.length === 24 && (
                    <div className="mt-3 border-t border-zinc-200 pt-3">
                        <ComponentTaskStatusListNames
                            workspaceId={workspaceId}
                            setTaskStatusList={setTaskStatusList}
                        />
                    </div>
                )}

                <section className="mt-3 space-y-2 border-t border-zinc-200 pt-3" aria-label="Task filters">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                        List filters
                    </h3>

                    <div className="relative">
                        <LucideSearch className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" strokeWidth={2} />
                        <DebounceInput
                            debounceTimeout={500}
                            type="search"
                            placeholder="Search tasks…"
                            className="w-full rounded-none border border-zinc-300 bg-zinc-50 py-1.5 pl-8 pr-7 text-[11px] text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-600 focus:bg-white focus:outline-none"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            id="task-search"
                            autoComplete="off"
                        />
                        {searchInput.length > 0 && (
                            <button
                                type="button"
                                className="absolute right-1 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800"
                                onClick={() => setSearchInput('')}
                                aria-label="Clear search"
                            >
                                <LucideX className="h-3.5 w-3.5" strokeWidth={2} />
                            </button>
                        )}
                    </div>

                    <div>
                        <label className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                            Priority
                        </label>
                        <select value={priority} onChange={(e) => setPriority(e.target.value)} className={selectClass}>
                            <option value="">All</option>
                            <option value="very-high">Very high</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                            <option value="very-low">Very low</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                            Archive
                        </label>
                        <select value={isArchived} onChange={(e) => setIsArchived(e.target.value)} className={selectClass}>
                            <option value="">All</option>
                            <option value="archived">Archived</option>
                            <option value="not-archived">Not archived</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                            Completion
                        </label>
                        <select value={isCompleted} onChange={(e) => setIsCompleted(e.target.value)} className={selectClass}>
                            <option value="">All</option>
                            <option value="completed">Completed</option>
                            <option value="not-completed">Not completed</option>
                        </select>
                    </div>
                </section>

                {workspaceId.length === 24 && (
                    <div className="mt-3 border-t border-zinc-200 pt-3">
                        <ComponentTaskListLabels
                            workspaceId={workspaceId}
                            selectedLabels={selectedLabels}
                            setSelectedLabels={setSelectedLabels}
                        />
                    </div>
                )}
            </div>
        );
    };

    const renderRight = () => {
        return (
            <div id="task-list" className="min-h-[200px]">
                {loading && (
                    <div className="flex justify-center py-8">
                        <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">Loading tasks…</p>
                    </div>
                )}

                {!loading && workspaceId.length === 24 && (
                    <div className="space-y-3">
                        {taskStatusList.map((itemTaskStatus) => {
                            const tempTaskList = tasks.filter((filterTask) => itemTaskStatus._id === filterTask.taskStatusId);

                            const isExpanded = expandedSections.includes(itemTaskStatus._id);

                            const toggleExpanded = () => {
                                setExpandedSections((prev) => {
                                    let returnArr: string[];
                                    if (prev.includes(itemTaskStatus._id)) {
                                        returnArr = prev.filter((id) => id !== itemTaskStatus._id);
                                    } else {
                                        returnArr = [...prev, itemTaskStatus._id];
                                    }
                                    if (returnArr.length > 50) {
                                        returnArr = returnArr.slice(-50);
                                    }
                                    return returnArr;
                                });
                            };

                            return (
                                <section
                                    key={itemTaskStatus._id}
                                    className="rounded-none border border-zinc-300 bg-zinc-50/80 shadow-[2px_2px_0_0_rgb(212_212_216)]"
                                >
                                    <div className="flex items-center justify-between gap-2 border-b border-zinc-200 bg-white px-3 py-2">
                                        <h2 className="min-w-0 text-sm font-semibold text-zinc-900">
                                            <span className="truncate">{itemTaskStatus.statusTitle}</span>
                                            {tempTaskList.length > 0 && (
                                                <span className="ml-1.5 font-mono text-xs font-normal text-zinc-500">
                                                    {tempTaskList.length}
                                                </span>
                                            )}
                                        </h2>
                                        <button
                                            type="button"
                                            onClick={toggleExpanded}
                                            className="shrink-0 rounded-none border border-zinc-200 bg-zinc-50 p-1 text-zinc-600 hover:bg-zinc-100"
                                            aria-expanded={isExpanded}
                                            title={isExpanded ? 'Show tasks' : 'Hide tasks'}
                                        >
                                            {isExpanded === false ? (
                                                <ChevronDown className="h-4 w-4" strokeWidth={2} />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" strokeWidth={2} />
                                            )}
                                        </button>
                                    </div>
                                    {isExpanded === false && (
                                        <div className="p-3">
                                            {tempTaskList.length === 0 && (
                                                <p className="py-4 text-center text-[11px] text-zinc-500">No tasks in this list.</p>
                                            )}
                                            <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                                                {tempTaskList.map((task) => (
                                                    <li key={task._id}>
                                                        <TaskItem
                                                            task={task}
                                                            taskStatusList={taskStatusList}
                                                            setRefreshRandomNum={setRefreshRandomNum}
                                                            setIsTaskAddModalIsOpen={setIsTaskAddModalIsOpen}
                                                        />
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </section>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-[90vh] bg-[#f4f4f5] pb-24 pt-4">
            <div className="container m-auto max-w-[1600px] px-3">
                <header className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-zinc-200 pb-3">
                    <div className="flex items-center gap-2">
                        <span className="hidden h-8 w-1 bg-emerald-600 sm:block" aria-hidden />
                        <div>
                            <h1 className="text-lg font-bold tracking-tight text-zinc-900 sm:text-xl">
                                Tasks
                            </h1>
                            <p className="text-[11px] text-zinc-500">Workspace lists, filters, and board</p>
                        </div>
                    </div>
                </header>

                <TaskAiTools setRefreshParentRandomNum={setRefreshRandomNum} />

                <div className="flex flex-col gap-4 lg:flex-row">
                    <div className="w-full shrink-0 lg:w-[300px] xl:w-[320px]">
                        {renderLeft()}
                    </div>
                    <div className="min-w-0 flex-1">{renderRight()}</div>
                </div>
            </div>

            <ComponentTaskListFooter setIsTaskAddModalIsOpen={setIsTaskAddModalIsOpen} />

            {isTaskAddModalIsOpen.openStatus && (
                <TaskAddOrEdit
                    isTaskAddModalIsOpen={isTaskAddModalIsOpen}
                    setIsTaskAddModalIsOpen={setIsTaskAddModalIsOpen}
                />
            )}
        </div>
    );
};

export default TaskList;
