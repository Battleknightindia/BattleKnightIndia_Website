// lib/registration-services/main.ts
import { createClient } from '@/utils/supabase/server';
import * as universityService from './university';
import * as teamService from './team';
import * as playerService from './player';
import { type Player } from '@/types/registrationTypes';

interface RegistrationData {
  universityName: string;
  universityState: string | null;
  universityCity: string | null;
  universityLogo: File | null;
  teamName: string;
  teamLogo: File | null;
  referralCode: string | null;
  players: {
    index: number;
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
    student_id_url: File | null;
  }[];
}

export async function processRegistrationUpdate(
  data: RegistrationData,
  universityId: string, // This is the ID of the university already linked to the existing team
  teamId: string,
  userId: string
): Promise<void> {
  const supabase = await createClient();

  try {
    console.log(`Starting registration update for Team ID: ${teamId}, University ID: ${universityId}`);

    // --- REMOVED: University update call based on user requirement ---
    // The university associated with the existing team is NOT updated via this process.
    // Details submitted in the form's university section are ignored for university record updates here.
    // The team remains linked to the original universityId.
    console.log(`Skipping university update for University ID: ${universityId} as per requirement.`);
    // --- End REMOVED ---


    // Update team details and logo if a new logo file is provided
    await teamService.updateTeam(
      teamId,
      {
        name: data.teamName,
        referral_code: data.referralCode,
      },
      data.teamLogo,
      data.universityName,
      userId // Pass userId to teamService for storage path
    );
    console.log(`Team ${teamId} update processed.`);

    // Process existing players to identify which need updating vs creating
    const existingPlayers = await playerService.findExistingPlayers(teamId);
    const existingPlayersMap = new Map(existingPlayers.map(p => [p.game_id, p.id]));
    console.log(`Found ${existingPlayers.length} existing players.`);

    // Collect player files that are actual File instances
    const playerFilesToUpload = data.players
      .map(p => (p.student_id_url instanceof File ? { file: p.student_id_url, index: p.index, field: "student_id_url" as const } : null))
      .filter((item): item is NonNullable<typeof item> => item !== null);
    console.log(`Found ${playerFilesToUpload.length} player files to potentially upload.`);

    // Upload files and get URLs
    const uploadedUrls = await playerService.processPlayerFiles(
      playerFilesToUpload,
      data.universityName,
      data.teamName
    );
    console.log(`Player file uploads processed. Collected ${Object.keys(uploadedUrls).length} URLs.`);

    // Check if required student ID files were uploaded successfully
    const requiredPlayerIndices = [1, 2, 3, 4, 5];
     for (const player of data.players) {
         if (requiredPlayerIndices.includes(player.index) && player.student_id_url instanceof File) {
             const fileKey = `${player.index}_student_id_url`;
             if (!uploadedUrls[fileKey]) {
                 const playerRole = playerService.getPlayerRoleDisplayName(player.index);
                 console.error(`Required Student ID file upload failed for ${playerRole} (Index ${player.index}).`);
                 throw new Error(`Failed to upload required Student ID file for ${playerRole}. Please try again.`);
             }
         }
     }
     console.log("Required Student ID file uploads verified.");

    const playersToUpdate: (playerService.PlayerData & { id: string })[] = [];
    const playersToCreate: playerService.PlayerData[] = [];

    for (const player of data.players) {
      const existingId = existingPlayersMap.get(player.gameId);
      const fileKey = `${player.index}_student_id_url`;
      const uploadedUrl = uploadedUrls[fileKey] || null;

      const playerData: playerService.PlayerData = {
        team_id: teamId,
        university_id: universityId, // Use the university ID linked to the existing team
        game_id: player.gameId,
        server_id: player.serverId,
        ign: player.ign,
        name: player.name,
        role: player.role,
        email: player.email,
        mobile: player.mobile,
        city: player.city,
        state: player.state,
        device: player.device,
        student_id_url: uploadedUrl, // Use the new URL if uploaded, otherwise null (will require merging with old data if old URL should persist)
      };

      if (existingId) {
        playersToUpdate.push({ ...playerData, id: existingId });
        console.log(`Player ${player.index} (${player.ign}) marked for update with ID ${existingId}.`);
      } else {
        playersToCreate.push(playerData);
        console.log(`Player ${player.index} (${player.ign}) marked for creation.`);
      }
    }
    console.log(`${playersToUpdate.length} players to update, ${playersToCreate.length} players to create.`);

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
      throw new Error(`Registration update failed: ${error.message}`);
    } else {
      console.error('Unknown error during registration update process', error);
      throw new Error('Unknown error during registration update process');
    }
  }
}


