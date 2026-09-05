import { useState, useRef, useEffect, useCallback, useMemo, type DragEvent } from 'react';
import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
import { Loader2, HardDrive, Monitor, Copy, Check, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { DebounceInput } from 'react-debounce-input';
import { useAtomValue } from 'jotai';
import { jotaiChatSearchVisible } from '../../jotai/jotaiChatLlmThreadSetting';

import axiosCustom from '../../../../../../config/axiosCustom.ts';
import {
    pollAgentStatus,
    agentPollIndicatesActive,
    cancelAgentRunByThreadId,
    type AgentPollingResponse,
} from '../../utils/answerMachinePollingAxios';
import ComponentNotesAdd, { type ChatMessageInputHandle } from './ComponentChatMessageInput.tsx';

import ComponentMessageItem from './ComponentMessageItem.tsx';
import ComponentAgentInstanceList from './ComponentAgentInstanceList.tsx';
import ComponentAgentOpencodeInstanceList from './ComponentAgentOpencodeInstanceList.tsx';
import ComponentShellFilesExplorerModal from './ComponentShellFilesExplorerModal.tsx';
import { chunkMessagesForChatRender } from './chunkMessagesForChatRender.ts';
import {
    fetchAgentOpencodeStatus,
    openAgentOpencodeSession,
    type AgentOpencodeInstanceSummary,
} from '../../utils/agentOpencodeAxios';
import { useAgentOpencodeStream } from '../../utils/agentOpencodeStream';

import {
    tsMessageItem,
} from '../../../../../../types/pages/tsNotesAdvanceList.ts'

import ComponentAiGeneratedQuestionList from './ComponentAiGeneratedQuestionList.tsx';
import ThreadSettingWrapper from '../ThreadSetting/ThreadSettingWrapper.tsx';
import ThreadSettingInline from '../ThreadSetting/ThreadSettingInline.tsx';
import ComponentComputerScreen from '../ComponentComputerScreen.tsx';

const LIMIT_MESSAGES = 10;
const AGENT_PIPELINE_REFRESH_MS = 2_000;
const DESKTOP_TAB_NAME = 'agent-workspace-desktop';

const openDesktopTabOnClick = (): Window | null => {
    try {
        return window.open('', DESKTOP_TAB_NAME);
    } catch {
        return null;
    }
};

const navigateDesktopTab = (tab: Window | null, tabUrl: string): boolean => {
    if (!tabUrl) return false;
    if (!tab || tab.closed) {
        const opened = window.open(tabUrl, DESKTOP_TAB_NAME);
        return Boolean(opened && !opened.closed);
    }
    try {
        const href = tab.location.href;
        if (!href || href === 'about:blank' || href === 'about:blank/') {
            tab.location.href = tabUrl;
        }
        tab.focus();
        return true;
    } catch {
        tab.focus();
        return true;
    }
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
    const searchVisible = useAtomValue(jotaiChatSearchVisible);
    const searchBarRef = useRef<HTMLDivElement>(null);
    const [searchBarHeight, setSearchBarHeight] = useState(0);

    // const [chatLlmFooterHeight, setChatLlmFooterHeight] = useAtom(jotaiChatLlmFooterHeight);

    // useState - old
    const [messages, setMessages] = useState<tsMessageItem[]>([]);
    const [refreshRandomNum, setRefreshRandomNum] = useState(0);
    const [answerEngineKind, setAnswerEngineKind] = useState<'none' | 'agent' | 'agentOpencode'>('none');
    const [agentRemoteActivePoll, setAgentRemoteActivePoll] = useState(false);
    const [agentPollSnapshot, setAgentPollSnapshot] = useState<AgentPollingResponse | null>(null);
    const [opencodeInstances, setOpencodeInstances] = useState<AgentOpencodeInstanceSummary[]>([]);
    const [opencodeLatestStatus, setOpencodeLatestStatus] = useState<string | null>(null);
    const [opencodeLatestStep, setOpencodeLatestStep] = useState<string>('');
    const [opencodeSessionId, setOpencodeSessionId] = useState<string>('');
    const opencodeIsPending = opencodeLatestStatus === 'pending';
    const opencodeStream = useAgentOpencodeStream(threadId, answerEngineKind === 'agentOpencode' && opencodeIsPending);
    const [selectedAgentInstanceId, setSelectedAgentInstanceId] = useState<string | null>(null);
    const selectedAgentInstanceIdRef = useRef<string | null>(null);
    selectedAgentInstanceIdRef.current = selectedAgentInstanceId;
    const [showShellFilesModal, setShowShellFilesModal] = useState(false);
    const [shellFilesInitialPath, setShellFilesInitialPath] = useState<string | undefined>();
    const [openingOpencodeSession, setOpeningOpencodeSession] = useState(false);
    const [sessionCopied, setSessionCopied] = useState(false);
    const [opencodeCustomUrl, setOpencodeCustomUrl] = useState<string>('');
    const [opencodeCustomUsername, setOpencodeCustomUsername] = useState<string>('opencode');
    const [hasMore, setHasMore] = useState(false);
    const [currentLimit, setCurrentLimit] = useState(LIMIT_MESSAGES);
    const [totalCount, setTotalCount] = useState(0);
    const [messageSearch, setMessageSearch] = useState('');

    const messagesRef = useRef(messages);
    messagesRef.current = messages;

    const filteredMessages = useMemo(() => {
        if (!messageSearch.trim()) {
            return messages;
        }
        const q = messageSearch.trim().toLowerCase();
        return messages.filter((m) => {
            const c = String(m.content || '').toLowerCase();
            return c.includes(q);
        });
    }, [messages, messageSearch]);

    const messageChunksRender = useMemo(() => chunkMessagesForChatRender(filteredMessages), [filteredMessages]);

    const cancelLatestAgentEligible =
        answerEngineKind === 'agent' && agentRemoteActivePoll;

    const refreshChatMessages = useCallback(() => {
        setRefreshRandomNum(Math.floor(Math.random() * 1_000_000));
    }, []);

    const handleCancelLatestAgentRun = useCallback(async () => {
        try {
            await cancelAgentRunByThreadId(threadId);
            toast.success('Agent cancelled.');
            setAgentRemoteActivePoll(false);
            refreshChatMessages();
            // Final failed message is written server-side; refresh again shortly
            window.setTimeout(() => {
                refreshChatMessages();
            }, 600);
        } catch (err) {
            console.error(err);
            toast.error('Could not cancel agent. Try refreshing the thread.');
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

    useEffect(() => {
        const el = searchBarRef.current;
        if (!el) {
            setSearchBarHeight(0);
            return;
        }
        if (!searchVisible) {
            setSearchBarHeight(0);
            return;
        }
        const update = () => {
            const r = el.getBoundingClientRect();
            setSearchBarHeight(r.height);
        };
        update();
        const ro = new ResizeObserver(() => update());
        ro.observe(el);
        return () => ro.disconnect();
      }, [searchVisible]);
      

    // useEffect

    // Reset pagination state when thread changes
    useEffect(() => {
        setCurrentLimit(LIMIT_MESSAGES);
        setTotalCount(0);
        setHasMore(true);
        setAgentRemoteActivePoll(false);
        setAgentPollSnapshot(null);
        setOpencodeInstances([]);
        setOpencodeLatestStatus(null);
        setOpencodeLatestStep('');
        setOpencodeSessionId('');
        setSelectedAgentInstanceId(null);
        useEffectOneTimeMessagesScrollDownRef.current = false;
    }, [threadId])

    // Fetch custom opencode url (Agent Workspace -> Opencode) to render Open session as a direct link
    useEffect(() => {
        const fetchOpencode = async () => {
            try {
                const res = await axiosCustom.get('/api/user/api-keys/getUserApiAgentWorkspace', { withCredentials: true });
                if (typeof res.data?.opencodeUrl === 'string' && res.data.opencodeUrl.trim()) {
                    setOpencodeCustomUrl(res.data.opencodeUrl.trim().replace(/\/+$/, ''));
                } else {
                    setOpencodeCustomUrl('');
                }
                if (typeof res.data?.opencodeUsername === 'string' && res.data.opencodeUsername.trim()) {
                    setOpencodeCustomUsername(res.data.opencodeUsername.trim());
                }
            } catch {
                setOpencodeCustomUrl('');
            }
        };
        void fetchOpencode();
    }, []);

    const opencodeDirectLink = useMemo(() => {
        if (!opencodeCustomUrl) return '';
        const base = opencodeCustomUrl.replace(/\/+$/, '');
        try {
            const b64 = typeof window !== 'undefined' && typeof window.btoa === 'function'
                ? window.btoa(base).replace(/=+$/, '')
                : Buffer.from(base).toString('base64').replace(/=+$/, '');
            if (opencodeSessionId) return `${base}/server/${b64}/session/${opencodeSessionId}`;
            return `${base}/`;
        } catch {
            return base;
        }
    }, [opencodeCustomUrl, opencodeSessionId]);

    useEffect(() => {
        setRefreshRandomNum(
            Math.floor(
                Math.random() * 1_000_000
            )
        )
    }, [refreshRandomNumParent])

    // Check if Agent is enabled for this thread
    useEffect(() => {
        const checkAnswerEngine = async () => {
            try {
                const responseThread = await axiosCustom.post(
                    '/api/chat-llm/threads-crud/threadsGet', {
                    threadId: threadId,
                }
                );
                if (responseThread.data && responseThread.data.docs && responseThread.data.docs.length > 0) {
                    const threadInfo = responseThread.data.docs[0];
                    const eng = threadInfo.answerEngine;
                    if (eng === 'agent') {
                        setAnswerEngineKind('agent');
                    } else if (eng === 'agentOpencode') {
                        setAnswerEngineKind('agentOpencode');
                    } else {
                        setAnswerEngineKind('none');
                    }
                } else {
                    setAnswerEngineKind('none');
                }
            } catch (error) {
                console.error('Error checking answer engine status:', error);
            }
        };

        if (threadId) {
            checkAnswerEngine();
        }
    }, [threadId, refreshRandomNum])

    /** Agent: poll status + refresh chat while the background loop is running. */
    useEffect(() => {
        if (!threadId || answerEngineKind !== 'agent') {
            return;
        }
        let cancelled = false;
        let wasActive = false;
        const tick = async () => {
            try {
                const r = await pollAgentStatus(threadId, {
                    agentInstanceId: selectedAgentInstanceIdRef.current,
                });
                if (!cancelled) {
                    const latestInstance = r.instances?.[0];
                    const pendingLatest = latestInstance?.status === 'pending';
                    if (pendingLatest && selectedAgentInstanceIdRef.current !== latestInstance.id) {
                        setSelectedAgentInstanceId(latestInstance.id);
                    } else if (!selectedAgentInstanceIdRef.current && r.agentInstanceId) {
                        setSelectedAgentInstanceId(r.agentInstanceId);
                    }
                    const active =
                        agentPollIndicatesActive(r) ||
                        Boolean(r.instances?.some((item) => item.status === 'pending'));
                    setAgentRemoteActivePoll(active);
                    setAgentPollSnapshot(r);
                    if (active) {
                        wasActive = true;
                        setRefreshRandomNum(Math.floor(Math.random() * 1_000_000));
                    } else if (wasActive) {
                        // One more refresh when the run ends so the final message appears
                        wasActive = false;
                        setRefreshRandomNum(Math.floor(Math.random() * 1_000_000));
                    }
                }
            } catch {
                /* ignore */
            }
        };
        void tick();
        const id = setInterval(tick, AGENT_PIPELINE_REFRESH_MS);
        return () => {
            cancelled = true;
            clearInterval(id);
        };
    }, [threadId, answerEngineKind]);

    /** Agent (Opencode): refresh chat while workspace files are being initialized. */
    useEffect(() => {
        if (!threadId || answerEngineKind !== 'agentOpencode') {
            return;
        }
        let cancelled = false;
        let wasPending = false;
        const tick = async () => {
            try {
                const res = await fetchAgentOpencodeStatus(threadId);
                if (cancelled) {
                    return;
                }
                setOpencodeInstances(res.instances);
                setOpencodeLatestStatus(res.status);
                setOpencodeLatestStep(res.pipelineStep || '');
                setOpencodeSessionId(res.opencodeSessionId || '');
                const status = res.status;
                if (status === 'pending') {
                    wasPending = true;
                    setRefreshRandomNum(Math.floor(Math.random() * 1_000_000));
                } else if (wasPending) {
                    wasPending = false;
                    setRefreshRandomNum(Math.floor(Math.random() * 1_000_000));
                }
            } catch {
                /* ignore */
            }
        };
        void tick();
        const id = setInterval(tick, AGENT_PIPELINE_REFRESH_MS);
        return () => {
            cancelled = true;
            clearInterval(id);
        };
    }, [threadId, answerEngineKind]);

    // functions
    const getCssHeightForMessages = () => {
        let returnHeight = 0;
        returnHeight = 60; // header height
        returnHeight += chatLlmFooterHeight;
        if (searchVisible) {
            returnHeight += searchBarHeight;
        }
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
            const dataPayload: Record<string, unknown> = {
                threadId: threadId,
                limit: Math.max(LIMIT_MESSAGES, currentLimit),
                testing: {
                    mode: mode,
                },
            };
            if (messageSearch.trim()) {
                dataPayload.search = messageSearch.trim().slice(0, 120);
            }
            const config = {
                method: 'post',
                url: `/api/chat-llm/crud/notesGet`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: dataPayload,
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
            axiosCancelTokenSource.cancel('Operation canceled by the user.');
        };
    }, [
        refreshRandomNum,
        threadId,
        currentLimit,
        messageSearch,
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

    const openShellFiles = useCallback((relativePath?: string) => {
        setShellFilesInitialPath(relativePath?.trim() || undefined);
        setShowShellFilesModal(true);
    }, []);

    const handleOpenOpencodeSession = useCallback(async () => {
        if (!threadId || openingOpencodeSession) return;
        const desktopTab = openDesktopTabOnClick();
        // Pre-open opencode tab to avoid popup blocker (will navigate later)
        const opencodeTab = window.open('', 'opencode-web') as Window | null;
        setOpeningOpencodeSession(true);
        const openReq = openAgentOpencodeSession(threadId);
        try {
            const desktopRes = await axiosCustom.get('/api/chat-llm/libreoffice/desktop');
            const tabUrl =
                (typeof desktopRes.data?.desktopAuthUrl === 'string' && desktopRes.data.desktopAuthUrl) ||
                (typeof desktopRes.data?.desktopUrl === 'string' && desktopRes.data.desktopUrl) ||
                '';
            const tabOpened = navigateDesktopTab(desktopTab, tabUrl);
            if (!tabOpened && tabUrl) {
                toast.error('Pop-up blocked. Allow pop-ups for this site, then click Open session again.');
            }
        } catch (desktopErr) {
            console.error('Agent Workspace desktop tab error:', desktopErr);
            toast.error('Could not open the virtual computer in a new tab');
            if (desktopTab && !desktopTab.closed) {
                try {
                    const href = desktopTab.location.href;
                    if (!href || href === 'about:blank' || href === 'about:blank/') {
                        desktopTab.close();
                    }
                } catch {
                    /* already on desktop */
                }
            }
        }
        try {
            const opened = await openReq;
            toast.success(
                opened.sessionId
                    ? 'Opened the OpenCode session on the virtual computer'
                    : 'Opened OpenCode on the virtual computer'
            );
            // Open Opencode web UI in browser: http://localhost:4096/server/<base64>/session/<id>
            // aHR0cDovL2xvY2FsaG9zdDo0MDk2 is base64 of http://localhost:4096 (no padding)
            const webUrl =
                opened.webUrl ||
                opened.opencodeWebUrl ||
                (opened.sessionId
                    ? `http://localhost:4096/server/aHR0cDovL2xvY2FsaG9zdDo0MDk2/session/${opened.sessionId}`
                    : 'http://localhost:4096/');
            // Try to navigate the pre-opened tab, fallback to window.open
            let openedWeb = false;
            if (opencodeTab && !opencodeTab.closed) {
                try {
                    opencodeTab.location.href = webUrl;
                    opencodeTab.focus();
                    openedWeb = true;
                } catch {
                    openedWeb = false;
                }
            }
            if (!openedWeb) {
                const w = window.open(webUrl, 'opencode-web');
                if (!w) {
                    toast.error('Pop-up blocked for Opencode web UI. Allow pop-ups and try again.');
                }
            }
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            toast.error(axiosErr?.response?.data?.message || 'Could not open the OpenCode session');
            if (opencodeTab && !opencodeTab.closed) {
                try {
                    opencodeTab.close();
                } catch {}
            }
        } finally {
            setOpeningOpencodeSession(false);
        }
    }, [threadId, openingOpencodeSession]);

    return (
        <div className="relative min-h-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(45,212,191,0.08),transparent_50%),radial-gradient(ellipse_80%_50%_at_100%_50%,rgba(139,92,246,0.05),transparent_45%),linear-gradient(to_bottom,#09090b_0%,#18181b_100%)]">
            {searchVisible && (
                <div ref={searchBarRef} className="sticky top-0 z-10 flex items-center gap-2 border-b border-zinc-800 bg-zinc-950/90 px-3 py-2 backdrop-blur">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                        <DebounceInput
                            debounceTimeout={350}
                            value={messageSearch}
                            aria-label="Search within messages"
                            placeholder="Search within messages (server regex)"
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 py-1.5 pl-8 pr-7 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-teal-500/40 focus:outline-none focus:ring-1 focus:ring-teal-500/20"
                            onChange={(e) => {
                                setMessageSearch(e.target.value);
                            }}
                        />
                        {messageSearch && (
                            <button
                                type="button"
                                aria-label="Clear message search"
                                onClick={() => {
                                    setMessageSearch('');
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                    {messageSearch && (
                        <span className="text-[11px] text-zinc-500">{filteredMessages.length}/{messages.length} matches</span>
                    )}
                </div>
            )}
            <div
                ref={messagesContainerRef}
                onDragOver={handleMessagesDragOver}
                onDrop={handleMessagesDrop}
                className="[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                style={{
                    height: `${getCssHeightForMessages()}`,
                    overflowY: 'scroll',
                    scrollbarWidth: 'none',
                } as React.CSSProperties}
            >
                <div className="flex min-h-0 w-full">
                    <div className="mx-auto flex min-h-0 min-w-0 w-full max-w-3xl flex-1 flex-col px-2 sm:px-4">

                        <div id="messagesScrollUp" />

                        <div>
                            {loading === false && filteredMessages.length === 0 && !messageSearch && messages.length === 0 && (
                                <div className="px-1 py-8 sm:py-12">
                                    <div className="rounded-2xl border border-zinc-700/80 bg-zinc-900/80 px-6 py-12 text-center shadow-lg shadow-zinc-900/5 ring-1 ring-zinc-700/60 backdrop-blur-sm">
                                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/15 to-violet-500/15 text-2xl ring-1 ring-teal-500/20">
                                            💬
                                        </div>
                                        <h3 className="mb-2 text-base font-semibold tracking-tight text-zinc-100">
                                            Start a conversation
                                        </h3>
                                        <p className="mx-auto max-w-sm text-sm leading-relaxed text-zinc-500">
                                            Send a message below. You can attach files, paste images, or use voice from the toolbar.
                                        </p>
                                    </div>
                                    <ThreadSettingInline threadId={threadId} />
                                </div>
                            )}
                            {loading === false && filteredMessages.length === 0 && messageSearch && messages.length > 0 && (
                                <div className="px-1 py-6">
                                    <div className="rounded-xl border border-zinc-700/80 bg-zinc-900/60 px-4 py-6 text-center text-sm text-zinc-400">
                                        No messages match “{messageSearch}”.
                                        <button type="button" aria-label="Clear message search filter" onClick={() => { setMessageSearch(''); }} className="ml-2 text-teal-400 hover:underline">Clear</button>
                                    </div>
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
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-teal-600" />
                                        <span className="ml-2 text-xs text-zinc-400">Loading older messages…</span>
                                    </div>
                                )}
                            </div>
                        )}


                        {/* section render messages */}
                        <div className="w-full min-w-0">
                            {messageChunksRender.map((chunk) => {
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

                        {/* Computer Screen - new section above Agent */}
                        <div className="mb-2 mt-2 rounded-xl border border-zinc-700/60 bg-zinc-900/40 px-2 py-2">
                            <ComponentComputerScreen />
                        </div>

                        {answerEngineKind === 'agentOpencode' && (
                            <div className="mb-2 mt-2 max-h-[min(32rem,calc(100dvh-11rem))] w-full min-w-0 overflow-y-auto overscroll-contain rounded-xl border border-cyan-200/60 bg-gradient-to-br from-zinc-900 via-zinc-900 to-cyan-950/40 px-2 py-2 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-cyan-800/50 sm:max-h-[min(28rem,calc(100vh-14rem))] sm:px-3 sm:py-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1 text-[11px] leading-tight text-zinc-200">
                                        <span className="font-semibold tracking-tight text-cyan-300">
                                            Agent (Opencode)
                                        </span>
                                        {opencodeLatestStatus ? (
                                            <span className="rounded-full bg-cyan-900/40 px-1.5 py-0.5 text-[10px] font-medium capitalize text-cyan-300 sm:text-[9px] sm:py-px">
                                                {opencodeLatestStatus === 'filesInitialized'
                                                    ? 'done'
                                                    : opencodeLatestStatus}
                                            </span>
                                        ) : null}
                                        {opencodeLatestStep ? (
                                            <span className="rounded-full bg-sky-900/40 px-1.5 py-0.5 text-[10px] font-medium text-sky-300 sm:text-[9px] sm:py-px">
                                                {opencodeLatestStep}
                                            </span>
                                        ) : null}
                                        <span className="text-[10px] tabular-nums text-zinc-500">
                                            input → settings → opencode → output
                                        </span>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1.5">
                                        {opencodeDirectLink ? (
                                            <a
                                                href={opencodeDirectLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title={opencodeCustomUrl ? `Open Opencode at ${opencodeCustomUrl} as ${opencodeCustomUsername || 'opencode'}` : 'Open this OpenCode session on the virtual computer'}
                                                className="flex min-h-8 items-center gap-1 rounded-md border border-cyan-200/80 bg-zinc-900/80 px-2 py-1 text-[11px] font-medium text-cyan-300 shadow-sm transition hover:bg-cyan-950/40 sm:min-h-0 sm:px-1.5 sm:py-0.5 sm:text-[10px]"
                                            >
                                                <Monitor className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
                                                Open session
                                            </a>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => void handleOpenOpencodeSession()}
                                                disabled={openingOpencodeSession}
                                                title="Open this OpenCode session on the virtual computer"
                                                className="flex min-h-8 items-center gap-1 rounded-md border border-cyan-200/80 bg-zinc-900/80 px-2 py-1 text-[11px] font-medium text-cyan-300 shadow-sm transition hover:bg-cyan-950/40 disabled:opacity-50 sm:min-h-0 sm:px-1.5 sm:py-0.5 sm:text-[10px]"
                                            >
                                                {openingOpencodeSession ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin sm:h-3 sm:w-3" />
                                                ) : (
                                                    <Monitor className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
                                                )}
                                                Open session
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => openShellFiles()}
                                            className="flex min-h-8 items-center gap-1 rounded-md border border-cyan-200/80 bg-zinc-900/80 px-2 py-1 text-[11px] font-medium text-cyan-300 shadow-sm transition hover:bg-cyan-950/40 sm:min-h-0 sm:px-1.5 sm:py-0.5 sm:text-[10px]"
                                        >
                                            <HardDrive className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
                                            Files
                                        </button>
                                    </div>
                                </div>
                                {opencodeSessionId ? (
                                    <div className="mt-1.5 flex items-center gap-1.5 rounded-md bg-zinc-950/70 px-1.5 py-1 text-[10px] ring-1 ring-zinc-800">
                                        <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wide text-zinc-500">
                                            Session
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const url = `http://localhost:4096/server/aHR0cDovL2xvY2FsaG9zdDo0MDk2/session/${opencodeSessionId}`;
                                                window.open(url, '_blank', 'noopener,noreferrer');
                                            }}
                                            className="min-w-0 flex-1 break-all text-left font-mono text-[10px] leading-snug text-cyan-200/90 hover:text-cyan-300 hover:underline sm:text-[9px]"
                                            title="Open Opencode web UI: http://localhost:4096/server/aHR0cDovL2xvY2FsaG9zdDo0MDk2/session/... (aHR0cDovL2xvY2FsaG9zdDo0MDk2 = base64 of http://localhost:4096)"
                                        >
                                            {opencodeSessionId}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                try {
                                                    await navigator.clipboard.writeText(opencodeSessionId);
                                                    setSessionCopied(true);
                                                    window.setTimeout(() => setSessionCopied(false), 1500);
                                                    toast.success('Session ID copied');
                                                } catch {
                                                    toast.error('Could not copy session ID');
                                                }
                                            }}
                                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-800 hover:text-cyan-300 sm:h-5 sm:w-5"
                                            title="Copy session ID"
                                            aria-label="Copy session ID"
                                        >
                                            {sessionCopied ? (
                                                <Check className="h-3 w-3 text-emerald-400" />
                                            ) : (
                                                <Copy className="h-3 w-3" />
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const url = `http://localhost:4096/server/aHR0cDovL2xvY2FsaG9zdDo0MDk2/session/${opencodeSessionId}`;
                                                window.open(url, '_blank', 'noopener,noreferrer');
                                            }}
                                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-800 hover:text-cyan-300 sm:h-5 sm:w-5"
                                            title="Open in Opencode web UI (http://localhost:4096/server/aHR0...)"
                                        >
                                            <Monitor className="h-3 w-3" />
                                        </button>
                                    </div>
                                ) : null}
                                {(opencodeIsPending || opencodeStream.content) && (
                                    <div className="mt-2 rounded-lg border border-cyan-800/50 bg-zinc-950/70 px-2 py-2 ring-1 ring-cyan-900/30">
                                        <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-cyan-400">
                                            <span className={`h-2 w-2 rounded-full ${opencodeStream.isStreaming ? 'animate-pulse bg-emerald-400' : 'bg-zinc-600'}`} />
                                            Live — opencode session export (every 1s) + ANSWER.md
                                            {opencodeStream.isStreaming && <span className="font-normal normal-case text-zinc-500">streaming…</span>}
                                            {!opencodeStream.isStreaming && opencodeStream.content && <span className="font-normal normal-case text-zinc-500">final</span>}
                                        </div>
                                        {opencodeStream.error && (
                                            <div className="mb-1 rounded bg-red-950/40 px-1.5 py-1 text-[10px] text-red-300">
                                                Stream error: {opencodeStream.error}
                                            </div>
                                        )}
                                        <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words rounded bg-zinc-900/80 px-2 py-2 text-[11px] leading-relaxed text-zinc-200 ring-1 ring-zinc-800">
                                            {opencodeStream.content || (opencodeIsPending ? 'Waiting for agent to write ANSWER.md…' : '')}
                                        </pre>
                                        <div className="mt-1 text-[9px] text-zinc-500">
                                            Thread: {threadId.slice(0, 8)}… • {opencodeStream.status || opencodeLatestStatus || '—'} • {opencodeStream.pipelineStep || opencodeLatestStep || '—'}
                                        </div>
                                    </div>
                                )}
                                <ComponentAgentOpencodeInstanceList
                                    threadId={threadId}
                                    refreshKey={refreshRandomNum}
                                    snapshotInstances={opencodeInstances}
                                    onOpenFiles={openShellFiles}
                                />
                            </div>
                        )}
                        {answerEngineKind === 'agent' && agentPollSnapshot && (
                            <div className="mb-2 mt-2 max-h-[min(32rem,calc(100dvh-11rem))] w-full min-w-0 overflow-y-auto overscroll-contain rounded-xl border border-teal-200/60 bg-gradient-to-br from-zinc-900 via-zinc-900 to-teal-950/40 px-2 py-2 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-teal-800/50 sm:max-h-[min(28rem,calc(100vh-14rem))] sm:px-3 sm:py-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1 text-[11px] leading-tight text-zinc-200">
                                        <span className="font-semibold tracking-tight text-teal-300">Agent</span>
                                        <span className="rounded-full bg-teal-900/40 px-1.5 py-0.5 text-[10px] font-medium capitalize text-teal-300 sm:text-[9px] sm:py-px">
                                            {agentPollSnapshot.status}
                                        </span>
                                        {agentPollSnapshot.brainStep && (
                                            <span className="rounded-full bg-sky-900/40 px-1.5 py-0.5 text-[10px] font-medium text-sky-300 sm:text-[9px] sm:py-px">
                                                {agentPollSnapshot.brainStep}
                                            </span>
                                        )}
                                        <span className="text-[10px] tabular-nums text-zinc-500">
                                            tick {agentPollSnapshot.tickCount}
                                            {' · '}
                                            mem {agentPollSnapshot.memoryCount}
                                        </span>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => openShellFiles()}
                                            className="flex min-h-8 items-center gap-1 rounded-md border border-teal-200/80 bg-zinc-900/80 px-2 py-1 text-[11px] font-medium text-teal-300 shadow-sm transition hover:bg-teal-950/40 sm:min-h-0 sm:px-1.5 sm:py-0.5 sm:text-[10px]"
                                        >
                                            <HardDrive className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
                                            Files
                                        </button>
                                        {cancelLatestAgentEligible && (
                                            <button
                                                type="button"
                                                onClick={() => void handleCancelLatestAgentRun()}
                                                className="min-h-8 rounded-md border border-zinc-700 bg-zinc-900/80 px-2 py-1 text-[11px] text-zinc-400 shadow-sm transition hover:bg-zinc-800 sm:min-h-0 sm:px-1.5 sm:py-0.5 sm:text-[10px]"
                                            >
                                                Stop
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <ComponentAgentInstanceList
                                    threadId={threadId}
                                    refreshKey={refreshRandomNum}
                                    snapshot={agentPollSnapshot}
                                />
                            </div>
                        )}

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

            <ComponentShellFilesExplorerModal
                isOpen={showShellFilesModal}
                onClose={() => {
                    setShowShellFilesModal(false);
                    setShellFilesInitialPath(undefined);
                }}
                threadId={threadId}
                workspaceKind={answerEngineKind === 'agentOpencode' ? 'agentOpencode' : 'agent'}
                initialPath={shellFilesInitialPath}
            />
        </div>
    )
};

export default CRightChatById;