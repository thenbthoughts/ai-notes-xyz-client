import { useState, useEffect } from "react";
import { LucideList, LucideCheck, LucidePlus, LucideChevronRight, LucideChevronLeft, LucidePin } from 'lucide-react';
import { Link } from "react-router-dom";

import axiosCustom from "../../../config/axiosCustom";
import { tsPageTask } from "../../../types/pages/tsPageTaskList";

const ComponentPinnedTask = () => {
    const [taskArr, setTaskArr] = useState([] as tsPageTask[]);
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);

    useEffect(() => {
        fetchHomepageTask();
    }, [])

    const fetchHomepageTask = async () => {
        try {
            const response = await axiosCustom.get(
                `/api/dashboard/suggest-tasks/task-get-suggestions`,
            );
            const taskArr = response.data.docs;
            setTaskArr(taskArr as tsPageTask[]);
        } catch (error) {
            console.error("Error fetching homepage task:", error);
        }
    };

    return (
        <div>
            {taskArr.length > 0 && (
                <div className="text-left p-2 border border-purple-400 rounded-md shadow-md bg-gradient-to-r from-purple-100 to-purple-300 mb-2 hover:bg-purple-200 transition duration-300">
                    <h2 className="text-lg font-bold mb-0 text-purple-800">
                        <Link to="/user/task">
                            <LucideList size={20} className="inline mr-1" style={{ position: 'relative', top: '-2px' }} />
                            Pinned Task
                        </Link>
                    </h2>
                    <div>
                        <div className="flex items-center gap-2 mb-2 pt-2">
                            <button
                                className="p-1 border border-purple-400 rounded bg-purple-100 hover:bg-purple-200 transition duration-200"
                                title="Add Task"
                                onClick={() => {
                                    console.log("Add Task");
                                }}
                            >
                                <LucidePlus size={16} className="text-purple-600" />
                            </button>
                            <button className="p-1 border border-purple-400 rounded bg-purple-100 hover:bg-purple-200 transition duration-200" title="Mark Completed">
                                <LucideCheck size={16} className="text-purple-600" />
                            </button>
                            <button
                                className="p-1 border border-purple-400 rounded bg-purple-100 hover:bg-purple-200 transition duration-200" title="Previous Task"
                                disabled={currentTaskIndex <= 0}
                                onClick={() => {
                                    setCurrentTaskIndex(currentTaskIndex - 1);
                                }}
                            >
                                <LucideChevronLeft size={16} className="text-purple-600" />
                            </button>
                            <span className="px-2 py-1 text-xs font-medium text-purple-700 bg-purple-50 rounded border border-purple-300">
                                {taskArr.length > 0 ? `${currentTaskIndex + 1} / ${taskArr.length}` : '0 / 0'}
                            </span>
                            <button
                                className="p-1 border border-purple-400 rounded bg-purple-100 hover:bg-purple-200 transition duration-200"
                                title="Next Task"
                                disabled={currentTaskIndex >= taskArr.length - 1}
                                onClick={() => {
                                    setCurrentTaskIndex(currentTaskIndex + 1);
                                }}
                            >
                                <LucideChevronRight size={16} className="text-purple-600" />
                            </button>
                        </div>
                    </div>
                    {taskArr.length > 0 && (
                        <div>
                            <p className="text-sm font-semibold text-purple-700">
                                {taskArr[currentTaskIndex]?.isTaskPinned && (
                                    <LucidePin size={20} className="inline mr-1" style={{ position: 'relative', top: '-2px' }} />
                                )}
                                {taskArr[currentTaskIndex]?.title}
                            </p>
                            {/* TODO sub task list */}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ComponentPinnedTask;