// ./app/step3/Step3.tsx
'use client';

import { User, ArrowRight, ArrowLeft } from "lucide-react"; // Keep ArrowRight, ArrowLeft for player navigation buttons
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"; // Keep Button for player navigation buttons
import { PlayerForm } from "./players/PlayerForm";
import { PlayersStepData, Player } from "@/types/registrationTypes";
import { useRouter , useSearchParams, usePathname } from "next/navigation";


interface Step3Props {
    // Receive the entire players data object slice from the parent state
    data: PlayersStepData;
    // Receive the specific handler to update player data in the parent state
    onDataChange: (playerIndex: number, field: keyof Player, value: any) => void;
}


export default function Step3({ data, onDataChange }: Step3Props) { // Remove teamId, universityId props

  // Keep local state for controlling which player's form is currently displayed (1-based: 1 to 7)
  const [activeTabIndex, setActiveTabIndex] = useState<number>(1);

  // Get router and search params
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    const section = searchParams.get('section');
    const indexParam = searchParams.get('index');

    // Check if the search params indicate a specific player edit request
    if (section === 'player' && indexParam) {
      const playerIndexFromUrl = parseInt(indexParam, 10);

      // Validate the parsed index
      if (!isNaN(playerIndexFromUrl) && playerIndexFromUrl >= 1 && playerIndexFromUrl <= 7) {
        console.log(`Navigating to player index ${playerIndexFromUrl} from URL.`);
        setActiveTabIndex(playerIndexFromUrl); // Set active tab based on URL
      } else {
          console.warn("Invalid player index in URL:", indexParam);
          // Optionally navigate to the first player if the index is invalid
          setActiveTabIndex(1);
      }

      // Clean up the search parameters after reading them
      // This prevents the state from being re-set if user navigates back/forward
      // and also keeps the URL clean.
      const currentParams = new URLSearchParams(searchParams.toString());
      currentParams.delete('section');
      currentParams.delete('index');
      // Use replace instead of push to avoid adding the cleanup URL to history
      // Using { scroll: false } prevents page jump on replace
      router.replace(`${pathname}?${currentParams.toString()}`, { scroll: false });
    }
     // The effect should re-run if searchParams change.
     // Adding router.pathname ensures it re-runs if the base path changes,
     // though less likely for this specific use case.  
  }, [searchParams, router, pathname]);

  // --- Handlers to update Parent State ---
  const handlePlayerChange = (
    playerIndex: number, // 0-based index (0-6) received from PlayerForm
    field: keyof Omit<Player, "id" | "role" | "picture_url" | "student_id_url" | "team_id" | "university_id" | "profile_id" | "created_at">,
    value: string
  ) => {
     onDataChange(playerIndex, field as keyof Player, value);
  };

  const handlePlayerFileChange = (
    playerIndex: number, // 0-based index (0-6) received from PlayerForm
    field: "picture_url" | "student_id_url",
    file: File | null
  ) => {
    // File size validation can also be here or in FileUploader
     if (file && file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("File size should be less than 5MB");
        onDataChange(playerIndex, field, null); // Clear the file in parent state
        return;
      }
    onDataChange(playerIndex, field, file);
  };
  // --- End Handlers ---


  // Keep local UI navigation functions for players within this step
  const nextPlayer = () => {
    if (activeTabIndex < 7) {
      setActiveTabIndex(activeTabIndex + 1);
    }
  };

  const prevPlayer = () => {
    if (activeTabIndex > 1) {
      setActiveTabIndex(activeTabIndex - 1);
    }
  };

  // Keep local helper to get the role title for the card header
  const getRoleTitle = (index: number) => {
    if (index === 1) return "Captain";
    if (index === 6) return "Substitute";
    if (index === 7) return "Coach";
    return `Player ${index}`; // For indices 2-5 (based on 1-based activeTabIndex)
  };

  // --- Get Current Player Data from Props ---
  const currentPlayer = data[activeTabIndex.toString()] || {
     name: '', ign: '', game_id: '', server_id: '', email: '', mobile: '',
     city: '', state: '', device: '', picture_url: null, student_id_url: null,
     role: ((): Player["role"] => {
       if (activeTabIndex === 1) return "captain";
       if (activeTabIndex === 6) return "substitute";
       if (activeTabIndex === 7) return "coach";
       return "player";
     })(),
   };
   // --- End Get Current Player Data ---


  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <User color="teal" />
          <h1 className="text-[23px] text-white font-bold">Members</h1>
        </div>
        <p className="text-[15px] text-[#747F99]">Enter members details</p>
      </div>

      <Card className="bg-transparent border-none">
        <CardHeader className="flex items-center justify-between mb-6 bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white shadow-md flex-row">
          <CardTitle className="text-white font-bold text-[18px]">
            {getRoleTitle(activeTabIndex)}
             {activeTabIndex === 6 && " (Optional)"} {/* Substitute */}
             {activeTabIndex === 7 && " (Optional)"} {/* Coach */}
          </CardTitle>
          <Badge
            variant="outline"
            className="text-white text-sm bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm"
          >
            {activeTabIndex} of 7
          </Badge>
        </CardHeader>

        {/* Player Form Component - Pass current player data and parent handlers */}
        {/* --- Add key prop here --- */}
        <PlayerForm
          key={activeTabIndex} // <-- Add this line. Use activeTabIndex as the key.
          player={currentPlayer as Player}
          playerIndex={activeTabIndex - 1} // Pass the 0-based index (0-6)
          onPlayerChange={handlePlayerChange}
          onFileChange={handlePlayerFileChange}
          // Pass global loading/error states if needed for UI feedback within PlayerForm
          // isSubmittingFinal={isSubmittingFinal}
          // finalSubmitError={finalSubmitError}
        />
        {/* --- End Add key prop --- */}

        {/* --- Player Navigation Buttons (Local to Step3) --- */}
        <div className="flex justify-between items-center mt-7">
          {/* Previous Player Button */}
          <Button
            type="button"
            onClick={prevPlayer}
            disabled={activeTabIndex === 1} // Disable on first player
            className="border border-white bg-transparent text-white font-bold py-2 px-4 rounded-md"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous Player
          </Button>

          {/* Next Player Button */}
          {activeTabIndex < 7 ? ( // Show "Next Player" button if not on the last player (Coach)
            <Button
              type="button"
              onClick={nextPlayer}
              disabled={false} // Always enabled unless on last player
              className="border border-blue-500 bg-transparent text-white font-bold py-2 px-4 rounded-md"
            >
              {activeTabIndex === 6 ? "Next (Coach)" : "Next Player"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            // Placeholder to maintain layout when on the last player tab
             <div className="w-auto"></div>
          )}
        </div>
        {/* --- End Player Navigation Buttons --- */}

         {/* Optional: Display parent-level error here */}
         {/* {finalSubmitError && <p className="text-center text-red-500 mt-4">{finalSubmitError}</p>} */}
      </Card>
    </div>
  );
}