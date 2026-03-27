import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LucideAudioLines, LucideDownload, LucideFile, LucideFileText, LucideLoader2, LucideRepeat, LucideSend, LucideSidebar, LucideVideo, LucideX } from 'lucide-react';
import envKeys from '../../../../../../config/envKeys.tsx';
import axiosCustom from '../../../../../../config/axiosCustom.ts';

import cssNoteAdvanceList from './scss/noteAdvanceList.module.scss';
import ComponentUploadFile from './ComponentUploadFile.tsx';
import ComponentRecordAudio from './ComponentRecordAudio.tsx';
import { handleAutoSelectContextFirstMessage, handleAutoSelectContext } from '../../utils/chatLlmThreadAxios.ts';
import { uploadFeatureFile } from '../../../../../../utils/featureFileUpload.ts';

import { useSetAtom } from 'jotai';
import { jotaiChatLlmFooterHeight } from '../../jotai/jotaiChatLlmThreadSetting.ts';
import ComponentUploadImage from './ComponentUploadImage.tsx';
import useResponsiveScreen, { screenList } from '../../../../../../hooks/useResponsiveScreen.tsx';
import { jotaiHideRightSidebar } from '../../jotai/jotaiChatLlmThreadSetting.ts';

const TextAndFileInput = ({
    value,
    setValue,
    setFiles,
    threadId,
}: {
    value: string;
    setValue: React.Dispatch<React.SetStateAction<string>>;
    files: string[];
    setFiles: React.Dispatch<React.SetStateAction<string[]>>;
    threadId: string;
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea based on content
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.max(95, textarea.scrollHeight) + 'px';
        }
    }, [value]);

    const uploadFileToStorage = async (file: File) => {
        try {
            const filePath = await uploadFeatureFile({
                file,
                parentEntityId: threadId,
                apiUrl: envKeys.API_URL,
            });
            setFiles(prev => [...prev, filePath]);
            toast.success(`File "${file.name}" uploaded successfully!`);
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.error(`Failed to upload "${file.name}"`);
        }
    };

    const uploadFilesToStorage = async (files: File[]) => {
        await Promise.all(Array.from(files).map(uploadFileToStorage));
    };

    const handleFileDrop = async (event: React.DragEvent<HTMLTextAreaElement>): Promise<void> => {
        event.preventDefault();
        const droppedFiles = event.dataTransfer.files;
        await uploadFilesToStorage(Array.from(droppedFiles));
    };

    const handlePaste = async (event: React.ClipboardEvent<HTMLTextAreaElement>): Promise<void> => {
        const items = event.clipboardData.items;

        const pastedFiles: File[] = [];
        for (const item of items) {
            if (item.kind === 'file') {
                const file = item.getAsFile();
                if (file) pastedFiles.push(file);
            }
        }
        await uploadFilesToStorage(pastedFiles);
    };

    const handleDragOver = (event: React.DragEvent<HTMLTextAreaElement>): void => {
        event.preventDefault();
    };

    return (
        <div className="w-full">
            <textarea
                className="min-h-[4.5rem] w-full resize-none rounded-xl border border-zinc-200/80 bg-zinc-50/80 px-3 py-2.5 text-sm text-zinc-900 shadow-inner placeholder:text-zinc-400 transition-shadow focus:border-teal-500/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                placeholder="Message… drop files to attach"
                ref={textareaRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onDrop={handleFileDrop}
                onDragOver={handleDragOver}
                onPaste={handlePaste}
                style={{
                    height: 'auto',
                    maxHeight: '50vh',
                }}
            />
        </div>
    );
}

