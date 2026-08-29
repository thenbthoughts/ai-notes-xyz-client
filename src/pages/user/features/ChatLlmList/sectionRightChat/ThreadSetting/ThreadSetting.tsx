import { LucideLoader, LucideSave, LucideSettings, LucideX, LucideInfo } from "lucide-react";
import { Fragment, useState } from "react";
import axiosCustom from "../../../../../../config/axiosCustom";
import { AxiosRequestConfig } from "axios";
import { toast } from "react-hot-toast";
import Tooltip from '@rc-component/tooltip';

import ThreadSettingContextSearch from "./ThreadSettingContextSearch";
import { SelectModel } from "../../component/selectModel";
import { AGENT_OPENCODE_MAX_ANSWER_TIME_OPTIONS } from "../../../../../../types/pages/schemaChatLlmThread.types";

const ThreadSetting = ({
    closeModal,
    threadSetting,
    doesThreadExist,
}: {
    closeModal: () => void;
    threadSetting: any;
    doesThreadExist: boolean;
}) => {

    const normalizeThreadAnswerEngine = (eng: unknown): 'conciseAnswer' | 'agent' | 'agentOpencode' => {
        if (eng === 'agent') return 'agent';
        if (eng === 'agentOpencode') return 'agentOpencode';
        return 'conciseAnswer';
    };

    const [formData, setFormData] = useState({
        threadTitle: threadSetting.threadTitle,
        isAutoAiContextSelectEnabled: threadSetting.isAutoAiContextSelectEnabled,
        isPersonalContextEnabled: threadSetting.isPersonalContextEnabled,
        isMemoryEnabled: threadSetting.isMemoryEnabled,
        systemPrompt: threadSetting.systemPrompt,

        answerEngine: normalizeThreadAnswerEngine(threadSetting.answerEngine),
        useOmniparser: (threadSetting as any).useOmniparser || false,
    });

    const [requestEdit, setRequestEdit] = useState({
        loading: false,
        success: '',
        error: '',
    });

    const [aiModelProvider, setAiModelProvider] = useState(threadSetting.aiModelProvider || "openrouter" as "openrouter" | "groq" | "ollama" | "localai" | "openai-compatible");
    const [aiModelName, setAiModelName] = useState(threadSetting.aiModelName || "openrouter/auto");
    const [aiModelOpenAiCompatibleConfigId, setAiModelOpenAiCompatibleConfigId] = useState<string | null>(
        threadSetting.aiModelOpenAiCompatibleConfigId || null
    );

    // STT (Speech-to-Text)
    const [sttModelName, setSttModelName] = useState(threadSetting.sttModelName || '');
    const [sttModelProvider, setSttModelProvider] = useState(threadSetting.sttModelProvider || '');

    // TTS (Text-to-Speech)
    const [ttsModelName, setTtsModelName] = useState(threadSetting.ttsModelName || '');
    const [ttsModelProvider, setTtsModelProvider] = useState(threadSetting.ttsModelProvider || '');
    const [temperature, setTemperature] = useState<number>(threadSetting.chatLlmTemperature || 1);
    const [maxTokens, setMaxTokens] = useState<number>(threadSetting.chatLlmMaxTokens || 4096);
    const [chatMemoryLimit, setChatMemoryLimit] = useState<number>(threadSetting.chatMemoryLimit || 0);

    const loadedMinTokens = Math.min(
        1_000_000,
        Math.max(1, Math.round(Number(threadSetting.agentMinBudgetTokens) || 1))
    );
    const loadedMaxTokens = Math.min(
        1_000_000,
        Math.max(1, Math.round(Number(threadSetting.agentMaxBudgetTokens) || 1_000_000))
    );
    const validatedMinTokens = Math.min(loadedMinTokens, loadedMaxTokens);
    const validatedMaxTokens = Math.max(loadedMinTokens, loadedMaxTokens);
    const loadedMinIter = Math.min(100, Math.max(1, Math.round(Number(threadSetting.agentMinNumberOfIterations) || 1)));
    const loadedMaxIter = Math.min(100, Math.max(1, Math.round(Number(threadSetting.agentMaxNumberOfIterations) || 100)));
    const validatedMinIter = Math.min(loadedMinIter, loadedMaxIter);
    const validatedMaxIter = Math.max(loadedMinIter, loadedMaxIter);

    const [agentMinBudgetTokens, setAgentMinBudgetTokens] = useState<number>(validatedMinTokens);
    const [agentMaxBudgetTokens, setAgentMaxBudgetTokens] = useState<number>(validatedMaxTokens);
    const [agentMinNumberOfIterations, setAgentMinNumberOfIterations] = useState<number>(validatedMinIter);
    const [agentMaxNumberOfIterations, setAgentMaxNumberOfIterations] = useState<number>(validatedMaxIter);
    const loadedActionLimit = Math.min(500, Math.max(1, Math.round(Number(threadSetting.agentContextActionLimit) || 100)));
    const loadedSummaryCount = Math.min(50, Math.max(1, Math.round(Number(threadSetting.agentContextSummaryCount) || 10)));
    const loadedMessagesPerSummary = Math.min(50, Math.max(1, Math.round(Number(threadSetting.agentContextMessagesPerSummary) || 10)));
    const loadedScriptMaxTokens = Math.min(
        128_000,
        Math.max(512, Math.round(Number(threadSetting.agentScriptMaxTokens) || 8192))
    );
    const [agentContextActionLimit, setAgentContextActionLimit] = useState<number>(loadedActionLimit);
    const [agentContextSummaryCount, setAgentContextSummaryCount] = useState<number>(loadedSummaryCount);
    const [agentContextMessagesPerSummary, setAgentContextMessagesPerSummary] = useState<number>(loadedMessagesPerSummary);
    const [agentScriptMaxTokens, setAgentScriptMaxTokens] = useState<number>(loadedScriptMaxTokens);
    const [minBudgetTokensInput, setMinBudgetTokensInput] = useState<string>(validatedMinTokens.toString());
    const [maxBudgetTokensInput, setMaxBudgetTokensInput] = useState<string>(validatedMaxTokens.toString());
    const [minIterationsInput, setMinIterationsInput] = useState<string>(validatedMinIter.toString());
    const [maxIterationsInput, setMaxIterationsInput] = useState<string>(validatedMaxIter.toString());
    const [contextActionLimitInput, setContextActionLimitInput] = useState<string>(loadedActionLimit.toString());
    const [contextSummaryCountInput, setContextSummaryCountInput] = useState<string>(loadedSummaryCount.toString());
    const [contextMessagesPerSummaryInput, setContextMessagesPerSummaryInput] = useState<string>(loadedMessagesPerSummary.toString());
    const [scriptMaxTokensInput, setScriptMaxTokensInput] = useState<string>(loadedScriptMaxTokens.toString());

    // Opencode settings (MCP toggle; model is same as thread aiModel)
    const [opencodeMcpEnabled, setOpencodeMcpEnabled] = useState<boolean>(
        (threadSetting as any).opencodeMcpEnabled !== undefined ? Boolean((threadSetting as any).opencodeMcpEnabled) : true
    );
    const [opencodeMaxAnswerTimeMinutes, setOpencodeMaxAnswerTimeMinutes] = useState<number>(
        Number((threadSetting as any).opencodeMaxAnswerTimeMinutes) > 0
            ? Number((threadSetting as any).opencodeMaxAnswerTimeMinutes)
            : 60
    );

    const editRecord = async () => {
        if (formData.answerEngine === 'agent') {
            if (agentMinBudgetTokens > agentMaxBudgetTokens) {
                toast.error('Min token budget cannot be greater than max token budget');
                return;
            }
            if (agentMinNumberOfIterations > agentMaxNumberOfIterations) {
                toast.error('Min iterations cannot be greater than max iterations');
                return;
            }
        }

        setRequestEdit({
            loading: true,
            success: '',
            error: '',
        });
        try {
            const isAgent = formData.answerEngine === 'agent';
            const config = {
                method: 'post',
                url: `/api/chat-llm/threads-crud/threadsEditById`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    ...formData,
                    threadId: threadSetting._id,

                    // selected model
                    aiModelProvider: aiModelProvider,
                    aiModelName: aiModelName,
                    aiModelOpenAiCompatibleConfigId: aiModelOpenAiCompatibleConfigId,

                    // STT (Speech-to-Text)
                    sttModelName: sttModelName,
                    sttModelProvider: sttModelProvider,

                    // TTS (Text-to-Speech)
                    ttsModelName: ttsModelName,
                    ttsModelProvider: ttsModelProvider,

                    // memory settings
                    isMemoryEnabled: formData.isMemoryEnabled,

                    // answer engine — shell only for agent (no UI toggle)
                    answerEngine: formData?.answerEngine || 'conciseAnswer',
                    executeShell: isAgent,
                    shellExecuteMinAttempts: 1,
                    shellExecuteMaxAttempts: 1,

                    // agent budgets
                    agentMinBudgetTokens,
                    agentMaxBudgetTokens,
                    agentMinNumberOfIterations,
                    agentMaxNumberOfIterations,
                    agentContextActionLimit,
                    agentContextSummaryCount,
                    agentContextMessagesPerSummary,
                    agentScriptMaxTokens,

                    // opencode settings (MCP; model is same as thread aiModel)
                    opencodeMcpEnabled,
                    opencodeMaxAnswerTimeMinutes,

                    // model parameters
                    chatLlmTemperature: temperature,
                    chatLlmMaxTokens: maxTokens,
                    chatMemoryLimit: chatMemoryLimit,
                },
            } as AxiosRequestConfig;

            await axiosCustom.request(config);

            setRequestEdit({
                loading: false,
                success: 'done',
                error: '',
            });
            toast.success('Chat thread updated successfully!');
            closeModal();
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
            <div className="p-1 lg:p-2">
                <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto">
                        {/* Thread Setting */}
                        <div className="flex justify-between items-center bg-gradient-to-r from-zinc-900 to-zinc-900">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-sm flex items-center justify-center">
                                    <LucideSettings className="w-4 h-4 text-white" />
                                </div>
                                <h1 className="text-2xl font-bold text-zinc-200 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Chat Settings
                                </h1>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 rounded-sm hover:bg-zinc-800 transition-colors duration-200 group"
                                aria-label="Close settings"
                            >
                                <LucideX className="w-5 h-5 text-zinc-400 group-hover:text-zinc-300 transition-colors duration-200" />
                            </button>
                        </div>

                        {/* line */}
                        <div className="h-px bg-zinc-700 my-1 lg:my-2"></div>

                        {/* field -> threadTitle */}
                        <div className="mb-2 lg:mb-3">
                            <label className="block text-sm font-medium text-zinc-300">Title *</label>
                            <input
                                type="text"
                                value={formData.threadTitle}
                                className="mt-1 block w-full border border-zinc-700 rounded-sm shadow-sm p-1 lg:p-2"
                                onChange={(e) => setFormData({ ...formData, threadTitle: e.target.value })}
                            />
                        </div>

                        {/* field -> systemPrompt */}
                        <div className="mb-2 lg:mb-3">
                            <label className="block text-sm font-medium text-zinc-300">System Prompt</label>
                            <textarea
                                value={formData.systemPrompt}
                                className="mt-1 block w-full border border-zinc-700 rounded-sm shadow-sm p-1 lg:p-2"
                                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                                rows={3}
                            />
                            {formData.systemPrompt.length > 0 && (
                                <button
                                    type="button"
                                    className="mt-1 lg:mt-2 px-2 lg:px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-sm transition-colors duration-200"
                                    onClick={() => setFormData({ ...formData, systemPrompt: '' })}
                                >
                                    Clear System Prompt
                                    <LucideX className="w-4 h-4 ml-2 inline-block" />
                                </button>
                            )}
                        </div>

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

                        {/* field -> model parameters */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-3 mb-2 lg:mb-3">
                            {/* field -> chatMemoryLimit */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1 lg:mb-2">Memory Limit</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={chatMemoryLimit}
                                    onChange={(e) => setChatMemoryLimit(parseInt(e.target.value) || 0)}
                                    className="mt-1 block w-full border border-zinc-700 rounded-sm shadow-sm p-1 lg:p-2"
                                />
                                <p className="mt-1 text-xs text-zinc-400">Maximum number of previous messages to include in context (0 = unlimited).</p>
                            </div>

                            {/* field -> chatLlmMaxTokens */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1 lg:mb-2">Max Tokens</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={maxTokens}
                                    onChange={(e) => setMaxTokens(parseInt(e.target.value) || 4096)}
                                    className="mt-1 block w-full border border-zinc-700 rounded-sm shadow-sm p-1 lg:p-2"
                                />
                                <p className="mt-1 text-xs text-zinc-400">Maximum tokens for chat replies. Agent-generated scripts use Script max tokens in Agent settings.</p>
                            </div>

                            {/* field -> chatLlmTemperature */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-1 lg:mb-2">Temperature</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="2"
                                    step="0.1"
                                    value={temperature}
                                    onChange={(e) => setTemperature(parseFloat(e.target.value) || 1)}
                                    className="mt-1 block w-full border border-zinc-700 rounded-sm shadow-sm p-1 lg:p-2"
                                />
                                <p className="mt-1 text-xs text-zinc-400">Controls randomness (0-2). Lower values make output more deterministic.</p>
                            </div>
                        </div>

                        {/* field -> answer engine */}
                        <div className="mb-4">
                            <div className="flex flex-col lg:flex-row lg:space-x-8 space-y-4 lg:space-y-0">
                                <div className="flex-1">
                                    <div className="text-sm text-zinc-300 mb-2 font-medium">Answer Engine</div>
                                    <div className="flex flex-row flex-wrap gap-x-6 gap-y-2">
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                className="form-radio text-blue-500"
                                                name="answerEngine"
                                                value="conciseAnswer"
                                                checked={formData.answerEngine === "conciseAnswer"}
                                                onChange={() => {
                                                    setFormData({
                                                        ...formData,
                                                        answerEngine: "conciseAnswer",
                                                    });
                                                }}
                                            />
                                            <Tooltip
                                                placement="top"
                                                trigger={['hover', 'click']}
                                                overlay={<span
                                                    className="text-zinc-100 bg-zinc-900 rounded-md p-2 inline-block"
                                                >
                                                    Concise answer is a shorter and more direct response.
                                                </span>}
                                            >
                                                <span className="ml-2 text-sm text-zinc-300 inline-block">
                                                    Concise
                                                    <LucideInfo className="w-4 h-4 ml-1 inline-block"
                                                        style={{
                                                            position: 'relative',
                                                            top: '-0.5px',
                                                            left: '1px',
                                                        }}
                                                    />
                                                </span>
                                            </Tooltip>
                                        </label>
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                className="form-radio text-blue-500"
                                                name="answerEngine"
                                                value="agent"
                                                checked={formData.answerEngine === 'agent'}
                                                onChange={() => {
                                                    setFormData({
                                                        ...formData,
                                                        answerEngine: 'agent',
                                                    });
                                                }}
                                            />
                                            <span className="ml-2 text-sm text-zinc-300 flex items-center">
                                                <Tooltip
                                                    placement="top"
                                                    trigger={['hover', 'click']}
                                                    overlay={
                                                        <span className="text-zinc-100 bg-zinc-900 rounded-md p-2 inline-block max-w-xs">
                                                            Agent: background loop with per-instance memory, goals, and access to notes, tasks, life events, and info vault. Poll for live updates.
                                                        </span>
                                                    }
                                                >
                                                    <span className="inline-block">
                                                        Agent
                                                        <LucideInfo
                                                            className="w-4 h-4 ml-1 inline-block"
                                                            style={{
                                                                position: 'relative',
                                                                top: '-0.5px',
                                                                left: '1px',
                                                            }}
                                                        />
                                                    </span>
                                                </Tooltip>
                                            </span>
                                        </label>
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                className="form-radio text-blue-500"
                                                name="answerEngine"
                                                value="agentOpencode"
                                                checked={formData.answerEngine === 'agentOpencode'}
                                                onChange={() => {
                                                    setFormData({
                                                        ...formData,
                                                        answerEngine: 'agentOpencode',
                                                    });
                                                }}
                                            />
                                            <span className="ml-2 text-sm text-zinc-300 flex items-center">
                                                <Tooltip
                                                    placement="top"
                                                    trigger={['hover', 'click']}
                                                    overlay={
                                                        <span className="text-zinc-100 bg-zinc-900 rounded-md p-2 inline-block max-w-xs">
                                                            Agent (Opencode): isolated OpenCode workspace. Send a message; cron copies Groq/OpenRouter keys into OpenCode settings, then runs OpenCode (input → settings → opencode → output).
                                                        </span>
                                                    }
                                                >
                                                    <span className="inline-block">
                                                        Agent (Opencode)
                                                        <LucideInfo
                                                            className="w-4 h-4 ml-1 inline-block"
                                                            style={{
                                                                position: 'relative',
                                                                top: '-0.5px',
                                                                left: '1px',
                                                            }}
                                                        />
                                                    </span>
                                                </Tooltip>
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {formData.answerEngine === 'agent' && (
                                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm text-zinc-300 mb-1">
                                            Min token budget
                                            <Tooltip
                                                placement="top"
                                                trigger={['hover', 'click']}
                                                overlay={
                                                    <span className="text-zinc-100 bg-zinc-900 rounded-md p-2 inline-block max-w-xs">
                                                        Soft floor before early synthesize. Range 1–1,000,000.
                                                    </span>
                                                }
                                            >
                                                <LucideInfo
                                                    className="w-4 h-4 ml-1 inline-block"
                                                    style={{ position: 'relative', top: '-0.5px', left: '1px' }}
                                                />
                                            </Tooltip>
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={minBudgetTokensInput}
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                setMinBudgetTokensInput(v);
                                                if (v !== '') {
                                                    const n = parseInt(v, 10);
                                                    if (!Number.isNaN(n)) {
                                                        setAgentMinBudgetTokens(Math.max(1, Math.min(1_000_000, n)));
                                                    }
                                                }
                                            }}
                                            onBlur={() => {
                                                if (minBudgetTokensInput === '') {
                                                    setMinBudgetTokensInput('1');
                                                    setAgentMinBudgetTokens(1);
                                                } else {
                                                    setMinBudgetTokensInput(String(agentMinBudgetTokens));
                                                }
                                            }}
                                            className="mt-1 block w-full rounded-md border border-zinc-700 px-2 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-zinc-300 mb-1">
                                            Max token budget
                                            <Tooltip
                                                placement="top"
                                                trigger={['hover', 'click']}
                                                overlay={
                                                    <span className="text-zinc-100 bg-zinc-900 rounded-md p-2 inline-block max-w-xs">
                                                        Hard stop when total tokens reach this. Range 1–1,000,000.
                                                    </span>
                                                }
                                            >
                                                <LucideInfo
                                                    className="w-4 h-4 ml-1 inline-block"
                                                    style={{ position: 'relative', top: '-0.5px', left: '1px' }}
                                                />
                                            </Tooltip>
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={maxBudgetTokensInput}
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                setMaxBudgetTokensInput(v);
                                                if (v !== '') {
                                                    const n = parseInt(v, 10);
                                                    if (!Number.isNaN(n)) {
                                                        setAgentMaxBudgetTokens(Math.max(1, Math.min(1_000_000, n)));
                                                    }
                                                }
                                            }}
                                            onBlur={() => {
                                                if (maxBudgetTokensInput === '') {
                                                    setMaxBudgetTokensInput('1000000');
                                                    setAgentMaxBudgetTokens(1_000_000);
                                                } else {
                                                    setMaxBudgetTokensInput(String(agentMaxBudgetTokens));
                                                }
                                            }}
                                            className="mt-1 block w-full rounded-md border border-zinc-700 px-2 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-zinc-300 mb-1">
                                            Min iterations
                                            <Tooltip
                                                placement="top"
                                                trigger={['hover', 'click']}
                                                overlay={
                                                    <span className="text-zinc-100 bg-zinc-900 rounded-md p-2 inline-block max-w-xs">
                                                        Soft floor of agent loop ticks. Range 1–100.
                                                    </span>
                                                }
                                            >
                                                <LucideInfo
                                                    className="w-4 h-4 ml-1 inline-block"
                                                    style={{ position: 'relative', top: '-0.5px', left: '1px' }}
                                                />
                                            </Tooltip>
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={minIterationsInput}
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                setMinIterationsInput(v);
                                                if (v !== '') {
                                                    const n = parseInt(v, 10);
                                                    if (!Number.isNaN(n)) {
                                                        setAgentMinNumberOfIterations(Math.max(1, Math.min(100, n)));
                                                    }
                                                }
                                            }}
                                            onBlur={() => {
                                                if (minIterationsInput === '') {
                                                    setMinIterationsInput('1');
                                                    setAgentMinNumberOfIterations(1);
                                                } else {
                                                    setMinIterationsInput(String(agentMinNumberOfIterations));
                                                }
                                            }}
                                            className="mt-1 block w-full rounded-md border border-zinc-700 px-2 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-zinc-300 mb-1">
                                            Max iterations
                                            <Tooltip
                                                placement="top"
                                                trigger={['hover', 'click']}
                                                overlay={
                                                    <span className="text-zinc-100 bg-zinc-900 rounded-md p-2 inline-block max-w-xs">
                                                        Hard stop of agent loop ticks. Range 1–100.
                                                    </span>
                                                }
                                            >
                                                <LucideInfo
                                                    className="w-4 h-4 ml-1 inline-block"
                                                    style={{ position: 'relative', top: '-0.5px', left: '1px' }}
                                                />
                                            </Tooltip>
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={maxIterationsInput}
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                setMaxIterationsInput(v);
                                                if (v !== '') {
                                                    const n = parseInt(v, 10);
                                                    if (!Number.isNaN(n)) {
                                                        setAgentMaxNumberOfIterations(Math.max(1, Math.min(100, n)));
                                                    }
                                                }
                                            }}
                                            onBlur={() => {
                                                if (maxIterationsInput === '') {
                                                    setMaxIterationsInput('100');
                                                    setAgentMaxNumberOfIterations(100);
                                                } else {
                                                    setMaxIterationsInput(String(agentMaxNumberOfIterations));
                                                }
                                            }}
                                            className="mt-1 block w-full rounded-md border border-zinc-700 px-2 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-zinc-300 mb-1">
                                            Actions to pass
                                            <Tooltip
                                                placement="top"
                                                trigger={['hover', 'click']}
                                                overlay={
                                                    <span className="text-zinc-100 bg-zinc-900 rounded-md p-2 inline-block max-w-xs">
                                                        Recent chat/tool actions kept raw in the agent prompt. Range 1–500. Older actions are summarized.
                                                    </span>
                                                }
                                            >
                                                <LucideInfo
                                                    className="w-4 h-4 ml-1 inline-block"
                                                    style={{ position: 'relative', top: '-0.5px', left: '1px' }}
                                                />
                                            </Tooltip>
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={contextActionLimitInput}
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                setContextActionLimitInput(v);
                                                if (v !== '') {
                                                    const n = parseInt(v, 10);
                                                    if (!Number.isNaN(n)) {
                                                        setAgentContextActionLimit(Math.max(1, Math.min(500, n)));
                                                    }
                                                }
                                            }}
                                            onBlur={() => {
                                                if (contextActionLimitInput === '') {
                                                    setContextActionLimitInput('100');
                                                    setAgentContextActionLimit(100);
                                                } else {
                                                    setContextActionLimitInput(String(agentContextActionLimit));
                                                }
                                            }}
                                            className="mt-1 block w-full rounded-md border border-zinc-700 px-2 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-zinc-300 mb-1">
                                            Summaries to pass
                                            <Tooltip
                                                placement="top"
                                                trigger={['hover', 'click']}
                                                overlay={
                                                    <span className="text-zinc-100 bg-zinc-900 rounded-md p-2 inline-block max-w-xs">
                                                        How many rolling summaries to keep in the prompt. Range 1–50. Older summaries fold into one global summary.
                                                    </span>
                                                }
                                            >
                                                <LucideInfo
                                                    className="w-4 h-4 ml-1 inline-block"
                                                    style={{ position: 'relative', top: '-0.5px', left: '1px' }}
                                                />
                                            </Tooltip>
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={contextSummaryCountInput}
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                setContextSummaryCountInput(v);
                                                if (v !== '') {
                                                    const n = parseInt(v, 10);
                                                    if (!Number.isNaN(n)) {
                                                        setAgentContextSummaryCount(Math.max(1, Math.min(50, n)));
                                                    }
                                                }
                                            }}
                                            onBlur={() => {
                                                if (contextSummaryCountInput === '') {
                                                    setContextSummaryCountInput('10');
                                                    setAgentContextSummaryCount(10);
                                                } else {
                                                    setContextSummaryCountInput(String(agentContextSummaryCount));
                                                }
                                            }}
                                            className="mt-1 block w-full rounded-md border border-zinc-700 px-2 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-zinc-300 mb-1">
                                            Messages per summary
                                            <Tooltip
                                                placement="top"
                                                trigger={['hover', 'click']}
                                                overlay={
                                                    <span className="text-zinc-100 bg-zinc-900 rounded-md p-2 inline-block max-w-xs">
                                                        How many older actions are compacted into each rolling summary. Range 1–50.
                                                    </span>
                                                }
                                            >
                                                <LucideInfo
                                                    className="w-4 h-4 ml-1 inline-block"
                                                    style={{ position: 'relative', top: '-0.5px', left: '1px' }}
                                                />
                                            </Tooltip>
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={contextMessagesPerSummaryInput}
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                setContextMessagesPerSummaryInput(v);
                                                if (v !== '') {
                                                    const n = parseInt(v, 10);
                                                    if (!Number.isNaN(n)) {
                                                        setAgentContextMessagesPerSummary(Math.max(1, Math.min(50, n)));
                                                    }
                                                }
                                            }}
                                            onBlur={() => {
                                                if (contextMessagesPerSummaryInput === '') {
                                                    setContextMessagesPerSummaryInput('10');
                                                    setAgentContextMessagesPerSummary(10);
                                                } else {
                                                    setContextMessagesPerSummaryInput(String(agentContextMessagesPerSummary));
                                                }
                                            }}
                                            className="mt-1 block w-full rounded-md border border-zinc-700 px-2 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-zinc-300 mb-1">
                                            Script max tokens
                                            <Tooltip
                                                placement="top"
                                                trigger={['hover', 'click']}
                                                overlay={
                                                    <span className="text-zinc-100 bg-zinc-900 rounded-md p-2 inline-block max-w-xs">
                                                        Per-call limit when generating a script file. Raise this if scripts are cut off and fail when executed. Range 512–128,000. Default 8,192. Auto-scale stays within this value and never exceeds it.
                                                    </span>
                                                }
                                            >
                                                <LucideInfo
                                                    className="w-4 h-4 ml-1 inline-block"
                                                    style={{ position: 'relative', top: '-0.5px', left: '1px' }}
                                                />
                                            </Tooltip>
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={scriptMaxTokensInput}
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                setScriptMaxTokensInput(v);
                                                if (v !== '') {
                                                    const n = parseInt(v, 10);
                                                    if (!Number.isNaN(n)) {
                                                        setAgentScriptMaxTokens(Math.max(512, Math.min(128_000, n)));
                                                    }
                                                }
                                            }}
                                            onBlur={() => {
                                                if (scriptMaxTokensInput === '') {
                                                    setScriptMaxTokensInput('8192');
                                                    setAgentScriptMaxTokens(8192);
                                                } else {
                                                    setScriptMaxTokensInput(String(agentScriptMaxTokens));
                                                }
                                            }}
                                            className="mt-1 block w-full rounded-md border border-zinc-700 px-2 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            )}
                            {formData.answerEngine === 'agentOpencode' && (
                                <div className="mt-4 rounded-md border border-cyan-900/50 bg-cyan-950/20 p-3">
                                    <div className="mb-2 text-sm font-semibold text-cyan-200">Agent (Opencode) Settings</div>
                                    <div className="mb-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="rounded-sm"
                                                checked={opencodeMcpEnabled}
                                                onChange={(e) => setOpencodeMcpEnabled(e.target.checked)}
                                            />
                                        <span className="text-sm text-zinc-300">Enable MCP (search + add_chat_file)</span>
                                        <Tooltip
                                            placement="top"
                                            trigger={['hover', 'click']}
                                            overlay={
                                                <span className="text-zinc-100 bg-zinc-900 rounded-md p-2 inline-block max-w-xs">
                                                    When enabled, OpenCode registers the remote MCP server (ai-notes-xyz) so it can search notes/tasks and attach files to the chat message.
                                                </span>
                                            }
                                        >
                                            <LucideInfo className="w-4 h-4 inline-block text-zinc-400" style={{ position: 'relative', top: '-0.5px', left: '1px' }} />
                                        </Tooltip>
                                    </label>
                                    <p className="mt-1 text-xs text-zinc-400">
                                        MCP tools are registered in opencode.json. Same thread model (selected above) is used for Opencode.
                                    </p>
                                </div>
                                <div className="mb-2">
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
                                    <p className="mt-1 text-xs text-zinc-400">
                                        The Opencode run is aborted after this much time. Useful to stop long-running tasks.
                                    </p>
                                </div>
                                <p className="text-xs text-zinc-500">Thread model <span className="font-mono text-zinc-300">{aiModelProvider}/{aiModelName}</span> will be used for Opencode.</p>
                                </div>
                            )}
                        </div>

                        {/* field -> isPersonalContextEnabled */}
                        <div className="mb-2 lg:mb-3">
                            <label className="block text-sm font-medium text-zinc-300 mb-1 lg:mb-2">Personal Context</label>
                            <div
                                onClick={() => {
                                    const newIsPersonalContextEnabled = !formData.isPersonalContextEnabled;
                                    setFormData({
                                        ...formData,
                                        isPersonalContextEnabled: newIsPersonalContextEnabled,
                                        // Disable memory when personal context is disabled
                                        isMemoryEnabled: newIsPersonalContextEnabled ? formData.isMemoryEnabled : false
                                    });
                                }}
                            >
                                <input
                                    type="checkbox"
                                    className="mt-1 rounded-sm p-1 lg:p-2 mr-2"
                                    checked={formData.isPersonalContextEnabled}
                                />
                                <span className="text-sm text-zinc-300 cursor-pointer">Personal Context Enable</span>
                            </div>
                        </div>

                        {/* field -> isAutoAiContextSelectEnabled */}
                        {formData.isPersonalContextEnabled && (
                            <div className="mb-2 lg:mb-3">
                                <label className="block text-sm font-medium text-zinc-300 mb-1 lg:mb-2">Auto AI Context</label>
                                <div
                                    onClick={() => {
                                        setFormData({ ...formData, isAutoAiContextSelectEnabled: !formData.isAutoAiContextSelectEnabled });
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        className="mt-1 rounded-sm p-1 lg:p-2 mr-2"
                                        checked={formData.isAutoAiContextSelectEnabled}
                                    />
                                    <span className="text-sm text-zinc-300 cursor-pointer">Auto AI Context Enable</span>
                                </div>
                            </div>
                        )}

                        {/* field -> isMemoryEnabled */}
                        {formData.isPersonalContextEnabled && (
                            <div className="mb-2 lg:mb-3">
                                <label className="block text-sm font-medium text-zinc-300 mb-1 lg:mb-2">Memory</label>
                                <div
                                    onClick={() => {
                                        setFormData({ ...formData, isMemoryEnabled: !formData.isMemoryEnabled });
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        className="mt-1 rounded-sm p-1 lg:p-2 mr-2"
                                        checked={formData.isMemoryEnabled}
                                    />
                                    <span className="text-sm text-zinc-300 cursor-pointer">Memory Enable</span>
                                </div>
                                <p className="mt-1 text-xs text-zinc-400">When enabled, AI will use your stored memories to provide more personalized responses.</p>
                            </div>
                        )}

                        {/* field -> useOmniparser */}
                        <div className="mb-2 lg:mb-3">
                            <label className="block text-sm font-medium text-zinc-300 mb-1 lg:mb-2">Omniparser (Replicate)</label>
                            <div
                                onClick={() => {
                                    setFormData({ ...formData, useOmniparser: !formData.useOmniparser });
                                }}
                            >
                                <input
                                    type="checkbox"
                                    className="mt-1 rounded-sm p-1 lg:p-2 mr-2"
                                    checked={formData.useOmniparser}
                                />
                                <span className="text-sm text-zinc-300 cursor-pointer">Use Omniparser-v2 (Replicate) for GUI parsing</span>
                            </div>
                            <p className="mt-1 text-xs text-zinc-400">When enabled and Replicate API key is configured, agent will use microsoft/omniparser-v2 for GUI element detection (screenshot → parsed UI). Requires Replicate key in Settings → API Keys.</p>
                        </div>

                        {/* field -> context search */}
                        {formData.isPersonalContextEnabled && (
                            <ThreadSettingContextSearch
                                threadId={threadSetting._id}
                            />
                        )}

                    </div>
                    <div className="sticky bottom-0 bg-zinc-900 border-t border-zinc-700 p-2 lg:p-3 mt-2 lg:mt-3">
                        <div className="flex justify-between items-center gap-1"
                            style={{
                                width: '100%',
                                maxWidth: '200px',
                                margin: '0 auto',
                            }}
                        >
                            {/* button -> close */}
                            <button
                                className="w-full bg-zinc-600 hover:bg-zinc-500 text-white text-sm px-2 py-1 rounded-sm transition-colors duration-200 w-full"
                                onClick={() => {
                                    closeModal();
                                }}
                            >
                                <LucideX
                                    className="w-4 h-4 inline-block"
                                    style={{
                                        marginTop: '-3px',
                                    }}
                                />
                            </button>
                            {/* button -> save */}
                            <Fragment>
                                {requestEdit.loading && (
                                    <button
                                        className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm px-2 py-1 rounded-sm transition-colors duration-200 w-full"
                                    >
                                        <LucideLoader className="w-4 h-4 inline-block"
                                            style={{
                                                marginTop: '-3px',
                                            }}
                                        />
                                    </button>
                                )}
                                {!requestEdit.loading && (
                                    <button
                                        className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm px-2 py-1 rounded-sm transition-colors duration-200 w-full"
                                        onClick={() => {
                                            editRecord();
                                        }}
                                    >
                                        <LucideSave
                                            className="w-4 h-4 inline-block"
                                            style={{
                                                marginTop: '-3px',
                                            }}
                                        />
                                    </button>
                                )}
                            </Fragment>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            className="bg-gradient-to-r from-zinc-900 to-zinc-900 rounded-sm p-1 lg:p-2 h-full"
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