import { useState } from 'react';
import cssNoteAdvanceList from './scss/noteAdvanceList.module.scss';
import toast from 'react-hot-toast';
import axiosCustom from '../../../../config/axiosCustom';
import ComponentUploadFile from './ComponentUploadFile';
import ComponentRecordAudio from './ComponentRecordAudio';
import { LucideSend } from 'lucide-react';

const ComponentNotesAdd = ({
    setRefreshParentRandomNum
}: {
    setRefreshParentRandomNum: React.Dispatch<React.SetStateAction<number>>
}) => {
    // useState
    const [newNote, setNewNote] = useState('');

    // functions
    const handleAddNote = async () => {
        try {
            if (newNote.trim().length > 1) {
                const toastLoadingId = toast.loading('Adding note...');
                const config = {
                    method: 'post',
                    url: `/api/chat-one/chat-add/notesAdd`,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    data: {
                        type: "text",
                        content: newNote,
                        visibility: 'public',
                        tags: [],
                        imagePathsArr: []
                    }
                };

                await axiosCustom.request(config);
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
                />

                {/* audio */}
                <ComponentRecordAudio
                    setRefreshParentRandomNum={setRefreshParentRandomNum}
                />

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