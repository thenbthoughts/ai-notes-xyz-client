import { LucideEdit, LucideTrash2 } from "lucide-react";
import { ITaskSchedule } from "../../../../../types/pages/tsTaskSchedule";
import { Link } from "react-router-dom";
import axiosCustom from "../../../../../config/axiosCustom";
import { Fragment, useState } from "react";

const ComponentNotesItem = ({
    taskScheduleObj,
}: {
    taskScheduleObj: ITaskSchedule
}) => {
    const [isDeleted, setIsDeleted] = useState(false);

    const deleteItem = async () => {
        try {
            const confirmDelete = window.confirm("Are you sure you want to delete this item?");
            if (!confirmDelete) {
                return;
            }

            const config = {
                method: 'post',
                url: `/api/task-schedule/crud/taskScheduleDelete`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    _id: taskScheduleObj._id,
                },
            };

            await axiosCustom.request(config);

            setIsDeleted(true);
        } catch (error) {
            console.error(error);
        }
    }

    const renderItem = () => {
        return (
            <Fragment>
                {/* title */}
                <h3>{taskScheduleObj.title}</h3>

                {/* actions */}
                <div>
                    <div className="action-buttons my-4">
                        <Link
                            to={`/user/task-schedule?action=edit&id=${taskScheduleObj._id}`}
                            className="px-3 py-1 rounded bg-green-100 text-green-800 text-sm font-semibold hover:bg-green-200 mr-1"
                        >
                            <LucideEdit
                                className="w-4 h-4 inline-block mr-2"
                                style={{ height: '15px', top: '-2px', position: 'relative' }}
                            />
                            Edit
                        </Link>
                        <button
                            className="px-3 py-1 rounded bg-red-100 text-red-800 text-sm font-semibold hover:bg-red-200 mr-1"
                            onClick={deleteItem}
                        >
                            <LucideTrash2
                                className="w-4 h-4 inline-block mr-2"
                                style={{ height: '15px', top: '-2px', position: 'relative' }}
                            />
                            Delete
                        </button>
                    </div>
                </div>
            </Fragment>
        )
    }

    return (
        <div
            className="my-2 py-2 bg-white rounded px-2"
            style={{ borderBottom: '1px solid #ccc' }}
        >
            {isDeleted && (
                <div className="text-red-500 text-sm border border-red-500 p-2 rounded">This item has been deleted.</div>
            )}
            {!isDeleted && (
                <Fragment>
                    {renderItem()}
                </Fragment>
            )}
        </div>
    );
}

export default ComponentNotesItem;