// lib/server_action/registration.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { RegistrationData } from "@/types/registrationTypes";
import { validateRegistrationData, processNewRegistration, processRegistrationUpdate } from "../registration-services/main";

// Define ProcessedPlayerData type based on the player data structure used in the code
interface ProcessedPlayerData {
  name: string;
  ign: string;
  game_id: string;
  server_id: string;
  role: "captain" | "player" | "substitute" | "coach";
  email: string;
  mobile: string;
  city: string;
  state: string;
  device: string;
}

// Define ProcessedRegistrationData type based on the return type structure
interface ProcessedRegistrationData {
  universityName: string;
  universityCity: string;
  universityState: string;
  universityLogo: File;
  teamName: string;
  teamLogo: File;
  referralCode: string;
  players: ProcessedPlayerData[];
  files: { file: File; index: number; field: "student_id" }[];
}

export async function processRegistrationFormData(formData: FormData): Promise<ProcessedRegistrationData> {
  const universityName = formData.get("university_name") as string;
  const universityCity = formData.get("university_city") as string;
  const universityState = formData.get("university_state") as string;
  const universityLogo = formData.get("university_logo") as File;
  const teamName = formData.get("team_name") as string;
  const teamLogo = formData.get("team_logo") as File;
  const referralCode = formData.get("referral_code") as string || "";

  const players: ProcessedPlayerData[] = [];
  const files: { file: File; index: number; field: "student_id" }[] = [];

  // Process player data from form
  for (let i = 0; i < 7; i++) {
    const role = formData.get(`player${i}_role`);
    if (!role) continue;

    const studentIdFile = formData.get(`player${i}_student_id`) as File;
    if (studentIdFile instanceof File) {
      files.push({ file: studentIdFile, index: i, field: "student_id" });
    }

    players.push({
      name: formData.get(`player${i}_name`) as string,
      ign: formData.get(`player${i}_ign`) as string,
      game_id: formData.get(`player${i}_game_id`) as string,
      server_id: formData.get(`player${i}_server_id`) as string,
      role: role as ProcessedPlayerData["role"],
      email: formData.get(`player${i}_email`) as string,
      mobile: formData.get(`player${i}_mobile`) as string,
      city: formData.get(`player${i}_city`) as string,
      state: formData.get(`player${i}_state`) as string,
      device: formData.get(`player${i}_device`) as string,
    });
  }

  return {
    universityName,
    universityCity,
    universityState,
    universityLogo,
    teamName,
    teamLogo,
    referralCode,
    players,
    files,
  };
}

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

    // Extract and process form data
    const processedData = await processRegistrationFormData(formData);
    
    // Map processed data to match RegistrationData type
    const registrationData: RegistrationData = {
      universityName: processedData.universityName,
      universityState: processedData.universityState,
      universityCity: processedData.universityCity,
      universityLogo: processedData.universityLogo,
      teamName: processedData.teamName,
      teamLogo: processedData.teamLogo,
      referralCode: processedData.referralCode,
      players: processedData.players.map((player, index) => ({
        index,
        name: player.name,
        ign: player.ign,
        gameId: player.game_id,
        serverId: player.server_id,
        role: player.role,
        email: player.email,
        mobile: player.mobile,
        city: player.city,
        state: player.state,
        device: player.device,
        studentId: processedData.files.find(f => f.index === index)?.file || null
      }))
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
