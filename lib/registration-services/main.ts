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
  universityId: string,
  teamId: string,
  userId: string
): Promise<void> {
  const supabase = await createClient();

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
    const existingId = existingPlayersMap.get(player.gameId);
    const playerData: playerService.PlayerData = {
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
}

export async function processNewRegistration(
  data: RegistrationData,
  userId: string
): Promise<void> {
  const supabase = await createClient();

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
}

export function validateRegistrationData(data: RegistrationData): void {
  if (!data.universityName?.trim()) {
    throw new Error("University Name is required");
  }
  if (!data.teamName?.trim()) {
    throw new Error("Team Name is required");
  }

  // Validate required players (Captain + 4 Players)
  const requiredPlayers = data.players.filter(p => p.index >= 0 && p.index <= 4);
  if (requiredPlayers.length < 5) {
    throw new Error("You must provide complete details for the Captain and 4 Players");
  }

  // Validate each player's data
  for (const player of data.players) {
    const isOptionalRole = player.index > 4;
    
    // For optional roles (Substitute/Coach), check if any data is provided
    if (isOptionalRole) {
      const hasData = Object.entries(player).some(([key, value]) => {
        if (key === 'index' || key === 'role') return false; // Skip these fields
        return value !== null && value !== undefined && value !== '';
      });
      
      if (!hasData) continue; // Skip validation if no data is provided
    }

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
  }
}