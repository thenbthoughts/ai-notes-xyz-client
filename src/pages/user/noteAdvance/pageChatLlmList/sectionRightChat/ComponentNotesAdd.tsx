import { useState } from 'react';
import cssNoteAdvanceList from './scss/noteAdvanceList.module.scss';
import toast from 'react-hot-toast';
import axiosCustom from '../../../../../config/axiosCustom';
import ComponentUploadFile from './ComponentUploadFile';
import ComponentRecordAudio from './ComponentRecordAudio';
import { LucideSend } from 'lucide-react';
import { handleAutoSelectContextFirstMessage, handleAutoSelectContext } from '../utils/chatLlmThreadAxios';

const ComponentNotesAdd = ({
    setRefreshParentRandomNum,
    threadId,
}: {
    setRefreshParentRandomNum: React.Dispatch<React.SetStateAction<number>>;
    threadId: string;
}) => {
    // useState
    const [newNote, setNewNote] = useState('');

    // functions
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

                setRefreshParentRandomNum(
                    Math.floor(
                        Math.random() * 1_000_000
                    )
                )

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
            }

            setNewNote("");
            setRefreshParentRandomNum(
                Math.floor(
                    Math.random() * 1_000_000
                )
            )
        } catch (error) {
            console.error(error);
            toast.error('Error adding note. Please try again.');
        }
    };

    return (
        <div
            style={{
                height: '165px',
                paddingTop: '1px',
            }}
            className='px-2'
        >
            <textarea
                className="w-full p-2 border border-gray-300 block rounded"
                placeholder="Enter notes..."
                style={{
                    height: '95px',
                    maxHeight: '95px',
                    marginBottom: '5px'
                }}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
            />
            <div
                className={cssNoteAdvanceList.actionContainer}
            >
                {/* send */}
                <button
                    className="bg-green-500 hover:bg-green-700 text-white font-bold px-4 focus:outline-none focus:shadow-outline mr-2 rounded"
                    style={{
                        height: '40px'
                    }}
                    onClick={() => {
                        handleAddNote();
                    }}
                >
                    <LucideSend
                        style={{
                            height: '20px',
                        }}
                    />
                </button>

                {/* file */}
                <ComponentUploadFile
                    setRefreshParentRandomNum={setRefreshParentRandomNum}
                    threadId={threadId}
                />

                {/* audio */}
                <ComponentRecordAudio
                    setRefreshParentRandomNum={setRefreshParentRandomNum}
                    threadId={threadId}
                />

                {/* auto select context notes */}
                <button
                    className="bg-purple-500 hover:bg-purple-700 text-white font-bold px-4 focus:outline-none focus:shadow-outline mr-2 rounded whitespace-nowrap"
                    style={{
                        height: '40px'
                    }}
                    onClick={() => {
                        handleAutoSelectContext({
                            threadId: threadId,
                        });
                    }}
                >AI: Auto Context</button>

                {/* public or private */}
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 focus:outline-none focus:shadow-outline mr-2 rounded"
                    style={{
                        height: '40px'
                    }}
                >Private</button>

                {/* advance */}
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 focus:outline-none focus:shadow-outline mr-2 rounded"
                    style={{
                        height: '40px'
                    }}
                >Advance</button>
            </div>
        </div>
    )
};

export default ComponentNotesAdd;