import Modal from "react-modal";
import ThreadSetting from "./ThreadSetting";
import useResponsiveScreen from "../../../../../../hooks/useResponsiveScreen";
import { screenList } from "../../../../../../hooks/useResponsiveScreen";
import { useAtom } from "jotai";
import { jotaiChatLlmThreadSetting } from "../../jotai/jotaiChatLlmThreadSetting";
import axiosCustom from "../../../../../../config/axiosCustom";
import { useEffect, useState } from "react";

const getModalStyles = (isMobile: boolean) => ({
    overlay: {
        backgroundColor: 'rgb(0 0 0 / 75%)',
        zIndex: 1000,
    },
    content: isMobile ? {
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        margin: '0',
        padding: '0',
        border: 'none',
        borderRadius: '0',
        background: 'white',
        overflow: 'hidden',
    } : {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: '90vw',
        maxWidth: '1200px',
        height: '85vh',
        maxHeight: '800px',
        border: 'none',
        borderRadius: '8px',
        background: 'transparent',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    },
});

const ThreadSettingWrapper = () => {

    const [doesThreadExist, setDoesThreadExist] = useState<boolean>(false);
    const [threadSetting, setThreadSetting] = useState<any>({
        _id: '',
        threadTitle: '',
        isAutoAiContextSelectEnabled: false,
        isPersonalContextEnabled: false,
    });

    const [
        chatLlmThreadSetting,
        setChatLlmThreadSetting,
    ] = useAtom(jotaiChatLlmThreadSetting);

    const screenWidth = useResponsiveScreen();

    function closeModal() {
        setChatLlmThreadSetting((prevProps) => {
            return {
                ...prevProps,
                isOpen: false,
            };
        });
    }

    const fetchChatThreads = async () => {
        try {
            const response = await axiosCustom.post(
                '/api/chat-llm/threads-crud/threadsGet', {
                    threadId: chatLlmThreadSetting.threadId,
                }
            );
            if (response.data && response.data.docs) {
                // Map API data to expected format
                if (response.data.docs.length > 0) {
                    setThreadSetting(response.data.docs[0]);
                    setDoesThreadExist(true);
                } else {
                    setDoesThreadExist(false);
                }
            }
        } catch (error) {
            console.error('Failed to fetch chat threads:', error);
        }
    };

    useEffect(() => {
        if (chatLlmThreadSetting.threadId) {
            fetchChatThreads();
        } else {
            setDoesThreadExist(false);
        }
    }, [chatLlmThreadSetting]);

    return (
        <div>
            <Modal
                isOpen={chatLlmThreadSetting.isOpen}
                onRequestClose={closeModal}
                style={getModalStyles(screenWidth === screenList.sm)}
                contentLabel="Thread Setting Modal"
                key={chatLlmThreadSetting.threadId}
            >
                <ThreadSetting
                    closeModal={closeModal}
                    threadSetting={threadSetting}
                    doesThreadExist={doesThreadExist}
                />
            </Modal>
        </div>
    );
};

export default ThreadSettingWrapper;