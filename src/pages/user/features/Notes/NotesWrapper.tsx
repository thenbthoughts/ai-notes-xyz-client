import { useEffect, useState } from 'react';
import {
    LucideList,
    LucideMoveDown,
    LucideMoveUp,
    LucidePlus,
    LucideRefreshCcw,
    LucideSettings
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAtom } from 'jotai';
import { Link, useNavigate } from 'react-router-dom';

import {
    ComponentNotesLeftModelRender,
    ComponentNotesLeftRender
} from './sectionLeft/ComponentNotesLeft.tsx';
import useResponsiveScreen, {
    screenList
} from '../../../../hooks/useResponsiveScreen.tsx';

import ComponentRightWrapper from './sectionRight/ComponentRightWrapper.tsx';

import { notesAddAxios } from './utils/notesListAxios.ts';

import axiosCustom from '../../../../config/axiosCustom.ts';

import {
    jotaiNotesModalOpenStatus,
    jotaiStateNotesWorkspaceId
} from './stateJotai/notesStateJotai.ts';

const railBtnClass =
    'flex items-center justify-center py-1.5 rounded-md bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white active:bg-zinc-600 transition-colors';

const NotesWrapper = () => {

    // useState
    const screenWidth = useResponsiveScreen();
    const navigate = useNavigate();

    const [workspaceId, setWorkspaceId] = useAtom(jotaiStateNotesWorkspaceId);

    const [
        stateDisplayChatHistory,
        setStateDisplayChatHistory,
    ] = useAtom(jotaiNotesModalOpenStatus);

    const [refreshRandomNum, setRefreshRandomNum] = useState(0);

    const notesAddAxiosLocal = async () => {
        try {
            console.log('workspaceId 1234', workspaceId);
            const result = await notesAddAxios({
                notesWorkspaceId: workspaceId,
            });
            if (result.success !== '') {
                navigate(`/user/notes?action=edit&id=${result.recordId}&workspace=${workspaceId}`)
            }
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        // from query
        const searchParams = new URLSearchParams(window.location.search);
        const workspace = searchParams.get('workspace');
        console.log('workspace', workspace);
        if (workspace) {
            setWorkspaceId(workspace);
        } else {
            redirectToDefaultWorkspace();
        }
    }, []);

    const redirectToDefaultWorkspace = async () => {
        try {
            const result = await axiosCustom.post('/api/notes-workspace/crud/notesWorkspaceGet');

            if (result.data.docs) {
                if (result.data.docs.length > 0) {
                    const firstWorkspace = result.data.docs[0];
                    setWorkspaceId(firstWorkspace._id);
                    navigate(`/user/notes?workspace=${firstWorkspace._id}`);
                } else {
                    toast.error('No workspace found, creating default workspace...');
                    try {
                        const createResult = await axiosCustom.post('/api/notes-workspace/crud/notesWorkspaceAddDefault');
                        if (createResult.data.doc) {
                            setWorkspaceId(createResult.data.doc._id);
                            navigate(`/user/notes?workspace=${createResult.data.doc._id}`);
                        }
                    } catch (createError) {
                        console.error('Failed to create default workspace:', createError);
                        toast.error('Failed to create default workspace');
                    }
                }
            }

        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="flex w-full">
            <div className="w-[calc(100vw-50px)] min-w-0">
                <div className="w-full max-w-none px-0">
                    <div className="flex flex-row">
                        {/* part 1 -> 25% */}
                        {screenWidth === screenList.lg && (
                            <div className="w-[25%] min-w-0 shrink-0">
                                <ComponentNotesLeftRender />
                            </div>
                        )}

                        {/* part 2 -> 75% */}
                        <div
                            className={
                                screenWidth === screenList.lg ? 'w-[75%] min-w-0' : 'w-full min-w-0'
                            }
                        >
                            <div className="w-full max-w-none mx-0">
                                <div className="h-[calc(100vh-60px)]">
                                    <ComponentRightWrapper
                                        refreshRandomNumParent={refreshRandomNum}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* part 3 -> 50px tool rail */}
            <div
                className="w-[50px] shrink-0 flex flex-col items-stretch bg-zinc-900 border-l border-zinc-800 py-0.5"
            >
                <div className="flex flex-col gap-0.5 px-0.5 w-full">
                    <div className="cursor-pointer">
                        <Link
                            to={'/user/setting'}
                            className={`block ${railBtnClass}`}
                            title="Settings"
                        >
                            <LucideSettings className="w-4 h-4" strokeWidth={1.75} />
                        </Link>
                    </div>

                    <button
                        type="button"
                        className={`w-full cursor-pointer border-0 ${railBtnClass}`}
                        onClick={() => {
                            notesAddAxiosLocal();
                        }}
                        title="New note"
                    >
                        <LucidePlus className="w-4 h-4" strokeWidth={1.75} />
                    </button>

                    <button
                        type="button"
                        className={`w-full cursor-pointer border-0 ${railBtnClass}`}
                        onClick={() => {
                            const messagesScrollUp = document.getElementById('messagesScrollUp');
                            if (messagesScrollUp) {
                                messagesScrollUp?.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                        title="Scroll to top"
                    >
                        <LucideMoveUp className="w-4 h-4" strokeWidth={1.75} />
                    </button>

                    <button
                        type="button"
                        className={`w-full cursor-pointer border-0 ${railBtnClass}`}
                        onClick={() => {
                            const messagesScrollDown = document.getElementById('messagesScrollDown');
                            if (messagesScrollDown) {
                                messagesScrollDown?.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                        title="Scroll to bottom"
                    >
                        <LucideMoveDown className="w-4 h-4" strokeWidth={1.75} />
                    </button>

                    <button
                        type="button"
                        className={`w-full cursor-pointer border-0 ${railBtnClass}`}
                        onClick={() => {
                            toast.success('Refreshing...');
                            setRefreshRandomNum(
                                Math.floor(
                                    Math.random() * 1_000_000
                                )
                            );
                        }}
                        title="Refresh"
                    >
                        <LucideRefreshCcw className="w-4 h-4" strokeWidth={1.75} />
                    </button>

                    {screenWidth === screenList.sm && (
                        <button
                            type="button"
                            className={`w-full cursor-pointer border-0 py-1.5 rounded-md transition-colors ${
                                stateDisplayChatHistory
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                                    : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                            }`}
                            onClick={() => {
                                setStateDisplayChatHistory(!stateDisplayChatHistory);
                            }}
                            title="Sidebar"
                        >
                            <LucideList className="w-4 h-4 mx-auto" strokeWidth={1.75} />
                        </button>
                    )}
                </div>
            </div>

            {screenWidth === screenList.sm && (
                <div>
                    {stateDisplayChatHistory && (
                        <ComponentNotesLeftModelRender />
                    )}
                </div>
            )}
        </div>
    );
};

export default NotesWrapper;
