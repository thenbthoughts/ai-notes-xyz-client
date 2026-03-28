import { useState, useEffect } from 'react';
import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
import axiosCustom from '../../../../../config/axiosCustom.ts';
import { INotes } from '../../../../../types/pages/tsNotes.ts';
import ComponentNotesItem from './ComponentNotesItem.tsx';
import ReactPaginate from 'react-paginate';
import { MessageCircle, Plus } from 'lucide-react';
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
    }, [refreshRandomNum, page, workspaceId, searchTerm, isStar]);

    useEffect(() => {
        setPage(1);
        setRefreshRandomNum(Math.random());
    }, [workspaceId, searchTerm, isStar]);

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
            <div className="mb-1.5 flex h-7 flex-wrap items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-1.5 text-xs text-zinc-700">
                <span className="font-semibold text-zinc-900 tabular-nums">{totalCount}</span>
                <span className="text-zinc-500">notes</span>
                {totalCount === 0 && (
                    <span className="text-amber-700">No results</span>
                )}
                <div className="ml-auto flex items-center gap-0.5">
                    <button
                        type="button"
                        title="New note"
                        className="inline-flex h-6 w-6 items-center justify-center rounded border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100"
                        onClick={notesAddAxiosLocal}
                    >
                        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                    <button
                        type="button"
                        title="Workspace chat with AI"
                        className="inline-flex h-6 items-center gap-0.5 rounded border border-zinc-200 bg-zinc-50 px-1.5 text-[11px] font-medium text-zinc-800 hover:bg-zinc-100"
                        onClick={() => notesWorkspaceChatWithAiLocal({ notesWorkspaceId: workspaceId })}
                    >
                        <MessageCircle className="h-3 w-3" strokeWidth={2} />
                        AI
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div>
            <div id='messagesScrollUp' />
            {renderCount()}
            {list.map((noteObj) => (
                <div key={noteObj._id}>
                    <ComponentNotesItem noteObj={noteObj} />
                </div>
            ))}
            {totalCount >= 1 && (
                <div className="mt-2 flex w-full justify-center">
                    <ReactPaginate
                        breakLabel="…"
                        nextLabel="›"
                        onPageChange={(e) => {
                            setPage(e.selected + 1);
                        }}
                        marginPagesDisplayed={1}
                        pageRangeDisplayed={2}
                        pageCount={Math.ceil(totalCount / perPage)}
                        previousLabel="‹"
                        renderOnZeroPageCount={null}
                        forcePage={page - 1}
                        containerClassName="flex flex-wrap items-center justify-center gap-0.5"
                        pageClassName="rounded border border-zinc-200 text-xs"
                        previousClassName="rounded border border-zinc-200 text-xs"
                        previousLinkClassName="text-zinc-700 px-1.5 py-0.5 block"
                        nextClassName="rounded border border-zinc-200 text-xs"
                        nextLinkClassName="text-zinc-700 px-1.5 py-0.5 block"
                        breakClassName="rounded border border-transparent text-xs px-1 text-zinc-400"
                        breakLinkClassName="px-1 py-0.5"
                        activeLinkClassName="!bg-indigo-600 !text-white border-indigo-600"
                        pageLinkClassName="text-zinc-700 px-1.5 py-0.5 block min-w-[1.5rem] text-center"
                    />
                </div>
            )}
            <div id='messagesScrollDown' />
        </div>
    );
};

export default ComponentNotesList;
