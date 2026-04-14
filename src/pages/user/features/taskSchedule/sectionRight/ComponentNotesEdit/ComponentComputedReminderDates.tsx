import { useMemo } from 'react';
import { REMINDER_LABEL_TO_MS } from '../../../../../../constants/reminderLabelToMsArr.ts';

const ComponentComputedReminderDates = ({
    dueDateInput,
}: {
    dueDateInput: string;
}) => {
    const computedDueReminderDates = useMemo(() => {
        if (!dueDateInput || dueDateInput.trim() === '') {
            return [];
        }
        const dueDate = new Date(dueDateInput);
        const dueMs = dueDate.valueOf();
        if (Number.isNaN(dueMs)) {
            return [];
        }
        const out = REMINDER_LABEL_TO_MS.map((item) => new Date(dueMs - item.subTime).toISOString());
        return [...new Set(out)].sort();
    }, [dueDateInput]);

    return (
        <div className="mt-3">
            <div className="mb-1.5 text-sm font-medium text-zinc-800 sm:mb-2">Computed reminder dates</div>
            <div className="max-h-[160px] overflow-y-auto rounded-xl border border-zinc-200/80 bg-white p-2 text-xs sm:p-2.5 [scrollbar-width:thin]">
                {computedDueReminderDates.length === 0 ? (
                    <div className="italic text-zinc-500">
                        Select due date and reminder presets to see computed dates.
                    </div>
                ) : (
                    <div className="space-y-1">
                        {computedDueReminderDates.map((time, index) => (
                            <div key={time} className="text-zinc-700">
                                {index + 1}: {new Date(time).toLocaleString()}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComponentComputedReminderDates;
