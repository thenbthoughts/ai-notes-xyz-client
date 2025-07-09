import { useEffect, useState } from "react";
import axios from "axios";
import axiosCustom from "../../../../../../config/axiosCustom";
import { AxiosRequestConfig, CancelTokenSource } from "axios";
import { Link } from "react-router-dom";
import { LucideExternalLink } from "lucide-react";
import toast from "react-hot-toast";

interface NoteItem {
    _id: string;
    title: string;
    createdAtUtc: string;
    notesWorkspaceId: string;

    selectedItems: SelectedItem[];
}

interface SelectedItem {
    _id: string;
    referenceId: string;
}

const ThreadSettingContextSelected = ({ threadId }: { threadId: string }) => {

    const [search, setSearch] = useState("");
    const [list, setList] = useState([] as NoteItem[]);

    const [page, setPage] = useState(1);
    const perPage = 20;
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
    }, [page]);

    useEffect(() => {
        setPage(1);
        setRefreshRandomNum(Math.random());
    }, [search]);

    const fetchList = async ({ axiosCancelTokenSource }: { axiosCancelTokenSource: CancelTokenSource }) => {
        try {
            const config = {
                method: 'post',
                url: `/api/notes/crud/notesGet`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    page: page,
                    perPage: perPage,
                    search: search,
                },
                cancelToken: axiosCancelTokenSource.token,
            } as AxiosRequestConfig;

            const response = await axiosCustom.request(config);
            let resultNotes = [];
            if (Array.isArray(response.data.docs)) {
                resultNotes = response.data.docs;
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
                contextType: 'note',
            });
            let selectedArr = [] as {
                _id: string;
                referenceId: string;
            }[];
            if (Array.isArray(resultContext.data.docs)) {
                selectedArr = resultContext.data.docs;
            }

            // -----

            let newList = [] as NoteItem[];
            for (const item of resultNotes) {
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

    const handleAdd = async (noteId: string) => {
        const toastId = toast.loading('Loading...');
        try {
            const result = await axiosCustom.post('/api/chat-llm/threads-context-crud/contextUpsert', {
                threadId: threadId,
                referenceFrom: 'note',
                referenceId: noteId,
            });
            console.log(result);
            setRefreshRandomNum(Math.random());
        } catch (error) {
            console.error(error);
        } finally {
            toast.dismiss(toastId);
        }
    }

    const handleDelete = async (noteId: string) => {
        const toastId = toast.loading('Loading...');
        try {
            await axiosCustom.post('/api/chat-llm/threads-context-crud/contextDeleteById', {
                recordId: noteId,
            });
            setRefreshRandomNum(Math.random());

            toast.success('Note deleted successfully');
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
                                                        handleDelete(selectedItem._id);
                                                    }
                                                }
                                            } else {
                                                handleAdd(item._id);
                                            }
                                        }}
                                    />
                                    <Link
                                        to={`/user/notes?action=edit&id=${item._id}&workspace=${item.notesWorkspaceId}`}
                                        className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-full hover:bg-indigo-100 hover:text-indigo-700 hover:border-indigo-300 transition-all duration-200 group"
                                        target="_blank"
                                    >
                                        <LucideExternalLink className="w-3 h-3 mr-1 group-hover:scale-110 transition-transform duration-200" />
                                        View Note
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

    const renderPagination = () => {
        return (
            <div className="mt-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-600">
                            Page {page} of {Math.ceil(totalCount / perPage)}
                        </span>
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page >= Math.ceil(totalCount / perPage)}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="mb-4">

            <h3 className="text-lg font-bold mb-4">Notes: {totalCount > 0 ? `(${totalCount})` : ''}</h3>

            <div className="mb-4">
                <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search notes"
                />
            </div>

            {renderList()}

            {/* pagination */}
            {renderPagination()}


        </div>
    )
}

export default ThreadSettingContextSelected;