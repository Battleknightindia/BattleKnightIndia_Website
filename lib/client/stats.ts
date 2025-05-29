import { TeamListType } from "@/lib/data/stats_data"; // Assuming this path is correct using alias
import { updateTeamsStatus } from "../server_actions/teams"; 

export async function updateTeamsApiClient(teams: TeamListType[]) {
  try {
    const result = await updateTeamsStatus(teams); 

    if (!result.success) {
      console.error("Server action updateTeamsStatus failed:", result.error, result.results);
      throw new Error(result.error || "Failed to update teams via server action.");
    }

    return result; 
  } catch (error) {
    console.error("Error calling updateTeamsStatus server action:", error);
    throw error; 
  }
}
