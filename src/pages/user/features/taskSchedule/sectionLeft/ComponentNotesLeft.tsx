import { useAtom, useAtomValue } from 'jotai';
import { useEffect, useMemo, useState } from 'react';
import { LucideSearch } from 'lucide-react';

import {
    jotaiTaskScheduleFilterIsActive,
    jotaiTaskScheduleFilterShouldSendEmail,
    jotaiTaskScheduleFilterTaskType,
    jotaiTaskScheduleListRefresh,
    jotaiTaskScheduleSearchDescription,
    jotaiTaskScheduleSearchTitle,
    TaskScheduleTaskTypeFilter,
} from '../stateJotai/taskScheduleStateJotai.ts';
import { taskScheduleTaskTypeCountsAxios } from '../utils/taskScheduleTaskTypeCountsAxios.ts';

const TASK_TYPE_OPTIONS: { value: TaskScheduleTaskTypeFilter; label: string }[] = [
    { value: '', label: 'All types' },
    { value: 'taskAdd', label: 'Task add' },
    { value: 'notesAdd', label: 'Notes add' },
    { value: 'customRestApiCall', label: 'Custom REST API' },
    { value: 'generatedDailySummaryByAi', label: 'AI daily summary' },
    { value: 'suggestDailyTasksByAi', label: 'Suggest daily tasks (AI)' },
    { value: 'sendMyselfEmail', label: 'Send myself email' },
];

const ComponentNotesLeft = () => {
    const [taskType, setTaskType] = useAtom(jotaiTaskScheduleFilterTaskType);
    const [isActive, setIsActive] = useAtom(jotaiTaskScheduleFilterIsActive);
    const [shouldSendEmail, setShouldSendEmail] = useAtom(jotaiTaskScheduleFilterShouldSendEmail);
    const [searchTitle, setSearchTitle] = useAtom(jotaiTaskScheduleSearchTitle);
    const [searchDescription, setSearchDescription] = useAtom(jotaiTaskScheduleSearchDescription);
    const listRefresh = useAtomValue(jotaiTaskScheduleListRefresh);

    const [typeTotal, setTypeTotal] = useState(0);
    const [countByTaskType, setCountByTaskType] = useState<Record<string, number>>({});

    useEffect(() => {
        let cancelled = false;
        void (async () => {
            const result = await taskScheduleTaskTypeCountsAxios();
            if (cancelled || !result) {
                return;
            }
            const next: Record<string, number> = {};
            for (const row of result.byTaskType) {
                next[row.taskType] = row.count;
            }
            setTypeTotal(result.total);
            setCountByTaskType(next);
        })();
        return () => {
            cancelled = true;
        };
    }, [listRefresh]);

    const labelForTaskTypeOption = useMemo(() => {
        return (value: TaskScheduleTaskTypeFilter, baseLabel: string) => {
            const n = value === '' ? typeTotal : (countByTaskType[value] ?? 0);
            return `${baseLabel} (${n})`;
        };
    }, [typeTotal, countByTaskType]);

    const seg = (on: boolean) =>
        on
            ? 'border-indigo-600 bg-indigo-600 text-white'
            : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300';

    return (
        <div className="px-2 py-3 text-zinc-900">
            <div className="mb-3 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold tracking-tight text-zinc-900">Schedule</h2>
                <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                    Filters
                </span>
            </div>

            <div className="mb-3">
                <label className="mb-1 block text-[11px] font-medium text-zinc-600">Task type</label>
                <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value as TaskScheduleTaskTypeFilter)}
                    className="w-full rounded-sm border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                    {TASK_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value || 'all'} value={opt.value}>
                            {labelForTaskTypeOption(opt.value, opt.label)}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-2 rounded-sm border border-zinc-200 bg-zinc-50/80 px-2 py-2">
                <div className="mb-1.5 text-[11px] font-medium text-zinc-600">Status</div>
                <div className="flex flex-wrap gap-1">
                    {(
                        [
                            ['All', '' as const],
                            ['Active', 'active' as const],
                            ['Inactive', 'inactive' as const],
                        ] as const
                    ).map(([label, value]) => (
                        <button
                            key={label}
                            type="button"
                            onClick={() => setIsActive(value)}
                            className={`rounded-sm border px-2 py-0.5 text-[11px] font-medium transition-colors ${seg(isActive === value)}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-3 rounded-sm border border-zinc-200 bg-zinc-50/80 px-2 py-2">
                <div className="mb-1.5 text-[11px] font-medium text-zinc-600">Email</div>
                <div className="flex flex-wrap gap-1">
                    {(
                        [
                            ['All', '' as const],
                            ['Yes', 'true' as const],
                            ['No', 'false' as const],
                        ] as const
                    ).map(([label, value]) => (
                        <button
                            key={label}
                            type="button"
                            onClick={() => setShouldSendEmail(value)}
                            className={`rounded-sm border px-2 py-0.5 text-[11px] font-medium transition-colors ${seg(shouldSendEmail === value)}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative mb-2">
                <LucideSearch
                    className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400"
                    strokeWidth={2}
                />
                <input
                    type="text"
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    placeholder="Title…"
                    className="w-full rounded-sm border border-zinc-200 bg-white py-1.5 pl-7 pr-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
            </div>

            <div className="relative mb-1">
                <LucideSearch
                    className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400"
                    strokeWidth={2}
                />
                <input
                    type="text"
                    value={searchDescription}
                    onChange={(e) => setSearchDescription(e.target.value)}
                    placeholder="Description…"
                    className="w-full rounded-sm border border-zinc-200 bg-white py-1.5 pl-7 pr-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
            </div>
        </div>
    );
};

const ComponentNotesLeftRender = () => {
    return (
        <div className="border-r border-zinc-200 bg-[#f4f4f5]">
            <div className="h-[calc(100vh-60px)] overflow-y-auto bg-white">
                <ComponentNotesLeft />
            </div>
        </div>
    );
};

const ComponentNotesLeftModelRender = () => {
    return (
        <div className="fixed left-0 top-[60px] z-[1001] w-[min(300px,calc(100%-50px))] border-r border-zinc-200 shadow-lg">
            <div className="h-[calc(100vh-60px)] overflow-y-auto bg-white">
                <ComponentNotesLeft />
            </div>
        </div>
    );
};

export { ComponentNotesLeftRender, ComponentNotesLeftModelRender };
