import { createClient } from "@/utils/supabase/server";
import { Database } from "@/types/supabase";

type Team = Database["public"]["Tables"]["teams"]["Row"];
export type TeamListType = Pick<Team, "id" | "name" | "team_status" | "referral_code">;

export async function fetchteams(): Promise<TeamListType[] | undefined> {
  console.log("fetchteams: called"); // Initial log

  let supabase;
  try {
    console.log("fetchteams: Attempting to create Supabase client...");
    supabase = await createClient();
    console.log("fetchteams: Supabase client created successfully.");
  } catch (clientError) {
    console.log(clientError);
    console.error("fetchteams: Error creating Supabase client:", clientError);
    return undefined; // Return early if client creation fails
  }

  try {
    const { data, error } = await supabase.from("teams").select("*");

    if (error) {
      console.error("fetchteams: Supabase fetch error:", error);
      return undefined;
    }

    if (!data) {
      console.log("fetchteams: No data returned from Supabase, returning undefined.");
      return undefined;
    }
    const mappedData = data.map((team) => ({
      id: team.id,
      name: team.name,
      team_status: team.team_status,
      referral_code: team.referral_code,
    }));
    return mappedData;
  } catch (queryError) {
    console.error("fetchteams: Unexpected error during Supabase query:", queryError);
    return undefined;
  }
}