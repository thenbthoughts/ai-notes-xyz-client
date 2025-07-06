import {
    LucideList,
    LucideMoveDown,
    LucideMoveUp,
    LucidePlus,
    LucideSettings,
    LucideSettings2
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Link, useNavigate } from 'react-router-dom';

import useResponsiveScreen, {
    screenList
} from '../../../../../hooks/useResponsiveScreen.tsx';
import { chatLlmThreadAddAxios } from '../utils/chatLlmThreadAxios.ts';
import { jotaiChatLlmThreadSetting } from '../jotai/jotaiChatLlmThreadSetting.ts';
import { useAtom } from 'jotai';

const ChatRightFilterWrapper = ({
    stateDisplayChatHistory,
    setStateDisplayChatHistory,
}: {
    stateDisplayChatHistory: boolean;
    setStateDisplayChatHistory: React.Dispatch<React.SetStateAction<boolean>>;
}) => {

    // useState
    const screenWidth = useResponsiveScreen();
    const navigate = useNavigate();

    const [
        chatLlmThreadSetting,
        setChatLlmThreadSetting,
    ] = useAtom(jotaiChatLlmThreadSetting);

    const addNewThread = async () => {
        const result = await chatLlmThreadAddAxios();

        if (result.success === 'Success') {
            toast.success('New thread added successfully!');
            navigate(`/user/chat?id=${result.recordId}`);
        } else {
            toast.error(result.error);
        }
    }

    return (
        <div className='w-full'>
            {/* setting */}
            <div
                className='p-1 cursor-pointer'
            >
                <div className={`py-3 rounded bg-gray-600`}>
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

            {/* add */}
            <div
                className='p-1 cursor-pointer'
                onClick={() => {
                    addNewThread();
                }}
            >
                <div className={`py-3 rounded bg-gray-600`}>
                    <LucidePlus
                        style={{
                            width: '100%',
                            color: 'white', // Set icon color to white
                        }}
                        className=''
                    />
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

            {/* move up */}
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

            {/* chat history */}
            {screenWidth === screenList.sm && (
                <div
                    className='p-1 cursor-pointer'
                    onClick={() => {
                        setStateDisplayChatHistory(!stateDisplayChatHistory);
                    }}
                >
                    <div className={`py-3 rounded ${stateDisplayChatHistory ? 'bg-blue-600' : 'bg-gray-600'}`}>
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

            {/* thread setting */}
            {chatLlmThreadSetting.threadId.length === 24 && (
                <div
                    className='p-1 cursor-pointer'
                    onClick={() => {
                        setChatLlmThreadSetting((prevProps) => {
                            return {
                                ...prevProps,
                                isOpen: true,
                            };
                        });
                    }}
                >
                    <div className={`py-3 rounded bg-gray-600`}>
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