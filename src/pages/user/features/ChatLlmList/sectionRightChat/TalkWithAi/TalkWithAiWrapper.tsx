import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { Link } from 'react-router-dom';

import stateJotaiAuthAtom from '../../../../../../jotai/stateJotaiAuth';
import TalkWithAi from './TalkWithAi';

const TalkWithAiWrapper = ({
    threadId,
}: {
    threadId: string;
}) => {
    const authState = useAtomValue(stateJotaiAuthAtom);

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

    const [canUseTalkWithAi, setCanUseTalkWithAi] = useState(() =>
        hasSpeechToTextApiKey(authState) &&
        hasLlmApiKey(authState) &&
        hasTtsApiKey(authState)
    );

    useEffect(() => {
        setCanUseTalkWithAi(
            hasSpeechToTextApiKey(authState) &&
            hasLlmApiKey(authState) &&
            hasTtsApiKey(authState)
        );
    }, [authState]);

    if (!canUseTalkWithAi) {
        const missing = [];
        if (!hasSpeechToTextApiKey(authState)) missing.push('Speech-to-text');
        if (!hasLlmApiKey(authState)) missing.push('LLM');
        if (!hasTtsApiKey(authState)) missing.push('TTS');

        return (
            <div className="p-4 text-center border border-amber-200 rounded-lg bg-amber-50">
                <p className="text-amber-800 font-medium mb-2">
                    Talk with AI requires API keys for: Speech-to-text, LLM, and TTS.
                    {missing.length > 0 && (
                        <span className="block mt-1 text-sm">Missing: {missing.join(', ')}</span>
                    )}
                </p>
                <Link
                    to="/user/setting/api-key"
                    className="text-blue-600 hover:underline font-semibold"
                >
                    Configure API Keys →
                </Link>
            </div>
        );
    }

    return (
        <div>
            <TalkWithAi threadId={threadId} />
        </div>
    );
};

export default TalkWithAiWrapper;