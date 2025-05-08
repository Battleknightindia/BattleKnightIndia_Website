// lib/registration-services/university.ts
import { createClient } from '@/utils/supabase/server';
import { checkAndUploadFile, sanitizeFileName } from './storage';
import { PostgrestSingleResponse } from '@supabase/supabase-js'; // Import for type hinting

export interface UniversityData {
  id?: string; // Add id as it will be returned when finding
  name: string;
  state?: string | null;
  city?: string | null;
  logo_url?: string | null;
}

// Add this new function
export async function findUniversityByName(name: string): Promise<UniversityData | null> {
  const supabase = await createClient();

  try {
    // Query the universities table by name
    const { data, error }: PostgrestSingleResponse<UniversityData> = await supabase
      .from('universities')
      .select('id, name, state, city, logo_url') // Select necessary fields
      .eq('name', name)
      .single(); // Expect a single result or null

    if (error && error.code !== 'PGRST116') { // PGRST116 is the "not found" error code in Supabase
      console.error(`Database error finding university by name '${name}': ${error.message}`);
      throw new Error(`Database error finding university: ${error.message}`);
    }

    // If data is null, university was not found (this is not an error for this function's purpose)
    return data; // data will be UniversityData object or null
    
  } catch (error) {
     // Catch any other unexpected errors during the query
    if (error instanceof Error) {
      console.error(`Unexpected error finding university by name '${name}': ${error.message}`);
      throw new Error(`Error finding university: ${error.message}`);
    } else {
      console.error('Unknown error finding university by name');
      throw new Error('Unknown error finding university');
    }
  }
}


// Keep the existing createUniversity function
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
     // Re-throw database error, letting calling function handle unique constraint if needed
    throw new Error(`Database error creating university: ${error.message}`);
  }

  return university.id as string; // Ensure the ID is treated as string
}

// Keep the existing updateUniversity function
export async function updateUniversity(
  universityId: string,
  data: Partial<UniversityData>,
  logo: File | null
): Promise<void> {
  const supabase = await createClient();
  
  // Process logo if provided
  if (logo) {
    const logoUrl = await processUniversityLogo(logo, data.name || ''); // Use provided name or empty string
    if (logoUrl) {
      data.logo_url = logoUrl;
    }
  }

  const { error } = await supabase
    .from('universities')
    .update(data)
    .eq('id', universityId);

  if (error) {
    console.error(`Database error updating university: ${error.message}`);
    throw new Error(`Database error updating university: ${error.message}`);
  }
}

// Keep the existing processUniversityLogo function
async function processUniversityLogo(
  logo: File,
  universityName: string // Name needed for storage path
): Promise<string | null> {
  const sanitizedUniName = sanitizeFileName(universityName);
  const fileExt = logo.name.split('.').pop() || 'bin';
   // Construct the destination path in the 'registrations' bucket
  const destinationPath = `${sanitizedUniName}/university_logo.${fileExt}`;

  // checkAndUploadFile handles the actual upload and returns the URL or null/throws
  return await checkAndUploadFile('registrations', logo, destinationPath);
}
