// lib/server_action/registration.ts
"use server";

import { createClient } from "@/utils/supabase/server"; // createClient is used in handleFinalRegistration
import { type Player } from "@/types/registrationTypes"; // Ensure correct import path
import type { SupabaseClient, PostgrestSingleResponse } from '@supabase/supabase-js';
import { redirect } from "next/navigation";

// --- Define the type for inserting into the players table matching the SCHEMA ---
// Ensure this type accurately reflects your 'players' table schema
type PlayerInsert = {
  team_id: string;
  university_id: string;
  game_id: string;
  server_id: string;
  ign: string;
  name: string;
  role: 'captain' | 'player' | 'substitute' | 'coach'; // Updated to match Player interface

  email?: string | null;
  mobile?: string | null;
  city?: string | null;
  state?: string | null;
  device?: string | null;
  picture_url?: string | null;
  student_id_url?: string | null;
};
// --- End PlayerInsert Type ---

// --- Define a type for inserting into the teams table matching your SCHEMA ---
// Ensure this type accurately reflects your 'teams' table schema
type TeamInsertWithUser = {
  name: string;
  logo_url?: string | null;
  university_id?: string | null;
  user_id?: string | null; // Add user_id field
  referral_code?: string | null; // Added referral_code field to the type
};
// --- End TeamInsert Type ---

// --- Helper to get player role display name for error messages ---
const getPlayerRoleDisplayName = (index: number): string => {
  if (index === 0) return "Captain";
  if (index >= 1 && index <= 4) return `Player ${index + 1}`;
  if (index === 5) return "Substitute";
  if (index === 6) return "Coach";
  return `Unknown Member ${index + 1}`;
};
// --- End Helper ---

// --- Helper to sanitize names for use in file paths ---
const sanitizeFileName = (name: string | null | undefined): string => {
  if (!name) return "unnamed";
  // Replace characters not suitable for file/folder names with underscores
  const sanitized = name.replace(/[^a-zA-Z0-9_.\-]/g, "_"); // Allow hyphen
  // Trim leading/trailing underscores or dots/hyphens
  return (
    sanitized.replace(/^[_.\-]+|[_.\-]+$/g, "") || "unnamed"
  );
};
// --- End Helper ---

// --- Helper to get player folder name/file prefix from index ---
const getPlayerFileNameSegment = (index: number): string => {
  if (index === 0) return "captain";
  if (index >= 1 && index <= 4) return `player${index + 1}`; // player2, player3, player4, player5
  if (index === 5) return "substitute";
  if (index === 6) return "coach";
  return `unknown${index}`; // Fallback
};
// --- End Helper ---

