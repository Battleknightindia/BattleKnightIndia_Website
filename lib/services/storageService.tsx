"use server";

import { createClient } from '@/utils/supabase/server';

async function uploadFile(image:File | null, filename: string, bucket:string):Promise<string | null>{
  if(!image){
    console.error("image are required for avatar upload.");
    return null;
  }

  const supabase = await createClient();

  try{
    const { data: uploadFile, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filename, image,{
      cacheControl: "3600",
      upsert:true,
      contentType:image.type
    })

    if (uploadError || !uploadFile) {
      console.error(`Supabase Storage upload error for ${bucket} image: ${uploadError}`);
      return null;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
    return data?.publicUrl || null;

  }catch(error){
    console.error(`Supabase Storage upload error for ${bucket} image: ${error}`);
    return null;
  }
}



export async function uploadAvatar(image: File | null, userId: string): Promise<string | null> {
  if (!userId || !image) {
    console.error("User ID and image are required for avatar upload.");
    return null;
  }
  
  const filename = `profilesImages/${userId}/${image.name}`;

  try {
    
    const publicUrl = await uploadFile(image, filename, "profiles")
    return publicUrl;

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
  const fileName = `${folder}/${uniqueId}_${file.name}`; 

  try {
    const publicUrl = await uploadFile(file, fileName, "homepage")
    return publicUrl || null;
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
  const assetTypeFolder = assetType === 'logo' ? 'logo' : 'champion_team_logo';
  const actualFileName = fileNameOverride || file.name;
  const storagePath = `${tournamentName}/${assetTypeFolder}/${actualFileName}`;

  try {
    const publicUrl = await uploadFile(file, storagePath, "tournament")
    return publicUrl;
  } catch (error) {
    console.error('An unexpected error occurred during tournament asset upload:', error);
    return null;
  }
}
