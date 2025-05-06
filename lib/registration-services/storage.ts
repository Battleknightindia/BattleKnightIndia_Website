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
  // First check - if no file provided
  if (!file) {
    console.log(`No file provided for path ${destinationPath}. Skipping upload.`);
    return null;
  }

  // Second check - validate file instance
  if (!(file instanceof File)) {
    throw new Error('Invalid file format. Please try uploading again.');
  }

  // Third check - validate file size
  const maxSize = 200 * 1024; // 200KB in bytes
  if (file.size === 0) {
    throw new Error(`The file appears to be empty. Please select a valid file.`);
  }
  if (file.size > maxSize) {
    throw new Error(`File ${file.name} exceeds maximum size of 200KB. Please upload a smaller file.`);
  }

  const supabase = await createClient();

  try {
    // Check for existing file
    const pathSegments = destinationPath.split('/');
    const fileName = pathSegments.pop();
    const directoryPath = pathSegments.join('/');

    // List existing files in the directory
    const { data: listData, error: listError } = await supabase.storage
      .from(bucketName)
      .list(directoryPath, {
        search: fileName,
        limit: 1
      });

    if (listError && !listError.message.includes('Not found')) {
      console.error('Error checking existing file:', listError);
      throw new Error(`Failed to verify existing file: ${listError.message}`);
    }

    // Remove existing file if found
    if (listData && listData.length > 0 && listData[0].name === fileName) {
      const { error: removeError } = await supabase.storage
        .from(bucketName)
        .remove([destinationPath]);

      if (removeError) {
        console.error('Error removing existing file:', removeError);
        throw new Error('Failed to update existing file. Please try again.');
      }
    }

    // Adjust cache control for faster access
    const cacheControlValue = "public, max-age=31536000"; // 1 year caching

    // Upload new file with retry mechanism
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(destinationPath, file, {
          cacheControl: cacheControlValue,
          upsert: true,
          contentType: file.type || 'application/octet-stream',
        });

      if (!uploadError) {
        break; // Success, exit retry loop
      }

      console.error(`Retry ${retryCount + 1} failed:`, uploadError);

      if (retryCount === maxRetries - 1) {
        if (uploadError.message.includes('auth')) {
          throw new Error('Your session has expired. Please sign in again to upload files.');
        }
        if (uploadError.message.includes('quota')) {
          throw new Error('Storage quota exceeded. Please contact support.');
        }
        if (uploadError.message.includes('network')) {
          throw new Error('Network error while uploading. Please check your connection and try again.');
        }
        throw new Error('Failed to upload file after multiple attempts. Please try again.');
      }

      retryCount++;
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
    }

    // Get public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(destinationPath);

    if (!publicUrlData?.publicUrl) {
      throw new Error('Failed to get public URL for the uploaded file. Please try again.');
    }

    return publicUrlData.publicUrl;
  } catch (error: unknown) {
    console.error(`Error processing file upload for path '${destinationPath}':`, error);

    if (error instanceof Error) {
      // Preserve user-friendly error messages
      if (error.message.includes('Please')) {
        throw error;
      }
      // Wrap other errors with a user-friendly message
      throw new Error(`File upload failed: ${error.message}. Please try again.`);
    }

    // Handle unknown errors
    throw new Error('An unexpected error occurred during file upload. Please try again.');
  }
}