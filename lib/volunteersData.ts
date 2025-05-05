"use client";

import { createClient } from "@/utils/supabase/client";
import { volunteersSchema } from "@/schema/volunteerSchema";

export async function fetchvolunteerData() {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error("User fetch failed:", userError);
    return null;
  }

  const { data: volunteer, error: unable } = await supabase
    .from("volunteers")
    .select("*")
    .eq("email", user.email)
    .single();
  if (unable || !volunteer) {
    console.error("Volunteer Data fetch failed:", unable);
    return null;
  }

  const result = volunteersSchema.safeParse(volunteer);
  if (!result.success) {
    console.error("Validation failed:", result.error);
    return null;
  }

  return result.data;
}

interface ReferredTeam {
  id: string; // Based on your teams table schema (uuid)
  logo: string | null; // Based on your teams table schema (logo_url text null)
  name: string;
  captainName: string; // This should correspond to the captain's IGN from 'players'
  captainGameId: string; // From 'players'
  captainServerId: string; // From 'players'
  registrationDate: string; // Corresponds to 'created_at' (timestamp)
  status: string | null; // Corresponds to 'team_status' (text null)
}

// ... (imports and ReferredTeam interface) ...

export async function fetchTeamsByReferralCodeAndCaptainData(): Promise<ReferredTeam[]> {
  const supabase = createClient();
  const referredTeamsData: ReferredTeam[] = [];
  const referral_code = (await fetchvolunteerData())?.referral_code;

  if (!referral_code) {
    console.error("No referral code found for the volunteer");
    return [];
  }

  console.log(`Workspaceing teams for referral code: ${referral_code}`);

  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("id, name, created_at, team_status, logo_url")
    .eq("referral_code", referral_code);

  if (teamsError) {
    console.error(`Error fetching teams for referral code ${referral_code}:`, teamsError);
    console.error("Supabase teamsError details:", teamsError);
    return [];
  }

  console.log(`Found ${teams.length} teams for referral code ${referral_code}. Fetching captain data from players table...`);

  // 2. For each team, fetch the captain's data from the 'players' table
  for (const team of teams) {
    console.log("--- Processing team ID:", team.id); // Log the team ID
    console.log("Attempting to fetch captain for team ID:", team.id); // Log before captain query

    const { data: captain, error: captainError } = await supabase
      .from("players")
      .select("ign, game_id, server_id")
      .eq("team_id", team.id)
      .eq("role", "captain")
      .maybeSingle();

    console.log("Result of captain query (data):", captain); // Log the captain data
    console.log("Result of captain query (error):", captainError); // Log any captain query error


    if (captainError) {
      console.error(`Error fetching captain data for team ID ${team.id}:`, captainError);
      // Continue to the next team if captain data fetching fails
      continue;
    }

    if (captain) {
      console.log("Captain found for team ID", team.id, ". Adding to results."); // Log when captain is found
      // 3. Combine team and captain data into the desired format
      referredTeamsData.push({
        id: team.id,
        logo: team.logo_url || "/placeholder.svg?height=40&width=40",
        name: team.name,
        captainName: captain.ign,
        captainGameId: captain.game_id,
        captainServerId: captain.server_id,
        registrationDate: team.created_at,
        status: team.team_status,
      });
    } else {
      // Handle cases where a captain with the role 'captain' is not found for a team
      console.warn(`Captain with role 'captain' not found in players table for team ID: ${team.id}. Skipping team.`); // Log when captain is NOT found
    }
     console.log("--- Finished processing team ID:", team.id); // Log after processing team
  }

  console.log("Finished fetching referred teams data. Final array:", referredTeamsData); // Log the final array
  return referredTeamsData;
}

export async function teamsCount(): Promise<{ total: string, approved: string } | null> {
  const supabase = createClient();
  const referralCode = (await fetchvolunteerData())?.referral_code;

  if (!referralCode) {
    console.error("No referral code found for the volunteer");
    // Return null or a specific error indicator if referral code is missing
    return null;
  }

  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("id, team_status")
    .eq("referral_code", referralCode);

  if (teamsError) {
    console.error("Error fetching teams:", teamsError);
    // Return null or a specific error indicator on fetch error
    return null;
  }

  // Ensure teams is an array before accessing length and filtering
  if (!Array.isArray(teams)) {
      console.error("Teams data is not an array:", teams);
      return null; // Return null if the data format is unexpected
  }

  const totalTeams = teams.length;
  const approvedTeams = teams.filter(team => team.team_status === "approved").length;

  // Return an object with both total and approved counts as strings
  return {
      total: totalTeams.toString(),
      approved: approvedTeams.toString()
  };
}