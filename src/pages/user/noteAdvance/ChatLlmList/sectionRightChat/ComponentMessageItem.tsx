import { DateTime } from "luxon";
import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import envKeys from "../../../../../config/envKeys";
import axiosCustom from "../../../../../config/axiosCustom";
import { LucideAudioLines, LucideClipboard, LucideInfo, LucideTrash, LucideEyeOff } from "lucide-react";

import { tsMessageItem } from '../../../../../types/pages/tsNotesAdvanceList';
import ReactMarkdown from "react-markdown";

import cssChatMessageItem from './scss/chatMessageItem.module.scss';

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
                                    className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out"
                                >
                                    Go to Tasks
                                </Link>
                            </div>
                        )}
                        {loading ? ( // Show loading message while fetching
                            <p className="text-center text-gray-500">Loading tasks...</p>
                        ) : (
                            <Fragment>
                                {tasks.length > 0 ? (
                                    <ul className="list-disc pl-5">
                                        {tasks.map((task, index) => (
                                            <li key={index} className="mb-2 border p-2">
                                                <h4 className="font-semibold">{task.taskTitle}</h4>
                                                <p className="text-sm">{task.taskDescription}</p>
                                                <p className="text-xs">Priority: {task.taskPriority}</p>
                                                <p className="text-xs">Due Date: {new Date(task.taskDueDate).toLocaleDateString()}</p>
                                                <p className="text-xs">Tags: {task.taskTags.join(', ')}</p>
                                                <button
                                                    onClick={() => addTask(task)}
                                                    className="mt-2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
                                                >
                                                    Add Task
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-center text-gray-500">No tasks available.</p>
                                )}
                            </Fragment>
                        )}
                    </div>
                )
            }
        </div>
    );
}

