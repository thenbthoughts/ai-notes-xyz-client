import { useState, useEffect } from 'react';
import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
import axiosCustom from '../../../../../config/axiosCustom.ts';
import { IInfoVault } from '../../../../../types/pages/tsInfoVault.ts';
import ComponentInfoVaultItem from './ComponentInfoVaultItem.tsx';
import ReactPaginate from 'react-paginate';
import { LucidePlus } from 'lucide-react';
import { infoVaultAddAxios } from '../utils/infoVaultListAxios.ts';
import { useNavigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import {
    jotaiStateInfoVaultArchivedFilter,
    jotaiStateInfoVaultIsStar,
    jotaiStateInfoVaultRelationshipFilter,
    jotaiStateInfoVaultSearch,
    jotaiStateInfoVaultTypeFilter,
} from '../stateJotai/infoVaultStateJotai.ts';

const perPage = 20;

const ComponentInfoVaultList = () => {
    const navigate = useNavigate();
    const [totalCount, setTotalCount] = useState(0 as number);
    const [list, setList] = useState([] as IInfoVault[]);
    const [page, setPage] = useState(1);
    const [refreshRandomNum, setRefreshRandomNum] = useState(0);
    const searchTerm = useAtomValue(jotaiStateInfoVaultSearch);
    const isFavorite = useAtomValue(jotaiStateInfoVaultIsStar);
    const infoVaultTypeFilter = useAtomValue(jotaiStateInfoVaultTypeFilter);
    const relationshipTypeFilter = useAtomValue(jotaiStateInfoVaultRelationshipFilter);
    const isArchivedFilter = useAtomValue(jotaiStateInfoVaultArchivedFilter);

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
    }, [searchTerm, isFavorite, infoVaultTypeFilter, relationshipTypeFilter, isArchivedFilter]);

    const fetchList = async ({ axiosCancelTokenSource }: { axiosCancelTokenSource: CancelTokenSource }) => {
        try {
            const config = {
                method: 'post',
                url: `/api/info-vault/crud/infoVaultGet`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    page: page,
                    perPage: perPage,
                    search: searchTerm,
                    isFavorite: isFavorite,
                    ...(infoVaultTypeFilter ? { infoVaultType: infoVaultTypeFilter } : {}),
                    ...(relationshipTypeFilter ? { relationshipType: relationshipTypeFilter } : {}),
                    ...(isArchivedFilter ? { isArchived: isArchivedFilter } : {}),
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

    const notesAddAxiosLocal = async () => {
        try {
            const result = await infoVaultAddAxios();
            if (result.success !== '') {
                navigate(`/user/info-vault?action=edit&id=${result.recordId}`);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const goToTop = () => {
        document.getElementById('messagesScrollUp')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div>
            <div id="messagesScrollUp" />

            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-sm border border-zinc-200 bg-white px-2 py-1.5 shadow-sm">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={notesAddAxiosLocal}
                        className="inline-flex items-center gap-1 rounded-sm border border-emerald-700/30 bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                    >
                        <LucidePlus className="h-3.5 w-3.5" strokeWidth={2} />
                        Add
                    </button>
                    <span className="text-xs text-zinc-600">
                        <span className="font-semibold text-zinc-900">{totalCount}</span> entries
                    </span>
                    {totalCount === 0 && (
                        <span className="text-xs font-medium text-amber-700">No results</span>
                    )}
                </div>
            </div>

            <div className="space-y-1.5">
                {list.map((infoVaultObj) => (
                    <ComponentInfoVaultItem key={infoVaultObj._id} infoVaultObj={infoVaultObj} />
                ))}
            </div>

            {totalCount >= 1 && (
                <div className="mt-3 flex w-full items-center justify-center">
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
                        containerClassName="flex flex-wrap items-center justify-center gap-1"
                        pageLinkClassName="min-w-[1.75rem] rounded-sm border border-zinc-200 bg-white px-2 py-0.5 text-center text-[11px] text-zinc-700 hover:bg-zinc-50"
                        previousLinkClassName="rounded-sm border border-zinc-200 bg-white px-2 py-0.5 text-[11px] text-zinc-700 hover:bg-zinc-50"
                        nextLinkClassName="rounded-sm border border-zinc-200 bg-white px-2 py-0.5 text-[11px] text-zinc-700 hover:bg-zinc-50"
                        breakLinkClassName="px-1 text-[11px] text-zinc-400"
                        activeLinkClassName="border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-600"
                    />
                </div>
            )}

            <div id="messagesScrollDown" />
        </div>
    );
};

export default ComponentInfoVaultList;
