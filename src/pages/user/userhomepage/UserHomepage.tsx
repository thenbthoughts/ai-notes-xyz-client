import { Link } from 'react-router-dom';
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
    LucideCalendar
} from 'lucide-react'; // Importing lucide icons
import { useAtomValue } from 'jotai';
import { Fragment, useEffect, useState } from 'react';
import axiosCustom from '../../../config/axiosCustom';

import useResponsiveScreen from '../../../hooks/useResponsiveScreen';
import stateJotaiAuthAtom from '../../../jotai/stateJotaiAuth'; // Adjust the import path as necessary
import iconGit from './iconGit.svg';

import ComponentFromBrithdayToToday from './ComponentFromBrithdayToToday';
import ComponentPinnedTask from './ComponentPinnedTask';
import ComponentCurrentDateTime from './ComponentCurrentDateTime';
import ComponentApiKeySet from './ComponentApiKeySet';
import ComponentQuickActions from './ComponentQuickActions';

const UserHomepage = () => {
    const authState = useAtomValue(stateJotaiAuthAtom);
    const screenSize = useResponsiveScreen();

    const [name, setName] = useState('');

    const [dashboardStats, setDashboardStats] = useState({
        taskCompletedCount: 0,
        totalCount: 0,
    });

    useEffect(() => {
        fetchUser();
        fetchStats();
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

    const fetchStats = async () => {
        try {
            const response = await axiosCustom.get('/api/dashboard/crud/get-dashboard-stats');
            const data = response.data.docs;
            console.log("Dashboard stats:", data);

            let tempDashboardStats = {
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
            console.error("Error fetching stats:", error);
        }
    }

    return (
        <div>
            <div style={{ maxWidth: '1000px', margin: '0 auto', paddingTop: '20px', paddingBottom: '20px' }}>
                <div style={{ paddingLeft: '20px', paddingRight: '20px' }}>
                    <h1 className="text-2xl font-bold text-white mb-2">Hello {name}</h1>
                </div>
                <div style={{ display: 'flex' }} className={`${screenSize === 'sm' ? 'flex-col' : 'flex-row'}`}>
                    {/* left */}
                    <div
                        style={{
                            width: `${screenSize === 'sm' ? '100%' : '40%'}`,
                            paddingLeft: `${screenSize === 'sm' ? '10px' : '20px'}`,
                            paddingRight: `${screenSize === 'sm' ? '10px' : '20px'}`,
                        }}
                    >
                        {authState.isLoggedIn === 'true' && (
                            <Fragment>
                                <div className="pb-2">
                                    <ComponentCurrentDateTime />
                                    <ComponentQuickActions />
                                    <ComponentFromBrithdayToToday />
                                    <ComponentPinnedTask />
                                    <ComponentApiKeySet />
                                </div>
                            </Fragment>
                        )}
                        {authState.isLoggedIn === 'false' && (
                            <Fragment>
                                <div className="pb-2">
                                    {/* Refresh button */}
                                    <button
                                        className="text-left p-3 border border-blue-400 rounded-sm shadow-md bg-gradient-to-r from-blue-100 to-blue-300 mb-2 hover:bg-blue-200 transition duration-300 w-full"
                                        onClick={() => window.location.reload()}
                                    >
                                        <div className="flex justify-between items-center ">
                                            <h2 className="text-lg font-bold text-blue-800 cursor-pointer">
                                                <LucideRefreshCcw size={20} className="inline mr-1" style={{ position: 'relative', top: '-2px' }} />
                                                Refresh
                                            </h2>
                                        </div>
                                    </button>

                                    {/* login */}
                                    <Link to="/login">
                                        <div
                                            className="text-left p-3 border border-blue-400 rounded-sm shadow-md bg-gradient-to-r from-blue-100 to-blue-300 mb-2 hover:bg-blue-200 transition duration-300"
                                        >
                                            <div className="flex justify-between items-center ">
                                                <h2 className="text-lg font-bold text-blue-800 cursor-pointer">
                                                    <LucideLogIn size={20} className="inline mr-1" style={{ position: 'relative', top: '-2px' }} />
                                                    Login
                                                </h2>
                                            </div>
                                        </div>
                                    </Link>

                                    {/* register */}
                                    <Link to="/register">
                                        <div
                                            className="text-left p-3 border border-blue-400 rounded-sm shadow-md bg-gradient-to-r from-blue-100 to-blue-300 mb-2 hover:bg-blue-200 transition duration-300"
                                        >
                                            <div className="flex justify-between items-center ">
                                                <h2 className="text-lg font-bold text-blue-800 cursor-pointer">
                                                    <LucideUserPlus size={20} className="inline mr-1" style={{ position: 'relative', top: '-2px' }} />
                                                    Register
                                                </h2>
                                            </div>
                                        </div>
                                    </Link>

                                    <ComponentCurrentDateTime />
                                </div>
                            </Fragment>
                        )}
                    </div>
                    {/* right */}
                    <div
                        style={{
                            width: `${screenSize === 'sm' ? '100%' : '60%'}`,
                            paddingLeft: `${screenSize === 'sm' ? '10px' : '20px'}`,
                            paddingRight: `${screenSize === 'sm' ? '10px' : '20px'}`,
                        }}
                    >
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '20px',
                                textAlign: 'center',
                            }}
                        >
                            {authState.isLoggedIn === 'pending' && (
                                <Link to="/" className='block p-3 border bg-cyan-100 rounded-sm hover:shadow-md'>
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <LucideLoader size={32} />
                                    </div>
                                    <div>Loading...</div>
                                </Link>
                            )}
                            {authState.isLoggedIn === 'true' && (
                                <>
                                    <Link to="/user/chat" className='block p-3 border bg-cyan-100 rounded-sm hover:shadow-md'>
                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            <LucideMessageSquare size={32} />
                                        </div>
                                        <div>Chat</div>
                                    </Link>
                                    <Link to="/user/search" className='block p-3 border bg-cyan-100 rounded-sm hover:shadow-md'>
                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            <LucideSearch size={32} />
                                        </div>
                                        <div>Search</div>
                                    </Link>
                                    <Link to="/user/timeline" className='block p-3 border bg-cyan-100 rounded-sm hover:shadow-md'>
                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            <LucideCalendar size={32} />
                                        </div>
                                        <div>Timeline</div>
                                    </Link>
                                    <Link to="/user/suggestions" className='block p-3 border bg-cyan-100 rounded-sm hover:shadow-md'>
                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            <LucideLightbulb size={32} />
                                        </div>
                                        <div>Suggestions</div>
                                    </Link>
                                    <Link
                                        to="/user/task"
                                        className='block p-3 border bg-cyan-100 rounded-sm hover:shadow-md'
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            <LucideList size={32} />
                                        </div>
                                        <div>Task</div>
                                        {dashboardStats.taskCompletedCount > 0 && dashboardStats.totalCount > 0 && (
                                            <Fragment>

                                                <div>
                                                    {dashboardStats.taskCompletedCount} / {dashboardStats.totalCount}
                                                    {Math.round((dashboardStats.taskCompletedCount / dashboardStats.totalCount) * 100) >= 1 && (
                                                        <span className='text-green-600 font-bold'>
                                                            {' '}
                                                            ({Math.round((dashboardStats.taskCompletedCount / dashboardStats.totalCount) * 100)}%)
                                                        </span>
                                                    )}
                                                </div>

                                                {/* cool up progress bar */}
                                                <div
                                                    style={{
                                                        height: '8px',
                                                        backgroundColor: '#f5f3f0',
                                                        width: '100%',
                                                        marginTop: '8px',
                                                        borderRadius: '10px',
                                                        overflow: 'hidden',
                                                        boxShadow: 'inset 0 2px 4px rgba(139,117,85,0.1)',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            height: '8px',
                                                            background: 'linear-gradient(90deg, #d4a574 0%, #c49660 50%, #b8864d 100%)',
                                                            width: `${Math.round((dashboardStats.taskCompletedCount / dashboardStats.totalCount) * 100)}%`,
                                                            borderRadius: '10px',
                                                            transition: 'width 0.6s ease-in-out',
                                                            boxShadow: '0 2px 8px rgba(212, 165, 116, 0.3)',
                                                            position: 'relative',
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                position: 'absolute',
                                                                top: '0',
                                                                left: '0',
                                                                right: '0',
                                                                bottom: '0',
                                                                background: 'linear-gradient(90deg, transparent 0%, rgba(255,248,240,0.4) 50%, transparent 100%)',
                                                                animation: 'shimmer 2s infinite',
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </Fragment>
                                        )}
                                    </Link>
                                    <Link to="/user/notes" className='block p-3 border bg-cyan-100 rounded-sm hover:shadow-md'>
                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            <LucideFileText size={32} />
                                        </div>
                                        <div>Notes</div>
                                    </Link>
                                    <Link to="/user/life-events" className='block p-3 border bg-cyan-100 rounded-sm hover:shadow-md'>
                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            <LucideCalendar1 size={32} />
                                        </div>
                                        <div>Life Events</div>
                                    </Link>
                                    <Link to="/user/info-vault" className='block p-3 border bg-cyan-100 rounded-sm hover:shadow-md'>
                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            <LucideInfo size={32} />
                                        </div>
                                        <div>Info Vault</div>
                                    </Link>
                                    <Link to="/user/maps" className='block p-3 border bg-cyan-100 rounded-sm hover:shadow-md'>
                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            <LucideMap size={32} />
                                        </div>
                                        <div>Maps</div>
                                    </Link>
                                    <Link to="/user/calender" className='block p-3 border bg-cyan-100 rounded-sm hover:shadow-md'>
                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            <LucideCalendar1 size={32} />
                                        </div>
                                        <div>Calendar</div>
                                    </Link>
                                    <Link to="/user/task-schedule" className='block p-3 border bg-cyan-100 rounded-sm hover:shadow-md'>
                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            <LucideClock size={32} />
                                        </div>
                                        <div>Schedule</div>
                                    </Link>
                                    <Link to="/user/setting" className='block p-3 border bg-cyan-100 rounded-sm hover:shadow-md'>
                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            <LucideSettings size={32} />
                                        </div>
                                        <div>Settings</div>
                                    </Link>
                                    <Link to="/logout" className='block p-3 border bg-red-400 rounded-sm hover:shadow-md'>
                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            <LucideLogOut size={32} />
                                        </div>
                                        <div>Logout</div>
                                    </Link>
                                </>
                            )}

                            {authState.isLoggedIn === 'false' && (
                                <>
                                    <Link to="/login" className='block p-3 border bg-cyan-100 rounded-sm hover:shadow-md'>
                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            <LucideLogIn size={32} />
                                        </div>
                                        <div>Login</div>
                                    </Link>
                                    <Link to="/register" className='block p-3 border bg-cyan-100 rounded-sm hover:shadow-md'>
                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            <LucideUserPlus size={32} />
                                        </div>
                                        <div>Register</div>
                                    </Link>
                                </>
                            )}
                            <Link to="/about" className='block p-3 border bg-cyan-100 rounded-sm hover:shadow-md'>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <LucideInfo size={32} />
                                </div>
                                <div>About</div>
                            </Link>
                            <a
                                href="https://ai-notes.xyz/docs/selfhost/selfhost-docker-build"
                                className='block p-3 border bg-cyan-100 rounded-sm hover:shadow-md'
                            >
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    {/* <LucideGitBranch size={32} /> */}
                                    <img
                                        src={iconGit}
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            objectFit: 'contain',
                                        }}
                                    />
                                </div>
                                <div>Git</div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default UserHomepage;