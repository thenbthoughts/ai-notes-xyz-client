import { useState } from 'react';
import {
    LucideList,
    LucideMoveDown,
    LucideMoveUp,
    LucidePlus,
    LucideRefreshCcw,
    LucideSettings
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Link } from 'react-router-dom';

import {
    ComponentChatHistoryModelRender,
    ComponentChatHistoryRender
} from './sectionLeft/ComponentChatHistory.tsx';
import useResponsiveScreen, {
    screenList
} from '../../../../hooks/useResponsiveScreen.tsx';
import ComponentRightWrapper from './sectionRight/ComponentRightWrapper.tsx';

const ChatLlmListWrapper = () => {

    // useState
    const screenWidth = useResponsiveScreen();

    const [
        stateDisplayChatHistory,
        setStateDisplayChatHistory,
    ] = useState(false);
    const [
        stateDisplayAdd,
        setStateDisplayAdd,
    ] = useState(true);

    const [refreshRandomNum, setRefreshRandomNum] = useState(0);

    return (
        <div style={{ display: 'flex', width: '100%' }}>
            <div
                style={{
                    width: 'calc(100vw - 50px)'
                }}
            >
                <div className='container mx-auto px-1'>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row'
                        }}
                    >
                        {screenWidth === screenList.lg && (
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
                                width: screenWidth === screenList.lg ? '75%' : '100%'
                            }}
                        >
                            <div style={{
                                maxWidth: '1000px',
                                margin: '0 auto',
                            }}>
                                {/*  */}
                                <div
                                    style={{
                                        // height: 'calc(100vh - 155px - 120px - 50px)',
                                        // height: `${getCssHeightForMessages()}`,
                                        height: 'calc(100vh - 60px)',
                                        // overflowY: 'scroll'
                                    }}
                                >
                                    <ComponentRightWrapper
                                        stateDisplayAdd={stateDisplayAdd}
                                        refreshRandomNumParent={refreshRandomNum}
                                    />
                                    {/* {renderChatList()} */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* part 3 -> 50px */}
            <div
                style={{
                    width: '50px',
                }}
                className='text-center flex flex-col items-center justify-center'
            >
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
                            setStateDisplayAdd(!stateDisplayAdd);
                        }}
                    >
                        <div className={`py-3 rounded ${stateDisplayAdd ? 'bg-blue-600' : 'bg-gray-600'}`}>
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

                    {/* refresh */}
                    <div
                        className='p-1 cursor-pointer'
                        onClick={() => {
                            toast.success('Refreshing...');
                            setRefreshRandomNum(
                                Math.floor(
                                    Math.random() * 1_000_000
                                )
                            );
                        }}
                    >
                        <div className='py-3 bg-gray-600 rounded'>
                            <LucideRefreshCcw
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

                </div>
            </div>

            {/* screen list */}
            {screenWidth === screenList.sm && (
                <div>
                    {stateDisplayChatHistory && (
                        <ComponentChatHistoryModelRender />
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatLlmListWrapper;