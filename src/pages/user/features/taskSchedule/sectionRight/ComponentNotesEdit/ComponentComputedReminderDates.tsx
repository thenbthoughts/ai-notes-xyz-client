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
            <div className="text-sm font-medium text-gray-700 mb-2">Computed reminder dates</div>
            <div className="max-h-[160px] overflow-y-auto rounded-sm border border-gray-200 bg-white p-2">
                {computedDueReminderDates.length === 0 ? (
                    <div className="text-xs italic text-gray-500">
                        Select due date and reminder presets to see computed dates.
                    </div>
                ) : (
                    <div className="space-y-1">
                        {computedDueReminderDates.map((time, index) => (
                            <div key={time} className="text-xs text-gray-700">
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

