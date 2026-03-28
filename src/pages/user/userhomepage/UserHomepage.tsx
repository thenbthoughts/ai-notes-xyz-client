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
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-600 ring-2 ring-sky-200/70 transition group-hover:scale-105 group-hover:bg-sky-200/80 group-hover:text-sky-800 group-hover:ring-sky-300/80 sm:h-9 sm:w-9">
                <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={2} />
            </span>
            <span className="max-w-full truncate px-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-800/90 group-hover:text-sky-950 sm:text-xs">
                {label}
            </span>
            {children}
        </>
    );
    if (href) {
        return (
            <a
                href={href}
                className={
                    variant === 'danger'
                        ? 'group flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-rose-200 bg-rose-50/60 p-2 text-center shadow-md shadow-rose-100/50 transition hover:border-rose-300 hover:bg-rose-50 hover:shadow-lg'
                        : 'group flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-sky-200/80 bg-white/90 p-2 text-center shadow-md shadow-sky-200/30 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-sky-400 hover:bg-sky-50/70 hover:shadow-lg hover:shadow-sky-200/50'
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
            className={
                variant === 'danger'
                    ? 'group flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-rose-200 bg-rose-50/60 p-2 text-center shadow-md shadow-rose-100/50 transition hover:border-rose-300 hover:bg-rose-50 hover:shadow-lg'
                    : 'group flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-sky-200/80 bg-white/90 p-2 text-center shadow-md shadow-sky-200/30 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-sky-400 hover:bg-sky-50/70 hover:shadow-lg hover:shadow-sky-200/50'
            }
        >
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
        <div
            className="min-h-[calc(100vh-60px)] bg-[radial-gradient(ellipse_90%_60%_at_80%_-10%,rgba(56,189,248,0.28),transparent_55%),radial-gradient(ellipse_70%_50%_at_10%_20%,rgba(125,211,252,0.4),transparent_50%),linear-gradient(to_bottom_right,rgb(224_242_254),rgb(239_246_255),rgb(236_254_255))] px-2 pb-4 pt-2 sm:px-3"
        >
            <div className="mx-auto w-full max-w-6xl">
                <header className="text-center lg:text-left">
                    <h1 className="text-xl font-extrabold tracking-tight text-sky-950 sm:text-2xl">
                        {authState.isLoggedIn === 'true'
                            ? `Hello, ${name || 'there'}`
                            : 'AI Notes XYZ'}
                    </h1>
                    <p className="mt-1 text-xs font-medium text-sky-700/85">
                        {authState.isLoggedIn === 'true'
                            ? 'Your dashboard — jump in anywhere.'
                            : 'Sign in to sync notes, tasks, and chat.'}
                    </p>
                </header>

                <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-start">
                    <aside className="w-full shrink-0 space-y-2 lg:max-w-sm lg:pr-1">
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
                                    className="mb-1.5 flex w-full items-center gap-2 rounded-2xl border-2 border-sky-200/90 bg-white/90 px-2.5 py-1.5 text-left shadow-md shadow-sky-200/25 backdrop-blur-sm transition hover:border-sky-400 hover:bg-sky-50/80"
                                    onClick={() => window.location.reload()}
                                >
                                    <span className="flex items-center gap-2 text-xs font-bold text-sky-900">
                                        <LucideRefreshCcw className="h-4 w-4 shrink-0 text-sky-600" strokeWidth={2} />
                                        Refresh
                                    </span>
                                </button>
                                <Link
                                    to="/login"
                                    className="mb-1.5 flex w-full items-center gap-2 rounded-2xl border-2 border-sky-200/90 bg-white/90 px-2.5 py-1.5 text-left shadow-md shadow-sky-200/25 backdrop-blur-sm transition hover:border-sky-400 hover:bg-sky-50/80"
                                >
                                    <span className="flex items-center gap-2 text-xs font-bold text-sky-900">
                                        <LucideLogIn className="h-4 w-4 shrink-0 text-sky-600" strokeWidth={2} />
                                        Login
                                    </span>
                                </Link>
                                <Link
                                    to="/register"
                                    className="mb-1.5 flex w-full items-center gap-2 rounded-2xl border-2 border-sky-200/90 bg-white/90 px-2.5 py-1.5 text-left shadow-md shadow-sky-200/25 backdrop-blur-sm transition hover:border-sky-400 hover:bg-sky-50/80"
                                >
                                    <span className="flex items-center gap-2 text-xs font-bold text-sky-900">
                                        <LucideUserPlus className="h-4 w-4 shrink-0 text-sky-600" strokeWidth={2} />
                                        Register
                                    </span>
                                </Link>
                                <ComponentCurrentDateTime />
                            </Fragment>
                        )}
                    </aside>

                    <section className="min-w-0 flex-1">
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {authState.isLoggedIn === 'pending' && (
                                <Link
                                    to="/"
                                    className="group flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-sky-200/80 bg-white/90 p-2 text-center shadow-md shadow-sky-200/30 backdrop-blur-sm transition hover:border-sky-400 hover:shadow-lg"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-600 ring-2 ring-sky-200/70 transition group-hover:bg-sky-200/80 sm:h-9 sm:w-9">
                                        <LucideLoader className="h-5 w-5 animate-spin text-sky-600" strokeWidth={2} />
                                    </span>
                                    <span className="max-w-full truncate px-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-800 group-hover:text-sky-950 sm:text-xs">
                                        Loading…
                                    </span>
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
                                    <Link
                                        to="/user/task"
                                        className="group flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-sky-200/80 bg-white/90 p-2 text-center shadow-md shadow-sky-200/30 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-sky-400 hover:shadow-lg"
                                    >
                                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-600 ring-2 ring-sky-200/70 transition group-hover:scale-105 group-hover:bg-sky-200/80 sm:h-9 sm:w-9">
                                            <LucideList className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={2} />
                                        </span>
                                        <span className="max-w-full truncate px-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-800 group-hover:text-sky-950 sm:text-xs">
                                            Tasks
                                        </span>
                                        {dashboardStats.taskCompletedCount > 0 &&
                                            dashboardStats.totalCount > 0 && (
                                                <div className="w-full space-y-1">
                                                    <div className="text-[10px] font-semibold text-sky-700/90">
                                                        {dashboardStats.taskCompletedCount} /{' '}
                                                        {dashboardStats.totalCount}
                                                        {taskPct >= 1 && (
                                                            <span className="ml-1 text-cyan-600">
                                                                ({taskPct}%)
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-sky-200/80">
                                                        <div
                                                            className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 transition-all duration-500"
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
                                className="group flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-sky-200/80 bg-white/90 p-2 text-center shadow-md shadow-sky-200/30 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-sky-400 hover:shadow-lg"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-600 ring-2 ring-sky-200/70 transition group-hover:scale-105 group-hover:bg-sky-200/80 sm:h-9 sm:w-9">
                                    <img
                                        src={iconGit}
                                        alt=""
                                        className="h-6 w-6 object-contain opacity-90 sm:h-7 sm:w-7"
                                    />
                                </span>
                                <span className="max-w-full truncate px-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-800 group-hover:text-sky-950 sm:text-xs">
                                    Git
                                </span>
                            </a>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default UserHomepage;
