// lib/imageUpload.ts
"use server";
import { Buffer } from "buffer"; // Node.js Buffer
import { SupabaseClient } from "@supabase/supabase-js"; // Import SupabaseClient type

// --- Core Image Upload Logic ---

interface UploadOptions {
  supabaseClient: SupabaseClient; // Changed any to SupabaseClient
  bucket: string;
  pathPrefix: string; // e.g., 'profiles/', 'registrations/university/uni_name/'
  uniqueIdentifier: string; // e.g., userId, team_name
  file: File | Blob;
  allowedMimeTypes?: Record<string, string>; // Optional: Enforce specific types { 'image/jpeg': 'jpg', ... }
  upsert?: boolean;
}

/**
 * Generic function to upload a File/Blob to Supabase Storage.
 * Generates a unique filename using identifier + timestamp.
 */
async function _uploadImageFile({
  supabaseClient, // Type is now SupabaseClient via UploadOptions
  bucket,
  pathPrefix,
  uniqueIdentifier,
  file,
  allowedMimeTypes,
  upsert = true,
}: UploadOptions): Promise<string | null> {
  // Validate MIME type if restrictions are provided
  let ext = file.type.split('/')[1]; // Basic extension extraction
  if (allowedMimeTypes) {
    const allowedExt = allowedMimeTypes[file.type];
    if (!allowedExt) {
      console.error(`Upload rejected: File type ${file.type} not allowed.`);
      return null; // Indicate failure due to type restriction
    }
    ext = allowedExt; // Use the specified extension
  }

  if (!ext) {
    console.error(`Upload failed: Could not determine file extension for type ${file.type}.`);
    return null;
  }

  const timestamp = Date.now();
  // Ensure identifier is filesystem-safe (basic example, might need more robust slugify)
  const safeIdentifier = uniqueIdentifier.replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `${safeIdentifier}_${timestamp}.${ext}`;
  const filePath = `${pathPrefix}${fileName}`; // Ensure pathPrefix ends with '/'

  const { error } = await supabaseClient.storage
    .from(bucket)
    .upload(filePath, file, {
      contentType: file.type,
      upsert: upsert,
    });

  if (error) {
    console.error(`Storage upload error for ${filePath}:`, error);
    return null; // Indicate upload failure
  }

  // Get public URL
  const { data: urlData } = supabaseClient.storage.from(bucket).getPublicUrl(filePath);
  return urlData?.publicUrl || null;
}


// --- Base64 Specific Upload ---

interface Base64UploadOptions {
  supabaseClient: SupabaseClient; // Changed any to SupabaseClient
  bucket: string;
  pathPrefix: string;
  uniqueIdentifier: string;
  base64: string;
  upsert?: boolean;
}

const defaultAllowedImageTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  // Add other types as needed
};

async function _uploadImageFromBase64({
  supabaseClient, 
  bucket,
  pathPrefix,
  uniqueIdentifier,
  base64,
  upsert = true
}: Base64UploadOptions): Promise<string | null> {
  // Validate base64 format: data:<mimeType>;base64,<data>
  const parts = base64.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!parts) {
    console.error("Invalid base64 string format.");
    return null;
  }

  const mimeType = parts[1];
  const base64Data = parts[2];

  const ext = defaultAllowedImageTypes[mimeType];
  if (!ext) {
    console.error(`Upload rejected: Base64 MIME type ${mimeType} not allowed.`);
    return null;
  }

  try {
    const buffer = Buffer.from(base64Data, "base64");
    const blob = new Blob([buffer], { type: mimeType });

    // Call the generic file uploader
    return await _uploadImageFile({
      supabaseClient,
      bucket,
      pathPrefix,
      uniqueIdentifier,
      file: blob,
      allowedMimeTypes: defaultAllowedImageTypes, 
      upsert
    });
  } catch (error) {
    console.error("Error processing base64 string:", error);
    return null;
  }
}


export async function uploadAvatarFromBase64(
  supabaseClient: SupabaseClient, 
  base64: string,
  userId: string
): Promise<string | null> {
  if (!userId) {
    console.error("User ID is required for avatar upload.");
    return null;
  }
  return _uploadImageFromBase64({
    supabaseClient,
    bucket: "avatars", 
    pathPrefix: "profiles/", 
    uniqueIdentifier: userId,
    base64: base64,
    upsert: true 
  });
}

export async function uploadRegistrationFile(
  supabaseClient: SupabaseClient, 
  file: File,
  category: 'university' | 'team' | 'players' | 'coach',
  identifier: string, 
  type: 'logo' | 'picture' | 'student_id'
): Promise<string | null> {
  if (!identifier || (category === 'players' && !/^([a-zA-Z0-9_-]+)\/(captain|player-\d+|substitute|coach)$/.test(identifier))) {
    console.error(`Identifier for players must be in the format teamName/role (e.g., IITB/captain, IITB/player-2, IITB/coach) for registration file upload.`);
    return null;
  }

  // Ensure identifier is safe for path segment
  const safeIdentifier = identifier.split('/').map(seg => seg.replace(/[^a-zA-Z0-9_-]/g, '_')).join('/');
  const pathPrefix = `registrations/${category}/${safeIdentifier}/${type}/`; // e.g., registrations/players/IITB/player-2/picture/

  return await _uploadImageFile({
    supabaseClient,
    bucket: "registrations", 
    pathPrefix: pathPrefix,
    uniqueIdentifier: safeIdentifier.replace('/', '_'), 
    file: file,
    upsert: false 
  });
}

export async function updateAvatarUrl(supabaseClient: SupabaseClient, avatarUrl: string): Promise<boolean> { // Changed any to SupabaseClient
  const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
  if (userError || !user) return false;

  const { error } = await supabaseClient
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('user_id', user.id);

  if (error) {
    console.error('Error updating avatar URL:', error);
    return false;
  }

  return true;
}