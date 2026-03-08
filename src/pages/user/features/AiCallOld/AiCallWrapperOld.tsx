import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import stateJotaiAuthAtom from '../../../../jotai/stateJotaiAuth';
import AiCall from './AiCall';

const AiCallWrapperOld = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const authState = useAtomValue(stateJotaiAuthAtom);
    
    const [threadId, setThreadId] = useState('');

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const chatId = queryParams.get('id');
        if (chatId) {
            setThreadId(chatId);
        } else {
            // Redirect if no threadId
            navigate('/user/chat');
        }
    }, [location.search, navigate]);

    function hasSpeechToTextApiKey(s: typeof authState): boolean {
        if (s.apiKeyGroqValid) return true;
        if (s.apiKeyLocalaiValid) return true;
        if (s.apiKeyRunpodValid) return true;
        if (s.apiKeyReplicateValid) return true;
        if (s.apiKeyOpenaiValid) return true;
        return false;
    }

    function hasLlmApiKey(s: typeof authState): boolean {
        if (s.apiKeyGroqValid) return true;
        if (s.apiKeyOpenrouterValid) return true;
        if (s.apiKeyOllamaValid) return true;
        if (s.apiKeyOpenaiValid) return true;
        if (s.apiKeyLocalaiValid) return true;
        if (s.apiKeyRunpodValid) return true;
        if (s.apiKeyReplicateValid) return true;
        return false;
    }

    function hasTtsApiKey(s: typeof authState): boolean {
        if (s.apiKeyOpenaiValid) return true;
        if (s.apiKeyGroqValid) return true;
        return false;
    }

    const [canUseAiCall, setCanUseAiCall] = useState(() =>
        hasSpeechToTextApiKey(authState) &&
        hasLlmApiKey(authState) &&
        hasTtsApiKey(authState)
    );

    useEffect(() => {
        setCanUseAiCall(
            hasSpeechToTextApiKey(authState) &&
            hasLlmApiKey(authState) &&
            hasTtsApiKey(authState)
        );
    }, [authState]);

    if (!threadId) {
        return null; // Will redirect in useEffect
    }

    if (!canUseAiCall) {
        const missing = [];
        if (!hasSpeechToTextApiKey(authState)) missing.push('Speech-to-text');
        if (!hasLlmApiKey(authState)) missing.push('LLM');
        if (!hasTtsApiKey(authState)) missing.push('TTS');

        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
                <div className="p-6 max-w-md text-center border border-amber-200 rounded-lg bg-amber-50 shadow-xl">
                    <h2 className="text-xl font-bold text-amber-900 mb-4">API Keys Required</h2>
                    <p className="text-amber-800 font-medium mb-4">
                        AI Call requires API keys for: Speech-to-text, LLM, and TTS.
                        {missing.length > 0 && (
                            <span className="block mt-2 text-sm font-semibold">Missing: {missing.join(', ')}</span>
                        )}
                    </p>
                    <div className="flex gap-4 justify-center mt-6">
                        <button 
                            onClick={() => navigate(`/user/chat?id=${threadId}`)}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-medium"
                        >
                            Go Back
                        </button>
                        <Link
                            to="/user/setting/api-key"
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                        >
                            Configure API Keys
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <AiCall threadId={threadId} />
        </div>
    );
};

export default AiCallWrapperOld;