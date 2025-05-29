"use server";
import { createClient } from "@/utils/supabase/server";
import type {TournamentInputs } from "@/types/tournamentsType";
import { uploadTournamentAsset } from "@/lib/services/storageService";

export interface TournamentInput {
  id?: string;
  name: string | undefined;
  image?:  string | null ;
  video?: string;
  prizemoney: string | undefined;
  registration_start_date?: string;
  teamslots: number;
  description?: string;
  startdate?: string;
  enddate?: string;
  status: 'upcoming' | 'live' | 'past' | 'registration';
  registration_end_date?: string;
  registrationlink?: string;
  livestreamlink?: string;
  champions?: string;
  champions_logo?:string
}

function toDbFields(input: TournamentInput) {
  return {
    name: input.name,
    image: input.image,
    prizemoney: input.prizemoney,
    registration_start_date: input.registration_start_date,
    teamslots: input.teamslots,
    startdate: input.startdate,
    enddate: input.enddate,
    registrationlink: input.registrationlink,
    livestreamlink: input.livestreamlink,
    description: input.description,
    status: input.status,
    video: input.video,
    registration_end_date: input.registration_end_date,
    champions: input.champions,
    champions_logo: input.champions_logo,
  };
}

interface UpdateTournamentOptions {
  id: string | undefined | null;
  updateData: TournamentInputs;
  imageFile?: File | null;
  championLogoFile?: File | null;
}

// Insert Tournament
export async function insertTournament(data: TournamentInput, Bannerimage:File | null) {
  const supabase = await createClient();
  const payload = toDbFields(data);
  if (Bannerimage && payload.name) {
    try{
      const publicUrl = await uploadTournamentAsset(Bannerimage, payload.name, 'logo');
      if (!publicUrl) {
        return { success: false, error: "Image upload failed." };
      }
      payload.image = publicUrl;
    }
    catch(error) {
      console.error("Error uploading image:", error);
      return { success: false, error: error || "Image upload failed unexpectedly." };
    }
  }
  
  try{
    const { data: result, error } = await supabase.from("tournaments").insert(payload).select().single();
    if (error) {
      console.error("Error inserting tournament:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data: result };
  }
  catch (error) {
    console.error("Error inserting tournament:", error);
    return { success: false, error: "An Unexpected error has occured" };
  }
}

export async function updateTournament({
  id,
  updateData,
  imageFile,
  championLogoFile,
}: UpdateTournamentOptions) {

  const supabase = await createClient();

  if (!id) {
    console.error("Tournament ID is required for update");
    return { success: false, error: "Tournament ID is required" };
  }
  if (!updateData.name) {
    console.error("Tournament Name is required for update");
    return { success: false, error: "Tournament Name is required" };
  }

  // Create a mutable copy for potential modifications (like image URLs)
  const dataToUpdate = { ...updateData };

  if (imageFile) {
    try{
      const publicUrl = await uploadTournamentAsset(imageFile, dataToUpdate.name!, 'logo');
      if (!publicUrl) {
        return { success: false, error: "Tournament image upload failed." };
      }
      dataToUpdate.image = publicUrl;
    }
    catch(error: any) {
      console.error("Error uploading image:", error);
      return { success: false, error: error.message || "Tournament image upload failed unexpectedly." };
    }
  }
  if (championLogoFile) {
    try{
      const publicUrl = await uploadTournamentAsset(championLogoFile, dataToUpdate.name!, 'champion_logo');
      if (!publicUrl) {
        return { success: false, error: "Champion logo upload failed." };
      }
      dataToUpdate.champions_logo = publicUrl;
    }
    catch(error: any) {
      console.error("Error uploading image:", error);
      return { success: false, error: error.message || "Champion logo upload failed unexpectedly." };
    }
  }

  // Destructure to exclude total_participants if it exists from the final data sent to Supabase
  const { total_participants, ...restOfUpdateData } = dataToUpdate;

  const { error } = await supabase
    .from("tournaments")
    .update(restOfUpdateData)
    .eq("id", id);

  if (error) {
    console.error("Update error:", error);
    return { success: false, error: error.message };
  }

  return { success: true ,};
}

// Delete Tournament
export async function deleteTournament(name:string, id: string, publicUrl:string) {
  const supabase = await createClient();
  const { data: files, error: listError } = await supabase
    .storage
    .from("tournaments")
    .list(name); // this lists files under `${name}/`

  if (listError) {
    console.error("Error listing files:", listError);
    return { success: false, error: listError.message };
  }

  const pathsToDelete = files.map((file) => `${name}/${file.name}`);

  if (pathsToDelete.length > 0) {
    const { error: removeError } = await supabase
      .storage
      .from("tournaments")
      .remove(pathsToDelete);

    if (removeError) {
      console.error("Error deleting images:", removeError);
      return { success: false, error: removeError.message };
    }
  }
  const { error:Deleteerror } = await supabase.from("tournaments").delete().eq("id", id);
  if (Deleteerror) return { success: false, error: Deleteerror.message };
  return { success: true };
}