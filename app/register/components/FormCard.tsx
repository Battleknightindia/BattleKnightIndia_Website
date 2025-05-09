// ./app/register/components/FormCard.tsx
"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import { GroupStepper } from "./Progress";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import Step Components
import Step1 from "./steps/Step1";
import Step2 from "./steps/Step2";
import Step3 from "./steps/Step3";
import Step4 from "./steps/Step4";

import { registerTeam } from "@/lib/server_actions/registration";
import {
  Player,
  UniversityStepData,
  TeamStepData,
  RegistrationFormData,
  PlayersStepData
} from "@/types/registrationTypes";

// Helper function to save form data to localStorage
const saveFormToLocalStorage = (formData: RegistrationFormData) => {
  const storableData = {
    ...formData,
    university: {
      ...formData.university,
      logo: null, // Don't store File objects
    },
    team: {
      ...formData.team,
      logo: null, // Don't store File objects
    },
    players: Object.fromEntries(
      Object.entries(formData.players).map(([key, player]) => [
        key,
        {
          ...player,
          student_id_url: null, // Don't store File objects
        },
      ])
    ),
  };
  localStorage.setItem("registrationFormData", JSON.stringify(storableData));
};

const defaultPlayer: Player = {
  name: "",
  ign: "",
  game_id: "",
  server_id: "",
  role: "player",
  email: "",
  mobile: "",
  city: "",
  state: "",
  device: "",
  student_id_url: null,
};

// Helper function to load form data from localStorage
const loadFormFromLocalStorage = (): Partial<RegistrationFormData> | null => {
  const saved = localStorage.getItem("registrationFormData");
  if (!saved) return null;

  try {
      const parsed = JSON.parse(saved);
       // Ensure parsed.players is an object before Object.entries
      const parsedPlayers = typeof parsed.players === 'object' && parsed.players !== null ? parsed.players : {};

      return {
        university: parsed.university || { name: "", city: "", state: "", logo: null },
        team: parsed.team || { name: "", logo: null, referral_code: "" },
        players: Object.fromEntries(
          Object.entries(parsedPlayers).map(([key, playerData]) => {
            const player = playerData as Partial<Player>;
            return [
              key,
              {
                ...defaultPlayer,
                ...player,
                // Ensure File objects are null since they can't be stored in localStorage
                student_id_url: null,
              }
            ];
          })
        ),
        termsAccepted: parsed.termsAccepted || false
      };
  } catch (e) {
      console.error("Failed to parse localStorage data:", e);
      return null; // Return null if parsing fails
  }
};


