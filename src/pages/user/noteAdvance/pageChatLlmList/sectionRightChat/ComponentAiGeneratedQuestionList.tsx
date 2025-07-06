import { useState } from 'react';
import axiosCustom from '../../../../../config/axiosCustom';
import toast from 'react-hot-toast';

const ComponentAiGeneratedQuestionList = ({
    threadId,
}: {
    threadId: string;
}) => {
    const [questions, setQuestions] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchQuestions = async () => {
        setLoading(true);
        const config = {
            method: 'post',
            url: '/api/chat-llm/ai-generated-next-questions/notesNextQuestionGenerateByLast30Conversation',
            data: {
                threadId,
            },
            headers: {
                'Content-Type': 'application/json',
            },
        };

        try {
            const response = await axiosCustom.request(config);
            if (response.data.success === "Success") {
                setQuestions(response.data.data.docs);
            } else {
                toast.error('Error fetching questions: ' + response.data.error);
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
            toast.error('Error fetching questions!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='py-3'>
            <div className='px-2'>
                <div className="bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-md inline-block w-full whitespace-pre-wrap">
                    <div className='text-center'>
                        <button onClick={fetchQuestions} className="mb-2 mt-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white p-2 rounded-lg shadow-lg hover:from-purple-600 hover:to-blue-700 transition duration-300 transform hover:scale-105">
                            Generate AI Question
                        </button>
                    </div>
                    {questions.length >= 1 && (
                        <div className='text-center'>
                            <p className="text-lg font-semibold mb-2">{questions.length} Questions Available</p>
                        </div>
                    )}
                    {loading ? (
                        <p className="text-gray-500 text-center font-semibold">Loading questions...</p>
                    ) : (
                        <ul className="overflow-auto max-h-[30vh]">
                            {questions.map((question, index) => (
                                <li key={index} className="mb-1 p-2 text-sm bg-gray-200">
                                    {question}
                                    <button
                                        onClick={() => navigator.clipboard.writeText(question)}
                                        className="ml-2 text-blue-500 hover:underline"
                                    >
                                        Copy
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ComponentAiGeneratedQuestionList;
