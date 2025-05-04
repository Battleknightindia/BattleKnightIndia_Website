import { createClient } from '@/utils/supabase/server';

export const sanitizeFileName = (name: string | null | undefined): string => {
  if (!name) return "unnamed";
  const sanitized = name.replace(/[^a-zA-Z0-9_.\-]/g, "_");
  return sanitized.replace(/^[_.\-]+|[_.\-]+$/g, "") || "unnamed";
};

export async function checkAndUploadFile(
  bucketName: string,
  file: File | null | undefined,
  destinationPath: string
): Promise<string | null> {
  if (!file || !(file instanceof File) || file.size === 0) {
    console.log(`No valid file provided for path ${destinationPath}. Skipping upload.`);
    return null;
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    throw new Error(`File ${file.name} exceeds maximum size of 5MB. Please upload a smaller file.`);
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File ${file.name} has unsupported type. Please upload a JPEG, PNG, or WebP image.`);
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

    if (listError) {
      if (listError.message !== 'Not found' && listError.message !== 'The resource was not found') {
        throw new Error(`Failed to check existing file: ${listError.message}`);
      }
    } else if (listData && listData.length > 0 && listData[0].name === fileName) {
      const { error: removeError } = await supabase.storage
        .from(bucketName)
        .remove([destinationPath]);

      if (removeError) {
        throw new Error(`Failed to update existing file. Please try again.`);
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
      // Provide specific error messages for common upload issues
      if (uploadError.message.includes('auth')) {
        throw new Error('Your session has expired. Please sign in again to upload files.');
      }
      if (uploadError.message.includes('quota')) {
        throw new Error('Storage quota exceeded. Please contact support.');
      }
      if (uploadError.message.includes('network')) {
        throw new Error('Network error while uploading. Please check your connection and try again.');
      }
      throw new Error(`Failed to upload file. Please try again. (${uploadError.message})`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(destinationPath);

    if (!publicUrlData?.publicUrl) {
      throw new Error('Failed to get public URL for the uploaded file. Please try again.');
    }

    return publicUrlData.publicUrl;

  } catch (error: unknown) {
    console.error(`Error processing file upload for path '${destinationPath}':`, error);
    
    // Add a more user-friendly error message if it's not already handled
    if (error instanceof Error) {
      if (!error.message.includes('Please')) {
        throw new Error(`File upload failed: ${error.message}. Please try again.`);
      }
      throw error;
    }
    throw new Error('An unexpected error occurred during file upload. Please try again.');
  }
}