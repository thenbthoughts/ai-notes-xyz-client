import SettingHeader from "../SettingHeader";
import { LucideBrain } from 'lucide-react';
import ComponentMemoryList from './sectionRight/ComponentMemoryList';
import ComponentMemorySettings from './sectionRight/ComponentMemorySettings';

const SettingMemory = () => {

    const renderHeader = () => {
        return (
            <div className="mb-3 bg-gradient-to-r from-purple-50 to-pink-50 p-3 sm:p-4 rounded-sm border border-purple-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1 bg-purple-100 rounded-sm">
                        <LucideBrain className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Memory Management</h1>
                </div>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Manage your short-term memories. These are facts and insights extracted from your conversations. 
                    You can create, edit, and protect important memories. Protected memories cannot be deleted and do not count towards your memory limit. 
                    Only unprotected memories count towards the limit.
                </p>
            </div>
        );
    }

    return (
        <div className='container mx-auto px-1'>
            <div
                className="w-full max-w-[800px] px-2 sm:px-4 md:px-6 py-2 sm:py-4 mx-auto"
            >
                <SettingHeader />

                {renderHeader()}

                <ComponentMemorySettings />

                <ComponentMemoryList />
            </div>
        </div>
    );
};

export default SettingMemory;
