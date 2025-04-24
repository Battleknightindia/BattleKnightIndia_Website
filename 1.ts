// lib/server_action/registration.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { type Player } from "@/types/registrationTypes"; // Ensure correct import path
import { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
// Assuming you have a getUser helper in "@/utils/supabase/server"
// If not, you can use supabase.auth.getUser() directly as you did in the code provided.
// import { getUser } from "@/utils/supabase/server";

// --- Conceptual File Upload Helper (Modified for Exact Destination Path) ---
async function uploadFile(
  supabase: SupabaseClient, // Type is SupabaseClient from previous fix
  bucketName: string,
  file: File,
  destinationPath: string // This is the FULL exact path, e.g., 'uni/team/players/captain/captain_pic.jpg'
): Promise<string | null> {
  // --- Added more detailed logging ---
  console.log(
    `[uploadFile] Preparing to upload: ${file?.name} to bucket '${bucketName}' at destination path '${destinationPath}'`
  );
  if (!file) {
    console.warn(
      `[uploadFile] Upload called with no file for destination path ${destinationPath}.`
    );
    return null;
  }
  if (!destinationPath) {
    console.warn(
      `[uploadFile] Upload called with no destination path for file ${file.name}.`
    );
    return null;
  }
  // --- End Added Logging ---

  // The destinationPath already includes the desired file name and extension.
  // No need to generate unique ID or get extension here.

  // Fixed: Removed 'data' from destructuring as it's not used
  const { error } = await supabase.storage
    .from(bucketName)
    .upload(destinationPath, file, {
      cacheControl: "3600",
      upsert: false, // Prevent overwriting existing files at this exact path
    });

  if (error) {
    console.error(
      `[uploadFile] Supabase Storage upload FAILED for bucket '${bucketName}' path '${destinationPath}':`,
      error
    );
    // Log the specific Supabase Storage error code if available
    // Note: Accessing statusCode might still be flagged by strict TS/linter as 'error' is typed Error
    // If you need to inspect properties specific to SupabaseClientError, you might need a type assertion
    // or a more specific error type if Supabase provides one. For now, keep access but be aware.
    if ((error as any).statusCode) { // Added temporary any assertion for statusCode access if needed
      console.error("[uploadFile] Supabase Storage Error Details:", error);
    }
    // Re-throw the error so the caller's catch block can handle it
    // The message property exists on a standard Error
    throw new Error(
      `Failed to upload file '${file.name}' to path '${destinationPath}': ${error.message}`
    );
  }

  // Get the public URL for the uploaded file
  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(destinationPath);

  if (publicUrlData) {
    console.log(
      "[uploadFile] File uploaded successfully. Public URL:",
      publicUrlData.publicUrl
    );
    return publicUrlData.publicUrl;
  }

  console.error(
    "[uploadFile] Failed to get public URL after successful upload:",
    destinationPath
  );
  return null;
}
// --- End Conceptual File Upload Helper ---

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

// Helper to get player role display name for error messages
const getPlayerRoleDisplayName = (index: number): string => {
  if (index === 0) return "Captain";
  if (index >= 1 && index <= 4) return `Player ${index + 1}`;
  if (index === 5) return "Substitute";
  if (index === 6) return "Coach";
  return `Unknown Member ${index + 1}`;
};

// Helper to sanitize names for use in file paths
const sanitizeFileName = (name: string | null | undefined): string => {
  if (!name) return "unnamed";
  // Replace characters not suitable for file/folder names with underscores
  const sanitized = name.replace(/[^a-zA-Z0-9_.-]/g, "_");
  // Trim leading/trailing underscores or dots
  return (
    sanitized.replace(/^_+|_+$/g, "").replace(/^\.+|\.+$/g, "") || "unnamed"
  );
};

// --- Helper to get player folder name/file prefix from index ---
const getPlayerFileNameSegment = (index: number): string => {
  if (index === 0) return "captain";
  if (index >= 1 && index <= 4) return `player${index + 1}`; // player2, player3, player4, player5
  if (index === 5) return "substitute";
  if (index === 6) return "coach";
  return `unknown${index}`; // Fallback
};
// --- End Helper ---

// --- Server Action to Handle Final Registration ---
export async function handleFinalRegistration(formData: FormData) {
  const supabase = await createClient();
  let universityId: string | null = null;
  let teamId: string | null = null;

  // --- Fetch Authenticated User ---
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(); // Using supabase.auth.getUser() as in your provided code
  if (!user || userError) {
    // If no authenticated user, return an unauthorized error
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

  // Get names early for use in file paths
  const universityName = formData.get("university_name") as string | null;
  const teamName = formData.get("team_name") as string | null;
  const referralCode = formData.get("referral_code") as string | null; // Extract referral_code here

  // Sanitize names for file paths
  const sanitizedUniName = sanitizeFileName(universityName);
  const sanitizedTeamName = sanitizeFileName(teamName);

  // Define the base path for all uploads related to this registration (up to team level)
  const registrationBasePath = `${sanitizedUniName}/${sanitizedTeamName}`;
  const bucketName = "registrations"; // Define the bucket name

  // Changed catch error type from 'any' to 'unknown' for broader handling
  try {
    // --- 1. Process University Data and Insert ---
    console.log("Processing University Data...");

    if (!universityName) {
      return {
        success: false,
        error: "Final validation failed: University Name is missing.",
      };
    }
    const universityLogoFile = formData.get("university_logo");
    let universityLogoUrl: string | null = null;
    if (universityLogoFile instanceof File && universityLogoFile.size > 0) {
      // Get the file extension
      const fileExt = universityLogoFile.name.split(".").pop();
       // Ensure fileExt is not undefined before using it
       const safeFileExt = fileExt || 'bin'; // Use a default extension if none found
      // Construct the FULL destination path for the university logo
      const uniLogoDestinationPath = `${registrationBasePath}/university_logo.${safeFileExt}`;
      try {
        console.log(
          `Attempting university logo upload for: ${universityLogoFile.name}`
        );
        // Changed catch error type from 'any' to 'Error' as uploadFile throws Error
        universityLogoUrl = await uploadFile(
          supabase,
          bucketName, // Use the defined bucket name
          universityLogoFile,
          uniLogoDestinationPath // Pass the FULL constructed path
        );
        console.log(`University logo upload result: ${universityLogoUrl}`);
      } catch (uploadError: unknown) { // Changed any to unknown
        console.error("University logo upload failed:", uploadError);
        return {
          success: false,
          error: uploadError instanceof Error ? uploadError.message : "Failed to upload university logo.",
        };
      }
    }

    const universityEntry = {
      name: universityName,
      logo_url: universityLogoUrl,
    };
    console.log("Inserting University:", universityEntry);
    const { data: uniData, error: uniInsertError } = await supabase
      .from("universities")
      .insert(universityEntry)
      .select("id");

    if (uniInsertError) {
      console.error("Supabase insert error (universities):", uniInsertError);
      return {
        success: false,
        error: `Database error inserting university: ${uniInsertError.message}`,
      };
    }
    if (!uniData || uniData.length === 0 || !uniData[0].id) {
      console.error("University insert successful but returned no ID.");
      return {
        success: false,
        error: "University saved but could not retrieve ID.",
      };
    }
    universityId = uniData[0].id;
    console.log("University Inserted. ID:", universityId);

    // --- 2. Process Team Data and Insert ---
    console.log("Processing Team Data...");

    if (!teamName) {
      return {
        success: false,
        error: "Final validation failed: Team Name is missing.",
      };
    }
    const teamLogoFile = formData.get("team_logo");
    let teamLogoUrl: string | null = null;
    if (teamLogoFile instanceof File && teamLogoFile.size > 0) {
      // Get the file extension
      const fileExt = teamLogoFile.name.split(".").pop();
       // Ensure fileExt is not undefined before using it
       const safeFileExt = fileExt || 'bin'; // Use a default extension if none found
      // Construct the FULL destination path for the team logo
      const teamLogoDestinationPath = `${registrationBasePath}/team_logo.${safeFileExt}`;
      try {
        console.log(`Attempting team logo upload for: ${teamLogoFile.name}`);
        // Changed catch error type from 'any' to 'Error' as uploadFile throws Error
        teamLogoUrl = await uploadFile(
          supabase,
          bucketName, // Use the defined bucket name
          teamLogoFile,
          teamLogoDestinationPath // Pass the FULL constructed path
        );
        console.log(`Team logo upload result: ${teamLogoUrl}`);
      } catch (uploadError: unknown) { // Changed any to unknown
        console.error("Team logo upload failed:", uploadError);
        return {
          success: false,
          error: uploadError instanceof Error ? uploadError.message : "Failed to upload team logo.",
        };
      }
    }

    // --- Include authenticated user ID and referral_code in the team entry ---
    const teamEntry: TeamInsertWithUser = {
      name: teamName,
      logo_url: teamLogoUrl,
      university_id: universityId,
      user_id: authenticatedUserId, // Include the user ID for RLS
      referral_code: referralCode, // Include the extracted referral_code
    };
    // --- End Include user ID and referral_code ---

    console.log("Inserting Team:", teamEntry);
    const { data: teamData, error: teamInsertError } = await supabase
      .from("teams")
      .insert(teamEntry)
      .select("id");

    if (teamInsertError) {
      console.error("Supabase insert error (teams):", teamInsertError);
      // This error is the RLS violation we are debugging
      return {
        success: false,
        error: `Database error inserting team: ${teamInsertError.message}`,
      };
    }
    if (!teamData || teamData.length === 0 || !teamData[0].id) {
      console.error("Team insert successful but returned no ID.");
      return { success: false, error: "Team saved but could not retrieve ID." };
    }
    teamId = teamData[0].id;
    console.log("Team Inserted. ID:", teamId);

    // --- 3. Process Players Data, Validate Required Fields, Check Game IDs, Upload Files, and Prepare for Insert ---
    console.log(
      "Processing Players Data, Validating, Checking Game IDs, and Collecting Files..."
    );

    // First Pass: Extract data, validate NOT NULL fields, check Game IDs, and collect files
    const playersDataForProcessing: ({
      originalIndex: number;
    } & PlayerInsert)[] = []; // Store player data
    const filesToUpload: {
      file: File;
      role: Player["role"];
      index: number;
      field: "picture" | "student_id";
    }[] = [];

    const gameIdsToCheck: string[] = []; // Collect all game_ids here for later validation

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
        if (!name)
          return {
            success: false,
            error: `Validation failed: Name missing for ${displayName}.`,
          };
        if (!ign)
          return {
            success: false,
            error: `Validation failed: IGN missing for ${displayName}.`,
          };
        if (!game_id)
          return {
            success: false,
            error: `Validation failed: Game ID missing for ${displayName}.`,
          };
        if (!server_id)
          return {
            success: false,
            error: `Validation failed: Server ID missing for ${displayName}.`,
          };
        if (!role)
          return {
            success: false,
            error: `Validation failed: Role missing for ${displayName}.`,
          };

        if (i === 0 && (!email || !mobile)) {
          return {
            success: false,
            error: `Validation failed: Captain's Email and Mobile are required.`,
          };
        }
        if (i === 6 && isOptionalRoleWithData && (!email || !mobile)) {
          return {
            success: false,
            error: `Validation failed: Coach's Email and Mobile are required if data is provided.`,
          };
        }

        // --- Collect game_id for profile existence check ---
        gameIdsToCheck.push(game_id);

        // Optional: Prepare file uploads if needed
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

        // Optional: Store player data if needed
        playersDataForProcessing.push({
          originalIndex: i,
          name: name, // Use validated non-null values
          ign: ign,
          game_id: game_id,
          server_id: server_id,
          role: role, // Use validated non-null value

          email: email, // These are nullable
          mobile: mobile,
          city: city,
          state: state,
          device: device,
          picture_url: null, // Placeholder for URL
          student_id_url: null, // Placeholder for URL
        } as { originalIndex: number } & PlayerInsert);
      }
    }

    // --- Second Pass: Validate profile existence for collected game_ids ---
    const { data: profileCheckData, error: profileCheckError } = await supabase
      .from("profiles")
      .select("game_id")
      .in("game_id", gameIdsToCheck);

    if (profileCheckError) {
      console.error("Supabase profile check error:", profileCheckError);
      return { success: false, error: "Database error checking profiles." };
    }

    const foundGameIds = new Set(profileCheckData?.map((p) => p.game_id));
    const missingGameIds = gameIdsToCheck.filter((id) => !foundGameIds.has(id));

    if (missingGameIds.length > 0) {
      return {
        success: false,
        error: `Some players have not created their profiles yet. Missing Game IDs: ${missingGameIds.join(', ')}.`, // Added missing IDs for debugging
      };
    }

    // ✅ All players validated successfully, continue with rest of the processing

    // Check if at least the required players (Captain + 4 Players = 5) are included in the data collected
    if (
      playersDataForProcessing.filter(
        (p) => p.originalIndex >= 0 && p.originalIndex <= 4
      ).length < 5
    ) {
      console.error(
        `Not enough required players data collected after validation: ${playersDataForProcessing.length} entries.`
      );
      return {
        success: false,
        error:
          "You must provide complete details for the Captain and 4 Players.",
      };
    }

    // --- Perform Player File Uploads ---
    console.log(
      `[handleFinalRegistration] Starting player file uploads. Files to upload count: ${filesToUpload.length}`
    );
    const uploadedUrlsMap: Record<string, string> = {};

    const uploadPromises = filesToUpload.map(async ({ file, index, field }) => {
      // Get the file extension
      const fileExt = file.name.split(".").pop();
       // Ensure ext is not undefined before using it
       const safeExt = fileExt || 'bin'; // Use a default extension if none found
      // Get the player folder/file prefix name (e.g., 'captain', 'player2')
      const playerFileNameSegment = getPlayerFileNameSegment(index);

      // Construct the FULL destination path for each player file
      // Example: 'uni/team/players/captain/picture.jpg' or 'uni/team/players/player2/student_id.png'
      const playerFileDestinationPath = `${registrationBasePath}/players/${playerFileNameSegment}/${
        field === "picture"
          ? playerFileNameSegment + "_pic"
          : playerFileNameSegment + "_id"
      }.${safeExt}`;

      console.log(
        `[handleFinalRegistration] Creating upload promise for: ${file.name} at destination path ${playerFileDestinationPath}`
      );

      // Changed catch error type from 'any' to 'Error' as uploadFile throws Error
      try { // Added try-catch around individual uploads for better error handling
         const url = await uploadFile(
           supabase,
           bucketName, // Use the defined bucket name
           file,
           playerFileDestinationPath // Pass the FULL constructed path
         );
         if (url) {
           console.log(
             `[handleFinalRegistration] Upload promise resolved for ${file.name}. URL: ${url}`
           );
           // Store the URL keyed by original index and field name
           uploadedUrlsMap[`${index}_${field}`] = url;
         } else {
           console.warn(
             `[handleFinalRegistration] Upload promise resolved with null URL for ${file.name}. This might indicate a file type issue or other internal uploadFile problem.`
           );
           // Decide how to handle null URL - maybe throw an error here?
           // For now, continue but log a warning.
         }
         return url; // Return the URL or null so Promise.all waits for completion
      } catch (individualUploadError: unknown) { // Changed catch error type from 'Error' to 'unknown'
          console.error(`[handleFinalRegistration] Individual player file upload failed for ${file.name}:`, individualUploadError);
          // Re-throw the specific error or throw a new one to be caught by the Promise.all catch block
          throw new Error(`Upload failed for ${file.name}: ${individualUploadError instanceof Error ? individualUploadError.message : "Unknown upload error"}`);
      }
    });

    try {
      console.log(
        "[handleFinalRegistration] Waiting for all upload promises to resolve..."
      );
      await Promise.all(uploadPromises);
      console.log(
        "[handleFinalRegistration] All player files uploaded successfully."
      );
      console.log(
        "[handleFinalRegistration] Uploaded URLs Map:",
        uploadedUrlsMap
      );
    } catch (uploadError: unknown) { // Changed catch error type from 'any' to 'unknown'
      console.error(
        "[handleFinalRegistration] One or more player file uploads FAILED:",
        uploadError
      );
       // Safely access message if it's an Error instance
       const errorMessage = uploadError instanceof Error ? uploadError.message : "Unknown file upload error.";
      return {
        success: false,
        error: `Failed to upload one or more player files: ${errorMessage}`,
      };
    }

    // --- Build finalPlayersToInsert with URLs ---
    const finalPlayersToInsertWithUrls: PlayerInsert[] = []; // Declare the array ONCE here

    // Iterate through the validated and collected player data
    playersDataForProcessing.forEach((playerData) => {
      const originalIndex = playerData.originalIndex;

      // Get the uploaded URLs for this player index
      const pictureUrl = uploadedUrlsMap[`${originalIndex}_picture`] || null;
      const studentIdUrl =
        uploadedUrlsMap[`${originalIndex}_student_id`] || null;

      // Prepare the PlayerInsert object (profile_id is NOT included in schema)
      finalPlayersToInsertWithUrls.push({
        team_id: teamId as string, // Cast now that we know teamId is not null
        university_id: universityId as string, // Cast now that we know universityId is not null

        name: playerData.name,
        ign: playerData.ign,
        game_id: playerData.game_id,
        server_id: playerData.server_id,
        role: playerData.role as string, // Cast Player['role'] union to string for DB schema

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
      `Prepared ${finalPlayersToInsertWithUrls.length} players for insertion.`
    );

    // --- Insert Players Data ---
    // Check if there are players to insert *after* filtering and validation
    if (
      finalPlayersToInsertWithUrls.length === 0 &&
      playersDataForProcessing.length > 0
    ) {
      console.error(
        "No players remaining for insertion after processing (check validation/checks before this stage)."
      );
      return {
        success: false,
        error: "No valid players found for insertion after checks.",
      };
    } else if (finalPlayersToInsertWithUrls.length > 0) {
      // Only attempt insert if there are players
      console.log("Inserting Players...");
      const { data: playersData, error: playersInsertError } = await supabase
        .from("players")
        .insert(finalPlayersToInsertWithUrls); // Insert the array of players

      if (playersInsertError) {
        console.error("Supabase insert error (players):", playersInsertError);
        return {
          success: false,
          error: `Database error inserting players: ${playersInsertError.message}`,
        };
      }
      console.log("Players Inserted.", playersData); // 'playersData' variable is now used here in the log
    } else {
      console.log("No players to insert."); // Case where no players were submitted at all (e.g. empty form)
    }

    // --- 4. Final Success ---
    console.log("Full Registration Successful! Redirecting...");
    // Redirect to the success page
    redirect("/register/success"); // Adjust path if your route structure is different
  } catch (error: unknown) { // Changed catch error type from 'any' to 'unknown'
    console.error("[handleFinalRegistration] Caught error:", error); // Log the caught error

    // Check if the error is the special redirect error thrown by Next.js
    // This error has a 'digest' property that starts with 'NEXT_REDIRECT'
    // Safely access 'digest' property
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof (error as any).digest === "string" && // Use any assertion or stricter type guard if needed for digest
      (error as any).digest.startsWith("NEXT_REDIRECT") // Use any assertion or stricter type guard
    ) {
      console.log(
        "[handleFinalRegistration] Identified NEXT_REDIRECT error. Re-throwing to trigger client-side navigation."
      );
      // Re-throw the error to allow Next.js to handle the redirect
      throw error;
    }

    // If it's not a redirect error, handle it as a registration failure
    console.error(
      "[handleFinalRegistration] Handling as a registration failure."
    );
    // Safely access message property
    const errorMessage =
      error instanceof Error
        ? error.message
        : (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' ? error.message : "An unexpected server error occurred."); // Added more robust message access

    return { success: false, error: `Internal server error: ${errorMessage}` };
  }
}