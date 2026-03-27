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
                <h2 className="flex items-center gap-1 text-[11px] font-semibold text-zinc-800">
                    <Kanban className="h-3 w-3 text-zinc-400" strokeWidth={2} aria-hidden />
                    Status lists
                </h2>
                <button
                    type="button"
                    onClick={() => fetchGroupList()}
                    className="rounded-md border border-zinc-200/80 bg-white/80 p-1 text-zinc-600 shadow-sm transition-colors hover:border-zinc-300 hover:bg-white"
                    title="Refresh lists"
                >
                    <LucideRefreshCcw className="h-3 w-3" strokeWidth={2} />
                </button>
            </div>
            <div className="mb-1.5 flex max-h-36 flex-col gap-px overflow-y-auto">
                {listArr.map((list) => (
                    <div
                        key={list._id}
                        className="flex items-center justify-between gap-1 rounded-md border border-zinc-200/80 bg-white/70 px-1.5 py-1 text-[11px] leading-tight text-zinc-800 shadow-sm backdrop-blur-sm transition-colors hover:border-zinc-300 hover:bg-white/90"
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
                    className="min-w-0 flex-1 rounded-lg border border-zinc-200/80 bg-white/80 py-1 px-2 text-[11px] text-zinc-900 shadow-sm backdrop-blur-sm focus:border-teal-500/40 focus:outline-none focus:ring-1 focus:ring-teal-500/20"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addGroup()}
                />
                <button
                    type="button"
                    onClick={addGroup}
                    className="shrink-0 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 px-2 py-1 text-white shadow-sm shadow-teal-900/10 transition hover:from-teal-500 hover:to-emerald-500"
                    aria-label="Add list"
                >
                    <LucidePlus className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
            </div>
        </div>
    );
};

export default componentTaskStatusListNames;
