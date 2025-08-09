import { ITaskScheduleTaskAdd } from '../../../../../../types/pages/tsTaskSchedule.ts';

const ComponentScheduleTaskAdd = ({
    formDataTaskAdd,
    setFormDataTaskAdd,
}: {
    formDataTaskAdd: ITaskScheduleTaskAdd;
    setFormDataTaskAdd: React.Dispatch<React.SetStateAction<ITaskScheduleTaskAdd>>;
}) => {

    return (
        <div className="py-2 border border-gray-200 rounded-lg p-4">

            <h1 className="text-2xl font-bold text-gray-800 my-4">Task Add</h1>

            {/* field -> title */}
            <div className="py-2">
                <label className="block text-sm font-medium text-gray-700">Title *</label>
                <input
                    type="text"
                    value={formDataTaskAdd.taskTitle}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    onChange={(e) => setFormDataTaskAdd({ ...formDataTaskAdd, taskTitle: e.target.value })}
                />
            </div>

            {/* field -> taskDatePrefix */}
            <div className="py-2">
                <label className="block text-sm font-medium text-gray-700">Task Date Prefix</label>
                <input
                    type="checkbox"
                    id="taskDatePrefix"
                    checked={formDataTaskAdd.taskDatePrefix}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    onChange={(e) => setFormDataTaskAdd({ ...formDataTaskAdd, taskDatePrefix: e.target.checked })}
                />
                <label htmlFor="taskDatePrefix" className="ml-2 text-sm text-gray-600">
                    Include date prefix in task title (e.g., "2025-08-09 Take files backup once in a month")
                </label>
            </div>

            {/* field -> deadline */}
            <div className="py-2">
                <label className="block text-sm font-medium text-gray-700">Deadline</label>
                <input
                    type="datetime-local"
                    value={formDataTaskAdd.taskDeadline ? formDataTaskAdd.taskDeadline : new Date().toISOString().slice(0, 16)}
                    onChange={(e) => setFormDataTaskAdd({ ...formDataTaskAdd, taskDeadline: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
            </div>

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
            <div className="py-2">
                <label className="block text-sm font-medium text-gray-700">Task AI Context</label>
                <textarea
                    value={formDataTaskAdd.taskAiContext}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 min-h-[100px] resize-vertical"
                    onChange={(e) => setFormDataTaskAdd({ ...formDataTaskAdd, taskAiContext: e.target.value })}
                    placeholder="Enter task AI context..."
                />
            </div>


        </div>
    );
};

export default ComponentScheduleTaskAdd;