export async function processNewRegistration(
  data: RegistrationData,
  userId: string,
  existingUniversityId: string | null // Accept the determined university ID
): Promise<{ success: boolean; message: string; universityId?: string; teamId?: string } | void> {
  const supabase = await createClient();
  console.log("Starting new registration process.");

  try {
    let universityId: string;
    let usingExistingUniversity = false;

    // Determine University ID: Use provided ID if available, otherwise create new
    if (existingUniversityId) {
      universityId = existingUniversityId;
      usingExistingUniversity = true;
      console.log(`Using provided existing university ID: ${universityId}`);
      // If using existing university, DO NOT create or upload a new university logo.
    } else {
      // No existing university ID provided, create a new one
      console.log(`Creating new university: ${data.universityName}`);
      universityId = await universityService.createUniversity(
        {
          name: data.universityName,
          state: data.universityState,
          city: data.universityCity,
        },
        data.universityLogo // Pass the logo File | null here for creation
      );
       console.log(`New university created with ID: ${universityId}`);
    }

    // Create the new team for this registration
    console.log(`Creating new team: ${data.teamName} for university ID: ${universityId}`);
    const teamId = await teamService.createTeam(
      {
        name: data.teamName,
        university_id: universityId, // Associate with the determined university ID
        user_id: userId,
        referral_code: data.referralCode,
      },
      data.teamLogo, // Always process the team logo for the new team
      data.universityName
    );
    console.log(`New team created with ID: ${teamId}`);

    // Process player files for the players in this new team
    const playerFilesToUpload = data.players
      .map(p => (p.student_id_url instanceof File ? { file: p.student_id_url, index: p.index, field: "student_id_url" as const } : null))
      .filter((item): item is NonNullable<typeof item> => item !== null);
    console.log(`Found ${playerFilesToUpload.length} player files to potentially upload.`);

    // Upload files and get URLs
    const uploadedUrls = await playerService.processPlayerFiles(
      playerFilesToUpload,
      data.universityName,
      data.teamName
    );
    console.log(`Player file uploads processed. Collected ${Object.keys(uploadedUrls).length} URLs.`);

    // Check if required student ID files were uploaded successfully
    const requiredPlayerIndices = [1, 2, 3, 4, 5];
     for (const player of data.players) {
         if (requiredPlayerIndices.includes(player.index) && player.student_id_url instanceof File) {
             const fileKey = `${player.index}_student_id_url`;
             if (!uploadedUrls[fileKey]) {
                 const playerRole = playerService.getPlayerRoleDisplayName(player.index);
                 console.error(`Required Student ID file upload failed for ${playerRole} (Index ${player.index}).`);
                 throw new Error(`Failed to upload required Student ID file for ${playerRole}. Please ensure the file is valid and try again.`);
             }
         }
     }
     console.log("Required Student ID file uploads verified.");


    // Prepare and create player records for the new team
    const playersToCreate = data.players.map(player => {
      const fileKey = `${player.index}_student_id_url`;
      const uploadedUrl = uploadedUrls[fileKey] || null;

      return {
        team_id: teamId,
        university_id: universityId, // Associate with the determined university ID
        game_id: player.gameId,
        server_id: player.serverId,
        ign: player.ign,
        name: player.name,
        role: player.role,
        email: player.email,
        mobile: player.mobile,
        city: player.city,
        state: player.state,
        device: player.device,
        student_id_url: uploadedUrl,
      };
    });
    console.log(`Prepared ${playersToCreate.length} players for creation.`);

    // Create players using playerService function
    await playerService.createPlayers(playersToCreate);
    console.log("Players creation process completed.");

    console.log("New registration process completed successfully.");
    return { success: true, message: "Registration successful!", universityId, teamId };

  } catch (error: unknown) {
     console.error('Caught exception during new registration process:', error);
    if (error instanceof Error) {
      throw new Error(`Registration failed: ${error.message}`);
    } else {
      console.error('Unknown error type during new registration process');
      throw new Error('An unknown error occurred during registration.');
    }
  }
}


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
  if (requiredPlayers.length !== 5) {
      const playersIndicesPresent = data.players.map(p => p.index);
      for (let i = 1; i <= 5; i++) {
          if (!playersIndicesPresent.includes(i)) {
              throw new Error(`Details for Player ${i} (required) are missing.`);
          }
      }
      throw new Error("You must provide complete details for the Captain and 4 Players");
  }

  // Validate required files presence (logos)
  if (!data.universityLogo || !(data.universityLogo instanceof File)) {
    throw new Error("University logo is required and must be a valid file.");
  }
  if (!data.teamLogo || !(data.teamLogo instanceof File)) {
    throw new Error("Team logo is required and must be a valid file.");
  }

  // Validate each player's data structure using playerService.validatePlayerData
  for (const player of data.players) {
    const isOptionalRole = player.index === 6 || player.index === 7;

    try {
      playerService.validatePlayerData(
        {
          name: player.name,
          ign: player.ign,
          game_id: player.gameId,
          server_id: player.serverId,
          role: player.role,
          email: player.email,
          mobile: player.mobile,
          city: player.city,
          state: player.state,
          device: player.device,
          student_id_url: player.student_id_url
        },
        player.index,
        isOptionalRole
      );
    } catch (error) {
      const playerRole = playerService.getPlayerRoleDisplayName(player.index);
      const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
      throw new Error(`${playerRole}: ${errorMessage}`);
    }
  }
}

