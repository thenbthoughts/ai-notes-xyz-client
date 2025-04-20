import { useEffect, useState } from 'react';
import axiosCustom from '../../../../../config/axiosCustom';
import { LucideMoveDown, LucideMoveUp, LucideRefreshCcw, LucideTrash2 } from 'lucide-react'; // Importing the delete icon

const TaskBoardNamesList = () => {
    const [groupList, setGroupList] = useState<{
        _id: string; // Added id to the state
        boardName: string;
    }[]>([]); // State to hold the task boards
    const [newBoardName, setNewBoardName] = useState(''); // State to hold the new board name

    useEffect(() => {
        fetchGroupList();
    }, []);

    const addGroup = async () => {
        if (!newBoardName.trim()) return; // Prevent adding empty board names

        const newGroup = {
            boardName: newBoardName,
        };

        const config = {
            method: 'post',
            url: '/api/task-board-names/crud/taskBoardAdd',
            headers: {
                'Content-Type': 'application/json',
            },
            data: newGroup,
        };

        try {
            await axiosCustom.request(config);
            setNewBoardName(''); // Clear the input field
            await fetchGroupList();
        } catch (error) {
            console.error('Error adding task board:', error);
        }
    };

    const deleteGroup = async (id: string) => {
        const config = {
            method: 'post',
            url: '/api/task-board-names/crud/taskBoardDelete',
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
            url: '/api/task-board-names/crud/taskBoardGet',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        try {
            const response = await axiosCustom.request(config);
            if (Array.isArray(response.data?.docs)) {
                setGroupList(response.data?.docs); // Assuming the response data is an array of group names
            } else {
                console.error('Invalid response format: Expected an array');
            }
        } catch (error) {
            console.error('Error fetching task boards:', error);
        }
    };

    return (
        <div>
            {/* Section 1: Display Boards */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2 text-blue-600 flex justify-between items-center">
                    Boards
                    <button 
                        onClick={fetchGroupList} 
                        className="ml-4 bg-blue-500 text-white p-1 rounded hover:bg-blue-600 transition flex items-center"
                    >
                        <LucideRefreshCcw size={16} className="" />
                    </button>
                </h2>
                <div className="flex flex-col mb-4">
                    {groupList.map((group) => (
                        <div key={group._id} className="border border-gray-300 p-2 rounded-lg mb-2 bg-gray-50 hover:bg-gray-100 transition flex justify-between items-center">
                            <span>{group.boardName}</span>
                            <div>
                                <button onClick={() => deleteGroup(group._id)} className="text-red-600 hover:text-red-700">
                                    <LucideMoveUp size={16} />
                                </button>
                                <button onClick={() => deleteGroup(group._id)} className="text-red-600 hover:text-red-700">
                                    <LucideMoveDown size={16} />
                                </button>
                                <button onClick={() => deleteGroup(group._id)} className="text-red-600 hover:text-red-700">
                                    <LucideTrash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex flex-col sm:flex-row mb-4">
                    <input
                        type="text"
                        placeholder="Add new board"
                        className="border border-gray-300 p-2 rounded-lg w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newBoardName}
                        onChange={(e) => setNewBoardName(e.target.value)} // Update state on input change
                    />
                    <button
                        onClick={addGroup}
                        className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition sm:ml-2 mt-2 sm:mt-0"
                    >
                        Add Board
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TaskBoardNamesList;