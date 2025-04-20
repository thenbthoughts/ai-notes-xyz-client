import React, { useState, useEffect } from 'react';
import { LucideX } from 'lucide-react';
import axiosCustom from '../../../../config/axiosCustom';

import { Note } from './memoQuickAi.types';

const colorOptions = [
    { label: 'Default', value: 'bg-white' },
    { label: 'Red', value: 'bg-red-50' },
    { label: 'Yellow', value: 'bg-yellow-50' },
    { label: 'Green', value: 'bg-green-50' },
    { label: 'Blue', value: 'bg-blue-50' },
    { label: 'Purple', value: 'bg-purple-50' },
];

interface NoteFormProps {
    mode: 'add' | 'edit',
    note?: Note;
    onClose: () => void;
}

function ComponentMemoAdd({ mode, note, onClose }: NoteFormProps) {
    const [title, setTitle] = useState(note?.title || '');
    const [content, setContent] = useState(note?.content || '');
    const [color, setColor] = useState(note?.color || 'bg-white');
    const [labels, setLabels] = useState<string[]>(note?.labels || []);
    const [aiLabels, setAiLabels] = useState<string[]>([]);
    const [labelInput, setLabelInput] = useState(''); // Added state for label input

    useEffect(() => {
        // Generate AI labels based on title and content
        const newAiLabels = title.split(' ').map(word => `AI-${word}`).slice(0, 3); // Example AI label generation
        setAiLabels(newAiLabels);
    }, [title, content]);

    useEffect(() => {
        if (note) {
            setTitle(note.title);
            setContent(note.content);
            setColor(note.color);
            setLabels(note.labels);
            setAiLabels(note.labelsAi || []);
        }
    }, [note]);

    const handleAddLabel = (label: string) => {
        if (!labels.includes(label)) {
            setLabels([...labels, label]);
        }
    };

    const handleRemoveLabel = (labelToRemove: string) => {
        setLabels(labels.filter(label => label !== labelToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const noteData = {
            title,
            content,
            color,
            labels,
            isPinned: note?.isPinned || false, // Default to false if not editing
            shouldSentToAI: false, // Default value
            labelsAi: aiLabels, // Include aiLabels
        };

        if (mode === 'add') {
            await axiosCustom.post('/api/memos/crud/memoInsertOne', noteData);
        } else {
            if(note) {
                if(note._id) {
                    await axiosCustom.post(`/api/memos/crud/memoUpdateById/${note._id}`, noteData);
                }
            }
        }

        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <form
                onSubmit={handleSubmit}
                className={`bg-white w-full max-w-lg rounded-lg p-6 shadow-xl sm:p-4`}
            >
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-center sm:text-left">
                        {mode === 'edit' ? 'Edit Note' : 'New Note'}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-black/10"
                    >
                        <LucideX size={20} />
                    </button>
                </div>

                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-lg font-medium mb-2"
                />

                <textarea
                    placeholder="Take a note..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-transparent border-none outline-none resize-none min-h-[200px] mb-4"
                />

                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {labels.map(label => (
                            <div key={label} className="bg-gray-200 rounded-full px-2 py-1 flex items-center">
                                <span>{label}</span>
                                <button type="button" onClick={() => handleRemoveLabel(label)} className="ml-2 text-red-500">x</button>
                            </div>
                        ))}
                        {aiLabels.map(label => (
                            <div key={label} className="bg-blue-200 rounded-full px-2 py-1 flex items-center">
                                <span>{label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center">
                        <input
                            type="text"
                            placeholder="Add a label..."
                            id="labelInput"
                            value={labelInput} // Bind the input value to the state
                            onChange={(e) => setLabelInput(e.target.value)} // Update state on change
                            className="w-full bg-transparent border-none outline-none text-lg font-medium mb-2"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                const labelValue = labelInput.trim();
                                if (labelValue === '') {
                                    alert('Label cannot be empty.');
                                } else if (!labels.includes(labelValue)) {
                                    handleAddLabel(labelValue);
                                    setLabelInput(''); // Clear the input after adding
                                } else {
                                    alert('Label already exists.');
                                    setLabelInput(''); // Clear the input if label exists
                                }
                            }}
                            className="ml-2 px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Add
                        </button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center mt-4">
                    <div className="flex gap-2">
                        {colorOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setColor(option.value)}
                                className={`w-6 h-6 rounded-full ${option.value} border ${color === option.value ? 'border-blue-500' : 'border-gray-300'
                                    }`}
                                title={option.label}
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        className="mt-2 sm:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        {mode === 'edit' ? 'Save' : 'Add Note'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ComponentMemoAdd;