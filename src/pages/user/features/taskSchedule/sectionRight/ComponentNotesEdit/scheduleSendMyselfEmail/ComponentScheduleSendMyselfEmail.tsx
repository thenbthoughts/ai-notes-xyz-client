import React, { useState, useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import Select from "react-select";
import { reactSelectDarkStyles } from "../../../../ChatLlmList/component/selectModel/reactSelectPortalProps";
import axiosCustom from '../../../../../../../config/axiosCustom';
import stateJotaiAuthAtom from '../../../../../../../jotai/stateJotaiAuth';
import {
    type TelegramChatOption,
    chatOptionKey,
    parseChatOptionKey,
} from '../../../../../settings/settingApiKeys/telegramSettingsShared';
import { ISendMyselfEmailForm } from '../../../../../../../types/pages/tsTaskSchedule';
import { tsSchemaAiModelListGroq } from '../../../../../../../types/pages/settings/dataModelGroq';
import { tsSchemaAiModelListOpenrouter } from '../../../../../../../types/pages/settings/dataModelOpenrouter';
import { formatContextLength, formatMaxCompletionTokens, matchBreakWordRegex } from '../../../../../../../utils/modelSearchUtils';

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

                    let tempModelArr = response.data.docs as tsSchemaAiModelListOpenrouter[];

                    tempModelArr = tempModelArr.map((model) => ({
                        ...model,
                        name: model.name || model.id,
                        description: model.description || '',
                        contextLength: model.contextLength || 0,
                        maxCompletionTokens: model.maxCompletionTokens || 0,
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

    const options = modelArr.map((model) => {
        const ctxFormatted = formatContextLength(model.contextLength);
        const maxTokensFormatted = formatMaxCompletionTokens(model.maxCompletionTokens);
        const tokensBadge = (ctxFormatted || maxTokensFormatted)
            ? ` [${ctxFormatted || '?'}${maxTokensFormatted ? `/${maxTokensFormatted}` : ''}]`
            : '';
        return {
            value: model.id,
            label: `${model.name}${tokensBadge} (${model.id})`,
            contextLength: model.contextLength,
            maxCompletionTokens: model.maxCompletionTokens,
            description: model.description,
        };
    });

    return (
        <div className="mb-2">
            <Select<{ value: string; label: string }>
                styles={reactSelectDarkStyles}
                value={aiModelName ? options.find(model => model.value === aiModelName) || { value: aiModelName, label: aiModelName } : undefined}
                onChange={(selectedOption: { value: string; label: string } | null) => {
                    if (selectedOption) {
                        setAiModelName(selectedOption.value);
                    }
                }}
                options={options}
                placeholder="Select a model..."
                isLoading={isLoadingModel}
                isSearchable={true}
                filterOption={(candidate, input) => {
                    if (!input || !input.trim()) return true;
                    return matchBreakWordRegex(
                        input,
                        candidate.data.label,
                        candidate.data.value,
                        (candidate.data as any).description,
                        (candidate.data as any).contextLength,
                        (candidate.data as any).maxCompletionTokens
                    );
                }}
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
            setModelArr(response.data.docs || []);

            // if aiModelName is empty, select a random model
            if (aiModelName === '') {
                if (response.data.docs && response.data.docs.length > 0) {
                    setAiModelName(response.data.docs[0].id);
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

    const options = modelArr.map((model) => {
        const ctxLen = model.contextLength || model.context_window || 0;
        const ctxFormatted = formatContextLength(ctxLen);
        const maxTokensFormatted = formatMaxCompletionTokens(model.maxCompletionTokens);
        const tokensBadge = (ctxFormatted || maxTokensFormatted)
            ? ` [${ctxFormatted || '?'}${maxTokensFormatted ? `/${maxTokensFormatted}` : ''}]`
            : '';
        return {
            value: model.id,
            label: `${model.owned_by} - ${model.id}${tokensBadge}`,
            contextLength: ctxLen,
            maxCompletionTokens: model.maxCompletionTokens,
            owned_by: model.owned_by,
        };
    });

    return (
        <div className="mb-2">
            <Select<{ value: string; label: string }>
                styles={reactSelectDarkStyles}
                value={aiModelName ? options.find(model => model.value === aiModelName) || { value: aiModelName, label: aiModelName } : undefined}
                onChange={(selectedOption: { value: string; label: string } | null) => {
                    if (selectedOption) {
                        setAiModelName(selectedOption.value);
                    }
                }}
                options={options}
                placeholder="Select a model..."
                isLoading={isLoadingModel}
                isSearchable={true}
                filterOption={(candidate, input) => {
                    if (!input || !input.trim()) return true;
                    return matchBreakWordRegex(
                        input,
                        candidate.data.label,
                        candidate.data.value,
                        (candidate.data as any).owned_by,
                        (candidate.data as any).contextLength,
                        (candidate.data as any).maxCompletionTokens
                    );
                }}
            />
        </div>
    )
}

const SelectAiModelOllama = ({
    aiModelName,
    setAiModelName,
}: {
    aiModelName: string;
    setAiModelName: (value: string) => void;
}) => {
    const [ollamaModels, setOllamaModels] = useState<
        Array<{ _id: string; modelName: string; modelLabel: string; contextLength?: number; maxCompletionTokens?: number }>
    >([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const fetchOllamaModels = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await axiosCustom.get("/api/dynamic-data/model-ollama/modelOllamaGet");
                setOllamaModels(res.data.docs || []);
            } catch {
                setError("Failed to fetch models");
            } finally {
                setLoading(false);
            }
        };
        fetchOllamaModels();
    }, []);

    useEffect(() => {
        if (ollamaModels.length > 0 && !aiModelName) {
            setAiModelName(ollamaModels[0].modelName);
        }
    }, [ollamaModels, aiModelName, setAiModelName]);

    const options = ollamaModels.map((model) => {
        const ctxFormatted = formatContextLength(model.contextLength);
        const maxTokensFormatted = formatMaxCompletionTokens(model.maxCompletionTokens);
        const tokensBadge = (ctxFormatted || maxTokensFormatted)
            ? ` [${ctxFormatted || '?'}${maxTokensFormatted ? `/${maxTokensFormatted}` : ''}]`
            : '';
        return {
            value: model.modelName,
            label: `${model.modelLabel || model.modelName}${tokensBadge}`,
            contextLength: model.contextLength,
            maxCompletionTokens: model.maxCompletionTokens,
        };
    });

    return (
        <div className="mb-2">
            {loading ? (
                <div className="text-zinc-400 text-sm">Loading models...</div>
            ) : error ? (
                <div className="text-red-600 text-sm">{error}</div>
            ) : ollamaModels.length === 0 ? (
                <div className="text-sm text-zinc-400">No Ollama models found.</div>
            ) : (
                <Select<{ value: string; label: string }>
                    styles={reactSelectDarkStyles}
                    value={aiModelName ? options.find(opt => opt.value === aiModelName) || { value: aiModelName, label: aiModelName } : undefined}
                    onChange={(selectedOption) => {
                        if (selectedOption) {
                            setAiModelName(selectedOption.value);
                        }
                    }}
                    options={options}
                    placeholder="Select an Ollama model..."
                    isLoading={loading}
                    isSearchable={true}
                    filterOption={(candidate, input) => {
                        if (!input || !input.trim()) return true;
                        return matchBreakWordRegex(
                            input,
                            candidate.data.label,
                            candidate.data.value,
                            (candidate.data as any).contextLength,
                            (candidate.data as any).maxCompletionTokens
                        );
                    }}
                />
            )}
        </div>
    );
};

const SelectAiModelLocalai = ({
    aiModelName,
    setAiModelName,
}: {
    aiModelName: string;
    setAiModelName: (value: string) => void;
}) => {
    const [localaiModels, setLocalaiModels] = useState<
        Array<{ _id: string; modelName: string; modelLabel: string; modelType?: string; contextLength?: number; maxCompletionTokens?: number }>
    >([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const fetchLocalaiModels = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await axiosCustom.get("/api/dynamic-data/model-localai/modelLocalaiGet");
                setLocalaiModels(res.data.docs || []);
            } catch {
                setError("Failed to fetch models");
            } finally {
                setLoading(false);
            }
        };
        fetchLocalaiModels();
    }, []);

    useEffect(() => {
        if (localaiModels.length > 0 && !aiModelName) {
            setAiModelName(localaiModels[0].modelName);
        }
    }, [localaiModels, aiModelName, setAiModelName]);

    const options = localaiModels.map((model) => {
        const ctxFormatted = formatContextLength(model.contextLength);
        const maxTokensFormatted = formatMaxCompletionTokens(model.maxCompletionTokens);
        const tokensBadge = (ctxFormatted || maxTokensFormatted)
            ? ` [${ctxFormatted || '?'}${maxTokensFormatted ? `/${maxTokensFormatted}` : ''}]`
            : '';
        const typeBadge = model.modelType ? ` (${model.modelType})` : '';
        return {
            value: model.modelName,
            label: `${model.modelLabel || model.modelName}${typeBadge}${tokensBadge}`,
            contextLength: model.contextLength,
            maxCompletionTokens: model.maxCompletionTokens,
        };
    });

    return (
        <div className="mb-2">
            {loading ? (
                <div className="text-zinc-400 text-sm">Loading models...</div>
            ) : error ? (
                <div className="text-red-600 text-sm">{error}</div>
            ) : localaiModels.length === 0 ? (
                <div className="text-sm text-zinc-400">No LocalAI models found.</div>
            ) : (
                <Select<{ value: string; label: string }>
                    styles={reactSelectDarkStyles}
                    value={aiModelName ? options.find(opt => opt.value === aiModelName) || { value: aiModelName, label: aiModelName } : undefined}
                    onChange={(selectedOption) => {
                        if (selectedOption) {
                            setAiModelName(selectedOption.value);
                        }
                    }}
                    options={options}
                    placeholder="Select a LocalAI model..."
                    isLoading={loading}
                    isSearchable={true}
                    filterOption={(candidate, input) => {
                        if (!input || !input.trim()) return true;
                        return matchBreakWordRegex(
                            input,
                            candidate.data.label,
                            candidate.data.value,
                            (candidate.data as any).contextLength,
                            (candidate.data as any).maxCompletionTokens
                        );
                    }}
                />
            )}
        </div>
    );
};

const SelectAiModelOpenaiCompatible = ({
    aiModelName,
    setAiModelName,
}: {
    aiModelName: string;
    setAiModelName: (value: string) => void;
}) => {
    interface IOpenaiCompatibleModel {
        _id: string;
        providerName?: string;
        baseUrl: string;
        modelName?: string;
        contextLength?: number;
        maxCompletionTokens?: number;
    }

    const [configs, setConfigs] = useState<IOpenaiCompatibleModel[]>([]);
    const [isLoadingModel, setIsLoadingModel] = useState(true);

    useEffect(() => {
        const fetchConfigs = async () => {
            setIsLoadingModel(true);
            try {
                const response = await axiosCustom.post<{ docs: IOpenaiCompatibleModel[] }>(
                    `/api/user/openai-compatible-model/crud/openaiCompatibleModelGet`,
                    {},
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        withCredentials: true,
                    }
                );
                setConfigs(response.data.docs || []);

                if (!aiModelName && response.data.docs && response.data.docs.length > 0) {
                    const firstConfig = response.data.docs[0];
                    setAiModelName(firstConfig._id);
                }
            } catch (error) {
                console.error('Error fetching OpenAI compatible models:', error);
            } finally {
                setIsLoadingModel(false);
            }
        };
        fetchConfigs();
    }, []);

    const options = configs.map((config) => {
        const displayName = config.providerName || config.baseUrl;
        const modelPart = config.modelName ? ` - ${config.modelName}` : '';
        const ctxFormatted = formatContextLength(config.contextLength);
        const maxTokensFormatted = formatMaxCompletionTokens(config.maxCompletionTokens);
        const tokensBadge = (ctxFormatted || maxTokensFormatted)
            ? ` [${ctxFormatted || '?'}${maxTokensFormatted ? `/${maxTokensFormatted}` : ''}]`
            : '';
        return {
            value: config._id,
            label: `${displayName}${modelPart}${tokensBadge}`,
            contextLength: config.contextLength,
            maxCompletionTokens: config.maxCompletionTokens,
            providerName: config.providerName,
            baseUrl: config.baseUrl,
            modelName: config.modelName,
        };
    });

    return (
        <div className="mb-2">
            {isLoadingModel ? (
                <div className="text-sm text-zinc-400">Loading configurations...</div>
            ) : configs.length === 0 ? (
                <div className="text-sm text-zinc-400 mb-2">No configurations found.</div>
            ) : (
                <Select<{ value: string; label: string }>
                    styles={reactSelectDarkStyles}
                    value={aiModelName ? options.find(c => c.value === aiModelName) || { value: aiModelName, label: aiModelName } : undefined}
                    onChange={(selectedOption) => {
                        if (selectedOption) {
                            setAiModelName(selectedOption.value);
                        }
                    }}
                    options={options}
                    placeholder="Select a configuration..."
                    isSearchable={true}
                    filterOption={(candidate, input) => {
                        if (!input || !input.trim()) return true;
                        return matchBreakWordRegex(
                            input,
                            candidate.data.label,
                            candidate.data.value,
                            (candidate.data as any).providerName,
                            (candidate.data as any).baseUrl,
                            (candidate.data as any).modelName,
                            (candidate.data as any).contextLength,
                            (candidate.data as any).maxCompletionTokens
                        );
                    }}
                />
            )}
        </div>
    );
};

const ComponentScheduleSendMyselfEmail = ({
    formDataSendMyselfEmail,
    setFormDataSendMyselfEmail,
}: {
    formDataSendMyselfEmail: ISendMyselfEmailForm;
    setFormDataSendMyselfEmail: React.Dispatch<React.SetStateAction<ISendMyselfEmailForm>>;
}) => {
    const [authState] = useAtom(stateJotaiAuthAtom);
    const [selectRandomModel, setSelectRandomModel] = useState(0);
    const [telegramChats, setTelegramChats] = useState<TelegramChatOption[]>([]);
    const [telegramChatsLoading, setTelegramChatsLoading] = useState(false);

    const loadCachedTelegramChats = useCallback(async () => {
        if (!authState.telegramValid) return;
        try {
            setTelegramChatsLoading(true);
            const res = await axiosCustom.post(
                `/api/user/api-keys/telegramGetCachedChats`,
                {}
            );
            const raw = res.data?.chats;
            if (Array.isArray(raw)) {
                setTelegramChats(raw as TelegramChatOption[]);
            } else {
                setTelegramChats([]);
            }
        } catch {
            setTelegramChats([]);
        } finally {
            setTelegramChatsLoading(false);
        }
    }, [authState.telegramValid]);

    useEffect(() => {
        if (authState.telegramValid) {
            void loadCachedTelegramChats();
        }
    }, [authState.telegramValid, loadCachedTelegramChats]);

    const refreshTelegramChatsFromBot = async () => {
        if (!authState.telegramValid) return;
        try {
            setTelegramChatsLoading(true);
            await axiosCustom.post(`/api/user/api-keys/telegramListRecentChats`, {});
            await loadCachedTelegramChats();
        } catch {
            await loadCachedTelegramChats();
        } finally {
            setTelegramChatsLoading(false);
        }
    };

    const handleAiModelNameChange = (value: string) => {
        setFormDataSendMyselfEmail({ ...formDataSendMyselfEmail, aiModelName: value });
    };

    const telegramSelectOptions = telegramChats.map((c) => ({
        value: chatOptionKey(c),
        label: c.label,
    }));
    const selectedTgKey =
        formDataSendMyselfEmail.telegramChatId.length >= 1
            ? chatOptionKey({
                  chatId: formDataSendMyselfEmail.telegramChatId,
                  messageThreadId: formDataSendMyselfEmail.telegramMessageThreadId,
                  label: '',
                  type: '',
              })
            : '';
    const selectedTgOption =
        telegramSelectOptions.find((o) => o.value === selectedTgKey) ||
        (selectedTgKey.length >= 1
            ? {
                  value: selectedTgKey,
                  label:
                      telegramChats.find((c) => chatOptionKey(c) === selectedTgKey)
                          ?.label ?? `Chat ${formDataSendMyselfEmail.telegramChatId}`,
              }
            : null);

    return (
        <div className="rounded-xl border border-zinc-700/80 bg-zinc-950/50 p-3 sm:p-4">

            <h2 className="my-2 text-lg font-semibold tracking-tight text-zinc-100 sm:my-3 sm:text-xl">Send Myself Email</h2>

            <div className="mb-3 space-y-3 border-b border-zinc-800 py-2 sm:mb-4">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="sendMailEnabled"
                        checked={formDataSendMyselfEmail.sendMailEnabled}
                        className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500/25"
                        onChange={(e) =>
                            setFormDataSendMyselfEmail({
                                ...formDataSendMyselfEmail,
                                sendMailEnabled: e.target.checked,
                            })
                        }
                    />
                    <label htmlFor="sendMailEnabled" className="ml-2 text-sm text-zinc-200">
                        Send email (SMTP must be valid in API keys)
                    </label>
                </div>

                {authState.telegramValid && (
                    <>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="sendTelegramEnabled"
                                checked={formDataSendMyselfEmail.sendTelegramEnabled}
                                className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500/25"
                                onChange={(e) => {
                                    const on = e.target.checked;
                                    setFormDataSendMyselfEmail({
                                        ...formDataSendMyselfEmail,
                                        sendTelegramEnabled: on,
                                        ...(on
                                            ? {}
                                            : {
                                                  telegramChatId: '',
                                                  telegramMessageThreadId: null,
                                              }),
                                    });
                                    if (on) void loadCachedTelegramChats();
                                }}
                            />
                            <label
                                htmlFor="sendTelegramEnabled"
                                className="ml-2 text-sm text-zinc-200"
                            >
                                Send Telegram (same bot token as in settings; pick chat below)
                            </label>
                        </div>

                        {formDataSendMyselfEmail.sendTelegramEnabled && (
                            <div className="pl-6 space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => void refreshTelegramChatsFromBot()}
                                        className="text-xs px-2 py-1 rounded-lg border border-zinc-700/90 bg-zinc-900 hover:bg-zinc-800 text-zinc-100"
                                    >
                                        Refresh chat list from bot
                                    </button>
                                    <span className="text-xs text-zinc-500">
                                        Uses recent updates Telegram sent to your bot — say hi in the chat if the list is empty.
                                    </span>
                                </div>
                                <label className="block text-sm font-medium text-zinc-200">
                                    Telegram chat / topic
                                </label>
                                <Select<{ value: string; label: string }>
                styles={reactSelectDarkStyles}
                                    value={selectedTgOption}
                                    onChange={(opt) => {
                                        if (!opt) {
                                            setFormDataSendMyselfEmail({
                                                ...formDataSendMyselfEmail,
                                                telegramChatId: '',
                                                telegramMessageThreadId: null,
                                            });
                                            return;
                                        }
                                        const parsed = parseChatOptionKey(opt.value);
                                        setFormDataSendMyselfEmail({
                                            ...formDataSendMyselfEmail,
                                            telegramChatId: parsed.chatId,
                                            telegramMessageThreadId: parsed.messageThreadId,
                                        });
                                    }}
                                    options={telegramSelectOptions}
                                    placeholder="Select channel…"
                                    isLoading={telegramChatsLoading}
                                    isClearable
                                    classNamePrefix="react-select"
                                />
                            </div>
                        )}
                    </>
                )}

                {!authState.telegramValid && (
                    <p className="text-xs text-zinc-500">
                        Configure and verify Telegram under Settings → API keys to enable Telegram delivery here.
                    </p>
                )}
            </div>

            {/* field -> email subject */}
            <div className="py-2">
                <label className="block text-sm font-medium text-zinc-200">Email Subject *</label>
                <input
                    type="text"
                    value={formDataSendMyselfEmail.emailSubject}
                    className="mt-1 block w-full rounded-lg border border-zinc-700/90 bg-zinc-900 p-2 text-sm text-zinc-100 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
                    onChange={(e) => setFormDataSendMyselfEmail({ ...formDataSendMyselfEmail, emailSubject: e.target.value })}
                    placeholder="Enter email subject"
                />
            </div>

            {/* field -> email content */}
            <div className="py-2">
                <label className="block text-sm font-medium text-zinc-200">Email Content</label>
                <textarea
                    value={formDataSendMyselfEmail.emailContent}
                    className="mt-1 block min-h-[100px] w-full resize-y rounded-lg border border-zinc-700/90 bg-zinc-900 p-2 text-sm text-zinc-100 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
                    onChange={(e) => setFormDataSendMyselfEmail({ ...formDataSendMyselfEmail, emailContent: e.target.value })}
                    placeholder="Enter email content..."
                />
            </div>

            {/* field -> ai enabled */}
            <div className="py-2">
                <label className="block text-sm font-medium text-zinc-200">AI Enabled</label>
                <input
                    type="checkbox"
                    id="aiEnabled"
                    checked={formDataSendMyselfEmail.aiEnabled}
                    className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500/25"
                    onChange={(e) => setFormDataSendMyselfEmail({ ...formDataSendMyselfEmail, aiEnabled: e.target.checked })}
                />
                <label htmlFor="aiEnabled" className="ml-2 text-sm text-zinc-400">
                    Enable AI for email generation
                </label>
            </div>

            {/* AI fields - only show when AI is enabled */}
            {formDataSendMyselfEmail.aiEnabled && (
                <>
                    {/* field -> pass ai context enabled */}
                    {/*
                    // TODO future feature
                    <div className="py-2">
                        <label className="block text-sm font-medium text-zinc-200">Pass AI Context</label>
                        <input
                            type="checkbox"
                            id="passAiContextEnabled"
                            checked={formDataSendMyselfEmail.passAiContextEnabled}
                            className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500/25"
                            onChange={(e) => setFormDataSendMyselfEmail({ ...formDataSendMyselfEmail, passAiContextEnabled: e.target.checked })}
                        />
                        <label htmlFor="passAiContextEnabled" className="ml-2 text-sm text-zinc-400">
                            Pass AI context to the model
                        </label>
                    </div>
                    */}

                    {/* field -> system prompt */}
                    <div className="py-2">
                        <label className="block text-sm font-medium text-zinc-200">System Prompt</label>
                        <textarea
                            value={formDataSendMyselfEmail.systemPrompt}
                            className="mt-1 block min-h-[80px] w-full resize-y rounded-lg border border-zinc-700/90 bg-zinc-900 p-2 text-sm text-zinc-100 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
                            onChange={(e) => setFormDataSendMyselfEmail({ ...formDataSendMyselfEmail, systemPrompt: e.target.value })}
                            placeholder="Enter system prompt for AI..."
                        />
                    </div>

                    {/* field -> user prompt */}
                    <div className="py-2">
                        <label className="block text-sm font-medium text-zinc-200">User Prompt</label>
                        <textarea
                            value={formDataSendMyselfEmail.userPrompt}
                            className="mt-1 block min-h-[80px] w-full resize-y rounded-lg border border-zinc-700/90 bg-zinc-900 p-2 text-sm text-zinc-100 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
                            onChange={(e) => setFormDataSendMyselfEmail({ ...formDataSendMyselfEmail, userPrompt: e.target.value })}
                            placeholder="Enter user prompt for AI..."
                        />
                    </div>

                    {/* field -> modelProvider */}
                    <div className="py-2">
                        <label className="block text-sm font-medium text-zinc-200">Provider</label>
                        <select
                            className="w-full rounded-lg border border-zinc-700/90 bg-zinc-900 p-2 text-sm text-zinc-100 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
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
                            <option value="ollama">Ollama</option>
                            <option value="localai">LocalAI</option>
                            <option value="openai-compatible">OpenAI Compatible</option>
                        </select>
                    </div>

                    {/* field -> select model -> openrouter */}
                    {formDataSendMyselfEmail.aiModelProvider === 'openrouter' && (
                        <div className="py-2">
                            <label className="block text-sm font-medium text-zinc-200">Model</label>
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
                            <label className="block text-sm font-medium text-zinc-200">Model</label>
                            <SelectAiModelGroq
                                aiModelName={formDataSendMyselfEmail.aiModelName}
                                setAiModelName={handleAiModelNameChange}
                                selectRandomModel={selectRandomModel}
                                key={'select-model-groq'}
                            />
                        </div>
                    )}

                    {/* field -> select model -> ollama */}
                    {formDataSendMyselfEmail.aiModelProvider === 'ollama' && (
                        <div className="py-2">
                            <label className="block text-sm font-medium text-zinc-200">Model</label>
                            <SelectAiModelOllama
                                aiModelName={formDataSendMyselfEmail.aiModelName}
                                setAiModelName={handleAiModelNameChange}
                                key={'select-model-ollama'}
                            />
                        </div>
                    )}

                    {/* field -> select model -> localai */}
                    {formDataSendMyselfEmail.aiModelProvider === 'localai' && (
                        <div className="py-2">
                            <label className="block text-sm font-medium text-zinc-200">Model</label>
                            <SelectAiModelLocalai
                                aiModelName={formDataSendMyselfEmail.aiModelName}
                                setAiModelName={handleAiModelNameChange}
                                key={'select-model-localai'}
                            />
                        </div>
                    )}

                    {/* field -> select model -> openai-compatible */}
                    {formDataSendMyselfEmail.aiModelProvider === 'openai-compatible' && (
                        <div className="py-2">
                            <label className="block text-sm font-medium text-zinc-200">Configuration</label>
                            <SelectAiModelOpenaiCompatible
                                aiModelName={formDataSendMyselfEmail.aiModelName}
                                setAiModelName={handleAiModelNameChange}
                                key={'select-model-openai-compatible'}
                            />
                        </div>
                    )}

                    {/* field -> buttons */}
                    <div className="py-2">
                        <button
                            onClick={() => {
                                setSelectRandomModel(selectRandomModel + 1);
                            }}
                            className="inline-block text-sm text-indigo-600 hover:text-indigo-500"
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