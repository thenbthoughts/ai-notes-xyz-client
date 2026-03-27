import { Fragment, useEffect, useState } from 'react';
import axiosCustom from '../../../../../config/axiosCustom';
import { Kanban, LucideMoveDown, LucideMoveUp, LucidePlus, LucideRefreshCcw, LucideTrash2 } from 'lucide-react';

const componentTaskStatusListNames = ({
    workspaceId,
    setTaskStatusList,
}: {
    workspaceId: string;
    setTaskStatusList: React.Dispatch<React.SetStateAction<{
        _id: string;
        statusTitle: string;
        listPosition: number;
    }[]>>;
}) => {
    const [listArr, setListArr] = useState<{
        _id: string;
        statusTitle: string;
        listPosition: number;
    }[]>([]);
    const [newListName, setNewListName] = useState('');

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
        const confirmDelete = window.confirm("Are you sure you want to delete this item?");
        if (!confirmDelete) return;

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
                <h2 className="flex items-center gap-1 text-xs font-semibold text-indigo-900">
                    <span className="rounded bg-indigo-100 p-0.5">
                        <Kanban className="h-3 w-3 text-indigo-600" strokeWidth={2} aria-hidden />
                    </span>
                    Status lists
                </h2>
                <button
                    type="button"
                    onClick={() => fetchGroupList()}
                    className="rounded-md border border-indigo-200/80 bg-indigo-50/80 p-1 text-indigo-600 shadow-sm transition-colors hover:border-indigo-300 hover:bg-indigo-100"
                    title="Refresh lists"
                >
                    <LucideRefreshCcw className="h-3 w-3" strokeWidth={2} />
                </button>
            </div>
            <div className="mb-1.5 flex max-h-36 flex-col gap-px overflow-y-auto">
                {listArr.map((list) => (
                    <div
                        key={list._id}
                        className="flex items-center justify-between gap-1 rounded-md border border-sky-200/70 bg-gradient-to-r from-sky-50/80 to-white px-1.5 py-1 text-xs leading-tight text-sky-950 shadow-sm backdrop-blur-sm transition-colors hover:border-fuchsia-300/60 hover:from-fuchsia-50/50 hover:to-white"
                    >
                        <span className="min-w-0 truncate font-medium text-zinc-800">{list.statusTitle}</span>
                        <div className="flex shrink-0 items-center">
                            {list.statusTitle !== 'Uncategorized' && (
                                <Fragment>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            revalidatePositionById({ id: list._id, upOrDown: 'up', taskWorkspaceId: workspaceId })
                                        }
                                        className="rounded-md p-0.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                                        aria-label="Move up"
                                    >
                                        <LucideMoveUp className="h-3 w-3" strokeWidth={2} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            revalidatePositionById({ id: list._id, upOrDown: 'down', taskWorkspaceId: workspaceId })
                                        }
                                        className="rounded-md p-0.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                                        aria-label="Move down"
                                    >
                                        <LucideMoveDown className="h-3 w-3" strokeWidth={2} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => deleteGroup(list._id)}
                                        className="rounded-md p-0.5 text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600"
                                        aria-label="Delete list"
                                    >
                                        <LucideTrash2 className="h-3 w-3" strokeWidth={2} />
                                    </button>
                                </Fragment>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex gap-1">
                <input
                    type="text"
                    placeholder="New list…"
                    className="min-w-0 flex-1 rounded-lg border border-amber-200/80 bg-amber-50/40 py-1.5 px-2 text-xs text-amber-950 shadow-sm backdrop-blur-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-200/50"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addGroup()}
                />
                <button
                    type="button"
                    onClick={addGroup}
                    className="shrink-0 rounded-lg bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 px-2 py-1 font-bold text-white shadow-md shadow-amber-500/25 transition hover:from-orange-400 hover:via-amber-400 hover:to-yellow-300"
                    aria-label="Add list"
                >
                    <LucidePlus className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
            </div>
        </div>
    );
};

export default componentTaskStatusListNames;
