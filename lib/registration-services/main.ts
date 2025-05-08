// lib/registration-services/main.ts
import { createClient } from '@/utils/supabase/server';
import * as universityService from './university'; // Import the updated universityService
import * as teamService from './team';
import * as playerService from './player'; // Import playerService
import { type Player } from '@/types/registrationTypes';

// Keep RegistrationData interface as is (it expects the 1-based index field)
interface RegistrationData {
  universityName: string;
  universityState: string | null;
  universityCity: string | null;
  universityLogo: File | null;
  teamName: string;
  teamLogo: File | null;
  referralCode: string | null;
  players: {
    index: number; // This is the 1-based index (1 to 7)
    name: string;
    ign: string;
    gameId: string;
    serverId: string;
    role: Player['role'];
    email: string | null;
    mobile: string | null;
    city: string | null;
    state: string | null;
    device: string | null;
    student_id_url: File | null; // Expecting File | null from form submission
  }[];
}

// Keep processRegistrationUpdate as is - it handles updating existing universities
export async function processRegistrationUpdate(
  data: RegistrationData,
  universityId: string,
  teamId: string,
  userId: string
): Promise<void> {
  const supabase = await createClient();

  try {
    console.log(`Starting registration update for University ID: ${universityId}, Team ID: ${teamId}`);

    // Update university if needed - this will update the existing university record
    // It correctly handles updating data and replacing the logo if a new logo File is provided
    await universityService.updateUniversity(
      universityId,
      {
        name: data.universityName,
        state: data.universityState,
        city: data.universityCity,
      },
      data.universityLogo // Pass the logo file here for potential update
    );
    console.log(`University ${universityId} update processed.`);

    // Update team if needed
    await teamService.updateTeam(
      teamId,
      {
        name: data.teamName,
        referral_code: data.referralCode,
      },
      data.teamLogo, // Pass the team logo file here for potential update
      data.universityName, // Pass for storage path
      userId
    );
    console.log(`Team ${teamId} update processed.`);


    // Process existing players - needed to identify which players need updating vs creating
    const existingPlayers = await playerService.findExistingPlayers(teamId);
    const existingPlayersMap = new Map(existingPlayers.map(p => [p.game_id, p.id]));
    console.log(`Found ${existingPlayers.length} existing players.`);

    // Process player files - collect only File instances, keeping original index (1-based)
    const playerFilesToUpload = data.players.map(p => (
      p.student_id_url instanceof File ? { file: p.student_id_url, index: p.index, field: "student_id_url" as const } : null
    )).filter((item): item is NonNullable<typeof item> => item !== null);
    console.log(`Found ${playerFilesToUpload.length} player files to potentially upload.`);


    // Upload files and get URLs. processPlayerFiles now uses allSettled.
    const uploadedUrls = await playerService.processPlayerFiles(
      playerFilesToUpload,
      data.universityName, // Pass for storage path
      data.teamName // Pass for storage path
    );
     console.log(`Player file uploads processed. Collected ${Object.keys(uploadedUrls).length} URLs.`);


    // IMPORTANT: Check if required student ID files were uploaded successfully
    const requiredPlayerIndices = [1, 2, 3, 4, 5]; // Captain and Players 2-5
     for (const player of data.players) {
         if (requiredPlayerIndices.includes(player.index)) {
             const fileKey = `${player.index}_student_id_url`;
             // Check if a file was originally provided AND if its URL exists in the map
             if (player.student_id_url instanceof File && !uploadedUrls[fileKey]) {
                 // This means a file was provided but failed to upload or get URL
                 const playerRole = playerService.getPlayerRoleDisplayName(player.index);
                 console.error(`Required Student ID file upload failed for ${playerRole} (Index ${player.index}).`);
                 throw new Error(`Failed to upload required Student ID file for ${playerRole}. Please try again.`);
             }
             // Note: If player.student_id_url was NOT a File instance (e.g. updating without providing new file),
             // we don't check uploadedUrls because we expect to keep the old URL or it was optional.
         }
     }
     console.log("Required Student ID file uploads verified.");


    // Prepare players for update and insert
    const playersToUpdate: (playerService.PlayerData & { id: string })[] = [];
    const playersToCreate: playerService.PlayerData[] = [];

    for (const player of data.players) {
      const existingId = existingPlayersMap.get(player.gameId); // Find existing player by gameId
      const fileKey = `${player.index}_student_id_url`; // Key for uploaded URL map
      const uploadedUrl = uploadedUrls[fileKey] || null; // Get the uploaded URL, defaults to null if not found

      const playerData: playerService.PlayerData = {
        team_id: teamId,
        university_id: universityId,
        game_id: player.gameId, // Mapping from RegistrationData.gameId to playerService.PlayerData.game_id
        server_id: player.serverId, // Mapping from RegistrationData.serverId to playerService.PlayerData.server_id
        ign: player.ign,
        name: player.name,
        role: player.role,
        email: player.email,
        mobile: player.mobile,
        city: player.city,
        state: player.state,
        device: player.device,
        // Assign the newly uploaded URL if available, otherwise it will be null
        student_id_url: uploadedUrl,
      };

      if (existingId) {
         // When updating, we need to decide whether to keep the old URL or use the new one.
         // If a new file was uploaded successfully (uploadedUrl is not null), use it.
         // Otherwise, the field won't be included in updateData if undefined, preserving the old value.
         // Or explicitly fetch the existing player to get the old URL if not provided in data.
         // For simplicity here, if uploadedUrl is null, the student_id_url field might be omitted from the update, keeping the old value.
         // A more robust update would fetch the existing record to merge data.
        playersToUpdate.push({ ...playerData, id: existingId });
        console.log(`Player ${player.index} (${player.ign}) marked for update with ID ${existingId}.`);
      } else {
        playersToCreate.push(playerData);
         console.log(`Player ${player.index} (${player.ign}) marked for creation.`);
      }
    }
    console.log(`${playersToUpdate.length} players to update, ${playersToCreate.length} players to create.`);


    // Update and create players
    if (playersToUpdate.length > 0) {
      await playerService.updatePlayers(playersToUpdate);
      console.log("Players update process completed.");
    }
    if (playersToCreate.length > 0) {
      await playerService.createPlayers(playersToCreate);
       console.log("Players creation process completed.");
    }

    console.log("Registration update process completed successfully.");

  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error during registration update process: ${error.message}`);
      // Add specific error handling for potential duplicate team names if needed
      if (error.message.includes("duplicate key value violates unique constraint") && error.message.includes("teams")) {
         throw new Error("A team with this name might already exist under this university. Please use a different team name.");
      }
       // Propagate other errors
      throw new Error(`Registration update failed: ${error.message}`);
    } else {
      console.error('Unknown error during registration update process', error);
      throw new Error('Unknown error during registration update process');
    }
  }
}

// Modify this function to use the improved player file processing and checking
export async function processNewRegistration(
  data: RegistrationData,
  userId: string
): Promise<{ success: boolean; message: string; universityId?: string; teamId?: string } | void> {
  const supabase = await createClient();
  console.log("Starting new registration process.");

  try {
    let universityId: string;
    let usingExistingUniversity = false;

    // Step 1: Check if university already exists by name
    console.log(`Checking for existing university: ${data.universityName}`);
    const existingUniversity = await universityService.findUniversityByName(data.universityName);

    if (existingUniversity) {
      // University found, use its ID for the new team and players
      universityId = existingUniversity.id as string; // Cast because id is optional in interface but present if found
      usingExistingUniversity = true;
      console.log(`Using existing university: ${data.universityName} (ID: ${universityId})`);
      // IMPORTANT: Do NOT process the universityLogo provided by this new team if using an existing university.
      // The existing university record already has a logo.
      // The updateUniversity function would handle logo replacement if this was an update process.
    } else {
      // University not found, create a new one
      console.log(`Creating new university: ${data.universityName}`);
      // Only process the university logo if creating a new university
      universityId = await universityService.createUniversity(
        {
          name: data.universityName,
          state: data.universityState,
          city: data.universityCity,
          // logo_url will be set inside createUniversity if data.universityLogo is processed
        },
        data.universityLogo // Pass the logo File | null here for creation
      );
       console.log(`New university created with ID: ${universityId}`);
    }

    // Step 2: Create the new team for this registration
    // A new team is always created for a new registration
    console.log(`Creating new team: ${data.teamName} for university ID: ${universityId}`);
    const teamId = await teamService.createTeam(
      {
        name: data.teamName,
        university_id: universityId, // Associate the new team with the found or created university
        user_id: userId,
        referral_code: data.referralCode,
      },
      data.teamLogo, // Always process the team logo for the new team
      data.universityName // Pass university name for storage path
    );
     console.log(`New team created with ID: ${teamId}`);


    // Step 3: Process player files for the players in this new team
    // This is done regardless of whether the university was new or existing
    const playerFilesToUpload = data.players.map(p => (
      p.student_id_url instanceof File ? { file: p.student_id_url, index: p.index, field: "student_id_url" as const } : null
    )).filter((item): item is NonNullable<typeof item> => item !== null);
    console.log(`Found ${playerFilesToUpload.length} player files to potentially upload.`);


     // Upload files and get URLs. processPlayerFiles now uses allSettled.
    const uploadedUrls = await playerService.processPlayerFiles(
      playerFilesToUpload,
      data.universityName, // Pass university name for storage path
      data.teamName // Pass team name for storage path
    );
    console.log(`Player file uploads processed. Collected ${Object.keys(uploadedUrls).length} URLs.`);


    // IMPORTANT: Check if required student ID files were uploaded successfully
    // This is a critical step before creating player records to ensure data integrity
    const requiredPlayerIndices = [1, 2, 3, 4, 5]; // Captain and Players 2-5
     for (const player of data.players) {
         // Check only for the required player indices and if a file was originally provided
         if (requiredPlayerIndices.includes(player.index) && player.student_id_url instanceof File) {
             const fileKey = `${player.index}_student_id_url`;
             // If the original player data had a file instance, but no corresponding URL exists in the map,
             // it means the upload failed for this required file.
             if (!uploadedUrls[fileKey]) {
                 const playerRole = playerService.getPlayerRoleDisplayName(player.index);
                  console.error(`Required Student ID file upload failed for ${playerRole} (Index ${player.index}).`);
                 // Throw an error specific to the failed required file upload
                 throw new Error(`Failed to upload required Student ID file for ${playerRole}. Please ensure the file is valid and try again.`);
             }
         }
     }
     console.log("Required Student ID file uploads verified.");


    // Step 4: Prepare and create player records for the new team
    const playersToCreate = data.players.map(player => {
      const fileKey = `${player.index}_student_id_url`; // Key for uploaded URL map
      const uploadedUrl = uploadedUrls[fileKey] || null; // Get the uploaded URL, defaults to null if not found

      return {
        team_id: teamId, // Associate players with the new team
        university_id: universityId, // Associate players with the found or created university
        game_id: player.gameId, // Mapping from RegistrationData.gameId to playerService.PlayerData.game_id
        server_id: player.serverId, // Mapping from RegistrationData.serverId to playerService.PlayerData.server_id
        ign: player.ign,
        name: player.name,
        role: player.role,
        email: player.email,
        mobile: player.mobile,
        city: player.city,
        state: player.state,
        device: player.device,
       // Assign the newly uploaded URL if available. Will be null if upload failed,
       // file wasn't provided, or player is the coach.
        student_id_url: uploadedUrl,
      };
    });
     console.log(`Prepared ${playersToCreate.length} players for creation.`);


    // Create players using playerService function
    await playerService.createPlayers(playersToCreate);
    console.log("Players creation process completed.");

    console.log("New registration process completed successfully.");
     // Return success or specific outcome if needed by the caller
     return { success: true, message: "Registration successful!", universityId, teamId };


  } catch (error: unknown) {
     console.error('Caught exception during new registration process:', error);
     // Catch errors from service calls (find/create university, create team, process player files, create players)
    if (error instanceof Error) {
      // Add specific error handling for potential duplicate team names if needed
      if (error.message.includes("duplicate key value violates unique constraint") && error.message.includes("teams")) {
         // This assumes your 'teams' table has a unique constraint, e.g., on team_name and university_id
         throw new Error("A team with this name might already exist under this university. Please use a different team name.");
      }
       // Propagate other errors
      throw new Error(`Registration failed: ${error.message}`);
    } else {
      console.error('Unknown error type during new registration process');
      throw new Error('An unknown error occurred during registration.');
    }
  }
}

// Keep validateRegistrationData as is (using 1-based indexing as fixed previously)
// This is called BEFORE processNewRegistration or processRegistrationUpdate
export function validateRegistrationData(data: RegistrationData): void {
  if (!data.universityName?.trim()) {
    throw new Error("University Name is required");
  }
  if (!data.teamName?.trim()) {
    throw new Error("Team Name is required");
  }

  // Validate required players (Captain + 4 Players).
  // Assuming index is 1-based (1 to 7). Required players are indices 1 through 5.
  const requiredPlayers = data.players.filter(p => p.index >= 1 && p.index <= 5);
  // Check if there are exactly 5 required players present in the data array
  if (requiredPlayers.length !== 5) {
      // More specific check if required player indices are missing
      const playersIndicesPresent = data.players.map(p => p.index);
      for (let i = 1; i <= 5; i++) {
          if (!playersIndicesPresent.includes(i)) {
              throw new Error(`Details for Player ${i} (required) are missing.`);
          }
      }
       // Fallback error if count is wrong but all indices 1-5 are present (less likely)
      throw new Error("You must provide complete details for the Captain and 4 Players");
  }


  // Validate required files presence (logos) at the data structure level
  // This check ensures a File object was *provided* by the client for required logos.
  // Actual upload success is checked later in the process.
  if (!data.universityLogo || !(data.universityLogo instanceof File)) {
    throw new Error("University logo is required and must be a valid file.");
  }
  if (!data.teamLogo || !(data.teamLogo instanceof File)) {
    throw new Error("Team logo is required and must be a valid file.");
  }

  // Validate each player's data structure using playerService.validatePlayerData
  for (const player of data.players) {
    // Check if the player index is for an optional role (Substitute index 6, Coach index 7)
    // Assuming index is 1-based.
    const isOptionalRole = player.index === 6 || player.index === 7;

    try {
       // Call playerService's validation for detailed player checks
       // Pass the data structure expected by playerService.validatePlayerData
       // Pass the 1-based index and whether it's an optional role
      playerService.validatePlayerData(
        {
          name: player.name,
          ign: player.ign,
          game_id: player.gameId, // Mapping to game_id for playerService
          server_id: player.serverId, // Mapping to server_id for playerService
          role: player.role,
          email: player.email,
          mobile: player.mobile,
          city: player.city,
          state: player.state,
          device: player.device,
           // Pass the File | null for student_id_url for validation in playerService
          student_id_url: player.student_id_url // Pass the original file/null here
        },
        player.index, // Pass the 1-based index
        isOptionalRole // Pass whether it's an optional role
      );
    } catch (error) {
      // Enhance error message with player role information using 1-based index
      const playerRole = playerService.getPlayerRoleDisplayName(player.index);
      const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
      // Re-throw the error with enhanced message
      throw new Error(`${playerRole}: ${errorMessage}`);
    }
  }
}

