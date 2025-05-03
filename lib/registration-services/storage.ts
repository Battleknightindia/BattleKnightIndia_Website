import { createClient } from '@/utils/supabase/server';

export const sanitizeFileName = (name: string | null | undefined): string => {
  if (!name) return "unnamed";
  const sanitized = name.replace(/[^a-zA-Z0-9_.\-]/g, "_");
  return sanitized.replace(/^[_.\-]+|[_.\-]+$/g, "") || "unnamed";
};

export async function checkAndUploadFile(
  bucketName: string,
  file: File,
  destinationPath: string
): Promise<string | null> {
  if (!file || file.size === 0) {
    console.log(`No file provided or file is empty for path ${destinationPath}. Skipping upload.`);
    return null;
  }

  const supabase = await createClient();

  try {
    // Check for existing file
    const pathSegments = destinationPath.split('/');
    const fileName = pathSegments.pop();
    const directoryPath = pathSegments.join('/');

    const { data: listData, error: listError } = await supabase.storage
      .from(bucketName)
      .list(directoryPath, {
        search: fileName,
        limit: 1
      });

    if (listError && listError.message !== 'Not found' && listError.message !== 'The resource was not found') {
      console.warn(`Proceeding with upload despite list error for '${destinationPath}'`);
    } else if (listData && listData.length > 0 && listData[0].name === fileName) {
      const { error: removeError } = await supabase.storage
        .from(bucketName)
        .remove([destinationPath]);

      if (removeError) {
        throw new Error(`Failed to remove existing file at '${destinationPath}': ${removeError.message}`);
      }
    }

    // Upload new file
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(destinationPath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Failed to upload file '${file.name}' to path '${destinationPath}': ${uploadError.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(destinationPath);

    if (!publicUrlData) {
      throw new Error(`Failed to get public URL for '${destinationPath}' after upload.`);
    }

    return publicUrlData.publicUrl;

  } catch (error: unknown) {
    console.error(`Error processing file upload for path '${destinationPath}':`, error);
    throw error;
  }
}