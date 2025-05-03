import { createClient } from '@/utils/supabase/server';
import { checkAndUploadFile, sanitizeFileName } from './storage';

export interface UniversityData {
  name: string;
  state?: string | null;
  city?: string | null;
  logo_url?: string | null;
}

export async function createUniversity(
  data: UniversityData,
  logo: File | null
): Promise<string> {
  const supabase = await createClient();
  const { data: university, error } = await supabase
    .from('universities')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(`Database error creating university: ${error.message}`);
  }

  if (logo) {
    const logoUrl = await processUniversityLogo(logo, data.name);
    if (logoUrl) {
      const { error: updateError } = await supabase
        .from('universities')
        .update({ logo_url: logoUrl })
        .eq('id', university.id);

      if (updateError) {
        console.error('Error updating university logo URL:', updateError);
      }
    }
  }

  return university.id;
}

export async function updateUniversity(
  universityId: string,
  data: Partial<UniversityData>,
  logo: File | null
): Promise<void> {
  const supabase = await createClient();
  
  // Process logo if provided
  if (logo) {
    const logoUrl = await processUniversityLogo(logo, data.name || '');
    if (logoUrl) {
      data.logo_url = logoUrl;
    }
  }

  const { error } = await supabase
    .from('universities')
    .update(data)
    .eq('id', universityId);

  if (error) {
    throw new Error(`Database error updating university: ${error.message}`);
  }
}

async function processUniversityLogo(
  logo: File,
  universityName: string
): Promise<string | null> {
  const sanitizedUniName = sanitizeFileName(universityName);
  const fileExt = logo.name.split('.').pop() || 'bin';
  const destinationPath = `${sanitizedUniName}/university_logo.${fileExt}`;

  return await checkAndUploadFile('registrations', logo, destinationPath);
}