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
} from 'lucide-react';
import { useAtomValue } from 'jotai';
import { Fragment, useEffect, useState, type ReactNode } from 'react';
import axiosCustom from '../../../config/axiosCustom';

import stateJotaiAuthAtom from '../../../jotai/stateJotaiAuth';
import iconGit from './iconGit.svg';

import ComponentFromBrithdayToToday from './ComponentFromBrithdayToToday';
import ComponentPinnedTask from './ComponentPinnedTask';
import ComponentCurrentDateTime from './ComponentCurrentDateTime';
import ComponentApiKeySet from './ComponentApiKeySet';
import ComponentQuickActions from './ComponentQuickActions';
import ComponentHomepageSummary from './ComponentHomepageSummary';

const homePageRoot =
    'min-h-[calc(100vh-60px)] bg-zinc-50 bg-[radial-gradient(ellipse_100%_55%_at_50%_-8%,rgba(6,182,212,0.07),transparent_52%)] px-2 pb-4 pt-2 sm:px-3';
const homePageInner = 'mx-auto w-full max-w-6xl';
const homeHeroTitle = 'text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl';
const homeHeroHint = 'mt-0.5 text-xs text-zinc-500';
const homeLayoutRow = 'mt-3 flex flex-col gap-3 lg:flex-row lg:items-start';
const homeColLeft = 'w-full shrink-0 space-y-2 lg:max-w-sm lg:pr-1';
const homeColRight = 'min-w-0 flex-1';
const homeNavGrid = 'grid grid-cols-2 gap-2 sm:grid-cols-3';
const guestCtaCard =
    'mb-1.5 flex w-full items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-left shadow-sm transition hover:border-teal-300 hover:bg-teal-50/50';
const navTileBase =
    'group flex flex-col items-center justify-center gap-1 rounded-lg border border-zinc-200/90 bg-white p-2 text-center shadow-sm transition hover:border-teal-300/80 hover:shadow';
const navTileDanger =
    'group flex flex-col items-center justify-center gap-1 rounded-lg border border-rose-200 bg-rose-50/40 p-2 text-center shadow-sm transition hover:border-rose-300 hover:bg-rose-50';
const navTileLabel =
    'max-w-full truncate px-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-600 group-hover:text-zinc-900 sm:text-xs';
const navTileIconWrap =
    'flex h-8 w-8 items-center justify-center rounded-md bg-zinc-100 text-teal-600 ring-1 ring-zinc-200/80 transition group-hover:bg-teal-50 group-hover:text-teal-700 sm:h-9 sm:w-9';

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
    const shell = variant === 'danger' ? navTileDanger : navTileBase;
    const body = (
        <>
            <span className={navTileIconWrap}>
                <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={2} />
            </span>
            <span className={navTileLabel}>{label}</span>
            {children}
        </>
    );
    if (href) {
        return (
            <a
                href={href}
                className={shell}
                target="_blank"
                rel="noopener noreferrer"
            >
                {body}
            </a>
        );
    }
    return (
        <Link to={to!} className={shell}>
            {body}
        </Link>
    );
}

