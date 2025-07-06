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

const CRightChatById = ({
    stateDisplayAdd,
    threadId,
    refreshRandomNumParent,
}: {
    stateDisplayAdd: boolean;
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
                            <ComponentAiGeneratedQuestionList
                                threadId={threadId}
                            />
                        </div>

                        <div id="messagesScrollDown" />

                    </div>
                </div>
            </div>

            {/* component add */}
            {stateDisplayAdd && (
                <ComponentNotesAdd
                    setRefreshParentRandomNum={setRefreshRandomNum}
                    threadId={threadId}
                />
            )}

            <ThreadSettingWrapper />
        </div>
    )
};

export default CRightChatById;