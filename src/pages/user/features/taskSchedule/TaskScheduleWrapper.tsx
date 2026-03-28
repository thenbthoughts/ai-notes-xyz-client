import { useState } from 'react';
import {
    LucideList,
    LucideMoveDown,
    LucideMoveUp,
    LucideRefreshCcw,
    LucideSettings,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAtom, useSetAtom } from 'jotai';
import { Link } from 'react-router-dom';

import {
    ComponentNotesLeftModelRender,
    ComponentNotesLeftRender,
} from './sectionLeft/ComponentNotesLeft.tsx';
import useResponsiveScreen, { screenList } from '../../../../hooks/useResponsiveScreen.tsx';

import ComponentRightWrapper from './sectionRight/ComponentRightWrapper.tsx';

import {
    jotaiNotesModalOpenStatus,
    jotaiTaskScheduleListRefresh,
} from './stateJotai/taskScheduleStateJotai.ts';

const railBtn =
    'flex w-full items-center justify-center rounded-none border-0 py-1.5 text-zinc-200 transition-colors';

const TaskScheduleWrapper = () => {
    const screenWidth = useResponsiveScreen();

    const [stateDisplayChatHistory, setStateDisplayChatHistory] = useAtom(jotaiNotesModalOpenStatus);

    const setTaskScheduleListRefresh = useSetAtom(jotaiTaskScheduleListRefresh);

    const [refreshRandomNum, setRefreshRandomNum] = useState(0);

    return (
        <div className="flex w-full bg-[#f4f4f5]">
            <div className="min-w-0 w-[calc(100vw-50px)]">
                <div className="mx-auto w-full max-w-none px-0">
                    <div className="flex flex-row">
                        {screenWidth === screenList.lg && (
                            <div className="w-[25%] min-w-0 shrink-0">
                                <ComponentNotesLeftRender />
                            </div>
                        )}
                        <div
                            className={
                                screenWidth === screenList.lg ? 'w-[75%] min-w-0' : 'w-full min-w-0'
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
                    title="Refresh list"
                    onClick={() => {
                        toast.success('Refreshing…');
                        setTaskScheduleListRefresh((n: number) => n + 1);
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

            {screenWidth === screenList.sm && stateDisplayChatHistory && <ComponentNotesLeftModelRender />}
        </div>
    );
};

export default TaskScheduleWrapper;
