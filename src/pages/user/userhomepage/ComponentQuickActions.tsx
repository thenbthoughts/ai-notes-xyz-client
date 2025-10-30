import { LucideZap, LucideChevronUp, LucideChevronDown, LucideFileText, LucideListTodo } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useState } from 'react';
import { notesQuickDailyNotesAddAxios, notesQuickTaskAddAxios } from '../features/Notes/utils/notesListAxios';
import toast from 'react-hot-toast';


const QuickActionsComponent = () => {
    const [isActionsExpanded, setIsActionsExpanded] = useState(true);

    const navigate = useNavigate();

    const notesQuickDailyNotesAddAxiosLocal = async () => {
        const result = await notesQuickDailyNotesAddAxios();
        if (result.success.length > 0) {
            toast.success('Quick Daily Notes added successfully');
            navigate(`/user/notes?action=edit&id=${result.recordId}&workspace=${result.workspaceId}`)
        } else {
            toast.error(result.error);
        }
    }

    const notesQuickTaskAddAxiosLocal = async () => {
        const result = await notesQuickTaskAddAxios();
        if (result.success.length > 0) {
            toast.success('Quick Task added successfully');
            navigate(`/user/task?workspace=${result.workspaceId}&edit-task-id=${result.recordId}`)
        } else {
            toast.error(result.error);
        }
    }

    return (
        <div className="text-left p-3 border border-amber-400 rounded-sm shadow-md bg-gradient-to-r from-amber-100 to-amber-300 mb-2 hover:bg-amber-200 transition duration-300">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold text-amber-800">
                    <LucideZap size={20} className="inline mr-1" style={{ position: 'relative', top: '-2px' }} />
                    Quick Actions
                </h2>
                <button
                    onClick={() => setIsActionsExpanded(!isActionsExpanded)}
                    className="p-1 rounded-sm bg-white bg-opacity-50 hover:bg-opacity-70 transition duration-200"
                    title="Toggle Expand"
                >
                    {isActionsExpanded ?
                        <LucideChevronUp size={16} className="text-amber-600" /> :
                        <LucideChevronDown size={16} className="text-amber-600" />
                    }
                </button>
            </div>

            {isActionsExpanded && (
                <div className="space-y-2">
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => {
                                notesQuickDailyNotesAddAxiosLocal();
                            }}
                            className="flex items-center px-3 py-1 bg-white bg-opacity-70 rounded-sm text-xs font-medium text-amber-700 hover:bg-opacity-90 transition duration-200 transform hover:scale-105"
                        >
                            <LucideFileText size={14} className="mr-1" />
                            Quick Daily Notes
                        </button>
                        <button
                            onClick={() => {
                                notesQuickTaskAddAxiosLocal();
                            }}
                            className="flex items-center px-3 py-1 bg-white bg-opacity-70 rounded-sm text-xs font-medium text-amber-700 hover:bg-opacity-90 transition duration-200 transform hover:scale-105"
                        >
                            <LucideListTodo size={14} className="mr-1" />
                            Quick Daily Task
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuickActionsComponent;