import { Fragment } from "react";
import { IUserNotification } from "../../../../../types/pages/tsUserNotification";
import { LucideTrash } from "lucide-react";
import axiosCustom from "../../../../../config/axiosCustom";
import toast from "react-hot-toast";

const ComponentNotificationItem = ({
    notificationObj,
}: {
    notificationObj: IUserNotification
}) => {

    const handleDelete = async () => {
        try {
            const confirmDelete = window.confirm("Are you sure you want to delete this item?");
            if (!confirmDelete) {
                return;
            }

            const response = await axiosCustom.post('/api/user/notification/userNotificationDelete', {
                recordId: notificationObj._id
            });
            if (response.status === 200) {
                toast.success('Notification deleted successfully!');
            } else {
                toast.error('Failed to delete notification');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete notification');
        }
    }

    const renderItem = () => {
        return (
            <Fragment>
                <div className="mb-1">
                    <h3 className="font-semibold">{notificationObj.subject || '(No Subject)'}</h3>
                    <div className="text-sm text-gray-600">To: {notificationObj.smtpTo || '-'}</div>
                </div>
                <div className="my-1 flex flex-wrap gap-2">
                    <span className="inline-block bg-orange-100 text-orange-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                        Created: {new Date(notificationObj.createdAtUtc).toLocaleString()}
                    </span>
                </div>
                {notificationObj.text && notificationObj.text.length > 0 && (
                    <p className="mb-2 whitespace-pre-wrap border border-gray-200 rounded-sm p-1 text-sm">{notificationObj.text}</p>
                )}
                {notificationObj.html && notificationObj.html.length > 0 && (
                    <p className="mb-2 border border-gray-200 rounded-sm p-1 text-sm">
                        {/* <div dangerouslySetInnerHTML={{ __html: notificationObj.html }} /> */}
                        <iframe
                            style={{ width: '100%', height: 400, border: 0 }}
                            sandbox=""  // keep it isolated; add tokens only if you must
                            srcDoc={`<!doctype html><html><head><meta charset="utf-8"></head><body>${notificationObj.html}</body></html>`}
                        />
                    </p>
                )}

                {/* delete button */}
                <button
                    className="bg-red-100 hover:bg-red-200 text-red-600 px-4 py-1 rounded-sm mt-2 flex items-center gap-2"
                    onClick={handleDelete}
                >
                    <LucideTrash size={16} /> Delete
                </button>
            </Fragment>
        )
    }

    return (
        <div
            className="my-2 py-2 bg-white rounded-sm px-2"
            style={{ borderBottom: '1px solid #ccc' }}
        >
            <Fragment>
                {renderItem()}
            </Fragment>
        </div>
    );
}

export default ComponentNotificationItem;