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

  // Process logo first if provided
  if (logo) {
    const logoUrl = await processUniversityLogo(logo, data.name);
    if (logoUrl) {
      data.logo_url = logoUrl;
    }
  }

  const { data: university, error } = await supabase
    .from('universities')
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error(`Database error creating university: ${error.message}`);
    throw new Error(`Database error creating university: ${error.message}`);
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