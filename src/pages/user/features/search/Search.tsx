import { Fragment, useState, useEffect } from "react";
import axios, { CancelTokenSource } from "axios";
import axiosCustom from "../../../../config/axiosCustom";
import { LucideExternalLink, LucideSearch, LucideFilter } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Select from "react-select";

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
    descriptionMarkdown: string;
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

interface InfoVaultSignificantDate {
    _id: string;
    username: string;
    infoVaultId: string;
    label: string;
    description: string;
    tags: string[];
    date: string;
    dateUtc: string;
    createdAtUtc: string;
    createdAtIpAddress: string;
    createdAtUserAgent: string;
    updatedAtUtc: string;
    updatedAtIpAddress: string;
    updatedAtUserAgent: string;
    fromCollection: string;
}

interface ChatLlmThreadInfo {
    _id: string;
    username: string;
    threadTitle: string;
    systemPrompt: string;
    tagsAi: string[];
    aiSummary: string;
    createdAtUtc: string;
    fromCollection: string;
}

interface SearchResultItem {
    _id: string;
    fromCollection: 'tasks' | 'notes' | 'lifeEvents' | 'infoVaultSignificantDate' | 'infoVaultSignificantDateRepeat' | 'chatLlmThread';
    taskInfo?: TaskInfo;
    notesInfo?: NotesInfo;
    lifeEventInfo?: LifeEventInfo;
    infoVaultSignificantDate?: InfoVaultSignificantDate;
    infoVaultSignificantDateRepeat?: InfoVaultSignificantDate;
    chatLlmThreadInfo?: ChatLlmThreadInfo;
}

interface ITaskWorkspace {
    _id: string;
    title: string;
}

interface INotesWorkspace {
    _id: string;
    title: string;
}

