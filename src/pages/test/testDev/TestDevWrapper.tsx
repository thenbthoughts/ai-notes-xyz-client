import { Link } from 'react-router-dom';
import TestReactQuill from './TestReactQuill';

const TestDevWrapper = () => {
    return (
        <div className='container px-2 mx-auto'>
            <h1 className="text-5xl font-bold">Test Dev Wrapper</h1>
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
                <Link to="/user/ai-suggestions-demo" target="_blank" rel="noopener noreferrer">Go to AI Suggestions Demo</Link>
            </p>

            <p>
                <Link to="/user/search" target="_blank" rel="noopener noreferrer">Go to Search</Link>
            </p>

            <TestReactQuill />
        </div>
    )
};

export default TestDevWrapper;