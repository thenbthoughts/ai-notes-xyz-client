import { Fragment, useEffect, useState } from 'react';
import axiosCustom from '../../../../../config/axiosCustom';
import { LucideMoveDown, LucideMoveUp, LucidePlus, LucideRefreshCcw, LucideTrash2 } from 'lucide-react';

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
            <div className="mb-2 flex items-center justify-between gap-2">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                    Status lists
                </h2>
                <button
                    type="button"
                    onClick={() => fetchGroupList()}
                    className="rounded-none border border-zinc-300 bg-zinc-100 p-1 text-zinc-700 hover:bg-white"
                    title="Refresh lists"
                >
                    <LucideRefreshCcw size={14} strokeWidth={2} />
                </button>
            </div>
            <div className="mb-2 flex max-h-48 flex-col gap-0.5 overflow-y-auto">
                {listArr.map((list) => (
                    <div
                        key={list._id}
                        className="flex items-center justify-between gap-1 rounded-none border border-zinc-200 bg-zinc-50 px-1.5 py-1 text-[11px] hover:bg-white"
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
                                        className="p-0.5 text-zinc-500 hover:text-zinc-900"
                                        aria-label="Move up"
                                    >
                                        <LucideMoveUp size={14} strokeWidth={2} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            revalidatePositionById({ id: list._id, upOrDown: 'down', taskWorkspaceId: workspaceId })
                                        }
                                        className="p-0.5 text-zinc-500 hover:text-zinc-900"
                                        aria-label="Move down"
                                    >
                                        <LucideMoveDown size={14} strokeWidth={2} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => deleteGroup(list._id)}
                                        className="p-0.5 text-red-600 hover:bg-red-50"
                                        aria-label="Delete list"
                                    >
                                        <LucideTrash2 size={14} strokeWidth={2} />
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
                    className="min-w-0 flex-1 rounded-none border border-zinc-300 bg-white py-1.5 px-2 text-[11px] focus:border-emerald-600 focus:outline-none"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addGroup()}
                />
                <button
                    type="button"
                    onClick={addGroup}
                    className="shrink-0 rounded-none border border-emerald-700 bg-emerald-600 px-2 py-1.5 text-white hover:bg-emerald-500"
                    aria-label="Add list"
                >
                    <LucidePlus size={16} strokeWidth={2} />
                </button>
            </div>
        </div>
    );
};

export default componentTaskStatusListNames;
