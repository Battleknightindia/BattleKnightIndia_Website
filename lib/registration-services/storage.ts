// lib/registration-services/storage.ts
import { createClient } from '@/utils/supabase/server';

export const sanitizeFileName = (name: string | null | undefined): string => {
  if (!name) return "unnamed";
  // Replace characters not allowed in typical file systems and URLs with underscore
  const sanitized = name.replace(/[^a-zA-Z0-9_.\-]/g, "_");
  // Remove leading/trailing underscores, dots, or hyphens
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
     console.error(`Invalid file instance provided for path ${destinationPath}.`);
    throw new Error('Invalid file format. Please try uploading again.');
  }

  // Third check - validate file size
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size === 0) {
      console.error(`Empty file provided for path ${destinationPath}.`);
    throw new Error(`The file appears to be empty. Please select a valid file.`);
  }
  if (file.size > maxSize) {
      console.error(`File size exceeds limit for path ${destinationPath}. File size: ${file.size}.`);
    throw new Error(`File "${file.name}" exceeds maximum size of 5MB. Please upload a smaller file.`);
  }

  const supabase = await createClient();

  try {
    // Check for existing file by listing and searching
    const pathSegments = destinationPath.split('/');
    const fileName = pathSegments.pop();
    const directoryPath = pathSegments.join('/');

    // Use list with search to find the exact file name in the directory
    // limit: 1 is an optimization as we only need to know if at least one exists
    const { data: listData, error: listError } = await supabase.storage
      .from(bucketName)
      .list(directoryPath, {
        search: fileName,
        limit: 1 // Only need to find one match
      });

    if (listError && listError.message !== 'The resource was not found') {
        // Handle actual errors other than 'Not found' which means directory or bucket doesn't exist,
        // which is fine before an upload.
        console.error(`Supabase storage list error for directory ${directoryPath}, search ${fileName}:`, listError);
        throw new Error(`Failed to verify existing file in storage: ${listError.message}`);
    }

    // listData will be an empty array if the file (or directory) does not exist.
    // listData will be an array with at least one item if the file exists.
    const fileExists = listData && listData.length > 0 && listData[0].name === fileName;


    // Remove existing file if found before uploading the new one
    if (fileExists) {
        console.log(`Existing file found at ${destinationPath}. Removing...`);
      const { error: removeError } = await supabase.storage
        .from(bucketName)
        .remove([destinationPath]);

      if (removeError) {
        console.error(`Supabase storage remove error for path ${destinationPath}:`, removeError);
        // Depending on requirements, you might make this non-fatal or retry removal
        throw new Error('Failed to remove existing file before uploading new one. Please try again.');
      }
      console.log(`Existing file removed from ${destinationPath}.`);
    }

    // Upload new file with retry mechanism
    let retryCount = 0;
    const maxRetries = 3; // Increased max retries slightly

    while (retryCount <= maxRetries) {
      console.log(`Attempting file upload to ${destinationPath}, attempt ${retryCount + 1}/${maxRetries + 1}...`);
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(destinationPath, file, {
          cacheControl: "3600", // Cache for 1 hour
          upsert: true, // Use upsert which will overwrite if somehow list/remove failed (less ideal than list/remove but adds robustness)
          contentType: file.type || 'application/octet-orient' // Use file type or default
        });

      if (!uploadError) {
          console.log(`Upload successful for ${destinationPath}.`);
        break; // Success, exit retry loop
      }

      console.error(`Upload attempt ${retryCount + 1} failed for ${destinationPath}:`, uploadError);

      // Check for specific, non-recoverable errors immediately
      if (uploadError.message.includes('auth')) {
         throw new Error('Your session has expired. Please sign in again to upload files.');
      }
      if (uploadError.message.includes('quota')) {
         throw new Error('Storage quota exceeded. Please contact support.');
      }

      // If max retries reached, throw a general error
      if (retryCount === maxRetries) {
           if (uploadError.message.includes('network')) {
             throw new Error('Network error while uploading. Please check your connection and try again.');
           }
         throw new Error('Failed to upload file after multiple attempts. Please try again.');
      }

      retryCount++;
      // Exponential backoff with jitter (add randomness)
      const backoffTime = 1000 * retryCount + Math.random() * 500;
      await new Promise(resolve => setTimeout(resolve, backoffTime));
    }

    // If the loop finishes without breaking, it means upload failed after all retries
    if (retryCount > maxRetries) {
         console.error(`Max retries reached for upload to ${destinationPath}.`);
         throw new Error('File upload failed after multiple retries. Please try again.');
    }


    // Get public URL for the uploaded file
     console.log(`Getting public URL for ${destinationPath}...`);
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(destinationPath);

    if (!publicUrlData?.publicUrl) {
         console.error(`Failed to get public URL for ${destinationPath}. publicUrlData:`, publicUrlData);
      throw new Error('Failed to get public URL for the uploaded file. Please try again.');
    }
     console.log(`Successfully retrieved public URL: ${publicUrlData.publicUrl}`);

    return publicUrlData.publicUrl;

  } catch (error: unknown) {
    console.error(`Caught exception during file processing for path '${destinationPath}':`, error);

    if (error instanceof Error) {
      // Propagate user-friendly error messages that contain "Please"
      if (error.message.includes('Please')) {
        throw error;
      }
       // Wrap other errors with a general file upload failed message
      throw new Error(`File upload failed: ${error.message}`);
    }

    // Handle truly unknown errors
    throw new Error('An unexpected error occurred during file upload.');
  }
}

