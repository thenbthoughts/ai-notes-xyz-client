import { Link } from 'react-router-dom';
import {
    LucideList,
    LucideLogIn,
    LucideUserPlus,
    LucideLoader,
    LucideCalendar1,
    LucideFileText,
    LucideBarChart3,
    LucideClock,
    LucideActivity,
    LucidePlus,
    LucideSearch,
    LucideThermometer,
    LucideRefreshCw,
    LucideChevronDown,
    LucideChevronUp,
    LucideX,
    LucideCheck,
    LucideZap,
    LucideBell,
    LucideEye,
    LucideEyeOff,
    LucideBrain,
    LucideCheckSquare,
    LucideBookOpen,
    LucideHeart,
    LucideShield,
    LucideCog,
    LucidePower,
    LucideHelpCircle,
    LucideGitBranch,
    LucideGrid3X3,
    LucideChevronRight,
    LucideMoreHorizontal,
    LucideEdit3,
    LucideHistory,
    LucideCopy,
    LucideDownload,
    LucideUpload,
    LucideShare2,
    LucideBookmark,
    LucideBot,
    LucideLightbulb,
    LucideTrendingUp,
    LucideMessageCircle,
    LucideTrash2,
    LucideMove,
    LucideMousePointer,
    LucideArchive,
    LucideTag,
    LucideStar,
    LucidePin,
    LucideRotateCcw,
    LucideCloud,
    LucideCloudUpload,
    LucidePalette,
    LucideLayout,
    LucideMaximize,
} from 'lucide-react';
import { useAtomValue } from 'jotai';
import { Fragment, useEffect, useState, useCallback, useRef } from 'react';
import axiosCustom from '../../../../config/axiosCustom';

import useResponsiveScreen from '../../../../hooks/useResponsiveScreen';
import stateJotaiAuthAtom from '../../../../jotai/stateJotaiAuth';

import ComponentFromBrithdayToToday from '../ComponentFromBrithdayToToday';
import ComponentPinnedTask from '../ComponentPinnedTask';

interface Activity {
    action: string;
    time: string;
    type: 'task' | 'note' | 'event';
    id: number;
}

