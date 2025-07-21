
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

export const handleAutoSelectContextNotes = async ({
    threadId,
}: {
    threadId: string;
}) => {
    const toastLoadingId = toast.loading('Auto selecting context notes');
    try {
        await axiosCustom.post("/api/chat-llm/threads-context-crud/contextSelectAutoContextNotes", {
            threadId: threadId,
        });

        toast.success('Context selected successfully!');
    } catch (error) {
        console.error(error);
        toast.error('Error auto selecting context. Please try again.');
    } finally {
        toast.dismiss(toastLoadingId);
    }
}

export const handleAutoSelectContextTasks = async ({
    threadId,
}: {
    threadId: string;
}) => {
    const toastLoadingId = toast.loading('Auto selecting context tasks');
    try {
        await axiosCustom.post("/api/chat-llm/threads-context-crud/contextSelectAutoContextTasks", {
            threadId: threadId,
        });

        toast.success('Context selected successfully!');
    } catch (error) {
        console.error(error);
        toast.error('Error auto selecting context. Please try again.');
    } finally {
        toast.dismiss(toastLoadingId);
    }
}

export const handleAutoSelectContextFirstMessage = async ({
    threadId,
    messageCount,
}: {
    threadId: string;
    messageCount: 1 | 2;
}) => {
    const toastLoadingId = toast.loading('Auto selecting context...');
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

        // messageCount = 1, then it is a text message, then select context
        // messageCount = 2, then it is a image or audio, then select context

        console.log('notes', notes.length, 'messageCount', messageCount);

        if (notes.length === messageCount) {
            // select context
            const resultNotesPromise = handleAutoSelectContextNotes({
                threadId: threadId,
            })
    
            const resultTasksPromise = handleAutoSelectContextTasks({
                threadId: threadId,
            })

            await Promise.all([resultNotesPromise, resultTasksPromise]);
        }

        toast.success('Context selected successfully!');
    } catch (error) {
        console.error(error);
        toast.error('Error auto selecting context. Please try again.');
    } finally {
        toast.dismiss(toastLoadingId);
    }
}