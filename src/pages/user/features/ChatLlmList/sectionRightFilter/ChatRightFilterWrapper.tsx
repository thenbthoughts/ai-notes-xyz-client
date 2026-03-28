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

const railLayout =
    'mx-1 flex w-[calc(100%-0.5rem)] items-center justify-center rounded-xl py-2 transition-all duration-200 active:scale-95';

/** Matches thread list surfaces: white glass, zinc border */
const railNeutral =
    'border border-zinc-200/80 bg-white/70 text-zinc-600 shadow-sm backdrop-blur-sm hover:bg-zinc-50 hover:text-zinc-900';

/** Matches active thread / teal accents in `ComponentChatHistory` */
const railActive =
    'border border-teal-500/35 bg-teal-600 text-white shadow-md shadow-teal-900/10 hover:border-teal-400/50 hover:bg-teal-500 hover:text-white';

/** Same gradient as “New chat” in the thread sidebar */
const railCta =
    'border border-teal-600/25 bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-900/10 hover:from-teal-500 hover:to-emerald-500';

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
                    className={`${railLayout} ${
                        chatHistoryModalOpen.isOpen ? railActive : railNeutral
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
                className={`${railLayout} ${railNeutral}`}
                title="Settings"
            >
                <LucideSettings className="h-4 w-4" strokeWidth={1.75} />
            </Link>

            <Link
                to="/user/chat"
                className={`${railLayout} ${railCta}`}
                title="New chat"
            >
                <LucidePlus className="h-4 w-4" strokeWidth={1.75} />
            </Link>

            <button
                type="button"
                className={`${railLayout} ${railNeutral}`}
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
                className={`${railLayout} ${railNeutral}`}
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
                    className={`${railLayout} ${
                        hideSidebar.isOpen ? railActive : railNeutral
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
                    className={`${railLayout} ${railNeutral}`}
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
                    className={`${railLayout} ${railNeutral}`}
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
