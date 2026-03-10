import axiosCustom from "../../../../../config/axiosCustom";

export type ApiKeyType =
  | 'groq'
  | 'openrouter'
  | 's3'
  | 'ollama'
  | 'qdrant'
  | 'replicate'
  | 'runpod'
  | 'openai'
  | 'localai'
  | 'smtp';

/**
 * Clears an API key for the specified service
 * @param apiKeyType - The type of API key to clear
 * @returns Promise with success/error state
 */
export const clearApiKey = async (apiKeyType: ApiKeyType) => {
  try {
    const response = await axiosCustom.post(
      '/api/user/api-keys/clearUserApiKey',
      {
        apiKeyType: apiKeyType,
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      }
    );

    return {
      success: true,
      message: response.data.success || 'API Key cleared successfully!',
      data: response.data
    };
  } catch (error: any) {
    console.error(`Error clearing ${apiKeyType} API key:`, error);

    let errorStr = '';
    if (typeof error?.response?.data?.error === 'string') {
      console.log(error?.response?.data?.error);
      errorStr = error?.response?.data?.error;
    }

    return {
      success: false,
      message: `Error clearing API key. Please try again. ${errorStr}`,
      error: error
    };
  }
};