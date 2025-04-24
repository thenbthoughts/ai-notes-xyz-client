import { useState, useRef, useEffect } from 'react';
import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
import {
    LucideList,
    LucideMoveDown,
    LucideMoveUp,
    LucidePlus,
    LucideRefreshCcw,
    LucideSettings
} from 'lucide-react';

import axiosCustom from '../../../../config/axiosCustom.ts';
import ComponentNotesAdd from './ComponentNotesAdd.tsx';
import { DateTime } from 'luxon';

import ComponentMessageItem from './ComponentMessageItem.tsx';

import {
    tsMessageItem
} from '../../../../types/pages/tsNotesAdvanceList.ts'
import toast from 'react-hot-toast';
import ComponentAiGeneratedQuestionList from './ComponentAiGeneratedQuestionList.tsx';
import { Link } from 'react-router-dom';

import {
    ComponentChatHistoryModelRender,
    ComponentChatHistoryRender
} from './ComponentChatHistory.tsx';
import useResponsiveScreen, {
    screenList
} from '../../../../hooks/useResponsiveScreen.tsx';

const ChatLlmList = () => {

    // useState
    const screenWidth = useResponsiveScreen();

    const [
        paginationDateLocalYearMonthStr,
        setPaginationDateLocalYearMonthStr,
    ] = useState('1999-07');
    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        stateDisplayChatHistory,
        setStateDisplayChatHistory,
    ] = useState(false);
    const [
        stateDisplayAdd,
        setStateDisplayAdd,
    ] = useState(false);

    // useState - old
    const [messages, setMessages] = useState<tsMessageItem[]>([]);

    const [refreshRandomNum, setRefreshRandomNum] = useState(0);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // useEffect - old
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // useEffect
    useEffect(() => {
        const indiaDateTime = DateTime
            .now()
            .setZone('Asia/Kolkata')
            .toFormat('yyyy-MM')
            .toString();
        setPaginationDateLocalYearMonthStr(indiaDateTime);
    }, [])

    useEffect(() => {
        const axiosCancelTokenSource: CancelTokenSource = axios.CancelToken.source();
        fetchNotes({
            axiosCancelTokenSource,
        });
        return () => {
            axiosCancelTokenSource.cancel('Operation canceled by the user.'); // Cancel the request if needed
        };
    }, [
        refreshRandomNum,
        paginationDateLocalYearMonthStr,
    ])

    // functions
    const getCssHeightForMessages = () => {
        let returnHeight = 0;
        returnHeight = 60; // header height

        if (
            stateDisplayAdd === true
        ) {
            returnHeight += 165;
        }

        return `calc(100vh - ${returnHeight}px)`;
    }

    const fetchNotes = async ({
        axiosCancelTokenSource
    }: {
        axiosCancelTokenSource: CancelTokenSource
    }) => {
        setLoading(true);
        try {
            const config = {
                method: 'post',
                url: `/api/chat-one/crud/notesGet`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    paginationDateLocalYearMonthStr
                },
                cancelToken: axiosCancelTokenSource.token,
            } as AxiosRequestConfig;

            const response = await axiosCustom.request(config);
            const notes = response.data.docs.map((doc: { _id: string; content: string; createdAt: string; type: string }) => ({
                ...doc,
                id: doc._id,
                content: doc.content,
                time: new Date(doc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: doc.type,
            }));
            setMessages(notes);

            const messagesScrollDown = document.getElementById('messagesScrollDown');
            if (messagesScrollDown) {
                messagesScrollDown?.scrollIntoView({ behavior: "smooth" });
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', width: '100%' }}>
            <div
                style={{
                    width: 'calc(100vw - 50px)'
                }}
            >
                <div className='container mx-auto px-4'>
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
                                        height: `${getCssHeightForMessages()}`,
                                        overflowY: 'scroll'
                                    }}
                                >
                                    <div className="flex bg-background w-full">
                                        <div className="flex-1 flex flex-col">

                                            <div id="messagesScrollUp" />

                                            {/* section no result found */}
                                            <div>
                                                {loading === false && messages.length === 0 && (
                                                    <div className='p-3'>
                                                        <div
                                                            className="flex flex-col items-center justify-center h-full"
                                                            style={{
                                                                paddingTop: '100px',
                                                                paddingBottom: '100px',
                                                                backgroundColor: 'rgba(240, 248, 255, 0.5)',
                                                                borderRadius: '10px',
                                                                width: '80%',
                                                                margin: '0 auto'
                                                            }}
                                                        >
                                                            <p className="text-gray-500 text-lg font-medium mb-4">No messages found for this month.</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* section render messages */}
                                            <div>
                                                {messages.map((itemMessage) => {
                                                    return (
                                                        <div key={`key-message-${itemMessage._id}`}>
                                                            <ComponentMessageItem
                                                                itemMessage={itemMessage}
                                                            />
                                                        </div>
                                                    )
                                                })}
                                            </div>

                                            <div>
                                                <ComponentAiGeneratedQuestionList />
                                            </div>

                                            <div id="messagesScrollDown" />

                                        </div>
                                    </div>
                                </div>

                                {/* component add */}
                                {stateDisplayAdd && (
                                    <ComponentNotesAdd
                                        setRefreshParentRandomNum={setRefreshRandomNum}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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

export default ChatLlmList;