// Returns the profile if is_volunteer is true, otherwise null
import { Database } from "@/types/supabase";

export type ProfileItem = Database["public"]["Tables"]["profiles"]["Row"]
export type ProfileType = Pick<
  ProfileItem,
  | "avatar_url"
  | "city"
  | "fullName"
  | "game_id"
  | "ign"
  | "is_volunteer"
  | "roles"
  | "server_id"
  | "state"
  | "is_admin"
>;

export function getVolunteerProfile(profile: ProfileType) {
  if (profile && profile.is_volunteer) {
    return profile;
  }
  return null;
}

// Returns true if the profile is a volunteer
export function isVolunteer(profile: ProfileType | null): boolean {
  return !!(profile && profile.is_volunteer);
}

export function isAdmin(profile:ProfileType | null): boolean{
  return !!(profile && profile.is_admin);
}
