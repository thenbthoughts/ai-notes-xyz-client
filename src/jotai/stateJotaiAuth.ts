import { atom } from 'jotai';

type AuthState = {
    isLoggedIn: 'pending' | 'true' | 'false';

    fileStorageType: 'gridfs' | 's3';
    apiKeyGroqValid: boolean;
    apiKeyOpenrouterValid: boolean;
    apiKeyS3Valid: boolean;
    apiKeyOllamaValid: boolean;
    apiKeyQdrantValid: boolean;
    apiKeyReplicateValid: boolean;
    apiKeyRunpodValid: boolean;
    apiKeyLocalaiValid: boolean;
    smtpValid: boolean;

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
    apiKeyLocalaiValid: false,
    smtpValid: false,

    clientFrontendUrl: '',
});

const stateJotaiAuthReloadAtom = atom<number>(0);

export {
    stateJotaiAuthReloadAtom
};

export default stateJotaiAuthAtom;