import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { LucideAudioLines, LucideDownload, LucideFile, LucideFileText, LucideSend, LucideVideo, LucideX } from 'lucide-react';
import envKeys from '../../../../../config/envKeys';
import axios from 'axios';
import axiosCustom from '../../../../../config/axiosCustom';

import cssNoteAdvanceList from './scss/noteAdvanceList.module.scss';
import ComponentUploadFile from './ComponentUploadFile';
import ComponentRecordAudio from './ComponentRecordAudio';
import { handleAutoSelectContextFirstMessage, handleAutoSelectContext } from '../utils/chatLlmThreadAxios';
import FileUploadEnvCheck from '../../../../../components/FileUploadEnvCheck';

import { useSetAtom } from 'jotai';
import { jotaiChatLlmFooterHeight } from '../jotai/jotaiChatLlmThreadSetting';

const TextAndFileInput = ({
    value,
    setValue,
    setFiles,
}: {
    value: string;
    setValue: React.Dispatch<React.SetStateAction<string>>;
    files: string[];
    setFiles: React.Dispatch<React.SetStateAction<string[]>>;
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
        const formData = new FormData();
        formData.append('file', file);

        const config = {
            method: 'post',
            url: `${envKeys.API_URL}/api/uploads/crudS3/uploadFile`,
            data: formData,
            withCredentials: true,
        };

        const response = await axios.request(config);
        setFiles(prev => [...prev, response.data.fileName]);
        toast.success(`File "${file.name}" uploaded successfully!`);
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
                // className="w-full p-3 border border-gray-300 rounded min-h-[80px] focus:outline-none focus:border-blue-500 resize-none"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500 resize-none"
                placeholder={"Type your message or drag & drop any files here..."}
                ref={textareaRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onDrop={handleFileDrop}
                onDragOver={handleDragOver}
                onPaste={handlePaste}
                style={{
                    height: 'auto',
                    maxHeight: `50vh`,
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
                                    href={`${envKeys.API_URL}/api/uploads/crudS3/getFile?fileName=${file}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <img
                                        src={`${envKeys.API_URL}/api/uploads/crudS3/getFile?fileName=${file}`}
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
                                    href={`${envKeys.API_URL}/api/uploads/crudS3/getFile?fileName=${file}`}
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
                                    href={`${envKeys.API_URL}/api/uploads/crudS3/getFile?fileName=${file}`}
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
                                    href={`${envKeys.API_URL}/api/uploads/crudS3/getFile?fileName=${file}`}
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
                                    href={`${envKeys.API_URL}/api/uploads/crudS3/getFile?fileName=${file}`}
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
                                href={`${envKeys.API_URL}/api/uploads/crudS3/getFile?fileName=${file}`}
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
                        <div key={index} className="flex-shrink-0 bg-gray-100 p-2 rounded-md min-w-[200opx] max-w-[200px]">
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
                                            href={`${envKeys.API_URL}/api/uploads/crudS3/getFile?fileName=${file}`}
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

const ComponentNotesAdd = ({
    setRefreshParentRandomNum,
    threadId,
}: {
    setRefreshParentRandomNum: React.Dispatch<React.SetStateAction<number>>;
    threadId: string;
}) => {
    const actionContainerRef = useRef<HTMLDivElement>(null);
    const setChatLlmFooterHeight = useSetAtom(jotaiChatLlmFooterHeight);

    const [newNote, setNewNote] = useState('');
    const [files, setFiles] = useState<string[]>([]);

    useEffect(() => {
        if (actionContainerRef.current) {
            setChatLlmFooterHeight(actionContainerRef.current.clientHeight);
        }
    }, [newNote, files]);

    const handleAddNote = async () => {
        try {
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
                    messageCount: 1,
                });

                // process notes
                await axiosCustom.post("/api/chat-llm/add-auto-next-message/notesAddAutoNextMessage", {
                    threadId: threadId,
                });

                toast.dismiss(toastLoadingId);
                toast.success('Note added successfully!');

                setRefreshParentRandomNum(Math.floor(Math.random() * 1_000_000));
                setNewNote("");
            }
        } catch (error) {
            console.error(error);
            toast.error('Error adding note. Please try again.');
        }
    };

    return (
        <div
            ref={actionContainerRef}
            style={{
                paddingTop: '1px',
            }}
            className='px-2'
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
            />

            {/* action container - 50px */}
            <div className={cssNoteAdvanceList.actionContainer}>
                {/* send */}
                <button
                    className="bg-green-500 hover:bg-green-700 text-white font-bold px-4 focus:outline-none focus:shadow-outline mr-2 rounded"
                    style={{ height: '40px' }}
                    onClick={handleAddNote}
                >
                    <LucideSend style={{ height: '20px' }} />
                </button>

                {/* file */}
                <FileUploadEnvCheck iconType="file">
                    <ComponentUploadFile
                        setRefreshParentRandomNum={setRefreshParentRandomNum}
                        threadId={threadId}
                        setFiles={setFiles}
                    />
                </FileUploadEnvCheck>

                {/* audio */}
                <FileUploadEnvCheck iconType="audio">
                    <ComponentRecordAudio
                        setRefreshParentRandomNum={setRefreshParentRandomNum}
                        threadId={threadId}
                    />
                </FileUploadEnvCheck>

                {/* auto select context notes */}
                <button
                    className="bg-purple-500 hover:bg-purple-700 text-white font-bold px-4 focus:outline-none focus:shadow-outline mr-2 rounded whitespace-nowrap"
                    style={{ height: '40px' }}
                    onClick={() => {
                        handleAutoSelectContext({ threadId: threadId });
                    }}
                >
                    AI: Auto Context
                </button>
            </div>
        </div>
    );
};

export default ComponentNotesAdd;