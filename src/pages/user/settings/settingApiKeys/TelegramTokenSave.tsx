import { useState } from 'react';
import { useSetAtom } from 'jotai';

import type { AuthState } from '../../../../jotai/stateJotaiAuth';
import { stateJotaiAuthReloadAtom } from '../../../../jotai/stateJotaiAuth';
import axiosCustom from "../../../../config/axiosCustom";

type TelegramTokenSaveProps = {
    telegramBotToken: string;
    onTelegramBotTokenChange: (value: string) => void;
    authState: AuthState;
    onBotTokenVerified: () => void;
    /** When true, Save is blocked (e.g. parent busy with other Telegram requests) */
    disabled?: boolean;
};

const TelegramTokenSave = ({
    telegramBotToken,
    onTelegramBotTokenChange,
    authState,
    onBotTokenVerified,
    disabled = false,
}: TelegramTokenSaveProps) => {
    const [savingToken, setSavingToken] = useState(false);
    const [message, setMessage] = useState({ success: '', error: '' });
    const setAuthStateReload = useSetAtom(stateJotaiAuthReloadAtom);

    const busy = savingToken || disabled;

    const handleSaveBotToken = async () => {
        const t = telegramBotToken.trim();
        if (!t) {
            setMessage({ success: '', error: 'Paste your bot token first.' });
            return;
        }
        setSavingToken(true);
        setMessage({ success: '', error: '' });
        try {
            await axiosCustom.post(
                `/api/user/api-keys/telegramSaveBotToken`,
                { telegramBotToken: t },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true,
                }
            );
            setMessage({
                success:
                    'Bot token verified and saved. You can load conversations and finish setup below.',
                error: '',
            });
            onBotTokenVerified();
            setAuthStateReload(Math.floor(Math.random() * 1_000_000));
        } catch (error: unknown) {
            console.error('telegramSaveBotToken:', error);
            let errorStr = '';
            const err = error as { response?: { data?: { error?: string; message?: string } } };
            if (typeof err?.response?.data?.error === 'string') {
                errorStr = err.response.data.error;
            } else if (typeof err?.response?.data?.message === 'string') {
                errorStr = err.response.data.message;
            }
            setMessage({
                success: '',
                error: errorStr || 'Could not verify or save bot token.',
            });
        } finally {
            setSavingToken(false);
        }
    };

    return (
        <div className="mb-4">
            <div className="mb-4 rounded-sm border border-slate-200 bg-slate-50/90 p-3 text-sm text-gray-700">
                <p className="font-semibold text-gray-800 mb-2">Steps</p>
                <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
                    <li>
                        In Telegram, open{' '}
                        <a
                            href="https://t.me/BotFather"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                        >
                            BotFather
                        </a>
                        , run <code className="rounded bg-white px-1 text-xs border border-slate-200">/newbot</code>, and copy the <strong>bot token</strong>.
                    </li>
                    <li>
                        Paste the token here and click <strong>Save bot token</strong>. The server checks it with Telegram (<code className="text-xs">getMe</code>) and stores it for your account.
                    </li>
                    <li>
                        After the token is saved, use <strong>Load conversations</strong> and the rest of the options below to pick a chat and send a test message.
                    </li>
                </ol>
            </div>

            <div>
                <label htmlFor="telegramBotToken" className="block text-gray-700 font-bold mb-2">
                    Bot token
                    {authState.telegramValid ? (
                        <span className="inline-block bg-green-100 text-green-600 py-1 px-3 rounded-sm text-sm font-semibold ml-3">
                            Notifications configured
                        </span>
                    ) : (
                        <span className="inline-block bg-amber-100 text-amber-800 py-1 px-3 rounded-sm text-sm font-semibold ml-3">
                            Save token to continue
                        </span>
                    )}
                </label>
                <input
                    type="password"
                    id="telegramBotToken"
                    placeholder="From BotFather"
                    className="shadow appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={telegramBotToken}
                    onChange={(e) => onTelegramBotTokenChange(e.target.value)}
                    autoComplete="off"
                    disabled={busy}
                />
                {authState.telegramValid && (
                    <p className="mt-1 text-xs text-gray-500">
                        Notifications are fully configured. You can still rotate the token above and save again.
                    </p>
                )}
            </div>

            <div className="mt-3">
                <button
                    type="button"
                    onClick={handleSaveBotToken}
                    className="bg-emerald-600 text-white font-bold py-2 px-4 rounded-sm hover:bg-emerald-700 transition-colors duration-200 disabled:opacity-50"
                    disabled={busy || !telegramBotToken.trim()}
                    title="Verifies the token with Telegram and stores it on the server."
                >
                    {savingToken ? 'Saving…' : 'Save bot token'}
                </button>
            </div>

            {message.success !== '' && (
                <p className="mt-2 text-sm text-green-600">{message.success}</p>
            )}
            {message.error !== '' && (
                <p className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-sm px-2 py-1">{message.error}</p>
            )}
        </div>
    );
};

export default TelegramTokenSave;
