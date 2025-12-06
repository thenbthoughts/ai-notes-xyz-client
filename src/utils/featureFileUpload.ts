// Valid feature types
const VALID_FEATURE_TYPES = ['chat', 'task', 'notes', 'lifeevent', 'infovault'] as const;
type FeatureType = typeof VALID_FEATURE_TYPES[number];

// Valid sub-types
const VALID_SUB_TYPES = ['messages', 'comments'] as const;
type SubType = typeof VALID_SUB_TYPES[number];

/**
 * Uploads a file to S3 storage with structured path based on feature type
 * @param file - The file to upload (File or Blob)
 * @param featureType - Type of feature (chat, task, notes, lifeevent, infovault)
 * @param parentEntityId - Parent entity MongoDB ObjectId
 * @param subType - Sub-type (messages or comments)
 * @param apiUrl - API base URL
 * @returns Promise with uploaded file path
 */
export const uploadFeatureFile = async ({
    file,
    featureType,
    parentEntityId,
    subType,
    apiUrl,
}: {
    file: File | Blob;
    featureType: FeatureType;
    parentEntityId: string;
    subType: SubType;
    apiUrl: string;
}): Promise<string> => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('featureType', featureType);
        formData.append('parentEntityId', parentEntityId);
        formData.append('subType', subType);

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
