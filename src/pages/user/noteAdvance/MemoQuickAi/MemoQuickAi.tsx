import { useEffect, useState } from 'react';
import { LucidePlus, LucideRefreshCw } from 'lucide-react';

import axiosCustom from '../../../../config/axiosCustom';

import { Note } from './memoQuickAi.types';

import ComponentMemoAdd from './ComponentMemoAdd';
import ComponentMemoList from './ComponentMemoList';
import ComponentMemoEditWrapper from './ComponentMemoEditWrapper';
import { DebounceInput } from 'react-debounce-input';

const MemoQuickAi = () => {
    const [modalAddOpenStatus, setModalAddOpenStatus] = useState(false);
    const [modalEditOpenStatus, setModalEditOpenStatus] = useState({
        statusOpen: false,
        id: ''
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [notes, setNotes] = useState([] as Note[]);
    const [refreshRandomNum, setRefreshRandomNum] = useState(0);
    const [loading, setLoading] = useState<boolean>(false); // State for loading

    // -----
    // useEffect
    useEffect(() => {
        fetchData();
    }, [
        refreshRandomNum,
        searchQuery,
    ]);

    // -----
    // functions
    const fetchData = async () => {
        setLoading(true); // Set loading to true when fetching starts
        try {
            const response = await axiosCustom.post('/api/memos/crud/memoList', {
                recordId: "",
                searchQuery: searchQuery,
            });
            setNotes(response.data.data.docs);
        } catch (error) {
            console.error('Error fetching memo list:', error);
        } finally {
            setLoading(false); // Set loading to false when fetching ends
        }
    }

    const handleEditNote = (recordId: string) => {
        setModalEditOpenStatus({
            statusOpen: true,
            id: recordId,
        })
    };

    return (
        <div style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '20px',
        }}>
            <div>
                <div className="pt-8 pb-2 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Quick Ai Memo
                    </h2>
                    <button onClick={fetchData}>
                        <LucideRefreshCw size={20} className="inline-block mr-2" />
                    </button>
                </div>

                {loading && (
                    <div
                        className="animate-pulse text-blue-600 font-semibold text-center py-4"
                    >Loading...</div>
                )}

                {/* Search and add notes */}
                <div className="mx-auto py-6 flex flex-col md:flex-row">
                    <div className="flex-1">
                        <DebounceInput
                            debounceTimeout={750}
                            type="text"
                            placeholder="Search notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        onClick={() => setModalAddOpenStatus(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-2 md:mt-0 md:ml-4"
                    >
                        <LucidePlus size={20} style={{
                            display: 'inline-block',
                            position: 'relative',
                            top: '-2px',
                        }} className='mr-2' /> Add Note
                    </button>
                </div>

                {/*  */}
                <div>
                    {notes.length === 0 && (
                        <div className="text-center text-gray-500 py-4">
                            No notes found.
                        </div>
                    )}
                </div>

                <div>
                    <ComponentMemoList
                        title="Pinned"
                        notes={notes.filter(note => note.isPinned)}
                        onEdit={handleEditNote}
                        className="mb-8"
                        setRefreshParentRandomNum={setRefreshRandomNum}
                    />

                    <ComponentMemoList
                        title="Others"
                        notes={notes.filter(note => !note.isPinned)}
                        onEdit={handleEditNote}
                        className="mb-8"
                        setRefreshParentRandomNum={setRefreshRandomNum}
                    />
                </div>

                <div>
                    {modalAddOpenStatus && (
                        <ComponentMemoAdd
                            mode={'add'}
                            onClose={() => {
                                setRefreshRandomNum(Math.floor(Math.random() * 1_000_000));
                                setModalAddOpenStatus(false)
                            }}
                        />
                    )}
                    {modalEditOpenStatus.statusOpen && (
                        <ComponentMemoEditWrapper
                            recordId={modalEditOpenStatus.id}
                            onClose={() => {
                                setRefreshRandomNum(Math.floor(Math.random() * 1_000_000));
                                setModalEditOpenStatus({
                                    statusOpen: false,
                                    id: '',
                                })
                            }}
                        />
                    )}
                </div>

            </div>
        </div>
    );
}

export default MemoQuickAi;