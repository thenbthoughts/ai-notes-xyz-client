import { Fragment, useEffect, useState } from 'react';
import axiosCustom from '../../../../../config/axiosCustom';
import { LucideMoveDown, LucideMoveUp, LucidePlus, LucideRefreshCcw, LucideTrash2 } from 'lucide-react'; // Importing the delete icon

const componentTaskBoardListNames = ({
    boardName,
    setTaskStatusArr,
}: {
    boardName: string;
    setTaskStatusArr: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
    const [listArr, setListArr] = useState<{
        _id: string;
        boardName: string;
        boardListName: string;
        listPosition: number;
    }[]>([]); // State to hold the task boards
    const [newListName, setNewListName] = useState(''); // State to hold the new board name

    useEffect(() => {
        fetchGroupList();
    }, []);

    const addGroup = async () => {
        if (!newListName.trim()) return; // Prevent adding empty board names

        const newGroup = {
            // boardName: newListName,
            boardName: boardName,
            boardListName: newListName,
            listPosition: 100,
        };

        const config = {
            method: 'post',
            url: '/api/task-board-list/crud/taskBoardListAdd',
            headers: {
                'Content-Type': 'application/json',
            },
            data: newGroup,
        };

        try {
            await axiosCustom.request(config);
            setNewListName(''); // Clear the input field
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
            url: '/api/task-board-list/crud/taskBoardListDelete',
            headers: {
                'Content-Type': 'application/json',
            },
            data: { id },
        };

        try {
            await axiosCustom.request(config);
            await fetchGroupList(); // Refresh the list after deletion
        } catch (error) {
            console.error('Error deleting task board:', error);
        }
    };

    const fetchGroupList = async () => {
        const config = {
            method: 'post',
            url: '/api/task-board-list/crud/taskBoardListGet',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        try {
            const response = await axiosCustom.request(config);
            if (Array.isArray(response.data?.docs)) {
                const docs = response.data.docs as {
                    _id: string;
                    boardName: string;
                    boardListName: string;
                    listPosition: number;
                }[];

                // does unclassified
                let doesUncategorizedExist = false;
                for (let index = 0; index < docs.length; index++) {
                    const element = docs[index];
                    if (element.boardListName === 'Uncategorized') {
                        doesUncategorizedExist = true;
                    }
                }
                if (doesUncategorizedExist === false) {
                    const newGroup = {
                        _id: '000000000000000000000000',
                        boardName: 'Default',
                        boardListName: 'Uncategorized',
                        listPosition: docs.length + 100, // Position it at the end
                    };
                    docs.push(newGroup);
                }

                setListArr(docs); // Assuming the response data is an array of group names
                const tempArr = docs.map((item) => item.boardListName);
                setTaskStatusArr(tempArr);
            } else {
                console.error('Invalid response format: Expected an array');
            }
        } catch (error) {
            console.error('Error fetching task boards:', error);
        }
    };

    const revalidatePositionById = async ({ id, upOrDown }: { id: string; upOrDown: 'up' | 'down' }) => {
        const config = {
            method: 'post',
            url: '/api/task-board-list/crud/taskBoardListRevalidatePositionById',
            headers: {
                'Content-Type': 'application/json',
            },
            data: { _id: id, upOrDown },
        };

        try {
            const response = await axiosCustom.request(config);
            console.log(response.data.message); // Log success message
            await fetchGroupList(); // Refresh the list after revalidation
        } catch (error) {
            console.error('Error revalidating position:', error);
        }
    };

    return (
        <div>
            {/* Section 1: Display Task Boards */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2 text-blue-600 flex justify-between items-center">
                    List
                    <button
                        onClick={fetchGroupList}
                        className="ml-4 bg-blue-500 text-white p-1 rounded hover:bg-blue-600 transition flex items-center"
                    >
                        <LucideRefreshCcw size={16} className="" />
                    </button>
                </h2>
                <div className="flex flex-col mb-4">
                    {listArr.map((list) => (
                        <div key={list._id} className="border border-gray-300 p-2 rounded-lg mb-2 bg-gray-50 hover:bg-gray-100 transition flex justify-between items-center">
                            <span>{list.boardListName}</span>
                            <div>
                                <div>
                                    {list.boardListName !== 'Uncategorized' && (
                                        <Fragment>
                                            <button onClick={() => revalidatePositionById({ id: list._id, upOrDown: 'up' })} className="text-red-600 hover:text-red-700 ml-2 mr-2">
                                                <LucideMoveUp size={16} />
                                            </button>
                                            <button onClick={() => revalidatePositionById({ id: list._id, upOrDown: 'down' })} className="text-red-600 hover:text-red-700 ml-2 mr-2">
                                                <LucideMoveDown size={16} />
                                            </button>
                                            <button onClick={() => deleteGroup(list._id)} className="text-red-600 hover:text-red-700 ml-2">
                                                <LucideTrash2 size={16} />
                                            </button>
                                        </Fragment>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        placeholder="Enter list name"
                        className="border border-gray-300 p-2 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)} // Update state on input change
                    />
                    <button
                        onClick={addGroup}
                        className="bg-blue-500 text-white h-10 px-3 rounded-sm hover:bg-blue-600 transition"
                    >
                        <LucidePlus size={16} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default componentTaskBoardListNames;