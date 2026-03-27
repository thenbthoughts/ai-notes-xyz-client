import { useState } from 'react';
import {
    LucideList,
    LucideMoveDown,
    LucideMoveUp,
    LucidePlus,
    LucideRefreshCcw,
    LucideSettings,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

import {
    ComponentChatHistoryModelRender,
    ComponentChatHistoryRender,
} from './sectionLeft/ComponentChatHistory.tsx';
import useResponsiveScreen, { screenList } from '../../../../hooks/useResponsiveScreen.tsx';
import ComponentRightWrapper from './sectionRight/ComponentRightWrapper.tsx';
import { lifeEventAddAxios } from './utils/lifeEventsListAxios.ts';

const railBtn =
    'flex w-full items-center justify-center rounded-none border-0 py-1.5 text-zinc-200 transition-colors';

const LifeEventWrapper = () => {
    const screenWidth = useResponsiveScreen();
    const navigate = useNavigate();

    const [stateDisplayChatHistory, setStateDisplayChatHistory] = useState(false);
    const [refreshRandomNum, setRefreshRandomNum] = useState(0);

    const lifeEventAddAxiosLocal = async () => {
        try {
            const result = await lifeEventAddAxios();
            if (result.success !== '') {
                navigate(`/user/life-events?action=edit&id=${result.recordId}`);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="flex w-full bg-[#f4f4f5]">
            <div className="min-w-0 w-[calc(100vw-50px)]">
                <div className="mx-auto w-full max-w-none px-0">
                    <div className="flex flex-row">
                        {screenWidth === screenList.lg && (
                            <div className="w-[240px] min-w-[220px] max-w-[28%] shrink-0">
                                <ComponentChatHistoryRender />
                            </div>
                        )}
                        <div
                            className={
                                screenWidth === screenList.lg ? 'min-w-0 flex-1' : 'w-full min-w-0'
                            }
                        >
                            <div className="mx-auto w-full max-w-none">
                                <div className="h-[calc(100vh-60px)]">
                                    <ComponentRightWrapper refreshRandomNumParent={refreshRandomNum} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex w-[50px] shrink-0 flex-col items-stretch border-l border-zinc-800 bg-zinc-900 py-1">
                <Link
                    to="/user/setting"
                    className={`${railBtn} bg-zinc-800 hover:bg-zinc-700 hover:text-white`}
                    title="Settings"
                >
                    <LucideSettings className="h-4 w-4" strokeWidth={1.75} />
                </Link>

                <button
                    type="button"
                    className={`${railBtn} bg-zinc-800 hover:bg-zinc-700 hover:text-white`}
                    title="Add life event"
                    onClick={() => void lifeEventAddAxiosLocal()}
                >
                    <LucidePlus className="h-4 w-4" strokeWidth={1.75} />
                </button>

                <button
                    type="button"
                    className={`${railBtn} bg-zinc-800 hover:bg-zinc-700 hover:text-white`}
                    title="Scroll up"
                    onClick={() => {
                        document.getElementById('messagesScrollUp')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                >
                    <LucideMoveUp className="h-4 w-4" strokeWidth={1.75} />
                </button>

                <button
                    type="button"
                    className={`${railBtn} bg-zinc-800 hover:bg-zinc-700 hover:text-white`}
                    title="Scroll down"
                    onClick={() => {
                        document.getElementById('messagesScrollDown')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                >
                    <LucideMoveDown className="h-4 w-4" strokeWidth={1.75} />
                </button>

                <button
                    type="button"
                    className={`${railBtn} bg-zinc-800 hover:bg-zinc-700 hover:text-white`}
                    title="Refresh"
                    onClick={() => {
                        toast.success('Refreshing…');
                        setRefreshRandomNum(Math.floor(Math.random() * 1_000_000));
                    }}
                >
                    <LucideRefreshCcw className="h-4 w-4" strokeWidth={1.75} />
                </button>

                {screenWidth === screenList.sm && (
                    <button
                        type="button"
                        className={`${railBtn} ${
                            stateDisplayChatHistory
                                ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                                : 'bg-zinc-800 hover:bg-zinc-700'
                        }`}
                        title="Filters"
                        onClick={() => setStateDisplayChatHistory(!stateDisplayChatHistory)}
                    >
                        <LucideList className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                )}
            </div>

            {screenWidth === screenList.sm && stateDisplayChatHistory && <ComponentChatHistoryModelRender />}
        </div>
    );
};

export default LifeEventWrapper;
