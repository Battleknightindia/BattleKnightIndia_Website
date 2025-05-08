// lib/server_action/registration.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { RegistrationData } from "@/types/registrationTypes";
import { validateRegistrationData, processNewRegistration, processRegistrationUpdate } from "../registration-services/main";

// Define ProcessedPlayerData type - Add originalIndex
interface ProcessedPlayerData {
  index: number; // Add original 1-based index
  name: string;
  ign: string;
  game_id: string; // Keep as game_id/server_id to match incoming FormData
  server_id: string; // Keep as game_id/server_id to match incoming FormData
  role: "captain" | "player" | "substitute" | "coach";
  email: string;
  mobile: string;
  city: string;
  state: string;
  device: string;
  student_id_url: File | null; // Keep as File | null
}

// Define ProcessedRegistrationData type - Store originalIndex in files
interface ProcessedRegistrationData {
  universityName: string;
  universityCity: string;
  universityState: string;
  universityLogo: File;
  teamName: string;
  teamLogo: File;
  referralCode: string;
  players: ProcessedPlayerData[]; // ProcessedPlayerData now includes index
  files: { file: File; originalIndex: number; field: "student_id_url" }[]; // Store original 1-based index
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
    throw new Error("University logo must be a valid image file"); // Or handle as a client validation error
  }
  if (!(teamLogo instanceof File)) {
    throw new Error("Team logo must be a valid image file"); // Or handle as a client validation error
  }

  const players: ProcessedPlayerData[] = [];
  const files: { file: File; originalIndex: number; field: "student_id_url" }[] = []; // Use originalIndex

  // Process player data from form - Loop from 1 to 7 to match client FormData keys
  for (let i = 1; i <= 7; i++) {
    // Check for the presence of a key that indicates this player section was potentially filled.
    // 'role' is a good candidate as it's set for all player types on the client side.
    // If player 1's (captain's) role is missing, something is fundamentally wrong,
    // but for optional players (6, 7), check if *any* key exists before processing.
    // A simpler check might be to see if at least the 'name' field exists for players > 1.
    const playerName = formData.get(`player${i}_name`) as string;
    const playerRole = formData.get(`player${i}_role`) as string;

    // If this is not the captain (i > 1) and there's no name or role, skip processing this player.
    // This assumes Captain data (i=1) will always have at least a role from client-side defaults.
    if (i > 1 && !playerName && !playerRole) {
         continue; 
    }
     // If it is the captain (i=1) and there's no role, something is wrong.
    if (i === 1 && !playerRole) {
       console.warn("Captain data submitted without a role field.");
       // Optionally, throw an error or handle appropriately
    }


    const studentIdFile = formData.get(`player${i}_student_id_url`);

    // Check if a file was provided and if it is a File instance
    if (studentIdFile instanceof File) {
      files.push({ file: studentIdFile, originalIndex: i, field: "student_id_url" }); // Store original 1-based index
    }

    players.push({
      index: i, // Store the original 1-based index
      name: playerName || "", // Provide default empty string if null
      ign: formData.get(`player${i}_ign`) as string || "",
      game_id: formData.get(`player${i}_game_id`) as string || "",
      server_id: formData.get(`player${i}_server_id`) as string || "",
      role: playerRole as ProcessedPlayerData["role"] || (i === 1 ? "captain" : i === 6 ? "substitute" : i === 7 ? "coach" : "player"), // Default role if somehow missing
      email: formData.get(`player${i}_email`) as string || "",
      mobile: formData.get(`player${i}_mobile`) as string || "",
      city: formData.get(`player${i}_city`) as string || "",
      state: formData.get(`player${i}_state`) as string || "",
      device: formData.get(`player${i}_device`) as string || "",
      student_id_url: studentIdFile instanceof File ? studentIdFile : null, // Assign the file or null
    });
  }

   // After the loop, ensure the players array has at least 5 main players if needed by downstream validation.
   // The validateRegistrationData function should ideally handle this check.
   // If you need to guarantee 7 player objects are pushed (even if empty for optional players),
   // adjust the loop continuation logic. The current logic only pushes players for whom
   // at least a name or role was provided (or the captain).

  return {
    universityName,
    universityCity,
    universityState,
    universityLogo,
    teamName,
    teamLogo,
    referralCode,
    players, // This array might have fewer than 7 elements if optional players were skipped
    files,
  };
}

