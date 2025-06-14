"use client";

import { createClient } from '@/utils/supabase/client';

// app/admin/components/Blocks/HomepageContentManagerBlock.tsx
// Or in a separate file like src/lib/utils/uploadUtils.ts and import it

export async function runPromisesInParallel<T>(
  promises: (() => Promise<T | null>)[], // Array of functions that return a promise
  concurrencyLimit: number,
  // These callbacks are less critical for this specific modal,
  // as individual promises update their own progress state,
  // but kept for generality if more sophisticated overall progress is needed.
  onFileProgress?: (fileIndex: number, progress: number) => void,
  onFileStart?: (fileIndex: number, fileName: string) => void
): Promise<{ result: T | null; index: number }[]> {
  const results: { result: T | null; index: number }[] = Array(promises.length).fill(null);
  const inProgress: Promise<any>[] = [];
  let currentIndex = 0; // Tracks which promise function to start next

  return new Promise(resolve => {
    const enqueue = async () => {
      // If all promises have been started and all inProgress promises have finished
      if (currentIndex === promises.length && inProgress.length === 0) {
        resolve(results);
        return;
      }

      // Start new promises until the concurrency limit is met or all promises are started
      while (currentIndex < promises.length && inProgress.length < concurrencyLimit) {
        const fileUploadFn = promises[currentIndex];
        const fileIdxForCallback = currentIndex; // Capture index for callback closure

        const promise = fileUploadFn().then(res => {
          results[fileIdxForCallback] = { result: res, index: fileIdxForCallback };
          return { status: 'fulfilled', value: res, index: fileIdxForCallback };
        }).catch(err => {
          results[fileIdxForCallback] = { result: null, index: fileIdxForCallback };
          return { status: 'rejected', reason: err, index: fileIdxForCallback };
        }).finally(() => {
          // Remove the promise from the inProgress array once it settles
          const indexToRemove = inProgress.indexOf(promise);
          if (indexToRemove > -1) {
            inProgress.splice(indexToRemove, 1);
          }
          enqueue(); // Try to enqueue another as soon as one finishes
        });

        inProgress.push(promise);
        currentIndex++;
      }
    };

    enqueue(); // Start the process
  });
}

export async function uploadAvatar(image: File | null, userId: string): Promise<string | null> {
  if (!userId || !image) {
    console.error("User ID and image are required for avatar upload.");
    return null;
  }
  
  const filename = `profilesImages/${userId}/${image.name}`;
  const supabase = createClient();

  try {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("profile")
      .upload(filename, image, {
        upsert: true,
        contentType: image.type,
      });

    if (uploadError) {
      console.error(`Avatar upload error for ${filename}:`, uploadError);
      return null;
    }

    console.log(`Upload successful for ${filename}.`, uploadData);
    const { data: urlData } = supabase.storage.from("profile").getPublicUrl(filename);
    return urlData.publicUrl;
  } catch (error) {
    console.error('An unexpected error occurred during avatar upload:', error);
    return null;
  }
}



export async function uploadHomepageImage(file: File, storagePath: string): Promise<string | null> {
  if (!file || !storagePath) {
    console.error("File, bucketName, and storagePath are required for homepage image upload.");
    return null;
  }

  const supabase = createClient();

  try {
    const { error: uploadError } = await supabase.storage
      .from("home") // Use the dynamic bucketName here
      .upload(storagePath, file, { // Use the storagePath directly as the file's path
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      console.error(`Supabase Storage upload error for bucket home at path '${storagePath}':`, uploadError);
      return null;
    }

    // Get the public URL using the SAME bucketName and storagePath
    const { data: publicUrlData } = supabase.storage.from("home").getPublicUrl(storagePath);
    
    if (!publicUrlData || !publicUrlData.publicUrl) {
        console.error(`Failed to get public URL for bucket home at path '${storagePath}'.`);
        return null;
    }

    return publicUrlData.publicUrl; // This is the full public URL from Supabase
  } catch (error) {
    console.error('An unexpected error occurred during homepage image upload:', error);
    return null;
  }
}

export async function uploadTournamentAsset(
  file: File,
  tournamentName: string,
  assetType: 'logo' | 'champion_logo',
  fileNameOverride?: string
): Promise<string | null> {
  if (!file || !tournamentName || !assetType) {
    console.error("File, tournament name, and asset type are required for tournament asset upload.");
    return null;
  }

  const supabase = createClient();
  const assetTypeFolder = assetType === 'logo' ? 'logo' : 'champion_team_logo';
  const actualFileName = fileNameOverride || file.name;
  const storagePath = `${tournamentName}/${assetTypeFolder}/${actualFileName}`;

  try {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("tournaments")
      .upload(storagePath, file, {
        upsert: true,
        contentType: file.type,
        cacheControl: "3600",
      });

    if (uploadError) {
      console.error(`Tournament asset upload error for ${storagePath}:`, uploadError);
      return null;
    }

    console.log(`Upload successful for ${storagePath}.`, uploadData);
    const { data: urlData } = supabase.storage.from("tournaments").getPublicUrl(storagePath);
    return urlData.publicUrl;
  } catch (error) {
    console.error('An unexpected error occurred during tournament asset upload:', error);
    return null;
  }
}

// Ensure you have a similar correction for uploadHomepageVideo
export async function uploadHomepageVideo(file: File, storagePath: string): Promise<string | null> {
  if (!file || !storagePath) {
    console.error("File, bucketName, and storagePath are required for homepage video upload.");
    return null;
  }

  const supabase = createClient();

  try {
    const { error: uploadError } = await supabase.storage
      .from("home") // Use the dynamic bucketName here
      .upload(storagePath, file, { // Use the storagePath directly as the file's path
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      console.error(`Supabase Storage upload error for bucket home at path '${storagePath}':`, uploadError);
      return null;
    }

    // Get the public URL using the SAME bucketName and storagePath
    const { data: publicUrlData } = supabase.storage.from("home").getPublicUrl(storagePath);
    
    if (!publicUrlData || !publicUrlData.publicUrl) {
        console.error(`Failed to get public URL for bucket home at path '${storagePath}'.`);
        return null;
    }

    return publicUrlData.publicUrl; // This is the full public URL from Supabase
  } catch (error) {
    console.error('An unexpected error occurred during homepage video upload:', error);
    return null;
  }
}
