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
    'group mx-auto flex w-[calc(100%-0.5rem)] max-w-[44px] items-center justify-center overflow-hidden rounded-2xl py-2.5 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.96]';

const iconClass =
    'h-[17px] w-[17px] transition-transform duration-300 ease-out group-hover:scale-110 group-active:scale-95';

/** Frosted capsule — depth without heaviness */
const railNeutral =
    'border border-white/80 bg-white/50 text-zinc-600 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.07),inset_0_1px_0_0_rgba(255,255,255,0.95)] ring-1 ring-zinc-950/[0.04] backdrop-blur-md hover:-translate-y-px hover:bg-white/85 hover:text-zinc-900 hover:shadow-[0_10px_24px_-8px_rgba(15,23,42,0.14)]';

/** Teal → cyan gradient + glow (distinct from flat fills) */
const railActive =
    'border border-teal-400/25 bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-600 text-white shadow-[0_6px_22px_-5px_rgba(13,148,136,0.42),inset_0_1px_0_0_rgba(255,255,255,0.22)] ring-1 ring-white/15 hover:-translate-y-px hover:from-teal-400 hover:via-teal-500 hover:to-cyan-500 hover:shadow-[0_10px_28px_-6px_rgba(13,148,136,0.5)]';

/** Primary action — brighter specular + motion */
const railCta =
    'border border-white/25 bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-500 text-white shadow-[0_8px_26px_-6px_rgba(5,150,105,0.48),inset_0_1px_0_0_rgba(255,255,255,0.35)] ring-1 ring-white/20 hover:-translate-y-0.5 hover:from-teal-400 hover:via-emerald-400 hover:to-cyan-400 hover:shadow-[0_14px_36px_-8px_rgba(5,150,105,0.55)]';

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
        <div className="flex w-full flex-col gap-1.5 px-1">
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
                    <LucideList className={iconClass} strokeWidth={1.75} />
                </button>
            )}

            <Link
                to="/user/setting"
                className={`${railLayout} ${railNeutral}`}
                title="Settings"
            >
                <LucideSettings className={iconClass} strokeWidth={1.75} />
            </Link>

            <Link
                to="/user/chat"
                className={`${railLayout} ${railCta}`}
                title="New chat"
            >
                <LucidePlus className={iconClass} strokeWidth={1.75} />
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
                <LucideMoveUp className={iconClass} strokeWidth={1.75} />
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
                <LucideMoveDown className={iconClass} strokeWidth={1.75} />
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
                    <LucideSidebar className={iconClass} strokeWidth={1.75} />
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
                    <LucideRefreshCcw className={iconClass} strokeWidth={1.75} />
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
                    <LucideSettings2 className={iconClass} strokeWidth={1.75} />
                </button>
            )}
        </div>
    );
};

export default ChatRightFilterWrapper;
