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
      return {
        success: false,
        message: "Please sign in to register your team."
      };
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
    try {
      validateRegistrationData(registrationData);
    } catch (validationError) {
      return {
        success: false,
        message: validationError instanceof Error ? validationError.message : "Invalid registration data. Please check all fields."
      };
    }

    // Check if university and team already exist for this user
    const { data: existingTeam, error: teamError } = await supabase
      .from("teams")
      .select("id, university_id")
      .eq("user_id", user.id)
      .single();

    if (teamError && teamError.code !== 'PGRST116') {  // PGRST116 is the "not found" error
      throw new Error("Failed to check existing team registration");
    }

    if (existingTeam) {
      // Update existing registration
      try {
        await processRegistrationUpdate(registrationData, existingTeam.university_id, existingTeam.id, user.id);
        return {
          success: true,
          message: "Your team registration has been successfully updated!"
        };
      } catch (error) {
        // Handle specific error types
        if (error instanceof Error) {
          if (error.message.includes("auth")) {
            return {
              success: false,
              message: "Your session has expired. Please sign in again."
            };
          }
          if (error.message.includes("storage") || error.message.includes("upload")) {
            return {
              success: false,
              message: "Failed to upload files. Please check your image files and try again."
            };
          }
          return {
            success: false,
            message: error.message
          };
        }
        throw error;
      }
    } else {
      // Create new registration
      try {
        await processNewRegistration(registrationData, user.id);
        return {
          success: true,
          message: "Your team has been successfully registered! You'll receive a confirmation email shortly."
        };
      } catch (error) {
        // Handle specific error types
        if (error instanceof Error) {
          if (error.message.includes("auth")) {
            return {
              success: false,
              message: "Your session has expired. Please sign in again."
            };
          }
          if (error.message.includes("storage") || error.message.includes("upload")) {
            return {
              success: false,
              message: "Failed to upload files. Please check your image files and try again."
            };
          }
          if (error.message.includes("duplicate")) {
            return {
              success: false,
              message: "This team or university name is already registered. Please use a different name."
            };
          }
          return {
            success: false,
            message: error.message
          };
        }
        throw error;
      }
    }
  } catch (error) {
    console.error("Registration error:", error);
    
    return {
      success: false,
      message: error instanceof Error 
        ? `Registration error: ${error.message}`
        : "An unexpected error occurred. Please try again or contact support."
    };
  }
}
