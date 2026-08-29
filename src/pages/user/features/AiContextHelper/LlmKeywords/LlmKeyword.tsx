import React, { useState, useEffect } from 'react';
import { RefreshCw, Filter } from 'lucide-react';
import axiosCustom from '../../../../../config/axiosCustom';

interface ILlmContextKeyword {
    _id: string;
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
        return <div className="p-4 text-center text-zinc-400">Loading categories...</div>;
    }

    return (
        <div className="bg-zinc-900 rounded-lg shadow border border-zinc-700 mb-6">
            <div className="p-4 border-b border-zinc-700">
                <h2 className="text-lg font-semibold text-zinc-100">Grouped by Category</h2>
            </div>
            <div className="p-4">
                <div className="space-y-2">
                    {groupedData.map((group) => (
                        <div key={group._id} className="border border-zinc-700 rounded-lg overflow-hidden">
                            <div 
                                className="flex justify-between items-center p-4 cursor-pointer hover:bg-zinc-800 transition-colors"
                                onClick={() => toggleCategory(group._id)}
                            >
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-zinc-100">{group._id || 'Uncategorized'}</h3>
                                    <span className="px-2 py-1 bg-indigo-950 text-indigo-300 rounded text-xs font-medium">
                                        {group.count}
                                    </span>
                                </div>
                                <span className="text-slate-400">
                                    {expandedCategories.has(group._id) ? '▼' : '▶'}
                                </span>
                            </div>
                            {expandedCategories.has(group._id) && (
                                <div className="px-4 pb-4 pt-2 bg-zinc-950 border-t border-zinc-700">
                                    <div className="flex flex-wrap gap-2">
                                        {group.keywords.map((keyword, idx) => (
                                            <span 
                                                key={idx} 
                                                className="px-3 py-1 bg-zinc-900 border border-zinc-700 rounded-full text-sm text-zinc-400 hover:border-indigo-700 hover:bg-indigo-950 transition-colors"
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
        return <div className="p-4 text-center text-zinc-400">Loading sub-categories...</div>;
    }

    return (
        <div className="bg-zinc-900 rounded-lg shadow border border-zinc-700 mb-6">
            <div className="p-4 border-b border-zinc-700">
                <h2 className="text-lg font-semibold text-zinc-100">Grouped by Sub-Category</h2>
            </div>
            <div className="p-4">
                <div className="space-y-2">
                    {groupedData.map((group) => (
                        <div key={group._id} className="border border-zinc-700 rounded-lg overflow-hidden">
                            <div 
                                className="flex justify-between items-center p-4 cursor-pointer hover:bg-zinc-800 transition-colors"
                                onClick={() => toggleCategory(group._id)}
                            >
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-zinc-100">{group._id || 'Uncategorized'}</h3>
                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                        {group.count}
                                    </span>
                                </div>
                                <span className="text-slate-400">
                                    {expandedCategories.has(group._id) ? '▼' : '▶'}
                                </span>
                            </div>
                            {expandedCategories.has(group._id) && (
                                <div className="px-4 pb-4 pt-2 bg-zinc-950 border-t border-zinc-700">
                                    <div className="flex flex-wrap gap-2">
                                        {group.keywords.map((keyword, idx) => (
                                            <span 
                                                key={idx} 
                                                className="px-3 py-1 bg-zinc-900 border border-zinc-700 rounded-full text-sm text-zinc-400 hover:border-purple-300 hover:bg-purple-50 transition-colors"
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
        return <div className="p-4 text-center text-zinc-400">Loading topics...</div>;
    }

    return (
        <div className="bg-zinc-900 rounded-lg shadow border border-zinc-700 mb-6">
            <div className="p-4 border-b border-zinc-700">
                <h2 className="text-lg font-semibold text-zinc-100">Grouped by Topic</h2>
            </div>
            <div className="p-4">
                <div className="space-y-2">
                    {groupedData.map((group) => (
                        <div key={group._id} className="border border-zinc-700 rounded-lg overflow-hidden">
                            <div 
                                className="flex justify-between items-center p-4 cursor-pointer hover:bg-zinc-800 transition-colors"
                                onClick={() => toggleCategory(group._id)}
                            >
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-zinc-100">{group._id || 'Uncategorized'}</h3>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                        {group.count}
                                    </span>
                                </div>
                                <span className="text-slate-400">
                                    {expandedCategories.has(group._id) ? '▼' : '▶'}
                                </span>
                            </div>
                            {expandedCategories.has(group._id) && (
                                <div className="px-4 pb-4 pt-2 bg-zinc-950 border-t border-zinc-700">
                                    <div className="flex flex-wrap gap-2">
                                        {group.keywords.map((keyword, idx) => (
                                            <span 
                                                key={idx} 
                                                className="px-3 py-1 bg-zinc-900 border border-zinc-700 rounded-full text-sm text-zinc-400 hover:border-blue-300 hover:bg-blue-50 transition-colors"
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
        return <div className="p-4 text-center text-zinc-400">Loading sub-topics...</div>;
    }

    return (
        <div className="bg-zinc-900 rounded-lg shadow border border-zinc-700 mb-6">
            <div className="p-4 border-b border-zinc-700">
                <h2 className="text-lg font-semibold text-zinc-100">Grouped by Sub-Topic</h2>
            </div>
            <div className="p-4">
                <div className="space-y-2">
                    {groupedData.map((group) => (
                        <div key={group._id} className="border border-zinc-700 rounded-lg overflow-hidden">
                            <div 
                                className="flex justify-between items-center p-4 cursor-pointer hover:bg-zinc-800 transition-colors"
                                onClick={() => toggleCategory(group._id)}
                            >
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-zinc-100">{group._id || 'Uncategorized'}</h3>
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                        {group.count}
                                    </span>
                                </div>
                                <span className="text-slate-400">
                                    {expandedCategories.has(group._id) ? '▼' : '▶'}
                                </span>
                            </div>
                            {expandedCategories.has(group._id) && (
                                <div className="px-4 pb-4 pt-2 bg-zinc-950 border-t border-zinc-700">
                                    <div className="flex flex-wrap gap-2">
                                        {group.keywords.map((keyword, idx) => (
                                            <span 
                                                key={idx} 
                                                className="px-3 py-1 bg-zinc-900 border border-zinc-700 rounded-full text-sm text-zinc-400 hover:border-green-300 hover:bg-green-50 transition-colors"
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
                <h1 className="text-3xl font-bold text-zinc-100 mb-2">AI Context Keywords</h1>
                <p className="text-zinc-400">Manage and explore your AI-generated context keywords</p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-zinc-900 rounded-lg shadow p-4 border border-zinc-700">
                        <div className="text-sm text-zinc-400 mb-1">Total Keywords</div>
                        <div className="text-2xl font-bold text-zinc-100">{stats.totalKeywords}</div>
                    </div>
                    <div className="bg-zinc-900 rounded-lg shadow p-4 border border-zinc-700">
                        <div className="text-sm text-zinc-400 mb-1">Categories</div>
                        <div className="text-2xl font-bold text-zinc-100">{stats.byCategory.length}</div>
                    </div>
                    <div className="bg-zinc-900 rounded-lg shadow p-4 border border-zinc-700">
                        <div className="text-sm text-zinc-400 mb-1">Topics</div>
                        <div className="text-2xl font-bold text-zinc-100">{stats.byTopic.length}</div>
                    </div>
                    <div className="bg-zinc-900 rounded-lg shadow p-4 border border-zinc-700">
                        <div className="text-sm text-zinc-400 mb-1">Source Types</div>
                        <div className="text-2xl font-bold text-zinc-100">{stats.bySourceType.length}</div>
                    </div>
                </div>
            )}

            {/* Actions Bar */}
            <div className="bg-zinc-900 rounded-lg shadow p-4 mb-6 border border-zinc-700">
                <div className="flex flex-wrap gap-3 items-center justify-between">
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                        >
                            <Filter size={18} />
                            <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
                        </button>
                        
                        <div className="relative">
                            <select
                                value={activeGroupView}
                                onChange={(e) => setActiveGroupView(e.target.value)}
                                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors appearance-none pr-8"
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
                    <div className="mt-4 pt-4 border-t border-zinc-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <input
                                type="text"
                                placeholder="Search keyword..."
                                value={filters.keyword}
                                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                                className="px-3 py-2 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <select
                                value={filters.sourceType}
                                onChange={(e) => handleFilterChange('sourceType', e.target.value)}
                                className="px-3 py-2 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Source Types</option>
                                {sourceTypeOptions.map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            <select
                                value={filters.aiCategory}
                                onChange={(e) => handleFilterChange('aiCategory', e.target.value)}
                                className="px-3 py-2 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Categories</option>
                                {categoryOptions.map((category) => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                            <select
                                value={filters.aiTopic}
                                onChange={(e) => handleFilterChange('aiTopic', e.target.value)}
                                className="px-3 py-2 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg transition-colors"
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
            <div className="bg-zinc-900 rounded-lg shadow border border-zinc-700">
                {loading ? (
                    <div className="p-8 text-center text-zinc-400">Loading keywords...</div>
                ) : keywords.length === 0 ? (
                    <div className="p-8 text-center text-zinc-400">No keywords found</div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-zinc-950 border-b border-zinc-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-400">Keyword</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-400">Category</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-400">Topic</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-400">Source Type</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-400">Embedding</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-400">Created</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-700">
                                    {keywords.map((keyword) => (
                                        <tr key={keyword._id} className="hover:bg-zinc-800 transition-colors">
                                            <td className="px-4 py-3 text-sm text-zinc-100 font-medium">{keyword.keyword}</td>
                                            <td className="px-4 py-3 text-sm text-zinc-400">{keyword.aiCategory || '-'}</td>
                                            <td className="px-4 py-3 text-sm text-zinc-400">{keyword.aiTopic || '-'}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className="px-2 py-1 bg-indigo-950 text-indigo-300 rounded text-xs">
                                                    {keyword.metadataSourceType}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`px-2 py-1 rounded text-xs ${keyword.hasEmbedding ? 'bg-green-100 text-green-700' : 'bg-zinc-800 text-zinc-400'}`}>
                                                    {keyword.hasEmbedding ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-zinc-400">
                                                {new Date(keyword.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-4 py-3 border-t border-zinc-700 flex items-center justify-between">
                            <div className="text-sm text-zinc-400">
                                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} keywords
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-3 py-1 border border-zinc-700 rounded hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="px-3 py-1 text-sm text-zinc-400">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-3 py-1 border border-zinc-700 rounded hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
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
