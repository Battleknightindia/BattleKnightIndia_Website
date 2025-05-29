"use server";

import { createClient } from '@/utils/supabase/server';

export async function uploadAvatar(image: File | null, userId: string): Promise<string | null> {
  if (!userId || !image) {
    console.error("User ID and image are required for avatar upload.");
    return null;
  }
  
  const filename = `profilesImages/${userId}/${image.name}`;
  const supabase = await createClient();

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

export async function uploadHomepageImage(file: File, folder: string, uniqueId: string): Promise<string | null> {
  if (!file || !folder || !uniqueId) {
    console.error("File, folder, and uniqueId are required for homepage image upload.");
    return null;
  }
  const supabase = await createClient(); 
  const fileName = `${folder}/${uniqueId}_${file.name}`; 

  try {
    const { error } = await supabase.storage
      .from("home")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (error) {
      console.error("Supabase Storage upload error for homepage image:", error);
      return null;
    }

    const { data } = supabase.storage.from("home").getPublicUrl(fileName);
    return data?.publicUrl || null;
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

  const supabase = await createClient();
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
