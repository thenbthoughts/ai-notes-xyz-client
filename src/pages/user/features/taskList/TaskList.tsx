import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { DebounceInput } from 'react-debounce-input';
import {
    Archive,
    ChevronDown,
    ChevronRight,
    Flag,
    LayoutList,
    ListFilter,
    LucideSearch,
    LucideX,
    ListTodo,
} from 'lucide-react';

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
    'w-full rounded-lg border border-zinc-200/80 bg-white/80 py-1 px-2 text-[11px] leading-tight text-zinc-900 shadow-sm backdrop-blur-sm focus:border-teal-500/40 focus:outline-none focus:ring-1 focus:ring-teal-500/20';

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
                className="border-r border-zinc-200/80 bg-gradient-to-b from-zinc-50/95 to-white lg:rounded-l-2xl lg:border lg:border-r-0 lg:border-zinc-200/60"
                id="task-filter"
            >
                <div className="h-full overflow-y-auto bg-white/40 px-2 py-2 backdrop-blur-[2px] lg:max-h-[calc(100vh-60px-4rem)]">
                <header className="mb-2 flex items-center gap-1.5">
                    <LayoutList className="h-3.5 w-3.5 shrink-0 text-zinc-400" strokeWidth={2} aria-hidden />
                    <div className="min-w-0">
                        <h2 className="text-xs font-semibold leading-tight text-zinc-900">Workspace & filters</h2>
                        <p className="text-[10px] leading-tight text-zinc-500">Lists · filters</p>
                    </div>
                </header>

                <ComponentTaskWorkspace />

                {workspaceId.length === 24 && (
                    <div className="mt-2 border-t border-zinc-100/80 pt-2">
                        <ComponentTaskStatusListNames
                            workspaceId={workspaceId}
                            setTaskStatusList={setTaskStatusList}
                        />
                    </div>
                )}

                <section className="mt-2 space-y-2 border-t border-zinc-100/80 pt-2" aria-label="Task filters">
                    <h3 className="flex items-center gap-1 text-[11px] font-semibold text-zinc-800">
                        <ListFilter className="h-3 w-3 text-zinc-400" strokeWidth={2} aria-hidden />
                        List filters
                    </h3>

                    <div className="relative">
                        <LucideSearch
                            className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400"
                            strokeWidth={2}
                        />
                        <DebounceInput
                            debounceTimeout={500}
                            type="search"
                            placeholder="Search tasks…"
                            className="w-full rounded-lg border border-zinc-200/80 bg-white/80 py-1 pl-7 pr-7 text-[11px] text-zinc-900 shadow-sm placeholder:text-zinc-400 backdrop-blur-sm focus:border-teal-500/40 focus:outline-none focus:ring-1 focus:ring-teal-500/20"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            id="task-search"
                            autoComplete="off"
                        />
                        {searchInput.length > 0 && (
                            <button
                                type="button"
                                className="absolute right-1 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800"
                                onClick={() => setSearchInput('')}
                                aria-label="Clear search"
                            >
                                <LucideX className="h-3 w-3" strokeWidth={2} />
                            </button>
                        )}
                    </div>

                    <div>
                        <label className="mb-0.5 flex items-center gap-1 text-[10px] font-medium text-zinc-600">
                            <Flag className="h-3 w-3 text-zinc-400" strokeWidth={2} aria-hidden />
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
                        <label className="mb-0.5 flex items-center gap-1 text-[10px] font-medium text-zinc-600">
                            <Archive className="h-3 w-3 text-zinc-400" strokeWidth={2} aria-hidden />
                            Archive
                        </label>
                        <select value={isArchived} onChange={(e) => setIsArchived(e.target.value)} className={selectClass}>
                            <option value="">All</option>
                            <option value="archived">Archived</option>
                            <option value="not-archived">Not archived</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-0.5 flex items-center gap-1 text-[10px] font-medium text-zinc-600">
                            <ListTodo className="h-3 w-3 text-zinc-400" strokeWidth={2} aria-hidden />
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
                    <div className="mt-2 border-t border-zinc-100/80 pt-2">
                        <ComponentTaskListLabels
                            workspaceId={workspaceId}
                            selectedLabels={selectedLabels}
                            setSelectedLabels={setSelectedLabels}
                        />
                    </div>
                )}
                </div>
            </div>
        );
    };

    const renderRight = () => {
        return (
            <div
                id="task-list"
                className="mt-3 min-h-[200px] overflow-hidden rounded-xl border border-zinc-200/60 bg-white/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)] backdrop-blur-[2px] lg:mt-0 lg:rounded-none lg:rounded-r-2xl lg:border-l-0 lg:border-t lg:border-b lg:border-r"
            >
                <div className="p-2">
                {loading && (
                    <div className="flex justify-center py-6">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-teal-600" />
                    </div>
                )}

                {!loading && workspaceId.length === 24 && (
                    <div className="space-y-2">
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
                                    className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white/90 shadow-sm transition-shadow hover:shadow-md"
                                >
                                    <div className="flex items-center justify-between gap-2 border-b border-zinc-100/80 bg-zinc-50/50 px-3 py-2.5">
                                        <h2 className="min-w-0 text-sm font-semibold tracking-tight text-zinc-900">
                                            <span className="truncate">{itemTaskStatus.statusTitle}</span>
                                            {tempTaskList.length > 0 && (
                                                <span className="ml-1.5 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
                                                    {tempTaskList.length}
                                                </span>
                                            )}
                                        </h2>
                                        <button
                                            type="button"
                                            onClick={toggleExpanded}
                                            className="shrink-0 rounded-lg border border-zinc-200/80 bg-white/80 p-1.5 text-zinc-600 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50"
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
                                        <div className="p-3 pt-2">
                                            {tempTaskList.length === 0 && (
                                                <p className="py-6 text-center text-[11px] text-zinc-500">No tasks in this list.</p>
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
            </div>
        );
    };

    return (
        <div className="min-h-0 w-full bg-gradient-to-br from-zinc-100 via-slate-50 to-zinc-100 pb-20 pt-2">
            <div className="container m-auto max-w-[1600px] px-2">
                <header className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                        <LayoutList className="h-4 w-4 text-teal-600/80" strokeWidth={2} aria-hidden />
                        <div>
                            <h1 className="text-base font-semibold leading-tight tracking-tight text-zinc-900 sm:text-[17px]">
                                Tasks
                            </h1>
                            <p className="text-[10px] leading-tight text-zinc-500">Workspace · board</p>
                        </div>
                    </div>
                </header>

                <TaskAiTools setRefreshParentRandomNum={setRefreshRandomNum} />

                <div className="flex flex-col gap-0 lg:flex-row lg:items-stretch">
                    <div className="w-full shrink-0 lg:w-[min(26%,320px)] lg:min-w-[240px]">
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
