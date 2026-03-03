import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import CRightChatById from "./ThreadChatMessagesByThreadId/CRightChatById";
import ComponentThreadAdd from "./ThreadAdd/ComponentThreadAdd";
import TalkWithAiWrapper from "./TalkWithAi/TalkWithAiWrapper";

const ComponentRightWrapper = ({
    refreshRandomNumParent,
}: {
    refreshRandomNumParent: number;
}) => {
    const location = useLocation();
    const [threadId, setThreadId] = useState('');
    const [pageName, setPageName] = useState('' as 'talk' | 'chat');

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);

        let tempPageName = 'chat' as 'talk' | 'chat';
        const pageName = queryParams.get('page') || 'chat';
        if (pageName === 'talk') {
            tempPageName = 'talk';
        }
        setPageName(tempPageName);

        let tempThreadId = '';
        const chatId = queryParams.get('id') || '';
        if (chatId) {
            tempThreadId = chatId;
        }
        setThreadId(tempThreadId);
    }, [location.search]);

    return (
        <div>
            {threadId === '' ? (
                <ComponentThreadAdd />
            ) : (
                <div>
                    {pageName === 'talk' && (
                        <TalkWithAiWrapper
                            threadId={threadId}
                        />
                    )}
                    {pageName === 'chat' && (
                        <CRightChatById
                            key={threadId}
                            threadId={threadId}
                            refreshRandomNumParent={refreshRandomNumParent}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default ComponentRightWrapper;