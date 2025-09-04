import React, { useState, useEffect } from 'react';
import Select from "react-select";
import axiosCustom from '../../../../../../../config/axiosCustom';
import { ISendMyselfEmailForm } from '../../../../../../../types/pages/tsTaskSchedule';
import { tsSchemaAiModelListGroq } from '../../../../../../../types/pages/settings/dataModelGroq';
import { tsSchemaAiModelListOpenrouter } from '../../../../../../../types/pages/settings/dataModelOpenrouter';

const SelectAiModelOpenrouter = ({
    aiModelName,
    setAiModelName,
    selectRandomModel,
}: {
    aiModelName: string;
    setAiModelName: (value: string) => void;
    selectRandomModel: number;
}) => {
    const [modelArr, setModelArr] = useState([] as tsSchemaAiModelListOpenrouter[]);
    const [isLoadingModel, setIsLoadingModel] = useState(true);

    useEffect(() => {
        const fetchModelData = async () => {
            try {
                setIsLoadingModel(true);
                const response = await axiosCustom.get('/api/dynamic-data/model-openrouter/modelOpenrouterGet');

                if (response.data.docs && response.data.docs.length > 0) {

                    let tempModelArr = response.data.docs as {
                        id: string;
                        name: string;
                        description: string;
                    }[];

                    tempModelArr = tempModelArr.map((model) => ({
                        id: model.id,
                        name: `${model.name} (${model.id})`,
                        description: model.description,
                    })).sort((a, b) => a.name.localeCompare(b.name));

                    // if aiModelName is empty, select a random model
                    if (aiModelName === '') {
                        if (tempModelArr.length > 0) {
                            setAiModelName(tempModelArr[0].id);
                        }
                    }

                    setModelArr(tempModelArr);
                }
            } catch (error) {
                console.error('Error fetching model data:', error);
                // Keep default model if API fails
            } finally {
                setIsLoadingModel(false);
            }
        };
        fetchModelData();
    }, []);

    useEffect(() => {
        if (selectRandomModel >= 1) {
            if (modelArr.length > 0) {
                const randomModel = modelArr[Math.floor(Math.random() * modelArr.length)];
                setAiModelName(randomModel.id);
            }
        }
    }, [selectRandomModel]);

    useEffect(() => {
        if (aiModelName === '') {
            if (modelArr.length > 0) {
                setAiModelName(modelArr[0].id);
            }
        }
    }, [aiModelName]);

    return (
        <div className="mb-2">
            <Select<{ value: string; label: string }>
                value={aiModelName ? { value: aiModelName, label: modelArr.find(model => model.id === aiModelName)?.name || "" } : undefined}
                onChange={(selectedOption: { value: string; label: string } | null) => {
                    if (selectedOption) {
                        setAiModelName(selectedOption.value);
                    }
                }}
                options={
                    modelArr.map((model: any) => ({
                        value: model.id,
                        label: `${model.name} (${model.id})`
                    }))
                }

                placeholder="Select a model..."
                isLoading={isLoadingModel}
                isSearchable={true}
            />
        </div>
    )
}

const SelectAiModelGroq = ({
    aiModelName,
    setAiModelName,
    selectRandomModel,
}: {
    aiModelName: string;
    setAiModelName: (value: string) => void;
    selectRandomModel: number;
}) => {
    const [modelArr, setModelArr] = useState([] as tsSchemaAiModelListGroq[]);
    const [isLoadingModel, setIsLoadingModel] = useState(true);

    useEffect(() => {
        const fetchModelData = async () => {
            setIsLoadingModel(true);
            const response = await axiosCustom.get('/api/dynamic-data/model-groq/modelGroqGet');
            setModelArr(response.data.docs);

            // if aiModelName is empty, select a random model
            if (aiModelName === '') {
                if (modelArr.length > 0) {
                    setAiModelName(modelArr[0].id);
                }
            }

            setIsLoadingModel(false);
        }
        fetchModelData();
    }, []);

    useEffect(() => {
        if (selectRandomModel >= 1) {
            if (modelArr.length > 0) {
                const randomModel = modelArr[Math.floor(Math.random() * modelArr.length)];
                setAiModelName(randomModel.id);
            }
        }
    }, [selectRandomModel]);

    useEffect(() => {
        if (aiModelName === '') {
            if (modelArr.length > 0) {
                setAiModelName(modelArr[0].id);
            }
        }
    }, [aiModelName]);

    return (
        <div className="mb-2">
            <Select<{ value: string; label: string }>
                value={aiModelName ? { value: aiModelName, label: modelArr.find(model => model.id === aiModelName)?.id || "" } : undefined}
                onChange={(selectedOption: { value: string; label: string } | null) => {
                    if (selectedOption) {
                        setAiModelName(selectedOption.value);
                    }
                }}
                options={
                    modelArr.map((model: any) => ({
                        value: model.id,
                        label: `${model.owned_by} - ${model.id}`
                    }))
                }

                placeholder="Select a model..."
                isLoading={isLoadingModel}
                isSearchable={true}
            />
        </div>
    )
}

