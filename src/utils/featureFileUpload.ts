/** Matches API `uploadFile` body.pathLayout for chat thread → OpenCode inputfiles storage. */
export const UPLOAD_PATH_LAYOUT_THREAD_OPENCODE_INPUTFILES = 'threadOpencodeInputfiles';

/**
 * Uploads a file to S3 storage with structured path based on feature type
 * @param file - The file to upload (File or Blob)
 * @param parentEntityId - Parent entity MongoDB ObjectId
 * @param apiUrl - API base URL
 * @param pathLayout - Optional; use {@link UPLOAD_PATH_LAYOUT_THREAD_OPENCODE_INPUTFILES} for chat thread uploads
 * @returns Promise with uploaded file path
 */
export const uploadFeatureFile = async ({
    file,
    parentEntityId,
    apiUrl,
    pathLayout,
}: {
    file: File | Blob;
    parentEntityId: string;
    apiUrl: string;
    pathLayout?: string;
}): Promise<string> => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('parentEntityId', parentEntityId);
        if (pathLayout) {
            formData.append('pathLayout', pathLayout);
        }

        const response = await fetch(`${apiUrl}/api/uploads/crud/uploadFile`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('File upload failed');
        }

        const data = await response.json();
        return data.fileName;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};
