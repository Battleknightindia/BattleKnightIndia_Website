// ./app/step2/FormCard.tsx
"use client";

import Image from "next/image";
import React, { useState } from "react";
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
} from "@/types/registrationTypes";

function FormContent({}: Record<string, never>): React.ReactElement {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState<number>(1);
  const pathname = usePathname();

  const [formData, setFormData] = useState<RegistrationFormData>({
    university: { name: "", city: "", state: "", logo: null },
    team: { name: "", logo: null, referral_code: "" },
    players: {},
    termsAccepted: false,
  });

  const [isSubmittingFinal, setIsSubmittingFinal] = useState<boolean>(false);
  const [finalSubmitError, setFinalSubmitError] = useState<string | null>(null);

  const handleDataChange = (
    step: "university" | "team",
    field: keyof UniversityStepData | keyof TeamStepData,
    value: string | File | null
  ): void => {
    setFormData((prevData: RegistrationFormData) => ({
      ...prevData,
      [step]: {
        ...prevData[step],
        [field]: value,
      } as RegistrationFormData[typeof step],
    }));
    setFinalSubmitError(null);
  };

  const handlePlayerDataChange = (
    playerIndex: number,
    field: keyof Player,
    value: string | File | null
  ): void => {
    const stateKey = (playerIndex + 1).toString();

    let role: Player["role"] = "player";
    if (playerIndex === 0) role = "captain";
    else if (playerIndex === 5) role = "substitute";
    else if (playerIndex === 6) role = "coach";

    setFormData((prevData: RegistrationFormData) => ({
      ...prevData,
      players: {
        ...prevData.players,
        [stateKey]: {
          ...(prevData.players[stateKey] || { role: role }),
          [field]: value,
        } as Player,
      },
    }));
    setFinalSubmitError(null);
  };

  const handleTermsChange = (accepted: boolean): void => {
    setFormData((prevData: RegistrationFormData) => ({
      ...prevData,
      termsAccepted: accepted,
    }));
    setFinalSubmitError(null);
  };

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
        if (!formData.team.logo) validationError = "Team Logo is required.";
        break;
      case 3:
        const basicRequiredFields = [
          "name",
          "ign",
          "game_id",
          "server_id",
          "city",
          "state",
          "device",
        ];

        const emailMobileFields = ["email", "mobile"];

        // Validate main players (1-5)
        for (let i = 0; i < 5; i++) {
          const player = formData.players[(i + 1).toString()];
          const displayName = `Player ${i + 1}`;
          const isCaptain = i === 0;

          // Check basic required fields for all players
          for (const field of basicRequiredFields) {
            if (!player || !player[field as keyof Player]) {
              validationError = `${field
                .replace("_", " ")
                .toUpperCase()} is required for ${displayName}.`;
              break;
            }
          }

          // Check email and mobile only for captain
          if (isCaptain) {
            for (const field of emailMobileFields) {
              if (!player || !player[field as keyof Player]) {
                validationError = `${field.toUpperCase()} is required for Captain.`;
                break;
              }
            }
          }

          if (validationError) break;
        }

        if (!validationError) {
          // Validate substitute (player 6) if any data is filled
          const substitute = formData.players["6"];
          if (substitute) {
            const hasAnySubstituteData = Object.values(substitute).some(
              (value) => value !== null && value !== undefined && value !== ""
            );

            if (hasAnySubstituteData) {
              // If any substitute data is entered, validate only basic fields (no email/mobile)
              for (const field of basicRequiredFields) {
                if (!substitute[field as keyof Player]) {
                  validationError = `${field
                    .replace("_", " ")
                    .toUpperCase()} is required for Substitute.`;
                  break;
                }
              }
            }
          }
        }

        if (!validationError) {
          // Validate coach (player 7) if any data is filled
          const coach = formData.players["7"];
          if (coach) {
            const hasAnyCoachData = Object.values(coach).some(
              (value) => value !== null && value !== undefined && value !== ""
            );

            if (hasAnyCoachData) {
              // If any coach data is entered, validate all basic fields
              for (const field of basicRequiredFields) {
                if (!coach[field as keyof Player]) {
                  validationError = `${field
                    .replace("_", " ")
                    .toUpperCase()} is required for Coach.`;
                  break;
                }
              }
              // Also validate email and mobile for coach
              for (const field of emailMobileFields) {
                if (!coach[field as keyof Player]) {
                  validationError = `${field.toUpperCase()} is required for Coach.`;
                  break;
                }
              }
            }
          }
        }
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

  const handleFinalSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setFinalSubmitError(null);

    if (!formData.termsAccepted) {
      setFinalSubmitError("You must accept the terms and conditions.");
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

      // Prepare player data
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
          if (player.city)
            finalFormData.append(`player${i}_city`, player.city);
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

      const result = await registerTeam(finalFormData);

      if (result.success) {
        router.push("/register/success");
      } else {
        // Handle specific error cases
        if (result.message?.toLowerCase().includes("sign in")) {
          router.push("/login?redirect=/register");
          return;
        }
        setFinalSubmitError(result.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration submission error:", error);
      setFinalSubmitError(
        error instanceof Error && error.message
          ? error.message
          : "An unexpected error occurred. Please try again or contact support."
      );
    } finally {
      setIsSubmittingFinal(false);
    }
  };

  const handleEdit = (section: string, index?: number | null): void => {
    setFinalSubmitError(null);

    switch (section) {
      case "university":
        setActiveStep(1);
        router.push(pathname);
        break;
      case "team":
        setActiveStep(2);
        router.push(pathname);
        break;
      case "players":
        setActiveStep(3);
        break;
      case "player":
        if (index !== undefined && index !== null && index >= 1 && index <= 7) {
          setActiveStep(3);
          const params = new URLSearchParams();
          params.set("section", "player");
          params.set("index", index.toString());
          router.push(`${pathname}?${params.toString()}`);
        } else {
          console.error("Invalid player index provided for edit:", index);
          setActiveStep(3);
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
              onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
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
}

export default function FormCard(): React.ReactElement {
  return <FormContent />;
}
