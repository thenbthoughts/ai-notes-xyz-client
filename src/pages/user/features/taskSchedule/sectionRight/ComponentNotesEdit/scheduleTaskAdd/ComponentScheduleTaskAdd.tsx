import { ITaskScheduleTaskAdd } from '../../../../../../../types/pages/tsTaskSchedule.ts';
import ComponentSelectTaskStatus from './ComponentSelectTaskStatus.tsx';
import ComponentSelectWorkspace from './ComponentSelectWorkspace.tsx';
import { LucideTrash2 } from 'lucide-react';



const ComponentScheduleTaskAdd = ({
    formDataTaskAdd,
    setFormDataTaskAdd,
}: {
    formDataTaskAdd: ITaskScheduleTaskAdd;
    setFormDataTaskAdd: React.Dispatch<React.SetStateAction<ITaskScheduleTaskAdd>>;
}) => {

    return (
        <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-3 sm:p-4">

            <h2 className="my-2 text-lg font-semibold tracking-tight text-zinc-900 sm:my-3 sm:text-xl">Task Add</h2>

            {/* field -> title */}
            <div className="py-1.5 sm:py-2">
                <label className="block text-sm font-medium text-zinc-800">Title *</label>
                <input
                    type="text"
                    value={formDataTaskAdd.taskTitle}
                    className="mt-1 block w-full rounded-lg border border-zinc-200/90 bg-white p-2 text-sm text-zinc-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
                    onChange={(e) => setFormDataTaskAdd({ ...formDataTaskAdd, taskTitle: e.target.value })}
                />
            </div>

            {/* field -> taskDatePrefix */}
            <div className="py-1.5 sm:py-2">
                <label className="block text-sm font-medium text-zinc-800">Task Date Prefix</label>
                <div className="space-y-2">
                    <div className="flex items-center">
                        <input
                            type="radio"
                            id="noDatePrefix"
                            name="datePrefix"
                            checked={!formDataTaskAdd.taskDatePrefix && !formDataTaskAdd.taskDateTimePrefix}
                            className="h-4 w-4 border-zinc-300 text-indigo-600 focus:ring-indigo-500/25"
                            onChange={() => setFormDataTaskAdd({ ...formDataTaskAdd, taskDatePrefix: false, taskDateTimePrefix: false })}
                        />
                        <label htmlFor="noDatePrefix" className="ml-2 text-sm text-zinc-600">
                            No date prefix
                        </label>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="radio"
                            id="taskDatePrefix"
                            name="datePrefix"
                            checked={formDataTaskAdd.taskDatePrefix}
                            className="h-4 w-4 border-zinc-300 text-indigo-600 focus:ring-indigo-500/25"
                            onChange={() => setFormDataTaskAdd({ ...formDataTaskAdd, taskDatePrefix: true, taskDateTimePrefix: false })}
                        />
                        <label htmlFor="taskDatePrefix" className="ml-2 text-sm text-zinc-600">
                            Date prefix (e.g., "{new Date().toLocaleDateString()} {formDataTaskAdd.taskTitle || 'Take files backup once in a month'}")
                        </label>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="radio"
                            id="taskDateTimePrefix"
                            name="datePrefix"
                            checked={formDataTaskAdd.taskDateTimePrefix}
                            className="h-4 w-4 border-zinc-300 text-indigo-600 focus:ring-indigo-500/25"
                            onChange={() => setFormDataTaskAdd({ ...formDataTaskAdd, taskDatePrefix: false, taskDateTimePrefix: true })}
                        />
                        <label htmlFor="taskDateTimePrefix" className="ml-2 text-sm text-zinc-600">
                            Date and time prefix (e.g., "{new Date().toLocaleString()} {formDataTaskAdd.taskTitle || 'Take files backup once in a month'}")
                        </label>
                    </div>
                </div>
            </div>

            {/* field -> task workspace */}
            <div className="py-1.5 sm:py-2">
                <label className="block text-sm font-medium text-zinc-800">Task Workspace *</label>
                <ComponentSelectWorkspace
                    workspaceId={formDataTaskAdd.taskWorkspaceId}
                    setWorkspaceIdFunc={(workspaceId: string) => {
                        setFormDataTaskAdd({ ...formDataTaskAdd, taskWorkspaceId: workspaceId });
                    }}
                />
            </div>

            {/* field -> task status */}
            <div className="py-1.5 sm:py-2">
                <label className="block text-sm font-medium text-zinc-800">Task Status *</label>
                <ComponentSelectTaskStatus
                    workspaceId={formDataTaskAdd.taskWorkspaceId}
                    taskStatusId={formDataTaskAdd.taskStatusId}
                    setTaskStatusId={(taskStatusId: string) => {
                        setFormDataTaskAdd({ ...formDataTaskAdd, taskStatusId: taskStatusId });
                    }}
                />
            </div>

            {/* field -> subtask list */}
            <div className="py-1.5 sm:py-2">
                <label className="block text-sm font-medium text-zinc-800">Subtask</label>
                <div className="space-y-2">
                    {formDataTaskAdd.subtaskArr.map((subtask, index) => (
                        <div key={index} className="flex items-center gap-1 rounded">
                            <textarea
                                value={subtask}
                                onChange={(e) => {
                                    const newSubtaskList = [...formDataTaskAdd.subtaskArr];
                                    newSubtaskList[index] = e.target.value;
                                    setFormDataTaskAdd({ ...formDataTaskAdd, subtaskArr: newSubtaskList });
                                }}
                                className="w-full flex-1 rounded-lg border border-zinc-200/90 bg-white p-1.5 text-sm text-zinc-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
                                placeholder="Enter subtask"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    const newSubtaskList = formDataTaskAdd.subtaskArr.filter((_, i) => i !== index);
                                    setFormDataTaskAdd({ ...formDataTaskAdd, subtaskArr: newSubtaskList });
                                }}
                                className="flex shrink-0 items-center rounded-lg bg-red-600 px-1.5 py-1 text-white hover:bg-red-500"
                            >
                                <LucideTrash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => {
                            setFormDataTaskAdd({
                                ...formDataTaskAdd,
                                subtaskArr: [...formDataTaskAdd.subtaskArr, '']
                            });
                        }}
                        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
                    >
                        Add Subtask
                    </button>
                </div>
            </div>

            {/* field -> task deadline enabled */}
            <div className="py-1.5 sm:py-2">
                <label className="block text-sm font-medium text-zinc-800">Task Deadline Enabled</label>
                <input
                    type="checkbox"
                    id="taskDeadlineEnabled"
                    checked={formDataTaskAdd.taskDeadlineEnabled}
                    className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500/25"
                    onChange={(e) => setFormDataTaskAdd({ ...formDataTaskAdd, taskDeadlineEnabled: e.target.checked })}
                />
                <label htmlFor="taskDeadlineEnabled" className="ml-2 text-sm text-zinc-600">
                    Task Deadline Enabled
                </label>
            </div>

            {/* field -> deadline */}
            {formDataTaskAdd.taskDeadlineEnabled && (
                <div className="py-1.5 sm:py-2">
                    <label className="block text-sm font-medium text-zinc-800">Deadline (number of days)</label>
                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            type="number"
                            value={formDataTaskAdd.taskDeadlineDays}
                            onChange={(e) => setFormDataTaskAdd({ ...formDataTaskAdd, taskDeadlineDays: Number(e.target.value) })}
                            className="mt-1 block w-full min-w-[6rem] rounded-lg border border-zinc-200/90 bg-white p-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 sm:max-w-xs"
                        />
                        <label htmlFor="taskDeadlineDays" className="ml-0 text-sm text-zinc-600 sm:ml-2">days</label>
                    </div>
                </div>
            )}

            {/* field -> task ai summary and subtask -> checkbox */}
            <div className="py-1.5 sm:py-2">
                <label className="block text-sm font-medium text-zinc-800">Task AI Summary and Subtask</label>
                <input
                    type="checkbox"
                    id="taskAiSummary"
                    checked={formDataTaskAdd.taskAiSummary}
                    className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500/25"
                    onChange={(e) => setFormDataTaskAdd({ ...formDataTaskAdd, taskAiSummary: e.target.checked })}
                />
                <label htmlFor="taskAiSummary" className="ml-2 text-sm text-zinc-600">
                    Task AI Summary and Subtask
                </label>
            </div>

            {/* field -> task ai context */}
            {formDataTaskAdd.taskAiSummary && (
                <div className="py-1.5 sm:py-2">
                    <label className="block text-sm font-medium text-zinc-800">Task AI Context</label>
                    <textarea
                        value={formDataTaskAdd.taskAiContext}
                        className="mt-1 block min-h-[100px] w-full resize-y rounded-lg border border-zinc-200/90 bg-white p-2 text-sm text-zinc-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
                        onChange={(e) => setFormDataTaskAdd({ ...formDataTaskAdd, taskAiContext: e.target.value })}
                        placeholder="Enter task AI context..."
                    />
                </div>
            )}


        </div>
    );
};

export default ComponentScheduleTaskAdd;