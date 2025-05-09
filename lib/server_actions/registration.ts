// lib/server_action/registration.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { RegistrationData } from "@/types/registrationTypes";
import { validateRegistrationData, processNewRegistration, processRegistrationUpdate } from "../registration-services/main";

interface ProcessedPlayerData {
  index: number;
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
  student_id_url: File | null;
}

interface ProcessedRegistrationData {
  universityName: string;
  universityCity: string;
  universityState: string;
  universityLogo: File;
  teamName: string;
  teamLogo: File;
  referralCode: string;
  players: ProcessedPlayerData[];
  files: { file: File; originalIndex: number; field: "student_id_url" }[];
}

export async function processRegistrationFormData(formData: FormData): Promise<ProcessedRegistrationData> {
  const universityName = formData.get("university_name") as string;
  const universityCity = formData.get("university_city") as string;
  const universityState = formData.get("university_state") as string;
  const universityLogo = formData.get("university_logo");
  const teamName = formData.get("team_name") as string;
  const teamLogo = formData.get("team_logo");
  const referralCode = formData.get("referral_code") as string || "";

  if (!(universityLogo instanceof File)) {
    throw new Error("University logo must be a valid image file");
  }

  if (!(teamLogo instanceof File)) {
    throw new Error("Team logo must be a valid image file");
  }

  const players: ProcessedPlayerData[] = [];
  const files: { file: File; originalIndex: number; field: "student_id_url" }[] = [];

  for (let i = 1; i <= 7; i++) {
    const playerName = formData.get(`player${i}_name`) as string;
    const playerRole = formData.get(`player${i}_role`) as string;

    if (i > 5 && !playerName && !playerRole) {
         continue;
    }

    if (i === 1 && !playerRole) {
       console.warn("Captain data submitted without a role field.");
    }

    const studentIdFile = formData.get(`player${i}_student_id_url`);

    if (studentIdFile instanceof File) {
      files.push({ file: studentIdFile, originalIndex: i, field: "student_id_url" });
    }

    players.push({
      index: i,
      name: playerName || "",
      ign: formData.get(`player${i}_ign`) as string || "",
      game_id: formData.get(`player${i}_game_id`) as string || "",
      server_id: formData.get(`player${i}_server_id`) as string || "",
      role: playerRole as ProcessedPlayerData["role"] || (i === 1 ? "captain" : i === 6 ? "substitute" : i === 7 ? "coach" : "player"),
      email: formData.get(`player${i}_email`) as string || "",
      mobile: formData.get(`player${i}_mobile`) as string || "",
      city: formData.get(`player${i}_city`) as string || "",
      state: formData.get(`player${i}_state`) as string || "",
      device: formData.get(`player${i}_device`) as string || "",
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

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) {
      return {
        success: false,
        message: userError?.message || "Please sign in to register your team."
      };
    }

    let processedData: ProcessedRegistrationData;
    try {
      processedData = await processRegistrationFormData(formData);

       const mainPlayersCount = processedData.players.filter(p => p.index >= 1 && p.index <= 5).length;
       if (mainPlayersCount < 5) {
           return { success: false, message: "Please complete details for at least the main 5 players." };
       }

    } catch (processingError) {
      console.error("Form data processing error:", processingError);
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

    const registrationData: RegistrationData = {
      universityName: processedData.universityName,
      universityState: processedData.universityState,
      universityCity: processedData.universityCity,
      universityLogo: processedData.universityLogo,
      teamName: processedData.teamName,
      teamLogo: processedData.teamLogo,
      referralCode: processedData.referralCode,
      players: processedData.players.map((player) => ({
        index: player.index,
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
        student_id_url: processedData.files.find(f => f.originalIndex === player.index)?.file || null
      }))
    };

    try {
      validateRegistrationData(registrationData);
    } catch (validationError) {
      console.error("Validation error in service:", validationError);
      return {
        success: false,
        message: validationError instanceof Error ? validationError.message : "Invalid registration data. Please check all fields."
      };
    }


    // Check if a university with the submitted details already exists
    let universityId: string | null = null;
    const { data: existingUniversity, error: universityError } = await supabase
      .from("universities")
      .select("id")
      .eq("name", registrationData.universityName)
      .eq("city", registrationData.universityCity)
      .eq("state", registrationData.universityState)
      .single();

    if (universityError && universityError.code !== 'PGRST116') { // PGRST116 means 'not found'
       console.error("Supabase error checking existing university:", universityError);
       return { success: false, message: "Failed to check for existing university information: " + universityError.message };
    }

    if (existingUniversity) {
      universityId = existingUniversity.id;
    }


    // Check if the current user has an existing team
    const { data: existingTeamForUser, error: teamForUserError } = await supabase
      .from("teams")
      .select("id, university_id")
      .eq("user_id", user.id)
      .single();

    if (teamForUserError && teamForUserError.code !== 'PGRST116') { // PGRST116 means 'not found'
       console.error("Supabase error checking existing team for user:", teamForUserError);
       return { success: false, message: "Failed to check for your existing team registration status: " + teamForUserError.message };
    }


    // Check if a team with this name already exists globally
    const { data: existingTeamWithName, error: teamNameError } = await supabase
      .from("teams")
      .select("id")
      .eq("name", registrationData.teamName)
      .single(); // Assuming team names must be unique globally

    if (teamNameError && teamNameError.code !== 'PGRST116') { // PGRST116 means 'not found'
       console.error("Supabase error checking existing team name:", teamNameError);
       return { success: false, message: "Failed to check for existing team name: " + teamNameError.message };
    }

    if (existingTeamWithName) {
       // A team with the desired name exists. Check if it's the current user's team.
       if (!existingTeamForUser || existingTeamWithName.id !== existingTeamForUser.id) {
           console.warn(`Duplicate team name attempt: "${registrationData.teamName}" by user ${user.id}`);
           return { success: false, message: `The team name "${registrationData.teamName}" is already registered by another team. Please choose a different name.` };
       }
    }


    // Proceed with Update vs. New Registration based on existingTeamForUser
    if (existingTeamForUser) {
      // Update existing registration
      try {
        await processRegistrationUpdate(registrationData, existingTeamForUser.university_id, existingTeamForUser.id, user.id);
        return {
          success: true,
          message: "Your team registration has been successfully updated!"
        };
      } catch (error: unknown) {
        console.error("Update registration error in service:", error);
        if (error instanceof Error) {
            return { success: false, message: error.message };
        }
        return {
           success: false,
           message: "An unexpected error occurred during update. Please try again."
        };
      }
    } else {
      // Create new registration
      try {
        await processNewRegistration(registrationData, user.id, universityId); // Pass determined universityId

        return {
          success: true,
          message: "Your team has been successfully registered! You'll receive a confirmation email shortly."
        };
      } catch (error: unknown) {
        console.error("New registration error in service:", error);
         if (error instanceof Error) {
            return { success: false, message: error.message };
        }
         return {
           success: false,
           message: "An unexpected error occurred during registration. Please try again."
        };
      }
    }
  } catch (error: unknown) {
    console.error("General registration process error:", error);
    return {
      success: false,
      message: error instanceof Error ?
        `Registration error: ${error.message}` :
        "An unexpected server error occurred. Please try again or contact support."
    };
  }
}

