// ./app/step2/FormCard.tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import { GroupStepper } from "./Progress";
// Removed unused import: useSearchParams
import { useRouter, usePathname } from "next/navigation"; // Removed useSearchParams
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

// Import Step Components (ensure they are refactored to accept data/onDataChange)
import Step1 from "./steps/Step1";
import Step2 from "./steps/Step2";
import Step3 from "./steps/Step3";
import Step4 from "./steps/Step4"; // Step4 will display all data

import { registerTeam } from "@/lib/server_actions/registration"; // Updated import

// Import Player type and RegistrationFormData
// Ensure TeamStepData includes referral_code: string | null;
import {
  Player,
  UniversityStepData,
  TeamStepData,
  RegistrationFormData,
} from "@/types/registrationTypes";
import { Button } from "@/components/ui/button";

function FormContent() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(1);
  const pathname = usePathname(); // <-- Call the hook

  // Removed unused searchParams variable
  // const searchParams = useSearchParams();

  // Master state holding data for all steps
  // --- Update initial state to include referral_code ---
  const [formData, setFormData] = useState<RegistrationFormData>({
    university: { name: "", city: "", state: "", logo: null }, // No ID initialized here as it's received only on final submit
    team: { name: "", logo: null, referral_code: "" }, // Initialize referral_code field
    players: {}, // Initialize players state
    termsAccepted: false,
  });
  // --- End Update initial state ---

  // State for managing the FINAL submission loading/errors
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false); // Renamed state
  const [finalSubmitError, setFinalSubmitError] = useState<string | null>(null); // Renamed state

  // Handler to update data for a specific step slice (university, team)
  // --- handleDataChange already correctly handles 'referral_code' for 'team' ---
  // Changed 'value: any' to 'value: string | File | null' for better type safety
  const handleDataChange = (
    step: "university" | "team",
    field: keyof UniversityStepData | keyof TeamStepData, // This type union includes 'referral_code' if TeamStepData has it
    value: string | File | null // Specify expected types
  ): void => {
    setFormData((prevData) => ({
      ...prevData,
      [step]: {
        ...prevData[step],
        [field as keyof RegistrationFormData[typeof step]]: value,
      } as RegistrationFormData[typeof step],
    }));
    setFinalSubmitError(null); // Clear error when data changes
  };
  // --- End handleDataChange ---

  // Handler to update player data in the master state (Step3)
  // Changed 'value: any' to 'value: string | File | null' for better type safety
  const handlePlayerDataChange = (
    playerIndex: number,
    field: keyof Player,
    value: string | File | null // Specify expected types
  ): void => {
    const stateKey = (playerIndex + 1).toString();

    let role: Player["role"] = "player";
    if (playerIndex === 0) role = "captain";
    else if (playerIndex === 5) role = "substitute";
    else if (playerIndex === 6) role = "coach";

    setFormData((prevData) => ({
      ...prevData,
      players: {
        ...prevData.players,
        [stateKey]: {
          ...(prevData.players[stateKey] || { role: role }),
          [field as keyof Player]: value,
        } as Player,
      },
    }));
    setFinalSubmitError(null); // Clear error when data changes
  };

  // Handler specifically for termsAccepted (used in Step4)
  const handleTermsChange = (accepted: boolean): void => {
    setFormData((prevData) => ({
      ...prevData,
      termsAccepted: accepted,
    }));
    setFinalSubmitError(null);
  };

  // --- Handler for "Next Step" Button (Frontend Navigation Only) ---
  // This function ONLY performs frontend validation and moves to the next step.
  // It does NOT call any Server Actions for steps 1-3.
  // Handler for "Next Step" Button (Update Step 3 Validation)
  const handleNextStep = (): void => {
    setFinalSubmitError(null);

    let validationError: string | null = null;

    switch (activeStep) {
      case 1:
        if (!formData.university.name)
          validationError = "University Name is required.";
        if (!formData.university.city) validationError = "City is required.";
        if (!formData.university.logo) validationError = "Logo is required.";
        if (!formData.university.state) validationError = "State is required.";
        break;
      case 2:
        if (!formData.team.name) validationError = "Team Name is required.";
        if (!formData.team.logo)
          validationError = "Team Logo is required."
        // Referral code is optional, no validation needed here
        break;
      case 3:
        // --- Update Step 3 Validation based on NEW Player Schema ---
        // Validate required fields for ALL players who are *included* in the state.
        // The form currently presents Captain (index 0), Players (1-4), Sub (5), Coach (6).
        // Players 0-4 are required; Sub and Coach are optional based on data entry.
        // Check NOT NULL fields for players 0-6 if their data object exists in state.
        for (let i = 0; i < 7; i++) {
          const player = formData.players[(i + 1).toString()];
          const displayName = `Player ${i + 1}`; // Use simple display name for validation messages

          // Only validate if data for this player index exists in the state
          // Optional players (5, 6) are validated only if they have *any* data entered.
          const isOptionalRoleWithData =
            (i === 5 || i === 6) &&
            player &&
            (player.name ||
              player.ign ||
              player.game_id ||
              player.server_id ||
              player.email ||
              player.mobile ||
              player.city ||
              player.state ||
              player.device ||
              player.picture_url ||
              player.student_id_url);
          const isRequiredRole = i >= 0 && i <= 4;

          if (isRequiredRole || isOptionalRoleWithData) {
            // Check required fields for this player based on DB schema
            if (!player || !player.name) {
              validationError = `Name is required for ${displayName}.`;
              break;
            }
            if (!player.ign) {
              validationError = `IGN is required for ${displayName}.`;
              break;
            }
            
            if (!player.student_id_url){
              validationError = `ID
              is required for ${displayName}.`;
              break;
            }
            
            if (!player.picture_url){
              validationError = `Picture is required for ${displayName}.`;
              break;
            }
            
            if (!player.game_id) {
              validationError = `Game ID is required for ${displayName}.`;
              break;
            }
            
            if (!player.server_id) {
              validationError = `Server ID is required for ${displayName}.`;
              break;
            }
            // Role should always be set by the form's logic based on index, but check defensively
            if (!player.role) {
              validationError = `Role is missing for ${displayName}.`;
              break;
            }

            // Check Captain/Coach specific required fields if they exist in state
            if (i === 0 && (!player.email || !player.mobile)) {
              validationError = `Email and Mobile are required for the Captain.`;
              break;
            }
            if (
              i === 6 &&
              player &&
              (player.name ||
                player.ign ||
                player.game_id ||
                player.server_id ||
                player.email ||
                player.mobile ||
                player.city ||
                player.state ||
                player.device ||
                player.picture_url ||
                player.student_id_url) &&
              (!player.email || !player.mobile)
            ) {
              validationError = `Email and Mobile are required for the Coach.`;
              break;
            }
          } else if (isRequiredRole && !player) {
            // Handle the case where a required player (0-4) has no data object in state at all
            validationError = `Missing data for required ${displayName}.`;
            break;
          }
        }

        // After checking all players, ensure at least 5 required players (0-4) have data
        const requiredPlayersCount = Object.entries(formData.players).filter(
          ([key, player]) => {
            const index = parseInt(key, 10) - 1;
            // Count required players (0-4) who have a data object and required fields
            return (
              index >= 0 &&
              index <= 4 &&
              player &&
              player.name &&
              player.ign &&
              player.game_id &&
              player.server_id &&
              player.role
            );
          }
        ).length;
        if (requiredPlayersCount < 5) {
          // Refine message - this check might be redundant if loop catches missing fields individually
          // validationError = validationError || "You must provide complete data for at least 5 players (Captain + 4 Players).";
        }

        // Ensure Captain has email/mobile
        const captainData = formData.players["1"];
        if (captainData && (!captainData.email || !captainData.mobile)) {
          validationError =
            validationError || "Captain's Email and Mobile are required.";
        }
        // Ensure Coach has email/mobile IF coach data exists
        const coachDataCheck = formData.players["7"];
        if (
          coachDataCheck &&
          (coachDataCheck.name ||
            coachDataCheck.ign ||
            coachDataCheck.game_id ||
            coachDataCheck.server_id ||
            coachDataCheck.email ||
            coachDataCheck.mobile ||
            coachDataCheck.city ||
            coachDataCheck.state ||
            coachDataCheck.device ||
            coachDataCheck.picture_url ||
            coachDataCheck.student_id_url) &&
          (!coachDataCheck.email || !coachDataCheck.mobile)
        ) {
          validationError =
            validationError ||
            "Coach's Email and Mobile are required if coach details are provided.";
        }

        // --- End Update Step 3 Validation ---
        break;
      case 4:
        if (!formData.termsAccepted) {
          validationError = "You must accept the terms and conditions.";
        }
        break;
      default:
        console.warn("handleNextStep called on unhandled step:", activeStep);
        break;
    }

    if (validationError) {
      setFinalSubmitError(validationError);
      return;
    }

    if (activeStep < 4) {
      setActiveStep((prev) => prev + 1);
    }
  };

  // --- Handler for the Final "Submit Registration" Button (Step 4) ---
  const handleFinalSubmit = async (e: React.FormEvent) => {
    console.log("[handleFinalSubmit] Function started.");
    console.log("[handleFinalSubmit] Event received:", e);

    e.preventDefault();
    console.log("[handleFinalSubmit] Default event prevented.");

    setFinalSubmitError(null);

    console.log("[handleFinalSubmit] Checking terms acceptance.");
    if (!formData.termsAccepted) {
      setFinalSubmitError("You must accept the terms and conditions.");
      console.log(
        "[handleFinalSubmit] Terms not accepted. Setting error and returning."
      );
      return;
    }
    console.log("[handleFinalSubmit] Terms accepted. Proceeding.");

    setIsSubmittingFinal(true);
    console.log("[handleFinalSubmit] Setting isSubmittingFinal to true.");

    console.log("[handleFinalSubmit] Preparing FormData...");
    const finalFormData = new FormData();

    // Append University Data
    finalFormData.append("university_name", formData.university.name);
    finalFormData.append("university_city", formData.university.city);
    finalFormData.append("university_state", formData.university.state);
    if (formData.university.logo instanceof File) {
      finalFormData.append("university_logo", formData.university.logo);
    }

    // Append Team Data
    finalFormData.append("team_name", formData.team.name);
    if (formData.team.logo instanceof File) {
      finalFormData.append("team_logo", formData.team.logo);
    }
    if (formData.team.referral_code) {
      finalFormData.append('referral_code', formData.team.referral_code);
    }

    // Append Players Data
    for (let i = 0; i < 7; i++) {
      const player = formData.players[(i + 1).toString()];
      if (player) {
        finalFormData.append(`player${i}_role`, player.role);
        finalFormData.append(`player${i}_name`, player.name);
        finalFormData.append(`player${i}_ign`, player.ign);
        if (player.game_id)
          finalFormData.append(`player${i}_game_id`, player.game_id);
        if (player.server_id)
          finalFormData.append(`player${i}_server_id`, player.server_id);
        if (player.email)
          finalFormData.append(`player${i}_email`, player.email);
        if (player.mobile)
          finalFormData.append(`player${i}_mobile`, player.mobile);
        if (player.city) finalFormData.append(`player${i}_city`, player.city);
        if (player.state)
          finalFormData.append(`player${i}_state`, player.state);
        if (player.device)
          finalFormData.append(`player${i}_device`, player.device);
        if (player.picture_url instanceof File) {
          finalFormData.append(`player${i}_picture`, player.picture_url);
        }
        if (player.student_id_url instanceof File) {
          finalFormData.append(`player${i}_student_id`, player.student_id_url);
        }
      }
    }

    try {
      console.log("[handleFinalSubmit] Attempting to call registerTeam...");
      const result = await registerTeam(finalFormData);
      console.log("[handleFinalSubmit] Registration complete. Result:", result);

      if (result.success) {
        alert(result.message);
        router.push("/register/success");
      } else {
        setFinalSubmitError(result.message);
      }
    } catch (error) {
      console.error("[handleFinalSubmit] Error during registration:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during registration.";
      setFinalSubmitError(errorMessage);
    } finally {
      setIsSubmittingFinal(false);
    }
  };

  // Refined handleEdit function
  const handleEdit = (section: string, index?: number | null): void => {
    setFinalSubmitError(null);

    switch (section) {
      case "university":
        setActiveStep(1);
        // --- Use 'pathname' instead of 'router.pathname' ---
        router.push(pathname); // <-- Use the variable from usePathname
        // --- End use 'pathname' ---
        break;
      case "team":
        setActiveStep(2);
        // --- Use 'pathname' ---
        router.push(pathname); // <-- Use the variable
        // --- End use 'pathname' ---
        break;
      case "players":
        setActiveStep(3);
        // If you need to scroll to a specific player, you might manage
        // a state here and pass it to Step3
        break;
      case "player":
        if (index !== undefined && index !== null && index >= 1 && index <= 7) {
          setActiveStep(3);
          const params = new URLSearchParams();
          params.set("section", "player");
          params.set("index", index.toString());
          // --- Use 'pathname' ---
          router.push(`${pathname}?${params.toString()}`); // <-- Use the variable
          // --- End use 'pathname' ---
        } else {
          console.error("Invalid player index provided for edit:", index);
          setActiveStep(3);
          // --- Use 'pathname' ---
          router.push(pathname); // <-- Use the variable
          // --- End use 'pathname' ---
        }
        break;
      default:
        console.warn("Attempted to edit unknown section:", section);
        break;
    }
  };

  // Render the correct step component, passing data and handlers
  const renderStepComponent = () => {
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
            data={formData.team} // Pass the team data slice
            onDataChange={(field, value) =>
              handleDataChange("team", field as keyof TeamStepData, value)
            } // Pass the handler
          />
        );
      case 3:
        return (
          <Step3
            data={formData.players} // <-- Pass the players data slice from master state
            onDataChange={handlePlayerDataChange} // <-- Pass the handler to update player data
          />
        );
      case 4:
        // Step4 receives all accumulated data for review
        return (
          <Step4
            data={formData} // Pass all data for review
            // Pass the termsAccepted state and its setter
            termsAccepted={formData.termsAccepted}
            onTermsChange={handleTermsChange}
            onEdit={handleEdit}
            isSubmitting={isSubmittingFinal} // Pass final submit loading state
          />
        );
      default:
        return null;
    }
  };

  // Animation variants for the steps container
  const stepVariants = {
    hidden: { opacity: 0, x: 50, transition: { duration: 0.3 } },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } },
  };

  return (
    // The main <form> element wraps the entire step content and has onSubmit for the final button
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
            {/* Stepper */}
            <GroupStepper
              activeStep={activeStep}
              setActiveStep={setActiveStep}
            />
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-6 overflow-hidden">
          {/* Step Content with Animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {renderStepComponent()} {/* Render the current step component */}
            </motion.div>
          </AnimatePresence>

          {/* Display Parent-level Error */}
          {finalSubmitError && (
            <div className="text-red-500 text-sm text-center mt-2">
              {finalSubmitError}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              type="button" // Previous button is always type="button"
              onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
              className="bg-transparent font-bold text-white"
              disabled={activeStep === 1 || isSubmittingFinal} // Disable on first step or while final submitting
            >
              Previous
            </Button>

            {/* Next Step or Submit Registration Button */}
            <Button
              type={activeStep === 4 ? "submit" : "button"} // Final step is type="submit", others are "button"
              // Call handleNextStep directly for steps 1-3 (frontend validation & navigation)
              // Step 4 button relies on form's onSubmit which calls handleFinalSubmit
              onClick={activeStep === 4 ? undefined : handleNextStep}
              className="bg-[#FFAE00] font-bold text-white"
              // Disable if on final step and terms not accepted, or if final submission is in progress
              disabled={
                (activeStep === 4 && !formData.termsAccepted) ||
                isSubmittingFinal
              }
            >
              {/* Button text changes based on active step and final submission state */}
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
}

export default function FormCard() {
  return <FormContent />;
}

// --- TODO: Refactor Step3 and Step4 if not already done ---
// Step3.tsx needs to accept 'data' (formData.players), 'onDataChange' (handlePlayerDataChange),
// but doesn't strictly need teamId/universityId *props* for editing.
// Step4 needs to accept 'data' (all formData), 'termsAccepted', 'onTermsChange', and 'onEdit'.
