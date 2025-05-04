import { createClient } from '@/utils/supabase/server';
import { checkAndUploadFile, sanitizeFileName } from './storage';
import { type Player } from '@/types/registrationTypes';

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
  student_id_url?: string | null;
}

export const getPlayerRoleDisplayName = (index: number): string => {
  if (index === 0) return "Captain";
  if (index >= 1 && index <= 4) return `Player ${index + 1}`;
  if (index === 5) return "Substitute";
  if (index === 6) return "Coach";
  return `Unknown Member ${index + 1}`;
};

export const getPlayerFileNameSegment = (index: number): string => {
  if (index === 0) return "captain";
  if (index >= 1 && index <= 4) return `player${index + 1}`;
  if (index === 5) return "substitute";
  if (index === 6) return "coach";
  return `unknown${index}`;
};

export async function findExistingPlayers(
  teamId: string
): Promise<{ id: string; game_id: string }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("players")
    .select("id, game_id")
    .eq("team_id", teamId);

  if (error) {
    throw new Error(`Database error fetching existing players: ${error.message}`);
  }

  return data || [];
}

export async function processPlayerFiles(
  files: { file: File; index: number; field: "student_id_url" }[],
  universityName: string,
  teamName: string
): Promise<Record<string, string>> {
  const sanitizedUniName = sanitizeFileName(universityName);
  const sanitizedTeamName = sanitizeFileName(teamName);
  const registrationBasePath = `${sanitizedUniName}/${sanitizedTeamName}`;
  const uploadedUrlsMap: Record<string, string> = {};

  for (const { file, index, field } of files) {
    const fileExt = file.name.split(".").pop() || 'bin';
    const playerFileNameSegment = getPlayerFileNameSegment(index);
    const playerFileDestinationPath = `${registrationBasePath}/players/${playerFileNameSegment}/${
      playerFileNameSegment + "_id"
    }.${fileExt}`;

    try {
      const url = await checkAndUploadFile(
        "registrations",
        file,
        playerFileDestinationPath
      );
      if (url) {
        uploadedUrlsMap[`${index}_${field}`] = url;
      }
    } catch (error) {
      console.error(`File upload failed for ${file.name}:`, error);
      throw error;
    }
  }

  return uploadedUrlsMap;
}

export async function updatePlayers(
  players: (PlayerData & { id: string })[]
): Promise<void> {
  const supabase = await createClient();
  for (const player of players) {
    const { id, ...updateData } = player;
    const { error } = await supabase
      .from("players")
      .update(updateData)
      .eq("id", id);

    if (error) {
      throw new Error(`Database error updating player: ${error.message}`);
    }
  }
}

export async function createPlayers(
  players: PlayerData[]
): Promise<void> {
  if (players.length === 0) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("players")
    .insert(players)
    .select();

  if (error) {
    throw new Error(`Database error inserting players: ${error.message}`);
  }
}

export function validatePlayerData(
  playerData: Partial<PlayerData>,
  index: number,
  isOptionalRole: boolean = false
): void {
  const displayName = getPlayerRoleDisplayName(index);
  const requiredFields = ['name', 'ign', 'game_id', 'server_id', 'role'] as const;
  
  // Check if any data is provided for optional roles (Substitute/Coach)
  if (isOptionalRole) {
    const hasAnyData = Object.values(playerData).some(
      value => value !== null && value !== undefined && value !== ""
    );
    if (!hasAnyData) {
      return; // Skip validation if no data is provided for optional roles
    }
  }

  // Basic field validation for all players if data is provided
  for (const field of requiredFields) {
    if (!playerData[field]) {
      throw new Error(`${field.replace('_', ' ').toUpperCase()} is required for ${displayName}.`);
    }
  }

  // Student ID validation is handled during file upload process in checkAndUploadFile
  // We don't validate it here as it will be handled separately

  // Email and mobile validation only for Captain (index 0) and Coach (index 6)
  if (index === 0 || (index === 6 && playerData.role === 'coach')) {
    if (!playerData.email?.trim()) {
      throw new Error(`EMAIL is required for ${displayName}.`);
    }
    if (!playerData.mobile?.trim()) {
      throw new Error(`MOBILE is required for ${displayName}.`);
    }
  }
}