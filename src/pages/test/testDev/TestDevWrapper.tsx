import { Link } from 'react-router-dom';
import TestReactQuill from './TestReactQuill';

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

            <TestReactQuill />
        </div>
    )
};

export default TestDevWrapper;