import { useAtom, useAtomValue } from 'jotai';
import { Link } from 'react-router-dom';
import stateJotaiNavigationDrawer from '../jotai/stateJotaiNavigationDrawer';
import stateJotaiAuth from '../jotai/stateJotaiAuth';
import { Fragment } from 'react/jsx-runtime';
import { LucideX } from 'lucide-react';

const navLinkClass =
    'block rounded-md px-2 py-1.5 text-xs font-medium text-zinc-800 transition hover:bg-zinc-100 hover:text-teal-700';

const NavigationDrawer = () => {
    const [stateNavigationDrawer, setStateNavigationDrawer] = useAtom(stateJotaiNavigationDrawer);
    const authState = useAtomValue(stateJotaiAuth);

    const handleLinkClick = () => {
        setStateNavigationDrawer(false);
    };

    return (
        <div
            className={`fixed left-0 top-0 h-full w-[min(280px,92vw)] border-r border-zinc-200 bg-white shadow-lg transition-transform duration-300 ease-out ${
                stateNavigationDrawer ? 'translate-x-0' : '-translate-x-full'
            }`}
            style={{ paddingTop: '60px', zIndex: 1000 }}
        >
            <button
                type="button"
                onClick={() => setStateNavigationDrawer(false)}
                className="absolute right-2 top-[68px] rounded-md p-1 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
                aria-label="Close menu"
            >
                <LucideX className="h-4 w-4" strokeWidth={2} />
            </button>
            <nav>
                <div
                    style={{
                        maxHeight: 'calc(100vh - 60px)',
                        overflowY: 'auto',
                    }}
                    className="px-2 pb-4 pt-1"
                >
                    <ul className="space-y-0.5">
                        <li>
                            <Link to="/" className={navLinkClass} onClick={handleLinkClick}>
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link to="/about" className={navLinkClass} onClick={handleLinkClick}>
                                About
                            </Link>
                        </li>
                        {authState.isLoggedIn === 'true' && (
                            <Fragment>
                                <li>
                                    <Link to="/user/chat" className={navLinkClass} onClick={handleLinkClick}>
                                        Chat
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/user/search" className={navLinkClass} onClick={handleLinkClick}>
                                        Search
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/user/suggestions"
                                        className={navLinkClass}
                                        onClick={handleLinkClick}
                                    >
                                        Suggestions
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/user/notes" className={navLinkClass} onClick={handleLinkClick}>
                                        Notes
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/user/life-events"
                                        className={navLinkClass}
                                        onClick={handleLinkClick}
                                    >
                                        Life events
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/user/task" className={navLinkClass} onClick={handleLinkClick}>
                                        Tasks
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/user/maps" className={navLinkClass} onClick={handleLinkClick}>
                                        Maps
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/user/calender" className={navLinkClass} onClick={handleLinkClick}>
                                        Calendar
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/user/task-schedule"
                                        className={navLinkClass}
                                        onClick={handleLinkClick}
                                    >
                                        Schedule
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/user/timeline" className={navLinkClass} onClick={handleLinkClick}>
                                        Timeline
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/user/info-vault" className={navLinkClass} onClick={handleLinkClick}>
                                        Info vault
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/user/drive" className={navLinkClass} onClick={handleLinkClick}>
                                        Drive
                                    </Link>
                                </li>
                            </Fragment>
                        )}
                        {authState.isLoggedIn === 'true' && (
                            <li>
                                <Link to="/user/setting" className={navLinkClass} onClick={handleLinkClick}>
                                    Settings
                                </Link>
                            </li>
                        )}
                        {(authState.isLoggedIn === 'false' || authState.isLoggedIn === 'pending') && (
                            <li>
                                <Link to="/login" className={navLinkClass} onClick={handleLinkClick}>
                                    Login
                                </Link>
                            </li>
                        )}
                        {authState.isLoggedIn === 'true' && (
                            <li>
                                <Link
                                    to="/logout"
                                    className={`${navLinkClass} font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700`}
                                    onClick={handleLinkClick}
                                >
                                    Logout
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>
            </nav>
        </div>
    );
};

export default NavigationDrawer;
