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
        <div className="py-2 border border-gray-200 rounded-sm p-4">

            <h1 className="text-2xl font-bold text-gray-800 my-4">Task Add</h1>

            {/* field -> title */}
            <div className="py-2">
                <label className="block text-sm font-medium text-gray-700">Title *</label>
                <input
                    type="text"
                    value={formDataTaskAdd.taskTitle}
                    className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm p-2"
                    onChange={(e) => setFormDataTaskAdd({ ...formDataTaskAdd, taskTitle: e.target.value })}
                />
            </div>

            {/* field -> taskDatePrefix */}
            <div className="py-2">
                <label className="block text-sm font-medium text-gray-700">Task Date Prefix</label>
                <div className="space-y-2">
                    <div className="flex items-center">
                        <input
                            type="radio"
                            id="noDatePrefix"
                            name="datePrefix"
                            checked={!formDataTaskAdd.taskDatePrefix && !formDataTaskAdd.taskDateTimePrefix}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            onChange={() => setFormDataTaskAdd({ ...formDataTaskAdd, taskDatePrefix: false, taskDateTimePrefix: false })}
                        />
                        <label htmlFor="noDatePrefix" className="ml-2 text-sm text-gray-600">
                            No date prefix
                        </label>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="radio"
                            id="taskDatePrefix"
                            name="datePrefix"
                            checked={formDataTaskAdd.taskDatePrefix}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            onChange={() => setFormDataTaskAdd({ ...formDataTaskAdd, taskDatePrefix: true, taskDateTimePrefix: false })}
                        />
                        <label htmlFor="taskDatePrefix" className="ml-2 text-sm text-gray-600">
                            Date prefix (e.g., "{new Date().toLocaleDateString()} {formDataTaskAdd.taskTitle || 'Take files backup once in a month'}")
                        </label>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="radio"
                            id="taskDateTimePrefix"
                            name="datePrefix"
                            checked={formDataTaskAdd.taskDateTimePrefix}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            onChange={() => setFormDataTaskAdd({ ...formDataTaskAdd, taskDatePrefix: false, taskDateTimePrefix: true })}
                        />
                        <label htmlFor="taskDateTimePrefix" className="ml-2 text-sm text-gray-600">
                            Date and time prefix (e.g., "{new Date().toLocaleString()} {formDataTaskAdd.taskTitle || 'Take files backup once in a month'}")
                        </label>
                    </div>
                </div>
            </div>

            {/* field -> task workspace */}
            <div className="py-2">
                <label className="block text-sm font-medium text-gray-700">Task Workspace *</label>
                <ComponentSelectWorkspace
                    workspaceId={formDataTaskAdd.taskWorkspaceId}
                    setWorkspaceIdFunc={(workspaceId: string) => {
                        setFormDataTaskAdd({ ...formDataTaskAdd, taskWorkspaceId: workspaceId });
                    }}
                />
            </div>

            {/* field -> task status */}
            <div className="py-2">
                <label className="block text-sm font-medium text-gray-700">Task Status *</label>
                <ComponentSelectTaskStatus
                    workspaceId={formDataTaskAdd.taskWorkspaceId}
                    taskStatusId={formDataTaskAdd.taskStatusId}
                    setTaskStatusId={(taskStatusId: string) => {
                        setFormDataTaskAdd({ ...formDataTaskAdd, taskStatusId: taskStatusId });
                    }}
                />
            </div>

            {/* field -> subtask list */}
            <div className="py-2">
                <label className="block text-sm font-medium text-gray-700">Subtask</label>
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
                                className="flex-1 border border-gray-300 rounded-sm px-1 p-1 w-full"
                                placeholder="Enter subtask"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    const newSubtaskList = formDataTaskAdd.subtaskArr.filter((_, i) => i !== index);
                                    setFormDataTaskAdd({ ...formDataTaskAdd, subtaskArr: newSubtaskList });
                                }}
                                className="px-1 py-0.5 bg-red-500 text-white rounded-sm hover:bg-red-600 flex items-center"
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
                        className="px-3 py-1 bg-blue-500 text-white rounded-sm hover:bg-blue-600"
                    >
                        Add Subtask
                    </button>
                </div>
            </div>

            {/* field -> task deadline enabled */}
            <div className="py-2">
                <label className="block text-sm font-medium text-gray-700">Task Deadline Enabled</label>
                <input
                    type="checkbox"
                    id="taskDeadlineEnabled"
                    checked={formDataTaskAdd.taskDeadlineEnabled}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    onChange={(e) => setFormDataTaskAdd({ ...formDataTaskAdd, taskDeadlineEnabled: e.target.checked })}
                />
                <label htmlFor="taskDeadlineEnabled" className="ml-2 text-sm text-gray-600">
                    Task Deadline Enabled
                </label>
            </div>

            {/* field -> deadline */}
            {formDataTaskAdd.taskDeadlineEnabled && (
                <div className="py-2">
                    <label className="block text-sm font-medium text-gray-700">Deadline (number of days)</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={formDataTaskAdd.taskDeadlineDays}
                            onChange={(e) => setFormDataTaskAdd({ ...formDataTaskAdd, taskDeadlineDays: Number(e.target.value) })}
                            className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm p-2"
                        />
                        <label htmlFor="taskDeadlineDays" className="ml-2 text-sm text-gray-600">days</label>
                    </div>
                </div>
            )}

            {/* field -> task ai summary and subtask -> checkbox */}
            <div className="py-2">
                <label className="block text-sm font-medium text-gray-700">Task AI Summary and Subtask</label>
                <input
                    type="checkbox"
                    id="taskAiSummary"
                    checked={formDataTaskAdd.taskAiSummary}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    onChange={(e) => setFormDataTaskAdd({ ...formDataTaskAdd, taskAiSummary: e.target.checked })}
                />
                <label htmlFor="taskAiSummary" className="ml-2 text-sm text-gray-600">
                    Task AI Summary and Subtask
                </label>
            </div>

            {/* field -> task ai context */}
            {formDataTaskAdd.taskAiSummary && (
                <div className="py-2">
                    <label className="block text-sm font-medium text-gray-700">Task AI Context</label>
                    <textarea
                        value={formDataTaskAdd.taskAiContext}
                        className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm p-2 min-h-[100px] resize-vertical"
                        onChange={(e) => setFormDataTaskAdd({ ...formDataTaskAdd, taskAiContext: e.target.value })}
                        placeholder="Enter task AI context..."
                    />
                </div>
            )}


        </div>
    );
};

export default ComponentScheduleTaskAdd;