import { LucideSettings, LucideX } from "lucide-react";
import { useState } from "react";
import axiosCustom from "../../../../../../config/axiosCustom";
import { AxiosRequestConfig } from "axios";
import { toast } from "react-hot-toast";
// import ThreadSettingContextSelected from "./ThreadSettingContextSelected";
import ThreadSettingContextSelectNotes from "./ThreadSettingContextSelectNotes";

const ThreadSetting = ({
    closeModal,
    threadSetting,
    doesThreadExist,
}: {
    closeModal: () => void;
    threadSetting: any;
    doesThreadExist: boolean;
}) => {

    const [formData, setFormData] = useState({
        threadTitle: threadSetting.threadTitle,
        isAutoAiContextSelectEnabled: threadSetting.isAutoAiContextSelectEnabled,
        isPersonalContextEnabled: threadSetting.isPersonalContextEnabled,
    });

    const [requestEdit, setRequestEdit] = useState({
        loading: false,
        success: '',
        error: '',
    });

    const editRecord = async () => {
        setRequestEdit({
            loading: true,
            success: '',
            error: '',
        });
        try {
            const config = {
                method: 'post',
                url: `/api/chat-llm/threads-crud/threadsEditById`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    ...formData,
                    threadId: threadSetting._id,
                },
            } as AxiosRequestConfig;

            await axiosCustom.request(config);

            setRequestEdit({
                loading: false,
                success: 'done',
                error: '',
            });
            toast.success('Chat thread updated successfully!');
        } catch (error) {
            console.error(error);
            toast.error('An error occurred while trying to edit the chat thread. Please try again later.')
            setRequestEdit({
                loading: false,
                success: '',
                error: 'An error occurred while trying to edit the life event. Please try again later.',
            });
        }
    }

    const renderMain = () => {
        return (
            <div className="p-2 lg:p-4">

                {/* Thread Setting */}
                <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <LucideSettings className="w-4 h-4 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Chat Settings
                        </h1>
                    </div>
                    <button
                        onClick={closeModal}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 group"
                        aria-label="Close settings"
                    >
                        <LucideX className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors duration-200" />
                    </button>
                </div>

                {/* line */}
                <div className="h-px bg-gray-200 my-2"></div>

                {/* field -> threadTitle */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Title *</label>
                    <input
                        type="text"
                        value={formData.threadTitle}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        onChange={(e) => setFormData({ ...formData, threadTitle: e.target.value })}
                    />
                </div>

                {/* field -> isPersonalContextEnabled */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Personal Context</label>
                    <div
                        onClick={() => {
                            setFormData({ ...formData, isPersonalContextEnabled: !formData.isPersonalContextEnabled });
                        }}
                    >
                        <input
                            type="checkbox"
                            className="mt-1 rounded-md p-2 mr-2"
                            checked={formData.isPersonalContextEnabled}
                        />
                        <span className="text-sm text-gray-700 cursor-pointer">Personal Context Enable</span>
                    </div>
                </div>

                {/* field -> isAutoAiContextSelectEnabled */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Auto AI Context</label>
                    <div
                        onClick={() => {
                            setFormData({ ...formData, isAutoAiContextSelectEnabled: !formData.isAutoAiContextSelectEnabled });
                        }}
                    >
                        <input
                            type="checkbox"
                            className="mt-1 rounded-md p-2 mr-2"
                            checked={formData.isAutoAiContextSelectEnabled}
                        />
                        <span className="text-sm text-gray-700 cursor-pointer">Auto AI Context Enable</span>
                    </div>
                </div>

                {/* field -> notes list */}
                {/*
                // TODO: pending
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Context Selected:</label>
                    <div>
                        <ThreadSettingContextSelected
                            threadId={threadSetting._id}
                        />
                    </div>
                </div>
                */}

                {/* field -> notes list */}
                <ThreadSettingContextSelectNotes
                    threadId={threadSetting._id}
                />


                {/* button -> save */}
                <div className="flex justify-end">
                    {requestEdit.loading && (
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded-md"
                        >Saving...</button>
                    )}
                    {!requestEdit.loading && (
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded-md"
                            onClick={() => {
                                editRecord();
                            }}
                        >Save</button>
                    )}
                </div>

            </div>
        )
    }

    return (
        <div
            className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded p-2 h-full"
            style={{
                overflowY: 'auto',
            }}
        >

            {doesThreadExist ? (
                <div>
                    {renderMain()}
                </div>
            ) : (
                <div>
                    <p>Chat Thread does not exist</p>
                </div>
            )}
        </div>
    )
}

export default ThreadSetting;