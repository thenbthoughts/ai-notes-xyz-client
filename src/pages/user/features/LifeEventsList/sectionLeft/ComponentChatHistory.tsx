import { DebounceInput } from 'react-debounce-input';
import { LucidePlus, LucideSearch, LucideTags } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { lifeEventAddAxios } from '../utils/lifeEventsListAxios.ts';

import {
    jotaiStateLifeEventSearch,
    jotaiStateLifeEventCategory,
    jotaiStateLifeEventCategorySub,
    jotaiStateLifeEventIsStar,
    jotaiStateLifeEventImpact,
    jotaiStateLifeEventDateRange,
    jotaiStateLifeEventHideDailyDiary,
    jotaiStateLifeEventAiCategory,
    jotaiStateLifeEventAiCategorySub,
} from '../stateJotai/lifeEventStateJotai.ts';
import { useAtom, useSetAtom } from 'jotai';
import ComponentFilterCategory from './ComponentFilterCategory.tsx';
import ComponentFilterCategorySub from './ComponentFilterCategorySub.tsx';
import ComponentFilterAiCategory from './ComponentFilterAiCategory.tsx';
import ComponentFilterAiCategorySub from './ComponentFilterAiCategorySub.tsx';

const ComponentChatHistory = () => {
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useAtom(jotaiStateLifeEventSearch);
    const setCategory = useSetAtom(jotaiStateLifeEventCategory);
    const setSubcategory = useSetAtom(jotaiStateLifeEventCategorySub);
    const setAiCategory = useSetAtom(jotaiStateLifeEventAiCategory);
    const setAiSubcategory = useSetAtom(jotaiStateLifeEventAiCategorySub);
    const [isStar, setIsStar] = useAtom(jotaiStateLifeEventIsStar);
    const [impact, setImpact] = useAtom(jotaiStateLifeEventImpact);
    const [dateRange, setDateRange] = useAtom(jotaiStateLifeEventDateRange);
    const [hideDailyDiary, setHideDailyDiary] = useAtom(jotaiStateLifeEventHideDailyDiary);

    const lifeEventAddAxiosLocal = async () => {
        try {
            const result = await lifeEventAddAxios();
            if (result.success !== '') {
                navigate(`/user/life-events?action=edit&id=${result.recordId}`);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setCategory('');
        setSubcategory('');
        setAiCategory('');
        setAiSubcategory('');
        setIsStar('');
        setImpact('');
        setDateRange({ startDate: null, endDate: null });
        setHideDailyDiary(true);
    };

    const setDateRangeToPreset = (preset: string) => {
        const today = new Date();
        let startDate: Date;
        let endDate: Date;

        switch (preset) {
            case 'today':
                startDate = endDate = new Date(today);
                break;
            case 'yesterday': {
                const y = new Date(today);
                y.setDate(y.getDate() - 1);
                startDate = endDate = y;
                break;
            }
            case 'this week': {
                const start = new Date(today);
                start.setDate(today.getDate() - today.getDay());
                const end = new Date(start);
                end.setDate(start.getDate() + 6);
                startDate = start;
                endDate = end;
                break;
            }
            case 'last week': {
                const lastWeekStart = new Date(today);
                lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
                startDate = lastWeekStart;
                endDate = new Date(lastWeekStart);
                endDate.setDate(lastWeekStart.getDate() + 6);
                break;
            }
            case 'this month':
                startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                break;
            case 'last month':
                startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                endDate = new Date(today.getFullYear(), today.getMonth(), 0);
                break;
            case 'this year':
                startDate = new Date(today.getFullYear(), 0, 1);
                endDate = new Date(today.getFullYear(), 11, 31);
                break;
            case 'last year':
                startDate = new Date(today.getFullYear() - 1, 0, 1);
                endDate = new Date(today.getFullYear() - 1, 11, 31);
                break;
            default:
                return;
        }

        setDateRange({ startDate, endDate });
    };

    const presetBtn =
        'rounded-sm border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-zinc-700 hover:bg-zinc-50';

    const renderDateRange = () => (
        <div className="mb-2 rounded-md border border-zinc-200 bg-zinc-50/80 p-1.5">
            <div className="mb-1 text-[10px] font-medium text-zinc-600">Date range</div>
            <input
                type="date"
                className="mb-1 block w-full rounded-sm border border-zinc-200 bg-white px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={dateRange.startDate ? dateRange.startDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setDateRange({ ...dateRange, startDate: new Date(e.target.value) })}
            />
            <input
                type="date"
                className="mb-1.5 block w-full rounded-sm border border-zinc-200 bg-white px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={dateRange.endDate ? dateRange.endDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setDateRange({ ...dateRange, endDate: new Date(e.target.value) })}
            />
            <button
                type="button"
                onClick={() => setDateRange({ startDate: null, endDate: null })}
                className="mb-1.5 w-full rounded-sm border border-red-200 bg-red-50 py-1 text-[10px] font-medium text-red-800 hover:bg-red-100"
            >
                Clear dates
            </button>
            <div className="flex flex-wrap gap-1">
                {[
                    ['Today', 'today'],
                    ['Yesterday', 'yesterday'],
                    ['This wk', 'this week'],
                    ['Last wk', 'last week'],
                    ['This mo', 'this month'],
                    ['Last mo', 'last month'],
                    ['This yr', 'this year'],
                    ['Last yr', 'last year'],
                ].map(([label, key]) => (
                    <button key={key} type="button" className={presetBtn} onClick={() => setDateRangeToPreset(key)}>
                        {label}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="px-2 py-2 text-zinc-900">
            <div className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-xs font-semibold tracking-tight text-zinc-900">Life events</h2>
                <span className="text-[9px] font-medium uppercase tracking-wide text-zinc-500">Filters</span>
            </div>

            <div className="mb-1.5 flex flex-col gap-1 sm:flex-row">
                <button
                    type="button"
                    className="flex flex-1 items-center justify-center gap-1 rounded-sm border border-emerald-700/30 bg-emerald-600 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-700"
                    onClick={() => void lifeEventAddAxiosLocal()}
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
                <Link
                    to="/user/life-events?action=category"
                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-sm border border-zinc-200 bg-white py-1.5 text-xs font-medium text-zinc-800 shadow-sm hover:bg-zinc-50"
                >
                    <LucideTags className="h-3.5 w-3.5" strokeWidth={2} />
                    Categories
                </Link>
            </div>

            <div className="relative mb-2">
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

            <div className="mb-2 space-y-2 [&_label]:text-xs [&_label]:font-medium [&_label]:text-zinc-700 [&_select]:text-xs">
                <ComponentFilterCategory />
                <ComponentFilterCategorySub />
                <ComponentFilterAiCategory />
                <ComponentFilterAiCategorySub />
            </div>

            {renderDateRange()}

            <div className="mb-1.5 rounded-md border border-zinc-200 bg-zinc-50/80 px-1.5 py-1.5">
                <div className="mb-1 text-[10px] font-medium text-zinc-600">Starred</div>
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
                            className={`rounded-sm border px-2 py-0.5 text-[11px] font-medium transition-colors ${
                                isStar === opt.value
                                    ? 'border-indigo-600 bg-indigo-600 text-white'
                                    : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-1.5 rounded-md border border-zinc-200 bg-white px-1.5 py-1.5 shadow-sm">
                <div className="mb-1 text-[10px] font-medium text-zinc-600">Impact</div>
                <div className="flex flex-wrap gap-1">
                    {[
                        { label: 'All', value: '' as const },
                        { label: 'V.Low', value: 'very-low' as const },
                        { label: 'Low', value: 'low' as const },
                        { label: 'Med', value: 'medium' as const },
                        { label: 'Large', value: 'large' as const },
                        { label: 'Huge', value: 'huge' as const },
                    ].map((opt) => (
                        <button
                            key={opt.label}
                            type="button"
                            onClick={() => setImpact(opt.value)}
                            className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-medium ${
                                impact === opt.value
                                    ? 'border-emerald-600 bg-emerald-600 text-white'
                                    : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-2 rounded-sm border border-zinc-200 bg-white px-2 py-1.5">
                <input
                    type="checkbox"
                    id="hideDailyDiary"
                    checked={hideDailyDiary}
                    onChange={(e) => setHideDailyDiary(e.target.checked)}
                    className="h-3.5 w-3.5 rounded-sm border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="hideDailyDiary" className="cursor-pointer text-xs text-zinc-700">
                    Hide daily diary
                </label>
            </div>
        </div>
    );
};

const ComponentChatHistoryRender = () => {
    return (
        <div className="border-r border-zinc-200 bg-[#f4f4f5]">
            <div className="h-[calc(100vh-60px)] overflow-y-auto bg-white">
                <ComponentChatHistory />
            </div>
        </div>
    );
};

const ComponentChatHistoryModelRender = () => {
    return (
        <div className="fixed left-0 top-[60px] z-[1001] w-[min(300px,calc(100%-50px))] border-r border-zinc-200 shadow-lg">
            <div className="h-[calc(100vh-60px)] overflow-y-auto bg-white">
                <ComponentChatHistory />
            </div>
        </div>
    );
};

export { ComponentChatHistoryRender, ComponentChatHistoryModelRender };
