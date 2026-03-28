import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';

import { jotaiStateNotesWorkspaceId } from '../stateJotai/notesStateJotai.ts';
import { NotesWorkspacePicker } from './NotesWorkspacePicker.tsx';

const ComponentNotesWorkspace = () => {
    const [workspaceId, setWorkspaceId] = useAtom(jotaiStateNotesWorkspaceId);
    const navigate = useNavigate();

    return (
        <NotesWorkspacePicker
            selectedId={workspaceId}
            onSelect={(id) => {
                setWorkspaceId(id);
                navigate(`/user/notes?workspace=${id}`);
            }}
        />
    );
};

export default ComponentNotesWorkspace;
