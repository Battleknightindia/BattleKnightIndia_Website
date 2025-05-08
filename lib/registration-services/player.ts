// lib/registration-services/player.ts
import { createClient } from '@/utils/supabase/server';
import { checkAndUploadFile, sanitizeFileName } from './storage'; // Import checkAndUploadFile
import { type Player } from '@/types/registrationTypes'; // Assuming Player type is here or imported correctly

// Define a type that matches the structure passed into validatePlayerData from main.ts
// It includes student_id_url which can be File | null before upload
export interface PlayerValidationData {
    name: string;
    ign: string;
    game_id: string;
    server_id: string;
    role: Player['role'];
    email?: string | null;
    mobile?: string | null;
    city?: string | null;
    state?: string | null;
    device?: string | null;
    student_id_url?: File | null; // Can be File | null before upload
}

// PlayerData interface for database insertion/update (student_id_url is string | null here)
export interface PlayerData {
  team_id: string;
  university_id: string;
  game_id: string;
  server_id: string;
  ign: string;
  name: string;
  role: Player['role'];
  email?: string | null;
  mobile?: string | null;
  city?: string | null;
  state?: string | null;
  device?: string | null;
  student_id_url?: string | null; // Stores the URL (string | null) in the DB
}


// Adjust to 1-based indexing (1-7)
export const getPlayerRoleDisplayName = (index: number): string => {
  if (index === 1) return "Captain";
  if (index >= 2 && index <= 5) return `Player ${index}`; // Use index directly
  if (index === 6) return "Substitute";
  if (index === 7) return "Coach";
  return `Unknown Member ${index}`; // Use index directly
};

// Adjust to 1-based indexing (1-7)
export const getPlayerFileNameSegment = (index: number): string => {
  if (index === 1) return "captain";
  if (index >= 2 && index <= 5) return `player${index}`; // Use index directly
  if (index === 6) return "substitute";
  if (index === 7) return "coach";
  return `unknown${index}`; // Use index directly
};

// Keep as is
export async function findExistingPlayers(
  teamId: string
): Promise<{ id: string; game_id: string }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("players")
    .select("id, game_id") // Assuming game_id is used for matching
    .eq("team_id", teamId);

  if (error) {
    console.error(`Database error fetching existing players for team ${teamId}: ${error.message}`);
    throw new Error(`Database error fetching existing players: ${error.message}`);
  }

  return data || [];
}

// Modified to use Promise.allSettled and return map of successful uploads
export async function processPlayerFiles(
  files: { file: File; index: number; field: "student_id_url" }[], // index is 1-based
  universityName: string,
  teamName: string
): Promise<Record<string, string>> {
  const sanitizedUniName = sanitizeFileName(universityName);
  const sanitizedTeamName = sanitizeFileName(teamName);
  // Construct the base path for files related to this registration
  const registrationBasePath = `${sanitizedUniName}/${sanitizedTeamName}`;
  const uploadedUrlsMap: Record<string, string> = {};
  const uploadPromises: Promise<{ key: string; status: string; value?: string; reason?: any }>[] = [];

  for (const { file, index, field } of files) {
    // This check might be redundant due to filtering in main.ts, but safe
    if (!(file instanceof File)) {
        console.warn(`Skipping file processing for player index ${index}: Not a File instance.`);
        continue;
    }

    // Adjust to 1-based indexing: Skip file upload for coach (index 7)
    if (index === 7) {
        console.log(`Skipping student ID file upload for Coach (index ${index}). Student ID is optional for Coach.`);
        continue;
    }

    // Get the file segment name using the 1-based index
    const playerFileNameSegment = getPlayerFileNameSegment(index); // This now uses 1-based index
    // Construct the destination path within the storage bucket
    const playerFileDestinationPath = `${registrationBasePath}/players/${playerFileNameSegment}/${
      playerFileNameSegment + "_id" // File name pattern
    }.${file.name.split('.').pop()?.toLowerCase()}`; // Use actual file extension

    // Create an async function that attempts upload and returns a result object
    const uploadTask = async () => {
        const key = `${index}_${field}`;
        try {
            // checkAndUploadFile will throw errors for validation/upload failures
            const url = await checkAndUploadFile(
              "registrations", // Supabase Storage bucket name
              file, // The File object to upload
              playerFileDestinationPath // The path within the bucket
            );
             // If checkAndUploadFile returns a URL (string), it was successful
            if (url) {
                return { status: 'fulfilled', key, value: url };
            } else {
                // checkAndUploadFile returned null, treat as a handled failure
                console.warn(`checkAndUploadFile returned null for player index ${index}, field ${field}.`);
                return { status: 'rejected', key, reason: new Error(`Upload returned null URL`) };
            }
        } catch (error: any) {
            // Catch errors thrown by checkAndUploadFile
            console.error(`File upload task failed for player index ${index}, field ${field}:`, error);
            // Return a rejected status with the error
            return { status: 'rejected', key, reason: error };
        }
    };

    // Add the promise from the async function to the array
    uploadPromises.push(uploadTask());
  }

  // Wait for all upload promises to settle (either fulfilled or rejected)
  console.log(`Waiting for ${uploadPromises.length} player file uploads to settle...`);
  const results = await Promise.allSettled(uploadPromises);
  console.log("All player file uploads have settled.");

  // Process the results
  results.forEach(result => {
      // The result object shape is based on what the uploadTask async function returns
      if (result.status === 'fulfilled') {
          // result.value contains the object { status: 'fulfilled', key, value: url }
          const { key, value: url } = result.value as { key: string; value: string };
          uploadedUrlsMap[key] = url;
          console.log(`Processed fulfilled upload for key ${key}. URL: ${url}`);
      } else {
           // result.reason contains the error object from the catch block in uploadTask
          const { key, reason } = result.value as { key: string; reason: any };
          console.error(`Processed rejected upload for key ${key}. Reason:`, reason);
           // Note: We are not throwing here, just logging. Required file check happens later.
      }
  });

  // Return the map containing URLs for successfully uploaded files
  return uploadedUrlsMap;
}