const FormContent = ({}: Record<string, never>): React.ReactElement => {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState<number>(1);
  const pathname = usePathname();

  const [formData, setFormData] = useState<RegistrationFormData>({
    university: { name: "", city: "", state: "", logo: null },
    team: { name: "", logo: null, referral_code: "" },
    players: {},
    termsAccepted: false,
  });

  // Load saved form data on component mount
  useEffect(() => {
    const savedData = loadFormFromLocalStorage();
    if (savedData) {
      setFormData((prevData: RegistrationFormData) => {
        const newPlayers: PlayersStepData = {}; // Start with an empty object or default structure

        // Iterate over all possible player keys (1-7) to ensure all players are considered
        // whether they were in saved data, previous state, or are just defaults.
        // Using keys 1 through 7 explicitly for structure.
        const allPlayerKeys = Array.from({ length: 7 }, (_, i) => (i + 1).toString());

        allPlayerKeys.forEach(key => {
            const prevPlayer = prevData.players[key];
            const savedPlayer = (savedData.players || {})[key]; // Ensure savedData.players is treated as an object

            // Determine the player's role based on key, falling back to saved/default if needed
             let role: Player["role"] = defaultPlayer.role;
             if (key === "1") role = "captain";
             else if (key === "6") role = "substitute";
             else if (key === "7") role = "coach";


            newPlayers[key] = {
                ...defaultPlayer, // Start with defaults
                role: role, // Set role based on key
                ...(savedPlayer || {}), // Apply saved non-file data (will overwrite default text fields if saved)
                // Correctly prioritize the File object from the previous state if it exists,
                // otherwise fall back to null (which is what savedPlayer has for files).
                student_id_url: prevPlayer?.student_id_url instanceof File ? prevPlayer.student_id_url : null
                // Note: savedPlayer?.student_id_url will always be null from localStorage,
                // so explicitly setting null as the fallback is correct.
             };

             // Ensure default role is correctly applied if player object wasn't saved at all
             if (!savedPlayer && !prevPlayer) {
                 newPlayers[key].role = role;
             }
        });


        return {
          ...prevData, // Spread previous state
          university: { ...prevData.university, ...savedData.university }, // Overwrite with merged university
          team: { ...prevData.team, ...savedData.team }, // Overwrite with merged team
          players: newPlayers, // Overwrite with merged players
          termsAccepted: savedData.termsAccepted ?? prevData.termsAccepted, // Use saved terms if available, else prev
        };
      });
    }
  }, []); // Depend only on initial mount (empty array)


  const [isSubmittingFinal, setIsSubmittingFinal] = useState<boolean>(false);
  const [finalSubmitError, setFinalSubmitError] = useState<string | null>(null);

  const handleDataChange = (
    step: "university" | "team",
    field: keyof UniversityStepData | keyof TeamStepData,
    value: string | File | null
  ): void => {
    setFormData((prevData: RegistrationFormData) => {
      const newData = {
        ...prevData,
        [step]: {
          ...prevData[step],
          [field]: value,
        } as RegistrationFormData[typeof step],
      };
      saveFormToLocalStorage(newData);
      return newData;
    });
    setFinalSubmitError(null);
  };

  const handlePlayerDataChange = (
    playerIndex: number, // This index is 0-based from Step3 component
    field: keyof Player,
    value: string | File | null
  ): void => {
    const stateKey = (playerIndex + 1).toString(); // Convert 0-based index to 1-based string key

    setFormData((prevData: RegistrationFormData) => {
      const playerToUpdate = prevData.players[stateKey];
      // Determine the role based on key if the player object doesn't exist yet
      let role: Player["role"] = defaultPlayer.role;
      if (stateKey === "1") role = "captain";
      else if (stateKey === "6") role = "substitute";
      else if (stateKey === "7") role = "coach";


      const newData = {
        ...prevData,
        players: {
          ...prevData.players,
          [stateKey]: {
            ...(playerToUpdate || { role: role }), // Use existing data if available, otherwise default with role
            [field]: value,
            // If the field is student_id_url and value is null, explicitly set to null (handles clearing)
            ...(field === 'student_id_url' && value === null ? { student_id_url: null } : {})
             // Note: If value is a File, it's correctly assigned by [field]: value
          } as Player,
        },
      };
      saveFormToLocalStorage(newData);
      return newData;
    });
    setFinalSubmitError(null);
  };


  const handleTermsChange = (accepted: boolean): void => {
    setFormData((prevData: RegistrationFormData) => {
      const newData = {
        ...prevData,
        termsAccepted: accepted,
      };
      saveFormToLocalStorage(newData);
      return newData;
    });
    setFinalSubmitError(null);
  };

  // Clean up localStorage after successful submission
  const clearSavedForm = () => {
    localStorage.removeItem("registrationFormData");
  };

  const handleNextStep = (): void => {
    setFinalSubmitError(null);

    let validationError: string | null = null;
    const MAX_FILE_SIZE = 200 * 1024; // 200 KB

    switch (activeStep) {
      case 1:
        if (!formData.university.name) validationError = "University Name is required.";
        if (!validationError && !formData.university.city) validationError = "City is required.";
        if (!validationError && !formData.university.state) validationError = "State is required.";
        if (!validationError && !formData.university.logo) validationError = "University Logo is required.";
        // --- File Size Validation for University Logo ---
        // Check size ONLY if a File object is present
        if (!validationError && formData.university.logo instanceof File && formData.university.logo.size > MAX_FILE_SIZE) {
            validationError = `University Logo size exceeds the limit (${MAX_FILE_SIZE / 1024}KB).`;
        }
        // --- End File Size Validation ---
        break;
      case 2:
        if (!formData.team.name) validationError = "Team Name is required.";
        if (!validationError && !formData.team.logo) validationError = "Team Logo is required.";
         // --- File Size Validation for Team Logo ---
         // Check size ONLY if a File object is present
        if (!validationError && formData.team.logo instanceof File && formData.team.logo.size > MAX_FILE_SIZE) {
             validationError = `Team Logo size exceeds the limit (${MAX_FILE_SIZE / 1024}KB).`;
         }
         // --- End File Size Validation ---
        break;
      case 3:
        const basicRequiredFields = [
          "name",
          "ign",
          "game_id",
          "server_id",
          "city",
          "state",
          "device"
        ];

        const emailMobileFields = ["email", "mobile"];

        // Validate main players (1-5)
        for (let i = 0; i < 5; i++) {
          const playerKey = (i + 1).toString();
          const player = formData.players[playerKey];
          const displayName = i === 0 ? "Captain" : `Player ${i + 1}`;
          const isCaptain = i === 0;

          // Check if player object exists (basic requirement for players 1-5)
          if (!player) {
            validationError = `${displayName} information is required.`;
            break;
          }

          // Check basic required fields for all players 1-5
          for (const field of basicRequiredFields) {
            if (!player[field as keyof Player]) {
              validationError = `${field
                .replace("_", " ")
                .toUpperCase()} is required for ${displayName}.`;
              break;
            }
          }
          if (validationError) break; // Exit inner field loop

          // Check student ID for players 1-5 (now required for all of them, INCLUDING CAPTAIN)
          if (player.student_id_url === null) {
             validationError = `Student ID proof (JPG/PNG/PDF) is required for ${displayName}.`;
             break; // Exit the loop for players 1-5
          }
           // --- File Size Validation for Student ID (Players 1-5) ---
           // Check size ONLY if a File object is present
           if (player.student_id_url instanceof File && player.student_id_url.size > MAX_FILE_SIZE) {
                validationError = `${displayName} Student ID proof size exceeds the limit (${MAX_FILE_SIZE / 1024}KB).`;
                break; // Exit the loop
           }
           // --- End File Size Validation ---


          // Check email and mobile only for captain (player 1)
          if (isCaptain) {
            for (const field of emailMobileFields) {
              if (!player[field as keyof Player]) {
                validationError = `${field.toUpperCase()} is required for Captain.`;
                break;
              }
            }
            if (validationError) break; // Exit inner field loop
          }

          if (validationError) break; // Stop checking main players if an error is found
        }

        // If no validation error for main players, check substitute and coach
        if (!validationError) {
          // Validate substitute (player 6) if any data or file is filled
          const substitute = formData.players["6"];
           if (substitute) { // Check if the substitute object exists
              const requiredSubstituteFields = [
                "name", "ign", "game_id", "server_id", "city", "state", "device"
              ];
              const subHasBasicData = requiredSubstituteFields.some(field =>
                substitute[field as keyof Player] !== null &&
                substitute[field as keyof Player] !== undefined &&
                substitute[field as keyof Player] !== ""
              );
              const subHasFile = substitute.student_id_url instanceof File;

              // If the substitute has *any* basic data OR a file, then validate them
              if (subHasBasicData || subHasFile) {
                 // Require basic fields if basic data was provided
                 if (subHasBasicData) {
                    for (const field of requiredSubstituteFields) {
                      if (!substitute[field as keyof Player]) {
                         validationError = `${field.replace('_', ' ').toUpperCase()} is required for Substitute if any basic information is provided.`;
                         break;
                      }
                    }
                 }
                 if (validationError) break; // Exit if basic fields validation failed

                 // Require the file itself if *any* data (basic or file) was provided
                 if (!subHasFile) {
                    validationError = `Student ID proof (JPG/PNG/PDF) is required for Substitute if any information is provided.`;
                 }
                  if (validationError) break; // Exit if file is missing

                 // --- File Size Validation for Student ID (Substitute) ---
                 // Check size ONLY if a file is actually present - FIX APPLIED HERE
                 if (substitute.student_id_url instanceof File && substitute.student_id_url.size > MAX_FILE_SIZE) {
                     validationError = `Substitute Student ID proof size exceeds the limit (${MAX_FILE_SIZE / 1024}KB).`;
                 }
                  if (validationError) break; // Exit if file size is too large
              }
           }
        }

        // If no validation error so far, check coach (player 7)
        if (!validationError) {
          const coach = formData.players["7"];
           if (coach) { // Check if the coach object exists
              const requiredCoachFields = ["name", "email", "mobile"]; // Adjusted required fields for coach
              const optionalCoachFields = ["ign", "game_id", "server_id"]; // Optional text fields
              const coachHasRequiredBasicData = requiredCoachFields.some(field =>
                coach[field as keyof Player] !== null &&
                coach[field as keyof Player] !== undefined &&
                coach[field as keyof Player] !== ""
              );
              const coachHasOptionalBasicData = optionalCoachFields.some(field =>
                  coach[field as keyof Player] !== null &&
                  coach[field as keyof Player] !== undefined &&
                  coach[field as keyof Player] !== ""
              );
              const coachHasFile = coach.student_id_url instanceof File;

              // If the coach has *any* required basic data, optional basic data, OR a file, then validate them
              if (coachHasRequiredBasicData || coachHasOptionalBasicData || coachHasFile) {
                 // Require basic email/mobile fields IF any text data was filled
                 if(coachHasRequiredBasicData || coachHasOptionalBasicData) {
                    for (const field of requiredCoachFields) {
                      if (!coach[field as keyof Player]) {
                        validationError = `${field.replace('_', ' ').toUpperCase()} is required for Coach if any information is provided.`;
                        break;
                      }
                    }
                 }
                 if (validationError) break; // Exit if basic fields validation failed

                 // Student ID is optional for Coach, so no requirement check here (!coachHasFile).

                 // --- File Size Validation for Coach ID (Coach) ---
                 // Check size ONLY if a file is actually present - FIX APPLIED HERE
                 if (coach.student_id_url instanceof File && coach.student_id_url.size > MAX_FILE_SIZE) {
                     validationError = `Coach ID proof size exceeds the limit (${MAX_FILE_SIZE / 1024}KB).`;
                 }
                  if (validationError) break; // Exit if file size is too large
              }
           }
        }
        break;
      case 4:
        // Check terms accepted - already present
        if (!formData.termsAccepted) {
          validationError = "You must accept the terms and conditions.";
        }
        // Note: File size validation could also be added here as a final check
        // for all files (uni logo, team logo, all players) before submitting,
        // in case the user bypassed step-by-step validation somehow.
        // Keeping it on next step as requested.
        break;
      default:
        console.warn("handleNextStep called on unhandled step:", activeStep);
        break;
    }

    if (validationError) {
      setFinalSubmitError(validationError);
      return;
    }

    // If validation passes for the current step, move to the next
    if (activeStep < 4) {
      setActiveStep((prev: number) => prev + 1);
    }
     // If activeStep is 4 and validation passed, the submit button's
     // type="submit" will trigger handleFinalSubmit.
  };

  const handleFinalSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setFinalSubmitError(null);

    // Re-validate terms just in case
    if (!formData.termsAccepted) {
      setFinalSubmitError("You must accept the terms and conditions.");
      return;
    }

     // Re-validate other steps before final submission, just to be safe
     let finalValidationErrors: string | null = null;
     const MAX_FILE_SIZE = 200 * 1024; // 200 KB // Define again for this function

     // Check step 1 validity (presence and type)
     if (!formData.university.name || !formData.university.city || !formData.university.state || !(formData.university.logo instanceof File)) {
         finalValidationErrors = "Please complete Step 1 (University Details).";
     }
      // Add file size check here for robustness, in case handleNextStep was bypassed
      if (!finalValidationErrors && formData.university.logo instanceof File && formData.university.logo.size > MAX_FILE_SIZE) {
          finalValidationErrors = `University Logo size exceeds the limit (${MAX_FILE_SIZE / 1024}KB). Please go back to Step 1.`;
      }


     // Check step 2 validity (presence and type)
     if (!finalValidationErrors && (!formData.team.name || !(formData.team.logo instanceof File))) {
         finalValidationErrors = "Please complete Step 2 (Team Details).";
     }
      // Add file size check here for robustness
      if (!finalValidationErrors && formData.team.logo instanceof File && formData.team.logo.size > MAX_FILE_SIZE) {
        finalValidationErrors = `Team Logo size exceeds the limit (${MAX_FILE_SIZE / 1024}KB). Please go back to Step 2.`;
       }

     // Check step 3 (basic check for main players)
     const mainPlayersFilled = [1, 2, 3, 4, 5].every(index => formData.players[index.toString()]?.name);
     if (!finalValidationErrors && !mainPlayersFilled) {
         finalValidationErrors = "Please complete Step 3 (Player Details) for at least the main 5 players.";
     }

      // Explicit check for mandatory players' student IDs (Captain + Players 2-5)
      // Add file size check here for robustness
      if (!finalValidationErrors) {
          for (let i = 0; i < 5; i++) {
              const playerKey = (i + 1).toString();
              const player = formData.players[playerKey];
              const displayName = i === 0 ? "Captain" : `Player ${i + 1}`;

              if (!player || player.student_id_url === null) {
                 finalValidationErrors = `Student ID proof is required for ${displayName}. Please go back to Step 3.`;
                 break;
              }
               if (player.student_id_url instanceof File && player.student_id_url.size > MAX_FILE_SIZE) {
                    finalValidationErrors = `${displayName} Student ID proof size exceeds the limit (${MAX_FILE_SIZE / 1024}KB). Please go back to Step 3.`;
                    break;
               }
          }
      }

       // Optional players (Substitute/Coach): if file is provided, check size
        if (!finalValidationErrors) {
            const optionalPlayerKeys = ["6", "7"];
            for (const key of optionalPlayerKeys) {
                const player = formData.players[key];
                 // Check size ONLY if a File object is present
                 if (player?.student_id_url instanceof File && player.student_id_url.size > MAX_FILE_SIZE) {
                     const displayName = key === "6" ? "Substitute" : "Coach";
                      finalValidationErrors = `${displayName} ID proof size exceeds the limit (${MAX_FILE_SIZE / 1024}KB). Please go back to Step 3.`;
                      break;
                 }
            }
        }


     if (finalValidationErrors) {
        setFinalSubmitError(finalValidationErrors);
        // Optionally, navigate the user back to the incomplete step
        if (finalValidationErrors.includes("Step 1")) setActiveStep(1);
        else if (finalValidationErrors.includes("Step 2")) setActiveStep(2);
        else if (finalValidationErrors.includes("Step 3")) setActiveStep(3);
         return;
     }


    setIsSubmittingFinal(true);
    const finalFormData = new FormData();

    try {
      // Prepare university data
      finalFormData.append("university_name", formData.university.name);
      finalFormData.append("university_city", formData.university.city);
      finalFormData.append("university_state", formData.university.state);
      if (formData.university.logo instanceof File) {
        finalFormData.append("university_logo", formData.university.logo);
      }

      // Prepare team data
      finalFormData.append("team_name", formData.team.name);
      if (formData.team.logo instanceof File) {
        finalFormData.append("team_logo", formData.team.logo);
      }
      if (formData.team.referral_code) {
        finalFormData.append("referral_code", formData.team.referral_code);
      }

      // Prepare player text data
      // Iterate through keys "1" through "7"
      for (let i = 1; i <= 7; i++) {
        const player = formData.players[i.toString()];
        if (player) {
          finalFormData.append(`player${i}_role`, player.role);
          // Only append if the value is not null/undefined and not an empty string,
          // except for file fields which are handled separately below
	  if (i > 5 && !player.name){
           continue;
	  }
          if (player.name) finalFormData.append(`player${i}_name`, player.name);
          if (player.ign) finalFormData.append(`player${i}_ign`, player.ign);
          if (player.game_id) finalFormData.append(`player${i}_game_id`, player.game_id);
          if (player.server_id) finalFormData.append(`player${i}_server_id`, player.server_id);
          if (player.email) finalFormData.append(`player${i}_email`, player.email);
          if (player.mobile) finalFormData.append(`player${i}_mobile`, player.mobile);
          if (player.city) finalFormData.append(`player${i}_city`, player.city);
          if (player.state) finalFormData.append(`player${i}_state`, player.state);
          if (player.device) finalFormData.append(`player${i}_device`, player.device);
          // Note: student_id_url is intentionally skipped here as it's a File and handled next
        }
      }

      // Add player files to formData
      const playerFiles = Object.entries(formData.players)
         // Filter for entries that have a player object and the student_id_url is a File
        .filter((entry): entry is [string, Player] => entry[1] !== undefined && entry[1]?.student_id_url instanceof File)
        // Map to extract the file and the correct player index
        .map(([key, p]) => {
          const playerIndex = parseInt(key, 10); // Get the player index from the key ("1", "2", etc.)
          // Ensure the parsed index is valid and the file exists
          if (!isNaN(playerIndex) && p.student_id_url instanceof File) {
             return {
               file: p.student_id_url,
               index: playerIndex, // Use the actual player index from the key
               field: "student_id_url" as const
             };
          }
           return null; // Should be filtered out by the .filter() above, but good practice
        })
        // Filter out any potential nulls if the filter/map logic was complex
        .filter((item): item is NonNullable<typeof item> => item !== null);


      playerFiles.forEach(({ file, index }) => {
         // Double check it's a File before appending (already done in filter but safety)
        if (file instanceof File) {
          finalFormData.append(`player${index}_student_id_url`, file);
        }
      });

      const result = await registerTeam(finalFormData);

      if (result.success) {
        clearSavedForm(); // Clear saved form data on successful submission
        router.push("/register/success");
      } else {
        // Handle specific error cases
        if (result.message?.toLowerCase().includes("sign in")) {
          router.push("/login?redirect=/register");
          return;
        }
        setFinalSubmitError(result.message || "Registration failed. Please try again.");
         // If submission failed, save the form data again just in case
         saveFormToLocalStorage(formData);
      }
    } catch (error: unknown) { // Explicitly type error as unknown
      // When 'error' is 'unknown', you must narrow its type before accessing properties like 'message'.
      console.error("Registration submission error:", error);
      setFinalSubmitError(
        error instanceof Error // Type narrowing check
          ? error.message
          : "An unexpected error occurred. Please try again or contact support."
      );
       // If submission failed, save the form data again just in case
       saveFormToLocalStorage(formData);
    } finally {
      setIsSubmittingFinal(false);
    }
  };
  
  const handleEdit = (section: string, index?: number | null): void => {
    setFinalSubmitError(null);

    switch (section) {
      case "university":
        setActiveStep(1);
        // Optionally, redirect with params if needed, but usually navigating to step is enough
        // router.push(`${pathname}?section=university`);
        break;
      case "team":
        setActiveStep(2);
         // Optionally, redirect with params
        // router.push(`${pathname}?section=team`);
        break;
      case "players":
        setActiveStep(3);
        // If editing players general section, just go to step 3
        // router.push(`${pathname}?section=players`);
        break;
      case "player":
        if (index !== undefined && index !== null && index >= 1 && index <= 7) {
          setActiveStep(3);
          // Redirect with params to potentially scroll to the player section in Step3
          const params = new URLSearchParams();
          params.set("section", "player");
          params.set("index", index.toString());
          router.push(`${pathname}?${params.toString()}`);
        } else {
          console.error("Invalid player index provided for edit:", index);
          setActiveStep(3); // Default to player step if index is bad
          router.push(pathname);
        }
        break;
      default:
        console.warn("Attempted to edit unknown section:", section);
        break;
    }
  };
  
  const renderStepComponent = (): React.ReactNode => {
    switch (activeStep) {
      case 1:
        return (
          <Step1
            data={formData.university}
            onDataChange={(field, value) =>
              handleDataChange(
                "university",
                field as keyof UniversityStepData,
                value
              )
            }
          />
        );
      case 2:
        return (
          <Step2
            data={formData.team}
            onDataChange={(field, value) =>
              handleDataChange("team", field as keyof TeamStepData, value)
            }
          />
        );
      case 3:
        return (
          <Step3
            data={formData.players}
            onDataChange={handlePlayerDataChange}
          />
        );
      case 4:
        return (
          <Step4
            data={formData}
            termsAccepted={formData.termsAccepted}
            onTermsChange={handleTermsChange}
            onEdit={handleEdit}
            isSubmitting={isSubmittingFinal}
          />
        );
      default:
        return null;
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50, transition: { duration: 0.3 } },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } },
  };

  return (
    <form onSubmit={handleFinalSubmit}>
      <Card className="w-[375px] bg-[#111828] border-none rounded-none rounded-t-lg text-white">
        <CardHeader className="flex items-center">
          <Image
            src="/WhatsApp_Image_2025-04-11_at_19.41.11_2d73c2c3-removebg-preview 12.svg"
            alt="logo"
            width={150}
            height={150}
            className="-my-10 pb-7"
          />
          <CardDescription className="text-center">
            Complete all sections to register your team for the tournament
          </CardDescription>
          <div className="w-[375px] py-0.5 border-2 border-[#363636] rounded-md">
            <GroupStepper
              activeStep={activeStep}
              setActiveStep={setActiveStep}
            />
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-6 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {renderStepComponent()}
            </motion.div>
          </AnimatePresence>

          {finalSubmitError && (
            <div className="text-red-500 text-sm text-center mt-2 p-2 bg-red-50 rounded border border-red-200">
              {finalSubmitError}
            </div>
          )}

          <div className="flex justify-between mt-6">
            <Button
              type="button"
              onClick={() => setActiveStep((prev: number) => Math.max(1, prev - 1))}
              className="bg-transparent font-bold text-white"
              disabled={activeStep === 1 || isSubmittingFinal}
            >
              Previous
            </Button>

            <Button
              type={activeStep === 4 ? "submit" : "button"}
              onClick={activeStep === 4 ? undefined : handleNextStep}
              className="bg-[#FFAE00] font-bold text-white"
              disabled={
                (activeStep === 4 && !formData.termsAccepted) ||
                isSubmittingFinal
              }
            >
              {isSubmittingFinal ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting
                  Registration...
                </>
              ) : activeStep === 4 ? (
                "Submit Registration"
              ) : (
                "Next Step"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default function FormCard(): React.ReactElement {
  return <FormContent />;
}
