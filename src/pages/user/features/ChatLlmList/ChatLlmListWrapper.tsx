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

    // useState
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
        console.log('location trigger: ', location);
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
        )
    }

    return (
        <div style={{ display: 'flex', width: '100%' }}>
            {renderSeo()}
            <div
                style={{
                    width: hideRightSidebar.isOpen === true ? 'calc(100vw - 50px)' : '100vw'
                }}
            >
                <div className='mx-auto px-1'>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row'
                        }}
                    >
                        {(
                            screenWidth === screenList.lg &&
                            hideSidebar.isOpen === true
                        ) && (
                                <div
                                    style={{
                                        width: '25%'
                                    }}
                                >
                                    <ComponentChatHistoryRender />
                                </div>
                            )}
                        <div
                            style={{
                                width: (screenWidth === screenList.lg && hideSidebar.isOpen === true) ? '75%' : '100%',
                                minWidth: 0,
                            }}
                        >
                            <div style={{
                                maxWidth: '1000px',
                                margin: '0 auto',
                                // overflow: 'hidden',
                            }}>
                                <div
                                    style={{
                                        height: 'calc(100vh - 60px)',
                                    }}
                                >
                                    <ComponentRightChatWrapper
                                        refreshRandomNumParent={refreshRandomNumFetchChat}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* part 3 -> 50px */}
            {(
                hideRightSidebar.isOpen === true ||
                screenWidth === screenList.lg
            ) && (
                <div
                    style={{
                        width: '50px',
                    }}
                    className='text-center flex flex-col items-center justify-center'
                >
                    <ChatRightFilterWrapper
                        setRefreshRandomNumFetchChat={setRefreshRandomNumFetchChat}
                    />
                </div>
            )}

            {/* screen list */}
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