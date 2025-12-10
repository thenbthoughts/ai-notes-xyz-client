import React, { useState, useEffect } from 'react';
import { RefreshCw, Filter } from 'lucide-react';
import axiosCustom from '../../../../../config/axiosCustom';

interface ILlmContextKeyword {
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
    createdAt: string;
    updatedAt: string;
}

interface IKeywordStats {
    totalKeywords: number;
    bySourceType: Array<{ _id: string; count: number }>;
    byCategory: Array<{ _id: string; count: number }>;
    byTopic: Array<{ _id: string; count: number }>;
    topKeywords: Array<{ _id: string; count: number }>;
}

interface IGroupedData {
    _id: string;
    count: number;
    keywords: string[];
}

// Component for displaying grouped data by Category
const GroupedByCategory = () => {
    const [groupedData, setGroupedData] = useState<IGroupedData[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchGroupedData();
    }, []);

    const fetchGroupedData = async () => {
        setLoading(true);
        try {
            const response = await axiosCustom.post('/api/ai-context/keyword/group-by-field', {
                groupByField: 'aiCategory'
            });
            setGroupedData(response.data.data);
        } catch (error) {
            console.error('Error fetching grouped data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleCategory = (categoryId: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return newSet;
        });
    };

    if (loading) {
        return <div className="p-4 text-center text-slate-600">Loading categories...</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow border border-slate-200 mb-6">
            <div className="p-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800">Grouped by Category</h2>
            </div>
            <div className="p-4">
                <div className="space-y-2">
                    {groupedData.map((group) => (
                        <div key={group._id} className="border border-slate-200 rounded-lg overflow-hidden">
                            <div 
                                className="flex justify-between items-center p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                                onClick={() => toggleCategory(group._id)}
                            >
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-slate-800">{group._id || 'Uncategorized'}</h3>
                                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                                        {group.count}
                                    </span>
                                </div>
                                <span className="text-slate-400">
                                    {expandedCategories.has(group._id) ? '▼' : '▶'}
                                </span>
                            </div>
                            {expandedCategories.has(group._id) && (
                                <div className="px-4 pb-4 pt-2 bg-slate-50 border-t border-slate-200">
                                    <div className="flex flex-wrap gap-2">
                                        {group.keywords.map((keyword, idx) => (
                                            <span 
                                                key={idx} 
                                                className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                                            >
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Component for displaying grouped data by Sub-Category
const GroupedBySubCategory = () => {
    const [groupedData, setGroupedData] = useState<IGroupedData[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchGroupedData();
    }, []);

    const fetchGroupedData = async () => {
        setLoading(true);
        try {
            const response = await axiosCustom.post('/api/ai-context/keyword/group-by-field', {
                groupByField: 'aiSubCategory'
            });
            setGroupedData(response.data.data);
        } catch (error) {
            console.error('Error fetching grouped data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleCategory = (categoryId: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return newSet;
        });
    };

    if (loading) {
        return <div className="p-4 text-center text-slate-600">Loading sub-categories...</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow border border-slate-200 mb-6">
            <div className="p-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800">Grouped by Sub-Category</h2>
            </div>
            <div className="p-4">
                <div className="space-y-2">
                    {groupedData.map((group) => (
                        <div key={group._id} className="border border-slate-200 rounded-lg overflow-hidden">
                            <div 
                                className="flex justify-between items-center p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                                onClick={() => toggleCategory(group._id)}
                            >
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-slate-800">{group._id || 'Uncategorized'}</h3>
                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                        {group.count}
                                    </span>
                                </div>
                                <span className="text-slate-400">
                                    {expandedCategories.has(group._id) ? '▼' : '▶'}
                                </span>
                            </div>
                            {expandedCategories.has(group._id) && (
                                <div className="px-4 pb-4 pt-2 bg-slate-50 border-t border-slate-200">
                                    <div className="flex flex-wrap gap-2">
                                        {group.keywords.map((keyword, idx) => (
                                            <span 
                                                key={idx} 
                                                className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm text-slate-700 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                                            >
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Component for displaying grouped data by Topic
const GroupedByTopic = () => {
    const [groupedData, setGroupedData] = useState<IGroupedData[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchGroupedData();
    }, []);

    const fetchGroupedData = async () => {
        setLoading(true);
        try {
            const response = await axiosCustom.post('/api/ai-context/keyword/group-by-field', {
                groupByField: 'aiTopic'
            });
            setGroupedData(response.data.data);
        } catch (error) {
            console.error('Error fetching grouped data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleCategory = (categoryId: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return newSet;
        });
    };

    if (loading) {
        return <div className="p-4 text-center text-slate-600">Loading topics...</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow border border-slate-200 mb-6">
            <div className="p-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800">Grouped by Topic</h2>
            </div>
            <div className="p-4">
                <div className="space-y-2">
                    {groupedData.map((group) => (
                        <div key={group._id} className="border border-slate-200 rounded-lg overflow-hidden">
                            <div 
                                className="flex justify-between items-center p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                                onClick={() => toggleCategory(group._id)}
                            >
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-slate-800">{group._id || 'Uncategorized'}</h3>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                        {group.count}
                                    </span>
                                </div>
                                <span className="text-slate-400">
                                    {expandedCategories.has(group._id) ? '▼' : '▶'}
                                </span>
                            </div>
                            {expandedCategories.has(group._id) && (
                                <div className="px-4 pb-4 pt-2 bg-slate-50 border-t border-slate-200">
                                    <div className="flex flex-wrap gap-2">
                                        {group.keywords.map((keyword, idx) => (
                                            <span 
                                                key={idx} 
                                                className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm text-slate-700 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                                            >
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Component for displaying grouped data by Sub-Topic
const GroupedBySubTopic = () => {
    const [groupedData, setGroupedData] = useState<IGroupedData[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchGroupedData();
    }, []);

    const fetchGroupedData = async () => {
        setLoading(true);
        try {
            const response = await axiosCustom.post('/api/ai-context/keyword/group-by-field', {
                groupByField: 'aiSubTopic'
            });
            setGroupedData(response.data.data);
        } catch (error) {
            console.error('Error fetching grouped data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleCategory = (categoryId: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return newSet;
        });
    };

    if (loading) {
        return <div className="p-4 text-center text-slate-600">Loading sub-topics...</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow border border-slate-200 mb-6">
            <div className="p-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800">Grouped by Sub-Topic</h2>
            </div>
            <div className="p-4">
                <div className="space-y-2">
                    {groupedData.map((group) => (
                        <div key={group._id} className="border border-slate-200 rounded-lg overflow-hidden">
                            <div 
                                className="flex justify-between items-center p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                                onClick={() => toggleCategory(group._id)}
                            >
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-slate-800">{group._id || 'Uncategorized'}</h3>
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                        {group.count}
                                    </span>
                                </div>
                                <span className="text-slate-400">
                                    {expandedCategories.has(group._id) ? '▼' : '▶'}
                                </span>
                            </div>
                            {expandedCategories.has(group._id) && (
                                <div className="px-4 pb-4 pt-2 bg-slate-50 border-t border-slate-200">
                                    <div className="flex flex-wrap gap-2">
                                        {group.keywords.map((keyword, idx) => (
                                            <span 
                                                key={idx} 
                                                className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm text-slate-700 hover:border-green-300 hover:bg-green-50 transition-colors"
                                            >
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const LlmKeywordList: React.FC = () => {
    const [keywords, setKeywords] = useState<ILlmContextKeyword[]>([]);
    const [stats, setStats] = useState<IKeywordStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [revalidating, setRevalidating] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    
    const [activeGroupView, setActiveGroupView] = useState<string>('');
    
    // Pagination
    const [page, setPage] = useState(1);
    const [limit] = useState(50);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    
    // Filters
    const [filters, setFilters] = useState({
        keyword: '',
        sourceType: '',
        sourceId: '',
        aiCategory: '',
        aiSubCategory: '',
        aiTopic: '',
        aiSubTopic: ''
    });
    
    // Options for select dropdowns
    const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
    const [topicOptions, setTopicOptions] = useState<string[]>([]);
    const [sourceTypeOptions, setSourceTypeOptions] = useState<string[]>([]);

    useEffect(() => {
        fetchKeywords();
        fetchStats();
    }, [page]);

    const fetchKeywords = async () => {
        setLoading(true);
        try {
            const response = await axiosCustom.post('/api/ai-context/keyword/list', {
                page,
                limit,
                ...filters
            });
            setKeywords(response.data.docs);
            setTotal(response.data.count);
            setTotalPages(response.data.pagination.totalPages);
        } catch (error) {
            console.error('Error fetching keywords:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axiosCustom.post('/api/ai-context/keyword/stats');
            setStats(response.data);
            
            // Extract unique values for select options
            if (response.data.byCategory) {
                setCategoryOptions(response.data.byCategory.map((item: any) => item._id).filter(Boolean));
            }
            if (response.data.byTopic) {
                setTopicOptions(response.data.byTopic.map((item: any) => item._id).filter(Boolean));
            }
            if (response.data.bySourceType) {
                setSourceTypeOptions(response.data.bySourceType.map((item: any) => item._id).filter(Boolean));
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleRevalidate = async () => {
        setRevalidating(true);
        try {
            const response = await axiosCustom.post('/api/ai-context/keyword/revalidate');
            alert(response.data.message);
            fetchKeywords();
            fetchStats();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error revalidating keywords');
        } finally {
            setRevalidating(false);
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleApplyFilters = () => {
        setPage(1);
        fetchKeywords();
    };

    const handleClearFilters = () => {
        setFilters({
            keyword: '',
            sourceType: '',
            sourceId: '',
            aiCategory: '',
            aiSubCategory: '',
            aiTopic: '',
            aiSubTopic: ''
        });
        setPage(1);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">AI Context Keywords</h1>
                <p className="text-slate-600">Manage and explore your AI-generated context keywords</p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-4 border border-slate-200">
                        <div className="text-sm text-slate-600 mb-1">Total Keywords</div>
                        <div className="text-2xl font-bold text-slate-800">{stats.totalKeywords}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 border border-slate-200">
                        <div className="text-sm text-slate-600 mb-1">Categories</div>
                        <div className="text-2xl font-bold text-slate-800">{stats.byCategory.length}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 border border-slate-200">
                        <div className="text-sm text-slate-600 mb-1">Topics</div>
                        <div className="text-2xl font-bold text-slate-800">{stats.byTopic.length}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 border border-slate-200">
                        <div className="text-sm text-slate-600 mb-1">Source Types</div>
                        <div className="text-2xl font-bold text-slate-800">{stats.bySourceType.length}</div>
                    </div>
                </div>
            )}

            {/* Actions Bar */}
            <div className="bg-white rounded-lg shadow p-4 mb-6 border border-slate-200">
                <div className="flex flex-wrap gap-3 items-center justify-between">
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                            <Filter size={18} />
                            <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
                        </button>
                        
                        <div className="relative">
                            <select
                                value={activeGroupView}
                                onChange={(e) => setActiveGroupView(e.target.value)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors appearance-none pr-8"
                            >
                                <option value="">Group By...</option>
                                <option value="aiCategory">Category</option>
                                <option value="aiSubCategory">Sub-Category</option>
                                <option value="aiTopic">Topic</option>
                                <option value="aiSubTopic">Sub-Topic</option>
                            </select>
                        </div>
                    </div>
                    
                    <button
                        onClick={handleRevalidate}
                        disabled={revalidating}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={revalidating ? 'animate-spin' : ''} />
                        <span>{revalidating ? 'Revalidating...' : 'Revalidate All'}</span>
                    </button>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <input
                                type="text"
                                placeholder="Search keyword..."
                                value={filters.keyword}
                                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <select
                                value={filters.sourceType}
                                onChange={(e) => handleFilterChange('sourceType', e.target.value)}
                                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Source Types</option>
                                {sourceTypeOptions.map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            <select
                                value={filters.aiCategory}
                                onChange={(e) => handleFilterChange('aiCategory', e.target.value)}
                                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Categories</option>
                                {categoryOptions.map((category) => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                            <select
                                value={filters.aiTopic}
                                onChange={(e) => handleFilterChange('aiTopic', e.target.value)}
                                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Topics</option>
                                {topicOptions.map((topic) => (
                                    <option key={topic} value={topic}>{topic}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={handleApplyFilters}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                            >
                                Apply Filters
                            </button>
                            <button
                                onClick={handleClearFilters}
                                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Grouped Data Views */}
            {activeGroupView === 'aiCategory' && <GroupedByCategory />}
            {activeGroupView === 'aiSubCategory' && <GroupedBySubCategory />}
            {activeGroupView === 'aiTopic' && <GroupedByTopic />}
            {activeGroupView === 'aiSubTopic' && <GroupedBySubTopic />}

            {/* Keywords List */}
            <div className="bg-white rounded-lg shadow border border-slate-200">
                {loading ? (
                    <div className="p-8 text-center text-slate-600">Loading keywords...</div>
                ) : keywords.length === 0 ? (
                    <div className="p-8 text-center text-slate-600">No keywords found</div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Keyword</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Category</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Topic</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Source Type</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Embedding</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Created</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {keywords.map((keyword) => (
                                        <tr key={keyword._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 text-sm text-slate-800 font-medium">{keyword.keyword}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{keyword.aiCategory || '-'}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{keyword.aiTopic || '-'}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">
                                                    {keyword.metadataSourceType}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`px-2 py-1 rounded text-xs ${keyword.hasEmbedding ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {keyword.hasEmbedding ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">
                                                {new Date(keyword.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
                            <div className="text-sm text-slate-600">
                                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} keywords
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="px-3 py-1 text-sm text-slate-600">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default LlmKeywordList;
