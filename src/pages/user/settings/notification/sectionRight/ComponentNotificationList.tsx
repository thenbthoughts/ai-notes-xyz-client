import { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';

import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
import axiosCustom from '../../../../../config/axiosCustom.ts';
import { IUserNotification } from '../../../../../types/pages/tsUserNotification.ts';
import ComponentNotificationItem from './ComponentNotificationItem.tsx';

const perPage = 20;

const ComponentNotificationList = () => {
    const [totalCount, setTotalCount] = useState(0 as number);
    const [list, setList] = useState([] as IUserNotification[]);
    const [page, setPage] = useState(1);
    const [refreshRandomNum, setRefreshRandomNum] = useState(0);

    useEffect(() => {
        const axiosCancelTokenSource: CancelTokenSource = axios.CancelToken.source();
        fetchList({ axiosCancelTokenSource });
        return () => {
            axiosCancelTokenSource.cancel('Operation canceled by the user.');
        };
    }, [refreshRandomNum]);

    useEffect(() => {
        setPage(1);
        setRefreshRandomNum(Math.random());
    }, [page]);

    const fetchList = async ({ axiosCancelTokenSource }: { axiosCancelTokenSource: CancelTokenSource }) => {
        try {
            const config = {
                method: 'post',
                url: `/api/user/notification/userNotificationGet`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    page: page,
                    perPage: perPage,
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

    const renderCount = () => {
        return (
            <div className="mb-4 flex items-center gap-3">
                <div className="flex items-center bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-lg px-4 py-2 shadow-sm border border-blue-200">
                    
                    <span className="text-lg font-bold text-blue-700 tracking-wide">{totalCount}</span>
                    <span className="ml-2 text-gray-700 font-medium">Notifications</span>
                    {totalCount === 0 && (
                        <span className="ml-4 text-red-500 font-semibold">No result</span>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div>
            {renderCount()}
            {list.map((notificationObj) => (
                <div key={notificationObj._id}>
                    <ComponentNotificationItem notificationObj={notificationObj} />
                </div>
            ))}
            {totalCount >= 1 && (
                <div className="w-full flex justify-center items-center">
                    <ReactPaginate
                        breakLabel="..."
                        nextLabel="next >"
                        onPageChange={(e) => {
                            setPage(e.selected + 1);
                        }}
                        marginPagesDisplayed={1}
                        pageRangeDisplayed={3}
                        pageCount={Math.ceil(totalCount / perPage)}
                        previousLabel="< previous"
                        renderOnZeroPageCount={null}
                        forcePage={page - 1}
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
    );
};

export default ComponentNotificationList;