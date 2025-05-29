"use server";

import { createClient } from "@/utils/supabase/server";
import { TeamListType } from "@/lib/data/stats_data"; // Assuming this path is correct using alias
import { Team } from "@/types/teamTypes";

interface UpdateResult {
  id: string;
  data: Team[] | null; // Consider defining a more specific type if possible
  error: string | null;
}

interface ActionResult {
  success: boolean;
  results?: UpdateResult[];
  error?: string;
}

export async function updateTeamsStatus(teams: TeamListType[]): Promise<ActionResult> {
  if (!teams || teams.length === 0) {
    return { success: false, error: "No teams provided for update." };
  }

  try {
    const supabase = await createClient();

    const results: UpdateResult[] = await Promise.all(
      teams.map(async (team) => {
        if (!team.id || typeof team.team_status === 'undefined') {
          console.error("Invalid team data:", team);
          return { id: team.id || "unknown", data: null, error: "Invalid team data provided." };
        }
        
        console.log(`Server Action: Updating team ID=${team.id} to status=${team.team_status}`);

        const { data, error } = await supabase
          .from("teams")
          .update({ team_status: team.team_status })
          .eq("id", team.id)
          .select(); // Ensure data is returned after update

        if (error) {
          console.error(`Update failed for team ID ${team.id}:`, error.message);
          return { id: team.id, data: null, error: error.message };
        }

        return { id: team.id, data, error: null };
      })
    );

    const hasErrors = results.some(result => result.error);
    if (hasErrors) {
      return { success: false, error: "One or more team updates failed.", results };
    }

    return { success: true, results };
  } catch (error) {
    console.error("Unexpected error in updateTeamsStatus server action:", error);
    return { success: false, error: error as string || "An unexpected server error occurred." };
  }
}
