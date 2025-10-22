import { Link } from 'react-router-dom';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import stateJotaiNavigationDrawer from '../jotai/stateJotaiNavigationDrawer';
import stateJotaiAuthAtom from '../jotai/stateJotaiAuth';
import { Fragment } from 'react/jsx-runtime';
import { useEffect, useState } from 'react';
import { LucideSpeech } from 'lucide-react';
import { jotaiTtsModalOpenStatus } from '../jotai/stateJotaiTextToSpeechModal';

const Header = () => {

    const [stateNavigationDrawer, setStateNavigationDrawer] = useAtom(stateJotaiNavigationDrawer);
    const authState = useAtomValue(stateJotaiAuthAtom);
    const setTtsModalOpenStatus = useSetAtom(jotaiTtsModalOpenStatus);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY >= 30) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <header
            className={`${isScrolled ? 'bg-blue-600 transition-colors duration-1000' : ''} text-white p-4 fixed w-full`}
            style={{ height: '60px', top: 0, zIndex: 100 }}
        >
            <div className="container mx-auto flex justify-between items-center h-full">
                <Link to="/" className="text-2xl font-bold hover:underline">AI NOTES XYZ</Link>
                <nav className="hidden lg:flex space-x-4">
                    <Link to="/" className="hover:underline">Home</Link>
                    {authState.isLoggedIn === 'true' && (
                        <Fragment>
                            <Link
                                to="/user/suggestions" className="hover:underline"
                            >Suggestions</Link>
                            <Link
                                to="/user/chat" className="hover:underline"
                            >Chat</Link>
                            <Link
                                to="/user/task" className="hover:underline"
                            >Task</Link>
                            <Link
                                to="/user/notes" className="hover:underline"
                            >Notes</Link>
                            <Link
                                to="/user/life-events" className="hover:underline"
                            >Life Events</Link>
                            <Link
                                to="/user/info-vault" className="hover:underline"
                            >Info Vault</Link>
                            <Link
                                to="/user/maps" className="hover:underline"
                            >Maps</Link>
                            <Link
                                to="/user/calender" className="hover:underline"
                            >Calendar</Link>
                            <Link
                                to="/user/task-schedule" className="hover:underline"
                            >Schedule</Link>
                            <Link
                                to="/user/setting" className="hover:underline"
                            >Settings</Link>
                            <div
                                className='hover:underline cursor-pointer'
                                onClick={() => {
                                    setTtsModalOpenStatus((prev) => {
                                        return {
                                            ...prev,
                                            openStatus: true,
                                        }
                                    });
                                }}
                            >
                                <LucideSpeech />
                            </div>
                        </Fragment>
                    )}
                    <Link to="/about" className="hover:underline">About</Link>
                    {authState.isLoggedIn === 'true' ? (
                        <Link to="/logout" className="hover:underline">Logout</Link>
                    ) : (
                        <Link to="/login" className="hover:underline">Login</Link>
                    )}
                </nav>
                <div className="lg:hidden">
                    <div className='hover:underline cursor-pointer inline-block mr-4' onClick={() => {
                        setTtsModalOpenStatus((prev) => {
                            return {
                                ...prev,
                                openStatus: true,
                            }
                        });
                    }}>
                        <LucideSpeech />
                    </div>
                    <button className="focus:outline-none" onClick={() => setStateNavigationDrawer(!stateNavigationDrawer)}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header;