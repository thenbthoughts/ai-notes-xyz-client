import type { Dispatch, SetStateAction } from 'react';
import {
    LucideList,
    LucideMoveDown,
    LucideMoveUp,
    LucidePlus,
    LucideRefreshCcw,
    LucideSettings,
    LucideSettings2,
    LucideSidebar,
} from 'lucide-react';

import { Link } from 'react-router-dom';

import useResponsiveScreen, {
    screenList
} from '../../../../../hooks/useResponsiveScreen.tsx';
import { jotaiChatHistoryModalOpen, jotaiChatLlmThreadSetting, jotaiHideSidebar } from '../jotai/jotaiChatLlmThreadSetting.ts';
import { useAtom } from 'jotai';
import { toast } from 'react-hot-toast';

const railBtn =
    'mx-1 flex w-[calc(100%-0.5rem)] items-center justify-center rounded-xl border-0 py-2 text-zinc-300 transition-all duration-200 active:scale-95';

const ChatRightFilterWrapper = ({
    setRefreshRandomNumFetchChat,
}: {
    setRefreshRandomNumFetchChat: Dispatch<SetStateAction<number>>;
}) => {
    const screenWidth = useResponsiveScreen();

    const [chatHistoryModalOpen, setChatHistoryModalOpen] = useAtom(jotaiChatHistoryModalOpen);

    const [chatLlmThreadSetting, setChatLlmThreadSetting] = useAtom(jotaiChatLlmThreadSetting);

    const [hideSidebar, setHideSidebar] = useAtom(jotaiHideSidebar);

    return (
        <div className="flex w-full flex-col gap-1 px-0.5">
            {screenWidth === screenList.sm && (
                <button
                    type="button"
                    className={`${railBtn} ${
                        chatHistoryModalOpen.isOpen
                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-900/40 hover:bg-indigo-400'
                            : 'bg-zinc-800/80 hover:bg-zinc-700 hover:text-white'
                    }`}
                    onClick={() => {
                        setChatHistoryModalOpen({
                            isOpen: !chatHistoryModalOpen.isOpen,
                        });
                        setChatLlmThreadSetting((prevProps) => ({
                            ...prevProps,
                            isOpen: false,
                        }));
                    }}
                    title="Threads"
                >
                    <LucideList className="h-4 w-4" strokeWidth={1.75} />
                </button>
            )}

            <Link
                to="/user/setting"
                className={`${railBtn} bg-zinc-800/80 hover:bg-zinc-700 hover:text-white`}
                title="Settings"
            >
                <LucideSettings className="h-4 w-4" strokeWidth={1.75} />
            </Link>

            <Link
                to="/user/chat"
                className={`${railBtn} bg-emerald-600/90 text-white shadow-md shadow-emerald-950/30 hover:bg-emerald-500`}
                title="New chat"
            >
                <LucidePlus className="h-4 w-4" strokeWidth={1.75} />
            </Link>

            <button
                type="button"
                className={`${railBtn} bg-zinc-800/80 hover:bg-zinc-700 hover:text-white`}
                onClick={() => {
                    const el = document.getElementById('messagesScrollUp');
                    el?.scrollIntoView({ behavior: 'smooth' });
                }}
                title="Scroll up"
            >
                <LucideMoveUp className="h-4 w-4" strokeWidth={1.75} />
            </button>

            <button
                type="button"
                className={`${railBtn} bg-zinc-800/80 hover:bg-zinc-700 hover:text-white`}
                onClick={() => {
                    const el = document.getElementById('messagesScrollDown');
                    el?.scrollIntoView({ behavior: 'smooth' });
                }}
                title="Scroll down"
            >
                <LucideMoveDown className="h-4 w-4" strokeWidth={1.75} />
            </button>

            {screenWidth === screenList.lg && (
                <button
                    type="button"
                    className={`${railBtn} ${
                        hideSidebar.isOpen
                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-900/40 hover:bg-indigo-400'
                            : 'bg-zinc-800/80 hover:bg-zinc-700'
                    }`}
                    onClick={() => {
                        setHideSidebar((prev) => ({ isOpen: !prev.isOpen }));
                    }}
                    title="Toggle thread sidebar"
                >
                    <LucideSidebar className="h-4 w-4" strokeWidth={1.75} />
                </button>
            )}

            {chatLlmThreadSetting.threadId.length === 24 && (
                <button
                    type="button"
                    className={`${railBtn} bg-zinc-800/80 hover:bg-zinc-700 hover:text-white`}
                    onClick={() => {
                        toast.success('Refreshing…');
                        setRefreshRandomNumFetchChat(Math.floor(Math.random() * 1_000_000));
                    }}
                    title="Refresh messages"
                >
                    <LucideRefreshCcw className="h-4 w-4" strokeWidth={1.75} />
                </button>
            )}

            {chatLlmThreadSetting.threadId.length === 24 && (
                <button
                    type="button"
                    className={`${railBtn} bg-zinc-800/80 hover:bg-zinc-700 hover:text-white`}
                    onClick={() => {
                        setChatHistoryModalOpen({ isOpen: false });
                        setChatLlmThreadSetting((prev) => ({ ...prev, isOpen: true }));
                    }}
                    title="Thread settings"
                >
                    <LucideSettings2 className="h-4 w-4" strokeWidth={1.75} />
                </button>
            )}
        </div>
    );
};

export default ChatRightFilterWrapper;