const UserHomepageBackupDelete = () => {
    const authState = useAtomValue(stateJotaiAuthAtom);
    const screenSize = useResponsiveScreen();

    const [name, setName] = useState('');
    const [quickStats, setQuickStats] = useState({
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        totalNotes: 0
    });
    const [currentTime, setCurrentTime] = useState(new Date());
    const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
    
    // Interactive state
    const [isStatsExpanded, setIsStatsExpanded] = useState(true);
    const [isTimeExpanded, setIsTimeExpanded] = useState(true);
    const [isActivityExpanded, setIsActivityExpanded] = useState(true);
    const [isActionsExpanded, setIsActionsExpanded] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [is24HourFormat, setIs24HourFormat] = useState(false);
    const [showQuickTaskModal, setShowQuickTaskModal] = useState(false);
    const [quickTaskText, setQuickTaskText] = useState('');
    const [notification, setNotification] = useState('');
    const [completionPercentage, setCompletionPercentage] = useState(0);
    
    // Navigation card interactions
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [cardBadges] = useState({
        chat: 3,
        tasks: 7,
        notes: 12,
        lifeEvents: 2,
        infoVault: 0,
        settings: 1
    });
    const [cardAnimations, setCardAnimations] = useState<{[key: string]: boolean}>({});
    const [showCardPreview, setShowCardPreview] = useState<string | null>(null);
    const hoverTimeoutRef = useRef<number | null>(null);
    
    // List view states
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
        aiSummary: true,
        productivity: true,
        personal: true,
        system: true,
        auth: true
    });
    const [searchFilter, setSearchFilter] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'priority' | 'usage'>('name');
    const [showOnlyWithBadges, setShowOnlyWithBadges] = useState(false);
    
    // Action states
    const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
    const [showHistoryModal, setShowHistoryModal] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState<string | null>(null);
    const [showEditModal, setShowEditModal] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
    const [showExportModal, setShowExportModal] = useState<string | null>(null);
    const [showImportModal, setShowImportModal] = useState<string | null>(null);
    const [showShareModal, setShowShareModal] = useState<string | null>(null);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [showCustomizeModal, setShowCustomizeModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [aiInsights] = useState({
        totalProductivity: 85,
        weeklyTrend: '+12%',
        topCategory: 'Tasks',
        suggestions: [
            'Complete 3 more tasks to reach your weekly goal',
            'Your note-taking has increased by 40% this week',
            'Consider scheduling time for life events planning'
        ],
        recentActivity: 'High activity in productivity tools',
        nextRecommendation: 'Review and organize your info vault'
    });

    useEffect(() => {
        fetchUser();
        fetchQuickStats();
        
        // Update time every second
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, [])

    const fetchUser = async () => {
        try {
            const response = await axiosCustom.post(
                `/api/user/crud/getUser`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                }
            );
            const fetchedName = response.data.name;
            if (typeof fetchedName === 'string') {
                setName(fetchedName);
            } else {
                console.error("Fetched name is not a string:", fetchedName);
            }
        } catch (error) {
            console.error("Error fetching user:", error);
        }
    };

    const fetchQuickStats = async () => {
        try {
            setIsLoading(true);
            // Mock data for now - replace with actual API calls
            const newStats = {
                totalTasks: Math.floor(Math.random() * 50) + 10,
                completedTasks: Math.floor(Math.random() * 30) + 5,
                pendingTasks: Math.floor(Math.random() * 20) + 3,
                totalNotes: Math.floor(Math.random() * 100) + 20
            };
            
            setQuickStats(newStats);
            
            // Calculate completion percentage
            const percentage = newStats.totalTasks > 0 
                ? Math.round((newStats.completedTasks / newStats.totalTasks) * 100) 
                : 0;
            setCompletionPercentage(percentage);
            
            // Mock recent activity
            setRecentActivity([
                { action: 'Created new task', time: '2 minutes ago', type: 'task', id: 1 },
                { action: 'Updated note', time: '1 hour ago', type: 'note', id: 2 },
                { action: 'Completed task', time: '3 hours ago', type: 'task', id: 3 },
                { action: 'Added life event', time: '5 hours ago', type: 'event', id: 4 }
            ]);
            
            setIsLoading(false);
            showNotification('Stats refreshed successfully!');
        } catch (error) {
            console.error("Error fetching stats:", error);
            setIsLoading(false);
            showNotification('Error refreshing stats');
        }
    };

    // Interactive functions
    const showNotification = (message: string) => {
        setNotification(message);
        setTimeout(() => setNotification(''), 3000);
    };

    const handleRefreshStats = () => {
        fetchQuickStats();
    };

    const handleQuickTaskSubmit = () => {
        if (quickTaskText.trim()) {
            // Mock task creation
            showNotification(`Task "${quickTaskText}" created!`);
            setQuickTaskText('');
            setShowQuickTaskModal(false);
            // Refresh stats to show new task
            setTimeout(() => fetchQuickStats(), 500);
        }
    };

    const toggleTimeFormat = () => {
        setIs24HourFormat(!is24HourFormat);
        showNotification(`Switched to ${!is24HourFormat ? '24' : '12'}-hour format`);
    };

    const handleKeyPress = useCallback((event: KeyboardEvent) => {
        // Keyboard shortcuts
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 't':
                    event.preventDefault();
                    setShowQuickTaskModal(true);
                    break;
                case 'r':
                    event.preventDefault();
                    handleRefreshStats();
                    break;
                default:
                    break;
            }
        }
        if (event.key === 'Escape' && showQuickTaskModal) {
            setShowQuickTaskModal(false);
        }
    }, [showQuickTaskModal]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [handleKeyPress]);

    // Cleanup hover timeout on unmount
    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
        };
    }, []);

    // Close action menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showActionMenu) {
                const target = event.target as Element;
                if (!target.closest('[data-action-menu]')) {
                    setShowActionMenu(null);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showActionMenu]);

    // Interactive card functions
    const handleCardClick = (cardId: string) => {
        setCardAnimations(prev => ({ ...prev, [cardId]: true }));
        setTimeout(() => {
            setCardAnimations(prev => ({ ...prev, [cardId]: false }));
        }, 200);
        showNotification(`Opening ${cardId}...`);
    };

    const handleCardHover = (cardId: string | null) => {
        // Clear existing timeout
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
        
        setHoveredCard(cardId);
        
        if (cardId) {
            hoverTimeoutRef.current = setTimeout(() => {
                setShowCardPreview(cardId);
            }, 800);
        } else {
            setShowCardPreview(null);
        }
    };

    const getBadgeCount = (cardId: string): number => {
        return (cardBadges as any)[cardId] || 0;
    };

    const getCardPreviewData = (cardId: string) => {
        const previews: {[key: string]: any} = {
            chat: {
                title: "Recent Conversations",
                items: ["AI Code Review", "Task Planning", "Research Help"],
                stats: `${cardBadges.chat} new messages`
            },
            tasks: {
                title: "Upcoming Tasks",
                items: ["Fix homepage bug", "Update documentation", "Code review"],
                stats: `${cardBadges.tasks} pending tasks`
            },
            notes: {
                title: "Recent Notes",
                items: ["Project Ideas", "Meeting Notes", "Code Snippets"],
                stats: `${cardBadges.notes} total notes`
            },
            lifeEvents: {
                title: "Upcoming Events",
                items: ["Birthday Party", "Work Meeting"],
                stats: `${cardBadges.lifeEvents} this week`
            },
            infoVault: {
                title: "Secure Information",
                items: ["Passwords", "Documents", "Keys"],
                stats: "All secured"
            },
            settings: {
                title: "Configuration",
                items: ["API Keys", "Preferences", "Account"],
                stats: `${cardBadges.settings} needs attention`
            }
        };
        return previews[cardId];
    };

    // Action handlers
    const handleItemAction = (itemId: string, action: string) => {
        setIsProcessing(itemId);
        
        setTimeout(() => {
            switch (action) {
                case 'add':
                    setShowAddModal(itemId);
                    showNotification(`Opening add dialog for ${itemId}`);
                    break;
                case 'edit':
                    setShowEditModal(itemId);
                    showNotification(`Opening edit for ${itemId}`);
                    break;
                case 'delete':
                    setShowDeleteModal(itemId);
                    showNotification(`Delete confirmation for ${itemId}`);
                    break;
                case 'history':
                    setShowHistoryModal(itemId);
                    showNotification(`Viewing history for ${itemId}`);
                    break;
                case 'copy':
                    showNotification(`${itemId} copied successfully`);
                    break;
                case 'export':
                    setShowExportModal(itemId);
                    showNotification(`Export options for ${itemId}`);
                    break;
                case 'import':
                    setShowImportModal(itemId);
                    showNotification(`Import dialog opened for ${itemId}`);
                    break;
                case 'share':
                    setShowShareModal(itemId);
                    showNotification(`Sharing options for ${itemId}`);
                    break;
                case 'bookmark':
                    showNotification(`${itemId} bookmarked successfully`);
                    break;
                case 'archive':
                    showNotification(`${itemId} archived successfully`);
                    break;
                case 'pin':
                    showNotification(`${itemId} pinned to top`);
                    break;
                case 'unpin':
                    showNotification(`${itemId} unpinned`);
                    break;
                case 'star':
                    showNotification(`${itemId} starred`);
                    break;
                case 'tag':
                    showNotification(`Adding tags to ${itemId}`);
                    break;
                case 'move':
                    showNotification(`Moving ${itemId}`);
                    break;
                case 'sync':
                    showNotification(`Syncing ${itemId} with cloud`);
                    break;
                default:
                    showNotification(`Action ${action} for ${itemId}`);
            }
            setIsProcessing(null);
        }, 500);
        
        setShowActionMenu(null);
    };

    // Bulk action handlers
    const handleBulkAction = (action: string) => {
        if (selectedItems.length === 0) {
            showNotification('No items selected');
            return;
        }

        setIsProcessing('bulk');
        
        setTimeout(() => {
            switch (action) {
                case 'delete':
                    showNotification(`Deleted ${selectedItems.length} items`);
                    setSelectedItems([]);
                    break;
                case 'archive':
                    showNotification(`Archived ${selectedItems.length} items`);
                    setSelectedItems([]);
                    break;
                case 'export':
                    showNotification(`Exported ${selectedItems.length} items`);
                    break;
                case 'tag':
                    showNotification(`Tagged ${selectedItems.length} items`);
                    break;
                case 'move':
                    showNotification(`Moved ${selectedItems.length} items`);
                    break;
                default:
                    showNotification(`Bulk ${action} completed`);
            }
            setIsProcessing(null);
        }, 1000);
        
        setShowBulkActions(false);
    };

    // Toggle item selection
    const toggleItemSelection = (itemId: string) => {
        setSelectedItems(prev => 
            prev.includes(itemId) 
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    // Select all items
    const selectAllItems = () => {
        const allItemIds: string[] = [];
        Object.values(filteredSections()).forEach((section: any) => {
            section.items.forEach((item: any) => {
                allItemIds.push(item.id);
            });
        });
        setSelectedItems(allItemIds);
    };

    // Clear selection
    const clearSelection = () => {
        setSelectedItems([]);
        setShowBulkActions(false);
    };

    const getAvailableActions = (itemId: string) => {
        const commonActions = [
            { id: 'add', label: 'Add New', icon: LucidePlus, color: 'green' },
            { id: 'edit', label: 'Edit', icon: LucideEdit3, color: 'blue' },
            { id: 'copy', label: 'Duplicate', icon: LucideCopy, color: 'gray' },
            { id: 'history', label: 'View History', icon: LucideHistory, color: 'blue' },
            { id: 'bookmark', label: 'Bookmark', icon: LucideBookmark, color: 'yellow' },
            { id: 'star', label: 'Star', icon: LucideStar, color: 'yellow' },
            { id: 'pin', label: 'Pin to Top', icon: LucidePin, color: 'orange' },
            { id: 'tag', label: 'Add Tags', icon: LucideTag, color: 'purple' },
            { id: 'move', label: 'Move', icon: LucideMove, color: 'indigo' },
            { id: 'archive', label: 'Archive', icon: LucideArchive, color: 'gray' },
            { id: 'delete', label: 'Delete', icon: LucideTrash2, color: 'red' }
        ];

        const specificActions: { [key: string]: any[] } = {
            'chat': [
                { id: 'export', label: 'Export Conversations', icon: LucideDownload, color: 'indigo' },
                { id: 'share', label: 'Share Chat', icon: LucideShare2, color: 'purple' },
                { id: 'sync', label: 'Sync to Cloud', icon: LucideCloudUpload, color: 'blue' }
            ],
            'tasks': [
                { id: 'export', label: 'Export Tasks', icon: LucideDownload, color: 'indigo' },
                { id: 'import', label: 'Import Tasks', icon: LucideUpload, color: 'green' },
                { id: 'sync', label: 'Sync Progress', icon: LucideRotateCcw, color: 'blue' }
            ],
            'notes': [
                { id: 'export', label: 'Export Notes', icon: LucideDownload, color: 'indigo' },
                { id: 'import', label: 'Import Notes', icon: LucideUpload, color: 'green' },
                { id: 'share', label: 'Share Notes', icon: LucideShare2, color: 'purple' },
                { id: 'sync', label: 'Sync to Cloud', icon: LucideCloud, color: 'blue' }
            ],
            'lifeEvents': [
                { id: 'export', label: 'Export Events', icon: LucideDownload, color: 'indigo' },
                { id: 'share', label: 'Share Timeline', icon: LucideShare2, color: 'purple' }
            ],
            'infoVault': [
                { id: 'export', label: 'Export Data', icon: LucideDownload, color: 'indigo' },
                { id: 'import', label: 'Import Data', icon: LucideUpload, color: 'green' },
                { id: 'sync', label: 'Secure Sync', icon: LucideCloudUpload, color: 'blue' }
            ],
            'settings': [
                { id: 'export', label: 'Export Config', icon: LucideDownload, color: 'indigo' },
                { id: 'import', label: 'Import Config', icon: LucideUpload, color: 'green' },
                { id: 'sync', label: 'Sync Settings', icon: LucideRotateCcw, color: 'blue' }
            ],
            'productivity-insights': [
                { id: 'export', label: 'Export Report', icon: LucideDownload, color: 'indigo' },
                { id: 'share', label: 'Share Insights', icon: LucideShare2, color: 'purple' }
            ],
            'ai-suggestions': [
                { id: 'export', label: 'Export Suggestions', icon: LucideDownload, color: 'indigo' },
                { id: 'sync', label: 'Refresh AI Data', icon: LucideRotateCcw, color: 'blue' }
            ],
            'smart-summary': [
                { id: 'export', label: 'Export Summary', icon: LucideDownload, color: 'indigo' },
                { id: 'share', label: 'Share Summary', icon: LucideShare2, color: 'purple' }
            ]
        };

        return [...commonActions, ...(specificActions[itemId] || [])];
    };

    // Get bulk actions
    const getBulkActions = () => [
        { id: 'export', label: 'Export Selected', icon: LucideDownload, color: 'indigo' },
        { id: 'tag', label: 'Add Tags', icon: LucideTag, color: 'purple' },
        { id: 'move', label: 'Move to Folder', icon: LucideMove, color: 'indigo' },
        { id: 'archive', label: 'Archive All', icon: LucideArchive, color: 'gray' },
        { id: 'delete', label: 'Delete All', icon: LucideTrash2, color: 'red' }
    ];

    // Navigation data structure for list view
    const navigationSections = {
        aiSummary: {
            title: "AI Summary & Insights",
            icon: LucideBot,
            color: "violet",
            priority: 0,
            items: [
                {
                    id: 'productivity-insights',
                    title: 'Productivity Insights',
                    description: `${aiInsights.totalProductivity}% productivity score (${aiInsights.weeklyTrend})`,
                    icon: LucideTrendingUp,
                    path: '/user/insights',
                    color: 'violet',
                    priority: 1,
                    badges: 2,
                    status: 'trending',
                    lastUsed: 'Updated now',
                    actionable: true
                },
                {
                    id: 'ai-suggestions',
                    title: 'AI Suggestions',
                    description: `${aiInsights.suggestions.length} new recommendations`,
                    icon: LucideLightbulb,
                    path: '/user/ai-suggestions',
                    color: 'amber',
                    priority: 2,
                    badges: aiInsights.suggestions.length,
                    status: 'active',
                    lastUsed: '5 min ago',
                    actionable: true
                },
                {
                    id: 'smart-summary',
                    title: 'Smart Summary',
                    description: aiInsights.recentActivity,
                    icon: LucideMessageCircle,
                    path: '/user/summary',
                    color: 'cyan',
                    priority: 3,
                    badges: 1,
                    status: 'updated',
                    lastUsed: '10 min ago',
                    actionable: true
                }
            ]
        },
        productivity: {
            title: "Productivity",
            icon: LucideZap,
            color: "blue",
            priority: 1,
            items: [
                {
                    id: 'chat',
                    title: 'Chat',
                    description: 'AI Assistant',
                    icon: LucideBrain,
                    path: '/user/chat',
                    color: 'purple',
                    priority: 1,
                    badges: cardBadges.chat,
                    status: 'online',
                    lastUsed: '2 min ago',
                    actionable: true,
                    totalCount: 25,
                    recentActivity: 'Last conversation: Code review'
                },
                {
                    id: 'tasks',
                    title: 'Tasks',
                    description: 'Manage Tasks',
                    icon: LucideCheckSquare,
                    path: '/user/task',
                    color: 'blue',
                    priority: 2,
                    badges: cardBadges.tasks,
                    status: 'active',
                    progress: completionPercentage,
                    lastUsed: '5 min ago',
                    actionable: true,
                    totalCount: 42,
                    recentActivity: 'Added: Fix homepage bug'
                },
                {
                    id: 'notes',
                    title: 'Notes',
                    description: 'Knowledge Base',
                    icon: LucideBookOpen,
                    path: '/user/notes',
                    color: 'green',
                    priority: 3,
                    badges: cardBadges.notes,
                    status: 'active',
                    lastUsed: '1 hour ago',
                    actionable: true,
                    totalCount: 156,
                    recentActivity: 'Modified: Project Ideas'
                }
            ]
        },
        personal: {
            title: "Personal",
            icon: LucideHeart,
            color: "pink",
            priority: 2,
            items: [
                {
                    id: 'lifeEvents',
                    title: 'Life Events',
                    description: 'Personal Timeline',
                    icon: LucideHeart,
                    path: '/user/life-events',
                    color: 'pink',
                    priority: 1,
                    badges: cardBadges.lifeEvents,
                    status: 'upcoming',
                    lastUsed: '3 hours ago',
                    actionable: true,
                    totalCount: 18,
                    recentActivity: 'Upcoming: Birthday Party'
                },
                {
                    id: 'infoVault',
                    title: 'Info Vault',
                    description: 'Secure Storage',
                    icon: LucideShield,
                    path: '/user/info-vault',
                    color: 'orange',
                    priority: 2,
                    badges: cardBadges.infoVault,
                    status: 'secure',
                    lastUsed: '1 day ago',
                    actionable: true,
                    totalCount: 89,
                    recentActivity: 'All data encrypted and secure'
                }
            ]
        },
        system: {
            title: "System",
            icon: LucideCog,
            color: "gray",
            priority: 3,
            items: [
                {
                    id: 'settings',
                    title: 'Settings',
                    description: 'Configuration',
                    icon: LucideCog,
                    path: '/user/setting',
                    color: 'gray',
                    priority: 1,
                    badges: cardBadges.settings,
                    status: 'warning',
                    lastUsed: '2 days ago',
                    actionable: true,
                    totalCount: 24,
                    recentActivity: 'API keys need attention'
                },
                {
                    id: 'about',
                    title: 'About',
                    description: 'App Information',
                    icon: LucideHelpCircle,
                    path: '/about',
                    color: 'teal',
                    priority: 2,
                    badges: 0,
                    status: 'info',
                    lastUsed: '1 week ago',
                    actionable: false,
                    totalCount: 1,
                    recentActivity: 'Version 2.1.0'
                },
                {
                    id: 'git',
                    title: 'Git',
                    description: 'Self-host Guide',
                    icon: LucideGitBranch,
                    path: 'https://ai-notes.xyz/docs/selfhost/selfhost-docker-build',
                    color: 'indigo',
                    priority: 3,
                    badges: 0,
                    status: 'external',
                    isExternal: true,
                    lastUsed: 'Never',
                    actionable: false,
                    totalCount: 0,
                    recentActivity: 'External documentation'
                }
            ]
        },
        auth: {
            title: "Authentication",
            icon: LucidePower,
            color: "red",
            priority: 4,
            items: [
                {
                    id: 'logout',
                    title: 'Logout',
                    description: 'Sign Out',
                    icon: LucidePower,
                    path: '/logout',
                    color: 'red',
                    priority: 1,
                    badges: 0,
                    status: 'warning',
                    lastUsed: 'Session active',
                    actionable: false,
                    totalCount: 0,
                    recentActivity: 'Active session'
                }
            ]
        }
    };

    // List management functions
    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const filteredSections = () => {
        const sections = { ...navigationSections } as any;
        
        // Filter based on search
        if (searchFilter) {
            Object.keys(sections).forEach((sectionKey: string) => {
                sections[sectionKey].items = sections[sectionKey].items.filter((item: any) =>
                    item.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
                    item.description.toLowerCase().includes(searchFilter.toLowerCase())
                );
                // Remove empty sections
                if (sections[sectionKey].items.length === 0) {
                    delete sections[sectionKey];
                }
            });
        }

        // Filter to show only items with badges
        if (showOnlyWithBadges) {
            Object.keys(sections).forEach((sectionKey: string) => {
                sections[sectionKey].items = sections[sectionKey].items.filter((item: any) => item.badges > 0);
                // Remove empty sections
                if (sections[sectionKey].items.length === 0) {
                    delete sections[sectionKey];
                }
            });
        }

        // Sort items within sections
        Object.keys(sections).forEach((sectionKey: string) => {
            sections[sectionKey].items.sort((a: any, b: any) => {
                switch (sortBy) {
                    case 'priority':
                        return a.priority - b.priority;
                    case 'usage':
                        // Mock usage sorting based on lastUsed
                        const usageOrder = ['2 min ago', '5 min ago', '1 hour ago', '3 hours ago', '1 day ago', '2 days ago', '1 week ago', 'Never', 'Session active'];
                        return usageOrder.indexOf(a.lastUsed) - usageOrder.indexOf(b.lastUsed);
                    default: // name
                        return a.title.localeCompare(b.title);
                }
            });
        });

        return sections;
    };

    // Quick Stats Component
    const QuickStatsComponent = () => (
        <div className="text-left p-3 border border-indigo-400 rounded-sm shadow-md bg-gradient-to-r from-indigo-100 to-indigo-300 mb-2 hover:bg-indigo-200 transition duration-300">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold text-indigo-800">
                    <LucideBarChart3 size={20} className="inline mr-1" style={{ position: 'relative', top: '-2px' }} />
                    Quick Stats
                </h2>
                <div className="flex gap-1">
                    <button
                        onClick={handleRefreshStats}
                        disabled={isLoading}
                        className="p-1 rounded-sm bg-white bg-opacity-50 hover:bg-opacity-70 transition duration-200"
                        title="Refresh Stats (Ctrl+R)"
                    >
                        <LucideRefreshCw size={16} className={`text-indigo-600 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => setIsStatsExpanded(!isStatsExpanded)}
                        className="p-1 rounded-sm bg-white bg-opacity-50 hover:bg-opacity-70 transition duration-200"
                        title="Toggle Expand"
                    >
                        {isStatsExpanded ? 
                            <LucideChevronUp size={16} className="text-indigo-600" /> : 
                            <LucideChevronDown size={16} className="text-indigo-600" />
                        }
                    </button>
                </div>
            </div>
            
            {isStatsExpanded && (
                <div className="space-y-2">
                    {/* Progress Bar */}
                    <div className="bg-white bg-opacity-50 rounded-sm p-2">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-indigo-600">Completion Progress</span>
                            <span className="text-xs font-semibold text-indigo-700">{completionPercentage}%</span>
                        </div>
                        <div className="w-full bg-indigo-200 rounded-sm h-2">
                            <div 
                                className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-sm transition-all duration-500 ease-out"
                                style={{ width: `${completionPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div 
                            className="bg-white bg-opacity-50 rounded-sm p-2 cursor-pointer hover:bg-opacity-70 transition duration-200 transform hover:scale-105"
                            onClick={() => showNotification('Total Tasks: ' + quickStats.totalTasks)}
                        >
                            <div className="font-semibold text-indigo-700">{quickStats.totalTasks}</div>
                            <div className="text-xs text-indigo-600">Total Tasks</div>
                        </div>
                        <div 
                            className="bg-white bg-opacity-50 rounded-sm p-2 cursor-pointer hover:bg-opacity-70 transition duration-200 transform hover:scale-105"
                            onClick={() => showNotification('Completed Tasks: ' + quickStats.completedTasks)}
                        >
                            <div className="font-semibold text-green-700">{quickStats.completedTasks}</div>
                            <div className="text-xs text-green-600">Completed</div>
                        </div>
                        <div 
                            className="bg-white bg-opacity-50 rounded-sm p-2 cursor-pointer hover:bg-opacity-70 transition duration-200 transform hover:scale-105"
                            onClick={() => showNotification('Pending Tasks: ' + quickStats.pendingTasks)}
                        >
                            <div className="font-semibold text-orange-700">{quickStats.pendingTasks}</div>
                            <div className="text-xs text-orange-600">Pending</div>
                        </div>
                        <div 
                            className="bg-white bg-opacity-50 rounded-sm p-2 cursor-pointer hover:bg-opacity-70 transition duration-200 transform hover:scale-105"
                            onClick={() => showNotification('Total Notes: ' + quickStats.totalNotes)}
                        >
                            <div className="font-semibold text-blue-700">{quickStats.totalNotes}</div>
                            <div className="text-xs text-blue-600">Total Notes</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // Time & Weather Component
    const TimeWeatherComponent = () => (
        <div className="text-left p-3 border border-teal-400 rounded-sm shadow-md bg-gradient-to-r from-teal-100 to-teal-300 mb-2 hover:bg-teal-200 transition duration-300">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold text-teal-800">
                    <LucideClock size={20} className="inline mr-1" style={{ position: 'relative', top: '-2px' }} />
                    Current Time
                </h2>
                <div className="flex gap-1">
                    <button
                        onClick={toggleTimeFormat}
                        className="p-1 rounded-sm bg-white bg-opacity-50 hover:bg-opacity-70 transition duration-200"
                        title={`Switch to ${is24HourFormat ? '12' : '24'}-hour format`}
                    >
                        {is24HourFormat ? 
                            <LucideEye size={16} className="text-teal-600" /> : 
                            <LucideEyeOff size={16} className="text-teal-600" />
                        }
                    </button>
                    <button
                        onClick={() => setIsTimeExpanded(!isTimeExpanded)}
                        className="p-1 rounded-sm bg-white bg-opacity-50 hover:bg-opacity-70 transition duration-200"
                        title="Toggle Expand"
                    >
                        {isTimeExpanded ? 
                            <LucideChevronUp size={16} className="text-teal-600" /> : 
                            <LucideChevronDown size={16} className="text-teal-600" />
                        }
                    </button>
                </div>
            </div>
            
            {isTimeExpanded && (
                <div className="text-sm text-teal-700 space-y-2">
                    <div 
                        className="font-semibold text-lg bg-white bg-opacity-50 rounded-sm p-2 cursor-pointer hover:bg-opacity-70 transition duration-200"
                        onClick={() => showNotification('Current time: ' + currentTime.toLocaleTimeString())}
                    >
                        {is24HourFormat 
                            ? currentTime.toLocaleTimeString('en-GB', { hour12: false })
                            : currentTime.toLocaleTimeString()
                        }
                    </div>
                    <div className="text-xs bg-white bg-opacity-50 rounded-sm p-2">
                        {currentTime.toLocaleDateString(undefined, { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </div>
                    <div className="flex items-center bg-white bg-opacity-50 rounded-sm p-2">
                        <LucideThermometer size={16} className="mr-2" />
                        <div>
                            <div className="text-xs font-semibold">Weather: Sunny</div>
                            <div className="text-xs">72°F | Feels like 75°F</div>
                        </div>
                    </div>
                    <div className="text-xs bg-white bg-opacity-50 rounded-sm p-2">
                        <div className="flex justify-between">
                            <span>Sunrise</span>
                            <span>6:42 AM</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Sunset</span>
                            <span>7:18 PM</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // Recent Activity Component
    const RecentActivityComponent = () => (
        <div className="text-left p-3 border border-rose-400 rounded-sm shadow-md bg-gradient-to-r from-rose-100 to-rose-300 mb-2 hover:bg-rose-200 transition duration-300">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold text-rose-800">
                    <LucideActivity size={20} className="inline mr-1" style={{ position: 'relative', top: '-2px' }} />
                    Recent Activity
                </h2>
                <button
                    onClick={() => setIsActivityExpanded(!isActivityExpanded)}
                    className="p-1 rounded-sm bg-white bg-opacity-50 hover:bg-opacity-70 transition duration-200"
                    title="Toggle Expand"
                >
                    {isActivityExpanded ? 
                        <LucideChevronUp size={16} className="text-rose-600" /> : 
                        <LucideChevronDown size={16} className="text-rose-600" />
                    }
                </button>
            </div>
            
            {isActivityExpanded && (
                <div className="space-y-1 max-h-40 overflow-y-auto">
                    {recentActivity.map((activity) => (
                        <div 
                            key={activity.id} 
                            className="text-xs bg-white bg-opacity-50 rounded-sm p-2 cursor-pointer hover:bg-opacity-70 transition duration-200 transform hover:scale-105"
                            onClick={() => showNotification(`Activity: ${activity.action} - ${activity.time}`)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="font-semibold text-rose-700">{activity.action}</div>
                                <div className="text-rose-600">
                                    {activity.type === 'task' && <LucideList size={12} />}
                                    {activity.type === 'note' && <LucideFileText size={12} />}
                                    {activity.type === 'event' && <LucideCalendar1 size={12} />}
                                </div>
                            </div>
                            <div className="text-rose-600">{activity.time}</div>
                        </div>
                    ))}
                    {recentActivity.length === 0 && (
                        <div className="text-xs text-rose-600 text-center py-4">
                            No recent activity
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    // Quick Actions Component
    const QuickActionsComponent = () => (
        <div className="text-left p-3 border border-amber-400 rounded-sm shadow-md bg-gradient-to-r from-amber-100 to-amber-300 mb-2 hover:bg-amber-200 transition duration-300">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold text-amber-800">
                    <LucideZap size={20} className="inline mr-1" style={{ position: 'relative', top: '-2px' }} />
                    Quick Actions
                </h2>
                <button
                    onClick={() => setIsActionsExpanded(!isActionsExpanded)}
                    className="p-1 rounded-sm bg-white bg-opacity-50 hover:bg-opacity-70 transition duration-200"
                    title="Toggle Expand"
                >
                    {isActionsExpanded ? 
                        <LucideChevronUp size={16} className="text-amber-600" /> : 
                        <LucideChevronDown size={16} className="text-amber-600" />
                    }
                </button>
            </div>
            
            {isActionsExpanded && (
                <div className="space-y-2">
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setShowQuickTaskModal(true)}
                            className="flex items-center px-3 py-1 bg-white bg-opacity-70 rounded-sm text-xs font-medium text-amber-700 hover:bg-opacity-90 transition duration-200 transform hover:scale-105"
                            title="Quick Task (Ctrl+T)"
                        >
                            <LucidePlus size={14} className="mr-1" />
                            Quick Task
                        </button>
                        <Link 
                            to="/user/task?add-task-dialog=yes" 
                            className="flex items-center px-3 py-1 bg-white bg-opacity-70 rounded-sm text-xs font-medium text-amber-700 hover:bg-opacity-90 transition duration-200 transform hover:scale-105"
                        >
                            <LucideList size={14} className="mr-1" />
                            Full Task
                        </Link>
                        <Link 
                            to="/user/notes" 
                            className="flex items-center px-3 py-1 bg-white bg-opacity-70 rounded-sm text-xs font-medium text-amber-700 hover:bg-opacity-90 transition duration-200 transform hover:scale-105"
                        >
                            <LucideFileText size={14} className="mr-1" />
                            New Note
                        </Link>
                        <Link 
                            to="/user/chat" 
                            className="flex items-center px-3 py-1 bg-white bg-opacity-70 rounded-sm text-xs font-medium text-amber-700 hover:bg-opacity-90 transition duration-200 transform hover:scale-105"
                        >
                            <LucideSearch size={14} className="mr-1" />
                            AI Chat
                        </Link>
                    </div>
                    <div className="text-xs text-amber-600 bg-white bg-opacity-50 rounded-sm p-2">
                        <div className="font-semibold mb-1">Keyboard shortcuts:</div>
                        <div>Ctrl+T: Quick Task | Ctrl+R: Refresh Stats</div>
                    </div>
                </div>
            )}
        </div>
    );

    // Navigation Controls Component
    const NavigationControlsComponent = () => (
        <div className="mb-4 space-y-3">
            {/* View Toggle and Main Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-100 rounded-sm">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-sm transition-all duration-200 ${
                            viewMode === 'grid' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                        title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
                    >
                        {viewMode === 'grid' ? (
                            <>
                                <LucideGrid3X3 size={16} />
                                <span className="text-sm font-medium">Grid</span>
                            </>
                        ) : (
                            <>
                                <LucideList size={16} />
                                <span className="text-sm font-medium">List</span>
                            </>
                        )}
                    </button>
                    
                    {viewMode === 'list' && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowOnlyWithBadges(!showOnlyWithBadges)}
                                className={`flex items-center gap-1 px-2 py-1 rounded-sm text-xs transition-all duration-200 ${
                                    showOnlyWithBadges 
                                        ? 'bg-red-500 text-white' 
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                                title="Show only items with notifications"
                            >
                                <LucideBell size={12} />
                                {showOnlyWithBadges && <span>Active</span>}
                            </button>
                            
                            <button
                                onClick={() => setShowBulkActions(!showBulkActions)}
                                className={`flex items-center gap-1 px-2 py-1 rounded-sm text-xs transition-all duration-200 ${
                                    showBulkActions || selectedItems.length > 0
                                        ? 'bg-blue-500 text-white' 
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                                title="Toggle bulk selection"
                            >
                                                        <LucideMousePointer size={12} />
                        {selectedItems.length > 0 ? `${selectedItems.length}` : 'Select'}
                            </button>
                        </div>
                    )}
                </div>

                {viewMode === 'list' && (
                    <div className="flex items-center gap-2">
                        {/* Search */}
                        <div className="relative">
                            <LucideSearch size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchFilter}
                                onChange={(e) => setSearchFilter(e.target.value)}
                                placeholder="Search navigation..."
                                className="pl-8 pr-3 py-1 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
                            />
                            {searchFilter && (
                                <button
                                    onClick={() => setSearchFilter('')}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <LucideX size={12} />
                                </button>
                            )}
                        </div>

                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'name' | 'priority' | 'usage')}
                            className="px-2 py-1 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="name">Name</option>
                            <option value="priority">Priority</option>
                            <option value="usage">Usage</option>
                        </select>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 ml-2">
                            <button
                                onClick={() => setShowAddModal('general')}
                                className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded-sm text-xs hover:bg-green-600 transition-colors"
                                title="Quick Add"
                            >
                                <LucidePlus size={12} />
                                Add
                            </button>

                            <button
                                onClick={() => setShowCustomizeModal(true)}
                                className="flex items-center gap-1 px-2 py-1 bg-purple-500 text-white rounded-sm text-xs hover:bg-purple-600 transition-colors"
                                title="Customize"
                            >
                                <LucidePalette size={12} />
                                Style
                            </button>

                            <button
                                onClick={() => {
                                    setIsProcessing('sync');
                                    setTimeout(() => {
                                        setIsProcessing(null);
                                        showNotification('All data synced successfully');
                                    }, 2000);
                                }}
                                disabled={isProcessing === 'sync'}
                                className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded-sm text-xs hover:bg-blue-600 transition-colors disabled:opacity-50"
                                title="Sync All"
                            >
                                {isProcessing === 'sync' ? (
                                    <LucideRefreshCw size={12} className="animate-spin" />
                                ) : (
                                    <LucideRotateCcw size={12} />
                                )}
                                Sync
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bulk Actions Bar */}
            {(showBulkActions || selectedItems.length > 0) && viewMode === 'list' && (
                <div className="bg-blue-50 border border-blue-200 rounded-sm p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={selectAllItems}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                >
                                    <LucideMousePointer size={14} />
                                    Select All
                                </button>
                                <span className="text-gray-300">|</span>
                                <button
                                    onClick={clearSelection}
                                    className="text-sm text-gray-600 hover:text-gray-700 flex items-center gap-1"
                                >
                                    <LucideX size={14} />
                                    Clear
                                </button>
                            </div>
                            
                            {selectedItems.length > 0 && (
                                <div className="text-sm text-blue-700 font-medium bg-blue-100 px-2 py-1 rounded">
                                    {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                                </div>
                            )}
                        </div>

                        {selectedItems.length > 0 && (
                            <div className="flex items-center gap-2">
                                {getBulkActions().map((action) => {
                                    const ActionIcon = action.icon;
                                    return (
                                        <button
                                            key={action.id}
                                            onClick={() => handleBulkAction(action.id)}
                                            disabled={isProcessing === 'bulk'}
                                            className={`px-2 py-1 rounded-sm text-xs font-medium transition-colors flex items-center gap-1 ${
                                                action.color === 'red' 
                                                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                                    : action.color === 'indigo'
                                                    ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                                    : action.color === 'purple'
                                                    ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            } ${isProcessing === 'bulk' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {isProcessing === 'bulk' ? (
                                                <LucideRefreshCw size={12} className="animate-spin" />
                                            ) : (
                                                <ActionIcon size={12} />
                                            )}
                                            {action.label}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Quick Stats for List View */}
            {viewMode === 'list' && (
                <div className="grid grid-cols-4 gap-2 text-center">
                    {Object.entries(cardBadges).reduce((total, [_, count]) => total + count, 0) > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-sm p-2">
                            <div className="text-sm font-bold text-red-700">
                                {Object.entries(cardBadges).reduce((total, [_, count]) => total + count, 0)}
                            </div>
                            <div className="text-xs text-red-600">Notifications</div>
                        </div>
                    )}
                    <div className="bg-blue-50 border border-blue-200 rounded-sm p-2">
                        <div className="text-sm font-bold text-blue-700">
                            {Object.values(filteredSections()).reduce((total: number, section: any) => total + section.items.length, 0)}
                        </div>
                        <div className="text-xs text-blue-600">Total Items</div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-sm p-2">
                        <div className="text-sm font-bold text-green-700">
                            {Object.keys(filteredSections()).length}
                        </div>
                        <div className="text-xs text-green-600">Categories</div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-sm p-2">
                        <div className="text-sm font-bold text-purple-700">
                            {completionPercentage}%
                        </div>
                        <div className="text-xs text-purple-600">Progress</div>
                    </div>
                </div>
            )}
        </div>
    );

    // List Section Component
    const ListSectionComponent = ({ sectionKey, section }: { sectionKey: string, section: any }) => {
        const SectionIcon = section.icon;
        const isExpanded = expandedSections[sectionKey];
        const totalBadges = section.items.reduce((total: number, item: any) => total + item.badges, 0);

        return (
            <div className="mb-4 bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
                <button
                    onClick={() => toggleSection(sectionKey)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-200"
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-sm bg-${section.color}-100`}>
                            <SectionIcon size={20} className={`text-${section.color}-600`} />
                        </div>
                        <div className="text-left">
                            <div className="font-semibold text-gray-800 flex items-center gap-2">
                                {section.title}
                                {totalBadges > 0 && (
                                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-sm font-bold">
                                        {totalBadges}
                                    </span>
                                )}
                            </div>
                            <div className="text-sm text-gray-600">
                                {section.items.length} item{section.items.length !== 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isExpanded ? (
                            <LucideChevronDown size={20} className="text-gray-400" />
                        ) : (
                            <LucideChevronRight size={20} className="text-gray-400" />
                        )}
                    </div>
                </button>

                {isExpanded && (
                    <div className="border-t border-gray-100">
                        {section.items.map((item: any) => (
                            <ListItemComponent key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // List Item Component
    const ListItemComponent = ({ item }: { item: any }) => {
        const ItemIcon = item.icon;
        const isHovered = hoveredCard === item.id;

        const getStatusColor = (status: string) => {
            switch (status) {
                case 'online': return 'text-green-600 bg-green-100';
                case 'active': return 'text-blue-600 bg-blue-100';
                case 'warning': return 'text-yellow-600 bg-yellow-100';
                case 'upcoming': return 'text-purple-600 bg-purple-100';
                case 'secure': return 'text-green-600 bg-green-100';
                case 'external': return 'text-gray-600 bg-gray-100';
                case 'info': return 'text-cyan-600 bg-cyan-100';
                default: return 'text-gray-600 bg-gray-100';
            }
        };

        const isSelected = selectedItems.includes(item.id);
        const isProcessingItem = isProcessing === item.id;

        const commonProps = {
            className: `flex items-center justify-between p-4 hover:bg-gray-50 transition-all duration-200 border-b border-gray-100 last:border-b-0 ${
                cardAnimations[item.id] ? 'animate-pulse' : ''
            } ${isSelected ? 'bg-blue-50 border-blue-200' : ''} ${isProcessingItem ? 'opacity-75' : ''}`,
            onClick: (e: any) => {
                if (!showBulkActions && !e.target.closest('[data-checkbox]') && !e.target.closest('[data-action-menu]')) {
                    handleCardClick(item.id);
                }
            },
            onMouseEnter: () => handleCardHover(item.id),
            onMouseLeave: () => handleCardHover(null),
            'data-item-id': item.id
        };

        return item.isExternal ? (
            <a
                {...commonProps}
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
            >
                <div className="flex items-center gap-3 flex-1">
                    {/* Selection Checkbox */}
                    {(showBulkActions || selectedItems.length > 0) && (
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                                e.stopPropagation();
                                toggleItemSelection(item.id);
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            data-checkbox="true"
                        />
                    )}

                    <div className={`p-2 rounded-sm bg-${item.color}-100 relative transition-all duration-200 ${
                        isHovered ? `bg-${item.color}-200 scale-110` : ''
                    }`}>
                        <ItemIcon size={20} className={`text-${item.color}-600`} />
                        {item.badges > 0 && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-sm h-4 w-4 flex items-center justify-center font-bold animate-bounce">
                                {item.badges}
                            </div>
                        )}
                        {isProcessingItem && (
                            <div className="absolute inset-0 bg-white bg-opacity-75 rounded-sm flex items-center justify-center">
                                <LucideRefreshCw size={12} className="text-gray-600 animate-spin" />
                            </div>
                        )}
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800">{item.title}</span>
                            <span className={`text-xs px-2 py-1 rounded-sm ${getStatusColor(item.status)}`}>
                                {item.status}
                            </span>
                            {item.isExternal && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    External
                                </span>
                            )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                            {isHovered ? (
                                <span>
                                    {item.id === 'chat' && 'Click to start chatting'}
                                    {item.id === 'tasks' && `${item.progress}% completed`}
                                    {item.id === 'notes' && 'Latest: Project Ideas'}
                                    {item.id === 'lifeEvents' && 'Next: Birthday Party'}
                                    {item.id === 'infoVault' && '🔒 All data secured'}
                                    {item.id === 'settings' && 'API Keys need update'}
                                    {item.id === 'logout' && 'Click to sign out'}
                                    {!['chat', 'tasks', 'notes', 'lifeEvents', 'infoVault', 'settings', 'logout'].includes(item.id) && item.description}
                                </span>
                            ) : (
                                item.description
                            )}
                        </div>
                        {item.progress !== undefined && (
                            <div className="mt-2 w-full bg-gray-200 rounded-sm h-1">
                                <div 
                                    className={`bg-${item.color}-500 h-1 rounded-sm transition-all duration-300`}
                                    style={{ width: `${item.progress}%` }}
                                ></div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 text-right relative">
                    <div className="text-xs text-gray-500">
                        <div>Last used</div>
                        <div className="font-medium">{item.lastUsed}</div>
                        {item.totalCount !== undefined && (
                            <div className="text-xs text-gray-400 mt-1">
                                {item.totalCount} items
                            </div>
                        )}
                    </div>
                    
                    {isHovered && item.actionable && (
                        <div className="flex items-center gap-1" data-action-menu="true">
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleItemAction(item.id, 'add');
                                }}
                                className="p-1 bg-green-600 rounded-sm hover:bg-green-700 transition-colors"
                                title="Add New"
                            >
                                <LucidePlus size={12} className="text-white" />
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleItemAction(item.id, 'history');
                                }}
                                className="p-1 bg-blue-600 rounded-sm hover:bg-blue-700 transition-colors"
                                title="View History"
                            >
                                <LucideHistory size={12} className="text-white" />
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    setShowActionMenu(showActionMenu === item.id ? null : item.id);
                                }}
                                className={`p-1 bg-gray-600 rounded-sm hover:bg-gray-700 transition-colors ${showActionMenu === item.id ? 'bg-gray-700' : ''}`}
                                title="More Actions"
                            >
                                <LucideMoreHorizontal size={12} className="text-white" />
                            </button>
                        </div>
                    )}
                    
                    {!item.actionable && isHovered && (
                        <div className="text-xs text-gray-400 px-2 py-1">
                            View only
                        </div>
                    )}
                    
                    {/* Action Menu Dropdown */}
                    {showActionMenu === item.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-sm shadow-lg z-50 min-w-48" data-action-menu="true">
                            <div className="py-1">
                                <div className="px-3 py-2 text-xs font-semibold text-gray-500 border-b border-gray-100">
                                    Actions for {item.title}
                                </div>
                                {getAvailableActions(item.id).map((action) => {
                                    const ActionIcon = action.icon;
                                    return (
                                        <button
                                            key={action.id}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleItemAction(item.id, action.id);
                                            }}
                                            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-${action.color}-600 hover:text-${action.color}-700 transition-colors`}
                                        >
                                            <ActionIcon size={14} />
                                            {action.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </a>
        ) : (
            <Link
                {...commonProps}
                to={item.path}
            >
                <div className="flex items-center gap-3 flex-1">
                    {/* Selection Checkbox */}
                    {(showBulkActions || selectedItems.length > 0) && (
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                                e.stopPropagation();
                                toggleItemSelection(item.id);
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            data-checkbox="true"
                        />
                    )}

                    <div className={`p-2 rounded-sm bg-${item.color}-100 relative transition-all duration-200 ${
                        isHovered ? `bg-${item.color}-200 scale-110` : ''
                    }`}>
                        <ItemIcon size={20} className={`text-${item.color}-600`} />
                        {item.badges > 0 && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-sm h-4 w-4 flex items-center justify-center font-bold animate-bounce">
                                {item.badges}
                            </div>
                        )}
                        {isProcessingItem && (
                            <div className="absolute inset-0 bg-white bg-opacity-75 rounded-sm flex items-center justify-center">
                                <LucideRefreshCw size={12} className="text-gray-600 animate-spin" />
                            </div>
                        )}
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800">{item.title}</span>
                            <span className={`text-xs px-2 py-1 rounded-sm ${getStatusColor(item.status)}`}>
                                {item.status}
                            </span>
                            {item.isExternal && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    External
                                </span>
                            )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                            {isHovered ? (
                                <span>
                                    {item.id === 'chat' && 'Click to start chatting'}
                                    {item.id === 'tasks' && `${item.progress}% completed`}
                                    {item.id === 'notes' && 'Latest: Project Ideas'}
                                    {item.id === 'lifeEvents' && 'Next: Birthday Party'}
                                    {item.id === 'infoVault' && '🔒 All data secured'}
                                    {item.id === 'settings' && 'API Keys need update'}
                                    {item.id === 'logout' && 'Click to sign out'}
                                    {!['chat', 'tasks', 'notes', 'lifeEvents', 'infoVault', 'settings', 'logout'].includes(item.id) && item.description}
                                </span>
                            ) : (
                                item.description
                            )}
                        </div>
                        {item.progress !== undefined && (
                            <div className="mt-2 w-full bg-gray-200 rounded-sm h-1">
                                <div 
                                    className={`bg-${item.color}-500 h-1 rounded-sm transition-all duration-300`}
                                    style={{ width: `${item.progress}%` }}
                                ></div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 text-right relative">
                    <div className="text-xs text-gray-500">
                        <div>Last used</div>
                        <div className="font-medium">{item.lastUsed}</div>
                        {item.totalCount !== undefined && (
                            <div className="text-xs text-gray-400 mt-1">
                                {item.totalCount} items
                            </div>
                        )}
                    </div>
                    
                    {isHovered && item.actionable && (
                        <div className="flex items-center gap-1" data-action-menu="true">
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleItemAction(item.id, 'add');
                                }}
                                className="p-1 bg-green-600 rounded-sm hover:bg-green-700 transition-colors"
                                title="Add New"
                            >
                                <LucidePlus size={12} className="text-white" />
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleItemAction(item.id, 'history');
                                }}
                                className="p-1 bg-blue-600 rounded-sm hover:bg-blue-700 transition-colors"
                                title="View History"
                            >
                                <LucideHistory size={12} className="text-white" />
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    setShowActionMenu(showActionMenu === item.id ? null : item.id);
                                }}
                                className={`p-1 bg-gray-600 rounded-sm hover:bg-gray-700 transition-colors ${showActionMenu === item.id ? 'bg-gray-700' : ''}`}
                                title="More Actions"
                            >
                                <LucideMoreHorizontal size={12} className="text-white" />
                            </button>
                        </div>
                    )}
                    
                    {!item.actionable && isHovered && (
                        <div className="text-xs text-gray-400 px-2 py-1">
                            View only
                        </div>
                    )}
                    
                    {/* Action Menu Dropdown */}
                    {showActionMenu === item.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-sm shadow-lg z-50 min-w-48" data-action-menu="true">
                            <div className="py-1">
                                <div className="px-3 py-2 text-xs font-semibold text-gray-500 border-b border-gray-100">
                                    Actions for {item.title}
                                </div>
                                {getAvailableActions(item.id).map((action) => {
                                    const ActionIcon = action.icon;
                                    return (
                                        <button
                                            key={action.id}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleItemAction(item.id, action.id);
                                            }}
                                            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-${action.color}-600 hover:text-${action.color}-700 transition-colors`}
                                        >
                                            <ActionIcon size={14} />
                                            {action.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </Link>
        );
    };

    // Action Modals
    const ActionModalsComponent = () => (
        <>
            {/* History Modal */}
            {showHistoryModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-sm p-6 w-96 max-w-90vw max-h-80vh overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800">
                                {showHistoryModal.charAt(0).toUpperCase() + showHistoryModal.slice(1)} History
                            </h3>
                            <button
                                onClick={() => setShowHistoryModal(null)}
                                className="p-1 hover:bg-gray-100 rounded-sm transition duration-200"
                            >
                                <LucideX size={20} className="text-gray-600" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div className="border-l-4 border-blue-500 pl-4">
                                <div className="font-medium text-gray-800">Recent Activity</div>
                                <div className="text-sm text-gray-600">Modified: Project planning notes</div>
                                <div className="text-xs text-gray-500">2 hours ago</div>
                            </div>
                            <div className="border-l-4 border-green-500 pl-4">
                                <div className="font-medium text-gray-800">Created New Item</div>
                                <div className="text-sm text-gray-600">Added: Task management workflow</div>
                                <div className="text-xs text-gray-500">1 day ago</div>
                            </div>
                            <div className="border-l-4 border-yellow-500 pl-4">
                                <div className="font-medium text-gray-800">Updated Settings</div>
                                <div className="text-sm text-gray-600">Changed notification preferences</div>
                                <div className="text-xs text-gray-500">3 days ago</div>
                            </div>
                            <div className="border-l-4 border-red-500 pl-4">
                                <div className="font-medium text-gray-800">Deleted Items</div>
                                <div className="text-sm text-gray-600">Removed outdated entries</div>
                                <div className="text-xs text-gray-500">1 week ago</div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setShowHistoryModal(null)}
                                className="px-4 py-2 bg-blue-500 text-white rounded-sm hover:bg-blue-600 transition duration-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-sm p-6 w-96 max-w-90vw">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800">
                                Add New {showAddModal.charAt(0).toUpperCase() + showAddModal.slice(1)}
                            </h3>
                            <button
                                onClick={() => setShowAddModal(null)}
                                className="p-1 hover:bg-gray-100 rounded-sm transition duration-200"
                            >
                                <LucideX size={20} className="text-gray-600" />
                            </button>
                        </div>
                        <div className="space-y-4">
        <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    placeholder={`Enter ${showAddModal} title...`}
                                    className="w-full p-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    placeholder={`Enter ${showAddModal} description...`}
                                    rows={3}
                                    className="w-full p-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                ></textarea>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => setShowAddModal(null)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-sm hover:bg-gray-400 transition duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        showNotification(`New ${showAddModal} created!`);
                                        setShowAddModal(null);
                                    }}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-sm hover:bg-blue-600 transition duration-200 flex items-center gap-2"
                                >
                                    <LucideCheck size={16} />
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Insights Modal for Smart Summary */}
            {showCardPreview === 'smart-summary' && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-sm p-6 w-[500px] max-w-90vw max-h-80vh overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <LucideBot size={20} className="text-violet-600" />
                                AI Smart Summary
                            </h3>
                            <button
                                onClick={() => setShowCardPreview(null)}
                                className="p-1 hover:bg-gray-100 rounded-sm transition duration-200"
                            >
                                <LucideX size={20} className="text-gray-600" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-violet-50 border border-violet-200 rounded-sm p-4">
                                <h4 className="font-semibold text-violet-800 mb-2">📊 Productivity Overview</h4>
                                <p className="text-sm text-violet-700">
                                    You're at {aiInsights.totalProductivity}% productivity this week ({aiInsights.weeklyTrend}). 
                                    Your most active area is {aiInsights.topCategory}.
                                </p>
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-sm p-4">
                                <h4 className="font-semibold text-amber-800 mb-2">💡 AI Suggestions</h4>
                                <ul className="space-y-2">
                                    {aiInsights.suggestions.map((suggestion, index) => (
                                        <li key={index} className="text-sm text-amber-700 flex items-start gap-2">
                                            <span className="text-amber-500 font-bold">•</span>
                                            {suggestion}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-cyan-50 border border-cyan-200 rounded-sm p-4">
                                <h4 className="font-semibold text-cyan-800 mb-2">🎯 Next Recommendation</h4>
                                <p className="text-sm text-cyan-700">{aiInsights.nextRecommendation}</p>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setShowCardPreview(null)}
                                className="px-4 py-2 bg-violet-500 text-white rounded-sm hover:bg-violet-600 transition duration-200"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-sm p-6 w-96 max-w-90vw">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <LucideEdit3 size={20} className="text-blue-600" />
                                Edit {showEditModal.charAt(0).toUpperCase() + showEditModal.slice(1)}
                            </h3>
                            <button
                                onClick={() => setShowEditModal(null)}
                                className="p-1 hover:bg-gray-100 rounded-sm transition duration-200"
                            >
                                <LucideX size={20} className="text-gray-600" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                <input
                                    type="text"
                                    placeholder={`Edit ${showEditModal} name...`}
                                    className="w-full p-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Settings</label>
                                <textarea
                                    placeholder={`Configure ${showEditModal} settings...`}
                                    rows={3}
                                    className="w-full p-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                ></textarea>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => setShowEditModal(null)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-sm hover:bg-gray-400 transition duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        showNotification(`${showEditModal} updated successfully!`);
                                        setShowEditModal(null);
                                    }}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-sm hover:bg-blue-600 transition duration-200 flex items-center gap-2"
                                >
                                    <LucideCheck size={16} />
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-sm p-6 w-96 max-w-90vw">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
                                <LucideTrash2 size={20} className="text-red-600" />
                                Delete {showDeleteModal.charAt(0).toUpperCase() + showDeleteModal.slice(1)}
                            </h3>
                            <button
                                onClick={() => setShowDeleteModal(null)}
                                className="p-1 hover:bg-gray-100 rounded-sm transition duration-200"
                            >
                                <LucideX size={20} className="text-gray-600" />
                            </button>
                        </div>
                        <div className="mb-6">
                            <div className="bg-red-50 border border-red-200 rounded-sm p-4 mb-4">
                                <p className="text-red-800 font-medium">⚠️ Warning: This action cannot be undone</p>
                                <p className="text-red-600 text-sm mt-2">
                                    All data associated with this {showDeleteModal} will be permanently removed.
                                </p>
                            </div>
                            <p className="text-gray-700">
                                Are you sure you want to delete this {showDeleteModal}? Type <strong>DELETE</strong> to confirm:
                            </p>
                            <input
                                type="text"
                                placeholder="Type DELETE to confirm"
                                className="w-full p-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-red-500 mt-2"
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setShowDeleteModal(null)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-sm hover:bg-gray-400 transition duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    showNotification(`${showDeleteModal} deleted successfully`);
                                    setShowDeleteModal(null);
                                }}
                                className="px-4 py-2 bg-red-500 text-white rounded-sm hover:bg-red-600 transition duration-200 flex items-center gap-2"
                            >
                                <LucideTrash2 size={16} />
                                Delete Forever
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Export Modal */}
            {showExportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-sm p-6 w-96 max-w-90vw">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <LucideDownload size={20} className="text-indigo-600" />
                                Export {showExportModal.charAt(0).toUpperCase() + showExportModal.slice(1)}
                            </h3>
                            <button
                                onClick={() => setShowExportModal(null)}
                                className="p-1 hover:bg-gray-100 rounded-sm transition duration-200"
                            >
                                <LucideX size={20} className="text-gray-600" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                                <select className="w-full p-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="json">JSON Format</option>
                                    <option value="csv">CSV Format</option>
                                    <option value="pdf">PDF Report</option>
                                    <option value="xlsx">Excel Spreadsheet</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="date"
                                        className="p-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <input
                                        type="date"
                                        className="p-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => setShowExportModal(null)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-sm hover:bg-gray-400 transition duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        showNotification(`${showExportModal} export started! Check downloads.`);
                                        setShowExportModal(null);
                                    }}
                                    className="px-4 py-2 bg-indigo-500 text-white rounded-sm hover:bg-indigo-600 transition duration-200 flex items-center gap-2"
                                >
                                    <LucideDownload size={16} />
                                    Export Data
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-sm p-6 w-96 max-w-90vw">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <LucideUpload size={20} className="text-green-600" />
                                Import {showImportModal.charAt(0).toUpperCase() + showImportModal.slice(1)}
                            </h3>
                            <button
                                onClick={() => setShowImportModal(null)}
                                className="p-1 hover:bg-gray-100 rounded-sm transition duration-200"
                            >
                                <LucideX size={20} className="text-gray-600" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-sm p-6 text-center hover:border-green-400 transition-colors">
                                    <LucideUpload size={32} className="mx-auto text-gray-400 mb-2" />
                                    <p className="text-gray-600">Drop files here or <span className="text-green-600 font-medium cursor-pointer">browse</span></p>
                                    <p className="text-xs text-gray-500 mt-1">Supports JSON, CSV, XLSX files</p>
                                </div>
                            </div>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-sm p-3">
                                <p className="text-yellow-800 text-sm">
                                    <strong>Note:</strong> Importing will merge with existing data. Duplicates will be skipped.
                                </p>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => setShowImportModal(null)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-sm hover:bg-gray-400 transition duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        showNotification(`${showImportModal} import completed successfully!`);
                                        setShowImportModal(null);
                                    }}
                                    className="px-4 py-2 bg-green-500 text-white rounded-sm hover:bg-green-600 transition duration-200 flex items-center gap-2"
                                >
                                    <LucideUpload size={16} />
                                    Import Data
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-sm p-6 w-96 max-w-90vw">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <LucideShare2 size={20} className="text-purple-600" />
                                Share {showShareModal.charAt(0).toUpperCase() + showShareModal.slice(1)}
                            </h3>
                            <button
                                onClick={() => setShowShareModal(null)}
                                className="p-1 hover:bg-gray-100 rounded-sm transition duration-200"
                            >
                                <LucideX size={20} className="text-gray-600" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Share with</label>
                                <input
                                    type="email"
                                    placeholder="Enter email addresses..."
                                    className="w-full p-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                                <select className="w-full p-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                                    <option value="view">View Only</option>
                                    <option value="comment">Can Comment</option>
                                    <option value="edit">Can Edit</option>
                                    <option value="admin">Full Access</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                                <textarea
                                    placeholder="Add a message..."
                                    rows={3}
                                    className="w-full p-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                ></textarea>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => setShowShareModal(null)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-sm hover:bg-gray-400 transition duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        showNotification(`${showShareModal} shared successfully!`);
                                        setShowShareModal(null);
                                    }}
                                    className="px-4 py-2 bg-purple-500 text-white rounded-sm hover:bg-purple-600 transition duration-200 flex items-center gap-2"
                                >
                                    <LucideShare2 size={16} />
                                    Send Invitation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Customize Modal */}
            {showCustomizeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-sm p-6 w-[500px] max-w-90vw max-h-80vh overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <LucidePalette size={20} className="text-purple-600" />
                                Customize Interface
                            </h3>
                            <button
                                onClick={() => setShowCustomizeModal(false)}
                                className="p-1 hover:bg-gray-100 rounded-sm transition duration-200"
                            >
                                <LucideX size={20} className="text-gray-600" />
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-3">Layout Options</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="p-3 border-2 border-blue-500 bg-blue-50 rounded-sm flex items-center gap-2">
                                        <LucideLayout size={16} />
                                        <span className="text-sm">Compact</span>
                                    </button>
                                    <button className="p-3 border border-gray-300 rounded-sm flex items-center gap-2">
                                        <LucideMaximize size={16} />
                                        <span className="text-sm">Spacious</span>
                                    </button>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-3">Color Theme</h4>
                                <div className="grid grid-cols-4 gap-2">
                                    {['blue', 'purple', 'green', 'orange'].map(color => (
                                        <button
                                            key={color}
                                            className={`h-12 rounded-sm bg-${color}-500 hover:bg-${color}-600 transition-colors ${color === 'blue' ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                                        ></button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-3">Display Options</h4>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3">
                                        <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm">Show notification badges</span>
                                    </label>
                                    <label className="flex items-center gap-3">
                                        <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm">Display recent activity</span>
                                    </label>
                                    <label className="flex items-center gap-3">
                                        <input type="checkbox" className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm">Enable animations</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end pt-4 border-t">
                                <button
                                    onClick={() => setShowCustomizeModal(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-sm hover:bg-gray-400 transition duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        showNotification('Interface customized successfully!');
                                        setShowCustomizeModal(false);
                                    }}
                                    className="px-4 py-2 bg-purple-500 text-white rounded-sm hover:bg-purple-600 transition duration-200 flex items-center gap-2"
                                >
                                    <LucideCheck size={16} />
                                    Apply Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );

    return (
        <div>
            <ActionModalsComponent />
            {/* Notification Toast */}
            {notification && (
                <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-sm shadow-lg transform transition-all duration-300 animate-bounce">
                    <div className="flex items-center gap-2">
                        <LucideBell size={16} />
                        <span>{notification}</span>
                    </div>
                </div>
            )}

            {/* Quick Task Modal */}
            {showQuickTaskModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-sm p-6 w-96 max-w-90vw">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Quick Task</h3>
                            <button
                                onClick={() => setShowQuickTaskModal(false)}
                                className="p-1 hover:bg-gray-100 rounded-sm transition duration-200"
                            >
                                <LucideX size={20} className="text-gray-600" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={quickTaskText}
                                onChange={(e) => setQuickTaskText(e.target.value)}
                                placeholder="Enter task description..."
                                className="w-full p-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                autoFocus
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleQuickTaskSubmit();
                                    }
                                }}
                            />
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => setShowQuickTaskModal(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-sm hover:bg-gray-400 transition duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleQuickTaskSubmit}
                                    disabled={!quickTaskText.trim()}
                                    className="px-4 py-2 bg-amber-500 text-white rounded-sm hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200 flex items-center gap-2"
                                >
                                    <LucideCheck size={16} />
                                    Create Task
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ maxWidth: '1000px', margin: '0 auto', paddingTop: '20px', paddingBottom: '20px' }}>
                <div style={{ paddingLeft: '20px', paddingRight: '20px' }}>
                    <h1 className="text-2xl font-bold text-white mb-2">Hello {name}</h1>
                </div>
                <div style={{ display: 'flex' }} className={`${screenSize === 'sm' ? 'flex-col' : 'flex-row'}`}>
                    {/* left */}
                    <div
                        style={{
                            width: `${screenSize === 'sm' ? '100%' : '40%' }`,
                            paddingLeft: `${screenSize === 'sm' ? '10px' : '20px' }`,
                            paddingRight: `${screenSize === 'sm' ? '10px' : '20px' }`,
                        }}
                    >
                        {authState.isLoggedIn === 'true' && (
                            <Fragment>
                                <div className="pb-2">
                                    <ComponentFromBrithdayToToday />
                                    <ComponentPinnedTask />
                                    <QuickStatsComponent />
                                    <TimeWeatherComponent />
                                    <RecentActivityComponent />
                                    <QuickActionsComponent />
                                </div>
                            </Fragment>
                        )}
                    </div>
                    {/* right */}
                    <div
                        style={{
                            width: `${screenSize === 'sm' ? '100%' : '60%' }`,
                            paddingLeft: `${screenSize === 'sm' ? '10px' : '20px' }`,
                            paddingRight: `${screenSize === 'sm' ? '10px' : '20px' }`,
                        }}
                    >
                        {/* Navigation Controls */}
                        <NavigationControlsComponent />

                        {/* Grid View */}
                        {viewMode === 'grid' && (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '20px',
                                textAlign: 'center',
                            }}
                        >
                            {authState.isLoggedIn === 'pending' && (
                                <div className='block p-4 border-2 border-slate-300 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl shadow-md'>
                                    <div className="flex justify-center mb-2">
                                        <div className="p-2 bg-slate-500 rounded-sm">
                                            <LucideLoader size={28} className="text-white animate-spin" />
                                    </div>
                                    </div>
                                    <div className="font-semibold text-slate-800">Loading...</div>
                                    <div className="text-xs text-slate-600 mt-1">Please wait</div>
                                </div>
                            )}
                            {authState.isLoggedIn === 'true' && (
                                <>
                                    <Link 
                                        to="/user/chat" 
                                        className={`block relative p-4 border-2 border-purple-300 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl hover:shadow-lg hover:from-purple-200 hover:to-purple-300 transform hover:scale-105 transition-all duration-200 ${cardAnimations['chat'] ? 'animate-pulse' : ''}`}
                                        onClick={() => handleCardClick('chat')}
                                        onMouseEnter={() => handleCardHover('chat')}
                                        onMouseLeave={() => handleCardHover(null)}
                                    >
                                        {/* Notification Badge */}
                                        {getBadgeCount('chat') > 0 && (
                                            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-sm h-6 w-6 flex items-center justify-center font-bold animate-bounce">
                                                {getBadgeCount('chat')}
                                        </div>
                                        )}
                                        
                                        <div className="flex justify-center mb-2">
                                            <div className={`p-2 bg-purple-500 rounded-sm transition-all duration-200 ${hoveredCard === 'chat' ? 'bg-purple-600 scale-110' : ''}`}>
                                                <LucideBrain size={28} className="text-white" />
                                            </div>
                                        </div>
                                        <div className="font-semibold text-purple-800">Chat</div>
                                        <div className="text-xs text-purple-600 mt-1">
                                            {hoveredCard === 'chat' ? 'Click to start chatting' : 'AI Assistant'}
                                        </div>
                                        
                                        {/* Status Indicator */}
                                        <div className="absolute bottom-2 left-2">
                                            <div className="flex items-center space-x-1">
                                                <div className="w-2 h-2 bg-green-400 rounded-sm animate-pulse"></div>
                                                <span className="text-xs text-purple-600">Online</span>
                                            </div>
                                        </div>
                                    </Link>
                                    <Link 
                                        to="/user/task" 
                                        className={`block relative p-4 border-2 border-blue-300 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl hover:shadow-lg hover:from-blue-200 hover:to-blue-300 transform hover:scale-105 transition-all duration-200 ${cardAnimations['tasks'] ? 'animate-pulse' : ''}`}
                                        onClick={() => handleCardClick('tasks')}
                                        onMouseEnter={() => handleCardHover('tasks')}
                                        onMouseLeave={() => handleCardHover(null)}
                                    >
                                        {/* Notification Badge */}
                                        {getBadgeCount('tasks') > 0 && (
                                            <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-sm h-6 w-6 flex items-center justify-center font-bold">
                                                {getBadgeCount('tasks')}
                                        </div>
                                        )}
                                        
                                        <div className="flex justify-center mb-2">
                                            <div className={`p-2 bg-blue-500 rounded-sm transition-all duration-200 ${hoveredCard === 'tasks' ? 'bg-blue-600 scale-110' : ''}`}>
                                                <LucideCheckSquare size={28} className="text-white" />
                                            </div>
                                        </div>
                                        <div className="font-semibold text-blue-800">Task</div>
                                        <div className="text-xs text-blue-600 mt-1">
                                            {hoveredCard === 'tasks' ? `${completionPercentage}% completed` : 'Manage Tasks'}
                                        </div>
                                        
                                        {/* Progress Bar */}
                                        <div className="absolute bottom-1 left-2 right-2">
                                            <div className="w-full bg-blue-200 rounded-sm h-1">
                                                <div 
                                                    className="bg-blue-500 h-1 rounded-sm transition-all duration-300"
                                                    style={{ width: `${completionPercentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </Link>
                                    <Link 
                                        to="/user/notes" 
                                        className={`block relative p-4 border-2 border-green-300 bg-gradient-to-br from-green-100 to-green-200 rounded-xl hover:shadow-lg hover:from-green-200 hover:to-green-300 transform hover:scale-105 transition-all duration-200 ${cardAnimations['notes'] ? 'animate-pulse' : ''}`}
                                        onClick={() => handleCardClick('notes')}
                                        onMouseEnter={() => handleCardHover('notes')}
                                        onMouseLeave={() => handleCardHover(null)}
                                    >
                                        {/* Notification Badge */}
                                        {getBadgeCount('notes') > 0 && (
                                            <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-sm h-6 w-6 flex items-center justify-center font-bold">
                                                {getBadgeCount('notes')}
                                        </div>
                                        )}
                                        
                                        <div className="flex justify-center mb-2">
                                            <div className={`p-2 bg-green-500 rounded-sm transition-all duration-200 ${hoveredCard === 'notes' ? 'bg-green-600 scale-110' : ''}`}>
                                                <LucideBookOpen size={28} className="text-white" />
                                            </div>
                                        </div>
                                        <div className="font-semibold text-green-800">Notes</div>
                                        <div className="text-xs text-green-600 mt-1">
                                            {hoveredCard === 'notes' ? 'Latest: Project Ideas' : 'Knowledge Base'}
                                        </div>
                                        
                                        {/* Quick Action */}
                                        {hoveredCard === 'notes' && (
                                            <div className="absolute top-2 right-2">
                                                <button 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        showNotification('Quick note created!');
                                                    }}
                                                    className="p-1 bg-green-600 rounded-sm hover:bg-green-700 transition-colors"
                                                    title="Quick Note"
                                                >
                                                    <LucidePlus size={12} className="text-white" />
                                                </button>
                                            </div>
                                        )}
                                    </Link>
                                    <Link 
                                        to="/user/life-events" 
                                        className={`block relative p-4 border-2 border-pink-300 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl hover:shadow-lg hover:from-pink-200 hover:to-pink-300 transform hover:scale-105 transition-all duration-200 ${cardAnimations['lifeEvents'] ? 'animate-pulse' : ''}`}
                                        onClick={() => handleCardClick('lifeEvents')}
                                        onMouseEnter={() => handleCardHover('lifeEvents')}
                                        onMouseLeave={() => handleCardHover(null)}
                                    >
                                        {/* Notification Badge */}
                                        {getBadgeCount('lifeEvents') > 0 && (
                                            <div className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-sm h-6 w-6 flex items-center justify-center font-bold animate-bounce">
                                                {getBadgeCount('lifeEvents')}
                                        </div>
                                        )}
                                        
                                        <div className="flex justify-center mb-2">
                                            <div className={`p-2 bg-pink-500 rounded-sm transition-all duration-200 ${hoveredCard === 'lifeEvents' ? 'bg-pink-600 scale-110' : ''}`}>
                                                <LucideHeart size={28} className="text-white" />
                                            </div>
                                        </div>
                                        <div className="font-semibold text-pink-800">Life Events</div>
                                        <div className="text-xs text-pink-600 mt-1">
                                            {hoveredCard === 'lifeEvents' ? 'Next: Birthday Party' : 'Personal Timeline'}
                                        </div>
                                        
                                        {/* Heartbeat Animation */}
                                        {hoveredCard === 'lifeEvents' && (
                                            <div className="absolute inset-0 rounded-xl border-2 border-pink-400 animate-ping opacity-20"></div>
                                        )}
                                    </Link>
                                    <Link 
                                        to="/user/info-vault" 
                                        className={`block relative p-4 border-2 border-orange-300 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl hover:shadow-lg hover:from-orange-200 hover:to-orange-300 transform hover:scale-105 transition-all duration-200 ${cardAnimations['infoVault'] ? 'animate-pulse' : ''}`}
                                        onClick={() => handleCardClick('infoVault')}
                                        onMouseEnter={() => handleCardHover('infoVault')}
                                        onMouseLeave={() => handleCardHover(null)}
                                    >
                                        <div className="flex justify-center mb-2">
                                            <div className={`p-2 bg-orange-500 rounded-sm transition-all duration-200 ${hoveredCard === 'infoVault' ? 'bg-orange-600 scale-110' : ''}`}>
                                                <LucideShield size={28} className="text-white" />
                                        </div>
                                        </div>
                                        <div className="font-semibold text-orange-800">Info Vault</div>
                                        <div className="text-xs text-orange-600 mt-1">
                                            {hoveredCard === 'infoVault' ? '🔒 All data secured' : 'Secure Storage'}
                                        </div>
                                        
                                        {/* Security Indicator */}
                                        <div className="absolute bottom-2 right-2">
                                            <div className="flex items-center space-x-1">
                                                <div className={`w-2 h-2 rounded-sm ${hoveredCard === 'infoVault' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                                            </div>
                                        </div>
                                    </Link>
                                    <Link 
                                        to="/user/setting" 
                                        className={`block relative p-4 border-2 border-gray-300 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl hover:shadow-lg hover:from-gray-200 hover:to-gray-300 transform hover:scale-105 transition-all duration-200 ${cardAnimations['settings'] ? 'animate-pulse' : ''}`}
                                        onClick={() => handleCardClick('settings')}
                                        onMouseEnter={() => handleCardHover('settings')}
                                        onMouseLeave={() => handleCardHover(null)}
                                    >
                                        {/* Notification Badge */}
                                        {getBadgeCount('settings') > 0 && (
                                            <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-sm h-6 w-6 flex items-center justify-center font-bold animate-bounce">
                                                {getBadgeCount('settings')}
                                        </div>
                                        )}
                                        
                                        <div className="flex justify-center mb-2">
                                            <div className={`p-2 bg-gray-600 rounded-sm transition-all duration-200 ${hoveredCard === 'settings' ? 'bg-gray-700 scale-110 animate-spin' : ''}`}>
                                                <LucideCog size={28} className="text-white" />
                                            </div>
                                        </div>
                                        <div className="font-semibold text-gray-800">Settings</div>
                                        <div className="text-xs text-gray-600 mt-1">
                                            {hoveredCard === 'settings' ? 'API Keys need update' : 'Configuration'}
                                        </div>
                                    </Link>
                                    <Link 
                                        to="/logout" 
                                        className={`block relative p-4 border-2 border-red-300 bg-gradient-to-br from-red-100 to-red-200 rounded-xl hover:shadow-lg hover:from-red-200 hover:to-red-300 transform hover:scale-105 transition-all duration-200 ${cardAnimations['logout'] ? 'animate-pulse' : ''}`}
                                        onClick={() => handleCardClick('logout')}
                                        onMouseEnter={() => handleCardHover('logout')}
                                        onMouseLeave={() => handleCardHover(null)}
                                    >
                                        <div className="flex justify-center mb-2">
                                            <div className={`p-2 bg-red-500 rounded-sm transition-all duration-200 ${hoveredCard === 'logout' ? 'bg-red-600 scale-110' : ''}`}>
                                                <LucidePower size={28} className="text-white" />
                                        </div>
                                        </div>
                                        <div className="font-semibold text-red-800">Logout</div>
                                        <div className="text-xs text-red-600 mt-1">
                                            {hoveredCard === 'logout' ? 'Click to sign out' : 'Sign Out'}
                                        </div>
                                        
                                        {/* Warning on hover */}
                                        {hoveredCard === 'logout' && (
                                            <div className="absolute inset-0 bg-red-200 bg-opacity-50 rounded-xl flex items-center justify-center">
                                                <span className="text-xs font-bold text-red-800">⚠️ Confirm?</span>
                                            </div>
                                        )}
                                    </Link>
                                </>
                            )}

                            {/* Card Preview Tooltip */}
                            {showCardPreview && getCardPreviewData(showCardPreview) && (
                                <div className="fixed z-50 bg-white rounded-sm shadow-lg border-2 p-4 w-64 max-w-sm transform transition-all duration-200"
                                     style={{
                                         left: '50%',
                                         top: '50%',
                                         transform: 'translate(-50%, -50%)',
                                         marginTop: '20px'
                                     }}>
                                    <div className="text-sm font-bold text-gray-800 mb-2">
                                        {getCardPreviewData(showCardPreview).title}
                                    </div>
                                    <div className="space-y-1 mb-3">
                                        {getCardPreviewData(showCardPreview).items.map((item: string, index: number) => (
                                            <div key={index} className="text-xs text-gray-600 flex items-center">
                                                <div className="w-2 h-2 bg-blue-400 rounded-sm mr-2"></div>
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                        {getCardPreviewData(showCardPreview).stats}
                                    </div>
                                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white border-l border-t rotate-45"></div>
                                </div>
                            )}

                            {authState.isLoggedIn === 'false' && (
                                <>
                                    <Link to="/login" className='block p-4 border-2 border-emerald-300 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl hover:shadow-lg hover:from-emerald-200 hover:to-emerald-300 transform hover:scale-105 transition-all duration-200'>
                                        <div className="flex justify-center mb-2">
                                            <div className="p-2 bg-emerald-500 rounded-sm">
                                                <LucideLogIn size={28} className="text-white" />
                                        </div>
                                        </div>
                                        <div className="font-semibold text-emerald-800">Login</div>
                                        <div className="text-xs text-emerald-600 mt-1">Sign In</div>
                                    </Link>
                                    <Link to="/register" className='block p-4 border-2 border-sky-300 bg-gradient-to-br from-sky-100 to-sky-200 rounded-xl hover:shadow-lg hover:from-sky-200 hover:to-sky-300 transform hover:scale-105 transition-all duration-200'>
                                        <div className="flex justify-center mb-2">
                                            <div className="p-2 bg-sky-500 rounded-sm">
                                                <LucideUserPlus size={28} className="text-white" />
                                        </div>
                                        </div>
                                        <div className="font-semibold text-sky-800">Register</div>
                                        <div className="text-xs text-sky-600 mt-1">Create Account</div>
                                    </Link>
                                </>
                            )}
                            <Link to="/about" className='block p-4 border-2 border-teal-300 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl hover:shadow-lg hover:from-teal-200 hover:to-teal-300 transform hover:scale-105 transition-all duration-200'>
                                <div className="flex justify-center mb-2">
                                    <div className="p-2 bg-teal-500 rounded-sm">
                                        <LucideHelpCircle size={28} className="text-white" />
                                </div>
                                </div>
                                <div className="font-semibold text-teal-800">About</div>
                                <div className="text-xs text-teal-600 mt-1">App Information</div>
                            </Link>
                            <a
                                href="https://ai-notes.xyz/docs/selfhost/selfhost-docker-build"
                                className='block p-4 border-2 border-indigo-300 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl hover:shadow-lg hover:from-indigo-200 hover:to-indigo-300 transform hover:scale-105 transition-all duration-200'
                            >
                                <div className="flex justify-center mb-2">
                                    <div className="p-2 bg-indigo-600 rounded-sm">
                                        <LucideGitBranch size={28} className="text-white" />
                                    </div>
                                </div>
                                <div className="font-semibold text-indigo-800">Git</div>
                                <div className="text-xs text-indigo-600 mt-1">Self-host Guide</div>
                            </a>
                            </div>
                        )}

                        {/* List View */}
                        {viewMode === 'list' && authState.isLoggedIn === 'true' && (
                            <div className="space-y-4">
                                {Object.entries(filteredSections()).map(([sectionKey, section]) => (
                                    <ListSectionComponent
                                        key={sectionKey}
                                        sectionKey={sectionKey}
                                        section={section}
                                    />
                                ))}
                                
                                {Object.keys(filteredSections()).length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <LucideSearch size={48} className="mx-auto mb-4 text-gray-300" />
                                        <div className="text-lg font-medium">No items found</div>
                                        <div className="text-sm">
                                            {searchFilter ? 'Try a different search term' : 'Try adjusting your filters'}
                                </div>
                                        {(searchFilter || showOnlyWithBadges) && (
                                            <button
                                                onClick={() => {
                                                    setSearchFilter('');
                                                    setShowOnlyWithBadges(false);
                                                }}
                                                className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-sm hover:bg-blue-600 transition-colors"
                                            >
                                                Clear Filters
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* List View for Non-authenticated Users */}
                        {viewMode === 'list' && authState.isLoggedIn === 'false' && (
                            <div className="space-y-4">
                                <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="p-4 border-b border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-sm bg-emerald-100">
                                                <LucideLogIn size={20} className="text-emerald-600" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-800">Authentication Required</div>
                                                <div className="text-sm text-gray-600">Sign in to access all features</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        <Link 
                                            to="/login" 
                                            className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-sm transition-colors"
                                            onClick={() => handleCardClick('login')}
                                        >
                                            <div className="p-2 rounded-sm bg-emerald-100">
                                                <LucideLogIn size={16} className="text-emerald-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-gray-800">Login</div>
                                                <div className="text-sm text-gray-600">Sign in to your account</div>
                                            </div>
                                        </Link>
                                        <Link 
                                            to="/register" 
                                            className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-sm transition-colors"
                                            onClick={() => handleCardClick('register')}
                                        >
                                            <div className="p-2 rounded-sm bg-sky-100">
                                                <LucideUserPlus size={16} className="text-sky-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-gray-800">Register</div>
                                                <div className="text-sm text-gray-600">Create a new account</div>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                                
                                <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="p-4 border-b border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-sm bg-teal-100">
                                                <LucideHelpCircle size={20} className="text-teal-600" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-800">Public Information</div>
                                                <div className="text-sm text-gray-600">Available without authentication</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        <Link 
                                            to="/about" 
                                            className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-sm transition-colors"
                                            onClick={() => handleCardClick('about')}
                                        >
                                            <div className="p-2 rounded-sm bg-teal-100">
                                                <LucideHelpCircle size={16} className="text-teal-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-gray-800">About</div>
                                                <div className="text-sm text-gray-600">App information and details</div>
                                            </div>
                                        </Link>
                                        <a 
                                            href="https://ai-notes.xyz/docs/selfhost/selfhost-docker-build"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-sm transition-colors"
                                            onClick={() => handleCardClick('git')}
                                        >
                                            <div className="p-2 rounded-sm bg-indigo-100">
                                                <LucideGitBranch size={16} className="text-indigo-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-gray-800 flex items-center gap-2">
                                                    Git
                                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">External</span>
                                                </div>
                                                <div className="text-sm text-gray-600">Self-hosting documentation</div>
                                            </div>
                            </a>
                        </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserHomepageBackupDelete;