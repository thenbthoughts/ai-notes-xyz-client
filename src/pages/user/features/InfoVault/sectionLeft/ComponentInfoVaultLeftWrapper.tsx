import { DebounceInput } from 'react-debounce-input';
import { LucidePlus, LucideSearch } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { infoVaultAddAxios } from '../utils/infoVaultListAxios.ts';

import {
    jotaiStateInfoVaultArchivedFilter,
    jotaiStateInfoVaultIsStar,
    jotaiStateInfoVaultRelationshipFilter,
    jotaiStateInfoVaultSearch,
    jotaiStateInfoVaultTypeFilter,
} from '../stateJotai/infoVaultStateJotai.ts';
import { useAtom } from 'jotai';
import { INFO_VAULT_TYPE_OPTIONS } from '../infoVaultTypeOptions.ts';

const RELATIONSHIP_FILTER_OPTIONS = [
    { label: 'All', value: '' as const },
    { label: 'Myself', value: 'myself' as const },
    { label: 'Personal', value: 'personal' as const },
    { label: 'Professional', value: 'professional' as const },
    { label: 'Family', value: 'family' as const },
    { label: 'Other', value: 'other' as const },
];

const ComponentInfoVaultLeftWrapper = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useAtom(jotaiStateInfoVaultSearch);
    const [isStar, setIsStar] = useAtom(jotaiStateInfoVaultIsStar);
    const [typeFilter, setTypeFilter] = useAtom(jotaiStateInfoVaultTypeFilter);
    const [relationshipFilter, setRelationshipFilter] = useAtom(jotaiStateInfoVaultRelationshipFilter);
    const [archivedFilter, setArchivedFilter] = useAtom(jotaiStateInfoVaultArchivedFilter);

    const infoVaultAddAxiosLocal = async () => {
        try {
            const result = await infoVaultAddAxios();
            if (result.success !== '') {
                navigate(`/user/info-vault?action=edit&id=${result.recordId}`);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setIsStar('');
        setTypeFilter('');
        setRelationshipFilter('');
        setArchivedFilter('');
    };

    const pillClass = (active: boolean) =>
        `rounded-sm border px-2 py-0.5 text-[11px] font-medium transition-colors ${
            active
                ? 'border-indigo-600 bg-indigo-600 text-white'
                : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300'
        }`;

    return (
        <div className="px-2 py-3 text-zinc-900">
            <div className="mb-3 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold tracking-tight text-zinc-900">Info Vault</h2>
                <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">Filters</span>
            </div>

            <div className="mb-2 flex flex-col gap-1.5 sm:flex-row">
                <button
                    type="button"
                    className="flex flex-1 items-center justify-center gap-1 rounded-sm border border-emerald-700/30 bg-emerald-600 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-700"
                    onClick={infoVaultAddAxiosLocal}
                >
                    <LucidePlus className="h-3.5 w-3.5" strokeWidth={2} />
                    Add
                </button>
                <button
                    type="button"
                    className="rounded-sm border border-zinc-200 bg-white px-2 py-1.5 text-xs font-medium text-zinc-700 shadow-sm hover:bg-zinc-50"
                    onClick={clearFilters}
                >
                    Clear
                </button>
            </div>

            <div className="relative mb-3">
                <LucideSearch
                    className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400"
                    strokeWidth={2}
                />
                <DebounceInput
                    debounceTimeout={500}
                    type="text"
                    placeholder="Search…"
                    className="w-full rounded-sm border border-zinc-200 bg-white py-1.5 pl-7 pr-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    value={searchTerm}
                />
            </div>

            <div className="mb-2 space-y-2">
                <div className="rounded-sm border border-zinc-200 bg-zinc-50/80 px-2 py-2">
                    <div className="mb-1.5 text-[11px] font-medium text-zinc-600">Type</div>
                    <div className="flex flex-wrap gap-1">
                        <button
                            type="button"
                            onClick={() => setTypeFilter('')}
                            className={pillClass(typeFilter === '')}
                        >
                            All
                        </button>
                        {INFO_VAULT_TYPE_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setTypeFilter(opt.value)}
                                className={pillClass(typeFilter === opt.value)}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="rounded-sm border border-zinc-200 bg-zinc-50/80 px-2 py-2">
                    <div className="mb-1.5 text-[11px] font-medium text-zinc-600">Relationship</div>
                    <div className="flex flex-wrap gap-1">
                        {RELATIONSHIP_FILTER_OPTIONS.map((opt) => (
                            <button
                                key={opt.label}
                                type="button"
                                onClick={() => setRelationshipFilter(opt.value)}
                                className={pillClass(relationshipFilter === opt.value)}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="rounded-sm border border-zinc-200 bg-zinc-50/80 px-2 py-2">
                    <div className="mb-1.5 text-[11px] font-medium text-zinc-600">Archived</div>
                    <div className="flex flex-wrap gap-1">
                        {[
                            { label: 'All', value: '' as const },
                            { label: 'Yes', value: 'true' as const },
                            { label: 'No', value: 'false' as const },
                        ].map((opt) => (
                            <button
                                key={opt.label}
                                type="button"
                                onClick={() => setArchivedFilter(opt.value)}
                                className={pillClass(archivedFilter === opt.value)}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="rounded-sm border border-zinc-200 bg-zinc-50/80 px-2 py-2">
                    <div className="mb-1.5 text-[11px] font-medium text-zinc-600">Starred</div>
                    <div className="flex flex-wrap gap-1">
                        {[
                            { label: 'All', value: '' as const },
                            { label: 'Yes', value: 'true' as const },
                            { label: 'No', value: 'false' as const },
                        ].map((opt) => (
                            <button
                                key={opt.label}
                                type="button"
                                onClick={() => setIsStar(opt.value)}
                                className={pillClass(isStar === opt.value)}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ComponentInfoVaultLeftWrapperRender = () => {
    return (
        <div className="border-r border-zinc-200 bg-[#f4f4f5]">
            <div className="h-[calc(100vh-60px)] overflow-y-auto border-zinc-200 bg-white">
                <ComponentInfoVaultLeftWrapper />
            </div>
        </div>
    );
};

const ComponentInfoVaultLeftWrapperModelRender = () => {
    return (
        <div className="fixed left-0 top-[60px] z-[1001] w-[min(300px,calc(100%-50px))] border-r border-zinc-200 shadow-lg">
            <div className="h-[calc(100vh-60px)] overflow-y-auto bg-white">
                <ComponentInfoVaultLeftWrapper />
            </div>
        </div>
    );
};

export { ComponentInfoVaultLeftWrapperRender, ComponentInfoVaultLeftWrapperModelRender };
