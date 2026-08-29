import { useState } from "react";
import { useSetAtom } from "jotai";
import { stateJotaiAuthReloadAtom } from "../../../../../jotai/stateJotaiAuth";
import { clearApiKey, ApiKeyType } from "./apiKeyUtils";

export const useApiKeyClear = () => {
  const [clearRequest, setClearRequest] = useState({
    loading: false,
    success: '',
    error: '',
  });

  const setAuthStateReload = useSetAtom(stateJotaiAuthReloadAtom);

  const handleClearApiKey = async (apiKeyType: ApiKeyType) => {
    setClearRequest({ loading: true, success: '', error: '' });

    const result = await clearApiKey(apiKeyType);

    if (result.success) {
      setClearRequest({
        loading: false,
        success: result.message,
        error: ''
      });
    } else {
      setClearRequest({
        loading: false,
        success: '',
        error: result.message
      });
    }

    // Trigger auth state reload to update UI
    const randomNum = Math.floor(Math.random() * 1_000_000);
    setAuthStateReload(randomNum);

    return result.success;
  };

  return {
    clearRequest,
    handleClearApiKey,
  };
};