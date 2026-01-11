import { useState, useEffect } from 'react';
import { AxiosRequestConfig } from 'axios';
import axiosCustom from '../../../config/axiosCustom.ts';
import toast from 'react-hot-toast';
import { RefreshCw } from 'lucide-react';

interface IKeyword {
    _id: string;
    username: string;
    keyword: string;
    aiCategory: string;
    aiSubCategory: string;
    aiTopic: string;
    aiSubTopic: string;
    metadataSourceType: string;
    metadataSourceId: string;
    hasEmbedding: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CommonComponentAiKeyword = ({
    sourceId,
}: {
    sourceId: string;
}) => {
    const [keywords, setKeywords] = useState<IKeyword[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        fetchKeywords();
    }, [sourceId]);

    const fetchKeywords = async () => {
        setLoading(true);
        try {
            const config = {
                method: 'post',
                url: `/api/ai-context/keyword/list`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    sourceId,
                    page: 1,
                    limit: 10000,
                },
            } as AxiosRequestConfig;

            const response = await axiosCustom.request(config);

            if (response.data.docs) {
                setKeywords(response.data.docs);
            } else {
                toast.error('Error fetching Keywords');
            }
        } catch (error) {
            console.error('Error fetching Keywords:', error);
            toast.error('Error fetching Keywords!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-sm">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">
                AI Generated Keywords
                <button
                    onClick={fetchKeywords}
                    className="ml-2 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
                    title="Refresh Keywords"
                >
                    <RefreshCw className="h-4 w-4" />
                </button>
            </h2>

            {loading && (
                <div className="text-center">
                    <p className="text-sm text-blue-500">Loading Keywords...</p>
                </div>
            )}

            {!loading && keywords.length === 0 && (
                <div className="text-center">
                    <p className="text-sm text-gray-500">No Keywords found.</p>
                </div>
            )}

            {!loading && keywords.length > 0 && (
                <div>
                    {keywords.length > 0 && keywords[0] && (
                        <div className="mb-3 border border-blue-200 rounded-sm p-3 bg-blue-50">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                {keywords[0].aiCategory && (
                                    <div className="flex items-start">
                                        <span className="font-semibold text-gray-700 mr-2">Category:</span>
                                        <span className="text-gray-600">{keywords[0].aiCategory}</span>
                                    </div>
                                )}
                                {keywords[0].aiSubCategory && (
                                    <div className="flex items-start">
                                        <span className="font-semibold text-gray-700 mr-2">Sub-Category:</span>
                                        <span className="text-gray-600">{keywords[0].aiSubCategory}</span>
                                    </div>
                                )}
                                {keywords[0].aiTopic && (
                                    <div className="flex items-start">
                                        <span className="font-semibold text-gray-700 mr-2">Topic:</span>
                                        <span className="text-gray-600">{keywords[0].aiTopic}</span>
                                    </div>
                                )}
                                {keywords[0].aiSubTopic && (
                                    <div className="flex items-start">
                                        <span className="font-semibold text-gray-700 mr-2">Sub-Topic:</span>
                                        <span className="text-gray-600">{keywords[0].aiSubTopic}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                        {keywords.map((keyword) => (
                            <div
                                key={keyword._id}
                                className="inline-block bg-gray-100 rounded-sm p-1 px-2 text-xs text-gray-600"
                            >
                                {keyword.keyword}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommonComponentAiKeyword;