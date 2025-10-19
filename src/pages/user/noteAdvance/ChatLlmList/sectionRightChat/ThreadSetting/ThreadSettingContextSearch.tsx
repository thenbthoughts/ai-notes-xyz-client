import { Fragment, useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { CancelTokenSource } from "axios";
import axiosCustom from "../../../../../../config/axiosCustom";
import { LucideExternalLink, LucideSearch } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

interface TaskInfo {
    _id: string;
    title: string;
    description: string;
    priority: string;
    dueDate: string | null;
    checklist: any[];
    comments: any[];
    boardName: string;
    listName?: string;
    taskStatus?: string;
    labels: string[];
    labelsAi: string[];
    username: string;
    dateTimeUtc: string;
    userAgent: string;
    createdAtIpAddress: string;
    updatedAtIpAddress: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    isArchived: boolean;
    isCompleted: boolean;
    updatedAtUserAgent: string;
    updatedAtUtc: string;
    taskWorkspaceId: string;
    taskStatusId: string;
    isTaskPinned?: boolean;
    fromCollection: string;
}

interface NotesInfo {
    _id: string;
    username: string;
    notesWorkspaceId: string;
    title: string;
    description: string;
    isStar: boolean;
    tags: string[];
    aiSummary: string;
    aiTags: string[];
    aiSuggestions: string;
    createdAtUtc: string;
    createdAtIpAddress: string;
    createdAtUserAgent: string;
    updatedAtUtc: string;
    updatedAtIpAddress: string;
    updatedAtUserAgent: string;
    __v: number;
    fromCollection: string;
}

interface LifeEventInfo {
    _id: string;
    username: string;
    title: string;
    description: string;
    categoryId: string | null;
    categorySubId: string | null;
    isStar: boolean;
    eventImpact: string;
    tags: string[];
    eventDateUtc: string;
    eventDateYearStr: string;
    eventDateYearMonthStr: string;
    aiSummary: string;
    aiTags: string[];
    aiSuggestions: string;
    aiCategory: string;
    aiSubCategory: string;
    createdAtUtc: string;
    createdAtIpAddress: string;
    createdAtUserAgent: string;
    updatedAtUtc: string;
    updatedAtIpAddress: string;
    updatedAtUserAgent: string;
    __v: number;
    fromCollection: string;
}

interface ContextItem {
    _id: string;
    fromCollection: 'tasks' | 'notes' | 'lifeEvents' | 'chatLlm' | 'infoVault';
    taskInfo?: TaskInfo;
    notesInfo?: NotesInfo;
    lifeEventInfo?: LifeEventInfo;

    // for context selected
    contextSelectedId: string;
    isContextSelected: boolean;
}

const ThreadSettingContextSearch = ({ threadId }: { threadId: string }) => {
    // State for search query
    const [search, setSearch] = useState("");
    // State for context items list
    const [list, setList] = useState<ContextItem[]>([]);

    // State for collection type filters
    const [filters, setFilters] = useState({
        filterEventTypeTasks: true,
        filterEventTypeLifeEvents: true,
        filterEventTypeNotes: true,
        filterEventTypeDiary: true,
    });
    const [filterTaskIsCompleted, setFilterTaskIsCompleted] = useState('not-completed' as 'all' | 'completed' | 'not-completed');
    const [filterTaskIsArchived, setFilterTaskIsArchived] = useState('not-archived' as 'all' | 'archived' | 'not-archived');
    const [filterIsContextSelected, setFilterIsContextSelected] = useState('all' as 'all' | 'added' | 'not-added');

    // State for pagination
    const [page, setPage] = useState(1);
    const perPage = 20;
    const [totalCount, setTotalCount] = useState(0);
    const [refreshRandomNum, setRefreshRandomNum] = useState(0);

    // Fetch list when refresh triggered
    useEffect(() => {
        const axiosCancelTokenSource: CancelTokenSource = axios.CancelToken.source();
        fetchList({ axiosCancelTokenSource });
        return () => {
            axiosCancelTokenSource.cancel('Operation canceled by the user.');
        };
    }, [refreshRandomNum]);

    // Refresh list when page changes
    useEffect(() => {
        setRefreshRandomNum(Math.random());
    }, [page]);

    // Reset to page 1 and refresh when search or filters change
    useEffect(() => {
        setPage(1);
        setRefreshRandomNum(Math.random());
    }, [
        search,
        filters,
        filterIsContextSelected,

        // filter by task status
        filterTaskIsCompleted,
        filterTaskIsArchived,
    ]);

    // Fetch context list from API
    const fetchList = async ({ axiosCancelTokenSource }: { axiosCancelTokenSource: CancelTokenSource }) => {
        try {
            const config = {
                method: 'post',
                url: `/api/chat-llm/threads-context-crud/contextSearch`,
                data: {
                    threadId: threadId,
                    searchQuery: search,
                    filterEventTypeTasks: filters.filterEventTypeTasks,
                    filterEventTypeLifeEvents: filters.filterEventTypeLifeEvents,
                    filterEventTypeNotes: filters.filterEventTypeNotes,
                    filterEventTypeDiary: filters.filterEventTypeDiary,
                    filterIsContextSelected: filterIsContextSelected,

                    // filter by task status
                    filterTaskIsCompleted: filterTaskIsCompleted,
                    filterTaskIsArchived: filterTaskIsArchived,

                    page: page,
                    limit: perPage,
                },
                cancelToken: axiosCancelTokenSource.token,
            }
            const response = await axiosCustom(config);
            setList(response.data.result.docs);
            setTotalCount(response.data.result.count);
        } catch (error) {
            console.error(error);
        }
    }

    // Add selected context item to thread
    const handleAddContext = async ({
        referenceFrom,
        referenceId,
        shouldLoad,
    }: {
        referenceFrom: 'notes' | 'tasks' | 'chatLlm' | 'lifeEvents' | 'infoVault';
        referenceId: string;
        shouldLoad: boolean;
    }) => {
        const toastId = toast.loading('Loading...');
        try {
            const result = await axiosCustom.post('/api/chat-llm/threads-context-crud/contextUpsert', {
                threadId: threadId,
                referenceFrom: referenceFrom,
                referenceId: referenceId,
            });
            console.log(result);
            if (shouldLoad) {
                setRefreshRandomNum(Math.random());
            }
        } catch (error) {
            console.error(error);
        } finally {
            toast.dismiss(toastId);
        }
    }

    const handleDeleteContext = async ({
        referenceId,
    }: {
        referenceId: string;
    }) => {
        const toastId = toast.loading('Loading...');
        try {
            await axiosCustom.post('/api/chat-llm/threads-context-crud/contextDeleteById', {
                recordId: referenceId,
            });
            setRefreshRandomNum(Math.random());
        } catch (error) {
            console.error(error);
        } finally {
            toast.dismiss(toastId);
        }
    }

    const renderFilters = () => {
        return (
            <div className="flex flex-col gap-2">
                {/* Search Input */}
                <div className="relative">
                    <LucideSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search contexts..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Filter by added or not added */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Context Selected:</label>
                    <div className="flex flex-wrap gap-2">
                        <button
                            className={`px-3 py-1 text-sm border rounded-lg transition-colors ${filterIsContextSelected === 'all'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 hover:bg-gray-50'
                                }`}
                            onClick={() => setFilterIsContextSelected('all')}
                        >
                            All
                        </button>
                        <button
                            className={`px-3 py-1 text-sm border rounded-lg transition-colors ${filterIsContextSelected === 'not-added'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 hover:bg-gray-50'
                                }`}
                            onClick={() => setFilterIsContextSelected('not-added')}
                        >
                            Not Selected
                        </button>
                        <button
                            className={`px-3 py-1 text-sm border rounded-lg transition-colors ${filterIsContextSelected === 'added'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 hover:bg-gray-50'
                                }`}
                            onClick={() => setFilterIsContextSelected('added')}
                        >
                            Selected
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={filters.filterEventTypeNotes}
                            onChange={(e) => setFilters({ ...filters, filterEventTypeNotes: e.target.checked })}
                            className="rounded"
                        />
                        <span className="text-sm">Notes</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={filters.filterEventTypeTasks}
                            onChange={(e) => setFilters({ ...filters, filterEventTypeTasks: e.target.checked })}
                            className="rounded"
                        />
                        <span className="text-sm">Tasks</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={filters.filterEventTypeLifeEvents}
                            onChange={(e) => setFilters({ ...filters, filterEventTypeLifeEvents: e.target.checked })}
                            className="rounded"
                        />
                        <span className="text-sm">Life Events</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={filters.filterEventTypeDiary}
                            onChange={(e) => setFilters({ ...filters, filterEventTypeDiary: e.target.checked })}
                            className="rounded"
                        />
                        <span className="text-sm">Diary</span>
                    </label>
                </div>

                {/* Filter by task status */}
                {filters.filterEventTypeTasks && (
                    <div className="space-y-2">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Task Status:</label>
                            <div className="flex gap-2 mb-2">
                                <button
                                    className={`px-3 py-1 rounded text-sm ${filterTaskIsCompleted === 'all'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    onClick={() => setFilterTaskIsCompleted('all')}
                                >
                                    All
                                </button>
                                <button
                                    className={`px-3 py-1 rounded text-sm ${filterTaskIsCompleted === 'completed'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    onClick={() => setFilterTaskIsCompleted('completed')}
                                >
                                    Completed
                                </button>
                                <button
                                    className={`px-3 py-1 rounded text-sm ${filterTaskIsCompleted === 'not-completed'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    onClick={() => setFilterTaskIsCompleted('not-completed')}
                                >
                                    Not Completed
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">Task Archive Status:</label>
                            <div className="flex gap-2">
                                <button
                                    className={`px-3 py-1 rounded text-sm ${filterTaskIsArchived === 'all'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    onClick={() => setFilterTaskIsArchived('all')}
                                >
                                    All
                                </button>
                                <button
                                    className={`px-3 py-1 rounded text-sm ${filterTaskIsArchived === 'archived'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    onClick={() => setFilterTaskIsArchived('archived')}
                                >
                                    Archived
                                </button>
                                <button
                                    className={`px-3 py-1 rounded text-sm ${filterTaskIsArchived === 'not-archived'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    onClick={() => setFilterTaskIsArchived('not-archived')}
                                >
                                    Not Archived
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    };

    return (
        <div className="space-y-4">

            {/* Heading */}
            <h3 className="text-lg font-bold mb-4">Contexts: {totalCount > 0 ? `(${totalCount})` : ''}</h3>

            {/* Filters */}
            {renderFilters()}

            {/* Results Count */}
            <div className="text-sm text-gray-600">
                Showing {totalCount} result{totalCount >= 2 ? 's' : ''} {page > 1 && `(Page ${page})`}
            </div>

            {/* List */}
            <div className="space-y-3">
                {list.map((item) => {
                    // Initialize default values for all item properties
                    let title = 'Untitled';
                    let description = '';
                    let itemDate = '';
                    let itemLink = '#';
                    let eventTypeLabel: string = item.fromCollection;
                    let eventTypeColor = 'bg-gray-100 text-gray-800';
                    let isStar = false;
                    let status = '';
                    let priority = '';
                    let eventImpact = '';
                    let labels: string[] = [];
                    let tags: string[] = [];

                    // Extract data from tasks collection
                    if (item.fromCollection === 'tasks' && item.taskInfo) {
                        title = item.taskInfo.title;
                        description = item.taskInfo.description;
                        itemDate = item.taskInfo.createdAt;
                        itemLink = '/user/task-list';
                        eventTypeLabel = 'Task';
                        eventTypeColor = 'bg-green-100 text-green-800';
                        status = item.taskInfo.taskStatus || '';
                        priority = item.taskInfo.priority;
                        labels = item.taskInfo.labels || [];
                    }

                    // Extract data from notes collection
                    if (item.fromCollection === 'notes' && item.notesInfo) {
                        title = item.notesInfo.title;
                        itemDate = item.notesInfo.createdAtUtc;
                        itemLink = '/user/notes';
                        eventTypeLabel = 'Note';
                        eventTypeColor = 'bg-blue-100 text-blue-800';
                        isStar = item.notesInfo.isStar;
                        tags = item.notesInfo.tags || [];
                    }

                    // Extract data from life events collection
                    if (item.fromCollection === 'lifeEvents' && item.lifeEventInfo) {
                        title = item.lifeEventInfo.title;
                        description = item.lifeEventInfo.description;
                        itemDate = item.lifeEventInfo.eventDateUtc || item.lifeEventInfo.createdAtUtc;
                        itemLink = '/user/life-events';
                        eventTypeLabel = 'Life Event';
                        eventTypeColor = 'bg-purple-100 text-purple-800';
                        isStar = item.lifeEventInfo.isStar;
                        eventImpact = item.lifeEventInfo.eventImpact;
                        tags = item.lifeEventInfo.tags || [];
                    }

                    // Extract data from diary collection
                    return (
                        <div
                            key={item._id}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    {/* Header with type badge and link */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${eventTypeColor}`}>
                                            {eventTypeLabel}
                                        </span>
                                        <Link
                                            to={itemLink}
                                            target="_blank"
                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                            title="Open in new tab"
                                        >
                                            <LucideExternalLink className="w-4 h-4" />
                                        </Link>
                                        {isStar && (
                                            <span className="text-yellow-500" title="Starred">★</span>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <h4 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
                                        {title}
                                    </h4>

                                    {/* Description */}
                                    {description && (
                                        <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                                            {description}
                                        </p>
                                    )}

                                    {/* Metadata */}
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                        {/* Date */}
                                        {itemDate && (
                                            <span className="flex items-center gap-1">
                                                📅 {new Date(itemDate).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        )}

                                        {/* Task-specific metadata */}
                                        {status && (
                                            <span className="px-2 py-0.5 bg-gray-100 rounded">
                                                {status}
                                            </span>
                                        )}
                                        {priority && (
                                            <span className="px-2 py-0.5 bg-gray-100 rounded">
                                                Priority: {priority}
                                            </span>
                                        )}
                                        {item.fromCollection === 'tasks' && (
                                            <span className={`px-2 py-0.5 rounded ${item.taskInfo?.isCompleted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {item.taskInfo?.isCompleted ? 'Completed' : 'Not Completed'}
                                            </span>
                                        )}
                                        {item.fromCollection === 'tasks' && (
                                            <Fragment>
                                                {item.taskInfo?.isArchived && (
                                                    <span className={`px-2 py-0.5 rounded ${item.taskInfo?.isArchived ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-700'}`}>
                                                        Archived
                                                    </span>
                                                )}
                                            </Fragment>
                                        )}
                                        {/* Event Impact */}
                                        {eventImpact && (
                                            <span className="px-2 py-0.5 bg-gray-100 rounded">
                                                Impact: {eventImpact}
                                            </span>
                                        )}
                                    </div>

                                    {/* Tags/Labels */}
                                    {(labels.length > 0 || tags.length > 0) && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {labels.slice(0, 3).map((label: string, idx: number) => (
                                                <span
                                                    key={`label-${idx}`}
                                                    className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded"
                                                >
                                                    {label}
                                                </span>
                                            ))}
                                            {tags.slice(0, 3).map((tag: string, idx: number) => (
                                                <span
                                                    key={`tag-${idx}`}
                                                    className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Add button */}
                                {item.isContextSelected === false && (
                                    <button
                                        onClick={() => {
                                            if (
                                                item.fromCollection === 'tasks' ||
                                                item.fromCollection === 'notes' ||
                                                item.fromCollection === 'lifeEvents' ||
                                                item.fromCollection === 'chatLlm' ||
                                                item.fromCollection === 'infoVault'
                                            ) {
                                                let tempReferenceFrom = '' as 'tasks' | 'notes' | 'chatLlm' | 'lifeEvents' | 'infoVault';
                                                if (item.fromCollection === 'tasks') {
                                                    tempReferenceFrom = 'tasks';
                                                } else if (item.fromCollection === 'notes') {
                                                    tempReferenceFrom = 'notes';
                                                } else if (item.fromCollection === 'lifeEvents') {
                                                    tempReferenceFrom = 'lifeEvents';
                                                } else if (item.fromCollection === 'chatLlm') {
                                                    tempReferenceFrom = 'chatLlm';
                                                } else if (item.fromCollection === 'infoVault') {
                                                    tempReferenceFrom = 'infoVault';
                                                }
                                                handleAddContext({
                                                    referenceFrom: tempReferenceFrom,
                                                    referenceId: item._id,
                                                    shouldLoad: true,
                                                });
                                            }
                                        }}
                                        className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
                                    >Add</button>
                                )}
                                {item.isContextSelected === true && (
                                    <button
                                        onClick={() => {
                                            handleDeleteContext({
                                                referenceId: item.contextSelectedId,
                                            });
                                        }}
                                        className="flex-shrink-0 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
                                    >Remove</button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            {(page > 1 || totalCount === perPage) && (
                <div className="flex justify-center items-center gap-3 mt-6">
                    <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                    >
                        ← Previous
                    </button>
                    <span className="px-3 py-2 text-sm text-gray-600">
                        Page {page}
                    </span>
                    <button
                        onClick={() => setPage(page + 1)}
                        disabled={totalCount < perPage}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                    >
                        Next →
                    </button>
                </div>
            )}

            {list.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No contexts found
                </div>
            )}
        </div>
    )
}

export default ThreadSettingContextSearch;