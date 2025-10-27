import { useAtom, useAtomValue } from 'jotai';
import { Link } from 'react-router-dom';
import stateJotaiNavigationDrawer from '../jotai/stateJotaiNavigationDrawer';
import stateJotaiAuth from '../jotai/stateJotaiAuth';
import { Fragment } from 'react/jsx-runtime';

const NavigationDrawer = () => {
    const [stateNavigationDrawer, setStateNavigationDrawer] = useAtom(stateJotaiNavigationDrawer);
    const authState = useAtomValue(stateJotaiAuth);

    const handleLinkClick = () => {
        setStateNavigationDrawer(false);
    };

    return (
        <div
            className={
                `fixed top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-2xl 
                transition-transform transform ${stateNavigationDrawer ? 'translate-x-0' : '-translate-x-full'}`
            }
            style={{ width: '300px', paddingTop: '60px', zIndex: 1000 }}
        >
            <button
                onClick={() => setStateNavigationDrawer(false)}
                className="absolute top-4 right-4 text-white hover:text-yellow-300"
            >
                ✖
            </button>
            <nav>
                <div
                    style={{
                        maxHeight: 'calc(100vh - 60px)',
                        overflowY: 'auto',
                    }}
                >
                    <ul className="space-y-2">
                        <li className="hover:bg-purple-700 rounded-lg mx-2 my-2">
                            <Link to="/" className="text-white block p-2" onClick={handleLinkClick}>🏠 Home</Link>
                        </li>
                        <li className="hover:bg-purple-700 rounded-lg mx-2 my-2">
                            <Link to="/about" className="text-white block p-2" onClick={handleLinkClick}>ℹ️ About</Link>
                        </li>
                        {authState.isLoggedIn === 'true' && (
                            <Fragment>
                                <li className="hover:bg-purple-700 rounded-lg mx-2 my-2">
                                    <Link to="/user/chat" className="text-white block p-2" onClick={handleLinkClick}>📝 Chat</Link>
                                </li>
                                <li className="hover:bg-purple-700 rounded-lg mx-2 my-2">
                                    <Link to="/user/search" className="text-white block p-2" onClick={handleLinkClick}>📝 Search</Link>
                                </li>
                                <li className="hover:bg-purple-700 rounded-lg mx-2 my-2">
                                    <Link to="/user/suggestions" className="text-white block p-2" onClick={handleLinkClick}>📝 Suggestions</Link>
                                </li>
                                <li className="hover:bg-purple-700 rounded-lg mx-2 my-2">
                                    <Link to="/user/notes" className="text-white block p-2" onClick={handleLinkClick}>📝 Notes</Link>
                                </li>
                                <li className="hover:bg-purple-700 rounded-lg mx-2 my-2">
                                    <Link to="/user/life-events" className="text-white block p-2" onClick={handleLinkClick}>📝 Life Events</Link>
                                </li>
                                <li className="hover:bg-purple-700 rounded-lg mx-2 my-2">
                                    <Link to="/user/task" className="text-white block p-2" onClick={handleLinkClick}>📝 Task</Link>
                                </li>
                                <li className="hover:bg-purple-700 rounded-lg mx-2 my-2">
                                    <Link to="/user/maps" className="text-white block p-2" onClick={handleLinkClick}>📝 Maps</Link>
                                </li>
                                <li className="hover:bg-purple-700 rounded-lg mx-2 my-2">
                                    <Link to="/user/calender" className="text-white block p-2" onClick={handleLinkClick}>📝 Calendar</Link>
                                </li>
                                <li className="hover:bg-purple-700 rounded-lg mx-2 my-2">
                                    <Link to="/user/task-schedule" className="text-white block p-2" onClick={handleLinkClick}>📝 Schedule</Link>
                                </li>
                                <li className="hover:bg-purple-700 rounded-lg mx-2 my-2">
                                    <Link to="/user/info-vault" className="text-white block p-2" onClick={handleLinkClick}>📝 Info Vault</Link>
                                </li>
                            </Fragment>
                        )}
                        {authState.isLoggedIn === 'true' && (
                            <li className="hover:bg-purple-700 rounded-lg mx-2 my-2">
                                <Link to="/user/setting" className="text-white block p-2" onClick={handleLinkClick}>⚙️ Settings</Link>
                            </li>
                        )}
                        {(authState.isLoggedIn === 'false' || authState.isLoggedIn === 'pending') && (
                            <li className="hover:bg-purple-700 rounded-lg mx-2 my-2">
                                <Link to="/login" className="text-white block p-2" onClick={handleLinkClick}>🔑 Login</Link>
                            </li>
                        )}
                        {(authState.isLoggedIn === 'true') && (
                            <li className="hover:bg-purple-700 rounded-lg mx-2 my-2">
                                <Link to="/logout" className="text-white block p-2" onClick={handleLinkClick}>🚪 Logout</Link>
                            </li>
                        )}
                    </ul>
                </div>
            </nav>
        </div>
    );
}

export default NavigationDrawer;