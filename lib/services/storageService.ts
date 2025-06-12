"use client";

import { createClient } from '@/utils/supabase/client';

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