// --- Helper to upload a file to Supabase Storage with a check and potential removal of existing file ---
async function checkAndUploadFile(
  supabase: SupabaseClient,
  bucketName: string,
  file: File,
  destinationPath: string // This is the FULL exact path, e.g., 'uni/team/players/captain/captain_pic.jpg'
): Promise<string | null> {
  console.log(
    `[checkAndUploadFile] Processing file: ${file?.name} for path: '${destinationPath}' in bucket '${bucketName}'`
  );
  if (!file || file.size === 0) {
    console.log(
      `[checkAndUploadFile] No file provided or file is empty for path ${destinationPath}. Skipping upload.`
    );
    return null;
  }
  if (!destinationPath) {
    console.warn(
      `[checkAndUploadFile] Upload called with no destination path for file ${file.name}. Cannot upload.`
    );
    return null;
  }

  try {
    // Check if a file already exists at the destination path
    const pathSegments = destinationPath.split('/');
    const fileName = pathSegments.pop();
    const directoryPath = pathSegments.join('/');

    console.log(`[checkAndUploadFile] Checking for existing file: '${fileName}' in directory '${directoryPath}'`);

    // Supabase Storage list returns an array of objects with 'name' property
    const { data: listData, error: listError } = await supabase.storage
        .from(bucketName)
        .list(directoryPath, {
            search: fileName,
            limit: 1
        });

    // Check for specific Supabase Storage errors vs file not found
    if (listError && listError.message !== 'Not found' && listError.message !== 'The resource was not found') {
        console.error(`[checkAndUploadFile] Supabase Storage list error for directory '${directoryPath}':`, listError);
        // Decide if this error should stop the process or just warn
        // For now, we'll warn and proceed, assuming list errors might be transient
        console.warn(`[checkAndUploadFile] Proceeding with upload despite list error for '${destinationPath}' - might overwrite.`);
    } else if (listData && listData.length > 0 && listData[0].name === fileName) {
        console.log(`[checkAndUploadFile] Existing file found at '${destinationPath}'. Attempting to remove.`);
        const { error: removeError } = await supabase.storage
            .from(bucketName)
            .remove([destinationPath]);

        if (removeError) {
            console.error(`[checkAndUploadFile] Supabase Storage remove error for '${destinationPath}':`, removeError);
            // Decide if failing to remove an old file should stop the new upload
            // For now, we'll fail if removal fails to prevent potential issues
            throw new Error(`Failed to remove existing file at '${destinationPath}'. Cannot proceed with upload: ${removeError.message}`);
        }
        console.log(`[checkAndUploadFile] Existing file removed successfully: '${destinationPath}'`);
    } else {
        console.log(`[checkAndUploadFile] No existing file found at '${destinationPath}'. Proceeding with upload.`);
    }

    // Proceed with the upload
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(destinationPath, file, {
        cacheControl: "3600",
        upsert: false, // Ensure upsert is false if you removed the old file
      });

    if (uploadError) {
      console.error(
        `[checkAndUploadFile] Supabase Storage upload FAILED for path '${destinationPath}':`,
        uploadError
      );
      throw new Error(
        `Failed to upload file '${file.name}' to path '${destinationPath}': ${uploadError.message}`
      );
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(destinationPath);

    if (publicUrlData) {
      console.log(
        "[checkAndUploadFile] File uploaded successfully. Public URL:",
        publicUrlData.publicUrl
      );
      return publicUrlData.publicUrl;
    }

    console.error(
      "[checkAndUploadFile] Failed to get public URL after successful upload:",
      destinationPath
    );
    // Decide how to handle failure to get public URL after successful upload
    // Returning null might be acceptable if the URL can be constructed later,
    // but throwing an error ensures the caller knows something went wrong.
    throw new Error(`Failed to get public URL for '${destinationPath}' after upload.`);

  } catch (error: unknown) {
    console.error(`[checkAndUploadFile] Error processing file upload for path '${destinationPath}':`, error);
    // Re-throw the caught error to be handled by the caller
    throw error;
  }
}
// --- End File Upload Helper ---

// --- Handle Registration Update Logic ---
async function handleRegistrationUpdate( // handleRegistrationUpdate is used in handleFinalRegistration
  supabase: SupabaseClient,
  formData: FormData,
  universityId: string,
  teamId: string,
  authenticatedUserId: string // authenticatedUserId is now used below
) {
  console.log(`[handleRegistrationUpdate] Starting update process for University ID: ${universityId}, Team ID: ${teamId}`);
  const bucketName = "registrations";

  const universityName = formData.get("university_name") as string | null;
  const universityState = formData.get("university_state") as string | null;
  const universityCity = formData.get("university_city") as string | null;
  const teamName = formData.get("team_name") as string | null;
  const referralCode = formData.get("referral_code") as string | null;

   // Sanitize names for file paths (even in update, paths might be based on current names)
  const sanitizedUniName = sanitizeFileName(universityName);
  const sanitizedTeamName = sanitizeFileName(teamName);
  const registrationBasePath = `${sanitizedUniName}/${sanitizedTeamName}`;


  // --- 1. Update University Data ---
  console.log("[handleRegistrationUpdate] Updating University Data...");
  // In the update path, we already have the universityId.
  // We should only update university details if the form provides new data for them.
  // We should NOT change the university_id of the team/players here, as that would
  // effectively move the team to a different university entry.
  // If the user submitted a *different* university name in the update form,
  // the main handler should ideally prevent this or handle it as a team transfer,
  // which is a more complex scenario not covered by a simple update.
  // Assuming here that the update form data for university is only used to
  // potentially update the *existing* university record linked by universityId.

  const universityUpdateData: { name?: string; logo_url?: string | null; state?: string; city?: string } = {};

  if (universityName !== null) {
      universityUpdateData.name = universityName;
  }
  if (universityState !== null) {
      universityUpdateData.state = universityState;
  }
  if (universityCity !== null) {
      universityUpdateData.city = universityCity;
  }

  const universityLogoFile = formData.get("university_logo");
  let universityLogoUrl: string | null = null;

  if (universityLogoFile instanceof File && universityLogoFile.size > 0) {
      const fileExt = universityLogoFile.name.split(".").pop();
      const safeFileExt = fileExt || 'bin';
      // Decide on the pathing strategy for updating logos of existing universities.
      // Using the sanitized name from the form might not match the original path.
      // A safer approach might be to fetch the existing university name or use a fixed structure.
      // For simplicity, using the submitted sanitized name for pathing, but be aware
      // this might lead to multiple logo files for the same university if the name is
      // entered differently over time or if the original upload used a different path.
      const uniLogoDestinationPath = `${sanitizedUniName}/university_logo.${safeFileExt}`;
      try {
          universityLogoUrl = await checkAndUploadFile(
            supabase,
            bucketName,
            universityLogoFile,
            uniLogoDestinationPath
          );
          console.log(`[handleRegistrationUpdate] University logo update/upload result: ${universityLogoUrl}`);
          if (universityLogoUrl !== null) {
              universityUpdateData.logo_url = universityLogoUrl;
          }
      } catch (uploadError: unknown) {
          console.error("[handleRegistrationUpdate] University logo update/upload failed:", uploadError);
           // Re-throw to be caught by the main try/catch
          throw uploadError;
      }
  }

  // Only perform update if there's data to update
  if (Object.keys(universityUpdateData).length > 0) {
      console.log("[handleRegistrationUpdate] Updating University:", universityUpdateData, "for ID:", universityId);
      const { error: uniUpdateError } = await supabase
        .from("universities")
        .update(universityUpdateData)
        .eq("id", universityId); // Update based on the existing ID

      if (uniUpdateError) {
        console.error("[handleRegistrationUpdate] Supabase update error (universities):", uniUpdateError);
         // Re-throw to be caught by the main try/catch
        throw new Error(`Database error updating university: ${uniUpdateError.message}`);
      }
      console.log("[handleRegistrationUpdate] University Updated.");
  } else {
      console.log("[handleRegistrationUpdate] No university data provided in form for update. Skipping university update.");
  }


  // --- 2. Update Team Data ---
   console.log("[handleRegistrationUpdate] Updating Team Data...");
  if (!teamName) {
      console.warn("[handleRegistrationUpdate] Team Name missing in update form data. Skipping team update.");
      // Decide how to handle missing name during update - skip update or error?
      // For now, skip team update if name is missing.
  } else {
      const teamLogoFile = formData.get("team_logo");
      let teamLogoUrl: string | null = null;

      if (teamLogoFile instanceof File && teamLogoFile.size > 0) {
         const fileExt = teamLogoFile.name.split(".").pop();
         const safeFileExt = fileExt || 'bin';
         const teamLogoDestinationPath = `${registrationBasePath}/team_logo.${safeFileExt}`;
         try {
              teamLogoUrl = await checkAndUploadFile(
                supabase,
                bucketName,
                teamLogoFile,
                teamLogoDestinationPath
              );
               console.log(`[handleRegistrationUpdate] Team logo update/upload result: ${teamLogoUrl}`);
         } catch (uploadError: unknown) {
              console.error("[handleRegistrationUpdate] Team logo update/upload failed:", uploadError);
               // Re-throw to be caught by the main try/catch
              throw uploadError;
         }
      }

      const teamUpdateData: { name?: string; logo_url?: string | null; referral_code?: string | null } = {};
      if (teamName !== null) {
          teamUpdateData.name = teamName;
      }
       if (teamLogoUrl !== null) { // Only include logo_url if a new file was processed
            teamUpdateData.logo_url = teamLogoUrl;
       }
       if (referralCode !== null) { // Include referral_code if provided in form data
            teamUpdateData.referral_code = referralCode;
       }

       if (Object.keys(teamUpdateData).length > 0) {
            console.log("[handleRegistrationUpdate] Updating Team:", teamUpdateData, "for ID:", teamId);
            const { error: teamUpdateError } = await supabase
                .from("teams")
                .update(teamUpdateData)
                .eq("id", teamId) // Update based on the existing ID
                .eq("user_id", authenticatedUserId); // <-- Used authenticatedUserId here

            if (teamUpdateError) {
                console.error("[handleRegistrationUpdate] Supabase update error (teams):", teamUpdateError);
                 // Re-throw to be caught by the main try/catch
                throw new Error(`Database error updating team: ${teamUpdateError.message}`);
            }
             console.log("[handleRegistrationUpdate] Team Updated.");
       } else {
           console.log("[handleRegistrationUpdate] No team data provided in form for update. Skipping team update.");
       }
  }


  // --- 3. Process Players Data, Update or Insert ---
  console.log("[handleRegistrationUpdate] Processing Players Data for Update/Insert...");

   // Fetch existing players for this team to match against form data
   // Specify the expected return type for better type safety
   const { data: existingPlayers, error: fetchPlayersError }: PostgrestSingleResponse<{ id: string; game_id: string }[] | null> = await supabase
        .from("players")
        .select("id, game_id") // Select necessary fields for matching
        .eq("team_id", teamId);

    if (fetchPlayersError) {
        console.error("[handleRegistrationUpdate] Supabase fetch error (existing players):", fetchPlayersError);
        throw new Error(`Database error fetching existing players: ${fetchPlayersError.message}`);
    }

    // Ensure existingPlayers is treated as an array, even if null
    const existingPlayersArray = existingPlayers || [];
    const existingPlayersMap = new Map(existingPlayersArray.map((p: { game_id: string; id: string }) => [p.game_id, p.id])); // Map game_id to player ID

    const playersDataForProcessing: ({
      originalIndex: number;
      existingPlayerId?: string; // Add existing player ID if found
    } & PlayerInsert)[] = [];
    const filesToUpload: {
      file: File;
      role: Player["role"]; // Use the imported Player type
      index: number;
      field: "picture" | "student_id";
    }[] = [];

    // First Pass: Extract data, validate required fields, and collect files
    for (let i = 0; i < 7; i++) {
        // Explicitly cast the role to the expected union type
        const role = formData.get(`player_${i}_role`) as Player["role"] | null;
        const name = formData.get(`player_${i}_name`) as string | null;
        const ign = formData.get(`player_${i}_ign`) as string | null;
        const game_id = formData.get(`player_${i}_game_id`) as string | null;
        const server_id = formData.get(`player_${i}_server_id`) as string | null;
        const email = formData.get(`player_${i}_email`) as string | null;
        const mobile = formData.get(`player_${i}_mobile`) as string | null;
        const city = formData.get(`player_${i}_city`) as string | null;
        const state = formData.get(`player_${i}_state`) as string | null;
        const device = formData.get(`player_${i}_device`) as string | null;

        const pictureFile = formData.get(`player_${i}_picture`);
        const studentIdFile = formData.get(`player_${i}_student_id`);

        const displayName = getPlayerRoleDisplayName(i);

        const isRequiredRole = i >= 0 && i <= 4;
        const isOptionalRoleWithData =
          (i === 5 || i === 6) &&
          (name !== null || // Check for null explicitly
            ign !== null ||
            game_id !== null ||
            server_id !== null ||
            email !== null ||
            mobile !== null ||
            city !== null ||
            state !== null ||
            device !== null ||
            pictureFile instanceof File ||
            studentIdFile instanceof File);
        const isIncluded = isRequiredRole || isOptionalRoleWithData;


        if (isIncluded) {
            // --- Backend validation for required fields (same as insert) ---
            // Ensure required fields are not null or empty strings after trimming
            if (!name || name.trim() === "") throw new Error(`Validation failed: Name missing for ${displayName}.`);
            if (!ign || ign.trim() === "") throw new Error(`Validation failed: IGN missing for ${displayName}.`);
            if (!game_id || game_id.trim() === "") throw new Error(`Validation failed: Game ID missing for ${displayName}.`);
            if (!server_id || server_id.trim() === "") throw new Error(`Validation failed: Server ID missing for ${displayName}.`);
            // Role is handled by the union type check implicitly if form provides it,
            // but an explicit check ensures it's not null if required.
            if (!role) throw new Error(`Validation failed: Role missing for ${displayName}.`);


            if (i === 0 && (!email || email.trim() === "" || !mobile || mobile.trim() === "")) {
                throw new Error(`Validation failed: Captain's Email and Mobile are required.`);
            }
             if (i === 6 && isOptionalRoleWithData && (!email || email.trim() === "" || !mobile || mobile.trim() === "")) {
                throw new Error(`Validation failed: Coach's Email and Mobile are required if data is provided.`);
            }

             // --- Check if this player already exists in the fetched data ---
             // Ensure game_id is not null before using it as a map key
             const existingPlayerId = game_id ? existingPlayersMap.get(game_id) : undefined;

             if (existingPlayerId) {
                 console.log(`[handleRegistrationUpdate] Matched form player ${displayName} (Game ID: ${game_id}) with existing player ID: ${existingPlayerId}`);
             } else {
                 console.log(`[handleRegistrationUpdate] Form player ${displayName} (Game ID: ${game_id}) not found among existing players for this team. Will insert as new.`);
                 // Note: In an update scenario, if a required player (0-4) game_id is not found among existing,
                 // this might indicate a change in the core team or an error.
                 // The current logic will *insert* them. You might want stricter checks here depending on requirements.
             }


            // Collect files to upload/update
            if (pictureFile instanceof File) {
                filesToUpload.push({ file: pictureFile, role, index: i, field: "picture" });
            }
            if (studentIdFile instanceof File) {
                filesToUpload.push({ file: studentIdFile, role, index: i, field: "student_id" });
            }

            // Store player data for update/insert
            // Ensure non-nullable fields are handled correctly (e.g., using || "")
            playersDataForProcessing.push({
                originalIndex: i,
                existingPlayerId: existingPlayerId, // Store the found ID
                name: name || "", // Ensure name is string
                ign: ign || "", // Ensure ign is string
                game_id: game_id || "", // Ensure game_id is string
                server_id: server_id || "", // Ensure server_id is string
                role: role || "player", // Ensure role is string, provide default if necessary

                email: email,
                mobile: mobile,
                city: city,
                state: state,
                device: device,
                picture_url: null, // Placeholder
                student_id_url: null, // Placeholder
             } as { originalIndex: number; existingPlayerId?: string } & PlayerInsert);
        }
    }

      // Check if at least the required players (Captain + 4 Players = 5) are included in the data collected
    if (
      playersDataForProcessing.filter(
        (p) => p.originalIndex >= 0 && p.originalIndex <= 4
      ).length < 5
    ) {
      console.error(
        `[handleRegistrationUpdate] Not enough required players data collected for update: ${playersDataForProcessing.length} entries.`
      );
        throw new Error("You must provide complete details for the Captain and 4 Players.");
    }


    // --- Perform Player File Uploads/Updates ---
    console.log(
      `[handleRegistrationUpdate] Starting player file uploads/updates. Files to process count: ${filesToUpload.length}`
    );
    const uploadedUrlsMap: Record<string, string> = {};

    const uploadPromises = filesToUpload.map(async ({ file, index, field }) => {
       const fileExt = file.name.split(".").pop();
       const safeExt = fileExt || 'bin';
       const playerFileNameSegment = getPlayerFileNameSegment(index);
       const playerFileDestinationPath = `${registrationBasePath}/players/${playerFileNameSegment}/${
         field === "picture"
            ? playerFileNameSegment + "_pic"
            : playerFileNameSegment + "_id"
        }.${safeExt}`;

       console.log(
          `[handleRegistrationUpdate] Creating file processing promise for: ${file.name} at path ${playerFileDestinationPath}`
       );

       try {
           const url = await checkAndUploadFile(
             supabase,
             bucketName,
             file,
             playerFileDestinationPath
           );
           if (url) {
               console.log(
                 `[handleRegistrationUpdate] File processing promise resolved for ${file.name}. URL: ${url}`
               );
               // Store the URL keyed by original index and field name
               uploadedUrlsMap[`${index}_${field}`] = url;
           } else {
               console.warn(
                  `[handleRegistrationUpdate] File processing promise resolved with null URL for ${file.name}.`
               );
           }
           return url; // Return the URL or null
       } catch (individualUploadError: unknown) {
             console.error(`[handleRegistrationUpdate] Individual player file processing failed for ${file.name}:`, individualUploadError);
             // Re-throw the specific error or throw a new one
             throw new Error(`File processing failed for ${file.name}: ${individualUploadError instanceof Error ? individualUploadError.message : "Unknown file error"}`);
       }
    });

    try {
      console.log(
        "[handleRegistrationUpdate] Waiting for all player file promises to resolve..."
      );
      // Use Promise.allSettled if you want to continue even if some uploads fail
      // For now, Promise.all will throw on the first rejection
      await Promise.all(uploadPromises);
      console.log(
        "[handleRegistrationUpdate] All player files processed successfully."
      );
      console.log(
        "[handleRegistrationUpdate] Processed URLs Map:",
        uploadedUrlsMap
      );
    } catch (uploadError: unknown) {
      console.error(
        "[handleRegistrationUpdate] One or more player file processes FAILED:",
        uploadError
      );
        const errorMessage = uploadError instanceof Error ? uploadError.message : "Unknown player file processing error.";
        // Re-throw to be caught by the main try/catch
        throw new Error(`Failed to process one or more player files: ${errorMessage}`);
    }

    // --- Perform Player Database Operations (Update/Insert) ---
    console.log("[handleRegistrationUpdate] Performing Player Database Operations...");

    const playersToInsert: PlayerInsert[] = [];
    // Array to hold the actual promises returned by supabase.update() calls
    // Specify return type as PostgrestSingleResponse<any> or a more specific type if possible
    const playerUpdatePromises: Promise<PostgrestSingleResponse<unknown>>[] = [];

    playersDataForProcessing.forEach((playerData) => {
        const originalIndex = playerData.originalIndex;
        const pictureUrl = uploadedUrlsMap[`${originalIndex}_picture`] || null;
        const studentIdUrl = uploadedUrlsMap[`${originalIndex}_student_id`] || null;

        const basePlayerData: Omit<PlayerInsert, 'team_id' | 'university_id' | 'picture_url' | 'student_id_url'> = {
            name: playerData.name,
            ign: playerData.ign,
            game_id: playerData.game_id,
            server_id: playerData.server_id,
            role: playerData.role,
            email: playerData.email,
            mobile: playerData.mobile,
            city: playerData.city,
            state: playerData.state,
            device: playerData.device,
        };

        if (playerData.existingPlayerId) {
            // This player exists, prepare for update
            const updateData: Partial<PlayerInsert> = { ...basePlayerData };
            // Only include URL fields if a new file was uploaded for them (check if URL is not null)
            if (pictureUrl !== null) updateData.picture_url = pictureUrl;
            if (studentIdUrl !== null) updateData.student_id_url = studentIdUrl;

            console.log(`[handleRegistrationUpdate] Preparing update for player ID ${playerData.existingPlayerId} with data:`, updateData);

            // Wrap the supabase call in an async IIFE to ensure it returns a full Promise
            const updatePromise = (async (): Promise<PostgrestSingleResponse<unknown>> => { // Specify return type
                 // Await the Supabase call that returns the PromiseLike
                 return await supabase
                     .from("players")
                     .update(updateData)
                     .eq("id", playerData.existingPlayerId);
             })(); // Immediately Invoked Async Function Expression returns a full Promise

            playerUpdatePromises.push(updatePromise);

        } else {
            // This is a new player for this team, prepare for insert
            const insertData: PlayerInsert = {
                 team_id: teamId, // Use the existing team ID
                 university_id: universityId, // Use the existing university ID
                 ...basePlayerData,
                 picture_url: pictureUrl, // Include URL whether null or not
                 student_id_url: studentIdUrl, // Include URL whether null or not
            };
            console.log(`[handleRegistrationUpdate] Preparing insert for new player with data:`, insertData);
            playersToInsert.push(insertData);
        }
    });

    // Execute update promises
    try {
        console.log(`[handleRegistrationUpdate] Executing ${playerUpdatePromises.length} player update promises...`);
        // Promise.all now receives an array of actual Promises
        // Await the results, but we don't necessarily need the data for updates here
        await Promise.all(playerUpdatePromises);
        console.log("[handleRegistrationUpdate] All player updates completed.");
    } catch (updateError: unknown) {
          console.error("[handleRegistrationUpdate] One or more player updates FAILED:", updateError);
          const errorMessage = updateError instanceof Error ? updateError.message : "Unknown player update error.";
          // Re-throw to be caught by the main try/catch
          throw new Error(`Failed to update one or more players: ${errorMessage}`);
    }


    // Perform inserts for new players if any
    if (playersToInsert.length > 0) {
        console.log(`[handleRegistrationUpdate] Inserting ${playersToInsert.length} new players...`);
        // Specify the expected return type for the insert
        const { data: newPlayersData, error: playersInsertError }: PostgrestSingleResponse<unknown[] | null> = await supabase
            .from("players")
            .insert(playersToInsert)
            .select("*"); // Select the inserted data if needed, or just 'id'

        if (playersInsertError) {
            console.error("[handleRegistrationUpdate] Supabase insert error (new players):", playersInsertError);
             // Re-throw to be caught by the main try/catch
            throw new Error(`Database error inserting new players: ${playersInsertError.message}`);
        }
        console.log("[handleRegistrationUpdate] New Players Inserted.", newPlayersData);
    } else {
          console.log("[handleRegistrationUpdate] No new players to insert.");
    }


  console.log("[handleRegistrationUpdate] Registration update process completed successfully.");
    // Redirect to a success page or confirmation page after update
    // Redirecting to the same success page for simplicity
    redirect("/register/success?status=updated");

}
// --- End Handle Registration Update Logic ---


// --- Handle New Registration Insert Logic (Refactored from original) ---
async function registerNewTeam( // registerNewTeam is used in handleFinalRegistration
    supabase: SupabaseClient,
    formData: FormData,
    authenticatedUserId: string
) {
    console.log("[registerNewTeam] Starting new registration process.");
    const bucketName = "registrations";
    let universityId: string | null = null; // Initialize universityId
    let teamId: string | null = null;

    const universityName = formData.get("university_name") as string | null;
    const universityState = formData.get("university_state") as string | null;
    const universityCity = formData.get("university_city") as string | null;
    const teamName = formData.get("team_name") as string | null;
    const referralCode = formData.get("referral_code") as string | null; // Extract referral_code

    const sanitizedUniName = sanitizeFileName(universityName);
    const sanitizedTeamName = sanitizeFileName(teamName);
    const registrationBasePath = `${sanitizedUniName}/${sanitizedTeamName}`;


    try {
        // --- 1. Process University Data: Check if exists, then insert or get ID ---
        console.log("[registerNewTeam] Processing University Data...");

        if (!universityName || universityName.trim() === "") {
            throw new Error("Final validation failed: University Name is missing.");
        }

        // --- Check if University already exists ---
        console.log(`[registerNewTeam] Checking for existing university named: "${universityName}"`);
        // Specify the expected return type for the single() query
        const { data: existingUni, error: fetchUniError }: PostgrestSingleResponse<{ id: string } | null> = await supabase
            .from("universities")
            .select("id")
            .eq("name", universityName) // Assuming 'name' is the column for university name
            .single(); // Use .single() if you expect at most one match

        // Check for specific Supabase errors vs "No rows found" (PGRST116)
        if (fetchUniError && fetchUniError.code !== 'PGRST116') {
             console.error("[registerNewTeam] Supabase fetch error (existing university):", fetchUniError);
             throw new Error(`Database error checking for existing university: ${fetchUniError.message}`);
        }

        if (existingUni) {
            // University found, use its ID
            universityId = existingUni.id;
            console.log(`[registerNewTeam] Existing University found. Using ID: ${universityId}`);

            // NOTE: If you need to update the logo, state, or city of an *existing* university
            // when a new registration comes in, you would add that UPDATE logic here.
            // For now, this implementation assumes you only reuse the ID and don't update
            // existing university details based on new registration data.
            // If updates are needed, you would upload the logo (if provided) and then
            // perform an update query using the 'universityId' before proceeding
            // to the team insertion step.

        } else {
            // University not found, proceed with insertion
            console.log("[registerNewTeam] University not found. Inserting new university.");
            const universityLogoFile = formData.get("university_logo");
            let universityLogoUrl: string | null = null;

            if (universityLogoFile instanceof File && universityLogoFile.size > 0) {
                const fileExt = universityLogoFile.name.split(".").pop();
                const safeFileExt = fileExt || 'bin';
                const uniLogoDestinationPath = `${sanitizedUniName}/university_logo.${safeFileExt}`;
                try {
                    console.log(`[registerNewTeam] Attempting university logo upload for NEW uni: ${universityLogoFile.name}`);
                    // Use the checkAndUploadFile helper
                    universityLogoUrl = await checkAndUploadFile(
                        supabase,
                        bucketName,
                        universityLogoFile,
                        uniLogoDestinationPath
                    );
                    console.log(`[registerNewTeam] University logo upload result for new uni: ${universityLogoUrl}`);
                } catch (uploadError: unknown) {
                    console.error("[registerNewTeam] University logo upload failed for new uni:", uploadError);
                    throw uploadError; // Re-throw the error
                }
            }

            const universityEntry = {
                name: universityName,
                logo_url: universityLogoUrl,
                state: universityState || "",
                city: universityCity || "",
            };
            console.log("[registerNewTeam] Inserting new University:", universityEntry);
            // Specify the expected return type for the insert with select
            const { data: uniData, error: uniInsertError }: PostgrestSingleResponse<{ id: string }[] | null> = await supabase
                .from("universities")
                .insert(universityEntry)
                .select("id"); // Select the ID of the newly inserted row

            if (uniInsertError) {
                console.error("[registerNewTeam] Supabase insert error (new universities):", uniInsertError);
                throw new Error(`Database error inserting new university: ${uniInsertError.message}`);
            }
            // Check if data is not null/undefined and has at least one element with an id
            if (!uniData || uniData.length === 0 || !uniData[0]?.id) {
                console.error("[registerNewTeam] New University insert successful but returned no ID.");
                throw new Error("New University saved but could not retrieve ID.");
            }
            universityId = uniData[0].id; // Get the ID of the newly inserted university
            console.log("[registerNewTeam] New University Inserted. ID:", universityId);
        }

        // --- Now that we have the correct universityId (either existing or new), proceed with Team insertion ---
        console.log("[registerNewTeam] Processing Team Data...");
        if (!teamName || teamName.trim() === "") {
             throw new Error("Final validation failed: Team Name is missing.");
        }
        const teamLogoFile = formData.get("team_logo");
        let teamLogoUrl: string | null = null;
        if (teamLogoFile instanceof File && teamLogoFile.size > 0) {
            const fileExt = teamLogoFile.name.split(".").pop();
            const safeFileExt = fileExt || 'bin';
            const teamLogoDestinationPath = `${registrationBasePath}/team_logo.${safeFileExt}`;
            try {
                console.log(`[registerNewTeam] Attempting team logo upload for: ${teamLogoFile.name}`);
                 // Use the checkAndUploadFile helper
                teamLogoUrl = await checkAndUploadFile(
                    supabase,
                    bucketName,
                    teamLogoFile,
                    teamLogoDestinationPath
                );
                console.log(`[registerNewTeam] Team logo upload result: ${teamLogoUrl}`);
            } catch (uploadError: unknown) {
                console.error("[registerNewTeam] Team logo upload failed:", uploadError);
                 // Re-throw the error
                throw uploadError;
            }
        }

        // Ensure universityId is not null before using it in teamEntry
        if (universityId === null) {
             // This case should ideally not be reached if the university processing above is correct,
             // but adding a check for robustness.
             throw new Error("Internal error: University ID was not determined.");
        }

        const teamEntry: TeamInsertWithUser = {
            name: teamName,
            logo_url: teamLogoUrl,
            university_id: universityId, // Use the determined universityId
            user_id: authenticatedUserId,
            referral_code: referralCode,
        };

        console.log("[registerNewTeam] Inserting Team:", teamEntry);
        // Specify the expected return type for the insert with select
        const { data: teamData, error: teamInsertError }: PostgrestSingleResponse<{ id: string }[] | null> = await supabase
            .from("teams")
            .insert(teamEntry)
            .select("id");

        if (teamInsertError) {
            console.error("[registerNewTeam] Supabase insert error (teams):", teamInsertError);
             // Re-throw the error
            throw new Error(`Database error inserting team: ${teamInsertError.message}`);
        }
        // Check if data is not null/undefined and has at least one element with an id
        if (!teamData || teamData.length === 0 || !teamData[0]?.id) {
            console.error("[registerNewTeam] Team insert successful but returned no ID.");
             // Re-throw the error
            throw new Error("Team saved but could not retrieve ID.");
        }
        teamId = teamData[0].id;
        console.log("[registerNewTeam] Team Inserted. ID:", teamId);

        // --- 3. Process Players Data, Validate Required Fields, Check Game IDs, Upload Files, and Prepare for Insert ---
        console.log(
            "[registerNewTeam] Processing Players Data, Validating, Checking Game IDs, and Collecting Files..."
        );

        // Ensure teamId is not null before proceeding with player processing
        if (teamId === null) {
             // This case should ideally not be reached
             throw new Error("Internal error: Team ID was not determined.");
        }

        const playersDataForProcessing: ({
            originalIndex: number;
        } & PlayerInsert)[] = [];
        const filesToUpload: {
            file: File;
            role: Player["role"]; // Use the imported Player type
            index: number;
            field: "picture" | "student_id";
        }[] = [];

        // First Pass: Extract player data
        for (let i = 0; i < 7; i++) {
            // Explicitly cast the role to the expected union type
            const role = formData.get(`player_${i}_role`) as Player["role"] | null;
            const name = formData.get(`player_${i}_name`) as string | null;
            const ign = formData.get(`player_${i}_ign`) as string | null;
            const game_id = formData.get(`player_${i}_game_id`) as string | null;
            const server_id = formData.get(`player_${i}_server_id`) as string | null;
            const email = formData.get(`player_${i}_email`) as string | null;
            const mobile = formData.get(`player_${i}_mobile`) as string | null;
            const city = formData.get(`player_${i}_city`) as string | null;
            const state = formData.get(`player_${i}_state`) as string | null;
            const device = formData.get(`player_${i}_device`) as string | null;

            const pictureFile = formData.get(`player_${i}_picture`);
            const studentIdFile = formData.get(`player_${i}_student_id`);

            const displayName = getPlayerRoleDisplayName(i);

            const isRequiredRole = i >= 0 && i <= 4;
            const isOptionalRoleWithData =
                (i === 5 || i === 6) &&
                (name !== null || // Check for null explicitly
                    ign !== null ||
                    game_id !== null ||
                    server_id !== null ||
                    email !== null ||
                    mobile !== null ||
                    city !== null ||
                    state !== null ||
                    device !== null ||
                    pictureFile instanceof File ||
                    studentIdFile instanceof File);
            const isIncluded = isRequiredRole || isOptionalRoleWithData;

            if (isIncluded) {
                // --- Backend validation for required fields ---
                 // Ensure required fields are not null or empty strings after trimming
                 if (!name || name.trim() === "") throw new Error(`Validation failed: Name missing for ${displayName}.`);
                 if (!ign || ign.trim() === "") throw new Error(`Validation failed: IGN missing for ${displayName}.`);
                 if (!game_id || game_id.trim() === "") throw new Error(`Validation failed: Game ID missing for ${displayName}.`);
                 if (!server_id || server_id.trim() === "") throw new Error(`Validation failed: Server ID missing for ${displayName}.`);
                 // Role is handled by the union type check implicitly if form provides it,
                 // but an explicit check ensures it's not null if required.
                 if (!role) throw new Error(`Validation failed: Role missing for ${displayName}.`);


                if (i === 0 && (!email || email.trim() === "" || !mobile || mobile.trim() === "")) {
                    throw new Error(`Validation failed: Captain's Email and Mobile are required.`);
                }
                if (i === 6 && isOptionalRoleWithData && (!email || email.trim() === "" || !mobile || mobile.trim() === "")) {
                    throw new Error(`Validation failed: Coach's Email and Mobile are required if data is provided.`);
                }

                // Collect files
                if (pictureFile instanceof File) {
                    filesToUpload.push({
                        file: pictureFile,
                        role,
                        index: i,
                        field: "picture",
                    });
                }
                if (studentIdFile instanceof File) {
                    filesToUpload.push({
                        file: studentIdFile,
                        role,
                        index: i,
                        field: "student_id",
                    });
                }

                // Store player data
                playersDataForProcessing.push({
                    originalIndex: i,
                    name: name || "", // Ensure name is string
                    ign: ign || "", // Ensure ign is string
                    game_id: game_id || "", // Ensure game_id is string
                    server_id: server_id || "", // Ensure server_id is string
                    role: role || "player", // Ensure role is string, provide default if necessary

                    email: email,
                    mobile: mobile,
                    city: city,
                    state: state,
                    device: device,
                    picture_url: null, // Placeholder
                    student_id_url: null, // Placeholder
                } as { originalIndex: number } & PlayerInsert);
            }
        }

        // Check if at least the required players (Captain + 4 Players = 5) are included
        if (
            playersDataForProcessing.filter(
                (p) => p.originalIndex >= 0 && p.originalIndex <= 4
            ).length < 5
        ) {
            console.error(
                `[registerNewTeam] Not enough required players data collected after validation: ${playersDataForProcessing.length} entries.`
            );
             // Re-throw the error
            throw new Error(
                "You must provide complete details for the Captain and 4 Players."
            );
        }

        // --- Perform Player File Uploads ---
        console.log(
            `[registerNewTeam] Starting player file uploads. Files to upload count: ${filesToUpload.length}`
        );
        const uploadedUrlsMap: Record<string, string> = {};

        const uploadPromises = filesToUpload.map(async ({ file, index, field }) => {
            const fileExt = file.name.split(".").pop();
            const safeExt = fileExt || 'bin';
            const playerFileNameSegment = getPlayerFileNameSegment(index);
            const playerFileDestinationPath = `${registrationBasePath}/players/${playerFileNameSegment}/${
                field === "picture"
                    ? playerFileNameSegment + "_pic"
                    : playerFileNameSegment + "_id"
            }.${safeExt}`;

            console.log(
                `[registerNewTeam] Creating upload promise for: ${file.name} at destination path ${playerFileDestinationPath}`
            );

             // Use the checkAndUploadFile helper
            try {
                const url = await checkAndUploadFile(
                  supabase,
                  bucketName,
                  file,
                  playerFileDestinationPath
                );
                if (url) {
                  console.log(
                    `[registerNewTeam] Upload promise resolved for ${file.name}. URL: ${url}`
                  );
                  uploadedUrlsMap[`${index}_${field}`] = url;
                } else {
                    console.warn(
                      `[registerNewTeam] Upload promise resolved with null URL for ${file.name}.`
                    );
                }
                return url; // Return the URL or null
            } catch (individualUploadError: unknown) {
                 console.error(`[registerNewTeam] Individual player file upload failed for ${file.name}:`, individualUploadError);
                 throw new Error(`Upload failed for ${file.name}: ${individualUploadError instanceof Error ? individualUploadError.message : "Unknown upload error"}`);
            }
        });

        try {
            console.log(
                "[registerNewTeam] Waiting for all upload promises to resolve..."
            );
            // Use Promise.allSettled if you want to continue even if some uploads fail
            // For now, Promise.all will throw on the first rejection
            await Promise.all(uploadPromises);
            console.log(
                "[registerNewTeam] All player files uploaded successfully."
            );
            console.log(
                "[registerNewTeam] Uploaded URLs Map:",
                uploadedUrlsMap
            );
        } catch (uploadError: unknown) {
            console.error(
                "[registerNewTeam] One or more player file uploads FAILED:",
                uploadError
            );
            const errorMessage = uploadError instanceof Error ? uploadError.message : "Unknown file upload error.";
            throw new Error(`Failed to upload one or more player files: ${errorMessage}`);
        }

        // --- Build finalPlayersToInsert with URLs ---
        const finalPlayersToInsertWithUrls: PlayerInsert[] = [];
        playersDataForProcessing.forEach((playerData) => {
            const originalIndex = playerData.originalIndex;

            const pictureUrl = uploadedUrlsMap[`${originalIndex}_picture`] || null;
            const studentIdUrl =
                uploadedUrlsMap[`${originalIndex}_student_id`] || null;

            // Ensure teamId and universityId are not null before using them
            if (teamId === null || universityId === null) {
                 // This should not happen if checks above are correct, but for safety
                 console.error("[registerNewTeam] Internal error: teamId or universityId is null during player data preparation.");
                 throw new Error("Internal error preparing player data.");
            }

            finalPlayersToInsertWithUrls.push({
                team_id: teamId, // Use the determined team ID
                university_id: universityId, // Use the determined university ID

                name: playerData.name,
                ign: playerData.ign,
                game_id: playerData.game_id,
                server_id: playerData.server_id,
                role: playerData.role,

                email: playerData.email,
                mobile: playerData.mobile,
                city: playerData.city,
                state: playerData.state,
                device: playerData.device,
                picture_url: pictureUrl,
                student_id_url: studentIdUrl,
            });
        });
        console.log(
            `[registerNewTeam] Prepared ${finalPlayersToInsertWithUrls.length} players for insertion.`
        );
        // --- Insert Players Data ---
        if (finalPlayersToInsertWithUrls.length > 0) {
            console.log("[registerNewTeam] Inserting Players...");
            // Specify the expected return type for the insert
            const { data: playersData, error: playersInsertError }: PostgrestSingleResponse<unknown[] | null> = await supabase
                .from("players")
                .insert(finalPlayersToInsertWithUrls)
                .select("*"); // Select the inserted data if needed, or just 'id'

            if (playersInsertError) {
                console.error("[registerNewTeam] Supabase insert error (players):", playersInsertError);
                throw new Error(`Database error inserting players: ${playersInsertError.message}`);
            }
            console.log("[registerNewTeam] Players Inserted.", playersData);
        } else {
            console.log("[registerNewTeam] No players to insert.");
        }

        // --- Final Success ---
        console.log("[registerNewTeam] New Registration Successful! Redirecting...");
        redirect("/register/success");

    } catch (error: unknown) {
        console.error("[registerNewTeam] Caught error:", error);
         // Check if the error is the special redirect error thrown by Next.js
         if (
            error &&
            typeof error === "object" &&
            "digest" in error &&
            typeof (error as { digest: string }).digest === "string" && // Corrected type guard
            (error as { digest: string }).digest.startsWith("NEXT_REDIRECT") // Corrected type guard
          ) {
            console.log("[registerNewTeam] Identified NEXT_REDIRECT error. Re-throwing.");
            throw error; // Re-throw the redirect error
          }

        // If it's not a redirect error, handle it as a registration failure
        console.error(
          "[registerNewTeam] Handling as a registration failure."
        );
        const errorMessage =
          error instanceof Error
            ? error.message
            : (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' ? error.message : "An unexpected server error occurred.");

        throw new Error(`New registration failed: ${errorMessage}`);
    }
}
// --- End Handle New Registration Insert Logic ---

// --- Main Server Action to Handle Final Registration (Includes Check) ---
export async function handleFinalRegistration(formData: FormData) {
  // createClient is used here
  const supabase = await createClient();
  // --- Fetch Authenticated User ---
  console.log("[handleFinalRegistration] Checking authentication...");
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (!user || userError) {
    console.error("[handleFinalRegistration] User is not authenticated.");
    // Consider throwing a specific authentication error or redirecting to login
    // For now, returning an error object as per original code structure
    return {
      success: false,
      error: "You must be logged in to register a team.",
    };
  }
  const authenticatedUserId = user.id;
  console.log(
    `[handleFinalRegistration] Authenticated user ID: ${authenticatedUserId}`
  );
  // --- End Fetch User ---

  const universityName = formData.get("university_name") as string | null;
  const teamName = formData.get("team_name") as string | null;
  // referralCode is extracted but not used in this specific function, only passed to handlers
  // const referralCode = formData.get("referral_code") as string | null;


   if (!universityName || universityName.trim() === "") {
        console.error("[handleFinalRegistration] University Name missing in form data.");
        return { success: false, error: "University Name is required." };
   }
   if (!teamName || teamName.trim() === "") {
        console.error("[handleFinalRegistration] Team Name missing in form data.");
        return { success: false, error: "Team Name is required." };
   }


  // --- Check if Registration Already Exists ---
  console.log(`[handleFinalRegistration] Checking for existing registration: University='${universityName}', Team='${teamName}'`);
  try {
       // Find the university first
       // Specify the expected return type for the single() query
      const { data: existingUni, error: fetchUniError }: PostgrestSingleResponse<{ id: string } | null> = await supabase
          .from("universities")
          .select("id")
          .eq("name", universityName)
          .single(); // Use single() if university names are unique

      // Check for specific Supabase errors vs "No rows found" (PGRST116)
      if (fetchUniError && fetchUniError.code !== 'PGRST116') {
           console.error("[handleFinalRegistration] Supabase fetch error (universities):", fetchUniError);
           throw new Error(`Database error checking for existing university: ${fetchUniError.message}`);
      }

      const existingUniversityId: string | null = existingUni?.id || null;
      let existingTeamId: string | null = null;

      if (existingUniversityId) {
          console.log(`[handleFinalRegistration] Found existing university ID: ${existingUniversityId}`);
          // If university found, check for the team within that university
          // Specify the expected return type for the single() query
           const { data: existingTeam, error: fetchTeamError }: PostgrestSingleResponse<{ id: string } | null> = await supabase
               .from("teams")
               .select("id")
               .eq("name", teamName)
               .eq("university_id", existingUniversityId)
               .eq("user_id", authenticatedUserId) // Check ownership
               .single(); // Use single() if team names are unique within a university per user

           // Check for specific Supabase errors vs "No rows found" (PGRST116)
           if (fetchTeamError && fetchTeamError.code !== 'PGRST116') {
                console.error("[handleFinalRegistration] Supabase fetch error (teams):", fetchTeamError);
                 throw new Error(`Database error checking for existing team: ${fetchTeamError.message}`);
           }

           if (existingTeam) {
               existingTeamId = existingTeam.id;
               console.log(`[handleFinalRegistration] Found existing team ID: ${existingTeamId} under university ID ${existingUniversityId}.`);
           } else {
                console.log(`[handleFinalRegistration] No existing team found with name '${teamName}' under university ID ${existingUniversityId} for this user.`);
           }
      } else {
          console.log(`[handleFinalRegistration] No existing university found with name '${universityName}'.`);
      }

      // --- Decide whether to Update or Insert ---
      if (existingUniversityId && existingTeamId) {
          console.log("[handleFinalRegistration] Existing registration found. Calling update handler.");
           // If both university and team exist, proceed with update logic
           // handleRegistrationUpdate is used here
          await handleRegistrationUpdate(
              supabase,
              formData,
              existingUniversityId,
              existingTeamId,
              authenticatedUserId // Pass authenticated user ID to update handler
          );
           // handleRegistrationUpdate will handle its own redirects/returns
          // The following return should technically not be reached if redirect() is called,
          // but it's good practice to have a return at the end of a server action pathway.
          return { success: true, message: "Registration updated successfully." };
      } else {
          console.log("[handleFinalRegistration] No existing registration found. Proceeding with insert.");
          // If no existing registration found, proceed with insert logic
           // registerNewTeam is used here
          await registerNewTeam(
              supabase,
              formData,
              authenticatedUserId // Pass authenticated user ID to insert handler
          );
          // registerNewTeam will handle its own redirects/returns
           // The following return should technically not be reached if redirect() is called,
           // but it's good practice to have a return at the end of a server action pathway.
           return { success: true, message: "New registration created successfully." };
      }

  } catch (error: unknown) {
    console.error("[handleFinalRegistration] Caught error during existence check or subsequent handling:", error);

    // Check if the error is the special redirect error thrown by Next.js
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof (error as { digest: string }).digest === "string" && // Corrected type guard
      (error as { digest: string }).digest.startsWith("NEXT_REDIRECT") // Corrected type guard
    ) {
      console.log("[handleFinalRegistration] Identified NEXT_REDIRECT error. Re-throwing.");
      throw error; // Re-throw the redirect error
    }

    // If it's not a redirect error, handle it as a registration failure
    console.error(
      "[handleFinalRegistration] Handling as a registration failure."
    );
    const errorMessage =
      error instanceof Error
        ? error.message
        : (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' ? error.message : "An unexpected server error occurred.");

    return { success: false, error: `Registration process failed: ${errorMessage}` };
  }
}
// --- End Main Server Action ---
