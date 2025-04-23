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
    .eq("profile_id", user.id)
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

    return result.data ;
}
