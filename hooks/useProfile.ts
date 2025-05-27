"use client";

import { useState, useEffect } from "react";
import { fetchProfile } from "@/lib/data/profile_data";
import { ProfileType } from "@/utils/volunteer_helper";

export function useProfile() {
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await fetchProfile();
        setProfile(
          data
            ? {
                ...data,
                avatar_url: data.avatar_url ?? null,
                city: data.city ?? null,
                state: data.state ?? null,
              }
            : null
        );
      } catch (err) {
        const typedError = err as Error;
        setError(typedError.message);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);
  return { profile, loading, error };
}