// Keep as is
export async function updatePlayers(
  players: (PlayerData & { id: string })[] // Array of players with their DB IDs
): Promise<void> {
  const supabase = await createClient();
   // Use a transaction or batched update if possible for performance/atomicity
   // Simple loop for now:
  console.log(`Attempting to update ${players.length} player(s).`);
  for (const player of players) {
    const { id, ...updateData } = player; // Extract id, rest is update data
    // Remove undefined fields from updateData to avoid Supabase errors if strict
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const { error } = await supabase
      .from("players")
      .update(updateData) // Update fields in updateData
      .eq("id", id); // Match by player ID

    if (error) {
      console.error(`Database error updating player ${id}: ${error.message}`);
       // Re-throw database error with context
      throw new Error(`Database error updating player ${player.ign || id}: ${error.message}`);
    }
     console.log(`Successfully updated player ${id}.`);
  }
}

// Keep as is
export async function createPlayers(
  players: PlayerData[] // Array of player data to insert
): Promise<void> {
  // Skip insertion if the array is empty
  if (players.length === 0) {
      console.log("No players to create.");
      return;
  }

  const supabase = await createClient();
  console.log(`Attempting to insert ${players.length} player(s).`);
  // Insert the array of player objects
  const { error, data } = await supabase
    .from("players")
    .insert(players)
    .select(); // Select the inserted data (optional, but confirms success)

  if (error) {
    console.error(`Database error inserting players:`, error);
     // Re-throw database error
    throw new Error(`Database error inserting players: ${error.message}`);
  }
   console.log(`Successfully created ${data?.length || players.length} player(s).`);
}