const ComponentScheduleSendMyselfEmail = ({
    formDataSendMyselfEmail,
    setFormDataSendMyselfEmail,
}: {
    formDataSendMyselfEmail: ISendMyselfEmailForm;
    setFormDataSendMyselfEmail: React.Dispatch<React.SetStateAction<ISendMyselfEmailForm>>;
}) => {
    const [selectRandomModel, setSelectRandomModel] = useState(0);

    const handleAiModelNameChange = (value: string) => {
        setFormDataSendMyselfEmail({ ...formDataSendMyselfEmail, aiModelName: value });
    };

    return (
        <div className="py-2 border border-gray-200 rounded-lg p-4">

            <h1 className="text-2xl font-bold text-gray-800 my-4">Send Myself Email</h1>

            {/* field -> email subject */}
            <div className="py-2">
                <label className="block text-sm font-medium text-gray-700">Email Subject *</label>
                <input
                    type="text"
                    value={formDataSendMyselfEmail.emailSubject}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    onChange={(e) => setFormDataSendMyselfEmail({ ...formDataSendMyselfEmail, emailSubject: e.target.value })}
                    placeholder="Enter email subject"
                />
            </div>

            {/* field -> email content */}
            <div className="py-2">
                <label className="block text-sm font-medium text-gray-700">Email Content</label>
                <textarea
                    value={formDataSendMyselfEmail.emailContent}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 min-h-[100px] resize-vertical"
                    onChange={(e) => setFormDataSendMyselfEmail({ ...formDataSendMyselfEmail, emailContent: e.target.value })}
                    placeholder="Enter email content..."
                />
            </div>

            {/* field -> ai enabled */}
            <div className="py-2">
                <label className="block text-sm font-medium text-gray-700">AI Enabled</label>
                <input
                    type="checkbox"
                    id="aiEnabled"
                    checked={formDataSendMyselfEmail.aiEnabled}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    onChange={(e) => setFormDataSendMyselfEmail({ ...formDataSendMyselfEmail, aiEnabled: e.target.checked })}
                />
                <label htmlFor="aiEnabled" className="ml-2 text-sm text-gray-600">
                    Enable AI for email generation
                </label>
            </div>

            {/* AI fields - only show when AI is enabled */}
            {formDataSendMyselfEmail.aiEnabled && (
                <>
                    {/* field -> pass ai context enabled */}
                    <div className="py-2">
                        <label className="block text-sm font-medium text-gray-700">Pass AI Context</label>
                        <input
                            type="checkbox"
                            id="passAiContextEnabled"
                            checked={formDataSendMyselfEmail.passAiContextEnabled}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            onChange={(e) => setFormDataSendMyselfEmail({ ...formDataSendMyselfEmail, passAiContextEnabled: e.target.checked })}
                        />
                        <label htmlFor="passAiContextEnabled" className="ml-2 text-sm text-gray-600">
                            Pass AI context to the model
                        </label>
                    </div>

                    {/* field -> system prompt */}
                    <div className="py-2">
                        <label className="block text-sm font-medium text-gray-700">System Prompt</label>
                        <textarea
                            value={formDataSendMyselfEmail.systemPrompt}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 min-h-[80px] resize-vertical"
                            onChange={(e) => setFormDataSendMyselfEmail({ ...formDataSendMyselfEmail, systemPrompt: e.target.value })}
                            placeholder="Enter system prompt for AI..."
                        />
                    </div>

                    {/* field -> user prompt */}
                    <div className="py-2">
                        <label className="block text-sm font-medium text-gray-700">User Prompt</label>
                        <textarea
                            value={formDataSendMyselfEmail.userPrompt}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 min-h-[80px] resize-vertical"
                            onChange={(e) => setFormDataSendMyselfEmail({ ...formDataSendMyselfEmail, userPrompt: e.target.value })}
                            placeholder="Enter user prompt for AI..."
                        />
                    </div>

                    {/* field -> modelProvider */}
                    <div className="py-2">
                        <label className="block text-sm font-medium text-gray-700">Provider</label>
                        <select
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                            value={formDataSendMyselfEmail.aiModelProvider}
                            onChange={(e) => {
                                setFormDataSendMyselfEmail({ 
                                    ...formDataSendMyselfEmail, 
                                    aiModelProvider: e.target.value,
                                    aiModelName: ''
                                });
                                setSelectRandomModel(Math.floor(Math.random() * 1000000));
                            }}
                        >
                            <option value="openrouter">OpenRouter</option>
                            <option value="groq">GROQ</option>
                        </select>
                    </div>

                    {/* field -> select model -> openrouter */}
                    {formDataSendMyselfEmail.aiModelProvider === 'openrouter' && (
                        <div className="py-2">
                            <label className="block text-sm font-medium text-gray-700">Model</label>
                            <SelectAiModelOpenrouter
                                aiModelName={formDataSendMyselfEmail.aiModelName}
                                setAiModelName={handleAiModelNameChange}
                                selectRandomModel={selectRandomModel}
                                key={'select-model-openrouter'}
                            />
                        </div>
                    )}

                    {/* field -> select model -> groq */}
                    {formDataSendMyselfEmail.aiModelProvider === 'groq' && (
                        <div className="py-2">
                            <label className="block text-sm font-medium text-gray-700">Model</label>
                            <SelectAiModelGroq
                                aiModelName={formDataSendMyselfEmail.aiModelName}
                                setAiModelName={handleAiModelNameChange}
                                selectRandomModel={selectRandomModel}
                                key={'select-model-groq'}
                            />
                        </div>
                    )}

                    {/* field -> buttons */}
                    <div className="py-2">
                        <button
                            onClick={() => {
                                setSelectRandomModel(selectRandomModel + 1);
                            }}
                            className="text-sm text-blue-500 hover:text-blue-700 inline-block"
                        >
                            <span className="mr-1">🎲</span>
                            Random LLM
                        </button>
                    </div>
                </>
            )}

        </div>
    );
};

export default ComponentScheduleSendMyselfEmail;