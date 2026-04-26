import { atom } from 'jotai';

export type AuthState = {
    isLoggedIn: 'pending' | 'true' | 'false';

    fileStorageType: 'gridfs' | 's3';
    apiKeyGroqValid: boolean;
    apiKeyOpenrouterValid: boolean;
    apiKeyS3Valid: boolean;
    apiKeyOllamaValid: boolean;
    apiKeyQdrantValid: boolean;
    apiKeyReplicateValid: boolean;
    apiKeyRunpodValid: boolean;
    apiKeyOpenaiValid: boolean;
    apiKeyLocalaiValid: boolean;
    smtpValid: boolean;
    telegramValid: boolean;
    shellEngineValid: boolean;

    clientFrontendUrl: string;
};

const stateJotaiAuthAtom = atom<AuthState>({
    isLoggedIn: 'pending',

    fileStorageType: 'gridfs',
    apiKeyGroqValid: false,
    apiKeyOpenrouterValid: false,
    apiKeyS3Valid: false,
    apiKeyOllamaValid: false,
    apiKeyQdrantValid: false,
    apiKeyReplicateValid: false,
    apiKeyRunpodValid: false,
    apiKeyOpenaiValid: false,
    apiKeyLocalaiValid: false,
    smtpValid: false,
    telegramValid: false,
    shellEngineValid: false,

    clientFrontendUrl: '',
});

const stateJotaiAuthReloadAtom = atom<number>(0);

export {
    stateJotaiAuthReloadAtom
};

export default stateJotaiAuthAtom;