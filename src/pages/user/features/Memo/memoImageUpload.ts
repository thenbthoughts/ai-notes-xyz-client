import { uploadFeatureFile } from '../../../../utils/featureFileUpload';

/** Fallback entity id for composer uploads before memo id exists. */
const MEMO_FILE_UPLOAD_PARENT_ENTITY_ID = '66d0c4e1a2b3e5f7890abc12';

export async function uploadMemoNoteImage(
  file: File | Blob,
  apiUrl: string,
  parentEntityId?: string,
): Promise<string> {
  const uploadParentEntityId =
    typeof parentEntityId === 'string' && parentEntityId.trim() ? parentEntityId.trim() : MEMO_FILE_UPLOAD_PARENT_ENTITY_ID;
  return uploadFeatureFile({
    file,
    parentEntityId: uploadParentEntityId,
    apiUrl,
  });
}
