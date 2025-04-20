import { NoteCard } from './ComponentNoteCard';

import { Note } from './memoQuickAi.types';

interface NoteListProps {
  title: string;
  notes: Note[];
  onEdit: (id: string) => void;
  className?: string;
  setRefreshParentRandomNum: React.Dispatch<React.SetStateAction<number>>
}

export default function NoteList({
  title,
  notes,
  onEdit,
  className = '',
  setRefreshParentRandomNum,
}: NoteListProps) {
  if (notes.length === 0) return null;

  return (
    <div className={className}>
      <h2 className="text-lg font-medium text-gray-900 mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map(note => (
          <NoteCard
            key={note._id}
            note={note}
            onEdit={onEdit}
            setRefreshParentRandomNum={setRefreshParentRandomNum}
          />
        ))}
      </div>
    </div>
  );
}