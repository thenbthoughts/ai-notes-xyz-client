import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import stateJotaiAuthAtom from '../../../../jotai/stateJotaiAuth';
import AiCall from './AiCall';

function hasRequiredKeys(auth: {
  apiKeyGroqValid: boolean;
  apiKeyOpenaiValid: boolean;
  apiKeyOpenrouterValid: boolean;
  apiKeyOllamaValid: boolean;
  apiKeyLocalaiValid: boolean;
  apiKeyRunpodValid: boolean;
  apiKeyReplicateValid: boolean;
}): boolean {
  const hasStt = auth.apiKeyGroqValid || auth.apiKeyLocalaiValid || auth.apiKeyRunpodValid
    || auth.apiKeyReplicateValid || auth.apiKeyOpenaiValid;
  const hasLlm = auth.apiKeyGroqValid || auth.apiKeyOpenrouterValid || auth.apiKeyOllamaValid
    || auth.apiKeyOpenaiValid || auth.apiKeyLocalaiValid || auth.apiKeyRunpodValid || auth.apiKeyReplicateValid;
  const hasTts = auth.apiKeyOpenaiValid || auth.apiKeyGroqValid;
  return hasStt && hasLlm && hasTts;
}

const AiCallWrapper = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const authState = useAtomValue(stateJotaiAuthAtom);
  const [threadId, setThreadId] = useState('');

  useEffect(() => {
    if (authState.isLoggedIn === 'false') {
      navigate('/login');
    }
  }, [authState.isLoggedIn, navigate]);

  useEffect(() => {
    const id = new URLSearchParams(location.search).get('id');
    if (id) setThreadId(id);
    else navigate('/user/chat');
  }, [location.search, navigate]);

  if (!threadId) return null;

  if (!hasRequiredKeys(authState)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-4">
        <div className="max-w-md rounded-lg border border-amber-200 bg-amber-50 p-6 text-center shadow-xl">
          <h2 className="mb-4 text-xl font-bold text-amber-900">API Keys Required</h2>
          <p className="mb-4 text-amber-800">
            AI Call needs Groq or OpenAI API keys for Speech-to-Text, LLM, and TTS.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={() => navigate(`/user/chat?id=${threadId}`)}
              className="rounded bg-gray-200 px-4 py-2 font-medium text-gray-800 hover:bg-gray-300"
            >
              Go Back
            </button>
            <Link
              to="/user/setting/api-key"
              className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
            >
              Configure API Keys
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <AiCall threadId={threadId} />;
};

export default AiCallWrapper;
