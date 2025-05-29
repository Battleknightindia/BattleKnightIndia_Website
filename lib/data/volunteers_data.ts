// ./lib/volunteersData.ts

"use client";

import { createClient } from "@/utils/supabase/client";
// *** CORRECTED IMPORT ***
// Import the specific type name exported from volunteerSchema.ts
import { volunteersSchema, type VolunteerFormState } from "@/schema/volunteerSchema";
import { z } from "zod"; // Import z if you need it for schema validation results


// Define the interface for a referred team, combining data from 'teams' and 'players'
// Make sure these fields match how you are selecting and mapping data
interface ReferredTeam {
  id: string; // teams.id (uuid)
  logo: string | null; // teams.logo_url (text | null)
  name: string; // teams.name (text)
  captainName: string; // players.ign (text)
  captainGameId: string; // players.game_id (text)
  captainServerId: string; // players.server_id (text)
  registrationDate: string; // teams.created_at (timestamp)
  status: string | null; // teams.team_status (text | null)
}

/**
 * Fetches the authenticated user's volunteer data from the 'volunteers' table.
 * It fetches by profile_id (user.id) which is more reliable than email.
 * Validates the fetched data against the volunteersSchema.
 * @returns A Promise resolving to the validated VolunteerFormState data or null if fetching/validation fails or no record is found.
 */
// *** CORRECTED RETURN TYPE ***
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

  console.log(`WorkspacevolunteerData: Attempting to fetch volunteer record for user ID: ${user.id}`);

  // 2. Fetch the volunteer record for the logged-in user by their ID (profile_id)
  // Use the profile_id column which should match user.id from auth
  const { data: volunteer, error: fetchError } = await supabase
    .from("volunteers")
    .select("*") // Select all columns defined in volunteerSchema
    .eq("profile_id", user.id) // *** CORRECTED: Fetch using the user's unique ID (profile_id) ***
    .single(); // Expecting at most one volunteer record per user

  if (fetchError) {
      console.error("fetchvolunteerData: Supabase fetch error:", fetchError.message);
      // Check if the error is specifically 'PGRST116' which means no rows found
      if (fetchError.code === 'PGRST116') {
           console.log(`WorkspacevolunteerData: No volunteer record found for user ID: ${user.id}`);
      }
      return null; // Return null on any fetch error, including no row found
  }

   if (!volunteer) {
      // Although fetchError.code === 'PGRST116' should cover this, an explicit check is safe
      console.log(`WorkspacevolunteerData: No volunteer record found for user ID: ${user.id} after fetch.`);
      return null;
   }


  console.log("fetchvolunteerData: Successfully fetched volunteer data:", volunteer);

  // 3. Validate the fetched data using the Zod schema
  const result = volunteersSchema.safeParse(volunteer);

  if (!result.success) {
    console.error("fetchvolunteerData: Validation failed for fetched volunteer data:", result.error);
    // Log the data that failed validation to help debug the schema vs actual data
    console.log("fetchvolunteerData: Data that failed validation:", volunteer);
    return null;
  }

  // 4. Return the validated data
  console.log("fetchvolunteerData: Successfully validated volunteer data.");
  return result.data;
}

/**
 * Fetches teams referred by the current volunteer using their referral code.
 * It also fetches the captain's data (IGN, Game ID, Server ID) for each referred team.
 * @returns A Promise resolving to an array of ReferredTeam objects. Returns empty array on error or if no referral code/teams are found.
 */
