import { DateTime } from "luxon";
import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import envKeys from "../../../../../../config/envKeys";
import axiosCustom from "../../../../../../config/axiosCustom";
import { LucideAudioLines, LucideClipboard, LucideInfo, LucideTrash, LucideEyeOff, LucideGauge } from "lucide-react";
import { jotaiTtsModalOpenStatus } from '../../../../../../jotai/stateJotaiTextToSpeechModal';
import { useSetAtom } from 'jotai';
import { tsMessageItem } from '../../../../../../types/pages/tsNotesAdvanceList';
import MarkdownRenderer from '../../../../../../components/markdown/MarkdownRenderer';

function getFileDownloadUrl(storedFileUrl: string, opts?: { inlinePreview?: boolean }): string {
    const base = `${envKeys.API_URL}/api/uploads/crud/getFile?fileName=${encodeURIComponent(storedFileUrl)}`;
    return opts?.inlinePreview ? `${base}&inline=1` : base;
}

function ShellRunImportedFilePreviews({
    files,
}: {
    files: NonNullable<NonNullable<tsMessageItem['shellRunArtifactV1']>['importedFiles']>;
}) {
    if (!files.length) {
        return null;
    }
    return (
        <div className="mt-4 space-y-4 border-t border-zinc-200/70 pt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Preview</p>
            {files.map((f, index) => {
                const previewUrl = getFileDownloadUrl(f.storedFileUrl, { inlinePreview: true });
                const downloadUrl = getFileDownloadUrl(f.storedFileUrl);
                const name = f.fileName || f.storedFileUrl.split('/').pop() || 'file';
                const mime = (f.mimeType || '').toLowerCase();
                const lower = name.toLowerCase();
                const isPdf = mime.includes('pdf') || lower.endsWith('.pdf');
                const isHtml = mime.includes('html') || lower.endsWith('.html') || lower.endsWith('.htm');
                const isImage = mime.startsWith('image/');

                if (isPdf || isHtml) {
                    return (
                        <div
                            key={`${f.storedFileUrl}-${index}`}
                            className="overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-50/60"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200/60 bg-white/80 px-2 py-1.5">
                                <span className="truncate text-xs font-medium text-zinc-700">{name}</span>
                                <a
                                    href={previewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="shrink-0 text-xs font-medium text-teal-700 hover:text-teal-800 hover:underline"
                                >
                                    Open in new tab
                                </a>
                                <a
                                    href={downloadUrl}
                                    download
                                    className="shrink-0 text-xs font-medium text-zinc-600 hover:text-zinc-800 hover:underline"
                                >
                                    Download
                                </a>
                            </div>
                            <iframe
                                title={name}
                                src={previewUrl}
                                className="block h-[min(70vh,560px)] w-full bg-white"
                                sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"
                            />
                        </div>
                    );
                }

                if (isImage) {
                    return (
                        <div key={`${f.storedFileUrl}-${index}`} className="rounded-xl border border-zinc-200/80 p-2">
                            <p className="mb-1 truncate text-xs text-zinc-600">{name}</p>
                            <img
                                src={previewUrl}
                                alt={name}
                                className="max-h-[50vh] max-w-full rounded-lg object-contain"
                                loading="lazy"
                            />
                        </div>
                    );
                }

                return (
                    <div key={`${f.storedFileUrl}-${index}`} className="rounded-lg border border-zinc-200/70 bg-zinc-50/80 px-3 py-2">
                        <a
                            href={downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-teal-700 hover:underline"
                        >
                            Download: {name}
                        </a>
                    </div>
                );
            })}
        </div>
    );
}

const ComponentAiTaskByNotesId = ({
    itemMessageId,
    callGenerateAiTaskListRandomNum,
}: {
    itemMessageId: string;
    callGenerateAiTaskListRandomNum: number;
}) => {
    interface Task {
        taskTitle: string;
        taskDescription: string;
        taskPriority: string;
        taskDueDate: string;
        taskTags: string[];
    }

    const [tasks, setTasks] = useState([] as Task[]);
    const [loading, setLoading] = useState<boolean>(false); // State for loading
    const [showTaskListLink, setShowTaskListLink] = useState(false);

    const fetchTasks = async () => {
        setLoading(true); // Set loading to true when fetching starts
        const config = {
            method: 'post',
            url: '/api/task/ai-generated/taskGenerateByConversationId',
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify({ id: itemMessageId }),
        };

        try {
            const response = await axiosCustom.request(config);
            const dataArr = response.data.data.docs as Task[];
            setTasks(dataArr);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false); // Set loading to false when fetching ends
        }
    };

    useEffect(() => {
        if (callGenerateAiTaskListRandomNum >= 1) {
            fetchTasks();
        }
    }, [callGenerateAiTaskListRandomNum]);

    const addTask = async (task: Task) => {
        // Logic to add the task to the main task list

        try {
            console.log('Adding task:', task);

            // get workspace id from api
            let tempWorkspaceId = '000000000000000000000000';
            const taskWorkspaceResult = await axiosCustom.post('/api/task-workspace/crud/taskWorkspaceGet');
            if (taskWorkspaceResult.data?.docs.length > 0) {
                // find the unassigned workspace id
                for (let index = 0; index < taskWorkspaceResult.data.docs.length; index++) {
                    const element = taskWorkspaceResult.data.docs[index];
                    if (element?.title === 'Unassigned') {
                        tempWorkspaceId = element._id;
                        break;
                    }
                }
            }

            const newTask = {
                title: task.taskTitle,
                description: task.taskDescription,
                priority: task.taskPriority,
                dueDate: task.taskDueDate,
                tags: task.taskTags,

                // workspace
                taskWorkspaceId: tempWorkspaceId,
            };

            const config = {
                method: 'post',
                url: '/api/task/crud/taskAdd',
                headers: {
                    'Content-Type': 'application/json',
                },
                data: JSON.stringify(newTask),
            };

            await axiosCustom.request(config);
            console.log('Task added successfully!');
            // Optionally, you can remove the task from the suggested list here if needed
            setTasks((prevTasks) => prevTasks.filter((t) => t.taskTitle !== task.taskTitle));

            toast.success('Task added successfully');
            setShowTaskListLink(true);
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    return (
        <div>
            {
                callGenerateAiTaskListRandomNum >= 1 && (
                    <div className="p-2">
                        {showTaskListLink && (
                            <div className="flex justify-center">
                                <Link
                                    to={'/user/task'}
                                    className="rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:from-teal-500 hover:to-emerald-500"
                                >
                                    Go to tasks
                                </Link>
                            </div>
                        )}
                        {loading ? (
                            <p className="text-center text-sm text-zinc-500">Loading tasks…</p>
                        ) : (
                            <Fragment>
                                {tasks.length > 0 ? (
                                    <ul className="mt-2 space-y-2">
                                        {tasks.map((task, index) => (
                                            <li
                                                key={index}
                                                className="rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-3"
                                            >
                                                <h4 className="font-semibold text-zinc-900">{task.taskTitle}</h4>
                                                <p className="text-sm text-zinc-600">{task.taskDescription}</p>
                                                <p className="mt-1 text-xs text-zinc-500">Priority: {task.taskPriority}</p>
                                                <p className="text-xs text-zinc-500">
                                                    Due: {new Date(task.taskDueDate).toLocaleDateString()}
                                                </p>
                                                <p className="text-xs text-zinc-500">Tags: {task.taskTags.join(', ')}</p>
                                                <button
                                                    type="button"
                                                    onClick={() => addTask(task)}
                                                    className="mt-2 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-zinc-800"
                                                >
                                                    Add task
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-center text-sm text-zinc-500">No tasks suggested.</p>
                                )}
                            </Fragment>
                        )}
                    </div>
                )
            }
        </div>
    );
}

const messageIsAssistant = (m: tsMessageItem) =>
    m.isAi === true ||
    (m.type === 'text' &&
        typeof m.content === 'string' &&
        m.content.trimStart().startsWith('AI:'));

const ComponentMessageItem = ({
    itemMessage
}: {
    itemMessage: tsMessageItem;
}) => {
    const isAssistant = messageIsAssistant(itemMessage);
    const [isDeleted, setIsDeleted] = useState(false);
    const [showAllTags, setShowAllTags] = useState(false);
    const [showAiGeneratedFileInfo, setShowAiGeneratedFileInfo] = useState(false);
    const [showExtractedText, setShowExtractedText] = useState(false);
    const [showUsage, setShowUsage] = useState(false);
    const [
        callGenerateAiTaskListRandomNum,
        setCallGenerateAiTaskListRandomNum, // whenever the func is called 
    ] = useState(0);

    const setTtsModalOpenStatus = useSetAtom(jotaiTtsModalOpenStatus);

    const handleDeleteMessage = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete this note?");
        if (confirmDelete) {
            try {
                await axiosCustom.post(`/api/chat-llm/crud/notesDelete`,
                    {
                        _id: itemMessage._id,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        withCredentials: true,
                    }
                );

                setIsDeleted(true);
                toast.success('Note deleted successfully!');
            } catch (error) {
                console.error("Error deleting note:", error);
                toast.error("Error deleting note. Please try again.");
            }
        }
    };

    const renderImage = () => {
        return (
            <div className="pb-1">
                <img
                    src={`${envKeys.API_URL}/api/uploads/crud/getFile?fileName=${itemMessage?.fileUrl}`}
                    alt="Attached photo"
                    className="max-w-full rounded-xl ring-1 ring-black/5"
                    loading="lazy"
                    style={{
                        maxHeight: '30vh',
                        objectFit: 'contain'
                    }}
                />
            </div>
        );
    };

    const renderAudio = () => {
        return (
            <div className="w-full">
                <audio
                    src={`${envKeys.API_URL}/api/uploads/crud/getFile?fileName=${itemMessage.fileUrl}`}
                    controls
                    className="w-full mb-1"
                    preload="none"
                    style={{
                        height: '40px'
                    }}
                />
            </div>
        );
    };

    const renderVideo = () => {
        return (
            <div>
                <video
                    src={`${envKeys.API_URL}/api/uploads/crud/getFile?fileName=${itemMessage.fileUrl}`}
                    controls
                    className="max-w-full rounded"
                    preload="none"
                />
            </div>
        );
    };

    const renderDocument = () => {
        const body = 'text-zinc-800';
        const meta = 'text-zinc-500';
        return (
            <div className={`text-sm ${body}`}>
                <span className="mr-2" aria-hidden>
                    📄
                </span>
                <span>{itemMessage.content}</span>
                <span className={`text-xs ${meta}`}>{itemMessage.fileContentAi}</span>
                <span className={`ml-2 text-xs ${meta}`}>
                    ({typeof itemMessage.fileContentText === 'string' ? itemMessage.fileContentText.length : 0} chars)
                </span>
                {showExtractedText && (
                    <div
                        className={`mt-2 max-h-[min(300px,80vh)] overflow-y-auto whitespace-pre-wrap rounded-lg border border-zinc-200/40 p-2 text-xs ${meta}`}
                    >
                        {itemMessage.fileContentText}
                    </div>
                )}
            </div>
        );
    };

    const renderLocation = () => {
        return <img src={itemMessage.content} alt="Location map" className="max-w-full rounded" />;
    };

    const renderText = () => {
        const mdContent = itemMessage.content.replace('AI: ', '');
        return (
            <div
                className={`w-full min-w-0 text-sm leading-relaxed ${
                    isAssistant
                        ? 'text-zinc-800'
                        : 'text-zinc-800 [&_a]:text-teal-700 [&_code]:text-teal-900'
                }`}
            >
                {itemMessage?.reasoningContent?.length >= 1 && (
                    <div className="mb-3 rounded-xl border border-violet-200/60 bg-violet-50/90 p-3">
                        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-violet-600">
                            Reasoning
                        </div>
                        <span className="text-xs text-violet-800/90">{itemMessage?.reasoningContent}</span>
                    </div>
                )}
                <MarkdownRenderer content={mdContent} />
                {itemMessage.shellRunArtifactV1?.importedFiles &&
                    itemMessage.shellRunArtifactV1.importedFiles.length > 0 && (
                        <ShellRunImportedFilePreviews files={itemMessage.shellRunArtifactV1.importedFiles} />
                    )}
            </div>
        );
    };

    const renderMessageContent = () => {
        switch (itemMessage.type) {
            case 'image':
                return renderImage();
            case 'audio':
                return renderAudio();
            case 'video':
                return renderVideo();
            case 'document':
                return renderDocument();
            case 'location':
                return renderLocation();
            default:
                return renderText();
        }
    };

    const iconBtnBase =
        'inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium transition-colors';
    const iconBtnAssistant = `${iconBtnBase} bg-zinc-100/90 text-zinc-600 hover:bg-zinc-200/90`;
    const iconBtnUser = `${iconBtnBase} bg-white/90 text-zinc-600 shadow-sm ring-1 ring-teal-200/40 hover:bg-teal-50/80`;

    const renderButtons = () => {
        const btn = isAssistant ? iconBtnAssistant : iconBtnUser;
        return (
            <div className="mt-3 border-t border-zinc-200/50 pt-2">
                <div className="flex flex-wrap items-center gap-1">
                    {itemMessage.type === 'text' && (
                        <Fragment>
                            <button
                                type="button"
                                onClick={() => {
                                    const textSplit = itemMessage.content.split('. ');
                                    setTtsModalOpenStatus({
                                        openStatus: true,
                                        playingStatus: true,
                                        currentTextIndex: 0,
                                        text: itemMessage.content,
                                        textSplit: textSplit,
                                    });
                                }}
                                className={btn}
                                title="Listen"
                            >
                                <LucideAudioLines className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                                <span className="hidden sm:inline">Listen</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    void navigator.clipboard.writeText(itemMessage?.content).then(() => {
                                        toast.success('Copied to clipboard!');
                                    });
                                }}
                                className={btn}
                                title="Copy"
                            >
                                <LucideClipboard className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                                <span className="hidden sm:inline">Copy</span>
                            </button>
                        </Fragment>
                    )}
                    <button
                        type="button"
                        onClick={() => handleDeleteMessage()}
                        className={`${iconBtnBase} bg-red-50 text-red-600 hover:bg-red-100`}
                        title="Delete"
                    >
                        <LucideTrash className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                    </button>
                    {itemMessage.type === 'text' && (
                        <button
                            type="button"
                            onClick={() => {
                                const randomNum = Math.ceil(Math.random() * 1_000_000);
                                setCallGenerateAiTaskListRandomNum(randomNum);
                            }}
                            className={btn}
                            title="Suggest tasks"
                        >
                            <span aria-hidden className="text-[11px]">
                                ✦
                            </span>
                            Tasks
                        </button>
                    )}

                    {itemMessage.type === 'image' && itemMessage.fileContentAi.length > 0 && (
                        <button
                            type="button"
                            onClick={() => {
                                setShowAiGeneratedFileInfo(!showAiGeneratedFileInfo);
                            }}
                            className={btn}
                        >
                            {showAiGeneratedFileInfo ? (
                                <LucideInfo className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                            ) : (
                                <LucideEyeOff className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                            )}
                            <span className="hidden sm:inline">AI details</span>
                        </button>
                    )}

                    {itemMessage.fileContentText && itemMessage.fileContentText.length > 0 && (
                        <button
                            type="button"
                            onClick={() => {
                                setShowExtractedText(!showExtractedText);
                            }}
                            className={btn}
                        >
                            <LucideEyeOff className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                            <span className="hidden sm:inline">
                                {showExtractedText ? 'Hide text' : 'Extracted text'}
                            </span>
                        </button>
                    )}

                    {itemMessage.type === 'text' && (
                        <button
                            type="button"
                            onClick={() => {
                                setShowUsage(!showUsage);
                            }}
                            className={btn}
                        >
                            <LucideGauge className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                            <span className="hidden sm:inline">Usage</span>
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const renderTags = () => {
        const displayedTags = showAllTags ? itemMessage.tags : itemMessage.tags.slice(0, 5);
        const tagClass = isAssistant
            ? 'rounded-md border border-teal-200/70 bg-teal-50/90 px-2 py-0.5 text-[11px] font-medium text-teal-800'
            : 'rounded-md border border-emerald-200/80 bg-emerald-50/90 px-2 py-0.5 text-[11px] font-medium text-emerald-900';
        const linkClass = isAssistant
            ? 'text-xs font-medium text-teal-600 hover:text-teal-700'
            : 'text-xs font-medium text-emerald-700 hover:text-emerald-900';
        return (
            <Fragment>
                {itemMessage.tags?.length >= 1 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {displayedTags.map((tag, index) => (
                            <span key={index} className={tagClass}>
                                {tag}
                            </span>
                        ))}
                        {itemMessage.tags.length > 5 && !showAllTags && (
                            <button type="button" className={linkClass} onClick={() => setShowAllTags(true)}>
                                Show more
                            </button>
                        )}
                        {showAllTags && (
                            <button type="button" className={linkClass} onClick={() => setShowAllTags(false)}>
                                Show less
                            </button>
                        )}
                    </div>
                )}
            </Fragment>
        );
    };

    const renderMessageDate = () => {
        return (
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-zinc-400">
                <span>{new Date(itemMessage.updatedAtUtc).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                <span>{new Date(itemMessage.updatedAtUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span>{DateTime.fromJSDate(new Date(itemMessage.updatedAtUtc)).toRelative()}</span>
            </div>
        );
    };

    const renderAiGeneratedFileInfo = () => {
        return (
            <Fragment>
                {showAiGeneratedFileInfo && (
                    <div className="my-2 rounded-xl border border-zinc-200/80 bg-zinc-50/90 p-3">
                        <p className="text-xs leading-relaxed text-zinc-600">{itemMessage.fileContentAi}</p>
                    </div>
                )}
            </Fragment>
        );
    };

    const renderUsage = () => {
        return (
            <div>
                {showUsage && (
                    <div className="my-2 rounded-xl border border-violet-200/70 bg-violet-50/80 p-3">
                        <p className="mb-1 text-xs font-semibold text-violet-800">Usage</p>
                        <p className="text-xs text-violet-700/90">Prompt: {itemMessage?.promptTokens}</p>
                        <p className="text-xs text-violet-700/90">Completion: {itemMessage?.completionTokens}</p>
                        <p className="text-xs text-violet-700/90">Reasoning: {itemMessage?.reasoningTokens}</p>
                        <p className="text-xs text-violet-700/90">Total: {itemMessage?.totalTokens}</p>
                        <p className="text-xs text-violet-700/90">Cost: ${itemMessage?.costInUsd?.toFixed(10)}</p>
                    </div>
                )}
            </div>
        );
    };

    const bubbleClass = isAssistant
        ? 'border border-zinc-200/90 bg-white/95 shadow-lg shadow-zinc-900/[0.04] ring-1 ring-black/[0.03] backdrop-blur-sm'
        : 'border border-teal-200/70 bg-gradient-to-br from-teal-50/95 to-emerald-50/80 shadow-md shadow-teal-900/[0.06] ring-1 ring-teal-100/80 backdrop-blur-sm';

    return (
        <div
            id={`message-id-${itemMessage._id}`}
            className={`flex w-full min-w-0 py-1.5 ${isAssistant ? 'justify-start' : 'justify-end'}`}
        >
            {isDeleted && (
                <div className="max-w-full rounded-2xl border border-zinc-200/80 bg-zinc-100/90 px-4 py-3 text-sm text-zinc-500 shadow-inner md:max-w-[650px]">
                    Message removed
                </div>
            )}
            {!isDeleted && (
                <div
                    className={`w-full max-w-[min(100%,42rem)] rounded-2xl px-3.5 py-3 sm:px-4 ${
                        isAssistant ? 'rounded-tl-md' : 'rounded-tr-md'
                    } ${bubbleClass}`}
                >
                    {(
                        itemMessage.aiModelProvider === '' && itemMessage.aiModelName === ''
                    ) === false && (
                        <p
                            className="mb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-400"
                        >
                            {(() => {
                                const displayModelName = itemMessage.aiModelName;

                                const displayProvider =
                                    itemMessage.aiModelProvider === 'openai-compatible'
                                        ? 'OpenAI Compatible'
                                        : itemMessage.aiModelProvider;

                                return `${displayProvider !== '' ? `${displayProvider} · ` : ''}${displayModelName}`;
                            })()}
                        </p>
                    )}
                    {renderMessageContent()}
                    {renderAiGeneratedFileInfo()}
                    {renderUsage()}
                    {renderButtons()}
                    <ComponentAiTaskByNotesId
                        itemMessageId={itemMessage._id}
                        callGenerateAiTaskListRandomNum={callGenerateAiTaskListRandomNum}
                    />
                    {renderTags()}
                    {renderMessageDate()}
                </div>
            )}
        </div>
    );
}

export default ComponentMessageItem;