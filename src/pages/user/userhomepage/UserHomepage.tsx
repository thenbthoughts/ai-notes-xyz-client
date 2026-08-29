import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
    LucideInfo,
    LucideList,
    LucideMessageSquare,
    LucideSettings,
    LucideLogIn,
    LucideUserPlus,
    LucideLogOut,
    LucideLoader,
    LucideCalendar1,
    LucideFileText,
    LucideClock,
    LucideMap,
    LucideRefreshCcw,
    LucideLightbulb,
    LucideSearch,
    LucideCalendar,
    LucideStickyNote,
    LucidePanelLeftClose,
    LucidePanelLeftOpen,
    LucideGripVertical,
    LucideX,
} from 'lucide-react';
import { useAtomValue } from 'jotai';
import { Fragment, useEffect, useState, type ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import axiosCustom from '../../../config/axiosCustom';

import stateJotaiAuthAtom from '../../../jotai/stateJotaiAuth';
import iconGit from './iconGit.svg';

import ComponentFromBrithdayToToday from './ComponentFromBrithdayToToday';
import ComponentPinnedTask from './ComponentPinnedTask';
import ComponentCurrentDateTime from './ComponentCurrentDateTime';
import ComponentApiKeySet from './ComponentApiKeySet';
import ComponentQuickActions from './ComponentQuickActions';
import ComponentHomepageSummary from './ComponentHomepageSummary';
import ComponentUpcomingCalendar from './ComponentUpcomingCalendar';

const asideStorageKey = 'home-aside-collapsed';
const panelOrderStorageKey = 'home-panel-order';

const defaultPanelOrder = [
    'currentTime',
    'quickActions',
    'upcoming',
    'birthday',
    'pinned',
    'summary',
    'apiKeys',
];

const readAsideCollapsed = () => {
    try {
        const raw = localStorage.getItem(asideStorageKey);
        if (raw === 'true') {
            return true;
        }
        return false;
    } catch {
        return false;
    }
};

const writeAsideCollapsed = (next: boolean) => {
    try {
        localStorage.setItem(asideStorageKey, String(next));
    } catch {
        return;
    }
};

const readPanelOrder = () => {
    try {
        const raw = localStorage.getItem(panelOrderStorageKey);
        if (raw) {
            const parsed = JSON.parse(raw) as string[];
            if (Array.isArray(parsed) && parsed.length > 0) {
                const filtered = parsed.filter((id) => {
                    return defaultPanelOrder.includes(id);
                });
                const missing = defaultPanelOrder.filter((id) => {
                    return !filtered.includes(id);
                });
                return [...filtered, ...missing];
            }
        }
        return [...defaultPanelOrder];
    } catch {
        return [...defaultPanelOrder];
    }
};

const writePanelOrder = (order: string[]) => {
    try {
        localStorage.setItem(panelOrderStorageKey, JSON.stringify(order));
    } catch {
        return;
    }
};

function NavTile({
    to,
    href,
    label,
    icon: Icon,
    variant = 'default',
    children,
}: {
    to?: string;
    href?: string;
    label: string;
    icon: LucideIcon;
    variant?: 'default' | 'danger';
    children?: ReactNode;
}) {
    const body = (
        <>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-900/60 text-sky-400 ring-2 ring-sky-700/70 transition group-hover:scale-105 group-hover:bg-sky-800/80 group-hover:text-sky-200 group-hover:ring-sky-600/80 sm:h-9 sm:w-9">
                <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={2} />
            </span>
            <span className="max-w-full truncate px-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-200/90 group-hover:text-sky-100 sm:text-xs">
                {label}
            </span>
            {children}
        </>
    );
    if (href) {
        return (
            <a
                href={href}
                aria-label={label}
                className={
                    variant === 'danger'
                        ? 'group flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-rose-700 bg-rose-950/60 p-2 text-center shadow-md shadow-rose-900/50 transition hover:border-rose-600 hover:bg-rose-950 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900'
                        : 'group flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-sky-700/80 bg-zinc-900/90 p-2 text-center shadow-md shadow-sky-900/30 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-sky-500 hover:bg-zinc-800/70 hover:shadow-lg hover:shadow-sky-900/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900'
                }
                target="_blank"
                rel="noopener noreferrer"
            >
                {body}
            </a>
        );
    }
    return (
        <Link
            to={to!}
            aria-label={label}
            className={
                variant === 'danger'
                    ? 'group flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-rose-700 bg-rose-950/60 p-2 text-center shadow-md shadow-rose-900/50 transition hover:border-rose-600 hover:bg-rose-950 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900'
                    : 'group flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-sky-700/80 bg-zinc-900/90 p-2 text-center shadow-md shadow-sky-900/30 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-sky-500 hover:bg-zinc-800/70 hover:shadow-lg hover:shadow-sky-900/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900'
            }
        >
            {body}
        </Link>
    );
}

const UserHomepage = () => {
    const authState = useAtomValue(stateJotaiAuthAtom);

    const [name, setName] = useState('');
    const [isAsideCollapsed, setIsAsideCollapsed] = useState(() => {
        return readAsideCollapsed();
    });
    const [panelOrder, setPanelOrder] = useState(() => {
        return readPanelOrder();
    });
    const [dragId, setDragId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);

    const [dashboardStats, setDashboardStats] = useState({
        taskCompletedCount: 0,
        totalCount: 0,
    });

    useEffect(() => {
        void fetchUser();
        void fetchStats();
    }, []);

    useEffect(() => {
        writeAsideCollapsed(isAsideCollapsed);
    }, [isAsideCollapsed]);

    useEffect(() => {
        writePanelOrder(panelOrder);
    }, [panelOrder]);

    const fetchUser = async () => {
        try {
            const response = await axiosCustom.post(
                `/api/user/crud/getUser`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true,
                }
            );
            const fetchedName = response.data.name;
            if (typeof fetchedName === 'string') {
                setName(fetchedName);
            } else {
                console.error('Fetched name is not a string:', fetchedName);
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axiosCustom.get('/api/dashboard/crud/get-dashboard-stats');
            const data = response.data.docs;

            const tempDashboardStats = {
                taskCompletedCount: 0,
                totalCount: 0,
            };

            if (typeof data.taskCompletedCount === 'number') {
                tempDashboardStats.taskCompletedCount = data.taskCompletedCount;
            }
            if (typeof data.totalCount === 'number') {
                tempDashboardStats.totalCount = data.totalCount;
            }

            setDashboardStats(tempDashboardStats);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleBulkRefresh = () => {
        setRefreshKey((prev) => {
            return prev + 1;
        });
        void fetchStats();
        toast.success('Refreshing all panels…');
    };

    const handleClearSearch = async () => {
        setSearchQuery('');
        try {
            await navigator.clipboard.writeText('');
        } catch {
            toast.error('Failed to clear clipboard');
        }
    };

    const handleDragStart = (id: string) => {
        setDragId(id);
    };

    const handleDragOver = (event: React.DragEvent, overId: string) => {
        event.preventDefault();
        if (dragId === null || dragId === overId) {
            return;
        }
        setPanelOrder((prev) => {
            const next = [...prev];
            const fromIdx = next.indexOf(dragId);
            const toIdx = next.indexOf(overId);
            if (fromIdx === -1 || toIdx === -1) {
                return prev;
            }
            next.splice(fromIdx, 1);
            next.splice(toIdx, 0, dragId);
            return next;
        });
    };

    const handleDragEnd = () => {
        setDragId(null);
    };

    const taskPct =
        dashboardStats.totalCount > 0
            ? Math.round((dashboardStats.taskCompletedCount / dashboardStats.totalCount) * 100)
            : 0;

    const completedTooltip = `Completed ${dashboardStats.taskCompletedCount} of ${dashboardStats.totalCount} tasks (${taskPct}%)`;
    const totalTooltip = `Total tasks: ${dashboardStats.totalCount}`;

    const tileDefs: { label: string; to?: string; href?: string; icon: LucideIcon; variant?: 'default' | 'danger' }[] = [
        { label: 'Chat', to: '/user/chat', icon: LucideMessageSquare },
        { label: 'Search', to: '/user/search', icon: LucideSearch },
        { label: 'Timeline', to: '/user/timeline', icon: LucideCalendar },
        { label: 'Suggestions', to: '/user/suggestions', icon: LucideLightbulb },
        { label: 'Notes', to: '/user/notes', icon: LucideFileText },
        { label: 'Memo', to: '/user/memo', icon: LucideStickyNote },
        { label: 'Life events', to: '/user/life-events', icon: LucideCalendar1 },
        { label: 'Info vault', to: '/user/info-vault', icon: LucideInfo },
        { label: 'Maps', to: '/user/maps', icon: LucideMap },
        { label: 'Calendar', to: '/user/calender', icon: LucideCalendar1 },
        { label: 'Schedule', to: '/user/task-schedule', icon: LucideClock },
        { label: 'Settings', to: '/user/setting', icon: LucideSettings },
        { label: 'Logout', to: '/logout', icon: LucideLogOut, variant: 'danger' as const },
    ];

    const filteredTiles = tileDefs.filter((t) => {
        if (searchQuery.trim() === '') {
            return true;
        }
        return t.label.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const loginTileDefs: { label: string; to: string; icon: LucideIcon }[] = [
        { label: 'Login', to: '/login', icon: LucideLogIn },
        { label: 'Register', to: '/register', icon: LucideUserPlus },
    ];

    const filteredLoginTiles = loginTileDefs.filter((t) => {
        if (searchQuery.trim() === '') {
            return true;
        }
        return t.label.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const panelMap: Record<string, ReactNode> = {
        currentTime: <ComponentCurrentDateTime key="currentTime" />,
        quickActions: <ComponentQuickActions key="quickActions" />,
        upcoming: <ComponentUpcomingCalendar key="upcoming" refreshKey={refreshKey} />,
        birthday: <ComponentFromBrithdayToToday key="birthday" />,
        pinned: <ComponentPinnedTask key="pinned" refreshKey={refreshKey} />,
        summary: <ComponentHomepageSummary key="summary" refreshKey={refreshKey} />,
        apiKeys: <ComponentApiKeySet key="apiKeys" />,
    };

    return (
        <div
            className="min-h-[calc(100vh-60px)] bg-[radial-gradient(ellipse_90%_60%_at_80%_-10%,rgba(56,189,248,0.12),transparent_55%),radial-gradient(ellipse_70%_50%_at_10%_20%,rgba(125,211,252,0.08),transparent_50%),linear-gradient(to_bottom_right,rgb(24_24_27),rgb(24_24_27),rgb(9_9_11))] px-2 pb-4 pt-2 sm:px-3"
        >
            <Helmet>
                <title>Home — AI Notes XYZ</title>
            </Helmet>
            <div className="mx-auto w-full max-w-6xl">
                <header className="flex items-center justify-between gap-2 text-center lg:text-left">
                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight text-sky-100 sm:text-2xl">
                            {authState.isLoggedIn === 'true'
                                ? `Hello, ${name || 'there'}`
                                : 'AI Notes XYZ'}
                        </h1>
                        <p className="mt-1 text-xs font-medium text-sky-300/85">
                            {authState.isLoggedIn === 'true'
                                ? 'Your dashboard — jump in anywhere.'
                                : 'Sign in to sync notes, tasks, and chat.'}
                        </p>
                    </div>
                    <div className="hidden items-center gap-1 lg:flex">
                        {authState.isLoggedIn === 'true' && (
                            <button
                                type="button"
                                onClick={handleBulkRefresh}
                                className="inline-flex items-center gap-1 rounded-xl border-2 border-sky-700/70 bg-zinc-900 px-2 py-1 text-xs font-semibold text-sky-200 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                                aria-label="Refresh all panels"
                                title="Refresh all"
                            >
                                <LucideRefreshCcw className="h-4 w-4" strokeWidth={2} />
                                Refresh all
                            </button>
                        )}
                        {authState.isLoggedIn === 'true' && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsAsideCollapsed((prev) => {
                                        return !prev;
                                    });
                                }}
                                className="inline-flex items-center gap-1 rounded-xl border-2 border-sky-700/70 bg-zinc-900 px-2 py-1 text-xs font-semibold text-sky-200 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                                aria-label={isAsideCollapsed ? 'Expand dashboard aside' : 'Collapse dashboard aside'}
                                title={isAsideCollapsed ? 'Expand' : 'Collapse'}
                            >
                                {isAsideCollapsed ? (
                                    <LucidePanelLeftOpen className="h-4 w-4" strokeWidth={2} />
                                ) : (
                                    <LucidePanelLeftClose className="h-4 w-4" strokeWidth={2} />
                                )}
                                {isAsideCollapsed ? 'Show panels' : 'Hide panels'}
                            </button>
                        )}
                    </div>
                </header>

                <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-start">
                    <aside className={`w-full shrink-0 space-y-2 lg:pr-1 ${isAsideCollapsed ? 'hidden lg:block lg:max-w-[56px]' : 'lg:max-w-sm'}`}>
                        {authState.isLoggedIn === 'true' && (
                            <Fragment>
                                {isAsideCollapsed ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsAsideCollapsed(false);
                                            }}
                                            className="rounded-xl border-2 border-sky-700/70 bg-zinc-900 p-2 text-sky-300 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                                            aria-label="Expand aside panels"
                                            title="Expand panels"
                                        >
                                            <LucidePanelLeftOpen className="h-4 w-4" strokeWidth={2} />
                                        </button>
                                        <div className="h-20 w-1 rounded-full bg-zinc-800" />
                                        <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">Panels</span>
                                    </div>
                                ) : (
                                    <Fragment>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">Drag to reorder panels</span>
                                            <button
                                                type="button"
                                                onClick={handleBulkRefresh}
                                                className="inline-flex items-center gap-1 rounded-lg border border-sky-700 bg-zinc-900 px-1.5 py-0.5 text-[10px] font-bold text-sky-200 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 lg:hidden"
                                                aria-label="Refresh all panels"
                                            >
                                                <LucideRefreshCcw className="h-3 w-3" strokeWidth={2} />
                                                Refresh all
                                            </button>
                                        </div>
                                        {panelOrder.map((pid) => {
                                            return (
                                                <div
                                                    key={pid}
                                                    draggable
                                                    onDragStart={() => {
                                                        handleDragStart(pid);
                                                    }}
                                                    onDragOver={(event) => {
                                                        handleDragOver(event, pid);
                                                    }}
                                                    onDragEnd={handleDragEnd}
                                                    className={`group relative ${dragId === pid ? 'opacity-60' : ''}`}
                                                    aria-label={`Panel ${pid}, drag to reorder`}
                                                >
                                                    <div className="absolute -left-1 top-2 hidden h-6 w-1 rounded-full bg-zinc-700 group-hover:block lg:block">
                                                        <LucideGripVertical className="h-3 w-3 text-zinc-500" strokeWidth={2} />
                                                    </div>
                                                    {panelMap[pid]}
                                                </div>
                                            );
                                        })}
                                    </Fragment>
                                )}
                            </Fragment>
                        )}
                        {authState.isLoggedIn === 'false' && (
                            <Fragment>
                                <button
                                    type="button"
                                    className="mb-1.5 flex w-full items-center gap-2 rounded-2xl border-2 border-sky-700/90 bg-zinc-900/90 px-2.5 py-1.5 text-left shadow-md shadow-sky-900/25 backdrop-blur-sm transition hover:border-sky-500 hover:bg-zinc-800/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                                    onClick={() => {
                                        window.location.reload();
                                    }}
                                    aria-label="Refresh page"
                                >
                                    <span className="flex items-center gap-2 text-xs font-bold text-sky-100">
                                        <LucideRefreshCcw className="h-4 w-4 shrink-0 text-sky-400" strokeWidth={2} />
                                        Refresh
                                    </span>
                                </button>
                                <Link
                                    to="/login"
                                    aria-label="Login"
                                    className="mb-1.5 flex w-full items-center gap-2 rounded-2xl border-2 border-sky-700/90 bg-zinc-900/90 px-2.5 py-1.5 text-left shadow-md shadow-sky-900/25 backdrop-blur-sm transition hover:border-sky-500 hover:bg-zinc-800/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                                >
                                    <span className="flex items-center gap-2 text-xs font-bold text-sky-100">
                                        <LucideLogIn className="h-4 w-4 shrink-0 text-sky-400" strokeWidth={2} />
                                        Login
                                    </span>
                                </Link>
                                <Link
                                    to="/register"
                                    aria-label="Register"
                                    className="mb-1.5 flex w-full items-center gap-2 rounded-2xl border-2 border-sky-700/90 bg-zinc-900/90 px-2.5 py-1.5 text-left shadow-md shadow-sky-900/25 backdrop-blur-sm transition hover:border-sky-500 hover:bg-zinc-800/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                                >
                                    <span className="flex items-center gap-2 text-xs font-bold text-sky-100">
                                        <LucideUserPlus className="h-4 w-4 shrink-0 text-sky-400" strokeWidth={2} />
                                        Register
                                    </span>
                                </Link>
                                <ComponentCurrentDateTime />
                            </Fragment>
                        )}
                    </aside>

                    <section className="min-w-0 flex-1">
                        <div className="mb-2 flex items-center gap-1.5">
                            <div className="relative flex-1">
                                <LucideSearch className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" strokeWidth={2} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(event) => {
                                        setSearchQuery(event.target.value);
                                    }}
                                    placeholder="Search tiles…"
                                    className="w-full rounded-xl border-2 border-sky-700/60 bg-zinc-900/90 py-1.5 pl-7 pr-7 text-xs font-medium text-sky-100 placeholder:text-zinc-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    aria-label="Search dashboard tiles"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            void handleClearSearch();
                                        }}
                                        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg bg-zinc-800 p-1 text-zinc-400 hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                                        aria-label="Clear search"
                                    >
                                        <LucideX className="h-3 w-3" strokeWidth={2} />
                                    </button>
                                )}
                            </div>
                            <span className="hidden text-[10px] font-semibold text-zinc-500 sm:inline">{filteredTiles.length} tiles</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {authState.isLoggedIn === 'pending' && (
                                <Link
                                    to="/"
                                    aria-label="Loading"
                                    className="group flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-sky-700/80 bg-zinc-900/90 p-2 text-center shadow-md shadow-sky-900/30 backdrop-blur-sm transition hover:border-sky-500 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-900/60 text-sky-400 ring-2 ring-sky-700/70 transition group-hover:bg-sky-800/80 sm:h-9 sm:w-9">
                                        <LucideLoader className="h-5 w-5 animate-spin text-sky-400" strokeWidth={2} />
                                    </span>
                                    <span className="max-w-full truncate px-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-200 group-hover:text-sky-100 sm:text-xs">
                                        Loading…
                                    </span>
                                </Link>
                            )}

                            {authState.isLoggedIn === 'true' && (
                                <Fragment>
                                    {filteredTiles.map((tile) => {
                                        if (tile.label === 'Tasks') {
                                            return null;
                                        }
                                        return <NavTile key={tile.label} to={tile.to} href={tile.href} label={tile.label} icon={tile.icon} variant={tile.variant} />;
                                    })}
                                    {filteredTiles.some((t) => {
                                        return t.label === 'Tasks';
                                    }) && (
                                        <Link
                                            to="/user/task"
                                            aria-label={`Tasks ${dashboardStats.taskCompletedCount} of ${dashboardStats.totalCount} completed`}
                                            className="group flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-sky-700/80 bg-zinc-900/90 p-2 text-center shadow-md shadow-sky-900/30 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-sky-500 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
                                        >
                                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-900/60 text-sky-400 ring-2 ring-sky-700/70 transition group-hover:scale-105 group-hover:bg-sky-800/80 sm:h-9 sm:w-9">
                                                <LucideList className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={2} />
                                            </span>
                                            <span className="max-w-full truncate px-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-200 group-hover:text-sky-100 sm:text-xs">
                                                Tasks
                                            </span>
                                            {dashboardStats.taskCompletedCount > 0 &&
                                                dashboardStats.totalCount > 0 && (
                                                    <div className="w-full space-y-1" title={completedTooltip}>
                                                        <div className="text-[10px] font-semibold text-sky-300/90" title={completedTooltip}>
                                                            {dashboardStats.taskCompletedCount} /{' '}
                                                            {dashboardStats.totalCount}
                                                            {taskPct >= 1 && (
                                                                <span className="ml-1 text-cyan-400" title={completedTooltip}>
                                                                    ({taskPct}%)
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-sky-800/80" title={completedTooltip}>
                                                            <div
                                                                className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 transition-all duration-500"
                                                                style={{ width: `${taskPct}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            {dashboardStats.totalCount === 0 && (
                                                <span className="text-[10px] font-medium text-zinc-500" title={totalTooltip}>No tasks yet</span>
                                            )}
                                        </Link>
                                    )}
                                    {filteredTiles.length === 0 && (
                                        <div className="col-span-2 flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-900/50 px-3 py-6 text-center sm:col-span-3">
                                            <p className="text-xs font-semibold text-zinc-300">No tiles match “{searchQuery}”</p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSearchQuery('');
                                                }}
                                                className="mt-1 rounded-lg border border-sky-700 bg-zinc-900 px-2 py-1 text-[11px] font-semibold text-sky-200 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                                                aria-label="Clear tile search"
                                            >
                                                Clear search
                                            </button>
                                        </div>
                                    )}
                                </Fragment>
                            )}

                            {authState.isLoggedIn === 'false' && (
                                <Fragment>
                                    {filteredLoginTiles.map((t) => {
                                        return <NavTile key={t.label} to={t.to} label={t.label} icon={t.icon} />;
                                    })}
                                </Fragment>
                            )}

                            {(searchQuery.trim() === '' || 'about'.includes(searchQuery.toLowerCase())) && (
                                <NavTile to="/about" label="About" icon={LucideInfo} />
                            )}
                            {(searchQuery.trim() === '' || 'git'.includes(searchQuery.toLowerCase())) && (
                                <a
                                    href="https://ai-notes.xyz/docs/selfhost/selfhost-docker-build"
                                    aria-label="Git self-host docs"
                                    className="group flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-sky-700/80 bg-zinc-900/90 p-2 text-center shadow-md shadow-sky-900/30 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-sky-500 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-900/60 text-sky-400 ring-2 ring-sky-700/70 transition group-hover:scale-105 group-hover:bg-sky-800/80 sm:h-9 sm:w-9">
                                        <img
                                            src={iconGit}
                                            alt=""
                                            className="h-6 w-6 object-contain opacity-90 sm:h-7 sm:w-7"
                                        />
                                    </span>
                                    <span className="max-w-full truncate px-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-200 group-hover:text-sky-100 sm:text-xs">
                                        Git
                                    </span>
                                </a>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default UserHomepage;