export async function fetchTeamsByReferralCodeAndCaptainData(): Promise<ReferredTeam[]> {
  const supabase = createClient();
  const referredTeamsData: ReferredTeam[] = [];

  // 1. Get the current volunteer's referral code by fetching their volunteer data
  const volunteerData = await fetchvolunteerData();
  const referral_code = volunteerData?.referral_code; // Safely access referral_code

  if (!referral_code) {
    console.warn("fetchTeamsByReferralCodeAndCaptainData: No referral code found for the current volunteer. Cannot fetch referred teams.");
    // Return an empty array if no referral code is available
    return [];
  }

  console.log(`WorkspaceTeamsByReferralCodeAndCaptainData: Fetching teams for referral code: ${referral_code}`);

  // 2. Fetch teams that used this referral code
  // Select only the columns needed for the ReferredTeam interface + the team_id for captain lookup
  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("id, name, created_at, team_status, logo_url")
    .eq("referral_code", referral_code); // Filter teams by the volunteer's referral code

  if (teamsError) {
    console.error(`WorkspaceTeamsByReferralCodeAndCaptainData: Error fetching teams for referral code ${referral_code}:`, teamsError.message);
    return []; // Return empty array on error
  }

  if (!teams || teams.length === 0) {
      console.log(`WorkspaceTeamsByReferralCodeAndCaptainData: No teams found for referral code ${referral_code}.`);
      return []; // Return empty array if no teams are found
  }

  console.log(`WorkspaceTeamsByReferralCodeAndCaptainData: Found ${teams.length} teams. Proceeding to fetch captain data...`);

  // 3. For each fetched team, fetch the captain's data from the 'players' table
  for (const team of teams) {
    // Fetch the player associated with this team and having the 'captain' role
    const { data: captain, error: captainError } = await supabase
      .from("players")
      .select("ign, game_id, server_id") // Select the captain's relevant details
      .eq("team_id", team.id) // Filter by the current team's ID
      .eq("role", "captain") // Filter for the player with the 'captain' role
      .maybeSingle(); // Use maybeSingle as a captain record might not exist or role might be different

    if (captainError) {
      console.error(`WorkspaceTeamsByReferralCodeAndCaptainData: Error fetching captain data for team ID ${team.id}:`, captainError.message);
      // Continue to the next team if fetching captain data for this team fails
      continue; // Skip this team and process the next one
    }

    if (captain) {
      // 4. Combine team and captain data into the ReferredTeam format
      referredTeamsData.push({
        id: team.id,
        logo: team.logo_url || "/placeholder.svg?height=40&width=40", // Provide a fallback logo URL
        name: team.name,
        captainName: captain.ign,
        captainGameId: captain.game_id,
        captainServerId: captain.server_id,
        registrationDate: team.created_at, // Use the team's creation date
        status: team.team_status,
      });
       console.log(`WorkspaceTeamsByReferralCodeAndCaptainData: Added team ${team.name} with captain ${captain.ign}`);
    } else {
      // Log a warning if a team was found but no captain was associated or found with the 'captain' role
      console.warn(`WorkspaceTeamsByReferralCodeAndCaptainData: Captain with role 'captain' not found in players table for team ID: ${team.id}. Skipping team.`);
    }
  }

  console.log(`WorkspaceTeamsByReferralCodeAndCaptainData: Finished processing teams. Returning ${referredTeamsData.length} referred teams with captain data.`);
  return referredTeamsData; // Return the array of combined data
}

/**
 * Fetches the total and approved count of teams referred by the current volunteer.
 * @returns A Promise resolving to an object with total and approved counts as strings, or null on failure or if no referral code/teams are found.
 */
export async function teamsCount(): Promise<{ total: string, approved: string } | null> {
  const supabase = createClient();

  // 1. Get the volunteer's referral code by fetching their volunteer data
  const volunteerData = await fetchvolunteerData();
  const referralCode = volunteerData?.referral_code; // Safely access referralCode

  if (!referralCode) {
    console.warn("teamsCount: No referral code found for the volunteer. Cannot count teams.");
    return null; // Cannot count teams without a referral code
  }

  console.log(`teamsCount: Counting teams for referral code: ${referralCode}`);

  // 2. Fetch teams using the referral code, selecting only necessary columns for counting and status check
  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("id, team_status") // Select only id and status for efficiency
    .eq("referral_code", referralCode);

  if (teamsError) {
    console.error("teamsCount: Error fetching teams for counting:", teamsError.message);
    return null; // Return null on error
  }

  // Ensure teams is an array before processing
  if (!Array.isArray(teams)) {
      console.error("teamsCount: Teams data format is unexpected:", teams);
      return null; // Return null if the data format is unexpected
  }

   if (teams.length === 0) {
       console.log(`teamsCount: No teams found for referral code ${referralCode}.`);
       return { total: "0", approved: "0" }; // Return counts as 0 if no teams found
   }


  // 3. Calculate counts
  const totalTeams = teams.length;
  // Filter for teams where team_status is exactly 'approved'
  const approvedTeams = teams.filter(team => team.team_status === "approved").length;

  console.log(`teamsCount: Total teams referred: ${totalTeams}, Approved teams: ${approvedTeams}`);

  // 4. Return counts as strings
  return {
      total: totalTeams.toString(),
      approved: approvedTeams.toString()
  };
}

