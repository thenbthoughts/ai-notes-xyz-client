import { useState, useEffect } from 'react';
import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
import { useAtomValue } from 'jotai';

import axiosCustom from '../../../../../config/axiosCustom.ts';
import { tsLifeEventsItem } from '../../../../../types/pages/tsLifeEvents.ts';
import ComponentLifeEventItem from './ComponentLifeEventItem.tsx';

import { jotaiStateLifeEventSearch, jotaiStateLifeEventCategory, jotaiStateLifeEventCategorySub, jotaiStateLifeEventIsStar, jotaiStateLifeEventImpact, jotaiStateLifeEventDateRange } from '../stateJotai/lifeEventStateJotai.ts';
import ReactPaginate from 'react-paginate';
import { PlusCircle } from 'lucide-react';
import { lifeEventAddAxios } from '../utils/lifeEventsListAxios.ts';
import { useNavigate } from 'react-router-dom';

const perPage = 20;

const ComponentLifeEventsList = () => {
    const navigate = useNavigate();
    const [totalCount, setTotalCount] = useState(0 as number);
    const [list, setList] = useState([] as tsLifeEventsItem[]);
    const [page, setPage] = useState(1);

    // jotai

    const searchTerm = useAtomValue(jotaiStateLifeEventSearch);
    const categoryId = useAtomValue(jotaiStateLifeEventCategory);
    const categorySubId = useAtomValue(jotaiStateLifeEventCategorySub);
    const isStar = useAtomValue(jotaiStateLifeEventIsStar);
    const eventImpact = useAtomValue(jotaiStateLifeEventImpact);
    const dateRange = useAtomValue(jotaiStateLifeEventDateRange);

    const [
        refreshRandomNum,
        setRefreshRandomNum,
    ] = useState(0);

    useEffect(() => {
        const axiosCancelTokenSource: CancelTokenSource = axios.CancelToken.source();
        fetchList({
            axiosCancelTokenSource,
        });
        return () => {
            axiosCancelTokenSource.cancel('Operation canceled by the user.'); // Cancel the request if needed
        };
    }, [
        refreshRandomNum,
    ])

    useEffect(() => {
        setRefreshRandomNum(Math.random());
    }, [
        page,
    ])

    useEffect(() => {
        setPage(1);
        setRefreshRandomNum(Math.random());
    }, [
        searchTerm,
        categoryId,
        categorySubId,
        isStar,
        eventImpact,
        dateRange,
    ])

    const fetchList = async ({
        axiosCancelTokenSource
    }: {
        axiosCancelTokenSource: CancelTokenSource
    }) => {
        try {
            let startDate = '';
            console.log('dateRange: ', dateRange);
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

                    startDate,
                    endDate,
                },
                cancelToken: axiosCancelTokenSource.token,
            } as AxiosRequestConfig;

            const response = await axiosCustom.request(config);
            console.log(response.data);
            console.log(response.data.docs);

            let tempArr = [];
            if (Array.isArray(response.data.docs)) {
                tempArr = response.data.docs
            }
            setList(tempArr);

            let tempTotalCount = 0;
            if (typeof response.data.count === 'number') {
                tempTotalCount = response.data.count
            }
            setTotalCount(tempTotalCount); // Assuming you have a state variable for total count

        } catch (error) {
            console.error(error);
        }
    }

    const lifeEventAddAxiosLocal = async () => {
        try {
            const result = await lifeEventAddAxios();
            if (result.success !== '') {
                navigate(`/user/life-events?action=edit&id=${result.recordId}`)
            }
        } catch (error) {
            console.error(error);
        }
    }

    const renderCount = () => {
        return (
            <div className="mb-4 flex items-center gap-3">
                <div className="flex items-center bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-lg px-4 py-2 shadow-sm border border-blue-200">
                    <button
                        onClick={() => {
                            lifeEventAddAxiosLocal();
                        }}
                    >
                        <PlusCircle
                            className="w-6 h-6 text-blue-500 mr-2 animate-pulse"
                            strokeWidth={2}
                            fill="#e0e7ff"
                        />
                    </button>
                    <span className="text-lg font-bold text-blue-700 tracking-wide">
                        {totalCount}
                    </span>
                    <span className="ml-2 text-gray-700 font-medium">
                        Life Events
                    </span>
                    {totalCount === 0 && (
                        <span className="ml-4 text-red-500 font-semibold">
                            No result
                        </span>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div>
            {renderCount()}

            {list.map((lifeEventObj) => {
                return (
                    <div>
                        <ComponentLifeEventItem
                            lifeEventObj={lifeEventObj}
                        />
                    </div>
                )
            })}

            {totalCount >= 1 && (
                <div className="w-full flex justify-center items-center">
                    <ReactPaginate
                        breakLabel="..."
                        nextLabel="next >"
                        onPageChange={(e) => {
                            setPage(e.selected);
                        }}
                        marginPagesDisplayed={1}
                        pageRangeDisplayed={3}
                        pageCount={Math.ceil(totalCount / perPage)}
                        previousLabel="< previous"
                        renderOnZeroPageCount={null}
                        forcePage={page}

                        containerClassName="flex flex-wrap justify-center items-center gap-1 sm:space-x-1"
                        pageClassName="border border-gray-300 rounded-md hover:bg-gray-200 text-base sm:text-lg m-0.5"
                        previousClassName="border border-gray-300 rounded-md hover:bg-gray-200 text-base sm:text-lg m-0.5"
                        previousLinkClassName="text-gray-700 px-2 sm:px-3"
                        nextClassName="border border-gray-300 rounded-md hover:bg-gray-200 text-base sm:text-lg m-0.5"
                        nextLinkClassName="text-gray-700 px-2 sm:px-3"
                        breakClassName="border border-gray-300 rounded-md text-base sm:text-lg m-0.5"
                        breakLinkClassName="text-gray-700 px-2 sm:px-3"
                        activeLinkClassName="bg-blue-500 text-white"
                        pageLinkClassName="text-gray-700 px-2 sm:px-3"
                    />
                </div>
            )}
        </div>
    )
};

export default ComponentLifeEventsList;