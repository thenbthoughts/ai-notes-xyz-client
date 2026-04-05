import { useState, useEffect } from 'react';
import { useSetAtom } from 'jotai';

import type { AuthState } from '../../../../jotai/stateJotaiAuth';
import { stateJotaiAuthReloadAtom } from '../../../../jotai/stateJotaiAuth';
import axiosCustom from "../../../../config/axiosCustom";
import { useApiKeyClear } from "./utils/useApiKeyClear";
import {
    type TelegramChatOption,
    chatOptionKey,
    parseChatOptionKey,
} from "./telegramSettingsShared";

type TelegramConversationListProps = {
    telegramBotToken: string;
    authState: AuthState;
    /** Called after Clear so the parent hides this block until token is saved again */
    onTelegramCleared: () => void;
};

const TelegramConversationList = ({
    telegramBotToken,
    authState,
    onTelegramCleared,
}: TelegramConversationListProps) => {
    const [chatOptions, setChatOptions] = useState([] as TelegramChatOption[]);
    const [selectedOptionKey, setSelectedOptionKey] = useState("");
    const [manualChatId, setManualChatId] = useState("");
    const [manualTopicId, setManualTopicId] = useState("");
    const [showManualChatId, setShowManualChatId] = useState(false);
    const [hasLoadedChatsOnce, setHasLoadedChatsOnce] = useState(false);

    const [loadingChats, setLoadingChats] = useState(false);
    const [requestTg, setRequestTg] = useState({
        loading: false,
        success: '',
        error: '',
    });

    const setAuthStateReload = useSetAtom(stateJotaiAuthReloadAtom);

    const { clearRequest, handleClearApiKey } = useApiKeyClear();

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const response = await axiosCustom.post<{
                    chats?: TelegramChatOption[];
                    savedChatId?: string;
                    savedMessageThreadId?: number | null;
                }>(
                    `/api/user/api-keys/telegramGetCachedChats`,
                    {},
                    {
                        headers: { 'Content-Type': 'application/json' },
                        withCredentials: true,
                    }
                );
                if (cancelled) return;
                const list = Array.isArray(response.data.chats)
                    ? response.data.chats
                    : [];
                if (list.length >= 1) {
                    setChatOptions(list);
                    setHasLoadedChatsOnce(true);
                }
                const saved = response.data.savedChatId?.trim() ?? '';
                const thr =
                    typeof response.data.savedMessageThreadId === 'number' &&
                    response.data.savedMessageThreadId > 0
                        ? response.data.savedMessageThreadId
                        : null;
                if (saved) {
                    const wantKey = `${saved}:::${thr ?? ''}`;
                    if (list.some((c) => chatOptionKey(c) === wantKey)) {
                        setSelectedOptionKey(wantKey);
                    }
                }
            } catch {
                /* ignore */
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const resolveDestinationForSave = () => {
        if (showManualChatId && manualChatId.trim().length >= 1) {
            const t = manualTopicId.trim();
            const n = t ? Number(t) : NaN;
            return {
                chatId: manualChatId.trim(),
                messageThreadId: !Number.isNaN(n) && n > 0 ? n : null,
            };
        }
        return parseChatOptionKey(selectedOptionKey);
    };

    const handleLoadChats = async () => {
        setRequestTg((r) => ({ ...r, error: '', success: '' }));
        setLoadingChats(true);
        setChatOptions([]);
        setSelectedOptionKey("");

        try {
            const response = await axiosCustom.post<{
                chats?: TelegramChatOption[];
                error?: string;
            }>(
                `/api/user/api-keys/telegramListRecentChats`,
                {},
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true,
                }
            );
            const list = Array.isArray(response.data.chats) ? response.data.chats : [];
            setChatOptions(list);
            setHasLoadedChatsOnce(true);
        } catch (error: unknown) {
            console.error('Error loading Telegram chats:', error);
            let errorStr = '';
            const err = error as { response?: { data?: { error?: string; message?: string } } };
            if (typeof err?.response?.data?.error === 'string') {
                errorStr = err.response.data.error;
            } else if (typeof err?.response?.data?.message === 'string') {
                errorStr = err.response.data.message;
            }
            setRequestTg((r) => ({
                ...r,
                error: errorStr || 'Could not load conversations.',
            }));
        } finally {
            setLoadingChats(false);
        }
    };

    const handleUpdateTelegram = async () => {
        const { chatId, messageThreadId } = resolveDestinationForSave();
        setRequestTg({ loading: true, success: '', error: '' });

        try {
            const tokenInField = telegramBotToken.trim();
            await axiosCustom.post(
                `/api/user/api-keys/updateUserApiTelegram`,
                {
                    ...(tokenInField ? { telegramBotToken: tokenInField } : {}),
                    useStoredToken: !tokenInField && authState.telegramValid,
                    telegramChatId: chatId,
                    telegramMessageThreadId: messageThreadId,
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true,
                }
            );
            setRequestTg({
                loading: false,
                success: 'Telegram verified and saved successfully!',
                error: '',
            });
        } catch (error: unknown) {
            console.error('Error updating Telegram:', error);
            let errorStr = '';
            const err = error as { response?: { data?: { error?: string; message?: string } } };
            if (typeof err?.response?.data?.error === 'string') {
                errorStr = err.response.data.error;
            } else if (typeof err?.response?.data?.message === 'string') {
                errorStr = err.response.data.message;
            }
            setRequestTg({
                loading: false,
                success: '',
                error: `Could not verify Telegram. ${errorStr || 'Please check bot token and chat.'}`,
            });
        } finally {
            setAuthStateReload(Math.floor(Math.random() * 1_000_000));
        }
    };

    const handleClearClick = async () => {
        const ok = await handleClearApiKey('telegram');
        if (ok) {
            onTelegramCleared();
        }
    };

    const busy = requestTg.loading || clearRequest.loading || loadingChats;
    const hasTokenSource =
        telegramBotToken.trim().length >= 1 || authState.telegramValid;
    const dest = resolveDestinationForSave();
    const canSave = hasTokenSource && dest.chatId.length >= 1;
    const canLoadConversations = authState.isLoggedIn !== 'false';

    return (
        <div className="mb-4 rounded-sm border border-slate-200 bg-white p-3 shadow-sm">
            <h3 className="text-base font-semibold text-gray-800 mb-2">Conversations &amp; delivery</h3>
            <p className="text-xs text-gray-600 mb-3">
                Bot token is verified. Load chats from Telegram (server uses your stored token), choose where to send notifications, then test and save.
            </p>

            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={handleLoadChats}
                    className="bg-slate-600 text-white font-bold py-2 px-4 rounded-sm hover:bg-slate-700 transition-colors duration-200 disabled:opacity-50"
                    disabled={busy || !canLoadConversations}
                    title="Fetches chats using the bot token stored for your account."
                >
                    {loadingChats ? 'Loading…' : 'Load conversations'}
                </button>
            </div>

            {chatOptions.length >= 1 && !showManualChatId && (
                <div className="mt-3">
                    <label htmlFor="telegramChatSelect" className="block text-gray-700 font-bold mb-2">
                        Send notifications to
                    </label>
                    <select
                        id="telegramChatSelect"
                        className="shadow border rounded-sm w-full py-2 px-3 text-gray-700 bg-white focus:outline-none focus:shadow-outline"
                        value={selectedOptionKey}
                        onChange={(e) => setSelectedOptionKey(e.target.value)}
                    >
                        <option value="">Choose a chat…</option>
                        {chatOptions.map((c) => (
                            <option key={chatOptionKey(c)} value={chatOptionKey(c)}>
                                {c.label}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {hasLoadedChatsOnce &&
                chatOptions.length === 0 &&
                !loadingChats &&
                !showManualChatId && (
                <p className="mt-2 text-sm text-gray-500">
                    No conversations found. Message your bot in Telegram (inside a forum topic if needed), then load again—or enter chat ID manually.
                </p>
            )}

            <div className="mt-3">
                <button
                    type="button"
                    onClick={() => {
                        setShowManualChatId((v) => !v);
                        if (!showManualChatId) {
                            setSelectedOptionKey('');
                        } else {
                            setManualChatId('');
                            setManualTopicId('');
                        }
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                    {showManualChatId ? 'Use list from Load conversations' : 'Enter chat ID manually'}
                </button>
            </div>

            {showManualChatId && (
                <div className="mt-2 space-y-2">
                    <div>
                        <label htmlFor="telegramChatIdManual" className="block text-gray-700 font-bold mb-2">
                            Chat ID
                        </label>
                        <input
                            type="text"
                            id="telegramChatIdManual"
                            placeholder="Supergroup / channel id (e.g. -100…)"
                            className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={manualChatId}
                            onChange={(e) => setManualChatId(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="telegramTopicIdManual" className="block text-gray-700 font-bold mb-2">
                            Topic ID (forum supergroups only)
                        </label>
                        <input
                            type="text"
                            id="telegramTopicIdManual"
                            inputMode="numeric"
                            placeholder="Leave empty for non-forum chats"
                            className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={manualTopicId}
                            onChange={(e) => setManualTopicId(e.target.value)}
                        />
                    </div>
                </div>
            )}

            <div className="mt-2">
                {(requestTg.loading || clearRequest.loading) && (
                    <p className="text-gray-500">Loading...</p>
                )}
                {!requestTg.loading && !clearRequest.loading && requestTg.success !== '' && (
                    <p className="text-green-500">{requestTg.success}</p>
                )}
                {!requestTg.loading && !clearRequest.loading && clearRequest.success !== '' && (
                    <p className="text-green-500">Telegram settings cleared successfully!</p>
                )}
                {!requestTg.loading && !clearRequest.loading && (requestTg.error !== '' || clearRequest.error !== '') && (
                    <p className="text-red-500 bg-red-100 p-1 rounded">{requestTg.error || clearRequest.error}</p>
                )}
            </div>

            <div className="mt-4 flex gap-2">
                <button
                    type="button"
                    onClick={handleUpdateTelegram}
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded-sm hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50"
                    disabled={busy || !canSave}
                >
                    Send test message and save
                </button>
                <button
                    type="button"
                    onClick={handleClearClick}
                    className="bg-red-500 text-white font-bold py-2 px-4 rounded-sm hover:bg-red-600 transition-colors duration-200"
                    disabled={busy}
                >
                    Clear
                </button>
            </div>
        </div>
    );
};

export default TelegramConversationList;