// IMPORTANT: This function validates the data structure *before* database insertion/update.
// It receives PlayerValidationData which includes File | null for student_id_url.
export function validatePlayerData(
  playerData: PlayerValidationData, // Uses the type with File | null for student_id_url
  index: number, // 1-based index (1 to 7)
  isOptionalRole: boolean = false // Flag from main.ts (true for indices 6 and 7)
): void {
   // Get display name using the 1-based index
  const displayName = getPlayerRoleDisplayName(index);

   // Define fields that are generally required for core player info
  const basicRequiredFields = ['name', 'ign', 'game_id', 'server_id', 'role'] as const;
   // Define fields required for contact/location
   const contactLocationFields = ['city', 'state', 'device'] as const;

  // === Validation for Optional Roles (Substitute index 6, Coach index 7) ===
  // isOptionalRole is true if index is 6 or 7 (flag from main.ts based on 1-based index)
  if (isOptionalRole) {
    // Check if *any* relevant data (including the file) is provided for this optional player
    // Relevant fields for checking if an optional player was intended to be filled
    const relevantFieldsForOptionalCheck: (keyof PlayerValidationData)[] = [...basicRequiredFields, ...contactLocationFields, 'email', 'mobile', 'student_id_url'];

     const hasAnyRelevantData = relevantFieldsForOptionalCheck.some(field => {
         const value = playerData[field];
         if (field === 'role') return false; // Skip role in the check for 'any data' presence

         // For student_id_url, check if a File instance was provided
         if (field === 'student_id_url') return value instanceof File;

         // For string fields, check if not null, undefined, or an empty string (after trimming)
         // Also handle optional email/mobile for optional roles - treat null/undefined/empty string as no data provided
         if (field === 'email' || field === 'mobile') {
             return value !== null && value !== undefined && typeof value === 'string' && value.trim() !== '';
         }


         return value !== null && value !== undefined && (typeof value !== 'string' || value.trim() !== '');
     });

    // If no relevant data or file is provided for an optional role, skip all validation for this player.
    if (!hasAnyRelevantData) {
      console.log(`Skipping validation for optional player with no data: ${displayName} (Index ${index}).`);
      return;
    }
    // If *some* data or a file is provided, validation proceeds below based on role-specific requirements.

    // === Specific Required Fields if Optional Player Has Any Data ===
    if (index === 6) { // Substitute (Index 6) - Requires basic fields + location/device + student ID if any data provided
         const requiredSubstituteFields: (keyof PlayerValidationData)[] = [...basicRequiredFields, 'city', 'state', 'device'];
         for (const field of requiredSubstituteFields) {
            const value = playerData[field];
            if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
                 throw new Error(`${field.replace('_', ' ').toUpperCase()} is required for ${displayName} if any information is provided.`);
            }
         }
          // Substitute also requires Student ID *if* any data is provided (checked by main.ts for successful upload)
         // This validation check here is just for the *presence* of a file instance initially
         if (!(playerData.student_id_url instanceof File)) {
              throw new Error(`Student ID proof (JPG/PNG/PDF) is required for ${displayName} if any information is provided.`);
         }
         // File type/size validation for Substitute student ID happens in processPlayerFiles or checkAndUploadFile.

    } else if (index === 7) { // Coach (Index 7) - Requires name, email, mobile if any data provided
         const requiredCoachFields: (keyof PlayerValidationData)[] = ['name', 'email', 'mobile'];
         for (const field of requiredCoachFields) {
             const value = playerData[field];
             if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
                 throw new Error(`${field.replace('_', ' ').toUpperCase()} is required for ${displayName} if any information is provided.`);
             }
         }
         // Student ID is optional for Coach. No file presence check here in validatePlayerData.
         // If a file is provided, its type/size is validated in processPlayerFiles/checkAndUploadFile.
    }

     // No further validation needed for optional players once their specific requirements are met here.
     return; // Exit validation for optional players if they had some data and met role-specific requirements

  } // === End Optional Role Validation ===


  // === Validation for Required Players (Captain index 1, Players 2-5) ===
  // This block runs ONLY for indices 1, 2, 3, 4, 5.

  // Basic required fields validation for Captain and Players 2-5
  for (const field of basicRequiredFields) {
      const value = playerData[field];
       if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
          throw new Error(`${field.replace('_', ' ').toUpperCase()} is required for ${displayName}.`);
      }
  }
   // Location and Device fields are also required for main players
   for (const field of contactLocationFields) {
       const value = playerData[field];
        if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
           throw new Error(`${field.replace('_', ' ').toUpperCase()} is required for ${displayName}.`);
       }
   }


  // Email and mobile validation only for Captain (index 1)
  if (index === 1) {
      if (!playerData.email?.trim()) {
          throw new Error(`EMAIL is required for ${displayName}.`);
      }
      if (!playerData.mobile?.trim()) {
          throw new Error(`MOBILE is required for ${displayName}.`);
      }
  }

  // === Student ID Validation for Required Players ===
  // Student ID proof is required for Captain (index 1) and Players 2-5 (index 2-5).
  if (index >= 1 && index <= 5) {
      // In validatePlayerData, we only check if a File instance was *provided*.
      // The actual successful upload check happens in main.ts after processPlayerFiles.
      if (!(playerData.student_id_url instanceof File)) {
          throw new Error(`Student ID proof file (JPG/PNG/PDF) is required for ${displayName}.`);
      }
       // File type/size validation happens in checkAndUploadFile.
  }
    // Note: Student ID is optional for Substitute (index 6) and Coach (index 7), handled above.

}

