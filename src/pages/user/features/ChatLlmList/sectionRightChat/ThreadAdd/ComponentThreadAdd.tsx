import { Link, useNavigate } from "react-router-dom";
import axiosCustom from "../../../../../../config/axiosCustom";
import toast from "react-hot-toast";
import { MessageCircle, LucideInfo } from "lucide-react";
import { SelectModel } from "../../component/selectModel";
import { useState, useEffect } from "react";
import { jotaiChatThreadRefreshRandomNum } from "../../jotai/jotaiChatLlmThreadSetting";
import { useAtomValue, useSetAtom } from "jotai";
import Tooltip from '@rc-component/tooltip';
import stateJotaiAuthAtom from "../../../../../../jotai/stateJotaiAuth";

const ComponentThreadAdd = () => {
    const navigate = useNavigate();
    const setJotaiChatThreadRefreshRandomNum = useSetAtom(jotaiChatThreadRefreshRandomNum);
    const authState = useAtomValue(stateJotaiAuthAtom);
    const [formData, setFormData] = useState({
        isPersonalContextEnabled: false,
        isAutoAiContextSelectEnabled: false,
        isMemoryEnabled: false,

        // answer type
        answerEngine: 'conciseAnswer' as 'conciseAnswer' | 'answerMachine4',
        executeShell: false,
    });

    const [answerMachineMinNumberOfIterations, setAnswerMachineMinNumberOfIterations] = useState<number>(1);
    const [answerMachineMaxNumberOfIterations, setAnswerMachineMaxNumberOfIterations] = useState<number>(7);

    const [shellExecuteMinAttempts, setShellExecuteMinAttempts] = useState<number>(1);
    const [shellExecuteMaxAttempts, setShellExecuteMaxAttempts] = useState<number>(1);
    const [shellMinAttemptsInput, setShellMinAttemptsInput] = useState<string>('1');
    const [shellMaxAttemptsInput, setShellMaxAttemptsInput] = useState<string>('1');

    // Input display states (strings) to allow empty inputs
    const [minIterationsInput, setMinIterationsInput] = useState<string>('1');
    const [maxIterationsInput, setMaxIterationsInput] = useState<string>('7');

    const [aiModelProvider, setAiModelProvider] = useState("openrouter" as "openrouter" | "groq" | "ollama" | "localai" | "openai-compatible");
    const [aiModelName, setAiModelName] = useState("openrouter/auto");
    const [aiModelOpenAiCompatibleConfigId, setAiModelOpenAiCompatibleConfigId] = useState<string | null>(null);

    // STT (Speech-to-Text)
    const [sttModelName, setSttModelName] = useState('');
    const [sttModelProvider, setSttModelProvider] = useState('');

    // TTS (Text-to-Speech)
    const [ttsModelName, setTtsModelName] = useState('');
    const [ttsModelProvider, setTtsModelProvider] = useState('');

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
        if (answerMachineMinNumberOfIterations > answerMachineMaxNumberOfIterations) {
            toast.error('Minimum iterations cannot be greater than maximum iterations');
            return;
        }

        if (formData.executeShell && shellExecuteMinAttempts > shellExecuteMaxAttempts) {
            toast.error('Shell min retries cannot be greater than shell max retries');
            return;
        }

        setIsAddThreadLoading(true);
        try {
            const effShellMin = shellExecuteMinAttempts;
            const effShellMax = shellExecuteMaxAttempts;
            const result = await axiosCustom.post(
                '/api/chat-llm/threads-crud/threadsAdd',
                {
                    isPersonalContextEnabled: formData.isPersonalContextEnabled,
                    isAutoAiContextSelectEnabled: formData.isAutoAiContextSelectEnabled,
                    isMemoryEnabled: formData.isMemoryEnabled,

                    // answer engine
                    answerEngine: formData.answerEngine,
                    executeShell: formData.executeShell,
                    shellExecuteMinAttempts: effShellMin,
                    shellExecuteMaxAttempts: effShellMax,

                    // answer machine settings
                    answerMachineMinNumberOfIterations: answerMachineMinNumberOfIterations,
                    answerMachineMaxNumberOfIterations: answerMachineMaxNumberOfIterations,

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
            className="bg-[radial-gradient(ellipse_100%_60%_at_50%_-10%,rgba(45,212,191,0.07),transparent_55%),linear-gradient(to_bottom,#f8fafc,#f4f4f5)]"
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
                        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
                            New chat
                        </h1>
                        <span className="text-sm text-zinc-500">Choose a model, then start</span>
                    </div>
                </div>

                <p className="mb-6 text-sm leading-relaxed text-zinc-600">
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

                <div className="mb-5 rounded-2xl border border-zinc-200/80 bg-white/90 p-4 shadow-lg shadow-zinc-900/[0.04] ring-1 ring-black/[0.02] backdrop-blur-sm sm:p-5">
                    <div className="flex flex-col lg:flex-row lg:space-x-8 space-y-4 lg:space-y-0">
                        <div className="flex-1">
                            <div className="text-sm text-gray-700 mb-2">Answer Engine</div>
                            <div className="flex flex-row flex-wrap gap-x-6 gap-y-2">
                                <label className="inline-flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        className="form-radio text-blue-500"
                                        name="answerEngine"
                                        value="conciseAnswer"
                                        checked={formData.answerEngine === "conciseAnswer"}
                                        onChange={() => setFormData({ ...formData, answerEngine: "conciseAnswer" })}
                                    />
                                    <Tooltip
                                        placement="top"
                                        trigger={['hover', 'click']}
                                        overlay={<span
                                            className="text-black bg-white rounded-md p-2 inline-block"
                                        >
                                            Concise answer is a shorter and more direct response.
                                        </span>}
                                    >
                                        <span className="ml-2 text-sm text-gray-700 inline-block">
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
                                        value="answerMachine4"
                                        checked={formData.answerEngine === 'answerMachine4'}
                                        onChange={() => setFormData({ ...formData, answerEngine: 'answerMachine4' })}
                                    />
                                    <span className="ml-2 text-sm text-gray-700 flex items-center">
                                        <Tooltip
                                            placement="top"
                                            trigger={['hover', 'click']}
                                            overlay={
                                                <span className="text-black bg-white rounded-md p-2 inline-block max-w-xs">
                                                    Answer Machine 4: OpenCode-only reasoning. Large attachments are written to the Shell workspace and passed as container paths (no shell steps in the AM4 loop).
                                                </span>
                                            }
                                        >
                                            <span className="inline-block">
                                                Answer Machine 4
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

                    <div className="mt-3 flex flex-col gap-1">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                className="rounded border-zinc-300 text-teal-600 focus:ring-teal-500"
                                checked={formData.executeShell}
                                disabled={!authState.shellEngineValid}
                                onChange={(e) => setFormData({ ...formData, executeShell: e.target.checked })}
                            />
                            <span className="text-sm text-zinc-800">Execute shell</span>
                        </label>
                        {!authState.shellEngineValid && (
                            <p className="text-xs text-zinc-500">
                                Configure Shell execute in{' '}
                                <Link to="/user/setting/api-key" className="text-teal-600 underline">
                                    API Keys
                                </Link>{' '}
                                to enable.
                            </p>
                        )}
                        {formData.answerEngine === 'answerMachine4' && formData.executeShell && (
                            <p className="text-xs text-zinc-500">
                                Shell runs before Answer Machine 4 starts, using the same shell service as Concise. AM4 reasoning uses OpenCode only; file uploads use the Shell file API when you attach files.
                            </p>
                        )}
                        {formData.executeShell &&
                            authState.shellEngineValid && (
                            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm text-zinc-700 mb-1">
                                        Min shell retries
                                        <Tooltip
                                            placement="top"
                                            trigger={['hover', 'click']}
                                            overlay={
                                                <span className="text-black bg-white rounded-md p-2 inline-block max-w-xs">
                                                    First attempt index for each shell todo’s primary command (inclusive).
                                                    Usually 1. Range 1–10.
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
                                        value={shellMinAttemptsInput}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            setShellMinAttemptsInput(v);
                                            if (v !== '') {
                                                const n = parseInt(v, 10);
                                                if (!Number.isNaN(n)) {
                                                    setShellExecuteMinAttempts(Math.max(1, Math.min(10, n)));
                                                }
                                            }
                                        }}
                                        onBlur={() => {
                                            if (shellMinAttemptsInput === '') {
                                                setShellMinAttemptsInput('1');
                                                setShellExecuteMinAttempts(1);
                                            }
                                        }}
                                        className="mt-1 block w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm shadow-sm focus:border-teal-500 focus:ring-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-zinc-700 mb-1">
                                        Max shell retries
                                        <Tooltip
                                            placement="top"
                                            trigger={['hover', 'click']}
                                            overlay={
                                                <span className="text-black bg-white rounded-md p-2 inline-block max-w-xs">
                                                    Maximum attempt index for each shell todo’s primary command
                                                    (inclusive). Retries on failure until this cap. Range 1–10.
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
                                        value={shellMaxAttemptsInput}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            setShellMaxAttemptsInput(v);
                                            if (v !== '') {
                                                const n = parseInt(v, 10);
                                                if (!Number.isNaN(n)) {
                                                    setShellExecuteMaxAttempts(Math.max(1, Math.min(10, n)));
                                                }
                                            }
                                        }}
                                        onBlur={() => {
                                            if (shellMaxAttemptsInput === '') {
                                                setShellMaxAttemptsInput('1');
                                                setShellExecuteMaxAttempts(1);
                                            }
                                        }}
                                        className="mt-1 block w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm shadow-sm focus:border-teal-500 focus:ring-teal-500"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Answer Machine Iterations Setting */}
                    {formData.answerEngine === 'answerMachine4' && (
                        <div className="mt-3 space-y-3">
                            <div>
                                <label className="block text-sm text-gray-700 mb-1 lg:mb-2">
                                    Min Iterations
                                    <Tooltip
                                        placement="top"
                                        trigger={['hover', 'click']}
                                        overlay={<span
                                            className="text-black bg-white rounded-md p-2 inline-block max-w-xs"
                                        >
                                            Minimum number of iterations the Answer Machine will perform. The answer machine will always run at least this many iterations, even if the answer is satisfactory earlier.
                                        </span>}
                                    >
                                        <LucideInfo className="w-4 h-4 ml-1 inline-block"
                                            style={{
                                                position: 'relative',
                                                top: '-0.5px',
                                                left: '1px',
                                            }}
                                        />
                                    </Tooltip>
                                </label>
                                <input
                                    value={minIterationsInput}
                                    onChange={(e) => {
                                        const inputValue = e.target.value;
                                        setMinIterationsInput(inputValue);

                                        // Only update the numeric state if input is not empty
                                        if (inputValue !== '') {
                                            const parsedValue = parseInt(inputValue);
                                            if (!isNaN(parsedValue)) {
                                                const newMin = Math.max(1, Math.min(100, parsedValue));
                                                setAnswerMachineMinNumberOfIterations(newMin);
                                            }
                                        }
                                    }}
                                    onBlur={() => {
                                        // When input loses focus, ensure it has a valid value
                                        if (minIterationsInput === '') {
                                            setMinIterationsInput('1');
                                            setAnswerMachineMinNumberOfIterations(1);
                                        }
                                    }}
                                    className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm p-1 lg:p-2"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Minimum number of iterations (1-100). Default is 1. Must be ≤ Max Iterations.
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700 mb-1 lg:mb-2">
                                    Max Iterations
                                    <Tooltip
                                        placement="top"
                                        trigger={['hover', 'click']}
                                        overlay={<span
                                            className="text-black bg-white rounded-md p-2 inline-block max-w-xs"
                                        >
                                            Maximum number of times the Answer Machine will iterate to improve the answer. Higher values may produce better answers but take longer and use more tokens. Must be ≥ Min Iterations.
                                        </span>}
                                    >
                                        <LucideInfo className="w-4 h-4 ml-1 inline-block"
                                            style={{
                                                position: 'relative',
                                                top: '-0.5px',
                                                left: '1px',
                                            }}
                                        />
                                    </Tooltip>
                                </label>
                                <input
                                    value={maxIterationsInput}
                                    onChange={(e) => {
                                        const inputValue = e.target.value;
                                        setMaxIterationsInput(inputValue);

                                        // Only update the numeric state if input is not empty
                                        if (inputValue !== '') {
                                            const parsedValue = parseInt(inputValue);
                                            if (!isNaN(parsedValue)) {
                                                const newMax = Math.max(1, Math.min(100, parsedValue));
                                                setAnswerMachineMaxNumberOfIterations(newMax);
                                            }
                                        }
                                    }}
                                    onBlur={() => {
                                        // When input loses focus, ensure it has a valid value
                                        if (maxIterationsInput === '') {
                                            setMaxIterationsInput('1');
                                            setAnswerMachineMaxNumberOfIterations(1);
                                        }
                                    }}
                                    className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm p-1 lg:p-2"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Maximum number of iterations (1-100). Default is 1. Must be ≥ Min Iterations.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mb-5 rounded-2xl border border-zinc-200/80 bg-white/90 p-4 shadow-lg shadow-zinc-900/[0.04] ring-1 ring-black/[0.02] backdrop-blur-sm sm:p-5">
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
                                <span className="text-sm text-gray-700 cursor-pointer">Personal Context Enable</span>
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
                                    <span className="text-sm text-gray-700 cursor-pointer">Auto AI Context Enable</span>
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
                                    <span className="text-sm text-gray-700 cursor-pointer">Memory Enable</span>
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