import { useState, useEffect } from 'react';
import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
import { useAtomValue } from 'jotai';

import axiosCustom from '../../../../../config/axiosCustom.ts';
import { tsLifeEventsItem } from '../../../../../types/pages/tsLifeEvents.ts';
import ComponentLifeEventItem from './ComponentLifeEventItem.tsx';

import { jotaiStateLifeEventSearch, jotaiStateLifeEventCategory, jotaiStateLifeEventCategorySub, jotaiStateLifeEventIsStar, jotaiStateLifeEventImpact, jotaiStateLifeEventDateRange } from '../stateJotai/lifeEventStateJotai.ts';

const ComponentLifeEventsList = () => {
    const [list, setList] = useState([] as tsLifeEventsItem[]);

    // jotai

    const searchTerm = useAtomValue(jotaiStateLifeEventSearch);
    const category = useAtomValue(jotaiStateLifeEventCategory);
    const subcategory = useAtomValue(jotaiStateLifeEventCategorySub);
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
        searchTerm,
        category,
        subcategory,
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
            const config = {
                method: 'post',
                url: `/api/life-events/crud/lifeEventsGet`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    page: 1,
                    perPage: 100,
                    search: searchTerm,
                    isStar: isStar,
                    eventImpact: eventImpact,
                    // paginationDateLocalYearMonthStr
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

        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div>
            {list.map((lifeEventObj) => {
                return (
                    <div>
                        <ComponentLifeEventItem
                            lifeEventObj={lifeEventObj}
                        />
                    </div>
                )
            })}
        </div>
    )
};

export default ComponentLifeEventsList;