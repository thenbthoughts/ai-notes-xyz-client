import { useState } from 'react';
import {
    LucideList,
    LucideMoveDown,
    LucideMoveUp,
    LucidePlus,
    LucideRefreshCcw,
    LucideSettings
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

import {
    ComponentInfoVaultLeftWrapperModelRender,
    ComponentInfoVaultLeftWrapperRender
} from './sectionLeft/ComponentInfoVaultLeftWrapper.tsx';
import useResponsiveScreen, {
    screenList
} from '../../../../hooks/useResponsiveScreen.tsx';

import ComponentRightWrapper from './sectionRight/ComponentRightWrapper.tsx';

import { infoVaultAddAxios } from './utils/infoVaultListAxios.ts';

const InfoVaultWrapper = () => {

    // useState
    const screenWidth = useResponsiveScreen();
    const navigate = useNavigate();
    
    const [
        stateDisplayChatHistory,
        setStateDisplayChatHistory,
    ] = useState(false);

    const [refreshRandomNum, setRefreshRandomNum] = useState(0);

    const infoVaultAddAxiosLocal = async () => {
        try {
            const result = await infoVaultAddAxios();
            if (result.success !== '') {
                navigate(`/user/info-vault?action=edit&id=${result.recordId}`)
            }
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div style={{ display: 'flex', width: '100%' }}>
            <div
                style={{
                    width: 'calc(100vw - 50px)'
                }}
            >
                <div className='container mx-auto px-1'>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row'
                        }}
                    >
                        {/* part 1 -> 25% */}
                        {screenWidth === screenList.lg && (
                            <div
                                style={{
                                    width: '25%'
                                }}
                            >
                                <ComponentInfoVaultLeftWrapperRender />
                            </div>
                        )}

                        {/* part 2 -> 75% */}
                        <div
                            style={{
                                width: screenWidth === screenList.lg ? '75%' : '100%'
                            }}
                        >
                            <div style={{
                                maxWidth: '1000px',
                                margin: '0 auto',
                            }}>
                                {/*  */}
                                <div
                                    style={{
                                        height: 'calc(100vh - 60px)',
                                    }}
                                >
                                    <ComponentRightWrapper
                                        refreshRandomNumParent={refreshRandomNum}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* part 3 -> 50px */}
            <div
                style={{
                    width: '50px',
                }}
                className='text-center flex flex-col items-center justify-center'
            >
                <div className='w-full'>
                    {/* setting */}
                    <div
                        className='p-1 cursor-pointer'
                    >
                        <div className={`py-3 rounded-sm bg-gray-600`}>
                            <Link to={'/user/setting'}>
                                <LucideSettings
                                    style={{
                                        width: '100%',
                                        color: 'white', // Set icon color to white
                                    }}
                                    className=''
                                />
                            </Link>
                        </div>
                    </div>

                    {/* add */}
                    <div
                        className='p-1 cursor-pointer'
                        onClick={() => {
                            infoVaultAddAxiosLocal();
                        }}
                    >
                        <div className={`py-3 rounded-sm bg-gray-600`}>
                            <LucidePlus
                                style={{
                                    width: '100%',
                                    color: 'white',
                                }}
                                className=''
                            />
                        </div>
                    </div>

                    {/* move up */}
                    <div
                        className='p-1 cursor-pointer'
                        onClick={() => {
                            const messagesScrollUp = document.getElementById('messagesScrollUp');
                            if (messagesScrollUp) {
                                messagesScrollUp?.scrollIntoView({ behavior: "smooth" });
                            }
                        }}
                    >
                        <div className='py-3 bg-gray-600 rounded'>
                            <LucideMoveUp
                                style={{
                                    width: '100%',
                                    color: 'white', // Set icon color to white
                                }}
                                className=''
                            />
                        </div>
                    </div>

                    {/* move up */}
                    <div
                        className='p-1 cursor-pointer'
                        onClick={() => {
                            const messagesScrollDown = document.getElementById('messagesScrollDown');
                            if (messagesScrollDown) {
                                messagesScrollDown?.scrollIntoView({ behavior: "smooth" });
                            }
                        }}
                    >
                        <div className='py-3 bg-gray-600 rounded'>
                            <LucideMoveDown
                                style={{
                                    width: '100%',
                                    color: 'white', // Set icon color to white
                                }}
                                className=''
                            />
                        </div>
                    </div>

                    {/* refresh */}
                    <div
                        className='p-1 cursor-pointer'
                        onClick={() => {
                            toast.success('Refreshing...');
                            setRefreshRandomNum(
                                Math.floor(
                                    Math.random() * 1_000_000
                                )
                            );
                        }}
                    >
                        <div className='py-3 bg-gray-600 rounded'>
                            <LucideRefreshCcw
                                style={{
                                    width: '100%',
                                    color: 'white', // Set icon color to white
                                }}
                                className=''
                            />
                        </div>
                    </div>

                    {/* chat history */}
                    {screenWidth === screenList.sm && (
                        <div
                            className='p-1 cursor-pointer'
                            onClick={() => {
                                setStateDisplayChatHistory(!stateDisplayChatHistory);
                            }}
                        >
                            <div className={`py-3 rounded-sm ${stateDisplayChatHistory ? 'bg-blue-600' : 'bg-gray-600'}`}>
                                <LucideList
                                    style={{
                                        width: '100%',
                                        color: 'white', // Set icon color to white
                                    }}
                                    className=''
                                />
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* screen list */}
            {screenWidth === screenList.sm && (
                <div>
                    {stateDisplayChatHistory && (
                        <ComponentInfoVaultLeftWrapperModelRender />
                    )}
                </div>
            )}
        </div>
    );
};

export default InfoVaultWrapper;