import { useState, useRef, useEffect, useCallback, useMemo, type DragEvent } from 'react';
import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import axiosCustom from '../../../../../../config/axiosCustom.ts';
import {
    pollAnswerMachineStatus,
    answerMachinePollIndicatesActiveNotesWork,
    cancelAnswerMachineV4RunByThreadId,
} from '../../utils/answerMachinePollingAxios';
import ComponentNotesAdd, { type ChatMessageInputHandle } from './ComponentChatMessageInput.tsx';

import ComponentMessageItem from './ComponentMessageItem.tsx';
import ComponentAnswerMachineV4StreamGroup from './ComponentAnswerMachineV4StreamGroup.tsx';
import { chunkMessagesForChatRender } from './chunkMessagesForChatRender.ts';

import {
    tsMessageItem,
    type AnswerMachineV4StreamPayload,
} from '../../../../../../types/pages/tsNotesAdvanceList.ts'

import ComponentAiGeneratedQuestionList from './ComponentAiGeneratedQuestionList.tsx';
import ThreadSettingWrapper from '../ThreadSetting/ThreadSettingWrapper.tsx';
import ThreadSettingInline from '../ThreadSetting/ThreadSettingInline.tsx';

const LIMIT_MESSAGES = 10;

/** Faster than conciseAnswer refresh so cron-backed AM4 steps show within ~ one worker tick. */
const AM4_PIPELINE_REFRESH_MS = 5_000;

