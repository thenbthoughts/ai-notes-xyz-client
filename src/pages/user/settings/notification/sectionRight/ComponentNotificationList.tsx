import { useState, useEffect, useMemo } from 'react';
import ReactPaginate from 'react-paginate';
import { Helmet } from 'react-helmet-async';
import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
import { Search, X } from 'lucide-react';
import axiosCustom from '../../../../../config/axiosCustom.ts';
import { IUserNotification } from '../../../../../types/pages/tsUserNotification.ts';
import ComponentNotificationItem from './ComponentNotificationItem.tsx';

const perPage = 20;

const ComponentNotificationList = () => {
    const [totalCount, setTotalCount] = useState(0 as number);
    const [list, setList] = useState([] as IUserNotification[]);
    const [page, setPage] = useState(1);
    const [refreshRandomNum, setRefreshRandomNum] = useState(0);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState(() => {
        try {
            const v = localStorage.getItem("settings-notif-search");
            if (typeof v === "string") return v;
            return "";
        } catch {
            return "";
        }
    });

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

    useEffect(() => {
        try {
            localStorage.setItem("settings-notif-search", search);
        } catch {
            return;
        }
    }, [search]);
    const fetchList = async ({ axiosCancelTokenSource }: { axiosCancelTokenSource: CancelTokenSource }) => {
        setLoading(true);
        try {
            const config = { method: 'post', url: `/api/user/notification/userNotificationGet`, headers: { 'Content-Type': 'application/json' }, data: { page: page, perPage: perPage }, cancelToken: axiosCancelTokenSource.token } as AxiosRequestConfig;
            const response = await axiosCustom.request(config);
            let tempArr = [];
            if (Array.isArray(response.data.docs)) tempArr = response.data.docs;
            setList(tempArr);
            let tempTotalCount = 0;
            if (typeof response.data.count === 'number') tempTotalCount = response.data.count;
            setTotalCount(tempTotalCount);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return list;
        return list.filter((n) => { return (n as unknown as { title?: string; message?: string }).title?.toLowerCase().includes(q) || (n as unknown as { message?: string }).message?.toLowerCase().includes(q); });
    }, [list, search]);
    const unreadCount = useMemo(() => { return list.filter((n) => { return !(n as unknown as { isRead?: boolean }).isRead; }).length; }, [list]);
    const renderCount = () => {
        return (
            <div className="mb-4 flex items-center gap-3 flex-wrap">
                <div className="flex items-center bg-zinc-900 rounded-sm px-4 py-2 shadow-sm border border-zinc-700">
                    <span className="text-lg font-bold text-zinc-100 tracking-wide">{totalCount}</span>
                    <span className="ml-2 text-zinc-400 font-medium">Notifications</span>
                    {unreadCount > 0 && (<span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">{unreadCount} unread</span>)}
                    {totalCount === 0 && (<span className="ml-4 text-zinc-500 font-semibold">No result</span>)}
                </div>
                <div className="relative">
                    <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-zinc-500" aria-hidden />
                    <input value={search} onChange={(e) => { setSearch(e.target.value); }} placeholder="Search notifications..." aria-label="Search notifications" className="w-56 rounded border border-zinc-700 bg-zinc-800 pl-7 pr-7 py-1 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none" />
                    {search && (<button type="button" onClick={() => { setSearch(""); }} className="absolute right-1 top-1.5 rounded p-1 text-zinc-400 hover:text-zinc-200" aria-label="Clear search"><X className="h-3.5 w-3.5" /></button>)}
                </div>
            </div>
        );
    };

    return (
        <div>
            <Helmet><title>Notifications - Settings</title></Helmet>
            {renderCount()}
            {loading && (<div className="space-y-2">{[1, 2, 3].map((k) => { return (<div key={k} className="h-16 animate-pulse rounded bg-zinc-800" />); })}</div>)}
            {!loading && filtered.length === 0 && (<div className="rounded border border-zinc-700 bg-zinc-900 p-6 text-center text-sm text-zinc-500">No notifications match</div>)}
            {!loading && filtered.map((notificationObj) => (
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
                        pageClassName="border border-zinc-700 rounded-sm hover:bg-zinc-800 text-base sm:text-lg m-0.5"
                        previousClassName="border border-zinc-700 rounded-sm hover:bg-zinc-800 text-base sm:text-lg m-0.5"
                        previousLinkClassName="text-zinc-300 px-2 sm:px-3"
                        nextClassName="border border-zinc-700 rounded-sm hover:bg-zinc-800 text-base sm:text-lg m-0.5"
                        nextLinkClassName="text-zinc-300 px-2 sm:px-3"
                        breakClassName="border border-zinc-700 rounded-sm text-base sm:text-lg m-0.5"
                        breakLinkClassName="text-zinc-300 px-2 sm:px-3"
                        activeLinkClassName="bg-blue-500 text-white"
                        pageLinkClassName="text-zinc-300 px-2 sm:px-3"
                    />
                </div>
            )}
        </div>
    );
};

export default ComponentNotificationList;