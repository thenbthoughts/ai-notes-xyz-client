import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import CRightChatById from "./CRightChatById";
import ComponentThreadAdd from "./ComponentThreadAdd";

const ComponentRightWrapper = ({
    stateDisplayAdd,
    refreshRandomNumParent,
}: {
    stateDisplayAdd: boolean;
    refreshRandomNumParent: number;
}) => {
    const location = useLocation();
    const [threadId, setThreadId] = useState('');

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
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
                <CRightChatById
                    key={threadId}
                    stateDisplayAdd={stateDisplayAdd}
                    threadId={threadId}
                    refreshRandomNumParent={refreshRandomNumParent}
                />
            )}
        </div>
    );
};

export default ComponentRightWrapper;