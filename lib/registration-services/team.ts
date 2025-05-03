import { createClient } from '@/utils/supabase/server';
import { checkAndUploadFile, sanitizeFileName } from './storage';

export interface TeamData {
  name: string;
  university_id?: string;
  user_id?: string;
  referral_code?: string | null;
  logo_url?: string | null;
}

export async function createTeam(
  data: TeamData,
  logo: File | null,
  universityName: string
): Promise<string> {
  const supabase = await createClient();
  const { data: team, error } = await supabase
    .from('teams')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(`Database error creating team: ${error.message}`);
  }

  if (logo) {
    const logoUrl = await processTeamLogo(logo, universityName, data.name);
    if (logoUrl) {
      const { error: updateError } = await supabase
        .from('teams')
        .update({ logo_url: logoUrl })
        .eq('id', team.id);

      if (updateError) {
        console.error('Error updating team logo URL:', updateError);
      }
    }
  }

  return team.id;
}

export async function updateTeam(
  teamId: string,
  data: Partial<TeamData>,
  logo: File | null,
  universityName: string,
  userId: string
): Promise<void> {
  const supabase = await createClient();
  
  // Check team ownership
  const { data: teamData, error: teamError } = await supabase
    .from('teams')
    .select('user_id')
    .eq('id', teamId)
    .single();

  if (teamError) {
    throw new Error(`Database error checking team ownership: ${teamError.message}`);
  }

  if (teamData.user_id !== userId) {
    throw new Error('Unauthorized: You do not have permission to update this team');
  }

  // Process logo if provided
  if (logo) {
    const logoUrl = await processTeamLogo(logo, universityName, data.name || '');
    if (logoUrl) {
      data.logo_url = logoUrl;
    }
  }

  // Update team data
  const { error: updateError } = await supabase
    .from('teams')
    .update(data)
    .eq('id', teamId);

  if (updateError) {
    throw new Error(`Database error updating team: ${updateError.message}`);
  }
}

async function processTeamLogo(
  logo: File,
  universityName: string,
  teamName: string
): Promise<string | null> {
  const sanitizedUniName = sanitizeFileName(universityName);
  const sanitizedTeamName = sanitizeFileName(teamName);
  const fileExt = logo.name.split('.').pop() || 'bin';
  const destinationPath = `${sanitizedUniName}/${sanitizedTeamName}/team_logo.${fileExt}`;

  return await checkAndUploadFile('registrations', logo, destinationPath);
}