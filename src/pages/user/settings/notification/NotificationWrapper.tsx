import ComponentNotificationList from './sectionRight/ComponentNotificationList.tsx';

import { LucideBell } from 'lucide-react';

const NotificationWrapper = () => {

    const renderHeader = () => {
        return (
            <div className="mb-2 bg-gradient-to-r from-blue-50 to-indigo-50 p-2 sm:p-3 rounded-md border border-blue-200/80">
                <div className="flex items-center gap-2 mb-1">
                    <div className="p-1 bg-blue-100 rounded-sm">
                        <LucideBell className="w-4 h-4 text-blue-600" />
                    </div>
                    <h1 className="text-lg font-semibold text-gray-800 sm:text-xl">Notifications</h1>
                </div>
                <p className="text-gray-600 leading-relaxed">
                    View and manage your notification history. Here you can see all notifications that have been sent to you, including system alerts, updates, and important messages.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-3xl">
            {renderHeader()}
            <ComponentNotificationList />
        </div>
    );
};

export default NotificationWrapper;