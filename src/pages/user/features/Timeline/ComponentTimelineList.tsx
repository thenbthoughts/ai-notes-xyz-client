import { useState, useEffect } from 'react';
import axios, { CancelTokenSource } from 'axios';
import { TimelineItem, timelineGetAxios } from './utils/timelineAxios.ts';
import ComponentTimelineItem from './ComponentTimelineItem.tsx';
import ComponentTimelineTabs from './ComponentTimelineTabs.tsx';
import ReactPaginate from 'react-paginate';

const perPage = 30;

const ComponentTimelineList = ({
    refreshRandomNumParent,
}: {
    refreshRandomNumParent: number;
}) => {
    const [totalCount, setTotalCount] = useState(0 as number);
    const [list, setList] = useState([] as TimelineItem[]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const axiosCancelTokenSource: CancelTokenSource = axios.CancelToken.source();
        fetchList({
            axiosCancelTokenSource,
        });
        return () => {
            axiosCancelTokenSource.cancel('Operation canceled by the user.');
        };
    }, [
        refreshRandomNumParent,
        page,
    ]);

    const fetchList = async ({
        axiosCancelTokenSource
    }: {
        axiosCancelTokenSource: CancelTokenSource
    }) => {
        try {
            setLoading(true);
            const result = await timelineGetAxios({
                page,
                perPage,
                axiosCancelTokenSource,
            });
            
            setList(result.docs);
            setTotalCount(result.count);
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log('Request canceled:', error.message);
            } else {
                console.error(error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePageClick = (event: { selected: number }) => {
        setPage(event.selected + 1);
    };

    const renderCount = () => {
        if (totalCount === 0) {
            return null;
        }
        return (
            <div className="mb-2 text-[10px] font-medium text-zinc-400">
                {totalCount} items
            </div>
        );
    };

    const renderPagination = () => {
        if (totalCount <= perPage) {
            return null;
        }
        const pageCount = Math.ceil(totalCount / perPage);
        return (
            <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-center">
                <ReactPaginate
                    breakLabel="..."
                    nextLabel={
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    }
                    onPageChange={handlePageClick}
                    pageRangeDisplayed={3}
                    pageCount={pageCount}
                    previousLabel={
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    }
                    renderOnZeroPageCount={null}
                    forcePage={page - 1}
                    className="flex gap-1 items-center"
                    pageClassName="min-w-[28px] h-7 flex items-center justify-center"
                    pageLinkClassName="w-full h-full flex items-center justify-center px-2 text-xs rounded-md hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-100 cursor-pointer"
                    activeClassName="bg-zinc-800 text-zinc-100 font-medium rounded-md"
                    activeLinkClassName="hover:bg-zinc-800 cursor-pointer"
                    previousClassName="min-w-[28px] h-7 flex items-center justify-center"
                    previousLinkClassName="w-full h-full flex items-center justify-center px-2 rounded-md hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-100 cursor-pointer"
                    nextClassName="min-w-[28px] h-7 flex items-center justify-center"
                    nextLinkClassName="w-full h-full flex items-center justify-center px-2 rounded-md hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-100 cursor-pointer"
                    disabledClassName="opacity-40 cursor-not-allowed"
                    disabledLinkClassName="hover:bg-transparent cursor-not-allowed"
                    breakClassName="min-w-[28px] h-7 flex items-center justify-center"
                    breakLinkClassName="w-full h-full flex items-center justify-center px-2 text-xs text-zinc-400"
                />
            </div>
        );
    };

    return (
        <div
            className="p-2"
        >
            <div className="mb-1">
                <h1 className="text-sm font-semibold text-zinc-100">Timeline</h1>
            </div>
            <ComponentTimelineTabs />

            {renderCount()}

            {loading && (
                <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-zinc-400"></div>
                </div>
            )}

            {!loading && list.length === 0 && (
                <div className="text-center py-6">
                    <p className="text-xs text-zinc-400">No timeline items found.</p>
                </div>
            )}

            {!loading && list.length > 0 && (
                <div className="space-y-0.5">
                    {list.map((item, index) => (
                        <ComponentTimelineItem
                            key={item._id || `${item.entityType}-${item.entityId}-${index}`}
                            item={item}
                        />
                    ))}
                </div>
            )}

            {renderPagination()}
        </div>
    );
};

export default ComponentTimelineList;