/** Visible AM4 stream rows imply the pipeline UI is still merging steps. */
const am4StreamingLooksLiveFromList = (msgList: tsMessageItem[]): boolean => {
    for (const m of msgList) {
        if (m.type !== 'answer_machine_v4_stream') {
            continue;
        }
        const sp = m.streamPayload as AnswerMachineV4StreamPayload | undefined;
        if (!sp) {
            continue;
        }
        if (sp.kind === 'iteration' && (sp.status === 'in_progress' || sp.status === 'queued')) {
            return true;
        }
        if (sp.kind === 'sub_question' && sp.status === 'pending') {
            return true;
        }
    }
    return false;
};

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

    const sectionChatMessageInputRef = useRef<HTMLDivElement>(null);
    const chatMessageInputRef = useRef<ChatMessageInputHandle>(null);

    const [chatLlmFooterHeight, setChatLlmFooterHeight] = useState(0);

    // const [chatLlmFooterHeight, setChatLlmFooterHeight] = useAtom(jotaiChatLlmFooterHeight);

    // useState - old
    const [messages, setMessages] = useState<tsMessageItem[]>([]);
    const [refreshRandomNum, setRefreshRandomNum] = useState(0);
    const [answerEngineKind, setAnswerEngineKind] = useState<'none' | 'answerMachine4'>('none');
    const [am4RemoteActivePoll, setAm4RemoteActivePoll] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [currentLimit, setCurrentLimit] = useState(LIMIT_MESSAGES);
    const [totalCount, setTotalCount] = useState(0);

    const messagesRef = useRef(messages);
    messagesRef.current = messages;

    const am4MessagesIndicateLivePipeline = useCallback((): boolean =>
        am4StreamingLooksLiveFromList(messagesRef.current),
    []);

    const am4LocallyLiveFromMessages = useMemo(
        () => am4StreamingLooksLiveFromList(messages),
        [messages],
    );

    const messageChunksRender = useMemo(() => chunkMessagesForChatRender(messages), [messages]);

    const latestAm4ChunkIndex = useMemo(() => {
        let ix = -1;
        messageChunksRender.forEach((chunk, i) => {
            if (chunk.kind === 'am4_pipeline_group') {
                ix = i;
            }
        });
        return ix;
    }, [messageChunksRender]);

    const cancelLatestAm4Eligible =
        answerEngineKind === 'answerMachine4' && (am4LocallyLiveFromMessages || am4RemoteActivePoll);

    const refreshChatMessages = useCallback(() => {
        setRefreshRandomNum(Math.floor(Math.random() * 1_000_000));
    }, []);

    const handleCancelLatestAm4Run = useCallback(async () => {
        try {
            await cancelAnswerMachineV4RunByThreadId(threadId);
            toast.success('Cancellation requested. Future AM4 iterations for this run are skipped.');
            refreshChatMessages();
        } catch (err) {
            console.error(err);
            toast.error('Could not cancel. Try refreshing the thread.');
        }
    }, [threadId, refreshChatMessages]);

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

    useEffect(() => {
        const el = sectionChatMessageInputRef.current;
        if (!el) return;
        const update = () => {
          const r = el.getBoundingClientRect();
          setChatLlmFooterHeight(r.height);
          console.log('div size:', r.width, r.height);
        };
        update(); // initial (after mount / “reload” of this subtree)
        const ro = new ResizeObserver(() => update());
        ro.observe(el);
        return () => ro.disconnect();
      }, []);
      

    // useEffect

    // Reset pagination state when thread changes
    useEffect(() => {
        setCurrentLimit(LIMIT_MESSAGES);
        setTotalCount(0);
        setHasMore(true);
        setAm4RemoteActivePoll(false);
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
                    const eng = threadInfo.answerEngine;
                    if (eng === 'answerMachine4') {
                        setAnswerEngineKind('answerMachine4');
                    } else {
                        setAnswerEngineKind('none');
                    }
                } else {
                    setAnswerEngineKind('none');
                }
            } catch (error) {
                console.error('Error checking Answer Machine status:', error);
            }
        };

        if (threadId) {
            checkAnswerMachineEnabled();
        }
    }, [threadId, refreshRandomNum])

    /** AM4: refresh merged stream notes on an interval while a step is in progress. */
    useEffect(() => {
        if (!threadId || answerEngineKind !== 'answerMachine4') {
            return;
        }
        let cancelled = false;
        const tick = async () => {
            let shouldRefresh = am4MessagesIndicateLivePipeline();
            try {
                const r = await pollAnswerMachineStatus(threadId);
                if (!cancelled) {
                    const remoteActive = answerMachinePollIndicatesActiveNotesWork(r);
                    setAm4RemoteActivePoll(remoteActive);
                    if (!shouldRefresh && remoteActive) {
                        shouldRefresh = true;
                    }
                }
            } catch {
                /* ignore */
            }
            if (!cancelled && shouldRefresh) {
                setRefreshRandomNum(Math.floor(Math.random() * 1_000_000));
            }
        };
        void tick();
        const id = setInterval(tick, AM4_PIPELINE_REFRESH_MS);
        return () => {
            cancelled = true;
            clearInterval(id);
        };
    }, [threadId, answerEngineKind, am4MessagesIndicateLivePipeline]);

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
        let mode = '' as '' | 'initial' | 'loadMore';

        // Load initial messages
        if (messages.length === 0) {
            mode = 'initial';
        }

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
                    limit: Math.max(LIMIT_MESSAGES, currentLimit),
                    testing: {
                        mode: mode,
                    }
                },
                cancelToken: axiosCancelTokenSource.token,
            } as AxiosRequestConfig;

            const response = await axiosCustom.request(config);
            const resMessages = response.data.docs.map((doc: { _id: string; content: string; createdAt: string; createdAtUtc?: string; type: string }) => ({
                ...doc,
                id: doc._id,
                content: doc.content,
                time: new Date(doc.createdAtUtc ?? doc.createdAt ?? 0).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
        let functionScroll = (_e: Event) => {
            if (loadingMore || loading) {
                return;
            }
            if (messagesContainerRef.current) {
                if (messagesContainerRef.current) {
                    if (
                        messagesContainerRef.current.scrollTop <= 100
                    ) {
                        // Never shrink currentLimit below totalCount edge cases (e.g. totalCount 5 vs initial 10);
                        // always grow by LIMIT_MESSAGES up to totalCount so we keep min LIMIT_MESSAGES per request.
                        const newLimit = Math.min(
                            currentLimit + LIMIT_MESSAGES,
                            Math.max(totalCount, currentLimit),
                        );
                        if (newLimit > currentLimit) {
                            setCurrentLimit(newLimit);
                        }
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

    const handleMessagesDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }, []);

    const handleMessagesDrop = useCallback(async (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const list = e.dataTransfer.files;
        if (!list || list.length === 0) {
            return;
        }
        await chatMessageInputRef.current?.ingestDroppedFiles(Array.from(list));
    }, []);

    return (
        <div className="relative min-h-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(45,212,191,0.08),transparent_50%),radial-gradient(ellipse_80%_50%_at_100%_50%,rgba(139,92,246,0.05),transparent_45%),linear-gradient(to_bottom,#f8fafc_0%,#f4f4f5_100%)]">
            <div
                ref={messagesContainerRef}
                onDragOver={handleMessagesDragOver}
                onDrop={handleMessagesDrop}
                style={{
                    height: `${getCssHeightForMessages()}`,
                    overflowY: 'scroll',
                }}
            >
                <div className="flex min-h-0 w-full">
                    <div className="mx-auto flex min-h-0 min-w-0 w-full max-w-3xl flex-1 flex-col px-2 sm:px-4">

                        <div id="messagesScrollUp" />

                        <div>
                            {loading === false && messages.length === 0 && (
                                <div className="px-1 py-8 sm:py-12">
                                    <div className="rounded-2xl border border-zinc-200/80 bg-white/80 px-6 py-12 text-center shadow-lg shadow-zinc-900/5 ring-1 ring-white/60 backdrop-blur-sm">
                                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/15 to-violet-500/15 text-2xl ring-1 ring-teal-500/20">
                                            💬
                                        </div>
                                        <h3 className="mb-2 text-base font-semibold tracking-tight text-zinc-900">
                                            Start a conversation
                                        </h3>
                                        <p className="mx-auto max-w-sm text-sm leading-relaxed text-zinc-500">
                                            Send a message below. You can attach files, paste images, or use voice from the toolbar.
                                        </p>
                                    </div>

                                    <ThreadSettingInline threadId={threadId} />
                                </div>
                            )}
                        </div>

                        {hasMore && messages.length > 0 && totalCount >= LIMIT_MESSAGES + 1 && (
                            <div
                                ref={loadingTriggerRef}
                                className="flex items-center justify-center py-8"
                                style={{ height: '100px' }}
                            >
                                <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
                            </div>
                        )}

                        {messages.length > 0 && totalCount >= LIMIT_MESSAGES + 1 && (
                            <div>
                                {loadingMore && (
                                    <div className="flex items-center justify-center py-4">
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-teal-600" />
                                        <span className="ml-2 text-xs text-zinc-600">Loading older messages…</span>
                                    </div>
                                )}
                            </div>
                        )}


                        {/* section render messages */}
                        <div className="w-full min-w-0">
                            {messageChunksRender.map((chunk, chunkIx) => {
                                if (chunk.kind === 'am4_pipeline_group') {
                                    const g = chunk.messages;
                                    const key = `am4-pipeline-${g[0]._id}-${g[g.length - 1]._id}`;
                                    return (
                                        <ComponentAnswerMachineV4StreamGroup
                                            key={key}
                                            items={g}
                                            threadId={threadId}
                                            onManualRefresh={refreshChatMessages}
                                            cancelLatestRunActive={
                                                cancelLatestAm4Eligible && chunkIx === latestAm4ChunkIndex
                                            }
                                            onCancelAnswerMachineRun={handleCancelLatestAm4Run}
                                        />
                                    );
                                }
                                const itemMessage = chunk.message;
                                return (
                                    <div
                                        key={`key-message-${itemMessage._id}`}
                                        className="w-full min-w-0"
                                        id={`key-message-${itemMessage._id}`}
                                    >
                                        <ComponentMessageItem itemMessage={itemMessage} />
                                    </div>
                                );
                            })}
                        </div>

                        <div>
                            <ComponentAiGeneratedQuestionList
                                threadId={threadId}
                            />
                        </div>

                        <div id="messagesScrollDown" ref={messagesEndRef} />

                    </div>
                </div>
            </div>

            {/* component add */}
            <div
                ref={sectionChatMessageInputRef}
            >
                <ComponentNotesAdd
                    ref={chatMessageInputRef}
                    setRefreshParentRandomNum={setRefreshRandomNum}
                    threadId={threadId}
                />
            </div>

            <ThreadSettingWrapper />
        </div>
    )
};

export default CRightChatById;