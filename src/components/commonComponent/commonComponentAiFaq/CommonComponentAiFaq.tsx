import { useState, useEffect } from 'react';
import { AxiosRequestConfig } from 'axios';
import axiosCustom from '../../../config/axiosCustom.ts';
import toast from 'react-hot-toast';
import { RefreshCw } from 'lucide-react';

interface IFaq {
    _id: string;
    username: string;
    question: string;
    answer: string;
    aiCategory: string;
    aiSubCategory: string;
    tags: string[];
    metadataSourceType: string;
    metadataSourceId: string;
    hasEmbedding: boolean;
    isActive: boolean;
    createdAtUtc: Date;
    updatedAtUtc: Date;
}

const CommonComponentAiFaq = ({
    sourceId,
}: {
    sourceId: string;
}) => {
    const [faqs, setFaqs] = useState<IFaq[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);

    useEffect(() => {
        fetchFaqs();
    }, [sourceId, page]);

    const fetchFaqs = async () => {
        setLoading(true);
        try {
            const config = {
                method: 'post',
                url: `/api/ai-context/faq/list`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    sourceId,
                    page,
                    limit: 50,
                },
            } as AxiosRequestConfig;

            const response = await axiosCustom.request(config);

            if (response.data.docs) {
                setFaqs(response.data.docs);
                setTotalPages(response.data.pagination?.totalPages || 1);
            } else {
                toast.error('Error fetching FAQs');
            }
        } catch (error) {
            console.error('Error fetching FAQs:', error);
            toast.error('Error fetching FAQs!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-sm">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">
                AI Generated FAQs
                <button
                    onClick={fetchFaqs}
                    className="ml-2 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
                    title="Refresh FAQs"
                >
                    <RefreshCw className="h-4 w-4" />
                </button>
            </h2>

            {loading && (
                <div className="text-center">
                    <p className="text-sm text-blue-500">Loading FAQs...</p>
                </div>
            )}

            {!loading && faqs.length === 0 && (
                <div className="text-center">
                    <p className="text-sm text-gray-500">No FAQs found.</p>
                </div>
            )}

            {!loading && faqs.length > 0 && (
                <div>
                    <div className="space-y-2">
                        {faqs.map((faq) => (
                            <div
                                key={faq._id}
                                className="border border-gray-200 rounded-sm p-2 hover:bg-gray-50"
                            >
                                <div className="mb-1">
                                    <h3 className="text-sm font-medium text-gray-800">
                                        Q: {faq.question}
                                    </h3>
                                </div>
                                <div className="mb-1">
                                    <p className="text-sm text-gray-700">A: {faq.answer}</p>
                                </div>
                                {faq.aiCategory && (
                                    <div className="text-xs text-gray-600">
                                        Category: {faq.aiCategory}
                                    </div>
                                )}
                                {faq.aiSubCategory && (
                                    <div className="text-xs text-gray-600">
                                        Sub-Category: {faq.aiSubCategory}
                                    </div>
                                )}
                                {faq.tags && faq.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {faq.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-sm"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-2 flex justify-center gap-1">
                            <button
                                className="px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded-sm hover:bg-gray-300 disabled:opacity-50"
                                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </button>
                            <span className="px-2 py-1 text-gray-700 text-xs">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                className="px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded-sm hover:bg-gray-300 disabled:opacity-50"
                                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={page === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CommonComponentAiFaq;