const ComponentFilesDisplay = ({
    files,
    setFiles,
}: {
    files: string[];
    setFiles: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
    return (
        <div className="w-full mb-2 overflow-x-auto pt-1">
            <div className="flex gap-2 min-w-max">
                {files.map((file, index) => {
                    const getFileIcon = (fileName: string) => {
                        const extension = fileName.split('.').pop()?.toLowerCase();

                        let downloadFileName = fileName.split('/').pop();

                        let iconSizeClassName = 'w-24 h-24';

                        // Image files
                        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension || '')) {
                            return (
                                <a
                                    href={`${envKeys.API_URL}/api/uploads/crud/getFile?fileName=${file}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <img
                                        src={`${envKeys.API_URL}/api/uploads/crud/getFile?fileName=${file}`}
                                        alt={file}
                                        className={iconSizeClassName}
                                        style={{
                                            objectFit: 'contain',
                                        }}
                                    />
                                </a>
                            );
                        }
                        // Video files
                        if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(extension || '')) {
                            return (
                                <a
                                    href={`${envKeys.API_URL}/api/uploads/crud/getFile?fileName=${file}`}
                                    target="_blank"
                                    rel="noopener
                                    noreferrer"
                                    download={downloadFileName}
                                >
                                    <LucideVideo className={iconSizeClassName} />
                                </a>
                            );
                        }
                        // Audio files
                        if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'].includes(extension || '')) {
                            return (
                                <a
                                    href={`${envKeys.API_URL}/api/uploads/crud/getFile?fileName=${file}`}
                                    target="_blank"
                                    rel="noopener
                                    noreferrer"
                                    download={downloadFileName}
                                >
                                    <LucideAudioLines className={iconSizeClassName} />
                                </a>
                            );
                        }
                        // PDF files
                        if (extension === 'pdf') {
                            return (
                                <a
                                    href={`${envKeys.API_URL}/api/uploads/crud/getFile?fileName=${file}`}
                                    target="_blank"
                                    rel="noopener
                                    noreferrer"
                                    download={downloadFileName}
                                >
                                    <LucideFileText className={iconSizeClassName} />
                                </a>
                            );
                        }
                        // Text files
                        if (['txt', 'doc', 'docx'].includes(extension || '')) {
                            return (
                                <a
                                    href={`${envKeys.API_URL}/api/uploads/crud/getFile?fileName=${file}`}
                                    target="_blank"
                                    rel="noopener
                                    noreferrer"
                                    download={downloadFileName}
                                >
                                    <LucideFileText className={iconSizeClassName} />
                                </a>
                            );
                        }
                        // Default file icon
                        return (
                            <a
                                href={`${envKeys.API_URL}/api/uploads/crud/getFile?fileName=${file}`}
                                target="_blank"
                                rel="noopener
                                noreferrer"
                                download={downloadFileName}
                            >
                                <LucideFile className={iconSizeClassName} />
                            </a>
                        );
                    };

                    return (
                        <div key={index} className="flex-shrink-0 bg-gray-100 p-2 rounded-sm min-w-[200opx] max-w-[200px]">
                            <div className="flex items-center gap-2">
                                {getFileIcon(file)}
                                <div>
                                    <div>
                                        <button
                                            onClick={() => {
                                                setFiles(files.filter((_, i) => i !== index));
                                            }}
                                            className="text-red-500 hover:text-red-700 py-2"
                                        >
                                            <LucideX className="w-8 h-8" />
                                        </button>
                                    </div>
                                    <div>
                                        <a
                                            href={`${envKeys.API_URL}/api/uploads/crud/getFile?fileName=${file}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download={file.split('/').pop() || file}
                                            className="text-blue-500 hover:text-blue-700 text-sm underline py-2"
                                            title="Download file"
                                        >
                                            <LucideDownload className="w-8 h-8" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const SYSTEM_PROMPT_AI_CALL = `
You are a friendly and helpful AI voice assistant.

Context:
- User input comes from speech-to-text and may include minor transcription errors.
- Your response will be converted to speech (text-to-speech).

Response style:
- Reply in short, natural, spoken sentences.
- Do not use markdown, bullet points, or special formatting.
- Keep responses concise and easy to understand when heard aloud.
- If user intent is unclear, ask one short clarification question.

Safety:
- Do not invent facts; if unsure, say so briefly.
`.trim();

const ComponentChatMessageInput = ({
    setRefreshParentRandomNum,
    threadId,
}: {
    setRefreshParentRandomNum: React.Dispatch<React.SetStateAction<number>>;
    threadId: string;
}) => {
    const actionContainerRef = useRef<HTMLDivElement>(null);
    const setChatLlmFooterHeight = useSetAtom(jotaiChatLlmFooterHeight);
    const screenWidth = useResponsiveScreen();
    const setHideRightSidebar = useSetAtom(jotaiHideRightSidebar);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [files, setFiles] = useState<string[]>([]);
    const [timer, setTimer] = useState(0);
    const navigate = useNavigate();
    useEffect(() => {
        if (actionContainerRef.current) {
            setChatLlmFooterHeight(actionContainerRef.current.clientHeight);
        }
    }, [newNote, files]);

    // Polling effect - refresh every 1 second while generating
    useEffect(() => {
        const intervalTimer = setInterval(() => {
            setTimer(prevTimer => prevTimer + 1);
        }, 1000);
        return () => clearInterval(intervalTimer);
    }, []);

    useEffect(() => {
        if (isSubmitting) {
            setRefreshParentRandomNum(Math.floor(Math.random() * 1_000_000));
        }
    }, [timer, isSubmitting]);

    const handleAddNote = async () => {
        setIsSubmitting(true);

        try {
            if (files.length > 0) {
                await Promise.all(
                    files.map(async (file) => {
                        try {
                            // Determine file type based on extension
                            const extension = file.split('.').pop()?.toLowerCase();
                            let fileType = 'file';
                            if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension || '')) {
                                fileType = 'image';
                            } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(extension || '')) {
                                fileType = 'video';
                            } else if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'].includes(extension || '')) {
                                fileType = 'audio';
                            } else if ([
                                'md', 'markdown', 'txt', 'csv', 'json', 'log',
                                'pdf', 'docx', 'xls', 'xlsx',
                            ].includes(
                                extension || ''
                            )) {
                                fileType = 'document';
                            } else {
                                fileType = 'file';
                            }

                            await axiosCustom.post("/api/chat-llm/chat-add/notesAdd", {
                                threadId: threadId,
                                type: fileType,
                                content: `File: ${file.split('/').pop() || file}`,
                                visibility: 'public',
                                tags: [],
                                fileUrl: file,
                                fileUrlArr: [],
                                imagePathsArr: []
                            });
                        } catch (error) {
                            console.error(error);
                            toast.error('Error adding file. Please try again.');
                        }
                    })
                );

                toast.success('Files added successfully!');
                setFiles([]);
            }

            if (newNote.trim().length > 1) {
                const toastLoadingId = toast.loading('Adding note...');

                await axiosCustom.post("/api/chat-llm/chat-add/notesAdd", {
                    threadId: threadId,
                    type: "text",
                    content: newNote,
                    visibility: 'public',
                    tags: [],
                    imagePathsArr: []
                });

                setRefreshParentRandomNum(Math.floor(Math.random() * 1_000_000));

                // select auto context first message
                await handleAutoSelectContextFirstMessage({
                    threadId: threadId,
                });

                setTimeout(() => {
                    const messagesScrollDown = document.getElementById('messagesScrollDown');
                    if (messagesScrollDown) {
                        messagesScrollDown?.scrollIntoView({ behavior: "smooth" });
                    }
                }, 2000);

                // get thread info
                const responseThread = await axiosCustom.post(
                    '/api/chat-llm/threads-crud/threadsGet', {
                    threadId: threadId,
                }
                );
                const threadInfo = responseThread.data.docs[0];
                if (threadInfo.answerEngine === 'answerMachine') {
                    // answerMachine - processing happens asynchronously, polling will show status
                    await axiosCustom.post("/api/chat-llm/add-auto-next-message/answerMachine", {
                        threadId: threadId,
                    });
                    toast.dismiss(toastLoadingId);
                    toast.success('Answer Machine started processing...');
                    // Don't refresh immediately - polling will handle it when complete
                } else {
                    // Start streaming generation
                    await axiosCustom.post("/api/chat-llm/add-auto-next-message/notesAddAutoNextMessage", {
                        threadId: threadId,
                    });
                    toast.dismiss(toastLoadingId);
                    toast.success('Generation completed!');
                    setRefreshParentRandomNum(Math.floor(Math.random() * 1_000_000));
                }

                setNewNote("");
            }
        } catch (error) {
            console.error(error);
            toast.error('Error adding note. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const regenerateResponse = async () => {
        let toastLoadingId = toast.loading('Regenerating response...');
        setIsSubmitting(true);
        try {
            setTimeout(() => {
                const messagesScrollDown = document.getElementById('messagesScrollDown');
                if (messagesScrollDown) {
                    messagesScrollDown?.scrollIntoView({ behavior: "smooth" });
                }
            }, 2000);

            // get thread info
            const responseThread = await axiosCustom.post(
                '/api/chat-llm/threads-crud/threadsGet', {
                threadId: threadId,
            }
            );
            const threadInfo = responseThread.data.docs[0];
            if (threadInfo.answerEngine === 'answerMachine') {
                // answerMachine - processing happens asynchronously, polling will show status
                await axiosCustom.post("/api/chat-llm/add-auto-next-message/answerMachine", {
                    threadId: threadId,
                });
                toast.dismiss(toastLoadingId);
                toast.success('Answer Machine started processing...');
                // Don't refresh immediately - polling will handle it when complete
            } else {
                // Start streaming generation
                await axiosCustom.post("/api/chat-llm/add-auto-next-message/notesAddAutoNextMessage", {
                    threadId: threadId,
                });
                toast.dismiss(toastLoadingId);
                toast.success('Regeneration completed!');
            }

        } catch (error) {
            console.error(error);
            toast.error('Error regenerating response. Please try again.');
        } finally {
            setIsSubmitting(false);
            setRefreshParentRandomNum(Math.floor(Math.random() * 1_000_000));
        }
    }

    const handleAiCall = async () => {
        try {
            await axiosCustom.post("/api/chat-llm/threads-crud/threadsEditById", {
                threadId: threadId,
                systemPrompt: SYSTEM_PROMPT_AI_CALL,
                answerEngine: "conciseAnswer",
            });

            navigate(`/user/ai-call?id=${threadId}`);
        } catch (error) {
            console.error(error);
            toast.error('Error starting AI Call. Please try again.');
        }
    };

    return (
        <>
            <div
                ref={actionContainerRef}
                className="border-t border-zinc-200/80 bg-gradient-to-b from-white to-zinc-50/90 px-3 pb-2 pt-2 shadow-[0_-12px_32px_-16px_rgba(15,23,42,0.08)]"
            >
                <ComponentFilesDisplay
                    files={files}
                    setFiles={setFiles}
                />

                <TextAndFileInput
                    value={newNote}
                    setValue={setNewNote}
                    files={files}
                    setFiles={setFiles}
                    threadId={threadId}
                />

                <div className="flex items-stretch gap-0">
                    <div
                        className={cssNoteAdvanceList.actionContainer}
                        style={{
                            width: screenWidth === screenList.lg ? '100%' : 'calc(100vw - 52px)',
                        }}
                    >
                        <button
                            type="button"
                            className="inline-flex h-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500 to-teal-600 px-3.5 text-white shadow-md shadow-emerald-900/15 transition-all hover:from-emerald-400 hover:to-teal-500 hover:shadow-lg disabled:opacity-60"
                            onClick={handleAddNote}
                            disabled={isSubmitting}
                            title="Send"
                        >
                            {isSubmitting ? (
                                <LucideLoader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <LucideSend className="h-4 w-4" strokeWidth={2} />
                            )}
                        </button>

                        {/* file */}
                        <ComponentUploadFile
                            setFiles={setFiles}
                            threadId={threadId}
                        />

                        {/* camera */}
                        <ComponentUploadImage
                            setFiles={setFiles}
                            threadId={threadId}
                        />

                        {/* audio */}
                        <ComponentRecordAudio
                            setRefreshParentRandomNum={setRefreshParentRandomNum}
                            threadId={threadId}
                            setChatInputValue={setNewNote}
                        />

                        <button
                            type="button"
                            onClick={handleAiCall}
                            className="inline-flex h-9 shrink-0 items-center gap-1 rounded-xl border border-zinc-200/90 bg-white px-2.5 text-xs font-medium text-zinc-800 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50"
                            title="AI Call — voice conversation"
                        >
                            <span aria-hidden>🎙️</span>
                            Call
                        </button>

                        {isSubmitting === false && (
                            <button
                                type="button"
                                className="inline-flex h-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200/90 bg-white px-2.5 text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50"
                                onClick={regenerateResponse}
                                disabled={isSubmitting}
                                title="Regenerate"
                            >
                                <LucideRepeat className="h-4 w-4" strokeWidth={2} />
                            </button>
                        )}

                        <button
                            type="button"
                            className="inline-flex h-9 shrink-0 items-center rounded-xl border border-violet-200/80 bg-violet-50 px-2.5 text-xs font-medium text-violet-900 shadow-sm transition-colors hover:bg-violet-100/90"
                            onClick={() => {
                                handleAutoSelectContext({ threadId: threadId });
                            }}
                        >
                            Auto context
                        </button>
                    </div>
                    <div
                        className="flex items-center justify-center"
                        style={{
                            display: screenWidth === screenList.sm ? 'flex' : 'none',
                            width: '52px',
                        }}
                    >
                        <button
                            type="button"
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-100 shadow-md transition-colors hover:bg-zinc-800"
                            onClick={() => {
                                setHideRightSidebar((prevProps) => ({
                                    isOpen: !prevProps.isOpen,
                                }));
                            }}
                            title="Toggle panel"
                        >
                            <LucideSidebar className="h-4 w-4" strokeWidth={2} />
                        </button>
                    </div>
                </div>
            </div>

        </>
    );
};

export default ComponentChatMessageInput;