
import axiosCustom from "../../../../../config/axiosCustom";

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