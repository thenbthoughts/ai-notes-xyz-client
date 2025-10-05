import { Link } from 'react-router-dom';
import TestReactQuill from './TestReactQuill';
import TestChatInput from './TestChatInput';

const TestDevWrapper = () => {
    return (
        <div className='container px-2 mx-auto'>
            <h1 className="text-5xl font-bold">Test Dev Wrapper</h1>
            <p>
                <Link to="/user/notes" target="_blank" rel="noopener noreferrer">Go to Notes (work on)</Link>
            </p>
            <p>
                <Link to="/user/info-vault" target="_blank" rel="noopener noreferrer">Go to Info Vault</Link>
            </p>
            <p>
                <Link to="/user/calender" target="_blank" rel="noopener noreferrer">Go to Calendar</Link>
            </p>
            <p>
                <Link to="/user/finance" target="_blank" rel="noopener noreferrer">Go to Finance</Link>
            </p>
            <p>
                <Link to="/user/ai-deep-search" target="_blank" rel="noopener noreferrer">Go to AI Deep Search</Link>
            </p>

            <p>
                <Link to="/test/homepage-backup-delete" target="_blank" rel="noopener noreferrer">Go to Homepage Backup Delete</Link>
            </p>

            <p>
                <Link to="/user/task-schedule" target="_blank" rel="noopener noreferrer">Go to Task Schedule</Link>
            </p>

            <p>
                <Link to="/user/ai-suggestions-demo" target="_blank" rel="noopener noreferrer">Go to AI Suggestions Demo</Link>
            </p>

            <TestReactQuill />

            <TestChatInput />
        </div>
    )
};

export default TestDevWrapper;