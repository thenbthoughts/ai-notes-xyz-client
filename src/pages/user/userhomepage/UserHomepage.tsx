import { Link } from 'react-router-dom'; // Importing Link from react-router-dom
import { LucideInfo, LucideList, LucideMessageSquare, LucideSettings, LucideLogIn, LucideUserPlus, LucideLogOut, LucideStickyNote, LucideLoader } from 'lucide-react'; // Importing lucide icons
import { useAtomValue } from 'jotai';
import stateJotaiAuthAtom from '../../../jotai/stateJotaiAuth'; // Adjust the import path as necessary
import iconGit from './iconGit.svg';

const UserHomepage = () => {
    const authState = useAtomValue(stateJotaiAuthAtom);

    return (
        <div>
            <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '20px',
                        textAlign: 'center',
                    }}
                >
                    {authState.isLoggedIn === 'pending' && (
                        <Link to="/" className='block p-3 border bg-cyan-100 rounded hover:shadow-md'>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <LucideLoader size={32} />
                            </div>
                            <div>Loading...</div>
                        </Link>
                    )}
                    {authState.isLoggedIn === 'true' && (
                        <>
                            <Link to="/user/chat-one" className='block p-3 border bg-cyan-100 rounded hover:shadow-md'>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <LucideMessageSquare size={32} />
                                </div>
                                <div>Chat One</div>
                            </Link>
                            <Link to="/user/task" className='block p-3 border bg-cyan-100 rounded hover:shadow-md'>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <LucideList size={32} />
                                </div>
                                <div>Task</div>
                            </Link>
                            <Link to="/user/quick-memo-ai" className='block p-3 border bg-cyan-100 rounded hover:shadow-md'>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <LucideStickyNote size={32} />
                                </div>
                                <div>Memo</div>
                            </Link>
                            <Link to="/user/setting" className='block p-3 border bg-cyan-100 rounded hover:shadow-md'>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <LucideSettings size={32} />
                                </div>
                                <div>Settings</div>
                            </Link>
                            <Link to="/logout" className='block p-3 border bg-red-400 rounded hover:shadow-md'>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <LucideLogOut size={32} />
                                </div>
                                <div>Logout</div>
                            </Link>
                        </>
                    )}

                    {authState.isLoggedIn === 'false' && (
                        <>
                            <Link to="/login" className='block p-3 border bg-cyan-100 rounded hover:shadow-md'>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <LucideLogIn size={32} />
                                </div>
                                <div>Login</div>
                            </Link>
                            <Link to="/register" className='block p-3 border bg-cyan-100 rounded hover:shadow-md'>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <LucideUserPlus size={32} />
                                </div>
                                <div>Register</div>
                            </Link>
                        </>
                    )}
                    <Link to="/about" className='block p-3 border bg-cyan-100 rounded hover:shadow-md'>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <LucideInfo size={32} />
                        </div>
                        <div>About</div>
                    </Link>
                    <a
                        href="https://github.com/thenbthoughts"
                        className='block p-3 border bg-cyan-100 rounded hover:shadow-md'
                    >
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            {/* <LucideGitBranch size={32} /> */}
                            <img
                                src={iconGit}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    objectFit: 'contain',
                                }}
                            />
                        </div>
                        <div>Git</div>
                    </a>
                </div>
            </div>
        </div>
    )
};

export default UserHomepage;