// @/hooks/useVolunteer.ts

"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchvolunteerData } from "@/lib/data/volunteers_data";
import type { VolunteerFormState } from "@/schema/volunteerSchema"; // Ensure this schema is updated

export function useVolunteer() {
  // VolunteerFormState should now contain all the directly stored data
  const [volunteer, setVolunteer] = useState<VolunteerFormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVolunteerData = useCallback(async () => {
    setLoading(true);
    setError(null); // Clear any previous errors

    try {
      // This single fetch now gets all the data, including the counts and points
      const fetchedData = await fetchvolunteerData();

      if (fetchedData) {
        setVolunteer(fetchedData);
      } else {
        setError("Failed to load volunteer data or no record found.");
        setVolunteer(null);
      }
    } catch (err) {
      const typedError = err as Error;
      setError(typedError.message || "An unexpected error occurred while fetching volunteer data.");
      setVolunteer(null);
    } finally {
      setLoading(false); // Always stop loading, regardless of success or failure
    }
  }, []); // No external dependencies for this function

  useEffect(() => {
    loadVolunteerData(); // Run this effect once on component mount
  }, [loadVolunteerData]); // Dependent on loadVolunteerData (which is memoized by useCallback)

  return { volunteer, loading, error };
}