import { LucidePin, LucideTrash2, LucideEdit } from 'lucide-react';
import { DateTime } from 'luxon';

import { Note } from './memoQuickAi.types';
import axiosCustom from '../../../../config/axiosCustom';

interface NoteCardProps {
  note: Note;
  onEdit: (id: string) => void;
  setRefreshParentRandomNum: React.Dispatch<React.SetStateAction<number>>
}

export function NoteCard({
  note,
  onEdit,
  setRefreshParentRandomNum,
}: NoteCardProps) {

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this note?");
    if (confirmDelete) {
      try {
        await axiosCustom.post(`/api/memos/crud/memoDeleteById/${note._id}`);
        setRefreshParentRandomNum(Math.floor(Math.random() * 1_000_000)); // Refresh parent component
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  const handlePin = async () => {
    try {
      await axiosCustom.post(`/api/memos/crud/memoUpdateById/${note._id}`, {
        position: -10000,
        isPinned: !note.isPinned
      });
      setRefreshParentRandomNum(Math.floor(Math.random() * 1_000_000)); // Refresh parent component

      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error updating pin status:', error);
    }
  };

  return (
    <div className={`${note.color} rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200 break-words`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-lg">{note.title}</h3>
        <button
          onClick={handlePin}
          className={`p-1 rounded-full hover:bg-black/10 ${note.isPinned ? 'text-blue-600' : ''}`}
          title={note.isPinned ? 'Unpin' : 'Pin'}
        >
          <LucidePin size={18} className={note.isPinned ? '-rotate-45' : ''} />
        </button>
      </div>

      <p className="text-sm mb-4 whitespace-pre-wrap">{note.content}</p>

      {(note.labels.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {note.labels.map(label => (
            <span key={label} className="bg-gray-200 rounded-full px-2 py-1 text-sm">{label}</span>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center text-sm text-gray-600">
        <span title={DateTime.fromISO(note.updatedAtUtc).toFormat('f')}>
          {DateTime.fromISO(note.updatedAtUtc).toRelative()}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(note._id)}
            className="p-1 rounded-full hover:bg-black/10"
            title="Edit"
          >
            <LucideEdit size={18} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 rounded-full hover:bg-black/10 text-red-600"
            title="Delete"
          >
            <LucideTrash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}