"use client";

import { createClient } from "@/utils/supabase/client";
import { viewprofileSchema } from "@/schema/profileSchema";
import { COLORS } from "@/lib/constant/profile";

export async function fetchProfile() {
  const supabase = createClient();
  // Get User Id from supabase
  const {data: { user },error: userError} = await supabase.auth.getUser();
  if (userError || !user) {
    console.error("User fetch failed:", userError);
    return null;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error || !profile) {
    console.error("Profile fetch failed:", error);
    return null;
  }

  const result = viewprofileSchema.safeParse(profile);
  console.log(result);
  console.log(result.data);
  if (!result.success) {
    console.error("Validation failed:", result.error);
    return null;
  }

  console.log(result.data);
  // Also return roles as string array split by comma
  return {
    ...result.data,
    // Just return the roles array directly from the parsed data
    roles: result.data.roles,
  };
}

// Get a consistent gradient color for the avatar
export async function getAvatarColor(): Promise<string> {
  const data = await fetchProfile();
  const identifier = data?.ign || "unknown";

  const hash = Array.from(identifier).reduce(
    (acc, char) => char.charCodeAt(0) + ((acc << 5) - acc),
    0
  );

  return COLORS[hash % COLORS.length];
}

// Generate initials from IGN or fallback to email
export async function getInitials(): Promise<string> {
  const data = await fetchProfile();
  if (!data) return "??";

  const ign = data.ign?.trim();
  const parts = ign.split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0][0].toUpperCase();
}

export async function getAvatarUrl(): Promise<string | null> {
  const data = await fetchProfile();
  const avatarUrl = data?.avatar_url;
  // If no avatar URL is available, return null or a fallback URL
  if (!avatarUrl) {
    console.log("no image found");
    return null; // Or you can return a default avatar image URL
  }

  return avatarUrl;
}
