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
  if (index === 1) return "Captain"; // Adjusted for 1-based index
  if (index >= 2 && index <= 5) return `Player ${index}`; // Adjusted for 1-based index
  if (index === 6) return "Substitute"; // Adjusted for 1-based index
  if (index === 7) return "Coach"; // Adjusted for 1-based index
  return `Unknown Member ${index}`;
};

export const getPlayerFileNameSegment = (index: number): string => {
  if (index === 1) return "captain"; // Adjusted for 1-based index
  if (index >= 2 && index <= 5) return `player${index}`; // Adjusted for 1-based index
  if (index === 6) return "substitute"; // Adjusted for 1-based index
  if (index === 7) return "coach"; // Adjusted for 1-based index
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
  const uploadPromises: Promise<void>[] = [];

  for (const { file, index, field } of files) {
    // Skip if no file is provided
    if (!file) continue;

    // Skip file upload for coach (index 6)
    if (index === 6) continue;

    const fileExt = file.name.split(".").pop()?.toLowerCase() || 'bin';
    const playerFileNameSegment = getPlayerFileNameSegment(index);
    const playerFileDestinationPath = `${registrationBasePath}/players/${playerFileNameSegment}/${
      playerFileNameSegment + "_id"
    }.${fileExt}`;

    const uploadPromise = (async () => {
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
        console.error(`File upload failed for player ${index}:`, error);
        const playerRole = index === 1 ? "Captain" : 
                         index === 6 ? "Substitute" :
                         `Player ${index}`;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`${playerRole}: ${errorMessage}`);
      }
    })();

    uploadPromises.push(uploadPromise);
  }

  // Wait for all uploads to complete
  try {
    await Promise.all(uploadPromises);
  } catch (error) {
    throw error; // Re-throw to be handled by the caller
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
      console.error(`Database error updating player: ${error.message}`);
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
    console.error(`Database error inserting players: ${error.message}`);
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
  
  if (isOptionalRole) {
    // For substitute (index 6) and coach (index 7)
    const hasAnyData = Object.entries(playerData).some(([key, value]) => {
      if (key === 'role') return false; // Skip role field in the check
      return value !== null && value !== undefined && value !== "";
    });

    if (!hasAnyData) {
      return; // Skip validation if no data is provided for optional roles
    }

    // For coach specifically
    if (index === 7) {
      const requiredCoachFields = ['name', 'ign', 'game_id', 'server_id', 'email', 'mobile'] as const;
      const hasPartialData = requiredCoachFields.some(field => 
        playerData[field] !== null && playerData[field] !== undefined && playerData[field] !== ""
      );

      // If any of the coach fields are filled, all become required
      if (hasPartialData) {
        for (const field of requiredCoachFields) {
          if (!playerData[field]) {
            throw new Error(`${field.replace('_', ' ').toUpperCase()} is required for ${displayName} if any coach information is provided.`);
          }
        }
      } else {
        return; // Skip further validation if no coach data is provided
      }
    }
  }

  // Basic field validation for all players if data is provided
  for (const field of requiredFields) {
    if (!playerData[field]) {
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
}