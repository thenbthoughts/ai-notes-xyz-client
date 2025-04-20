import React, { useState } from 'react';
import { 
  Tag, 
  MessageCircle, 
  Calendar, 
  CheckSquare, 
  PlusSquare,
  Clock,
  X,
} from 'lucide-react';

interface TaskDetailsProps {
    task?: Task;
    onClose: () => void;
    onUpdate?: (updatedTask: Task) => void;
    lists?: string[];
}

interface Task {
    id: number;
    title?: string;
    description?: string;
    content?: string;
    list?: string;
    priority?: 'low' | 'medium' | 'high';
    dueDate?: Date;
    labels?: Array<{color: string, name: string}>;
    checklists?: Array<{
        title: string, 
        items: Array<{text: string, completed: boolean}>
    }>;
    comments?: Array<{
        text: string, 
        author: string, 
        timestamp: Date
    }>;
}

const defaultTask: Task = {
    id: Date.now(),
    title: 'New Task',
    description: 'Add a description...',
    list: 'To Do',
    labels: [],
    checklists: [],
    comments: []
};

const LABEL_COLORS = [
    'bg-green-500', 'bg-yellow-500', 'bg-red-500', 
    'bg-blue-500', 'bg-purple-500', 'bg-pink-500'
];

const TaskDetails: React.FC<TaskDetailsProps> = ({ 
    task = defaultTask, 
    onClose, 
    onUpdate,
    lists = ['To Do', 'In Progress', 'Done']
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(task.title || '');
    const [editedDescription, setEditedDescription] = useState(task.description || '');
    const [newLabel, setNewLabel] = useState('');
    const [newComment, setNewComment] = useState('');
    const [selectedList, setSelectedList] = useState(task.list || lists[0]);

    const handleAddLabel = () => {
        if (newLabel.trim()) {
            const color = LABEL_COLORS[Math.floor(Math.random() * LABEL_COLORS.length)];
            const updatedTask = {
                ...task,
                labels: [...(task.labels || []), { name: newLabel, color }]
            };
            onUpdate?.(updatedTask);
            setNewLabel('');
        }
    };

    const handleAddComment = () => {
        if (newComment.trim()) {
            const updatedTask = {
                ...task,
                comments: [...(task.comments || []), {
                    text: newComment, 
                    author: 'You', 
                    timestamp: new Date()
                }]
            };
            onUpdate?.(updatedTask);
            setNewComment('');
        }
    };

    const handleSaveDetails = () => {
        const updatedTask = {
            ...task,
            title: editedTitle,
            description: editedDescription,
            list: selectedList
        };
        onUpdate?.(updatedTask);
        setIsEditing(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-gray-100 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-white p-4 flex justify-between items-center border-b">
                    <div className="flex items-center space-x-2">
                        <CheckSquare className="text-blue-600" />
                        {isEditing ? (
                            <input 
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                className="text-xl font-semibold w-full border-b border-blue-500"
                            />
                        ) : (
                            <h2 className="text-xl font-semibold">{task.title}</h2>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={() => setIsEditing(!isEditing)}
                            className="text-gray-600 hover:text-blue-600"
                        >
                            {isEditing ? 'Cancel' : 'Edit'}
                        </button>
                        <button 
                            onClick={onClose} 
                            className="text-gray-600 hover:text-red-600"
                        >
                            <X />
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-4 grid grid-cols-3 gap-4">
                    {/* Left Column */}
                    <div className="col-span-2 space-y-4">
                        {/* Description */}
                        <div>
                            <h3 className="font-semibold mb-2 flex items-center">
                                <Tag className="mr-2 text-gray-600" /> Description
                            </h3>
                            {isEditing ? (
                                <textarea 
                                    value={editedDescription}
                                    onChange={(e) => setEditedDescription(e.target.value)}
                                    className="w-full border p-2 rounded"
                                    rows={4}
                                />
                            ) : (
                                <p className="text-gray-700">{task.description || 'No description'}</p>
                            )}
                        </div>

                        {/* Labels */}
                        <div>
                            <h3 className="font-semibold mb-2 flex items-center">
                                <PlusSquare className="mr-2 text-gray-600" /> Labels
                            </h3>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {task.labels?.map((label, index) => (
                                    <span 
                                        key={index} 
                                        className={`${label.color} text-white px-2 py-1 rounded text-xs`}
                                    >
                                        {label.name}
                                    </span>
                                ))}
                            </div>
                            {isEditing && (
                                <div className="flex space-x-2">
                                    <input 
                                        value={newLabel}
                                        onChange={(e) => setNewLabel(e.target.value)}
                                        placeholder="New label"
                                        className="border p-2 rounded flex-grow"
                                    />
                                    <button 
                                        onClick={handleAddLabel}
                                        className="bg-blue-500 text-white p-2 rounded"
                                    >
                                        Add
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Comments */}
                        <div>
                            <h3 className="font-semibold mb-2 flex items-center">
                                <MessageCircle className="mr-2 text-gray-600" /> Comments
                            </h3>
                            <div className="space-y-2 mb-2">
                                {task.comments?.map((comment, index) => (
                                    <div 
                                        key={index} 
                                        className="bg-white p-2 rounded shadow-sm"
                                    >
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>{comment.author}</span>
                                            <span>{comment.timestamp.toLocaleString()}</span>
                                        </div>
                                        <p>{comment.text}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex space-x-2">
                                <input 
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write a comment..."
                                    className="border p-2 rounded flex-grow"
                                />
                                <button 
                                    onClick={handleAddComment}
                                    className="bg-blue-500 text-white p-2 rounded"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="col-span-1 space-y-4">
                        {/* List Selection */}
                        <div>
                            <h3 className="font-semibold mb-2">List</h3>
                            {isEditing ? (
                                <select 
                                    value={selectedList}
                                    onChange={(e) => setSelectedList(e.target.value)}
                                    className="w-full border p-2 rounded"
                                >
                                    {lists.map(list => (
                                        <option key={list} value={list}>{list}</option>
                                    ))}
                                </select>
                            ) : (
                                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded inline-block">
                                    {task.list}
                                </div>
                            )}
                        </div>

                        {/* Due Date */}
                        <div>
                            <h3 className="font-semibold mb-2 flex items-center">
                                <Calendar className="mr-2 text-gray-600" /> Due Date
                            </h3>
                            {task.dueDate ? (
                                <div className="flex items-center space-x-2">
                                    <Clock className="text-gray-600" />
                                    <span>{task.dueDate.toLocaleDateString()}</span>
                                </div>
                            ) : (
                                <p className="text-gray-500">No due date</p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        {isEditing && (
                            <button 
                                onClick={handleSaveDetails}
                                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
                            >
                                Save Changes
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetails;