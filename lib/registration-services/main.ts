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
    index: number; // Adjusted to use 1-based index
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
  universityId: string,
  teamId: string,
  userId: string
): Promise<void> {
  const supabase = await createClient();

  try {
    // Update university if needed
    await universityService.updateUniversity(
      universityId,
      {
        name: data.universityName,
        state: data.universityState,
        city: data.universityCity,
      },
      data.universityLogo
    );

    // Update team if needed
    await teamService.updateTeam(
      teamId,
      {
        name: data.teamName,
        referral_code: data.referralCode,
      },
      data.teamLogo,
      data.universityName,
      userId
    );

    // Process existing players
    const existingPlayers = await playerService.findExistingPlayers(teamId);
    const existingPlayersMap = new Map(existingPlayers.map(p => [p.game_id, p.id]));

    // Process player files
    const playerFiles = data.players.map(p => (
      p.student_id_url ? { file: p.student_id_url, index: p.index, field: "student_id_url" as const } : null
    )).filter((item): item is NonNullable<typeof item> => item !== null);

    const uploadedUrls = await playerService.processPlayerFiles(
      playerFiles,
      data.universityName,
      data.teamName
    );

    // Prepare players for update and insert
    const playersToUpdate: (playerService.PlayerData & { id: string })[] = [];
    const playersToCreate: playerService.PlayerData[] = [];

    for (const player of data.players) {
      console.log("Processing player data:", player);

      // Validate player data before processing
      try {
        validateRegistrationData({
          universityName: data.universityName,
          teamName: data.teamName,
          players: [player],
          universityState: data.universityState,
          universityCity: data.universityCity,
          universityLogo: data.universityLogo,
          teamLogo: data.teamLogo,
          referralCode: data.referralCode,
        });
      } catch (validationError) {
        console.error("Validation error for player:", player, validationError);
        throw validationError;
      }

      const existingId = existingPlayersMap.get(player.gameId);
      const playerData: playerService.PlayerData = {
        team_id: teamId,
        university_id: universityId,
        game_id: player.gameId,
        server_id: player.serverId,
        ign: player.ign || "Unknown IGN", // Fallback value for ign
        name: player.name,
        role: player.role,
        email: player.email,
        mobile: player.mobile,
        city: player.city,
        state: player.state,
        device: player.device,
        student_id_url: uploadedUrls[`${player.index}_student_id`] || null,
      };

      if (existingId) {
        playersToUpdate.push({ ...playerData, id: existingId });
      } else {
        playersToCreate.push(playerData);
      }
    }

    // Update and create players
    if (playersToUpdate.length > 0) {
      await playerService.updatePlayers(playersToUpdate);
    }
    if (playersToCreate.length > 0) {
      await playerService.createPlayers(playersToCreate);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Database error updating player: ${error.message}`);
      throw new Error(`Database error updating player: ${error.message}`);
    } else {
      console.error('Unknown database error updating player');
      throw new Error('Unknown database error updating player');
    }
  }
}

export async function processNewRegistration(
  data: RegistrationData,
  userId: string
): Promise<void> {
  const supabase = await createClient();

  try {
    // Create university
    const universityId = await universityService.createUniversity(
      {
        name: data.universityName,
        state: data.universityState,
        city: data.universityCity,
      },
      data.universityLogo
    );

    // Create team
    const teamId = await teamService.createTeam(
      {
        name: data.teamName,
        university_id: universityId,
        user_id: userId,
        referral_code: data.referralCode,
      },
      data.teamLogo,
      data.universityName
    );

    // Process player files
    const playerFiles = data.players.map(p => (
      p.student_id_url ? { file: p.student_id_url, index: p.index, field: "student_id_url" as const } : null
    )).filter((item): item is NonNullable<typeof item> => item !== null);

    const uploadedUrls = await playerService.processPlayerFiles(
      playerFiles,
      data.universityName,
      data.teamName
    );

    // Prepare and create players
    const playersToCreate = data.players.map(player => ({
      team_id: teamId,
      university_id: universityId,
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
      student_id_url: uploadedUrls[`${player.index}_student_id`] || null,
    }));

    await playerService.createPlayers(playersToCreate);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Database error updating player: ${error.message}`);
      throw new Error(`Database error updating player: ${error.message}`);
    } else {
      console.error('Unknown database error updating player');
      throw new Error('Unknown database error updating player');
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

  // Validate required players (Captain + 4 Players)
  const requiredPlayers = data.players.filter(p => p.index >= 1 && p.index <= 5);
  if (requiredPlayers.length < 5) {
    throw new Error("You must provide complete details for the Captain and 4 Players");
  }

  // Validate file presence before processing
  if (!data.universityLogo) {
    throw new Error("University logo is required");
  }
  if (!data.teamLogo) {
    throw new Error("Team logo is required");
  }

  // Validate each player's data
  for (const player of data.players) {
    const isOptionalRole = player.index > 5;
    
    // For optional roles (Substitute/Coach), check if any data is provided
    if (isOptionalRole) {
      const hasData = Object.entries(player).some(([key, value]) => {
        if (key === 'index' || key === 'role') return false; // Skip these fields
        return value !== null && value !== undefined && value !== '';
      });
      
      if (!hasData) continue; // Skip validation if no data is provided
    }

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
          device: player.device
        },
        player.index,
        isOptionalRole
      );
    } catch (error) {
      // Enhance error message with player role information
      const playerRole = player.index === 1 ? "Captain" : 
                        player.index === 6 ? "Substitute" :
                        player.index === 7 ? "Coach" :
                        `Player ${player.index}`;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`${playerRole}: ${errorMessage}`);
    }
  }
}