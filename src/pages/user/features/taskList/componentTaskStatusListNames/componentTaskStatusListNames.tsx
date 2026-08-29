import { Fragment, useEffect, useState } from 'react';
import axiosCustom from '../../../../../config/axiosCustom';
import { Kanban, LucideMoveDown, LucideMoveUp, LucidePlus, LucideRefreshCcw, LucideTrash2 } from 'lucide-react';
import TaskConfirmModal from '../TaskConfirmModal';

const componentTaskStatusListNames = ({
    workspaceId,
    setTaskStatusList,
    openActiveTaskCountByStatusId,
}: {
    workspaceId: string;
    setTaskStatusList: React.Dispatch<React.SetStateAction<{
        _id: string;
        statusTitle: string;
        listPosition: number;
    }[]>>;
    /** Count of tasks that are not completed and not archived, keyed by task status list id */
    openActiveTaskCountByStatusId: Record<string, number>;
}) => {
    const [listArr, setListArr] = useState<{
        _id: string;
        statusTitle: string;
        listPosition: number;
    }[]>([]);
    const [newListName, setNewListName] = useState('');
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState("");

    useEffect(() => {
        fetchGroupList();
    }, [workspaceId]);

    const addGroup = async () => {
        if (!newListName.trim()) return;

        const newGroup = {
            taskWorkspaceId: workspaceId,
            statusTitle: newListName,
            listPosition: 100,
        };

        const config = {
            method: 'post',
            url: '/api/task-status-list/crud/taskStatusListAdd',
            headers: {
                'Content-Type': 'application/json',
            },
            data: newGroup,
        };

        try {
            await axiosCustom.request(config);
            setNewListName('');
            await fetchGroupList();
        } catch (error) {
            console.error('Error adding task board:', error);
        }
    };

    const deleteGroup = async (id: string) => {
        const config = {
            method: 'post',
            url: '/api/task-status-list/crud/taskStatusListDelete',
            headers: {
                'Content-Type': 'application/json',
            },
            data: { id },
        };

        try {
            await axiosCustom.request(config);
            await fetchGroupList();
        } catch (error) {
            console.error('Error deleting task board:', error);
        }
    };

    const requestDeleteGroup = (id: string) => {
        setPendingDeleteId(id);
        setConfirmOpen(true);
    };

    const confirmDeleteGroup = () => {
        const id = pendingDeleteId;
        setConfirmOpen(false);
        setPendingDeleteId("");
        if (id) {
            void deleteGroup(id);
        }
    };

    const cancelDeleteGroup = () => {
        setConfirmOpen(false);
        setPendingDeleteId("");
    };

    const fetchGroupList = async () => {
        try {
            const response = await axiosCustom.post('/api/task-status-list/crud/taskStatusListGet', {
                taskWorkspaceId: workspaceId,
            });
            if (Array.isArray(response.data?.docs)) {
                const docs = response.data.docs as {
                    _id: string;
                    statusTitle: string;
                    listPosition: number;
                }[];

                setListArr(docs);
                setTaskStatusList(docs);
            } else {
                console.error('Invalid response format: Expected an array');
            }
        } catch (error) {
            console.error('Error fetching task boards:', error);
        }
    };

    const revalidatePositionById = async ({
        id,
        upOrDown,
        taskWorkspaceId,
    }: {
        id: string;
        upOrDown: 'up' | 'down';
        taskWorkspaceId: string;
    }) => {
        const config = {
            method: 'post',
            url: '/api/task-status-list/crud/taskStatusListRevalidatePositionById',
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                _id: id,
                upOrDown,
                taskWorkspaceId,
            },
        };

        try {
            await axiosCustom.request(config);
            await fetchGroupList();
        } catch (error) {
            console.error('Error revalidating position:', error);
        }
    };

    return (
        <div>
            <div className="mb-1 flex items-center justify-between gap-1.5">
                <h2 className="flex items-center gap-1 text-xs font-medium text-zinc-700">
                    <span className="rounded-md bg-zinc-800 p-0.5">
                        <Kanban className="h-3 w-3 text-zinc-400" strokeWidth={2} aria-hidden />
                    </span>
                    Status lists
                </h2>
                <button
                    type="button"
                    onClick={() => fetchGroupList()}
                    className="rounded-lg border border-zinc-700/80 bg-zinc-900 p-1 text-zinc-400 shadow-sm transition-colors hover:bg-zinc-800"
                    title="Refresh lists"
                    aria-label="Refresh status lists"
                >
                    <LucideRefreshCcw className="h-3 w-3" strokeWidth={2} />
                </button>
            </div>
            <div className="mb-1.5 flex max-h-36 flex-col gap-px overflow-y-auto">
                {listArr.map((list) => {
                    const openCount = openActiveTaskCountByStatusId[list._id] ?? 0;
                    return (
                        <div
                            key={list._id}
                            className="flex items-start justify-between gap-1 rounded-lg border border-zinc-700/70 bg-zinc-900 px-1.5 py-1 text-xs leading-tight text-zinc-200 shadow-sm transition-colors hover:border-zinc-500 hover:bg-zinc-800/80"
                        >
                            <div className="flex min-w-0 flex-1 items-start gap-1.5">
                                <span className="min-w-0 flex-1 break-words font-medium text-zinc-200">
                                    {list.statusTitle}
                                </span>
                                <span
                                    className="shrink-0 rounded-md border border-zinc-700/70 bg-zinc-800 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums leading-none text-zinc-200"
                                    title="Open tasks (not completed, not archived)"
                                >
                                    {openCount}
                                </span>
                            </div>
                            <div className="flex shrink-0 items-start">
                            {list.statusTitle !== 'Uncategorized' && (
                                <Fragment>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            revalidatePositionById({ id: list._id, upOrDown: 'up', taskWorkspaceId: workspaceId })
                                        }
                                        className="rounded-md p-0.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                                        aria-label="Move up"
                                    >
                                        <LucideMoveUp className="h-3 w-3" strokeWidth={2} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            revalidatePositionById({ id: list._id, upOrDown: 'down', taskWorkspaceId: workspaceId })
                                        }
                                        className="rounded-md p-0.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                                        aria-label="Move down"
                                    >
                                        <LucideMoveDown className="h-3 w-3" strokeWidth={2} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => requestDeleteGroup(list._id)}
                                        className="rounded-md p-0.5 text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600"
                                        aria-label={`Delete list ${list.statusTitle}`}
                                    >
                                        <LucideTrash2 className="h-3 w-3" strokeWidth={2} />
                                    </button>
                                </Fragment>
                            )}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="flex gap-1">
                <input
                    type="text"
                    placeholder="New list…"
                    className="min-w-0 flex-1 rounded-lg border border-zinc-700/90 bg-zinc-950/80 py-1.5 px-2 text-xs text-zinc-100 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            void addGroup();
                        }
                    }}
                    aria-label="New status list name"
                />
                <button
                    type="button"
                    onClick={addGroup}
                    className="shrink-0 rounded-lg bg-zinc-900 px-2 py-1 font-medium text-white shadow-sm transition-colors hover:bg-zinc-800"
                    aria-label="Add status list"
                >
                    <LucidePlus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                </button>
            </div>
            <TaskConfirmModal
                isOpen={confirmOpen}
                title="Delete status list?"
                body="This will delete the list. Tasks in it will remain but may need reassigning."
                confirmLabel="Delete"
                onConfirm={confirmDeleteGroup}
                onCancel={cancelDeleteGroup}
            />
        </div>
    );
};

export default componentTaskStatusListNames;
