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
export async function _uploadImageFile({
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

export async function uploadImageFile(
  supabaseClient: SupabaseClient, // Changed any to SupabaseClient 
  file: File | Blob,
  bucket: string,
  pathPrefix: string, // e.g., 'profiles/', 'registrations/university/uni_name/'
  uniqueIdentifier: string, // e.g., userId, team_name
  allowedMimeTypes?: Record<string, string>, // Optional: Enforce specific types { 'image/jpeg': 'jpg', ... }
  upsert?: boolean // Default to true for overwriting existing files
): Promise<string | null> {
  return _uploadImageFile({
    supabaseClient,
    bucket,
    pathPrefix,
    uniqueIdentifier,
    file,
    allowedMimeTypes,
    upsert
  });
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

/**
 * Handles uploading an image provided as a base64 string.
 * Decodes, validates, and calls the generic file uploader.
 */
async function _uploadImageFromBase64({
  supabaseClient, // Type is now SupabaseClient via Base64UploadOptions
  bucket,
  pathPrefix,
  uniqueIdentifier,
  base64,
  upsert = true
}: Base64UploadOptions): Promise<string | null> {
  console.log("Uploading image from base64:", { bucket, pathPrefix, uniqueIdentifier });
  // Validate base64 format: data:<mimeType>;base64,<data>
  const parts = base64.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!parts) {
    console.error("Invalid base64 string format.");
    return null;
  }
  console.log("Base64 parts:", parts); // Debugging log

  const mimeType = parts[1];
  const base64Data = parts[2];

  console.log("MIME type:", mimeType); // Debugging log

  const ext = defaultAllowedImageTypes[mimeType];
  if (!ext) {
    console.error(`Upload rejected: Base64 MIME type ${mimeType} not allowed.`);
    return null;
  }
  console.log("File extension determined:", ext); // Debugging log

  try {
    const buffer = Buffer.from(base64Data, "base64");
    const blob = new Blob([buffer], { type: mimeType });

    console.log("Blob created from base64 data:", blob); // Debugging log

    // Call the generic file uploader
    return await _uploadImageFile({
      supabaseClient,
      bucket,
      pathPrefix,
      uniqueIdentifier,
      file: blob,
      allowedMimeTypes: defaultAllowedImageTypes, // Use standard image types
      upsert
    });
  } catch (error) {
    console.error("Error processing base64 string:", error);
    return null;
  }
}


// --- Exported Functions ---

/**
 * Uploads a user avatar from a base64 string.
 * Uses the 'avatars' bucket and 'profiles/' path prefix.
 */
export async function uploadAvatarFromBase64(
  supabaseClient: SupabaseClient, // Changed any to SupabaseClient
  base64: string,
  userId: string
): Promise<string | null> {
  if (!userId) {
    console.error("User ID is required for avatar upload.");
    return null;
  }
  return _uploadImageFromBase64({
    supabaseClient,
    bucket: "avatars", // Specific bucket for avatars
    pathPrefix: "profiles/", // Specific path for avatars
    uniqueIdentifier: userId,
    base64: base64,
    upsert: true // Overwrite existing avatar for the user
  });
}

/**
 * Uploads a file related to the registration process.
 * Takes a File object directly.
 *
 * IMPORTANT: For players, pass identifier as `${teamName}/${role}` (e.g., IITB/captain, IITB/player-2, IITB/coach),
 * NOT a mutable/display name, to guarantee strict separation between teams and roles.
 *
 * @param supabaseClient - The Supabase client instance
 * @param file - The file to upload
 * @param category - 'university' | 'team' | 'players' | 'coach'
 * @param identifier - For players: `${teamName}/${role}` (e.g., IITB/captain, IITB/player-2)
 * @param type - 'logo' | 'picture' | 'student_id'
 */
export async function uploadRegistrationFile(
  supabaseClient: SupabaseClient, // Changed any to SupabaseClient
  file: File,
  category: 'university' | 'team' | 'players' | 'coach',
  identifier: string, // e.g., for players: `${teamName}/${role}`
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
    bucket: "registrations", // Dedicated bucket for registration files
    pathPrefix: pathPrefix,
    uniqueIdentifier: safeIdentifier.replace('/', '_'), // Use both team and role for filename
    file: file,
    // No specific mime type restrictions here, relies on browser provided type
    upsert: false // Generally don't upsert registration files unless intended
  });
}

// Re-export the existing updateAvatarUrl function if it should remain here
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

export async function uploadTournamentFromBase64(
  supabaseClient: SupabaseClient, // Changed any to SupabaseClient
  base64: string,
  userId: string,
  path: string
): Promise<string | null> {
  console.log("Uploading tournament image from base64:", { userId, path });
  return _uploadImageFromBase64({
    supabaseClient,
    bucket: "tournaments", // Specific bucket for avatars
    pathPrefix: path, // Specific path for avatars
    uniqueIdentifier: userId,
    base64: base64,
    upsert: true // Overwrite existing avatar for the user
  });
}