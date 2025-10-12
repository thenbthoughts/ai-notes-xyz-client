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

            <div className='border p-2 rounded-md bg-white'>
                <p className="my-2 py-1">
                    <a
                        href="/user/notes?action=edit&id=68eb5f7ffdf31bd75154feb0&workspace=6891767328b79f38dfe2fda3"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Notes"
                        className="hover:underline"
                    >
                        Go to Notes (Edit)
                    </a>
                </p>

                <p className="my-2 py-1">
                    <a
                        href="/user/task?workspace=6861840c3542e9db9fa60de8&edit-task-id=68e0b8d1b6213c6739881e12"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Task"
                        className="hover:underline"
                    >
                        Go to Task (Edit)
                    </a>
                </p>

                <p className="my-2 py-1">
                    <a
                        href="/user/life-events?action=edit&id=68eb3616c612ba01a0ffbe6d"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Life Events"
                        className="hover:underline"
                    >
                        Go to Life Events (Edit)
                    </a>
                </p>

                <p className="my-2 py-1">
                    <a
                        href="/user/info-vault?action=edit&id=685c392fb937349f647a7ccb"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Info Vault"
                        className="hover:underline"
                    >
                        Go to Info Vault (Edit)
                    </a>
                </p>
            </div>

            <TestReactQuill />

            <TestChatInput />
        </div>
    )
};

export default TestDevWrapper;