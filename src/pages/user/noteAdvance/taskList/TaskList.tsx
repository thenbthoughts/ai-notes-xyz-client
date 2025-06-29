import React, { useState, useEffect } from 'react';

import axiosCustom from '../../../../config/axiosCustom';
import TaskListComponentSuggestAiGeneratedTask from './TaskListComponentSuggestAiGeneratedTask';

import TaskItem from './TaskItem';
import { tsPageTask } from '../../../../types/pages/tsPageTaskList';
import ComponentTaskListFooter from './ComponentTaskListFooter';
import TaskAddOrEdit from './TaskAddOrEdit';
// import TasksBoardNamesList from './componentTaskBoardNames/TaskBoardNamesList';
import ComponentTasksBoardListNames from './componentTaskBoardListNames/componentTaskBoardListNames';

const TaskList: React.FC = () => {
    const [refreshRandomNum, setRefreshRandomNum] = useState(0);
    const [tasks, setTasks] = useState<tsPageTask[]>([]);
    const [searchInput, setSearchInput] = useState('');
    const [loading, setLoading] = useState(false); // State to manage loading
    const [priority, setPriority] = useState('');
    const [isArchived, setIsArchived] = useState('not-archived');
    const [isCompleted, setIsCompleted] = useState('not-completed');

    const [isTaskAddModalIsOpen, setIsTaskAddModalIsOpen] = useState({
        openStatus: false,
        modalType: 'add' as 'add' | 'edit',
        recordId: ''
    });

    const [
        taskStatusArr,
        setTaskStatusArr,
    ] = useState<string[]>([
        'Task',
        'Doing',
        'Done',
    ]);

    useEffect(() => {
        fetchTasks();
    }, [refreshRandomNum]);

    useEffect(() => {
        setRefreshRandomNum(
            Math.floor(
                Math.random() * 1_000_000
            )
        )
    }, [
        isTaskAddModalIsOpen, taskStatusArr,
        priority, isArchived, isCompleted
    ])

    const fetchTasks = async () => {
        setLoading(true); // Set loading to true when fetching starts
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
                isCompleted: isCompleted || ''
            }
        };

        try {
            const response = await axiosCustom.request(config);
            const tempTaskArr = response.data.docs;
            const fetchedTasks = tempTaskArr.map((task: tsPageTask) => {

                let taskStatus = task.taskStatus;

                let doesExist = false;
                for (let index = 0; index < taskStatusArr.length; index++) {
                    const tempTaskName = taskStatusArr[index];
                    if (tempTaskName === taskStatus) {
                        doesExist = true;
                    }
                }
                if (doesExist === false) {
                    taskStatus = 'Uncategorized';
                }

                return {
                    ...task,
                    dueDate: task.dueDate ? new Date(task.dueDate) : null,
                    taskStatus: taskStatus,
                }
            });
            console.log(fetchedTasks);
            setTasks(fetchedTasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false); // Set loading to false when fetching ends
        }
    };

    const renderHeading = () => {
        return (
            <div className='px-2'>
                <h1 className="text-3xl font-bold text-center text-white mb-4">
                    Smart AI Task Manager
                </h1>
            </div>
        )
    }

    const renderLeft = () => {
        return (
            <div className="bg-white shadow-md rounded-lg p-4">
                {/* Tasks Board Names List */}
                {/* <TasksBoardNamesList /> */}

                {/* Tasks Board List Names */}
                <ComponentTasksBoardListNames
                    boardName={'Task'}
                    setTaskStatusArr={setTaskStatusArr}
                />

                {/* Filter */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2 text-blue-600">Filter</h2>

                    {/* Search */}
                    <div className="mb-2">
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            className="border border-gray-300 p-1 rounded w-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                    </div>

                    {/* Priority Filter */}
                    <div className="mb-2">
                        {priority === '' && <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>}
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="border border-gray-300 p-1 rounded w-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        >
                            <option value="">All Priorities</option>
                            <option value="very-high">Very High</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                            <option value="very-low">Very Low</option>
                        </select>
                    </div>

                    {/* Archive Status Filter */}
                    <div className="mb-2">
                        {isArchived === 'not-archived' && <label className="block text-xs font-medium text-gray-700 mb-1">Archive Status</label>}
                        <select
                            value={isArchived}
                            onChange={(e) => setIsArchived(e.target.value)}
                            className="border border-gray-300 p-1 rounded w-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        >
                            <option value="">All Tasks</option>
                            <option value="archived">Archived</option>
                            <option value="not-archived">Not Archived</option>
                        </select>
                    </div>

                    {/* Completion Status Filter */}
                    <div className="mb-2">
                        {isCompleted === '' && <label className="block text-xs font-medium text-gray-700 mb-1">Completion Status</label>}
                        <select
                            value={isCompleted}
                            onChange={(e) => setIsCompleted(e.target.value)}
                            className="border border-gray-300 p-1 rounded w-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        >
                            <option value="">All Tasks</option>
                            <option value="completed">Completed</option>
                            <option value="not-completed">Not Completed</option>
                        </select>
                    </div>

                </div>

                {/* Section 3: Labels with Search Functionality */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2 text-blue-600">Labels</h2>
                    <input
                        type="text"
                        placeholder="Search labels..."
                        className="border border-gray-300 p-3 rounded-lg mb-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex flex-wrap gap-2">
                        {/* Example labels, replace with dynamic labels as needed */}
                        {['Urgent', 'Important', 'Work', 'Personal'].map((label) => (
                            <span key={label} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                                {label}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    const renderRight = () => {
        return (
            <div>
                {loading && (
                    <div className="text-center mt-4">
                        <button className="bg-blue-500 text-white p-2 rounded-lg" disabled>
                            Loading...
                        </button>
                    </div>
                )}

                {taskStatusArr.map((itemTaskStatus) => {
                    let tempTaskList = tasks.filter(filterTask => itemTaskStatus === filterTask.taskStatus);

                    return (
                        <div key={itemTaskStatus} className="mb-4 p-4 rounded-lg shadow-md bg-gray-100">
                            <h2 className="text-xl font-semibold mb-2 text-blue-600">{itemTaskStatus}</h2>
                            {tempTaskList.length === 0 && (
                                <div className="text-center">
                                    <p>No tasks available in this group.</p>
                                </div>
                            )}
                            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {
                                    tempTaskList.map(task => {
                                        return (
                                            <TaskItem
                                                task={task}
                                                taskStatusArr={taskStatusArr}
                                                setRefreshRandomNum={setRefreshRandomNum}
                                                setIsTaskAddModalIsOpen={setIsTaskAddModalIsOpen}
                                            />
                                        )
                                    })
                                }
                            </ul>
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <div
            className="min-h-[90vh] pt-5"
            style={{
                paddingBottom: "100px"
            }}
        >
            <div
                className='container m-auto'
            >
                <div className="h-full">
                    {renderHeading()}

                    <div className='px-2'>
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="border border-gray-300 p-3 rounded-lg mb-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className='px-2'>
                        <TaskListComponentSuggestAiGeneratedTask
                            setRefreshParentRandomNum={setRefreshRandomNum}
                        />
                    </div>

                    <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-1/4 p-2">
                            <div>
                                {renderLeft()}
                            </div>
                        </div>
                        <div className="w-full md:w-3/4 p-2">
                            {/* Content for the two-thirds */}
                            {renderRight()}
                        </div>
                    </div>
                </div>
                <ComponentTaskListFooter
                    setIsTaskAddModalIsOpen={setIsTaskAddModalIsOpen}
                />
                {
                    isTaskAddModalIsOpen.openStatus && (
                        <TaskAddOrEdit
                            isTaskAddModalIsOpen={isTaskAddModalIsOpen}
                            setIsTaskAddModalIsOpen={setIsTaskAddModalIsOpen}
                        />
                    )
                }
            </div>
        </div>
    );
};

export default TaskList;
