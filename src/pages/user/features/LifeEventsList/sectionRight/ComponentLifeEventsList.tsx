import { useState, useEffect, useCallback } from 'react';
import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
import { useAtomValue } from 'jotai';

import axiosCustom from '../../../../../config/axiosCustom.ts';
import { tsLifeEventsItem } from '../../../../../types/pages/tsLifeEvents.ts';
import ComponentLifeEventItem, { type LifeEventItemLayout } from './ComponentLifeEventItem.tsx';

import {
    jotaiStateLifeEventSearch,
    jotaiStateLifeEventCategory,
    jotaiStateLifeEventCategorySub,
    jotaiStateLifeEventIsStar,
    jotaiStateLifeEventImpact,
    jotaiStateLifeEventDateRange,
    jotaiStateLifeEventAiCategory,
    jotaiStateLifeEventAiCategorySub,
    jotaiStateLifeEventHideDailyDiary,
} from '../stateJotai/lifeEventStateJotai.ts';
import ReactPaginate from 'react-paginate';
import { LucideLayoutGrid, LucideList, LucidePlus } from 'lucide-react';
import { lifeEventAddAxios } from '../utils/lifeEventsListAxios.ts';
import { useNavigate } from 'react-router-dom';

const perPage = 10;

const VIEW_STORAGE_KEY = 'lifeEventsViewMode';

function readSavedView(): 'grid' | 'list' {
    try {
        const v = sessionStorage.getItem(VIEW_STORAGE_KEY);
        if (v === 'grid' || v === 'list') return v;
    } catch {
        /* ignore */
    }
    return 'grid';
}

