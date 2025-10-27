import { useState, useRef, useEffect } from 'react';
import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';

import axiosCustom from '../../../../../config/axiosCustom.ts';
import ComponentNotesAdd from './ComponentNotesAdd.tsx';
import { DateTime } from 'luxon';

import ComponentMessageItem from './ComponentMessageItem.tsx';

import {
    tsMessageItem
} from '../../../../../types/pages/tsNotesAdvanceList.ts'

import ComponentAiGeneratedQuestionList from './ComponentAiGeneratedQuestionList.tsx';
import ThreadSettingWrapper from './ThreadSetting/ThreadSettingWrapper.tsx';
import { useAtomValue } from 'jotai';
import { jotaiChatLlmFooterHeight } from '../jotai/jotaiChatLlmThreadSetting';

const CRightChatById = ({
    threadId,
    refreshRandomNumParent,
}: {
    threadId: string;
    refreshRandomNumParent: number;
}) => {

    // useState
    const [
        paginationDateLocalYearMonthStr,
        setPaginationDateLocalYearMonthStr,
    ] = useState('1999-07');
    const [
        loading,
        setLoading,
    ] = useState(true);

    const chatLlmFooterHeight = useAtomValue(jotaiChatLlmFooterHeight);

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

    useEffect(() => {
        setRefreshRandomNum(
            Math.floor(
                Math.random() * 1_000_000
            )
        )
    }, [refreshRandomNumParent])

    // functions
    const getCssHeightForMessages = () => {
        let returnHeight = 0;
        returnHeight = 60; // header height
        returnHeight += chatLlmFooterHeight;
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
                url: `/api/chat-llm/crud/notesGet`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    paginationDateLocalYearMonthStr,
                    threadId: threadId,
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
        <div>
            <div
                style={{
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
                                <div className='py-3 px-2'>
                                    <div className='p-8 bg-white rounded-lg'>
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
                            <ComponentAiGeneratedQuestionList
                                threadId={threadId}
                            />
                        </div>

                        <div id="messagesScrollDown" />

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