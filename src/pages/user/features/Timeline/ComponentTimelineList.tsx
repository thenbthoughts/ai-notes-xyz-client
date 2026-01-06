import { useState, useEffect } from 'react';
import axios, { CancelTokenSource } from 'axios';
import { TimelineItem, timelineGetAxios } from './utils/timelineAxios.ts';
import ComponentTimelineItem from './ComponentTimelineItem.tsx';
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
            <div className="mb-2 text-[10px] text-gray-500">
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
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-center">
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
                    pageLinkClassName="w-full h-full flex items-center justify-center px-2 text-xs rounded-md hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900 cursor-pointer"
                    activeClassName="bg-blue-50 text-blue-600 font-medium rounded-md"
                    activeLinkClassName="hover:bg-blue-50 cursor-pointer"
                    previousClassName="min-w-[28px] h-7 flex items-center justify-center"
                    previousLinkClassName="w-full h-full flex items-center justify-center px-2 rounded-md hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900 cursor-pointer"
                    nextClassName="min-w-[28px] h-7 flex items-center justify-center"
                    nextLinkClassName="w-full h-full flex items-center justify-center px-2 rounded-md hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900 cursor-pointer"
                    disabledClassName="opacity-40 cursor-not-allowed"
                    disabledLinkClassName="hover:bg-transparent cursor-not-allowed"
                    breakClassName="min-w-[28px] h-7 flex items-center justify-center"
                    breakLinkClassName="w-full h-full flex items-center justify-center px-2 text-xs text-gray-400"
                />
            </div>
        );
    };

    return (
        <div
            className="p-2"
        >
            <div className="mb-3 pb-1.5 border-b border-gray-200">
                <h1 className="text-sm font-semibold text-gray-900">Timeline</h1>
            </div>

            {renderCount()}

            {loading && (
                <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                </div>
            )}

            {!loading && list.length === 0 && (
                <div className="text-center py-6">
                    <p className="text-xs text-gray-400">No timeline items found.</p>
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