const ComponentMessageItem = ({
    itemMessage
}: {
    itemMessage: tsMessageItem;
}) => {
    const [isDeleted, setIsDeleted] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [showAllTags, setShowAllTags] = useState(false);
    const [showAiGeneratedFileInfo, setShowAiGeneratedFileInfo] = useState(false);
    const [
        callGenerateAiTaskListRandomNum,
        setCallGenerateAiTaskListRandomNum, // whenever the func is called 
    ] = useState(0);

    const handleSpeak = () => {
        setIsSpeaking(true);
        const modifiedContent = itemMessage.content.replace(/\*\*/g, ' '); // Remove ** from content

        // Split content into smaller chunks for better compatibility with mobile TTS
        const chunkSize = 200; // Adjust the size as needed
        const chunks = modifiedContent.match(new RegExp(`.{1,${chunkSize}}`, 'g'));

        if (chunks) {
            let index = 0;
            const speakNextChunk = () => {
                if (index < chunks.length) {
                    console.log('index: ', index);
                    const utterance = new SpeechSynthesisUtterance(chunks[index]);
                    utterance.onend = () => {
                        index++;
                        speakNextChunk();
                    };
                    speechSynthesis.speak(utterance);
                } else {
                    setIsSpeaking(false);
                }
            };
            speakNextChunk();
        } else {
            setIsSpeaking(false);
        }
    };

    const handleStopSpeak = () => {
        speechSynthesis.cancel();
        setIsSpeaking(false);
    };

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
            <div className="pb-3">
                <img
                    src={`${envKeys.API_URL}/api/uploads/crudS3/getFile?fileName=${itemMessage?.fileUrl}`}
                    alt="Attached photo"
                    className="max-w-full rounded"
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
                    src={`${envKeys.API_URL}/api/uploads/crudS3/getFile?fileName=${itemMessage.fileUrl}`}
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
                    src={`${envKeys.API_URL}/api/uploads/crudS3/getFile?fileName=${itemMessage.fileUrl}`}
                    controls
                    className="max-w-full rounded"
                    preload="none"
                />
            </div>
        );
    };

    const renderDocument = () => {
        return (
            <div className="flex items-center">
                <span className="mr-2">📄</span>
                <span>{itemMessage.content}</span>
            </div>
        );
    };

    const renderLocation = () => {
        return <img src={itemMessage.content} alt="Location map" className="max-w-full rounded" />;
    };

    const renderText = () => {
        return (
            <div>
                <p className="text-sm break-all">
                    <div className={`${cssChatMessageItem.chatMessageMtemMontainer}`}>
                        <div className={`prose prose-sm break-words max-w-none`}>
                            <ReactMarkdown

                            >{itemMessage.content.replace('AI: #', '').replace(/\n\n/g, '\n')}</ReactMarkdown>
                        </div>
                    </div>
                </p>
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

    const renderButtons = () => {
        return (
            <div>
                <div className="">
                    {itemMessage.type === 'text' && (
                        <Fragment>
                            {isSpeaking ? (
                                <button
                                    onClick={handleStopSpeak}
                                    className="px-2 py-1 rounded bg-red-500 text-white mb-1 mr-1"
                                >
                                    <LucideAudioLines
                                        style={{
                                            color: '#FFFFFF',
                                            marginBottom: '0',
                                            display: 'inline-block',
                                            lineHeight: '24px',
                                            width: "19px",
                                            height: "19px",
                                            position: 'relative',
                                            top: '-2px',
                                        }}
                                    />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSpeak}
                                    className="px-2 py-1 rounded bg-blue-500 text-white mb-1 mr-1"
                                >
                                    <LucideAudioLines
                                        style={{
                                            color: '#FFFFFF',
                                            marginBottom: '0',
                                            display: 'inline-block',
                                            lineHeight: '24px',
                                            width: "19px",
                                            height: "19px",
                                            position: 'relative',
                                            top: '-2px',
                                        }}
                                    />
                                </button>
                            )}

                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(itemMessage?.content).then(() => {
                                        toast.success('Copied to clipboard!');
                                    });
                                }}
                                className="px-2 py-1 rounded bg-gray-300 text-white mb-1 mr-1"
                            >
                                <LucideClipboard
                                    style={{
                                        color: '#FFFFFF',
                                        marginBottom: '0',
                                        display: 'inline-block',
                                        lineHeight: '24px',
                                        width: "19px",
                                        height: "19px",
                                        position: 'relative',
                                        top: '-2px',
                                    }}
                                />
                            </button>
                        </Fragment>
                    )}
                    <button
                        onClick={() => handleDeleteMessage()}
                        className="px-2 py-1 rounded bg-red-500 text-white mb-1 mr-1"
                    >
                        <LucideTrash
                            style={{
                                color: '#FFFFFF',
                                marginBottom: '0',
                                display: 'inline-block',
                                lineHeight: '24px',
                                width: "19px",
                                height: "19px",
                                position: 'relative',
                                top: '-2px',
                            }}
                        />
                    </button>
                    {itemMessage.type === 'text' && (
                        <button
                            onClick={() => {
                                const randomNum = Math.ceil(
                                    Math.random() * 1_000_000
                                );
                                setCallGenerateAiTaskListRandomNum(randomNum)
                            }}
                            className="px-2 py-1 rounded bg-green-500 text-white my-1 mr-1"
                        >
                            🚀 Tasks
                        </button>
                    )}

                    {/* ai generated image info */}
                    {itemMessage.type === 'image' && itemMessage.fileContentAi.length > 0 && (
                        <button
                            onClick={() => {
                                setShowAiGeneratedFileInfo(!showAiGeneratedFileInfo);
                            }}
                            className="px-2 py-1 rounded bg-blue-500 text-white mb-1 mr-1"
                        >
                            {showAiGeneratedFileInfo ? (
                                <LucideInfo
                                    style={{
                                        color: '#FFFFFF',
                                        marginBottom: '0',
                                        display: 'inline-block',
                                        lineHeight: '24px',
                                        width: "19px",
                                        height: "19px",
                                        position: 'relative',
                                        top: '-2px',
                                    }}
                                />
                            ) : (
                                <LucideEyeOff
                                    style={{
                                        color: '#FFFFFF',
                                        marginBottom: '0',
                                        display: 'inline-block',
                                        lineHeight: '24px',
                                        width: "19px",
                                        height: "19px",
                                        position: 'relative',
                                        top: '-2px',
                                    }}
                                />
                            )}
                            <span className="ml-1">AI Details</span>
                        </button>
                    )}
                </div>
            </div>
        )
    }

    const renderTags = () => {
        const displayedTags = showAllTags ? itemMessage.tags : itemMessage.tags.slice(0, 5);
        return (
            <Fragment>
                {itemMessage.tags?.length >= 1 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {displayedTags.map((tag, index) => (
                            <span key={index} className="bg-blue-200 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                                {tag}
                            </span>
                        ))}
                        {itemMessage.tags.length > 5 && !showAllTags && (
                            <button className="text-blue-500 text-xs mt-1" onClick={() => setShowAllTags(true)}>
                                Show more
                            </button>
                        )}
                        {showAllTags && (
                            <button className="text-blue-500 text-xs mt-1" onClick={() => setShowAllTags(false)}>
                                Show less
                            </button>
                        )}
                    </div>
                )}
            </Fragment>
        )
    }

    const renderMessageDate = () => {
        return (
            <div>
                <span className="text-gray-500 text-xs mr-5">{new Date(itemMessage.updatedAtUtc).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span className="text-gray-500 text-xs mr-5">{new Date(itemMessage.updatedAtUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="text-gray-500 text-xs">{DateTime.fromJSDate(new Date(itemMessage.updatedAtUtc)).toRelative()}</span>
            </div>
        )
    }

    const renderAiGeneratedFileInfo = () => {
        return (
            <Fragment>
                {showAiGeneratedFileInfo && (
                    <div className="my-2 border border-gray-300 rounded-lg p-2 bg-gray-50">
                        <p className="text-xs text-gray-600 leading-relaxed">{itemMessage.fileContentAi}</p>
                    </div>
                )}
            </Fragment>
        )
    }

    return (
        <div
            id={`message-id-${itemMessage._id}`}
            className="px-2 py-1"
        >
            {isDeleted && (
                <div
                    className="bg-white border border-gray-300 rounded-lg p-4 shadow-md inline-block max-w-[650px] whitespace-pre-wrap"
                >
                    <span className="text-gray-500 text-xs">Deleted</span>
                </div>
            )}
            {!isDeleted && (
                <div
                    className="bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-md inline-block max-w-[650px] whitespace-pre-wrap min-w-[60%]"
                >
                    {(
                        itemMessage.aiModelProvider === '' && itemMessage.aiModelName === ''
                    ) === false && (
                            <p className="text-xs text-gray-400 hover:text-gray-800 pb-1">
                                {itemMessage.aiModelProvider !== '' ? `${itemMessage.aiModelProvider} - ` : ''}
                                {itemMessage.aiModelName}:
                            </p>
                        )}
                    {renderMessageContent()}
                    {renderAiGeneratedFileInfo()}
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
    )
}

export default ComponentMessageItem;