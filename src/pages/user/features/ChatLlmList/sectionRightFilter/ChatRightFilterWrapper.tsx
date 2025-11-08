import {
    LucideList,
    LucideMoveDown,
    LucideMoveUp,
    LucidePlus,
    LucideRefreshCcw,
    LucideSettings,
    LucideSettings2,
    LucideSidebar
} from 'lucide-react';

import { Link } from 'react-router-dom';

import useResponsiveScreen, {
    screenList
} from '../../../../../hooks/useResponsiveScreen.tsx';
import { jotaiChatHistoryModalOpen, jotaiChatLlmThreadSetting, jotaiHideSidebar } from '../jotai/jotaiChatLlmThreadSetting.ts';
import { useAtom } from 'jotai';
import { toast } from 'react-hot-toast';

const ChatRightFilterWrapper = ({
    setRefreshRandomNumFetchChat,
}: {
    setRefreshRandomNumFetchChat: React.Dispatch<React.SetStateAction<number>> 
}) => {

    // useState
    const screenWidth = useResponsiveScreen();

    const [
        chatHistoryModalOpen,
        setChatHistoryModalOpen,
    ] = useAtom(jotaiChatHistoryModalOpen);

    const [
        chatLlmThreadSetting,
        setChatLlmThreadSetting,
    ] = useAtom(jotaiChatLlmThreadSetting);

    const [
        hideSidebar,
        setHideSidebar,
    ] = useAtom(jotaiHideSidebar);

    return (
        <div className='w-full'>
            {/* chat history */}
            {screenWidth === screenList.sm && (
                <div
                    className='p-1 cursor-pointer'
                    onClick={() => {
                        setChatHistoryModalOpen({
                            isOpen: !chatHistoryModalOpen.isOpen,
                        });
                        setChatLlmThreadSetting((prevProps) => {
                            return {
                                ...prevProps,
                                isOpen: false,
                            };
                        });
                    }}
                >
                    <div className={`py-3 rounded-sm ${chatHistoryModalOpen.isOpen ? 'bg-blue-600' : 'bg-gray-600'}`}>
                        <LucideList
                            style={{
                                width: '100%',
                                color: 'white', // Set icon color to white
                            }}
                            className=''
                        />
                    </div>
                </div>
            )}

            {/* setting */}
            <div
                className='p-1 cursor-pointer'
            >
                <div className={`py-3 rounded-sm bg-gray-600`}>
                    <Link to={'/user/setting'}>
                        <LucideSettings
                            style={{
                                width: '100%',
                                color: 'white', // Set icon color to white
                            }}
                            className=''
                        />
                    </Link>
                </div>
            </div>

            {/* add chat */}
            <div
                className='p-1 cursor-pointer'
            >
                <div className={`py-3 rounded-sm bg-gray-600`}>
                    <Link to={'/user/chat'}>
                        <LucidePlus
                            style={{
                                width: '100%',
                                color: 'white', // Set icon color to white
                            }}
                            className=''
                        />
                    </Link>
                </div>
            </div>

            {/* move up */}
            <div
                className='p-1 cursor-pointer'
                onClick={() => {
                    const messagesScrollUp = document.getElementById('messagesScrollUp');
                    if (messagesScrollUp) {
                        messagesScrollUp?.scrollIntoView({ behavior: "smooth" });
                    }
                }}
            >
                <div className='py-3 bg-gray-600 rounded'>
                    <LucideMoveUp
                        style={{
                            width: '100%',
                            color: 'white', // Set icon color to white
                        }}
                        className=''

                    />
                </div>
            </div>

            {/* move down */}
            <div
                className='p-1 cursor-pointer'
                onClick={() => {
                    const messagesScrollDown = document.getElementById('messagesScrollDown');
                    if (messagesScrollDown) {
                        messagesScrollDown?.scrollIntoView({ behavior: "smooth" });
                    }
                }}
            >
                <div className='py-3 bg-gray-600 rounded'>
                    <LucideMoveDown
                        style={{
                            width: '100%',
                            color: 'white', // Set icon color to white
                        }}
                        className=''
                    />
                </div>
            </div>

            {/* hide sidebar */}
            <div
                className='p-1 cursor-pointer'
                onClick={() => {
                    setHideSidebar((prevProps) => {
                        return {
                            isOpen: !prevProps.isOpen,
                        };
                    });
                }}
            >
                <div className={`py-3 rounded-sm ${hideSidebar.isOpen ? 'bg-blue-600' : 'bg-gray-600'}`}>
                    <LucideSidebar
                        style={{
                            width: '100%',
                            color: 'white',
                        }}
                        className=''
                    />
                </div>
            </div>

            {/* thread setting */}
            {chatLlmThreadSetting.threadId.length === 24 && (
                <div
                    className='p-1 cursor-pointer'
                    onClick={() => {
                        toast.success('Refreshing...');
                        let randomNum = Math.floor(Math.random() * 1_000_000);
                        setRefreshRandomNumFetchChat(randomNum);
                    }}
                >
                    <div className={`py-3 rounded-sm bg-gray-600`}>
                        <LucideRefreshCcw
                            style={{
                                width: '100%',
                                color: 'white',
                            }}
                            className=''
                        />
                    </div>
                </div>
            )}

            {/* thread setting */}
            {chatLlmThreadSetting.threadId.length === 24 && (
                <div
                    className='p-1 cursor-pointer'
                    onClick={() => {
                        setChatHistoryModalOpen({
                            isOpen: false,
                        });
                        setChatLlmThreadSetting((prevProps) => {
                            return {
                                ...prevProps,
                                isOpen: true,
                            };
                        });
                    }}
                >
                    <div className={`py-3 rounded-sm bg-gray-600`}>
                        <LucideSettings2
                            style={{
                                width: '100%',
                                color: 'white',
                            }}
                            className=''
                        />
                    </div>
                </div>
            )}

        </div>
    )
}

export default ChatRightFilterWrapper;