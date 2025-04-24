// lib/server_action/registration.ts
"use server";

import { createClient } from "@/utils/supabase/server"; // createClient is used in handleFinalRegistration
import { type Player } from "@/types/registrationTypes"; // Ensure correct import path
import { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

// --- Define the type for inserting into the players table matching the SCHEMA ---
type PlayerInsert = {
  team_id: string;
  university_id: string;
  game_id: string;
  server_id: string;
  ign: string;
  name: string;
  role: string; // Based on schema TEXT

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
// ADD user_id here to match potential RLS policy
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

    const { data: listData, error: listError } = await supabase.storage
        .from(bucketName)
        .list(directoryPath, {
            search: fileName,
            limit: 1
        });

    if (listError && listError.message !== 'Not found') {
        console.error(`[checkAndUploadFile] Supabase Storage list error for directory '${directoryPath}':`, listError);
        console.warn(`[checkAndUploadFile] Proceeding with upload despite list error for '${destinationPath}' - might overwrite.`);
    } else if (listData && listData.length > 0 && listData[0].name === fileName) {
        console.log(`[checkAndUploadFile] Existing file found at '${destinationPath}'. Attempting to remove.`);
        const { error: removeError } = await supabase.storage
            .from(bucketName)
            .remove([destinationPath]);

        if (removeError) {
            console.error(`[checkAndUploadFile] Supabase Storage remove error for '${destinationPath}':`, removeError);
            throw new Error(`Failed to remove existing file at '${destinationPath}'. Cannot proceed with upload.`);
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
        upsert: false,
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
    return null;

  } catch (error: unknown) {
    console.error(`[checkAndUploadFile] Error processing file upload for path '${destinationPath}':`, error);
    throw error; // Re-throw for caller to handle
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
  const teamName = formData.get("team_name") as string | null;
  const referralCode = formData.get("referral_code") as string | null;

   // Sanitize names for file paths (even in update, paths might be based on current names)
  const sanitizedUniName = sanitizeFileName(universityName);
  const sanitizedTeamName = sanitizeFileName(teamName);
  const registrationBasePath = `${sanitizedUniName}/${sanitizedTeamName}`;


  // --- 1. Update University Data ---
  console.log("[handleRegistrationUpdate] Updating University Data...");
  if (!universityName) {
      console.warn("[handleRegistrationUpdate] University Name missing in update form data. Skipping university update.");
      // Decide how to handle missing name during update - skip update or error?
      // For now, skip university update if name is missing.
  } else {
    const universityLogoFile = formData.get("university_logo");
    let universityLogoUrl: string | null = null;

    if (universityLogoFile instanceof File && universityLogoFile.size > 0) {
       const fileExt = universityLogoFile.name.split(".").pop();
       const safeFileExt = fileExt || 'bin';
       const uniLogoDestinationPath = `${registrationBasePath}/university_logo.${safeFileExt}`;
       try {
            universityLogoUrl = await checkAndUploadFile(
              supabase,
              bucketName,
              universityLogoFile,
              uniLogoDestinationPath
            );
            console.log(`[handleRegistrationUpdate] University logo update/upload result: ${universityLogoUrl}`);
       } catch (uploadError: unknown) {
            console.error("[handleRegistrationUpdate] University logo update/upload failed:", uploadError);
             // Re-throw to be caught by the main try/catch
            throw uploadError;
       }
    }

    const universityUpdateData: { name: string; logo_url?: string | null } = {
      name: universityName,
    };
    if (universityLogoUrl !== null) { // Only include logo_url if a new file was processed
      universityUpdateData.logo_url = universityLogoUrl;
    }

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

      const teamUpdateData: { name: string; logo_url?: string | null; referral_code?: string | null } = {
          name: teamName,
          // user_id is likely set on insert and shouldn't change here based on RLS common practices
      };
       if (teamLogoUrl !== null) { // Only include logo_url if a new file was processed
           teamUpdateData.logo_url = teamLogoUrl;
       }
       if (referralCode !== null) { // Include referral_code if provided in form data
           teamUpdateData.referral_code = referralCode;
       }


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
  }


  // --- 3. Process Players Data, Update or Insert ---
  console.log("[handleRegistrationUpdate] Processing Players Data for Update/Insert...");

   // Fetch existing players for this team to match against form data
   const { data: existingPlayers, error: fetchPlayersError } = await supabase
        .from("players")
        .select("id, game_id") // Select necessary fields for matching
        .eq("team_id", teamId);

    if (fetchPlayersError) {
        console.error("[handleRegistrationUpdate] Supabase fetch error (existing players):", fetchPlayersError);
        throw new Error(`Database error fetching existing players: ${fetchPlayersError.message}`);
    }

    const existingPlayersMap = new Map(existingPlayers?.map(p => [p.game_id, p.id])); // Map game_id to player ID

    const playersDataForProcessing: ({
      originalIndex: number;
      existingPlayerId?: string; // Add existing player ID if found
    } & PlayerInsert)[] = [];
    const filesToUpload: {
      file: File;
      role: Player["role"];
      index: number;
      field: "picture" | "student_id";
    }[] = [];

    // First Pass: Extract data, validate required fields, and collect files
    for (let i = 0; i < 7; i++) {
        const role =
            (formData.get(`player_${i}_role`) as Player["role"] | null) || "player";
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
          (name ||
            ign ||
            game_id ||
            server_id ||
            email ||
            mobile ||
            city ||
            state ||
            device ||
            pictureFile instanceof File ||
            studentIdFile instanceof File);
        const isIncluded = isRequiredRole || isOptionalRoleWithData;


        if (isIncluded) {
            // --- Backend validation for required fields (same as insert) ---
            if (!name) throw new Error(`Validation failed: Name missing for ${displayName}.`);
            if (!ign) throw new Error(`Validation failed: IGN missing for ${displayName}.`);
            if (!game_id) throw new Error(`Validation failed: Game ID missing for ${displayName}.`);
            if (!server_id) throw new Error(`Validation failed: Server ID missing for ${displayName}.`);
            if (!role) throw new Error(`Validation failed: Role missing for ${displayName}.`); // Should not happen if form is built correctly


            if (i === 0 && (!email || !mobile)) {
                throw new Error(`Validation failed: Captain's Email and Mobile are required.`);
            }
             if (i === 6 && isOptionalRoleWithData && (!email || !mobile)) {
                throw new Error(`Validation failed: Coach's Email and Mobile are required if data is provided.`);
            }

             // --- Check if this player already exists in the fetched data ---
             const existingPlayerId = existingPlayersMap.get(game_id);
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
            playersDataForProcessing.push({
                originalIndex: i,
                existingPlayerId: existingPlayerId, // Store the found ID
                name: name,
                ign: ign,
                game_id: game_id,
                server_id: server_id,
                role: role,

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
    const playerUpdatePromises: Promise<unknown>[] = []; // Keeping any here for Promise.all flexibility with mixed results

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

            // FIX: Wrap the supabase call in an async IIFE to ensure it returns a full Promise
            const updatePromise = (async () => {
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
        const { data: newPlayersData, error: playersInsertError } = await supabase
            .from("players")
            .insert(playersToInsert);

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
     let universityId: string | null = null;
     let teamId: string | null = null;

    const universityName = formData.get("university_name") as string | null;
    const teamName = formData.get("team_name") as string | null;
    const referralCode = formData.get("referral_code") as string | null; // Extract referral_code

    const sanitizedUniName = sanitizeFileName(universityName);
    const sanitizedTeamName = sanitizeFileName(teamName);
    const registrationBasePath = `${sanitizedUniName}/${sanitizedTeamName}`;


    try {
        // --- 1. Process University Data and Insert ---
        console.log("[registerNewTeam] Processing University Data...");

        if (!universityName) {
            // This check should ideally happen before calling this function, but added for safety
             throw new Error("Final validation failed: University Name is missing.");
        }
        const universityLogoFile = formData.get("university_logo");
        let universityLogoUrl: string | null = null;
        if (universityLogoFile instanceof File && universityLogoFile.size > 0) {
            const fileExt = universityLogoFile.name.split(".").pop();
            const safeFileExt = fileExt || 'bin';
            const uniLogoDestinationPath = `${registrationBasePath}/university_logo.${safeFileExt}`;
            try {
                console.log(`[registerNewTeam] Attempting university logo upload for: ${universityLogoFile.name}`);
                 // Use the new checkAndUploadFile helper
                universityLogoUrl = await checkAndUploadFile(
                    supabase,
                    bucketName,
                    universityLogoFile,
                    uniLogoDestinationPath
                );
                console.log(`[registerNewTeam] University logo upload result: ${universityLogoUrl}`);
            } catch (uploadError: unknown) {
                console.error("[registerNewTeam] University logo upload failed:", uploadError);
                 // Re-throw the error
                throw uploadError;
            }
        }

        const universityEntry = {
            name: universityName,
            logo_url: universityLogoUrl,
        };
        console.log("[registerNewTeam] Inserting University:", universityEntry);
        const { data: uniData, error: uniInsertError } = await supabase
            .from("universities")
            .insert(universityEntry)
            .select("id");

        if (uniInsertError) {
            console.error("[registerNewTeam] Supabase insert error (universities):", uniInsertError);
             // Re-throw the error
            throw new Error(`Database error inserting university: ${uniInsertError.message}`);
        }
        if (!uniData || uniData.length === 0 || !uniData[0].id) {
            console.error("[registerNewTeam] University insert successful but returned no ID.");
             // Re-throw the error
            throw new Error("University saved but could not retrieve ID.");
        }
        universityId = uniData[0].id;
        console.log("[registerNewTeam] University Inserted. ID:", universityId);

        // --- 2. Process Team Data and Insert ---
        console.log("[registerNewTeam] Processing Team Data...");

        if (!teamName) {
             // This check should ideally happen before calling this function, but added for safety
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
                 // Use the new checkAndUploadFile helper
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

        const teamEntry: TeamInsertWithUser = {
            name: teamName,
            logo_url: teamLogoUrl,
            university_id: universityId,
            user_id: authenticatedUserId,
            referral_code: referralCode,
        };

        console.log("[registerNewTeam] Inserting Team:", teamEntry);
        const { data: teamData, error: teamInsertError } = await supabase
            .from("teams")
            .insert(teamEntry)
            .select("id");

        if (teamInsertError) {
            console.error("[registerNewTeam] Supabase insert error (teams):", teamInsertError);
             // Re-throw the error
            throw new Error(`Database error inserting team: ${teamInsertError.message}`);
        }
        if (!teamData || teamData.length === 0 || !teamData[0].id) {
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

        const playersDataForProcessing: ({
            originalIndex: number;
        } & PlayerInsert)[] = [];
        const filesToUpload: {
            file: File;
            role: Player["role"];
            index: number;
            field: "picture" | "student_id";
        }[] = [];

        const gameIdsToCheck: string[] = [];

        // First Pass: Extract player data
        for (let i = 0; i < 7; i++) {
            const role =
                (formData.get(`player_${i}_role`) as Player["role"] | null) || "player";
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
                (name ||
                    ign ||
                    game_id ||
                    server_id ||
                    email ||
                    mobile ||
                    city ||
                    state ||
                    device ||
                    pictureFile instanceof File ||
                    studentIdFile instanceof File);
            const isIncluded = isRequiredRole || isOptionalRoleWithData;

            if (isIncluded) {
                // --- Backend validation for required fields ---
                 if (!name) throw new Error(`Validation failed: Name missing for ${displayName}.`);
                 if (!ign) throw new Error(`Validation failed: IGN missing for ${displayName}.`);
                 if (!game_id) throw new Error(`Validation failed: Game ID missing for ${displayName}.`);
                 if (!server_id) throw new Error(`Validation failed: Server ID missing for ${displayName}.`);
                 if (!role) throw new Error(`Validation failed: Role missing for ${displayName}.`);

                if (i === 0 && (!email || !mobile)) {
                    throw new Error(`Validation failed: Captain's Email and Mobile are required.`);
                }
                if (i === 6 && isOptionalRoleWithData && (!email || !mobile)) {
                    throw new Error(`Validation failed: Coach's Email and Mobile are required if data is provided.`);
                }

                // --- Collect game_id for profile existence check ---
                gameIdsToCheck.push(game_id);

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
                    name: name,
                    ign: ign,
                    game_id: game_id,
                    server_id: server_id,
                    role: role,

                    email: email,
                    mobile: mobile,
                    city: city,
                    state: state,
                    device: device,
                    picture_url: null,
                    student_id_url: null,
                } as { originalIndex: number } & PlayerInsert);
            }
        }

        // --- Second Pass: Validate profile existence for collected game_ids ---
        console.log(`[registerNewTeam] Checking profile existence for Game IDs: ${gameIdsToCheck.join(', ')}`);
        const { data: profileCheckData, error: profileCheckError } = await supabase
            .from("profiles")
            .select("game_id")
            .in("game_id", gameIdsToCheck);

        if (profileCheckError) {
            console.error("[registerNewTeam] Supabase profile check error:", profileCheckError);
             // Re-throw the error
            throw new Error("Database error checking profiles.");
        }

        const foundGameIds = new Set(profileCheckData?.map((p) => p.game_id));
        const missingGameIds = gameIdsToCheck.filter((id) => !foundGameIds.has(id));

        if (missingGameIds.length > 0) {
             // Re-throw the error
            throw new Error(
                `Some players have not created their profiles yet. Missing Game IDs: ${missingGameIds.join(', ')}.`
            );
        }
         console.log("[registerNewTeam] All required player profiles found.");


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

             // Use the new checkAndUploadFile helper
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
                  // Re-throw the specific error or throw a new one
                 throw new Error(`Upload failed for ${file.name}: ${individualUploadError instanceof Error ? individualUploadError.message : "Unknown upload error"}`);
            }
        });

        try {
            console.log(
                "[registerNewTeam] Waiting for all upload promises to resolve..."
            );
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
             // Re-throw the error
            throw new Error(`Failed to upload one or more player files: ${errorMessage}`);
        }

        // --- Build finalPlayersToInsert with URLs ---
        const finalPlayersToInsertWithUrls: PlayerInsert[] = [];

        playersDataForProcessing.forEach((playerData) => {
            const originalIndex = playerData.originalIndex;

            const pictureUrl = uploadedUrlsMap[`${originalIndex}_picture`] || null;
            const studentIdUrl =
                uploadedUrlsMap[`${originalIndex}_student_id`] || null;

            finalPlayersToInsertWithUrls.push({
                team_id: teamId as string,
                university_id: universityId as string,

                name: playerData.name,
                ign: playerData.ign,
                game_id: playerData.game_id,
                server_id: playerData.server_id,
                role: playerData.role as string,

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
            const { data: playersData, error: playersInsertError } = await supabase
                .from("players")
                .insert(finalPlayersToInsertWithUrls);

            if (playersInsertError) {
                console.error("[registerNewTeam] Supabase insert error (players):", playersInsertError);
                 // Re-throw the error
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

        // Decide if you want to clean up partially inserted data on failure
        // This can be complex and might require transactions or careful error handling.
        // For now, we just return the error.

        throw new Error(`New registration failed: ${errorMessage}`); // Re-throw so the main handler catches it
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


   if (!universityName) {
        console.error("[handleFinalRegistration] University Name missing in form data.");
        return { success: false, error: "University Name is required." };
   }
   if (!teamName) {
        console.error("[handleFinalRegistration] Team Name missing in form data.");
        return { success: false, error: "Team Name is required." };
   }


  // --- Check if Registration Already Exists ---
  console.log(`[handleFinalRegistration] Checking for existing registration: University='${universityName}', Team='${teamName}'`);
  try {
       // Find the university first
      const { data: existingUni, error: fetchUniError } = await supabase
          .from("universities")
          .select("id")
          .eq("name", universityName)
          .single(); // Use single() if university names are unique

      if (fetchUniError && fetchUniError.code !== 'PGRST116') { // PGRST116 means no rows found
           console.error("[handleFinalRegistration] Supabase fetch error (universities):", fetchUniError);
           throw new Error(`Database error checking for existing university: ${fetchUniError.message}`);
      }

      const existingUniversityId: string | null = existingUni?.id || null;
      let existingTeamId: string | null = null;


      if (existingUniversityId) {
          console.log(`[handleFinalRegistration] Found existing university ID: ${existingUniversityId}`);
           // If university found, check for the team within that university
           const { data: existingTeam, error: fetchTeamError } = await supabase
               .from("teams")
               .select("id")
               .eq("name", teamName)
               .eq("university_id", existingUniversityId)
               .eq("user_id", authenticatedUserId) // Check ownership
               .single(); // Use single() if team names are unique within a university per user

           if (fetchTeamError && fetchTeamError.code !== 'PGRST116') { // PGRST116 means no rows found
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