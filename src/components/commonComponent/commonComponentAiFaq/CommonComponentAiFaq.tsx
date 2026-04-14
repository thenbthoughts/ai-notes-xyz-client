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
        <div className="rounded-xl border border-zinc-200/70 bg-white p-2.5 shadow-sm sm:p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
                <h2 className="text-[11px] font-semibold uppercase tracking-wide text-zinc-700">
                    AI Generated FAQs
                </h2>
                <button
                    type="button"
                    onClick={fetchFaqs}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200/80 bg-zinc-50 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-800"
                    title="Refresh FAQs"
                >
                    <RefreshCw className="h-3.5 w-3.5" />
                </button>
            </div>

            {loading && (
                <div className="rounded-lg border border-zinc-200/70 bg-zinc-50 px-3 py-4 text-center">
                    <p className="text-xs font-medium text-zinc-500">Loading FAQs...</p>
                </div>
            )}

            {!loading && faqs.length === 0 && (
                <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50/70 px-3 py-4 text-center">
                    <p className="text-xs text-zinc-500">No FAQs found.</p>
                </div>
            )}

            {!loading && faqs.length > 0 && (
                <div>
                    <div className="space-y-2.5">
                        {faqs.map((faq) => (
                            <div
                                key={faq._id}
                                className="rounded-lg border border-zinc-200/80 bg-zinc-50/40 p-2.5 transition-colors hover:bg-zinc-50"
                            >
                                <div className="mb-1.5">
                                    <h3 className="text-sm font-medium text-zinc-800">
                                        Q: {faq.question}
                                    </h3>
                                </div>
                                <div className="mb-1.5">
                                    <p className="text-sm leading-relaxed text-zinc-700">A: {faq.answer}</p>
                                </div>
                                {faq.aiCategory && (
                                    <div className="text-[11px] text-zinc-600">
                                        Category: {faq.aiCategory}
                                    </div>
                                )}
                                {faq.aiSubCategory && (
                                    <div className="text-[11px] text-zinc-600">
                                        Sub-Category: {faq.aiSubCategory}
                                    </div>
                                )}
                                {faq.tags && faq.tags.length > 0 && (
                                    <div className="mt-1.5 flex flex-wrap gap-1">
                                        {faq.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="rounded-md border border-violet-200/70 bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium text-violet-800"
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
                        <div className="mt-3 flex items-center justify-center gap-1.5">
                            <button
                                type="button"
                                className="rounded-lg border border-zinc-200/80 bg-zinc-50 px-2 py-1 text-[11px] text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50"
                                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </button>
                            <span className="px-1 py-1 text-[11px] text-zinc-600">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                type="button"
                                className="rounded-lg border border-zinc-200/80 bg-zinc-50 px-2 py-1 text-[11px] text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50"
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