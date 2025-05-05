// utils/supabase/uploadClientFile.ts
import { createClient } from './client';

/**
 * Upload a file to Supabase Storage from the browser and get the public URL.
 * @param file File to upload
 * @param userId User identifier (for unique pathing)
 * @param bucketName Supabase storage bucket name
 * @param folder Optional folder in bucket
 * @returns public URL string or null
 */
export async function uploadFileToSupabase(file: File, userId: string, bucketName: string, folder = "profile-pictures") {
  const supabase = createClient();
  const fileExt = file.name.split('.').pop();
  const filePath = `${folder}/${userId}_${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file);

  if (error) throw error;

  const { data: publicUrlData } = supabase
    .storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return publicUrlData?.publicUrl ?? null;
}
