import { Link } from 'react-router-dom';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import stateJotaiNavigationDrawer from '../jotai/stateJotaiNavigationDrawer';
import stateJotaiAuthAtom from '../jotai/stateJotaiAuth';
import { Fragment } from 'react/jsx-runtime';
import { useEffect, useState } from 'react';
import { LucideSearch, LucideSpeech } from 'lucide-react';
import { jotaiTtsModalOpenStatus } from '../jotai/stateJotaiTextToSpeechModal';

const Header = () => {
    const [stateNavigationDrawer, setStateNavigationDrawer] = useAtom(stateJotaiNavigationDrawer);
    const authState = useAtomValue(stateJotaiAuthAtom);
    const setTtsModalOpenStatus = useSetAtom(jotaiTtsModalOpenStatus);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY >= 30);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const navPill =
        'rounded-md px-2 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900';

    return (
        <header
            className={`fixed w-full border-b transition-colors duration-200 ${
                isScrolled
                    ? 'border-zinc-200/90 bg-white/95 shadow-sm backdrop-blur-sm'
                    : 'border-zinc-200/70 bg-white/90 backdrop-blur-sm'
            }`}
            style={{ height: '60px', top: 0, zIndex: 100 }}
        >
            <div className="container mx-auto flex h-full items-center justify-between px-2 sm:px-3">
                <Link
                    to="/"
                    className="text-sm font-bold tracking-tight text-zinc-900 transition hover:text-teal-700 sm:text-base"
                >
                    AI Notes <span className="font-semibold text-teal-600">XYZ</span>
                </Link>
                <nav className="hidden items-center gap-0.5 lg:flex">
                    <Link to="/" className={navPill}>
                        Home
                    </Link>
                    {authState.isLoggedIn === 'true' && (
                        <Fragment>
                            <Link
                                to="/user/search"
                                className="rounded-md p-1.5 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
                                title="Search"
                            >
                                <LucideSearch className="h-4 w-4" strokeWidth={2} />
                            </Link>
                            <Link to="/user/suggestions" className={navPill}>
                                Suggestions
                            </Link>
                            <Link to="/user/chat" className={navPill}>
                                Chat
                            </Link>
                            <Link to="/user/task" className={navPill}>
                                Task
                            </Link>
                            <Link to="/user/notes" className={navPill}>
                                Notes
                            </Link>
                            <Link to="/user/memo" className={navPill}>
                                Memo
                            </Link>
                            <Link to="/user/life-events" className={navPill}>
                                Life Events
                            </Link>
                            <Link to="/user/info-vault" className={navPill}>
                                Info Vault
                            </Link>
                            <Link to="/user/maps" className={navPill}>
                                Maps
                            </Link>
                            <Link to="/user/calender" className={navPill}>
                                Calendar
                            </Link>
                            <Link to="/user/task-schedule" className={navPill}>
                                Schedule
                            </Link>
                            <Link to="/user/setting" className={navPill}>
                                Settings
                            </Link>
                            <button
                                type="button"
                                className="rounded-md p-1.5 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
                                title="Text to speech"
                                onClick={() => {
                                    setTtsModalOpenStatus((prev) => ({
                                        ...prev,
                                        openStatus: true,
                                    }));
                                }}
                            >
                                <LucideSpeech className="h-4 w-4" strokeWidth={2} />
                            </button>
                        </Fragment>
                    )}
                    <Link to="/about" className={navPill}>
                        About
                    </Link>
                    {authState.isLoggedIn === 'true' ? (
                        <Link
                            to="/logout"
                            className="rounded-md px-2 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                        >
                            Logout
                        </Link>
                    ) : (
                        <Link
                            to="/login"
                            className="rounded-md bg-teal-600 px-2 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-700"
                        >
                            Login
                        </Link>
                    )}
                </nav>
                <div className="flex items-center gap-0.5 lg:hidden">
                    <Link
                        to="/user/search"
                        className="rounded-md p-1.5 text-zinc-600 transition hover:bg-zinc-100"
                    >
                        <LucideSearch className="h-[18px] w-[18px]" strokeWidth={2} />
                    </Link>
                    <button
                        type="button"
                        className="rounded-md p-1.5 text-zinc-600 transition hover:bg-zinc-100"
                        onClick={() =>
                            setTtsModalOpenStatus((prev) => ({
                                ...prev,
                                openStatus: true,
                            }))
                        }
                    >
                        <LucideSpeech className="h-[18px] w-[18px]" strokeWidth={2} />
                    </button>
                    <button
                        type="button"
                        className="rounded-md p-1.5 text-zinc-800 transition hover:bg-zinc-100"
                        onClick={() => setStateNavigationDrawer(!stateNavigationDrawer)}
                        aria-label="Open menu"
                    >
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16m-7 6h7"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
