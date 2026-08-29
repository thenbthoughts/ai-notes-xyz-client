import { LucideArrowUp, LucideBrain, LucideMoveDown, LucideMoveUp, LucideRefreshCcw, LucideSettings } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';

import AiSuggestionsDiary from './components/AiSuggestionSummary';
import AiSuggestionTasks from './components/AiSuggestionTasks';
import AiSuggestionSummaryCombined from './components/AiSuggestionSummaryCombined';
import { suggestionsRefreshAtom } from './suggestionsRefreshAtom';

const railBtn = 'flex w-full items-center justify-center rounded-none border-0 py-1.5 text-zinc-200 transition-colors';

const AiSuggestions = () => {
    const [, setRefreshTick] = useAtom(suggestionsRefreshAtom);
    const [bannerVisible, setBannerVisible] = useState(false);
    const [bannerText, setBannerText] = useState('');
    const [showBackTop, setShowBackTop] = useState(false);

    const triggerRefresh = () => {
        setRefreshTick((prev) => {
            return prev + 1;
        });
        setBannerText('Suggestions refresh requested');
        setBannerVisible(true);
        toast.success('Refreshing suggestions…');
    };

    const handleScrollUp = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleScrollDown = () => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    };

    const handleBackToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        if (!bannerVisible) {
            return;
        }
        const timer = window.setTimeout(() => {
            setBannerVisible(false);
        }, 2500);
        return () => {
            window.clearTimeout(timer);
        };
    }, [bannerVisible, bannerText]);

    useEffect(() => {
        const onScroll = () => {
            if (window.scrollY > 320) {
                setShowBackTop(true);
            } else {
                setShowBackTop(false);
            }
        };
        window.addEventListener('scroll', onScroll);
        onScroll();
        return () => {
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            const active = document.activeElement as HTMLElement | null;
            if (active) {
                const tag = active.tagName.toLowerCase();
                if (tag === 'input' || tag === 'textarea' || tag === 'select') {
                    return;
                }
                if (active.isContentEditable) {
                    return;
                }
            }
            if (event.key.toLowerCase() === 'r' && !event.ctrlKey && !event.metaKey && !event.altKey) {
                event.preventDefault();
                triggerRefresh();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
        };
    }, []);

    return (
        <div className="flex w-full bg-zinc-950">
            <Helmet>
                <title>Suggestions | AI Notes XYZ</title>
            </Helmet>
            <div className="min-w-0 w-[calc(100vw-50px)]">
                <div className="min-h-[calc(100vh-60px)] px-2 py-2 md:px-3">
                    <div id="messagesScrollUp" />
                    <div className="mb-3 rounded-sm border border-zinc-700 bg-zinc-900 px-3 py-2 shadow-sm">
                        <div className="flex items-start gap-2">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-zinc-700 bg-zinc-950">
                                <LucideBrain className="h-4 w-4 text-indigo-600" strokeWidth={2} />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-sm font-semibold tracking-tight text-zinc-100 md:text-base">AI suggestions</h1>
                                <p className="text-[11px] text-zinc-500 md:text-xs">Summaries, diaries, and task ideas from your activity</p>
                            </div>
                        </div>
                    </div>
                    {bannerVisible && (
                        <div className="mb-2 rounded-sm border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 shadow-sm" role="status" aria-live="polite">
                            {bannerText}
                        </div>
                    )}
                    <AiSuggestionSummaryCombined />
                    <AiSuggestionsDiary />
                    <AiSuggestionTasks />
                    <div id="messagesScrollDown" />
                </div>
            </div>
            <div className="flex w-[50px] shrink-0 flex-col items-stretch border-l border-zinc-800 bg-zinc-900 py-1">
                <Link to="/user/setting" className={`${railBtn} bg-zinc-800 hover:bg-zinc-700 hover:text-white`} title="Settings" aria-label="Open settings">
                    <LucideSettings className="h-4 w-4" strokeWidth={1.75} />
                </Link>
                <button
                    type="button"
                    className={`${railBtn} bg-zinc-800 hover:bg-zinc-700 hover:text-white`}
                    title="Scroll up"
                    aria-label="Scroll to top"
                    onClick={() => {
                        handleScrollUp();
                    }}
                >
                    <LucideMoveUp className="h-4 w-4" strokeWidth={1.75} />
                </button>
                <button
                    type="button"
                    className={`${railBtn} bg-zinc-800 hover:bg-zinc-700 hover:text-white`}
                    title="Scroll down"
                    aria-label="Scroll to bottom"
                    onClick={() => {
                        handleScrollDown();
                    }}
                >
                    <LucideMoveDown className="h-4 w-4" strokeWidth={1.75} />
                </button>
                <button
                    type="button"
                    className={`${railBtn} bg-zinc-800 hover:bg-zinc-700 hover:text-white`}
                    title="Refresh suggestions"
                    aria-label="Refresh suggestions"
                    onClick={() => {
                        triggerRefresh();
                    }}
                >
                    <LucideRefreshCcw className="h-4 w-4" strokeWidth={1.75} />
                </button>
            </div>
            {showBackTop && (
                <button
                    type="button"
                    onClick={() => {
                        handleBackToTop();
                    }}
                    className="fixed bottom-4 right-[60px] z-20 rounded-full border border-zinc-700 bg-zinc-900 p-2 text-zinc-200 shadow-lg hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    aria-label="Back to top"
                    title="Back to top"
                >
                    <LucideArrowUp className="h-4 w-4" strokeWidth={2} />
                </button>
            )}
        </div>
    );
};

export default AiSuggestions;
