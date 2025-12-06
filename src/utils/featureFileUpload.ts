/**
 * Uploads a file to S3 storage with structured path based on feature type
 * @param file - The file to upload (File or Blob)
 * @param parentEntityId - Parent entity MongoDB ObjectId
 * @param apiUrl - API base URL
 * @returns Promise with uploaded file path
 */
export const uploadFeatureFile = async ({
    file,
    parentEntityId,
    apiUrl,
}: {
    file: File | Blob;
    parentEntityId: string;
    apiUrl: string;
}): Promise<string> => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('parentEntityId', parentEntityId);

        const response = await fetch(`${apiUrl}/api/uploads/crudS3/uploadFile`, {
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
