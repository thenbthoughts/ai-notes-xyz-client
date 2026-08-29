import { useState, useEffect, useMemo } from 'react';
import ReactPaginate from 'react-paginate';
import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
import { Search, X, Trash2 } from 'lucide-react';
import axiosCustom from '../../../../../config/axiosCustom.ts';
import ComponentMemoryItem from './ComponentMemoryItem.tsx';
import ComponentMemoryAdd from './ComponentMemoryAdd.tsx';
import toast from 'react-hot-toast';

const perPage = 20;

interface IUserMemory {
    _id: string;
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
    const [search, setSearch] = useState(() => {
        try {
            const v = localStorage.getItem("settings-memory-search");
            if (typeof v === "string") return v;
            return "";
        } catch {
            return "";
        }
    });
    const [selected, setSelected] = useState<Set<string>>(new Set());

    useEffect(() => {
        try {
            localStorage.setItem("settings-memory-search", search);
        } catch {
            return;
        }
    }, [search]);

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
        setSelected(new Set());
    };
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return list;
        return list.filter((m) => { return m.content.toLowerCase().includes(q); });
    }, [list, search]);
    const handleBulkDelete = async () => {
        const ids = Array.from(selected);
        if (ids.length === 0) return;
        if (!confirm(`Delete ${ids.length} memories?`)) return;
        try {
            for (const id of ids) {
                await axiosCustom.request({ method: "post", url: `/api/setting/user/memory/memoryDelete`, data: { _id: id } } as AxiosRequestConfig);
            }
            toast.success(`Deleted ${ids.length}`);
            handleRefresh();
        } catch {
            toast.error("Bulk delete failed");
        }
    };

    const renderCount = () => {
        return (
            <div className="mb-4 flex items-center gap-3">
                <div className="flex flex-wrap items-center bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 rounded-sm px-3 sm:px-4 py-2 shadow-sm border border-purple-200">
                    <span className="text-base sm:text-lg font-bold text-purple-700 tracking-wide">{totalCount}</span>
                    <span className="ml-2 text-sm sm:text-base text-zinc-300 font-medium">Memories</span>
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
            <div className="relative my-3">
                <Search className="absolute left-2 top-2 h-4 w-4 text-zinc-500" aria-hidden />
                <input value={search} onChange={(e) => { setSearch(e.target.value); }} placeholder="Search memories..." aria-label="Search memories" className="w-full rounded border border-zinc-700 bg-zinc-800 pl-8 pr-8 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none" />
                {search && (<button type="button" onClick={() => { setSearch(""); }} className="absolute right-2 top-2 text-zinc-400 hover:text-zinc-200" aria-label="Clear search"><X className="h-4 w-4" /></button>)}
            </div>
            {selected.size > 0 && (<div className="mb-2 flex items-center gap-2"><span className="text-xs text-zinc-400">{selected.size} selected</span><button type="button" onClick={() => { void handleBulkDelete(); }} className="inline-flex items-center gap-1 rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700" aria-label="Bulk delete memories"><Trash2 className="h-3 w-3" />Delete selected</button><button type="button" onClick={() => { setSelected(new Set()); }} className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300" aria-label="Clear selection">Clear</button></div>)}
            {renderCount()}
            
            {filtered.length === 0 && (<div className="rounded border border-zinc-700 bg-zinc-900 p-6 text-center text-sm text-zinc-500">No memories match search</div>)}
            {filtered.map((memoryObj) => (
                <div key={memoryObj._id} className="flex items-start gap-2">
                    <input type="checkbox" checked={selected.has(memoryObj._id)} onChange={(e) => { const next = new Set(selected); if (e.target.checked) next.add(memoryObj._id); else next.delete(memoryObj._id); setSelected(next); }} className="mt-4 h-4 w-4 rounded border-zinc-600 bg-zinc-800" aria-label={`Select memory ${memoryObj._id}`} />
                    <div className="flex-1">
                        <ComponentMemoryItem memoryObj={memoryObj} onUpdate={handleRefresh} onDelete={handleRefresh} />
                    </div>
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
                        pageClassName="border border-zinc-700 rounded-sm hover:bg-zinc-800 text-base sm:text-lg m-0.5"
                        previousClassName="border border-zinc-700 rounded-sm hover:bg-zinc-800 text-base sm:text-lg m-0.5"
                        previousLinkClassName="text-zinc-300 px-2 sm:px-3"
                        nextClassName="border border-zinc-700 rounded-sm hover:bg-zinc-800 text-base sm:text-lg m-0.5"
                        nextLinkClassName="text-zinc-300 px-2 sm:px-3"
                        breakClassName="border border-zinc-700 rounded-sm text-base sm:text-lg m-0.5"
                        breakLinkClassName="text-zinc-300 px-2 sm:px-3"
                        activeLinkClassName="bg-purple-500 text-white"
                        pageLinkClassName="text-zinc-300 px-2 sm:px-3"
                    />
                </div>
            )}
        </div>
    );
};

export default ComponentMemoryList;