const ComponentLifeEventsList = () => {
    const navigate = useNavigate();
    const [totalCount, setTotalCount] = useState(0 as number);
    const [list, setList] = useState([] as tsLifeEventsItem[]);
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(readSavedView);

    const setViewModePersist = useCallback((mode: 'grid' | 'list') => {
        setViewMode(mode);
        try {
            sessionStorage.setItem(VIEW_STORAGE_KEY, mode);
        } catch {
            /* ignore */
        }
    }, []);

    const searchTerm = useAtomValue(jotaiStateLifeEventSearch);
    const categoryId = useAtomValue(jotaiStateLifeEventCategory);
    const categorySubId = useAtomValue(jotaiStateLifeEventCategorySub);
    const aiCategory = useAtomValue(jotaiStateLifeEventAiCategory);
    const aiSubCategory = useAtomValue(jotaiStateLifeEventAiCategorySub);
    const isStar = useAtomValue(jotaiStateLifeEventIsStar);
    const eventImpact = useAtomValue(jotaiStateLifeEventImpact);
    const dateRange = useAtomValue(jotaiStateLifeEventDateRange);
    const hideDailyDiary = useAtomValue(jotaiStateLifeEventHideDailyDiary);

    const [refreshRandomNum, setRefreshRandomNum] = useState(0);

    useEffect(() => {
        const axiosCancelTokenSource: CancelTokenSource = axios.CancelToken.source();
        void fetchList({ axiosCancelTokenSource });
        return () => {
            axiosCancelTokenSource.cancel('Operation canceled by the user.');
        };
    }, [refreshRandomNum, page]);

    useEffect(() => {
        setPage(1);
        setRefreshRandomNum(Math.random());
    }, [
        searchTerm,
        categoryId,
        categorySubId,
        aiCategory,
        aiSubCategory,
        isStar,
        eventImpact,
        dateRange,
        hideDailyDiary,
    ]);

    const fetchList = async ({
        axiosCancelTokenSource,
    }: {
        axiosCancelTokenSource: CancelTokenSource;
    }) => {
        try {
            let startDate = '';
            if (dateRange.startDate instanceof Date) {
                startDate = `${dateRange.startDate.toISOString().split('T')[0]}T00:00:00.000Z`;
            }
            let endDate = '';
            if (dateRange.endDate instanceof Date) {
                endDate = `${dateRange.endDate.toISOString().split('T')[0]}T23:59:59.999Z`;
            }

            const config = {
                method: 'post',
                url: `/api/life-events/crud/lifeEventsGet`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    page: page,
                    perPage: perPage,
                    search: searchTerm,
                    categoryId: categoryId,
                    categorySubId: categorySubId,
                    isStar: isStar,
                    eventImpact: eventImpact,
                    hideDailyDiary: hideDailyDiary,

                    startDate,
                    endDate,

                    aiCategory,
                    aiSubCategory: aiSubCategory,
                },
                cancelToken: axiosCancelTokenSource.token,
            } as AxiosRequestConfig;

            const response = await axiosCustom.request(config);
            let tempArr = [];
            if (Array.isArray(response.data.docs)) {
                tempArr = response.data.docs;
            }
            setList(tempArr);

            let tempTotalCount = 0;
            if (typeof response.data.count === 'number') {
                tempTotalCount = response.data.count;
            }
            setTotalCount(tempTotalCount);
        } catch (error) {
            console.error(error);
        }
    };

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

    const goToTop = () => {
        document.getElementById('messagesScrollUp')?.scrollIntoView({ behavior: 'smooth' });
    };

    const toggleBtn =
        'inline-flex h-8 items-center justify-center rounded-lg border px-2 text-zinc-600 transition-colors sm:h-7';

    return (
        <div>
            <div id="messagesScrollUp" />

            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200/80 bg-white px-2 py-1.5 shadow-sm sm:mb-2.5 sm:px-2.5 sm:py-2">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => void lifeEventAddAxiosLocal()}
                        className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg border border-indigo-600/20 bg-indigo-600 px-2.5 text-[11px] font-medium text-white shadow-sm hover:bg-indigo-500 sm:h-7"
                    >
                        <LucidePlus className="h-3.5 w-3.5" strokeWidth={2} />
                        Add
                    </button>
                    <span className="text-[11px] text-zinc-600">
                        <span className="font-semibold tabular-nums text-zinc-900">{totalCount}</span> events
                    </span>
                    {totalCount === 0 && (
                        <span className="text-[11px] font-medium text-zinc-500">No results</span>
                    )}
                </div>

                <div
                    className="flex shrink-0 rounded-lg border border-zinc-200/80 bg-zinc-50/90 p-0.5"
                    role="group"
                    aria-label="Layout"
                >
                    <button
                        type="button"
                        title="Grid"
                        aria-pressed={viewMode === 'grid'}
                        onClick={() => setViewModePersist('grid')}
                        className={`${toggleBtn} ${
                            viewMode === 'grid'
                                ? 'border-indigo-200 bg-white text-indigo-700 shadow-sm'
                                : 'border-transparent bg-transparent hover:bg-white/80 hover:text-zinc-900'
                        }`}
                    >
                        <LucideLayoutGrid className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                    <button
                        type="button"
                        title="List"
                        aria-pressed={viewMode === 'list'}
                        onClick={() => setViewModePersist('list')}
                        className={`${toggleBtn} ${
                            viewMode === 'list'
                                ? 'border-indigo-200 bg-white text-indigo-700 shadow-sm'
                                : 'border-transparent bg-transparent hover:bg-white/80 hover:text-zinc-900'
                        }`}
                    >
                        <LucideList className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                </div>
            </div>

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5 xl:grid-cols-3 2xl:grid-cols-4">
                    {list.map((lifeEventObj) => (
                        <ComponentLifeEventItem
                            key={lifeEventObj._id}
                            lifeEventObj={lifeEventObj}
                            layout={'grid' satisfies LifeEventItemLayout}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col gap-2 sm:gap-1.5">
                    {list.map((lifeEventObj) => (
                        <ComponentLifeEventItem
                            key={lifeEventObj._id}
                            lifeEventObj={lifeEventObj}
                            layout={'list' satisfies LifeEventItemLayout}
                        />
                    ))}
                </div>
            )}

            {totalCount >= 1 && (
                <div className="mt-3 flex w-full items-center justify-center px-1 pb-2 sm:mt-4">
                    <ReactPaginate
                        breakLabel="…"
                        nextLabel="›"
                        onPageChange={(e) => {
                            setPage(e.selected + 1);
                            goToTop();
                        }}
                        marginPagesDisplayed={1}
                        pageRangeDisplayed={2}
                        pageCount={Math.ceil(totalCount / perPage)}
                        previousLabel="‹"
                        renderOnZeroPageCount={null}
                        forcePage={page - 1}
                        containerClassName="flex max-w-full flex-wrap items-center justify-center gap-1"
                        pageLinkClassName="min-w-[2rem] rounded-lg border border-zinc-200/80 bg-white px-2 py-1 text-center text-[11px] font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 sm:min-w-[1.75rem] sm:py-0.5"
                        previousLinkClassName="rounded-lg border border-zinc-200/80 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 sm:py-0.5"
                        nextLinkClassName="rounded-lg border border-zinc-200/80 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 sm:py-0.5"
                        breakLinkClassName="px-1 text-[11px] text-zinc-400"
                        activeLinkClassName="!border-indigo-600 !bg-indigo-600 text-white hover:!bg-indigo-500"
                    />
                </div>
            )}

            <div id="messagesScrollDown" />
        </div>
    );
};

export default ComponentLifeEventsList;
