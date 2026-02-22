import { useState, useRef, useEffect } from 'react';
import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
import { Loader2 } from 'lucide-react';

import axiosCustom from '../../../../../../config/axiosCustom.ts';
import ComponentNotesAdd from './ComponentChatMessageInput.tsx';

import ComponentMessageItem from './ComponentMessageItem.tsx';

import {
    tsMessageItem
} from '../../../../../../types/pages/tsNotesAdvanceList.ts'

import ComponentAiGeneratedQuestionList from './ComponentAiGeneratedQuestionList.tsx';
import ThreadSettingWrapper from '../ThreadSetting/ThreadSettingWrapper.tsx';
import { useAtomValue } from 'jotai';
import { jotaiChatLlmFooterHeight } from '../../jotai/jotaiChatLlmThreadSetting.ts';
import ComponentAnswerMachineStatus from './ComponentAnswerMachineStatus.tsx';

const CRightChatById = ({
    threadId,
    refreshRandomNumParent,
}: {
    threadId: string;
    refreshRandomNumParent: number;
}) => {

    // useState
    const [
        loading,
        setLoading,
    ] = useState(true);
    const [
        loadingMore,
        setLoadingMore,
    ] = useState(false);

    const chatLlmFooterHeight = useAtomValue(jotaiChatLlmFooterHeight);

    // useState - old
    const [messages, setMessages] = useState<tsMessageItem[]>([]);
    const [refreshRandomNum, setRefreshRandomNum] = useState(0);
    const [isAnswerMachineEnabled, setIsAnswerMachineEnabled] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [currentLimit, setCurrentLimit] = useState(20);
    const [totalCount, setTotalCount] = useState(0);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const loadingTriggerRef = useRef<HTMLDivElement>(null);

    const useEffectOneTimeMessagesScrollDownRef = useRef<boolean>(false);

    useEffect(() => {
        if (!useEffectOneTimeMessagesScrollDownRef.current) {
            if (messages.length === 0) {
                // Use setTimeout to ensure DOM is updated after state change
                setTimeout(() => {
                    if (messagesEndRef.current) {
                        messagesEndRef.current.scrollIntoView({ block: 'end', inline: 'nearest' });
                    }
                }, 100);
                useEffectOneTimeMessagesScrollDownRef.current = true;
            }
        }
        return () => {
            useEffectOneTimeMessagesScrollDownRef.current = false;
        }
    }, [messages])

    // useEffect

    // Reset pagination state when thread changes
    useEffect(() => {
        setCurrentLimit(20);
        setTotalCount(0);
        setHasMore(true);
        useEffectOneTimeMessagesScrollDownRef.current = false;
    }, [threadId])

    useEffect(() => {
        setRefreshRandomNum(
            Math.floor(
                Math.random() * 1_000_000
            )
        )
    }, [refreshRandomNumParent])

    // Check if Answer Machine is enabled for this thread
    useEffect(() => {
        const checkAnswerMachineEnabled = async () => {
            try {
                const responseThread = await axiosCustom.post(
                    '/api/chat-llm/threads-crud/threadsGet', {
                    threadId: threadId,
                }
                );
                if (responseThread.data && responseThread.data.docs && responseThread.data.docs.length > 0) {
                    const threadInfo = responseThread.data.docs[0];
                    setIsAnswerMachineEnabled(threadInfo.answerEngine === 'answerMachine');
                }
            } catch (error) {
                console.error('Error checking Answer Machine status:', error);
            }
        };

        if (threadId) {
            checkAnswerMachineEnabled();
        }
    }, [threadId, refreshRandomNum])

    // functions
    const getCssHeightForMessages = () => {
        let returnHeight = 0;
        returnHeight = 60; // header height
        returnHeight += chatLlmFooterHeight;
        return `calc(100vh - ${returnHeight}px)`;
    }

    const fetchNotes = async ({
        axiosCancelTokenSource,
    }: {
        axiosCancelTokenSource: CancelTokenSource;
    }) => {
        let mode = 'initial';

        // load more messages if the user scrolls to the top of the messages container
        if (messagesContainerRef.current) {
            if (messagesContainerRef.current.scrollTop <= 100) {
                if (messages.length >= 1) {
                    mode = 'loadMore';
                }
            }
        }

        if (mode === 'initial') {
            setLoading(true);
        } if (mode === 'loadMore') {
            setLoadingMore(true);
        }

        try {
            const config = {
                method: 'post',
                url: `/api/chat-llm/crud/notesGet`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    threadId: threadId,
                    limit: currentLimit,
                    testing: {
                        mode: mode,
                    }
                },
                cancelToken: axiosCancelTokenSource.token,
            } as AxiosRequestConfig;

            const response = await axiosCustom.request(config);
            const resMessages = response.data.docs.map((doc: { _id: string; content: string; createdAt: string; type: string }) => ({
                ...doc,
                id: doc._id,
                content: doc.content,
                time: new Date(doc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: doc.type,
            }));

            // Always replace messages (not prepend) since we're getting the full set
            setMessages(resMessages);
            setTotalCount(response.data.totalCount);

            if (mode === 'initial') {
                // go down to the bottom of the messages
                setTimeout(() => {
                    if (messagesEndRef.current) {
                        messagesEndRef.current.scrollIntoView({ block: 'end', inline: 'nearest' });
                    }
                }, 100);
            } else if (mode === 'loadMore') {
                // scroll into first message of the new messages
                setTimeout(() => {
                    if (messages.length > 0) {
                        const firstMessage = messages[0];
                        const firstMessageElement = document.getElementById(`key-message-${firstMessage._id}`);
                        console.log('firstMessageElement', firstMessageElement, `key-message-${firstMessage._id}`);
                        if (firstMessageElement) {
                            firstMessageElement.scrollIntoView({ block: 'nearest', inline: 'nearest' });
                        }
                    }
                }, 100);
            }

            // Check if we have more messages to load
            setHasMore(currentLimit < response.data.totalCount);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Initial load of messages
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
        threadId,
        currentLimit,
    ])

    // Handle intersection observer for loading more messages
    useEffect(() => {
        let functionScroll = (e: Event) => {
            console.log('functionScroll called', e);
            if (loadingMore || loading) {
                return;
            }
            if (messagesContainerRef.current) {
                if (messagesContainerRef.current) {
                    if (
                        messagesContainerRef.current.scrollTop <= 100
                    ) {
                        const newLimit = Math.min(currentLimit + 20, totalCount);
                        setCurrentLimit(newLimit);
                    }
                }
            }
        }

        // add event listener to the messagesContainerRef 
        if (messagesContainerRef) {
            if (messagesContainerRef.current) {
                messagesContainerRef.current.addEventListener('scrollend', functionScroll);
            }
        }

        return () => {
            if (messagesContainerRef.current) {
                messagesContainerRef.current.removeEventListener('scrollend', functionScroll);
            }
        };
    }, [
        loadingMore,
        loading,
        currentLimit,
        totalCount,
    ]);

    return (
        <div>
            <div
                ref={messagesContainerRef}
                style={{
                    height: `${getCssHeightForMessages()}`,
                    overflowY: 'scroll',
                }}
            >
                <div className="flex bg-background w-full">
                    <div className="flex-1 flex flex-col min-w-0">

                        <div id="messagesScrollUp" />

                        {/* section no result found */}
                        <div>
                            {loading === false && messages.length === 0 && (
                                <div className='py-3 px-2'>
                                    <div className='p-8 bg-white rounded-sm'>
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <div className="text-4xl mb-4">💬</div>
                                            <h3 className="text-gray-600 text-lg mb-2">
                                                Start Your Conversation
                                            </h3>
                                            <p className="text-gray-400 text-sm">
                                                Ask a question to begin
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Loading trigger container */}
                        {hasMore && (
                            <div
                                ref={loadingTriggerRef}
                                className="flex items-center justify-center py-8"
                                style={{ height: '100px' }}
                            >
                                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                            </div>
                        )}

                        {/* empty space 250px */}
                        {loading === false && messages.length === 0 && (
                            <div style={{ height: '1000px' }} />
                        )}

                        {/* Loading more indicator */}
                        {loadingMore && (
                            <div className="flex justify-center items-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-900"></div>
                                <span className="ml-2 text-sm text-gray-600">Loading messages...</span>
                            </div>
                        )}


                        {/* section render messages */}
                        <div className="w-full min-w-0">
                            {messages.map((itemMessage) => {
                                return (
                                    <div
                                        key={`key-message-${itemMessage._id}`}
                                        className="w-full min-w-0"
                                        id={`key-message-${itemMessage._id}`}
                                    >
                                        <ComponentMessageItem
                                            itemMessage={itemMessage}
                                        />
                                    </div>
                                )
                            })}
                        </div>

                        {/* Answer Machine Status Component */}
                        {isAnswerMachineEnabled && (
                            <ComponentAnswerMachineStatus
                                threadId={threadId}
                                onComplete={() => {
                                    // Refresh messages when Answer Machine completes
                                    setRefreshRandomNum(Math.floor(Math.random() * 1_000_000));
                                }}
                                onStatusUpdate={() => {
                                    // Refresh messages periodically while processing to show updates
                                    setRefreshRandomNum(Math.floor(Math.random() * 1_000_000));
                                }}
                            />
                        )}

                        <div>
                            <ComponentAiGeneratedQuestionList
                                threadId={threadId}
                            />
                        </div>

                        {/* empty space 250px */}
                        {loading === true || messages.length === 0 && (
                            <div style={{ height: '250px' }} />
                        )}

                        <div id="messagesScrollDown" ref={messagesEndRef} />

                    </div>
                </div>
            </div>

            {/* component add */}
            <ComponentNotesAdd
                setRefreshParentRandomNum={setRefreshRandomNum}
                threadId={threadId}
            />

            <ThreadSettingWrapper />
        </div>
    )
};

export default CRightChatById;