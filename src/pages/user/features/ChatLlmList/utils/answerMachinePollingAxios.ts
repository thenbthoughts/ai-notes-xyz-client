import axiosCustom from '../../../../../config/axiosCustom';
import { AxiosRequestConfig } from 'axios';

export interface SubQuestionDetail {
    id: string;
    question: string;
    answer: string;
    status: 'pending' | 'answered' | 'error' | 'skipped';
    errorReason?: string;
}

export interface AnswerMachinePollingStatus {
    isProcessing: boolean;
    status: 'pending' | 'answered' | 'error' | 'not_started';
    subQuestionsStatus: {
        pending: number;
        answered: number;
        error: number;
        skipped: number;
        total: number;
    };
    subQuestions: SubQuestionDetail[];
    hasFinalAnswer: boolean;
    lastMessageIsAi: boolean;
}

export const pollAnswerMachineStatus = async (
    threadId: string
): Promise<AnswerMachinePollingStatus> => {
    try {
        const config: AxiosRequestConfig = {
            method: 'post',
            url: '/api/chat-llm/polling/answerMachineStatus',
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                threadId: threadId,
            },
        };

        const response = await axiosCustom.request(config);
        return response.data;
    } catch (error) {
        console.error('Error polling Answer Machine status:', error);
        throw error;
    }
};