const ComponentTaskWorkspaceSelect = ({
    workspaceIds,
    setWorkspaceIds,
}: {
    workspaceIds: string[];
    setWorkspaceIds: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
    const [workspaces, setWorkspaces] = useState<ITaskWorkspace[]>([]);

    useEffect(() => {
        const fetchWorkspaces = async () => {
            try {
                const result = await axiosCustom.post<{
                    docs: ITaskWorkspace[]
                }>('/api/task-workspace/crud/taskWorkspaceGet');

                const docs = result.data.docs;
                setWorkspaces(docs);
            } catch (err) {
                toast.error('Failed to load workspaces');
            }
        };

        fetchWorkspaces();
    }, []);

    return (
        <Fragment>
            {workspaces.length > 0 && (
                <Select
                    value={workspaces.filter(w => workspaceIds.includes(w._id)).map(w => ({ value: w._id, label: w.title }))}
                    isMulti={true}
                    onChange={(selectedOptions) => {
                        if (selectedOptions) {
                            setWorkspaceIds(selectedOptions.map(option => option.value));
                        } else {
                            setWorkspaceIds([]);
                        }
                    }}
                    options={workspaces.map(workspace => ({
                        value: workspace._id,
                        label: workspace.title
                    }))}
                />
            )}
            {workspaces.length === 0 && (
                <div className="p-2 border border-gray-300 rounded-sm hover:bg-gray-200 block w-full focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    No workspaces found
                </div>
            )}
        </Fragment>
    );
};

const ComponentNotesWorkspaceSelect = ({
    workspaceIds,
    setWorkspaceIds,
}: {
    workspaceIds: string[];
    setWorkspaceIds: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
    const [workspaces, setWorkspaces] = useState<INotesWorkspace[]>([]);

    useEffect(() => {
        const fetchWorkspaces = async () => {
            try {
                const result = await axiosCustom.post<{
                    docs: INotesWorkspace[]
                }>('/api/notes-workspace/crud/notesWorkspaceGet');

                const docs = result.data.docs;
                setWorkspaces(docs);
            } catch (err) {
                toast.error('Failed to load workspaces');
            }
        };

        fetchWorkspaces();
    }, []);

    return (
        <Fragment>
            {workspaces.length > 0 && (
                <Select
                    value={workspaces.filter(w => workspaceIds.includes(w._id)).map(w => ({ value: w._id, label: w.title }))}
                    isMulti={true}
                    onChange={(selectedOptions) => {
                        if (selectedOptions) {
                            setWorkspaceIds(selectedOptions.map(option => option.value));
                        } else {
                            setWorkspaceIds([]);
                        }
                    }}
                    options={workspaces.map(workspace => ({
                        value: workspace._id,
                        label: workspace.title
                    }))}
                />
            )}
            {workspaces.length === 0 && (
                <div className="p-2 border border-gray-300 rounded-sm hover:bg-gray-200 block w-full focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    No workspaces found
                </div>
            )}
        </Fragment>
    );
};

const Search = () => {
    // State for search query
    const [search, setSearch] = useState("");
    // State for results list
    const [list, setList] = useState<SearchResultItem[]>([]);
    // State for loading
    const [isLoading, setIsLoading] = useState(false);
    // State for filters visibility
    const [showFilters, setShowFilters] = useState(true);

    // State for collection type filters
    const [filters, setFilters] = useState({
        filterEventTypeTasks: true,
        filterEventTypeLifeEvents: true,
        filterEventTypeNotes: true,
        filterEventTypeInfoVault: true,
        filterEventTypeChatLlm: true,
    });

    // filter -> task
    const [filterTaskWorkspaceIds, setFilterTaskWorkspaceIds] = useState<string[]>([]);
    const [filterTaskIsCompleted, setFilterTaskIsCompleted] = useState('not-completed' as 'all' | 'completed' | 'not-completed');
    const [filterTaskIsArchived, setFilterTaskIsArchived] = useState('not-archived' as 'all' | 'archived' | 'not-archived');

    // filter -> notes
    const [filterNotesWorkspaceIds, setFilterNotesWorkspaceIds] = useState<string[]>([]);

    // filter -> life events
    const [filterLifeEventSearchDiary, setFilterLifeEventSearchDiary] = useState(true as boolean);

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
        filterTaskWorkspaceIds,
        filterTaskIsCompleted,
        filterTaskIsArchived,
        filterNotesWorkspaceIds,
        filterLifeEventSearchDiary,
    ]);

    // Fetch search results from API
    const fetchList = async ({ axiosCancelTokenSource }: { axiosCancelTokenSource: CancelTokenSource }) => {
        setIsLoading(true);
        try {
            const config = {
                method: 'post',
                url: `/api/search/crud/search`,
                data: {
                    search: search,
                    filterEventTypeTasks: filters.filterEventTypeTasks,
                    filterEventTypeLifeEvents: filters.filterEventTypeLifeEvents,
                    filterEventTypeNotes: filters.filterEventTypeNotes,
                    filterEventTypeInfoVault: filters.filterEventTypeInfoVault,
                    filterEventTypeChatLlm: filters.filterEventTypeChatLlm,

                    // filter -> task
                    filterTaskIsCompleted: filterTaskIsCompleted,
                    filterTaskIsArchived: filterTaskIsArchived,
                    filterTaskWorkspaceIds: filterTaskWorkspaceIds,

                    // filter -> notes
                    filterNotesWorkspaceIds: filterNotesWorkspaceIds,

                    // filter -> life events
                    filterLifeEventSearchDiary: filterLifeEventSearchDiary,

                    // pagination
                    page: page,
                    perPage: perPage,
                },
                cancelToken: axiosCancelTokenSource.token,
            }
            const response = await axiosCustom(config);
            setList(response.data.docs);
            setTotalCount(response.data.count);
        } catch (error) {
            if (!axios.isCancel(error)) {
                console.error(error);
                toast.error('Failed to fetch search results');
            }
        } finally {
            setIsLoading(false);
        }
    }

    const renderFilters = () => {
        return (
            <div className="bg-white border border-gray-200 rounded-sm p-4 space-y-4">
                {/* Filter Toggle Button */}
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2"
                    >
                        <LucideFilter className="w-4 h-4" />
                        {showFilters ? 'Hide' : 'Show'}
                    </button>
                </div>

                {showFilters && (
                    <div className="flex flex-col gap-4">
                        {/* Content Type Filters */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Content Types:</label>
                            <div className="flex flex-wrap gap-3">
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
                                        checked={filters.filterEventTypeInfoVault}
                                        onChange={(e) => setFilters({ ...filters, filterEventTypeInfoVault: e.target.checked })}
                                        className="rounded"
                                    />
                                    <span className="text-sm">Info Vault</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.filterEventTypeChatLlm}
                                        onChange={(e) => setFilters({ ...filters, filterEventTypeChatLlm: e.target.checked })}
                                        className="rounded"
                                    />
                                    <span className="text-sm">Chat LLM</span>
                                </label>
                            </div>
                        </div>

                        {/* Task-specific filters */}
                        {filters.filterEventTypeTasks && (
                            <div className="space-y-3 border border-gray-300 rounded-sm p-3">
                                <h4 className="text-sm font-semibold text-gray-700">Task Filters</h4>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">Task Status:</label>
                                    <div className="flex gap-2 mt-1">
                                        <button
                                            className={`px-3 py-1 rounded-sm text-sm ${filterTaskIsCompleted === 'all'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                            onClick={() => setFilterTaskIsCompleted('all')}
                                        >
                                            All
                                        </button>
                                        <button
                                            className={`px-3 py-1 rounded-sm text-sm ${filterTaskIsCompleted === 'completed'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                            onClick={() => setFilterTaskIsCompleted('completed')}
                                        >
                                            Completed
                                        </button>
                                        <button
                                            className={`px-3 py-1 rounded-sm text-sm ${filterTaskIsCompleted === 'not-completed'
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
                                    <label className="text-sm font-medium text-gray-700">Archive Status:</label>
                                    <div className="flex gap-2 mt-1">
                                        <button
                                            className={`px-3 py-1 rounded-sm text-sm ${filterTaskIsArchived === 'all'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                            onClick={() => setFilterTaskIsArchived('all')}
                                        >
                                            All
                                        </button>
                                        <button
                                            className={`px-3 py-1 rounded-sm text-sm ${filterTaskIsArchived === 'archived'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                            onClick={() => setFilterTaskIsArchived('archived')}
                                        >
                                            Archived
                                        </button>
                                        <button
                                            className={`px-3 py-1 rounded-sm text-sm ${filterTaskIsArchived === 'not-archived'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                            onClick={() => setFilterTaskIsArchived('not-archived')}
                                        >
                                            Not Archived
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">Task Workspace:</label>
                                    <ComponentTaskWorkspaceSelect
                                        workspaceIds={filterTaskWorkspaceIds}
                                        setWorkspaceIds={setFilterTaskWorkspaceIds}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Notes-specific filters */}
                        {filters.filterEventTypeNotes && (
                            <div className="space-y-3 border border-gray-300 rounded-sm p-3">
                                <h4 className="text-sm font-semibold text-gray-700">Notes Filters</h4>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">Notes Workspace:</label>
                                    <ComponentNotesWorkspaceSelect
                                        workspaceIds={filterNotesWorkspaceIds}
                                        setWorkspaceIds={setFilterNotesWorkspaceIds}
                                    />
                                </div>
                            </div>
                        )}

                        {/*  */}
                        {/* Life Event-specific filters */}
                        {filters.filterEventTypeLifeEvents && (
                            <div className="space-y-3 border border-gray-300 rounded-sm p-3">
                                <h4 className="text-sm font-semibold text-gray-700">Life Event Filters</h4>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Life Event Search Diary:</label>
                                    <div className="flex gap-2 mt-1">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={filterLifeEventSearchDiary}
                                                onChange={(e) => setFilterLifeEventSearchDiary(e.target.checked)}
                                                className="rounded"
                                            />
                                            <span className="text-sm">Show Diary</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )
    };

    const renderResultItem = (item: SearchResultItem) => {
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
            itemLink = `/user/task?workspace=${item.taskInfo.taskWorkspaceId}&edit-task-id=${item.taskInfo._id}`;
            eventTypeLabel = 'Task';
            eventTypeColor = 'bg-green-100 text-green-800';
            status = item.taskInfo.taskStatus || '';
            priority = item.taskInfo.priority;
            labels = item.taskInfo.labels || [];
        }

        // Extract data from notes collection
        if (item.fromCollection === 'notes' && item.notesInfo) {
            title = item.notesInfo.title;
            description = item.notesInfo.descriptionMarkdown;
            itemDate = item.notesInfo.createdAtUtc;
            itemLink = `/user/notes?action=edit&id=${item.notesInfo._id}&workspace=${item.notesInfo.notesWorkspaceId}`;
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
            itemLink = `/user/life-events?action=edit&id=${item.lifeEventInfo._id}`;
            eventTypeLabel = 'Life Event';
            eventTypeColor = 'bg-purple-100 text-purple-800';
            isStar = item.lifeEventInfo.isStar;
            eventImpact = item.lifeEventInfo.eventImpact;
            tags = item.lifeEventInfo.tags || [];
        }

        // Extract data from info vault
        if ((item.fromCollection === 'infoVaultSignificantDate' || item.fromCollection === 'infoVaultSignificantDateRepeat')) {
            const infoVaultData = item.infoVaultSignificantDate || item.infoVaultSignificantDateRepeat;
            if (infoVaultData) {
                title = infoVaultData.label;
                description = infoVaultData.description;
                itemDate = infoVaultData.dateUtc || infoVaultData.createdAtUtc;
                itemLink = `/user/info-vault?action=edit&id=${infoVaultData._id}`;
                eventTypeLabel = item.fromCollection === 'infoVaultSignificantDateRepeat' ? 'Info Vault (Repeat)' : 'Info Vault';
                eventTypeColor = 'bg-orange-100 text-orange-800';
                tags = infoVaultData.tags || [];
            }
        }

        // Extract data from chat llm threads
        if (item.fromCollection === 'chatLlmThread' && item.chatLlmThreadInfo) {
            title = item.chatLlmThreadInfo.threadTitle;
            description = item.chatLlmThreadInfo.aiSummary;
            itemDate = item.chatLlmThreadInfo.createdAtUtc;
            itemLink = `/user/chat?id=${item.chatLlmThreadInfo._id}`;
            eventTypeLabel = 'Chat LLM';
            eventTypeColor = 'bg-pink-100 text-pink-800';
            tags = item.chatLlmThreadInfo.tagsAi || [];
        }

        return (
            <div
                key={item._id}
                className="bg-white border border-gray-200 rounded-sm p-4 hover:shadow-md transition-shadow"
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        {/* Header with type badge and link */}
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs px-2 py-1 rounded-sm font-medium ${eventTypeColor}`}>
                                {eventTypeLabel}
                            </span>
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
                            {item.fromCollection === 'tasks' && item.taskInfo && (
                                <Fragment>
                                    <span className={`px-2 py-0.5 rounded-sm ${item.taskInfo.isCompleted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {item.taskInfo.isCompleted ? 'Completed' : 'Not Completed'}
                                    </span>
                                    {item.taskInfo.isArchived && (
                                        <span className="px-2 py-0.5 rounded-sm bg-gray-200 text-gray-600">
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
                            
                            {/* Tags/Labels */}
                            {(labels.length > 0 || tags.length > 0) && (
                                <Fragment>
                                    {labels.slice(0, 5).map((label: string, idx: number) => (
                                        <span
                                            key={`label-${idx}`}
                                            className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded"
                                        >
                                            {label}
                                        </span>
                                    ))}
                                    {tags.slice(0, 5).map((tag: string, idx: number) => (
                                        <span
                                            key={`tag-${idx}`}
                                            className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </Fragment>
                            )}
                        </div>


                        {/* Link */}
                        <div className="flex gap-2 mt-2">
                            {/* Open in new tab */}
                            <Link
                                to={itemLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs font-medium mr-3"
                            >
                                <LucideExternalLink className="w-4 h-4" />
                                Open in new tab
                            </Link>
                            {/* Open here */}
                            <Link
                                to={itemLink}
                                className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs font-medium"
                            >
                                <LucideExternalLink className="w-4 h-4" />
                                Open in current tab
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Search</h1>
                    <p className="text-gray-600">Search across all your tasks, notes, life events, and more</p>
                </div>

                {/* Search Input */}
                <div className="mb-6">
                    <div className="relative">
                        <LucideSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search for anything..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6">
                    {renderFilters()}
                </div>

                {/* Results Count */}
                <div className="mb-4">
                    <div className="text-sm text-gray-600 bg-white border border-gray-200 rounded-sm px-4 py-2">
                        {isLoading ? (
                            <span>Loading...</span>
                        ) : (
                            <span>
                                Found {totalCount} result{totalCount !== 1 ? 's' : ''}
                                {page > 1 && ` (Page ${page})`}
                            </span>
                        )}
                    </div>
                </div>

                {/* Results List */}
                <div className="space-y-4 mb-6">
                    {list.map((item) => renderResultItem(item))}
                </div>

                {/* Empty State */}
                {list.length === 0 && !isLoading && (
                    <div className="text-center py-12 bg-white border border-gray-200 rounded-sm">
                        <LucideSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {search ? 'No results found' : 'Start searching'}
                        </h3>
                        <p className="text-gray-600">
                            {search
                                ? 'Try adjusting your filters or search terms'
                                : 'Enter a search query to find tasks, notes, life events, and more'
                            }
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {totalCount > perPage && (
                    <div className="flex justify-center items-center gap-3 mt-6">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="px-4 py-2 border border-gray-300 rounded-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors bg-white"
                        >
                            ← Previous
                        </button>
                        <span className="px-3 py-2 text-sm text-gray-600">
                            Page {page} of {Math.ceil(totalCount / perPage)}
                        </span>
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page >= Math.ceil(totalCount / perPage)}
                            className="px-4 py-2 border border-gray-300 rounded-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors bg-white"
                        >
                            Next →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;