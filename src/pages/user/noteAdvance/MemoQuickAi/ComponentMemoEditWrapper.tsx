import { useEffect, useState } from 'react';
import ComponentMemoAdd from './ComponentMemoAdd';

import axiosCustom from '../../../../config/axiosCustom';
import { Note } from './memoQuickAi.types';

const ComponentMemoEditWrapper = ({
    onClose,
    recordId,
}: {
    onClose: () => void;
    recordId: string,
}) => {
    const [note, setNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState<boolean>(true); // State for loading

    useEffect(() => {
        const fetchNoteData = async () => {
            setLoading(true); // Set loading to true when fetching starts
            try {
                const response = await axiosCustom.post(`/api/memos/crud/memoList/`, {
                    recordId,
                    searchQuery: '',
                });
                const fetchedNote = response.data.data.docs[0];
                if (fetchedNote) {
                    setNote(fetchedNote);
                } else {
                    console.error('No note found with the given ID.');
                }
            } catch (error) {
                console.error('Error fetching note data:', error);
            } finally {
                setLoading(false); // Set loading to false when fetching ends
            }
        };

        fetchNoteData();
    }, [recordId]);

    if (loading) {
        return <div>Loading...</div>; // Show loading state
    }

    return (
        <div>
            {note && (
                <ComponentMemoAdd
                    mode={'edit'}
                    note={note}
                    onClose={onClose}
                />
            )}
        </div>
    );
};

export default ComponentMemoEditWrapper;