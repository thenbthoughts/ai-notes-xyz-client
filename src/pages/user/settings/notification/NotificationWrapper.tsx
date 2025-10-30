import ComponentNotificationList from './sectionRight/ComponentNotificationList.tsx';

import SettingHeader from "../SettingHeader";
import { LucideBell } from 'lucide-react';

const NotificationWrapper = () => {

    const renderHeader = () => {
        return (
            <div className="mb-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-sm border border-blue-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1 bg-blue-100 rounded-sm">
                        <LucideBell className="w-4 h-4 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
                </div>
                <p className="text-gray-600 leading-relaxed">
                    View and manage your notification history. Here you can see all notifications that have been sent to you, including system alerts, updates, and important messages.
                </p>
            </div>
        );
    }

    return (
        <div className='container mx-auto px-1'>
            <div
                style={{
                    width: '800px',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    margin: '0 auto'
                }}
            >
                <SettingHeader />

                {renderHeader()}

                <ComponentNotificationList />
            </div>
        </div>
    );
};

export default NotificationWrapper;