import { createClient } from "@/utils/supabase/server";
import { viewprofileSchema } from "../../schema/profileSchema";
import { COLORS } from "../constant/profile";

export async function fetchProfile() {
  const supabase = await createClient();
  const {data: {user}} = await supabase.auth.getUser();

  if(user){
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
  return null
}

// Get a consistent gradient color for the avatar
export async function getAvatarColor(ign:string): Promise<string> {
  const identifier = ign || "unknown";

  const hash = Array.from(identifier).reduce(
    (acc, char) => char.charCodeAt(0) + ((acc << 5) - acc),
    0
  );

  return COLORS[hash % COLORS.length];
}

// Generate initials from IGN or fallback to email
export async function getInitials(ign:string): Promise<string> {
  if (!ign) return "??";

  const name = ign?.trim();
  const parts = name.split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0][0].toUpperCase();
}