export async function registerTeam(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient();

    // Get user session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) {
      // Added explicit check for specific Supabase auth errors if needed, but generic is often fine.
      return {
        success: false,
        message: userError?.message || "Please sign in to register your team."
      };
    }

    // Extract and process form data
    let processedData: ProcessedRegistrationData;
    try {
      processedData = await processRegistrationFormData(formData);

       // Ensure minimum required players (e.g., 5 main players) are present
       // This check could be here or in validateRegistrationData. Let's put it here for clarity
       // before mapping, as the mapping assumes player data exists.
       const mainPlayersCount = processedData.players.filter(p => p.index >= 1 && p.index <= 5).length;
       if (mainPlayersCount < 5) {
           // This error message aligns with client-side validation
           return { success: false, message: "Please complete details for at least the main 5 players." };
       }


    } catch (processingError) {
      console.error("Form data processing error:", processingError);
       // Catch specific errors from processRegistrationFormData like missing logos
      if (processingError instanceof Error && (processingError.message.includes("logo must be a valid"))) {
         return {
           success: false,
           message: processingError.message
         };
      }
      return {
        success: false,
        message: processingError instanceof Error ?
          processingError.message :
          "Failed to process form data. Please check all fields and try again."
      };
    }

    // Map processed data to match RegistrationData type
    // Use the original index from processedData.players
    const registrationData: RegistrationData = {
      universityName: processedData.universityName,
      universityState: processedData.universityState,
      universityCity: processedData.universityCity,
      universityLogo: processedData.universityLogo, // This is a File object
      teamName: processedData.teamName,
      teamLogo: processedData.teamLogo, // This is a File object
      referralCode: processedData.referralCode,
      players: processedData.players.map((player) => ({
        // Use the original 1-based index
        index: player.index,
        name: player.name,
        ign: player.ign,
        gameId: player.game_id, // Mapping from game_id to gameId
        serverId: player.server_id, // Mapping from server_id to serverId
        role: player.role,
        email: player.email,
        mobile: player.mobile,
        city: player.city,
        state: player.state,
        device: player.device,
        // Find the file using the player's original 1-based index
        student_id_url: processedData.files.find(f => f.originalIndex === player.index)?.file || null
      }))
    };

    // Validate registration data using the service function
    try {
      // validateRegistrationData should check for required fields, files (based on role/index), sizes etc.
      validateRegistrationData(registrationData); 
    } catch (validationError) {
      console.error("Validation error in service:", validationError);
      // Pass the specific validation error message back to the client
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

    // Handle errors other than 'not found'
    if (teamError && teamError.code !== 'PGRST116') { 
      console.error("Supabase error checking existing team:", teamError);
      throw new Error("Failed to check existing team registration: " + teamError.message);
    }

    if (existingTeam) {
      // Update existing registration
      try {
        // The service function processRegistrationUpdate should handle file uploads/updates
        await processRegistrationUpdate(registrationData, existingTeam.university_id, existingTeam.id, user.id);
        return {
          success: true,
          message: "Your team registration has been successfully updated!"
        };
      } catch (error: unknown) {
        console.error("Update registration error in service:", error);
         // Catch and re-throw or return specific service errors
        if (error instanceof Error) {
           // Service function should throw specific errors for clarity (e.g., "Storage upload failed: ...")
            return { success: false, message: error.message };
        }
        // Generic fallback
        return {
           success: false, 
           message: "An unexpected error occurred during update. Please try again."
        };
      }
    } else {
      // Create new registration
      try {
         // The service function processNewRegistration should handle file uploads
        await processNewRegistration(registrationData, user.id);
        return {
          success: true,
          message: "Your team has been successfully registered! You'll receive a confirmation email shortly."
        };
      } catch (error: unknown) {
        console.error("New registration error in service:", error);
        // Catch and re-throw or return specific service errors
        if (error instanceof Error) {
           // Service function should throw specific errors (e.g., "Duplicate team name: ...", "Storage upload failed: ...")
            return { success: false, message: error.message };
        }
         // Generic fallback
        return {
           success: false, 
           message: "An unexpected error occurred during registration. Please try again."
        };
      }
    }
  } catch (error: unknown) {
    // This catch block handles errors *not* specifically caught above, e.g.,
    // errors thrown by the `throw new Error(...)` statements or unexpected issues.
    console.error("General registration process error:", error);
    return {
      success: false,
      message: error instanceof Error ?
        `Registration error: ${error.message}` :
        "An unexpected server error occurred. Please try again or contact support."
    };
  }
}
