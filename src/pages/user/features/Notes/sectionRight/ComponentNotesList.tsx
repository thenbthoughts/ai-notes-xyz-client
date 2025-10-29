import { useState, useEffect } from 'react';
import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
import axiosCustom from '../../../../../config/axiosCustom.ts';
import { INotes } from '../../../../../types/pages/tsNotes.ts';
import ComponentNotesItem from './ComponentNotesItem.tsx';
import ReactPaginate from 'react-paginate';
import { MessageCircle, PlusCircle } from 'lucide-react';
import { notesAddAxios } from '../utils/notesListAxios.ts';
import { useNavigate } from 'react-router-dom';
import { jotaiStateNotesIsStar, jotaiStateNotesSearch, jotaiStateNotesWorkspaceId } from '../stateJotai/notesStateJotai.ts';
import { useAtomValue } from 'jotai';
import toast from 'react-hot-toast';
import { notesWorkspaceChatWithAi } from '../utils/notesListAxios.ts';
    
const perPage = 20;

const notesWorkspaceChatWithAiLocal = async ({
    notesWorkspaceId,
}: {
    notesWorkspaceId: string;
}) => {
    const toastLoadingId = toast.loading('Starting workspace chat with AI...');
    try {
        // call func
        const result = await notesWorkspaceChatWithAi({ notesWorkspaceId: notesWorkspaceId });
        toast.dismiss(toastLoadingId);
        if (result.error !== '') {
            toast.error(result.error || 'Error workspace chat with AI. Please try again.');
            return;
        }

        // success message
        toast.success(
            'Workspace chat with AI started successfully! Please send a message to start the conversation.',
            {
                duration: 3000,
            }
        );

        // redirect to chat page
        window.location.href = `/user/chat?id=${result.threadId}`;
    } catch (error) {
        console.error('Error workspace chat with AI:', error);
        toast.error('Error workspace chat with AI. Please try again.');
        toast.dismiss(toastLoadingId);
    }
};

const ComponentNotesList = () => {
    const navigate = useNavigate();
    const [totalCount, setTotalCount] = useState(0 as number);
    const [list, setList] = useState([] as INotes[]);
    const [page, setPage] = useState(1);
    const workspaceId = useAtomValue(jotaiStateNotesWorkspaceId);
    const [refreshRandomNum, setRefreshRandomNum] = useState(0);

    const searchTerm = useAtomValue(jotaiStateNotesSearch);
    const isStar = useAtomValue(jotaiStateNotesIsStar);

    useEffect(() => {
        const axiosCancelTokenSource: CancelTokenSource = axios.CancelToken.source();
        fetchList({ axiosCancelTokenSource });
        return () => {
            axiosCancelTokenSource.cancel('Operation canceled by the user.');
        };
    }, [refreshRandomNum]);

    useEffect(() => {
        setPage(1);
        setRefreshRandomNum(Math.random());
    }, [page, workspaceId, searchTerm, isStar]);

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
                    notesWorkspaceId: workspaceId,
                    search: searchTerm,
                    isStar: isStar,
                },
                cancelToken: axiosCancelTokenSource.token,
            } as AxiosRequestConfig;

            const response = await axiosCustom.request(config);
            let tempArr = [];
            if (Array.isArray(response.data.docs)) {
                tempArr = response.data.docs;
            }
            setList(tempArr);

            let tempTotalCount = 0;
            if (typeof response.data.count === 'number') {
                tempTotalCount = response.data.count;
            }
            setTotalCount(tempTotalCount);
        } catch (error) {
            console.error(error);
        }
    };

    const notesAddAxiosLocal = async () => {
        try {
            const result = await notesAddAxios({
                notesWorkspaceId: workspaceId,
            });
            if (result.success !== '') {
                navigate(`/user/notes?action=edit&id=${result.recordId}&workspace=${workspaceId}`);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const renderCount = () => {
        return (
            <div className="mb-4 flex items-center gap-3">
                <div className="flex items-center bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-lg px-4 py-2 shadow-sm border border-blue-200">
                    <button onClick={notesAddAxiosLocal}>
                        <PlusCircle className="w-6 h-6 text-blue-500 mr-2 animate-pulse" strokeWidth={2} fill="#e0e7ff" />
                    </button>
                    <span className="text-lg font-bold text-blue-700 tracking-wide">{totalCount}</span>
                    <span className="ml-2 text-gray-700 font-medium">Notes</span>
                    {totalCount === 0 && (
                        <span className="ml-4 text-red-500 font-semibold">No result</span>
                    )}
                </div>
                <div className="flex items-center bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-lg px-4 py-2 shadow-sm border border-blue-200">
                    <button onClick={() => notesWorkspaceChatWithAiLocal({ notesWorkspaceId: workspaceId })}>
                        <MessageCircle
                            size={20}
                            className="text-blue-500 mr-2 animate-pulse"
                            strokeWidth={2}
                            fill="#e0e7ff"
                            style={{
                                display: 'inline-block',
                                marginTop: '-3px',
                            }}
                        />
                        Workspace Chat with AI
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div>
            {/* div scroll up */}
            <div id='messagesScrollUp' />
            {renderCount()}
            {list.map((noteObj) => (
                <div key={noteObj._id}>
                    <ComponentNotesItem noteObj={noteObj} />
                </div>
            ))}
            {totalCount >= 1 && (
                <div className="w-full flex justify-center items-center">
                    <ReactPaginate
                        breakLabel="..."
                        nextLabel="next >"
                        onPageChange={(e) => {
                            setPage(e.selected);
                        }}
                        marginPagesDisplayed={1}
                        pageRangeDisplayed={3}
                        pageCount={Math.ceil(totalCount / perPage)}
                        previousLabel="< previous"
                        renderOnZeroPageCount={null}
                        forcePage={page}
                        containerClassName="flex flex-wrap justify-center items-center gap-1 sm:space-x-1"
                        pageClassName="border border-gray-300 rounded-md hover:bg-gray-200 text-base sm:text-lg m-0.5"
                        previousClassName="border border-gray-300 rounded-md hover:bg-gray-200 text-base sm:text-lg m-0.5"
                        previousLinkClassName="text-gray-700 px-2 sm:px-3"
                        nextClassName="border border-gray-300 rounded-md hover:bg-gray-200 text-base sm:text-lg m-0.5"
                        nextLinkClassName="text-gray-700 px-2 sm:px-3"
                        breakClassName="border border-gray-300 rounded-md text-base sm:text-lg m-0.5"
                        breakLinkClassName="text-gray-700 px-2 sm:px-3"
                        activeLinkClassName="bg-blue-500 text-white"
                        pageLinkClassName="text-gray-700 px-2 sm:px-3"
                    />
                </div>
            )}
            {/* div scroll down */}
            <div id='messagesScrollDown' />
        </div>
    );
};

export default ComponentNotesList;