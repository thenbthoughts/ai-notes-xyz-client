import { useCallback, useEffect, useRef, useState } from "react";
import { LucideLoader, LucideSettings } from "lucide-react";
import { useSetAtom } from "jotai";
import toast from "react-hot-toast";
import { AxiosRequestConfig } from "axios";

import axiosCustom from "../../../../../../config/axiosCustom";
import { SelectModel } from "../../component/selectModel";
import type { ChatAiModelProvider } from "../../component/selectModel";
import { jotaiChatLlmThreadSetting } from "../../jotai/jotaiChatLlmThreadSetting";
import { AGENT_OPENCODE_MAX_ANSWER_TIME_OPTIONS } from "../../../../../../types/pages/schemaChatLlmThread.types";

const normalizeThreadAnswerEngine = (eng: unknown): 'conciseAnswer' | 'agent' | 'agentOpencode' => {
    if (eng === 'agent') return 'agent';
    if (eng === 'agentOpencode') return 'agentOpencode';
    return 'conciseAnswer';
};

type ModelSettingsSnapshot = {
    aiModelProvider: ChatAiModelProvider;
    aiModelName: string;
    aiModelOpenAiCompatibleConfigId: string | null;
    sttModelName: string;
    sttModelProvider: string;
    ttsModelName: string;
    ttsModelProvider: string;
    opencodeMcpEnabled: boolean;
    opencodeMaxAnswerTimeMinutes: number;
    answerEngine: 'conciseAnswer' | 'agent' | 'agentOpencode';
};

const buildSnapshot = (settings: ModelSettingsSnapshot): string => JSON.stringify(settings);

const validateModelSettings = (settings: ModelSettingsSnapshot): string | null => {
    if (!settings.aiModelName.trim()) {
        return 'Model name is required';
    }
    if (settings.aiModelProvider === 'openai-compatible' && !settings.aiModelOpenAiCompatibleConfigId) {
        return 'OpenAI Compatible configuration is required';
    }
    if (settings.sttModelProvider === 'localai' && !settings.sttModelName.trim()) {
        return 'STT model is required for LocalAI';
    }
    if (settings.ttsModelProvider === 'localai' && !settings.ttsModelName.trim()) {
        return 'TTS model is required for LocalAI';
    }
    return null;
};

