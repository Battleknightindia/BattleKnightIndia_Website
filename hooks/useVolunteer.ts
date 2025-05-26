// @/hooks/useVolunteer.ts

"use client";

import { useState, useEffect } from "react";
// Assuming these paths and functions are correct
import { fetchvolunteerData, teamsCount } from "@/lib/data/volunteers_data";
// Assuming VolunteerFormState defines the structure returned by fetchvolunteerData
import type { VolunteerFormState } from "@/schema/volunteerSchema";

// Define a new type that extends the base volunteer data
// to include total_teams, approved_teams, and reward_points.
interface VolunteerWithTeamCount extends VolunteerFormState {
  total_teams: string; // Store total teams as string
  approved_teams: string; // Store approved teams as string
  reward_points: string; // Store calculated reward points as string
}

export function useVolunteer() {
  // Use the new type for the volunteer state
  const [volunteer, setVolunteer] = useState<VolunteerWithTeamCount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Single async function to handle all data loading
    async function loadAllData() {
      setLoading(true); // Start loading for all operations
      setError(null); // Clear any previous errors

      let fetchedVolunteerData: VolunteerFormState | null = null;
      // Assuming teamsCount now returns { total: string, approved: string } or null on error
      let fetchedTeamCounts: { total: string, approved: string } | null = null;

      try {
        // Fetch both data sources concurrently
        const [volunteerResult, teamCountResult] = await Promise.all([
          fetchvolunteerData(),
          teamsCount() // Call the actual teamsCount function
        ]);

        fetchedVolunteerData = volunteerResult;
        fetchedTeamCounts = teamCountResult; // Store the result

      } catch (err) {
        // Catch unexpected errors during the fetch process
        const typedError = err as Error;
        setError(typedError.message || "An unexpected error occurred during fetching.");
      }

      // Now, process the results after fetches are done
      if (fetchedVolunteerData === null) {
           setError(prevError => prevError ? prevError + " Failed to load volunteer data." : "Failed to load volunteer data.");
           setVolunteer(null); // Ensure volunteer state is null
      }

      // Check if team counts were fetched successfully
      if (fetchedTeamCounts === null) {
           setError(prevError => prevError ? prevError + " Failed to load team count." : "Failed to load team count.");
           // If team counts failed, we cannot calculate reward points correctly,
           // so we won't set the volunteer state with counts/points.
      }

      // If BOTH fetches were successful, combine the data and set the volunteer state
      if (fetchedVolunteerData !== null && fetchedTeamCounts !== null) {
          // Calculate reward points based ONLY on approved_teams
          const approvedCount = parseInt(fetchedTeamCounts.approved, 10); // Parse approved count to number
          const rewardPoints = approvedCount * 100; // Calculate points

          const volunteerWithCount: VolunteerWithTeamCount = {
              ...fetchedVolunteerData,
              total_teams: fetchedTeamCounts.total, // Use the total count from the result
              approved_teams: fetchedTeamCounts.approved, // Use the approved count from the result
              reward_points: rewardPoints.toString(), // Convert calculated points back to string
          };
          setVolunteer(volunteerWithCount);
      } else {
          // If either fetch failed, volunteer state remains null (set above or initially)
          // The error state(s) are already set.
      }

      setLoading(false); // End loading after all processing (success or failure)
    }

    loadAllData(); // Execute the combined async function

  }, []); // Empty dependency array means this effect runs only once on mount

  // Return the combined volunteer state, loading status, and error message
  return { volunteer, loading, error };
}

// @/lib/volunteersData.ts

// Assuming createClient and fetchvolunteerData are imported or defined elsewhere
// import { createClient } from './supabaseClient'; // Example import
// import { fetchvolunteerData } from './volunteerData'; // Example import


