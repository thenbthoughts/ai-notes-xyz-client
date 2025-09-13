import { useEffect, useState } from "react";
import axios from "axios";
import axiosCustom from "../../../../../../config/axiosCustom";
import { AxiosRequestConfig, CancelTokenSource } from "axios";
import { Link } from "react-router-dom";
import { LucideCheck, LucideExternalLink, LucideX } from "lucide-react";
import toast from "react-hot-toast";

interface TaskItem {
    _id: string;
    title: string;
    createdAtUtc: string;
    taskWorkspaceId: string;
    isCompleted: boolean;
    isArchived: boolean;
    priority: string;
    selectedItems: SelectedItem[];
}

interface SelectedItem {
    _id: string;
    referenceId: string;
}

const ThreadSettingContextSelectTask = ({ threadId }: { threadId: string }) => {

    const [search, setSearch] = useState("");
    const [list, setList] = useState([] as TaskItem[]);

    const [totalCount, setTotalCount] = useState(0);
    const [refreshRandomNum, setRefreshRandomNum] = useState(0);

    useEffect(() => {
        const axiosCancelTokenSource: CancelTokenSource = axios.CancelToken.source();
        fetchList({ axiosCancelTokenSource });
        return () => {
            axiosCancelTokenSource.cancel('Operation canceled by the user.');
        };
    }, [refreshRandomNum]);

    useEffect(() => {
        setRefreshRandomNum(Math.random());
    }, [search]);

    const fetchList = async ({ axiosCancelTokenSource }: { axiosCancelTokenSource: CancelTokenSource }) => {
        try {
            const config = {
                method: 'post',
                url: `/api/task/crud/taskGet`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    searchInput: search || '',
                    priority: '',
                    isArchived: '',
                    isCompleted: '',
                    taskWorkspaceId: ''
                },
                cancelToken: axiosCancelTokenSource.token,
            } as AxiosRequestConfig;

            const response = await axiosCustom.request(config);
            let resultTasks = [];
            if (Array.isArray(response.data.docs)) {
                resultTasks = response.data.docs;
            }

            let tempTotalCount = 0;
            if (typeof response.data.count === 'number') {
                tempTotalCount = response.data.count;
            }
            setTotalCount(tempTotalCount);

            // if (filterSelected === "selected") {
            //     setList(list.filter((item: any) => selectedList.find((selectedItem: any) => selectedItem.referenceId === item._id)));
            // } else if (filterSelected === "unselected") {
            //     setList(list.filter((item: any) => !selectedList.find((selectedItem: any) => selectedItem.referenceId === item._id)));
            // }

            const resultContext = await axiosCustom.post('/api/chat-llm/threads-context-crud/contextGet', {
                threadId: threadId,
                contextType: 'task',
            });
            let selectedArr = [] as {
                _id: string;
                referenceId: string;
            }[];
            if (Array.isArray(resultContext.data.docs)) {
                selectedArr = resultContext.data.docs;
            }

            // -----

            let newList = [] as TaskItem[];
            for (const item of resultTasks) {
                let selectedItemArr = [] as SelectedItem[];

                for (let index = 0; index < selectedArr.length; index++) {
                    const selectedItem = selectedArr[index];
                    if (selectedItem.referenceId === item._id) {
                        selectedItemArr.push(selectedItem as SelectedItem);
                        break;
                    }
                }

                newList.push({
                    ...item,
                    selectedItems: selectedItemArr,
                });
            }

            console.log(newList);

            setList(newList);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAdd = async ({
        taskId,
        shouldLoad,
    }: {
        taskId: string;
        shouldLoad: boolean;
    }) => {
        const toastId = toast.loading('Loading...');
        try {
            const result = await axiosCustom.post('/api/chat-llm/threads-context-crud/contextUpsert', {
                threadId: threadId,
                referenceFrom: 'task',
                referenceId: taskId,
            });
            console.log(result);
            if (shouldLoad) {
                setRefreshRandomNum(Math.random());
            }
        } catch (error) {
            console.error(error);
        } finally {
            toast.dismiss(toastId);
        }
    }

    const handleDelete = async ({
        taskId,
        shouldLoad,
    }: {
        taskId: string;
        shouldLoad: boolean;
    }) => {
        const toastId = toast.loading('Loading...');
        try {
            await axiosCustom.post('/api/chat-llm/threads-context-crud/contextDeleteById', {
                recordId: taskId,
            });

            if (shouldLoad) {
                setRefreshRandomNum(Math.random());
            }

            toast.success('Task deleted successfully');
        } catch (error) {
            console.error(error);
        } finally {
            toast.dismiss(toastId);
        }
    }

    const handleSelectAll = async () => {
        const toastId = toast.loading('Selecting all tasks...');
        try {
            // select all unselected items
            for (const item of list) {
                const isSelected = item.selectedItems && item.selectedItems.length > 0;
                if (!isSelected) {
                    await handleAdd({
                        taskId: item._id,
                        shouldLoad: false,
                    });
                }
            }

            setRefreshRandomNum(Math.random());

            toast.success('All tasks selected successfully');
        } catch (error) {
            console.error(error);
        } finally {
            toast.dismiss(toastId);
        }

    }

    const handleUnselectAll = async () => {
        const toastId = toast.loading('Unselecting all tasks...');
        try {
            // select all unselected items
            for (const item of list) {
                const isSelected = item.selectedItems && item.selectedItems.length > 0;
                if (isSelected) {
                    await handleDelete({
                        taskId: item.selectedItems[0]._id,
                        shouldLoad: false,
                    });
                }
            }

            setRefreshRandomNum(Math.random());

            toast.success('All tasks unselected successfully');
        } catch (error) {
            console.error(error);
        } finally {
            toast.dismiss(toastId);
        }
    }



    const renderList = () => {
        return (
            <div
                className="grid lg:grid-cols-2 gap-1 overflow-y-auto border rounded-md"
                style={{
                    maxHeight: '300px',
                }}
            >
                {list.map((item) => {
                    
                    let isSelected = false;
                    let selectedItem = null;
                    if (item.selectedItems.length > 0) {
                        isSelected = true;
                        selectedItem = item.selectedItems[0];
                    }

                    return (
                        <div
                            key={item._id}
                            className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer bg-white"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-medium text-gray-900 text-sm truncate">
                                    {item.title}
                                    {item.isCompleted && (
                                        <span className="text-green-500 mx-1">(Completed)</span>
                                    )}
                                    {item.isArchived && (
                                        <span className="text-red-500 mx-1">(Archived)</span>
                                    )}
                                    {item.priority && (
                                        <span className={`text-blue-500 mx-1`}>
                                            ({item.priority.replace('-', ' ')})
                                        </span>
                                    )}
                                </h3>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center space-x-1">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                                        checked={isSelected}
                                        onChange={() => {
                                            if (isSelected) {
                                                if(selectedItem) {
                                                    if (selectedItem?._id) {
                                                        handleDelete({
                                                            taskId: selectedItem._id,
                                                            shouldLoad: true,
                                                        });
                                                    }
                                                }
                                            } else {
                                                handleAdd({
                                                    taskId: item._id,
                                                    shouldLoad: true,
                                                });
                                            }
                                        }}
                                    />
                                    <Link
                                        to={`/user/task?workspace=${item.taskWorkspaceId}`}
                                        className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-full hover:bg-indigo-100 hover:text-indigo-700 hover:border-indigo-300 transition-all duration-200 group"
                                        target="_blank"
                                    >
                                        <LucideExternalLink className="w-3 h-3 mr-1 group-hover:scale-110 transition-transform duration-200" />
                                        View Task
                                    </Link>
                                </div>
                                <span>
                                    {new Date(item.createdAtUtc).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>
        );
    };

    return (
        <div className="mb-4">

            <h3 className="text-lg font-bold mb-4">Tasks: {totalCount > 0 ? `(${totalCount})` : ''}</h3>

            <div>
                <button
                    className="mb-4 mr-3 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                    onClick={() => {
                        // Select all unselected items
                        handleSelectAll();
                    }}
                >
                    <span className="flex items-center">
                        <LucideCheck className="w-4 h-4 mr-2" />
                        Select All
                    </span>
                </button>

                <button
                    className="mb-4 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                    onClick={() => {
                        // Select all unselected items
                        handleUnselectAll();
                    }}
                >
                    <span className="flex items-center">
                        <LucideX className="w-4 h-4 mr-2" />
                        Unselect All
                    </span>
                </button>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search tasks"
                />
            </div>

            {renderList()}


        </div>
    )
}

export default ThreadSettingContextSelectTask;