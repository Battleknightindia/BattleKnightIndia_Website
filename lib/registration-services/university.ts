// lib/registration-services/university.ts
import { createClient } from '@/utils/supabase/server';
import { checkAndUploadFile, sanitizeFileName } from './storage';
// Removed unused import PostgrestSingleResponse

export interface UniversityData {
  id?: string;
  name: string;
  state?: string | null;
  city?: string | null;
  logo_url?: string | null;
}

// Keep the existing createUniversity function - used for new universities when no match is found
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

  return university.id as string;
}

// Removed updateUniversity as it is not called by the main registration/update flow


// Keep the existing processUniversityLogo function - helper for creating university records
async function processUniversityLogo(
  logo: File,
  universityName: string
): Promise<string | null> {
  const sanitizedUniName = sanitizeFileName(universityName);
  const fileExt = logo.name.split('.').pop() || 'bin';
  const destinationPath = `${sanitizedUniName}/university_logo.${fileExt}`;

  return await checkAndUploadFile('registrations', logo, destinationPath);
}

