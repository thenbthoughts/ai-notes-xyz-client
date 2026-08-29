import { useNavigate } from "react-router-dom";
import axiosCustom from "../../../../../../config/axiosCustom";
import toast from "react-hot-toast";
import { MessageCircle, LucideInfo } from "lucide-react";
import { SelectModel } from "../../component/selectModel";
import { useState, useEffect } from "react";
import { jotaiChatThreadRefreshRandomNum } from "../../jotai/jotaiChatLlmThreadSetting";
import { useSetAtom } from "jotai";
import Tooltip from '@rc-component/tooltip';
import { AGENT_OPENCODE_MAX_ANSWER_TIME_OPTIONS } from "../../../../../../types/pages/schemaChatLlmThread.types";

const ComponentThreadAdd = () => {
    const navigate = useNavigate();
    const setJotaiChatThreadRefreshRandomNum = useSetAtom(jotaiChatThreadRefreshRandomNum);
    const [formData, setFormData] = useState({
        isPersonalContextEnabled: false,
        isAutoAiContextSelectEnabled: false,
        isMemoryEnabled: false,
        useOmniparser: false,

        // answer type
        answerEngine: 'conciseAnswer' as 'conciseAnswer' | 'agent' | 'agentOpencode',
    });

    const [agentMinBudgetTokens, setAgentMinBudgetTokens] = useState<number>(1);
    const [agentMaxBudgetTokens, setAgentMaxBudgetTokens] = useState<number>(1_000_000);
    const [agentMinNumberOfIterations, setAgentMinNumberOfIterations] = useState<number>(1);
    const [agentMaxNumberOfIterations, setAgentMaxNumberOfIterations] = useState<number>(100);
    const [agentContextActionLimit, setAgentContextActionLimit] = useState<number>(100);
    const [agentContextSummaryCount, setAgentContextSummaryCount] = useState<number>(10);
    const [agentContextMessagesPerSummary, setAgentContextMessagesPerSummary] = useState<number>(10);
    const [agentScriptMaxTokens, setAgentScriptMaxTokens] = useState<number>(8192);
    const [minBudgetTokensInput, setMinBudgetTokensInput] = useState<string>('1');
    const [maxBudgetTokensInput, setMaxBudgetTokensInput] = useState<string>('1000000');
    const [minIterationsInput, setMinIterationsInput] = useState<string>('1');
    const [maxIterationsInput, setMaxIterationsInput] = useState<string>('100');
    const [contextActionLimitInput, setContextActionLimitInput] = useState<string>('100');
    const [contextSummaryCountInput, setContextSummaryCountInput] = useState<string>('10');
    const [contextMessagesPerSummaryInput, setContextMessagesPerSummaryInput] = useState<string>('10');
    const [scriptMaxTokensInput, setScriptMaxTokensInput] = useState<string>('8192');

    const [aiModelProvider, setAiModelProvider] = useState("openrouter" as "openrouter" | "groq" | "ollama" | "localai" | "openai-compatible");
    const [aiModelName, setAiModelName] = useState("openrouter/auto");
    const [aiModelOpenAiCompatibleConfigId, setAiModelOpenAiCompatibleConfigId] = useState<string | null>(null);

    // STT (Speech-to-Text)
    const [sttModelName, setSttModelName] = useState('');
    const [sttModelProvider, setSttModelProvider] = useState('');

    // TTS (Text-to-Speech)
    const [ttsModelName, setTtsModelName] = useState('');
    const [ttsModelProvider, setTtsModelProvider] = useState('');

    // Opencode settings (MCP toggle; model is same as thread aiModel)
    const [opencodeMcpEnabled, setOpencodeMcpEnabled] = useState(true);
    const [opencodeMaxAnswerTimeMinutes, setOpencodeMaxAnswerTimeMinutes] = useState(60);

    const [selectRandomModel, setSelectRandomModel] = useState(0);

    const [isAddThreadLoading, setIsAddThreadLoading] = useState(false);

    // Fetch and auto-select last used model on component mount
    useEffect(() => {
        const fetchLastUsedModel = async () => {
            try {
                const response = await axiosCustom.get('/api/chat-llm/threads-crud/lastUsedLlmModel');

                if (response.data.model) {
                    const { aiModelProvider, aiModelName, aiModelOpenAiCompatibleConfigId } = response.data.model;

                    // Set the provider first
                    setAiModelProvider(aiModelProvider as "openrouter" | "groq" | "ollama" | "localai" | "openai-compatible");

                    // Set the model name
                    setAiModelName(aiModelName);

                    // Set the OpenAI compatible config ID if it exists
                    if (aiModelOpenAiCompatibleConfigId) {
                        setAiModelOpenAiCompatibleConfigId(aiModelOpenAiCompatibleConfigId);
                    }
                }
            } catch (error) {
                console.error('Error fetching last used model:', error);
                // Don't show error to user, just continue with default model
            }
        };

        fetchLastUsedModel();
    }, []);

    const addNewThread = async () => {
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

        setIsAddThreadLoading(true);
        try {
            const isAgent = formData.answerEngine === 'agent';
            const result = await axiosCustom.post(
                '/api/chat-llm/threads-crud/threadsAdd',
                {
                    isPersonalContextEnabled: formData.isPersonalContextEnabled,
                    isAutoAiContextSelectEnabled: formData.isAutoAiContextSelectEnabled,
                    isMemoryEnabled: formData.isMemoryEnabled,
                    useOmniparser: formData.useOmniparser,

                    // answer engine — shell only for agent (no UI toggle)
                    answerEngine: formData.answerEngine,
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

                    // opencode settings (MCP; model same as thread)
                    opencodeMcpEnabled,
                    opencodeMaxAnswerTimeMinutes,
                }
            );

            const tempThreadId = result?.data?.thread?._id;
            if (tempThreadId) {
                if (typeof tempThreadId === 'string') {
                    setJotaiChatThreadRefreshRandomNum(Math.floor(Math.random() * 1_000_000));

                    const redirectUrl = `/user/chat?id=${tempThreadId}`;
                    navigate(redirectUrl);
                }
            }

            toast.success('New thread added successfully!');
        } catch (error) {
            alert('Error adding new thread: ' + error);
        } finally {
            setIsAddThreadLoading(false);
        }
    };

    return (
        <div
            className="bg-[radial-gradient(ellipse_100%_60%_at_50%_-10%,rgba(45,212,191,0.07),transparent_55%),linear-gradient(to_bottom,#09090b,#18181b)]"
            style={{
                height: 'calc(-60px + 100vh)',
                overflowY: 'auto',
            }}
        >
            <div className="mx-auto max-w-2xl px-3 py-5 sm:p-8">
                <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-900/20">
                        <MessageCircle className="h-6 w-6" strokeWidth={2} />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
                            New chat
                        </h1>
                        <span className="text-sm text-zinc-500">Choose a model, then start</span>
                    </div>
                </div>

                <p className="mb-6 text-sm leading-relaxed text-zinc-400">
                    Configure the assistant once. You can change models anytime in thread settings.
                </p>

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
                    selectRandomModel={selectRandomModel}
                    setSelectRandomModel={setSelectRandomModel}
                />

                <div className="mb-5 rounded-2xl border border-zinc-700/80 bg-zinc-900/90 p-4 shadow-lg shadow-zinc-900/[0.04] ring-1 ring-zinc-700/[0.02] backdrop-blur-sm sm:p-5">
                    <div className="flex flex-col lg:flex-row lg:space-x-8 space-y-4 lg:space-y-0">
                        <div className="flex-1">
                            <div className="text-sm text-zinc-300 mb-2">Answer Engine</div>
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
                                                Agent (beta)
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
                                    className="mt-1 block w-full rounded-md border border-zinc-600 px-2 py-1.5 text-sm shadow-sm focus:border-teal-500 focus:ring-teal-500"
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
                                                Hard stop when total tokens reach this. Range 1–1,000,000. Must be ≥ min.
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
                                    className="mt-1 block w-full rounded-md border border-zinc-600 px-2 py-1.5 text-sm shadow-sm focus:border-teal-500 focus:ring-teal-500"
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
                                                Soft floor of agent loop ticks before early synthesize. Range 1–100.
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
                                    className="mt-1 block w-full rounded-md border border-zinc-600 px-2 py-1.5 text-sm shadow-sm focus:border-teal-500 focus:ring-teal-500"
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
                                                Hard stop of agent loop ticks. Range 1–100. Must be ≥ min.
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
                                    className="mt-1 block w-full rounded-md border border-zinc-600 px-2 py-1.5 text-sm shadow-sm focus:border-teal-500 focus:ring-teal-500"
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
                                    className="mt-1 block w-full rounded-md border border-zinc-600 px-2 py-1.5 text-sm shadow-sm focus:border-teal-500 focus:ring-teal-500"
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
                                    className="mt-1 block w-full rounded-md border border-zinc-600 px-2 py-1.5 text-sm shadow-sm focus:border-teal-500 focus:ring-teal-500"
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
                                    className="mt-1 block w-full rounded-md border border-zinc-600 px-2 py-1.5 text-sm shadow-sm focus:border-teal-500 focus:ring-teal-500"
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
                                    className="mt-1 block w-full rounded-md border border-zinc-600 px-2 py-1.5 text-sm shadow-sm focus:border-teal-500 focus:ring-teal-500"
                                />
                            </div>
                        </div>
                    )}
                    {formData.answerEngine === 'agentOpencode' && (
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
                            <p className="mt-1 text-xs text-zinc-400">Same thread model (<span className="font-mono">{aiModelProvider}/{aiModelName}</span>) will be used for Opencode.</p>
                        </div>
                    )}
                    {formData.answerEngine === 'agent' && (
                        <div className="mt-4 mb-2">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="rounded-sm mr-2"
                                    checked={formData.useOmniparser}
                                    onChange={() => setFormData({ ...formData, useOmniparser: !formData.useOmniparser })}
                                />
                                <span className="text-sm text-zinc-300">Use Omniparser-v2 (Replicate) for GUI parsing</span>
                            </label>
                            <p className="mt-1 text-xs text-zinc-400">When enabled and Replicate key is set, agent can parse screenshots via microsoft/omniparser-v2 for UI element detection.</p>
                        </div>
                    )}
                </div>

                <div className="mb-5 rounded-2xl border border-zinc-700/80 bg-zinc-900/90 p-4 shadow-lg shadow-zinc-900/[0.04] ring-1 ring-zinc-700/[0.02] backdrop-blur-sm sm:p-5">
                    <div className="flex flex-col lg:flex-row lg:space-x-8 space-y-4 lg:space-y-0">
                        {/* field -> isPersonalContextEnabled */}
                        <div className="flex-1">
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
                                    className="rounded-sm mr-2"
                                    checked={formData.isPersonalContextEnabled}
                                />
                                <span className="text-sm text-zinc-300 cursor-pointer">Personal Context Enable</span>
                            </div>
                        </div>

                        {/* field -> isAutoAiContextSelectEnabled */}
                        {formData.isPersonalContextEnabled && (
                            <div className="flex-1">
                                <div
                                    onClick={() => {
                                        setFormData({ ...formData, isAutoAiContextSelectEnabled: !formData.isAutoAiContextSelectEnabled });
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        className="rounded-sm mr-2"
                                        checked={formData.isAutoAiContextSelectEnabled}
                                    />
                                    <span className="text-sm text-zinc-300 cursor-pointer">Auto AI Context Enable</span>
                                </div>
                            </div>
                        )}

                        {/* field -> isMemoryEnabled */}
                        {formData.isPersonalContextEnabled && (
                            <div className="flex-1">
                                <div
                                    onClick={() => {
                                        setFormData({ ...formData, isMemoryEnabled: !formData.isMemoryEnabled });
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        className="rounded-sm mr-2"
                                        checked={formData.isMemoryEnabled}
                                    />
                                    <span className="text-sm text-zinc-300 cursor-pointer">Memory Enable</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mb-4">
                    <button
                        type="button"
                        onClick={addNewThread}
                        disabled={isAddThreadLoading}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-900/20 transition-all hover:from-teal-500 hover:to-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isAddThreadLoading ? (
                            <span className="text-xs">Starting…</span>
                        ) : (
                            <>
                                <MessageCircle className="h-4 w-4" strokeWidth={2} />
                                Start chat
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ComponentThreadAdd;