const ThreadSettingInline = ({ threadId }: { threadId: string }) => {
    const setChatLlmThreadSetting = useSetAtom(jotaiChatLlmThreadSetting);

    const [threadSetting, setThreadSetting] = useState<Record<string, unknown> | null>(null);
    const [isLoadingThread, setIsLoadingThread] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

    const [aiModelProvider, setAiModelProvider] = useState<ChatAiModelProvider>("openrouter");
    const [aiModelName, setAiModelName] = useState("openrouter/auto");
    const [aiModelOpenAiCompatibleConfigId, setAiModelOpenAiCompatibleConfigId] = useState<string | null>(null);
    const [sttModelName, setSttModelName] = useState('');
    const [sttModelProvider, setSttModelProvider] = useState('');
    const [ttsModelName, setTtsModelName] = useState('');
    const [ttsModelProvider, setTtsModelProvider] = useState('');
    const [opencodeMcpEnabled, setOpencodeMcpEnabled] = useState(true);
    const [opencodeMaxAnswerTimeMinutes, setOpencodeMaxAnswerTimeMinutes] = useState(60);
    const [answerEngineInline, setAnswerEngineInline] = useState<'conciseAnswer' | 'agent' | 'agentOpencode'>('conciseAnswer');

    const [isReadyForAutoSave, setIsReadyForAutoSave] = useState(false);
    const lastSavedSnapshotRef = useRef('');
    const saveStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        let cancelled = false;

        const fetchThread = async () => {
            setIsLoadingThread(true);
            setIsReadyForAutoSave(false);
            try {
                const response = await axiosCustom.post('/api/chat-llm/threads-crud/threadsGet', {
                    threadId,
                });
                if (cancelled) {
                    return;
                }
                const doc = response.data?.docs?.[0];
                if (!doc) {
                    setThreadSetting(null);
                    return;
                }

                const loaded: ModelSettingsSnapshot = {
                    aiModelProvider: (doc.aiModelProvider || 'openrouter') as ChatAiModelProvider,
                    aiModelName: doc.aiModelName || 'openrouter/auto',
                    aiModelOpenAiCompatibleConfigId: doc.aiModelOpenAiCompatibleConfigId || null,
                    sttModelName: doc.sttModelName || '',
                    sttModelProvider: doc.sttModelProvider || '',
                    ttsModelName: doc.ttsModelName || '',
                    ttsModelProvider: doc.ttsModelProvider || '',
                    opencodeMcpEnabled: doc.opencodeMcpEnabled !== undefined ? Boolean(doc.opencodeMcpEnabled) : true,
                    opencodeMaxAnswerTimeMinutes:
                        Number(doc.opencodeMaxAnswerTimeMinutes) > 0 ? Number(doc.opencodeMaxAnswerTimeMinutes) : 60,
                    answerEngine: normalizeThreadAnswerEngine(doc.answerEngine),
                };

                setThreadSetting(doc);
                setAiModelProvider(loaded.aiModelProvider);
                setAiModelName(loaded.aiModelName);
                setAiModelOpenAiCompatibleConfigId(loaded.aiModelOpenAiCompatibleConfigId);
                setSttModelName(loaded.sttModelName);
                setSttModelProvider(loaded.sttModelProvider);
                setTtsModelName(loaded.ttsModelName);
                setTtsModelProvider(loaded.ttsModelProvider);
                setOpencodeMcpEnabled(loaded.opencodeMcpEnabled);
                setOpencodeMaxAnswerTimeMinutes(loaded.opencodeMaxAnswerTimeMinutes);
                setAnswerEngineInline(loaded.answerEngine);
                lastSavedSnapshotRef.current = buildSnapshot(loaded);
                setIsReadyForAutoSave(true);
            } catch (error) {
                console.error('Failed to fetch thread settings:', error);
            } finally {
                if (!cancelled) {
                    setIsLoadingThread(false);
                }
            }
        };

        if (threadId) {
            void fetchThread();
        }

        return () => {
            cancelled = true;
        };
    }, [threadId]);

    const persistModelSettings = useCallback(async (
        settings: ModelSettingsSnapshot,
        thread: Record<string, unknown>,
    ): Promise<boolean> => {
        const loadedShellMinRaw = Math.round(Number(thread.shellExecuteMinAttempts) || 1);
        const loadedShellMaxRaw = Math.round(Number(thread.shellExecuteMaxAttempts) || 1);
        const loadedShellMin = Math.min(10, Math.max(1, loadedShellMinRaw));
        const loadedShellMax = Math.min(10, Math.max(1, loadedShellMaxRaw));

        const config = {
            method: 'post',
            url: `/api/chat-llm/threads-crud/threadsEditById`,
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                threadId: thread._id,
                threadTitle: thread.threadTitle,
                isAutoAiContextSelectEnabled: thread.isAutoAiContextSelectEnabled,
                isPersonalContextEnabled: thread.isPersonalContextEnabled,
                isMemoryEnabled: thread.isMemoryEnabled,
                systemPrompt: thread.systemPrompt,
                answerEngine: settings.answerEngine,
                executeShell: Boolean(thread.executeShell),
                aiModelProvider: settings.aiModelProvider,
                aiModelName: settings.aiModelName,
                aiModelOpenAiCompatibleConfigId: settings.aiModelOpenAiCompatibleConfigId,
                sttModelName: settings.sttModelName,
                sttModelProvider: settings.sttModelProvider,
                ttsModelName: settings.ttsModelName,
                ttsModelProvider: settings.ttsModelProvider,
                opencodeMcpEnabled: settings.opencodeMcpEnabled,
                opencodeMaxAnswerTimeMinutes: settings.opencodeMaxAnswerTimeMinutes,
                chatLlmTemperature: thread.chatLlmTemperature ?? 1,
                chatLlmMaxTokens: thread.chatLlmMaxTokens ?? 4096,
                chatMemoryLimit: thread.chatMemoryLimit ?? 0,
                shellExecuteMinAttempts: Math.min(loadedShellMin, loadedShellMax),
                shellExecuteMaxAttempts: Math.max(loadedShellMin, loadedShellMax),
                agentMinBudgetTokens: Math.min(
                    1_000_000,
                    Math.max(1, Math.round(Number(thread.agentMinBudgetTokens) || 1))
                ),
                agentMaxBudgetTokens: Math.min(
                    1_000_000,
                    Math.max(1, Math.round(Number(thread.agentMaxBudgetTokens) || 1_000_000))
                ),
                agentMinNumberOfIterations: Math.min(
                    100,
                    Math.max(1, Math.round(Number(thread.agentMinNumberOfIterations) || 1))
                ),
                agentMaxNumberOfIterations: Math.min(
                    100,
                    Math.max(1, Math.round(Number(thread.agentMaxNumberOfIterations) || 100))
                ),
                agentContextActionLimit: Math.min(
                    500,
                    Math.max(1, Math.round(Number(thread.agentContextActionLimit) || 100))
                ),
                agentContextSummaryCount: Math.min(
                    50,
                    Math.max(1, Math.round(Number(thread.agentContextSummaryCount) || 10))
                ),
                agentContextMessagesPerSummary: Math.min(
                    50,
                    Math.max(1, Math.round(Number(thread.agentContextMessagesPerSummary) || 10))
                ),
                agentScriptMaxTokens: Math.min(
                    128_000,
                    Math.max(512, Math.round(Number(thread.agentScriptMaxTokens) || 8192))
                ),
            },
        } as AxiosRequestConfig;

        await axiosCustom.request(config);
        return true;
    }, []);

    useEffect(() => {
        if (!isReadyForAutoSave || !threadSetting?._id) {
            return;
        }

        const settings: ModelSettingsSnapshot = {
            aiModelProvider,
            aiModelName,
            aiModelOpenAiCompatibleConfigId,
            sttModelName,
            sttModelProvider,
            ttsModelName,
            ttsModelProvider,
            opencodeMcpEnabled,
            opencodeMaxAnswerTimeMinutes,
            answerEngine: answerEngineInline,
        };

        const validationError = validateModelSettings(settings);
        if (validationError) {
            return;
        }

        const snapshot = buildSnapshot(settings);
        if (snapshot === lastSavedSnapshotRef.current) {
            return;
        }

        const debounceId = setTimeout(() => {
            void (async () => {
                setIsSaving(true);
                setSaveStatus('idle');
                try {
                    await persistModelSettings(settings, threadSetting);
                    lastSavedSnapshotRef.current = snapshot;
                    setSaveStatus('saved');
                    if (saveStatusTimerRef.current) {
                        clearTimeout(saveStatusTimerRef.current);
                    }
                    saveStatusTimerRef.current = setTimeout(() => {
                        setSaveStatus('idle');
                    }, 2000);
                } catch (error) {
                    console.error(error);
                    toast.error('Could not save thread settings. Please try again.');
                } finally {
                    setIsSaving(false);
                }
            })();
        }, 500);

        return () => clearTimeout(debounceId);
    }, [
        isReadyForAutoSave,
        threadSetting,
        aiModelProvider,
        aiModelName,
        aiModelOpenAiCompatibleConfigId,
        sttModelName,
        sttModelProvider,
        ttsModelName,
        ttsModelProvider,
        opencodeMcpEnabled,
        opencodeMaxAnswerTimeMinutes,
        answerEngineInline,
        persistModelSettings,
    ]);

    useEffect(() => {
        return () => {
            if (saveStatusTimerRef.current) {
                clearTimeout(saveStatusTimerRef.current);
            }
        };
    }, []);

    const openFullSettings = () => {
        setChatLlmThreadSetting({
            isOpen: true,
            threadId,
        });
    };

    if (isLoadingThread) {
        return (
            <div className="mt-4 flex items-center justify-center py-6">
                <LucideLoader className="h-5 w-5 animate-spin text-teal-600" />
            </div>
        );
    }

    if (!threadSetting) {
        return null;
    }

    return (
        <div className="mt-4">
            <SelectModel
                aiModelProvider={aiModelProvider}
                setAiModelProvider={setAiModelProvider}
                aiModelName={aiModelName}
                setAiModelName={setAiModelName}
                aiModelOpenAiCompatibleConfigId={aiModelOpenAiCompatibleConfigId}
                setAiModelOpenAiCompatibleConfigId={setAiModelOpenAiCompatibleConfigId}
                sttModelProvider={sttModelProvider}
                setSttModelProvider={setSttModelProvider}
                sttModelName={sttModelName}
                setSttModelName={setSttModelName}
                ttsModelProvider={ttsModelProvider}
                setTtsModelProvider={setTtsModelProvider}
                ttsModelName={ttsModelName}
                setTtsModelName={setTtsModelName}
            />

            {answerEngineInline === 'agentOpencode' && (
                <div className="mt-4 rounded-md border border-cyan-900/50 bg-cyan-950/20 p-3">
                    <div className="mb-2 text-sm font-semibold text-cyan-200">Agent (Opencode) Settings</div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            className="rounded-sm"
                            checked={opencodeMcpEnabled}
                            onChange={(e) => setOpencodeMcpEnabled(e.target.checked)}
                        />
                        <span className="text-sm text-zinc-300">Enable MCP (search + add_chat_file)</span>
                    </label>
                    <div className="mt-2">
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Max time to answer</label>
                        <select
                            className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200"
                            value={opencodeMaxAnswerTimeMinutes}
                            onChange={(e) => setOpencodeMaxAnswerTimeMinutes(Number(e.target.value))}
                        >
                            {AGENT_OPENCODE_MAX_ANSWER_TIME_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <p className="mt-1 text-xs text-zinc-400">The Opencode run is aborted after this much time.</p>
                    </div>
                    <p className="mt-1 text-xs text-zinc-400">Same thread model <span className="font-mono text-zinc-300">{aiModelProvider}/{aiModelName}</span> will be used for Opencode.</p>
                </div>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-3">
                {(isSaving || saveStatus === 'saved') && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
                        {isSaving ? (
                            <>
                                <LucideLoader className="h-3.5 w-3.5 animate-spin text-teal-600" />
                                Saving…
                            </>
                        ) : (
                            'Saved'
                        )}
                    </span>
                )}

                <button
                    type="button"
                    onClick={openFullSettings}
                    className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
                >
                    <LucideSettings className="h-4 w-4" />
                    All chat settings
                </button>
            </div>
        </div>
    );
};

export default ThreadSettingInline;
