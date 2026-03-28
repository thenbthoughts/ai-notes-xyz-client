import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';

import {
    ComponentChatHistoryModelRender,
    ComponentChatHistoryRender
} from './sectionLeft/ComponentChatHistory.tsx';
import useResponsiveScreen, {
    screenList
} from '../../../../hooks/useResponsiveScreen.tsx';
import ComponentRightChatWrapper from './sectionRightChat/ComponentRightWrapper.tsx';

import ChatRightFilterWrapper from './sectionRightFilter/ChatRightFilterWrapper.tsx';
import { jotaiChatHistoryModalOpen, jotaiChatLlmThreadSetting, jotaiHideRightSidebar, jotaiHideSidebar } from './jotai/jotaiChatLlmThreadSetting.ts';
import { useAtom, useAtomValue } from 'jotai';
import { useLocation } from 'react-router-dom';
import siteInfo from '../../../../config/siteInfo.ts';

const ChatLlmListWrapper = () => {
    const location = useLocation();
    const screenWidth = useResponsiveScreen();

    const chatHistoryModalOpen = useAtomValue(jotaiChatHistoryModalOpen);
    const hideSidebar = useAtomValue(jotaiHideSidebar);
    const hideRightSidebar = useAtomValue(jotaiHideRightSidebar);
    const [
        chatLlmThreadSetting,
        setChatLlmThreadSetting,
    ] = useAtom(jotaiChatLlmThreadSetting);

    const [
        refreshRandomNumFetchChat,
        setRefreshRandomNumFetchChat,
    ] = useState(0);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        let tempThreadId = '';
        const chatId = queryParams.get('id') || '';
        if (chatId) {
            tempThreadId = chatId;
        }
        setChatLlmThreadSetting({
            isOpen: chatLlmThreadSetting.isOpen,
            threadId: tempThreadId,
        });
    }, [location]);

    const renderSeo = () => {
        return (
            <Helmet>
                <title>Chat | {siteInfo.name}</title>
            </Helmet>
        );
    };

    const mainWidthClass =
        hideRightSidebar.isOpen === true ? 'w-[calc(100vw-52px)]' : 'w-screen';

    return (
        <div className="flex min-h-0 w-full bg-gradient-to-br from-zinc-100 via-slate-50 to-zinc-100">
            {renderSeo()}
            <div className={`min-w-0 ${mainWidthClass}`}>
                <div className="mx-auto w-full max-w-none px-0">
                    <div className="flex flex-row">
                        {screenWidth === screenList.lg && hideSidebar.isOpen === true && (
                            <div className="w-[26%] min-w-[240px] max-w-[320px] shrink-0">
                                <ComponentChatHistoryRender />
                            </div>
                        )}
                        <div
                            className={
                                screenWidth === screenList.lg && hideSidebar.isOpen === true
                                    ? 'min-w-0 flex-1'
                                    : 'w-full min-w-0'
                            }
                        >
                            <div className="mx-auto w-full max-w-none">
                                <div className="h-[calc(100vh-60px)] overflow-hidden rounded-none border-zinc-200/60 bg-white/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)] backdrop-blur-[2px] lg:rounded-l-2xl lg:border-l lg:border-t lg:border-b">
                                    <ComponentRightChatWrapper
                                        refreshRandomNumParent={refreshRandomNumFetchChat}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {(hideRightSidebar.isOpen === true || screenWidth === screenList.lg) && (
                <div className="flex w-[52px] shrink-0 flex-row items-stretch border-l border-zinc-200/70 bg-gradient-to-b from-zinc-50/90 via-white to-zinc-100/95 py-2 shadow-[inset_1px_0_0_rgba(255,255,255,0.85),2px_0_32px_-16px_rgba(15,23,42,0.07)] backdrop-blur-xl">
                    <div
                        aria-hidden
                        className="w-px shrink-0 self-stretch bg-gradient-to-b from-teal-400/0 via-teal-400/35 to-cyan-500/0"
                    />
                    <div className="flex min-h-0 min-w-0 flex-1 flex-col items-stretch">
                        <ChatRightFilterWrapper setRefreshRandomNumFetchChat={setRefreshRandomNumFetchChat} />
                    </div>
                </div>
            )}

            {screenWidth === screenList.sm && (
                <div>
                    {chatHistoryModalOpen.isOpen && (
                        <ComponentChatHistoryModelRender />
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatLlmListWrapper;
