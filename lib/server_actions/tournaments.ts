"use server";
import { createClient } from "@/utils/supabase/server";
import type {TournamentInputs } from "@/types/tournamentsType";

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
  const filename = payload.name + "/logo/" + (Bannerimage ? Bannerimage.name : "default.png");
  if (Bannerimage) {
    try{
      const { data: imageData, error: imageError } = await supabase.storage
      .from("tournaments")
      .upload(filename, Bannerimage);
      if (imageError) {
        console.error("Error uploading image:", imageError);
        return { success: false, error: imageError.message };
      }
      const { data: publicUrlData } = supabase.storage
      .from('tournaments')
      .getPublicUrl(filename);
      const publicUrl = publicUrlData.publicUrl;
      payload.image = publicUrl;
    }
    catch(error) {
      console.error("Error uploading image:", error);
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

  const filename = updateData.name + "/logo/" + (imageFile ? imageFile.name : "default.png");
  const championLogoFilename = updateData.name + "/champion_team_logo/" + (championLogoFile ? championLogoFile.name : "default.png");
  if (!id) {
    console.error("Tournament ID is required for update");
    return { success: false, error: "Tournament ID is required" };
  }

  if (imageFile) {
    try{
      const { error: imageError } = await supabase.storage
      .from("tournaments")
      .upload(filename, imageFile,{
        upsert: true, // Use upsert to replace existing file
      });
      if (imageError) {
        console.error("Error uploading image:", imageError);
        return { success: false, error: imageError.message };
      }
      const { data: publicUrlData } = supabase.storage
      .from('tournaments')
      .getPublicUrl(filename);
      const publicUrl = publicUrlData.publicUrl;
      updateData.image = publicUrl;
    }
    catch(error) {
      console.error("Error uploading image:", error);
    }
  }
  if (championLogoFile) {
    try{
      const { error: imageError } = await supabase.storage
      .from("tournaments")
      .upload(championLogoFilename, championLogoFile,{
        upsert: true, // Use upsert to replace existing file
      });
      if (imageError) {
        console.error("Error uploading image:", imageError);
        return { success: false, error: imageError.message };
      }
      const { data: publicUrlData } = supabase.storage
      .from('tournaments')
      .getPublicUrl(championLogoFilename);
      const publicUrl = publicUrlData.publicUrl;
      updateData.champions_logo = publicUrl;
    }
    catch(error) {
      console.error("Error uploading image:", error);
    }
  }

  const { error } = await supabase
    .from("tournaments")
    .update(updateData)
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