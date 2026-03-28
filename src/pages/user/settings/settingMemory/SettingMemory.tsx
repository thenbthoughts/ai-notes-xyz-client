import { LucideBrain } from 'lucide-react';
import ComponentMemoryList from './sectionRight/ComponentMemoryList';
import ComponentMemorySettings from './sectionRight/ComponentMemorySettings';

const SettingMemory = () => {

    const renderHeader = () => {
        return (
            <div className="mb-2 bg-gradient-to-r from-purple-50 to-pink-50 p-2 sm:p-3 rounded-md border border-purple-200/80">
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
        <div className="w-full max-w-3xl">
            {renderHeader()}
            <ComponentMemorySettings />
            <ComponentMemoryList />
        </div>
    );
};

export default SettingMemory;
