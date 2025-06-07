// ./lib/data/volunteers_data.ts

"use client";

import { createClient } from "@/utils/supabase/client";
import { volunteersSchema, type VolunteerFormState } from "@/schema/volunteerSchema";
import { z } from "zod";

// Interface for a referred team (for fetching the list of teams, if still needed)
interface ReferredTeam {
  id: string;
  logo: string | null;
  name: string;
  captainName: string;
  captainGameId: string;
  captainServerId: string;
  registrationDate: string;
  status: string | null;
}

/**
 * Fetches the authenticated user's volunteer data from the 'volunteers' table.
 * This function now expects 'total_teams', 'approved_teams', and 'reward_points'
 * to be already updated and stored directly in the 'volunteers' table by the database triggers.
 * @returns A Promise resolving to the validated VolunteerFormState data or null.
 */
export async function fetchvolunteerData(): Promise<VolunteerFormState | null> {
  const supabase = createClient();

  // 1. Get the authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("fetchvolunteerData: User fetch failed:", userError?.message || "User not found");
    return null;
  }

  console.log(`fetchvolunteerData: Attempting to fetch volunteer record for user ID: ${user.id}`);

  // 2. Fetch the volunteer record for the logged-in user by their profile_id (user.id)
  const { data: volunteer, error: fetchError } = await supabase
    .from("volunteers")
    .select("*") // Select all columns, including the updated counts and points
    .eq("profile_id", user.id)
    .single(); // Expecting at most one volunteer record per user

  if (fetchError) {
    console.error("fetchvolunteerData: Supabase fetch error:", fetchError.message);
    if (fetchError.code === 'PGRST116') {
      console.log(`fetchvolunteerData: No volunteer record found for user ID: ${user.id}`);
    }
    return null; // Return null on any fetch error, including no row found
  }

  if (!volunteer) {
    console.log(`fetchvolunteerData: No volunteer record found for user ID: ${user.id} after fetch.`);
    return null;
  }

  console.log("fetchvolunteerData: Successfully fetched volunteer data:", volunteer);

  // 3. Validate the fetched data using the Zod schema
  // Ensure your volunteersSchema (VolunteerFormState) is updated to include
  // total_teams, approved_teams, and reward_points.
  const result = volunteersSchema.safeParse(volunteer);

  if (!result.success) {
    console.error("fetchvolunteerData: Validation failed for fetched volunteer data:", result.error);
    console.log("fetchvolunteerData: Data that failed validation:", volunteer);
    return null;
  }

  console.log("fetchvolunteerData: Successfully validated volunteer data.");
  return result.data;
}

/**
 * Fetches teams referred by a specific referral code, along with their captain data.
 * This function is still useful if you want to display the actual list of referred teams.
 * It is no longer involved in calculating the volunteer's aggregate counts/points,
 * as those are now directly in the 'volunteers' table.
 * @param referralCode The referral code to fetch teams for.
 * @returns A Promise resolving to an array of ReferredTeam objects. Returns empty array on error or if no referral code/teams are found.
 */
export async function fetchTeamsByReferralCodeAndCaptainData(referralCode: string): Promise<ReferredTeam[]> {
  const supabase = createClient();
  const referredTeamsData: ReferredTeam[] = [];

  if (!referralCode) {
    console.warn("fetchTeamsByReferralCodeAndCaptainData: No referral code provided. Cannot fetch referred teams.");
    return [];
  }

  console.log(`fetchTeamsByReferralCodeAndCaptainData: Fetching teams for referral code: ${referralCode}`);

  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("id, name, created_at, team_status, logo_url")
    .eq("referral_code", referralCode);

  if (teamsError) {
    console.error(`fetchTeamsByReferralCodeAndCaptainData: Error fetching teams for referral code ${referralCode}:`, teamsError.message);
    return [];
  }

  if (!teams || teams.length === 0) {
    console.log(`fetchTeamsByReferralCodeAndCaptainData: No teams found for referral code ${referralCode}.`);
    return [];
  }

  console.log(`fetchTeamsByReferralCodeAndCaptainData: Found ${teams.length} teams. Proceeding to fetch captain data...`);

  for (const team of teams) {
    const { data: captain, error: captainError } = await supabase
      .from("players")
      .select("ign, game_id, server_id")
      .eq("team_id", team.id)
      .eq("role", "captain")
      .maybeSingle();

    if (captainError) {
      console.error(`fetchTeamsByReferralCodeAndCaptainData: Error fetching captain data for team ID ${team.id}:`, captainError.message);
      continue;
    }

    if (captain) {
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
      console.log(`fetchTeamsByReferralCodeAndCaptainData: Added team ${team.name} with captain ${captain.ign}`);
    } else {
      console.warn(`fetchTeamsByReferralCodeAndCaptainData: Captain with role 'captain' not found in players table for team ID: ${team.id}. Skipping team.`);
    }
  }

  console.log(`fetchTeamsByReferralCodeAndCaptainData: Finished processing teams. Returning ${referredTeamsData.length} referred teams with captain data.`);
  return referredTeamsData;
}