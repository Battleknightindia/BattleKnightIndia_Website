// lib/server_action/registration.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { RegistrationData } from "@/types/registrationTypes";
import { validateRegistrationData, processNewRegistration, processRegistrationUpdate } from "../registration-services/main";

export async function registerTeam(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();

    // Get user session using auth.getUser()
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) {
      throw new Error("Authentication required");
    }

    // Extract form data
    const registrationData: RegistrationData = {
      universityName: formData.get("university_name") as string,
      universityState: formData.get("university_state") as string,
      universityCity: formData.get("university_city") as string,
      universityLogo: formData.get("university_logo") as File | null,
      teamName: formData.get("team_name") as string,
      teamLogo: formData.get("team_logo") as File | null,
      referralCode: formData.get("referral_code") as string,
      players: Array.from({ length: 7 }, (_, i) => ({
        index: i,
        name: formData.get(`player${i}_name`) as string,
        ign: formData.get(`player${i}_ign`) as string,
        gameId: formData.get(`player${i}_game_id`) as string,
        serverId: formData.get(`player${i}_server_id`) as string,
        role: formData.get(`player${i}_role`) as "captain" | "player" | "substitute" | "coach",
        email: formData.get(`player${i}_email`) as string | null,
        mobile: formData.get(`player${i}_mobile`) as string | null,
        city: formData.get(`player${i}_city`) as string | null,
        state: formData.get(`player${i}_state`) as string | null,
        device: formData.get(`player${i}_device`) as string | null,
        picture: formData.get(`player${i}_picture`) as File | null,
        studentId: formData.get(`player${i}_student_id`) as File | null,
      })).filter(player => 
        player.name || 
        player.ign || 
        player.gameId || 
        player.serverId || 
        player.email || 
        player.mobile
      ),
    };
    
    // Validate registration data
    validateRegistrationData(registrationData);

    // Check if university and team already exist for this user
    const { data: existingTeam } = await supabase
      .from("teams")
      .select("id, university_id")
      .eq("user_id", user.id)
      .single();

    if (existingTeam) {
      // Update existing registration
      await processRegistrationUpdate(supabase, JSON.stringify(registrationData), existingTeam.university_id, existingTeam.id);
      return {
        success: true,
        message: "Team registration updated successfully!",
      };
    } else {
      // Create new registration
      await processNewRegistration(supabase, JSON.stringify(registrationData));
      return {
        success: true,
        message: "Team registered successfully!",
      };
    }
  } catch (error: any) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: error.message || "Registration failed. Please try again.",
    };
  }
}