const UserHomepage = () => {
    const authState = useAtomValue(stateJotaiAuthAtom);

    const [name, setName] = useState('');

    const [dashboardStats, setDashboardStats] = useState({
        taskCompletedCount: 0,
        totalCount: 0,
    });

    useEffect(() => {
        void fetchUser();
        void fetchStats();
    }, []);

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

    const taskPct =
        dashboardStats.totalCount > 0
            ? Math.round((dashboardStats.taskCompletedCount / dashboardStats.totalCount) * 100)
            : 0;

    return (
        <div className={homePageRoot}>
            <div className={homePageInner}>
                <header className="text-center lg:text-left">
                    <h1 className={homeHeroTitle}>
                        {authState.isLoggedIn === 'true'
                            ? `Hello, ${name || 'there'}`
                            : 'AI Notes XYZ'}
                    </h1>
                    <p className={homeHeroHint}>
                        {authState.isLoggedIn === 'true'
                            ? 'Your dashboard — jump in anywhere.'
                            : 'Sign in to sync notes, tasks, and chat.'}
                    </p>
                </header>

                <div className={homeLayoutRow}>
                    <aside className={homeColLeft}>
                        {authState.isLoggedIn === 'true' && (
                            <Fragment>
                                <ComponentCurrentDateTime />
                                <ComponentQuickActions />
                                <ComponentFromBrithdayToToday />
                                <ComponentPinnedTask />
                                <ComponentHomepageSummary />
                                <ComponentApiKeySet />
                            </Fragment>
                        )}
                        {authState.isLoggedIn === 'false' && (
                            <Fragment>
                                <button
                                    type="button"
                                    className={guestCtaCard}
                                    onClick={() => window.location.reload()}
                                >
                                    <span className="flex items-center gap-2 text-xs font-semibold text-zinc-800">
                                        <LucideRefreshCcw className="h-4 w-4 shrink-0 text-teal-600" strokeWidth={2} />
                                        Refresh
                                    </span>
                                </button>
                                <Link to="/login" className={guestCtaCard}>
                                    <span className="flex items-center gap-2 text-xs font-semibold text-zinc-800">
                                        <LucideLogIn className="h-4 w-4 shrink-0 text-teal-600" strokeWidth={2} />
                                        Login
                                    </span>
                                </Link>
                                <Link to="/register" className={guestCtaCard}>
                                    <span className="flex items-center gap-2 text-xs font-semibold text-zinc-800">
                                        <LucideUserPlus className="h-4 w-4 shrink-0 text-teal-600" strokeWidth={2} />
                                        Register
                                    </span>
                                </Link>
                                <ComponentCurrentDateTime />
                            </Fragment>
                        )}
                    </aside>

                    <section className={homeColRight}>
                        <div className={homeNavGrid}>
                            {authState.isLoggedIn === 'pending' && (
                                <Link to="/" className={navTileBase}>
                                    <span className={navTileIconWrap}>
                                        <LucideLoader className="h-5 w-5 animate-spin text-teal-600" strokeWidth={2} />
                                    </span>
                                    <span className={navTileLabel}>Loading…</span>
                                </Link>
                            )}

                            {authState.isLoggedIn === 'true' && (
                                <Fragment>
                                    <NavTile to="/user/chat" label="Chat" icon={LucideMessageSquare} />
                                    <NavTile to="/user/search" label="Search" icon={LucideSearch} />
                                    <NavTile to="/user/timeline" label="Timeline" icon={LucideCalendar} />
                                    <NavTile
                                        to="/user/suggestions"
                                        label="Suggestions"
                                        icon={LucideLightbulb}
                                    />
                                    <Link to="/user/task" className={navTileBase}>
                                        <span className={navTileIconWrap}>
                                            <LucideList className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={2} />
                                        </span>
                                        <span className={navTileLabel}>Tasks</span>
                                        {dashboardStats.taskCompletedCount > 0 &&
                                            dashboardStats.totalCount > 0 && (
                                                <div className="w-full space-y-1">
                                                    <div className="text-[10px] font-medium text-zinc-500">
                                                        {dashboardStats.taskCompletedCount} /{' '}
                                                        {dashboardStats.totalCount}
                                                        {taskPct >= 1 && (
                                                            <span className="ml-1 text-emerald-600">
                                                                ({taskPct}%)
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200">
                                                        <div
                                                            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-teal-500 transition-all duration-500"
                                                            style={{ width: `${taskPct}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                    </Link>
                                    <NavTile to="/user/notes" label="Notes" icon={LucideFileText} />
                                    <NavTile
                                        to="/user/life-events"
                                        label="Life events"
                                        icon={LucideCalendar1}
                                    />
                                    <NavTile to="/user/info-vault" label="Info vault" icon={LucideInfo} />
                                    <NavTile to="/user/maps" label="Maps" icon={LucideMap} />
                                    <NavTile to="/user/calender" label="Calendar" icon={LucideCalendar1} />
                                    <NavTile to="/user/task-schedule" label="Schedule" icon={LucideClock} />
                                    <NavTile to="/user/setting" label="Settings" icon={LucideSettings} />
                                    <NavTile
                                        to="/logout"
                                        label="Logout"
                                        icon={LucideLogOut}
                                        variant="danger"
                                    />
                                </Fragment>
                            )}

                            {authState.isLoggedIn === 'false' && (
                                <Fragment>
                                    <NavTile to="/login" label="Login" icon={LucideLogIn} />
                                    <NavTile to="/register" label="Register" icon={LucideUserPlus} />
                                </Fragment>
                            )}

                            <NavTile to="/about" label="About" icon={LucideInfo} />
                            <a
                                href="https://ai-notes.xyz/docs/selfhost/selfhost-docker-build"
                                className={navTileBase}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <span className={navTileIconWrap}>
                                    <img
                                        src={iconGit}
                                        alt=""
                                        className="h-6 w-6 object-contain opacity-90 sm:h-7 sm:w-7"
                                    />
                                </span>
                                <span className={navTileLabel}>Git</span>
                            </a>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default UserHomepage;
