
import toast from "react-hot-toast";
import axiosCustom from "../../../../../config/axiosCustom";
import { AxiosRequestConfig } from "axios";

export const chatLlmThreadAddAxios = async () => {
    try {
        const result = await axiosCustom.post('/api/chat-llm/threads-crud/threadsAdd');

        const tempThreadId = result?.data?.thread?._id;

        let recordId = '';

        if (tempThreadId) {
            if (typeof tempThreadId === 'string') {
                recordId = tempThreadId;
            }
        }

        if (recordId !== '') {
            return {
                success: 'Success',
                error: '',
                recordId: recordId,
            };
        }

        return {
            success: '',
            error: 'An error occurred while adding the chatLlmThread. Please try again.',
            recordId: '',
        };
    } catch (error) {
        console.error(error);
        alert('An error occurred while adding the chatLlmThread. Please try again.');
        return {
            success: false,
            error: 'An error occurred while adding the chatLlmThread. Please try again.',
            recordId: '',
        };
    }
}

export const handleAutoSelectContext = async ({
    threadId,
}: {
    threadId: string;
}) => {
    const startTime = new Date().valueOf();
    const toastLoadingId = toast.loading('Auto selecting context. It may take around 15 seconds...');
    try {
        await axiosCustom.post("/api/chat-llm/threads-context-crud/contextSelectAutoContext", {
            threadId: threadId,
        });

        const endTime = new Date().valueOf();
        const duration = endTime - startTime;
        console.log('duration', duration);

        toast.success(
            `Context selected successfully! It took ${parseFloat((duration/1000).toString()).toFixed(2)} seconds.`,
            {
                duration: 3000,
            }
        );
    } catch (error) {
        console.error(error);
        toast.error('Error auto selecting context. Please try again.');
    } finally {
        toast.dismiss(toastLoadingId);
    }
}

export const handleAutoSelectContextFirstMessage = async ({
    threadId,
}: {
    threadId: string;
}) => {
    
    try {

        // check if thread is exist
        let shouldCallContext = true;

        const responseThread = await axiosCustom.post(
            '/api/chat-llm/threads-crud/threadsGet', {
                threadId: threadId,
            }
        );
        if (responseThread.data && responseThread.data.docs) {
            if (responseThread.data.docs.length > 0) {
                const threadInfo = responseThread.data.docs[0];
                if (
                    typeof threadInfo.isAutoAiContextSelectEnabled === 'boolean' &&
                    threadInfo.isAutoAiContextSelectEnabled === false
                ) {
                    shouldCallContext = false;
                }
            }
        }

        // if shouldCallContext is false, then return
        if (shouldCallContext === false) {
            return;
        }

        // get thread, if message length > 0, then select context
        const config = {
            method: 'post',
            url: `/api/chat-llm/crud/notesGet`,
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                threadId: threadId,
            },
        } as AxiosRequestConfig;

        const response = await axiosCustom.request(config);
        const notes = response.data.docs;

        console.log('notes', notes.length);

        // select context
        await handleAutoSelectContext({
            threadId: threadId,
        })

        toast.success('Context selected successfully!');
    } catch (error) {
        console.error(error);
        toast.error('Error auto selecting context. Please try again.');
    }
}