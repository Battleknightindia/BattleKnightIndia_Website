import { TeamListType } from "../data/statsData";

// lib/api/updateTeams.ts
export async function updateTeams(teams: TeamListType[]) {
  return await fetch("/api/update-teams", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(teams),
  });
}
