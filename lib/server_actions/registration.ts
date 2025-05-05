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
  student_id_url: File | null; // Keep as File | null as it might be null
  index?: number; // Optional index for player identification
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
  files: { file: File; index: number; field: "student_id_url" }[];
}

export async function processRegistrationFormData(formData: FormData): Promise<ProcessedRegistrationData> {
  const universityName = formData.get("university_name") as string;
  const universityCity = formData.get("university_city") as string;
  const universityState = formData.get("university_state") as string;
  const universityLogo = formData.get("university_logo");
  const teamName = formData.get("team_name") as string;
  const teamLogo = formData.get("team_logo");
  const referralCode = formData.get("referral_code") as string || "";

  // Validate file uploads for university and team logos (assuming these are always required and must be files)
  if (!(universityLogo instanceof File)) {
    throw new Error("University logo must be a valid image file");
  }
  if (!(teamLogo instanceof File)) {
    throw new Error("Team logo must be a valid image file");
  }

  const players: ProcessedPlayerData[] = [];
  const files: { file: File; index: number; field: "student_id_url" }[] = [];

  // Process player data from form
  for (let i = 0; i < 7; i++) {
    const role = formData.get(`player${i}_role`);
    if (!role) continue;

    const studentIdFile = formData.get(`player${i}_student_id_url`);

    // Check if a file was provided and if it is a File instance
    // If it is a File, add it to the files array for later upload processing.
    // The validation check for whether the student ID is *required*
    // or if it must be a *valid image* is removed here as requested.
    if (studentIdFile instanceof File) {
      files.push({ file: studentIdFile, index: i, field: "student_id_url" });
    } 
    // Removed: else if (i !== 0 && i !== 6) { ... throw error ... }

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
      // Assign the file if it's a File instance, otherwise null
      student_id_url: studentIdFile instanceof File ? studentIdFile : null,
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
    try {
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
          // student_id_url comes from the files array, populated in processRegistrationFormData
          // based on whether a valid File was provided.
          student_id_url: processedData.files.find(f => f.index === index)?.file || null
        }))
      };

      // Validate registration data
      try {
        validateRegistrationData(registrationData);
      } catch (validationError) {
        console.error("Validation error:", validationError);
        // Note: validateRegistrationData might still throw errors if it has its own checks
        // like ensuring required fields are present, even if file type isn't checked here.
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
        } catch (error: unknown) {
          console.error("Update registration error:", error);
          if (error instanceof Error) {
            // Keep specific error handling for auth, storage/upload, and potential other errors
            if (error.message.includes("auth")) {
              return {
                success: false,
                message: "Your session has expired. Please sign in again."
              };
            }
            if (error.message.includes("storage") || error.message.includes("upload")) {
               const errorMessage = error.message.includes("size") ? 
                error.message : 
                "Failed to upload files. Please ensure all files are valid images under 5MB.";
              return {
                success: false,
                message: errorMessage
              };
            }
             // This check is less likely to be hit now that processRegistrationFormData
             // doesn't throw this specific error, but keeping it doesn't hurt.
             // validateRegistrationData or processing functions might still throw similar errors.
            if (error.message.includes("Student ID") || error.message.includes("Captain")) {
              return {
                success: false,
                message: error.message
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
        } catch (error: unknown) {
          console.error("New registration error:", error);
          if (error instanceof Error) {
             // Keep specific error handling for auth, storage/upload, duplicate, and potential other errors
            if (error.message.includes("auth")) {
              return {
                success: false,
                message: "Your session has expired. Please sign in again."
              };
            }
            if (error.message.includes("storage") || error.message.includes("upload")) {
               const errorMessage = error.message.includes("size") ? 
                error.message : 
                "Failed to upload files. Please ensure all files are valid images under 5MB.";
              return {
                success: false,
                message: errorMessage
              };
            }
            if (error.message.includes("duplicate")) {
              return {
                success: false,
                message: "This team or university name is already registered. Please use a different name."
              };
            }
            // This check is less likely to be hit now, see comment above.
            if (error.message.includes("Student ID") || error.message.includes("Captain")) {
              return {
                success: false,
                message: error.message
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
    } catch (processingError) {
      console.error("Form data processing error:", processingError);
      // This catch block will no longer receive the "Student ID... valid image file" error
      // from processRegistrationFormData, but might catch other processing errors.
      return {
        success: false,
        message: processingError instanceof Error ? 
          processingError.message : 
          "Failed to process form data. Please check all fields and try again."
      };
    }
  } catch (error: unknown) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: error instanceof Error ? 
        `Registration error: ${error.message}` : 
        "An unexpected error occurred. Please try again or contact support."
    };
  }
}
