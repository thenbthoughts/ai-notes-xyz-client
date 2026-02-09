import { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
import axiosCustom from '../../../../../config/axiosCustom.ts';
import ComponentMemoryItem from './ComponentMemoryItem.tsx';
import ComponentMemoryAdd from './ComponentMemoryAdd.tsx';
import toast from 'react-hot-toast';

const perPage = 20;

interface IUserMemory {
    _id: string;
    username: string;
    content: string;
    isPermanent: boolean;
    createdAtUtc: string | null;
    updatedAtUtc: string | null;
}

const ComponentMemoryList = () => {
    const [totalCount, setTotalCount] = useState(0 as number);
    const [list, setList] = useState([] as IUserMemory[]);
    const [page, setPage] = useState(1);
    const [refreshRandomNum, setRefreshRandomNum] = useState(0);

    useEffect(() => {
        const axiosCancelTokenSource: CancelTokenSource = axios.CancelToken.source();
        fetchList({ axiosCancelTokenSource });
        return () => {
            axiosCancelTokenSource.cancel('Operation canceled by the user.');
        };
    }, [refreshRandomNum, page]);

    const fetchList = async ({ axiosCancelTokenSource }: { axiosCancelTokenSource: CancelTokenSource }) => {
        try {
            const config = {
                method: 'post',
                url: `/api/setting/user/memory/memoryGet`,
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
            if (typeof response.data.total === 'number') {
                tempTotalCount = response.data.total;
            }
            setTotalCount(tempTotalCount);
        } catch (error: any) {
            console.error('Error fetching memories:', error);
            const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to load memories';
            console.error('Error details:', error.response?.data);
            console.log('errorMessage: ', errorMessage);
            if(errorMessage !== 'Operation canceled by the user.') {
                toast.error(errorMessage);
            }
        }
    };

    const handleRefresh = () => {
        setRefreshRandomNum(Math.random());
    };

    const renderCount = () => {
        return (
            <div className="mb-4 flex items-center gap-3">
                <div className="flex flex-wrap items-center bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 rounded-sm px-3 sm:px-4 py-2 shadow-sm border border-purple-200">
                    <span className="text-base sm:text-lg font-bold text-purple-700 tracking-wide">{totalCount}</span>
                    <span className="ml-2 text-sm sm:text-base text-gray-700 font-medium">Memories</span>
                    {totalCount === 0 && (
                        <span className="ml-2 sm:ml-4 text-xs sm:text-sm text-red-500 font-semibold">No memories yet</span>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div>
            <ComponentMemoryAdd onAdd={handleRefresh} />
            
            {renderCount()}
            
            {list.map((memoryObj) => (
                <div key={memoryObj._id}>
                    <ComponentMemoryItem 
                        memoryObj={memoryObj} 
                        onUpdate={handleRefresh}
                        onDelete={handleRefresh}
                    />
                </div>
            ))}
            
            {totalCount >= 1 && (
                <div className="w-full flex justify-center items-center mt-4">
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
                        pageClassName="border border-gray-300 rounded-sm hover:bg-gray-200 text-base sm:text-lg m-0.5"
                        previousClassName="border border-gray-300 rounded-sm hover:bg-gray-200 text-base sm:text-lg m-0.5"
                        previousLinkClassName="text-gray-700 px-2 sm:px-3"
                        nextClassName="border border-gray-300 rounded-sm hover:bg-gray-200 text-base sm:text-lg m-0.5"
                        nextLinkClassName="text-gray-700 px-2 sm:px-3"
                        breakClassName="border border-gray-300 rounded-sm text-base sm:text-lg m-0.5"
                        breakLinkClassName="text-gray-700 px-2 sm:px-3"
                        activeLinkClassName="bg-purple-500 text-white"
                        pageLinkClassName="text-gray-700 px-2 sm:px-3"
                    />
                </div>
            )}
        </div>
    );
};

export default ComponentMemoryList;
