import { useState, useEffect } from "react";
import { useAtomValue } from "jotai";

import stateJotaiAuthAtom from '../../../../jotai/stateJotaiAuth';
import axiosCustom from "../../../../config/axiosCustom";
import TelegramTokenSave from "./TelegramTokenSave";
import TelegramConversationList from "./TelegramConversationList";

const TelegramSettings = () => {
    const authState = useAtomValue(stateJotaiAuthAtom);
    const [telegramBotToken, setTelegramBotToken] = useState("");
    const [hasTelegramBotTokenVerified, setHasTelegramBotTokenVerified] = useState(false);

    useEffect(() => {
        if (authState.telegramValid) {
            setHasTelegramBotTokenVerified(true);
        }
    }, [authState.telegramValid]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const response = await axiosCustom.post<{
                    hasTelegramBotToken?: boolean;
                }>(
                    `/api/user/api-keys/telegramGetCachedChats`,
                    {},
                    {
                        headers: { 'Content-Type': 'application/json' },
                        withCredentials: true,
                    }
                );
                if (cancelled) return;
                if (response.data.hasTelegramBotToken === true) {
                    setHasTelegramBotTokenVerified(true);
                }
            } catch {
                /* not logged in */
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="mb-4">
            <TelegramTokenSave
                telegramBotToken={telegramBotToken}
                onTelegramBotTokenChange={setTelegramBotToken}
                authState={authState}
                onBotTokenVerified={() => setHasTelegramBotTokenVerified(true)}
            />
            {hasTelegramBotTokenVerified ? (
                <TelegramConversationList
                    telegramBotToken={telegramBotToken}
                    authState={authState}
                    onTelegramCleared={() => setHasTelegramBotTokenVerified(false)}
                />
            ) : null}
        </div>
    );
};

export default TelegramSettings;
