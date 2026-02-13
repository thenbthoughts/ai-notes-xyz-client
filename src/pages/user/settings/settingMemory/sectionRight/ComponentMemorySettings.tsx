import { useState, useEffect } from 'react';
import axiosCustom from '../../../../../config/axiosCustom';
import toast from 'react-hot-toast';
import { AxiosRequestConfig } from 'axios';

const ComponentMemorySettings = () => {
    const [userMemoriesLimit, setUserMemoriesLimit] = useState<number>(15);
    const [isStoreUserMemoriesEnabled, setIsStoreUserMemoriesEnabled] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchCurrentSettings();
    }, []);

    const fetchCurrentSettings = async () => {
        setIsLoading(true);
        try {
            const response = await axiosCustom.post('/api/user/crud/getUser');
            if (response.data) {
                if (typeof response.data.userMemoriesLimit === 'number') {
                    setUserMemoriesLimit(response.data.userMemoriesLimit);
                }
                if (typeof response.data.isStoreUserMemoriesEnabled === 'boolean') {
                    setIsStoreUserMemoriesEnabled(response.data.isStoreUserMemoriesEnabled);
                }
            }
        } catch (error) {
            console.error('Error fetching memory settings:', error);
            toast.error('Failed to load memory settings');
        } finally {
            setIsLoading(false);
        }
    };

    const saveSettings = async () => {
        if (userMemoriesLimit < 0 || userMemoriesLimit > 100) {
            toast.error('User memories limit must be between 0 and 100');
            return;
        }

        setIsSaving(true);
        try {
            const config = {
                method: 'post',
                url: '/api/user/crud/updateUser',
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    isStoreUserMemoriesEnabled: isStoreUserMemoriesEnabled,
                    userMemoriesLimit: userMemoriesLimit,
                },
            } as AxiosRequestConfig;

            await axiosCustom.request(config);
            toast.success('Memory settings updated successfully!');
        } catch (error: any) {
            console.error('Error updating memory settings:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update memory settings';
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-sm p-6 border border-gray-200 shadow-sm">
                <div className="text-center py-4">
                    <div className="text-gray-500">Loading memory settings...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-sm p-6 border border-gray-200 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-sm flex items-center justify-center">
                    <span className="text-white text-sm font-bold">⚙️</span>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Memory Settings</h2>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Store User Memories
                        <span className="text-xs text-gray-500 ml-2">
                            (Enable/disable memory storage and usage)
                        </span>
                    </label>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={isStoreUserMemoriesEnabled}
                            onChange={(e) => setIsStoreUserMemoriesEnabled(e.target.checked)}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Enable memory storage and usage in conversations</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                        When enabled, the system will store and use your memories to provide more personalized AI responses.
                    </p>
                </div>

                {isStoreUserMemoriesEnabled && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            User Memories Limit
                            <span className="text-xs text-gray-500 ml-2">
                                (Maximum memories to include in AI conversations)
                            </span>
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={userMemoriesLimit}
                            onChange={(e) => setUserMemoriesLimit(parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="15"
                        />
                        <p className="mt-2 text-sm text-gray-600">
                            Set the maximum number of memories that will be included when AI generates responses.
                            Default is 25. Protected memories don't count toward this limit.
                        </p>
                    </div>
                )}

                <div className="flex justify-end">
                    <button
                        onClick={saveSettings}
                        disabled={isSaving}
                        className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white rounded-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isSaving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ComponentMemorySettings;