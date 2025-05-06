// ./app/step3/players/PlayerForm.tsx
'use client'; // Ensure it's marked as a Client Component if using hooks or browser APIs

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";
import { FileUploader } from "@/components/File-Uploader"; // Assuming this component exists and works
import { Player } from "@/types/registrationTypes"; // Import Player type

// Define the props the component accepts
interface PlayerFormProps {
  player: Player; // The player data object for this form instance
  playerIndex: number; // The 0-based index of the player (0 for Captain, 1-4 for Players, 5 for Substitute, 6 for Coach)
  // Handler for text/string input changes, expects index, field name, and value
  onPlayerChange: (
    index: number,
    field: keyof Omit<Player, "id" | "role" | "student_id_url" | "team_id" | "university_id" | "profile_id" | "created_at">, // Explicitly list editable fields
    value: string
  ) => void;
  // Handler for file input changes, expects index, field name, and File or null
  onFileChange: (
    index: number,
    field: "student_id_url", // Explicitly list file fields
    file: File | null
  ) => void;
  // Optional: Pass global loading/error states from parent if needed for UI feedback
  // isSubmittingFinal?: boolean;
  // finalSubmitError?: string | null;
}

// The PlayerForm functional component
export function PlayerForm({
  player,
  playerIndex,
  onPlayerChange, // Handler for text/string changes
  onFileChange, // Handler for file changes
  // isSubmittingFinal, // Accept optional props
  // finalSubmitError, // Accept optional props
}: PlayerFormProps) {
  // Determine special roles for conditional rendering based on 0-based index
  const isCaptain = playerIndex === 0;
  const isCoach = playerIndex === 6;

  // Helper function to handle file changes from FileUploader and pass them up
  const handleFileChange = (
    field: "student_id_url", // File field name
    file: File | null // The selected File object or null
  ) => {
    // Call the parent handler provided via props, including the playerIndex
    onFileChange(playerIndex, field, file);
  };

  return (
    // Outer container for the entire form section, provides spacing
    <CardContent className="p-0 gap-4 flex flex-col">

      {/* Section: In-Game Details */}
      <CardContent className="p-5 bg-[#172033] rounded-lg border border-[#747F99] flex flex-col gap-4">
         <h4 className="text-sm text-white font-bold mb-2 uppercase tracking-wider">
            In-Game Details
         </h4>
        {/* Grid layout for the inputs in this section */}
        <div className="grid grid-cols-1 gap-4">
          {/* Game ID Input */}
          <div className="space-y-2">
            <Label htmlFor={`player-${playerIndex}-game-id`} className="text-white">
              Game ID
            </Label>
            <Input
              id={`player-${playerIndex}-game-id`} // Unique ID for accessibility and linking label
              value={player.game_id || ""} // Controlled input: value comes from player prop
              onChange={(e) => onPlayerChange(playerIndex, "game_id", e.target.value)} // Call parent handler on change
              placeholder="Enter game ID"
              // required // Add required based on your form validation rules (frontend validation in FormContent handles this)
              className="text-white bg-[#1B253B] placeholder:text-gray-400 border-[#747F99]"
              // disabled={isSubmittingFinal} // Optional: Disable inputs during final submission
            />
          </div>
          {/* Server ID Input */}
          <div className="space-y-2">
            <Label htmlFor={`player-${playerIndex}-server-id`} className="text-white">
              Server ID
            </Label>
            <Input
              id={`player-${playerIndex}-server-id`} // Unique ID
              value={player.server_id || ""} // Controlled input
              onChange={(e) => onPlayerChange(playerIndex, "server_id", e.target.value)} // Call parent handler
              placeholder="Enter server ID"
              // required // Add required based on your form validation rules
              className="text-white bg-[#1B253B] border-[#747F99]"
              // disabled={isSubmittingFinal} // Optional: Disable inputs
            />
          </div>
          {/* In-Game Name (IGN) Input */}
          <div className="space-y-2">
            <Label htmlFor={`player-${playerIndex}-ign`} className="text-white">
              In-Game Name (IGN)
            </Label>
            <Input
              id={`player-${playerIndex}-ign`} // Unique ID
              value={player.ign || ""} // Controlled input
              onChange={(e) => onPlayerChange(playerIndex, "ign", e.target.value)} // Call parent handler
              placeholder="Enter in-game name"
              required={(playerIndex >= 0 && playerIndex <= 4)} // Required for Captain and Players 2-5 (frontend validation in FormContent)
              className="text-white bg-[#1B253B] border-[#747F99]"
              // disabled={isSubmittingFinal} // Optional: Disable inputs
            />
          </div>
        </div>
      </CardContent>

      {/* Section: Personal Details */}
      <CardContent className="p-5 flex flex-col gap-4 border rounded-lg border-[#747F99]">
        <h4 className="text-sm text-white font-bold mb-2 uppercase tracking-wider">
          Personal Details
        </h4>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`player-${playerIndex}-name`} className="text-white">
              Full Name
            </Label>
            <Input
              id={`player-${playerIndex}-name`} // Unique ID
              value={player.name || ""} // Controlled input
              onChange={(e) => onPlayerChange(playerIndex, "name", e.target.value)} // Call parent handler
              placeholder="Enter full name"
              required={(playerIndex >= 0 && playerIndex <= 4) || isCoach} // Required for Captain, Players 2-5, and Coach (frontend validation in FormContent)
              className="text-white bg-[#1B253B] placeholder:text-gray-400 border-[#747F99]"
              // disabled={isSubmittingFinal} // Optional: Disable inputs
            />
          </div>
        </div>

        {/* Conditional Fields for Captain/Coach (Email, Mobile) */}
        {(isCaptain || isCoach) && (
          <> {/* Use a fragment to group conditional elements */}
            <div className="grid grid-cols-1 gap-4">
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor={`player-${playerIndex}-email`} className="text-white">
                  Email
                </Label>
                <Input
                  id={`player-${playerIndex}-email`} // Unique ID
                  type="email" // Semantic type for email
                  value={player.email || ""} // Controlled input
                  onChange={(e) => onPlayerChange(playerIndex, "email", e.target.value)} // Call parent handler
                  placeholder="Enter email address"
                  required={isCaptain || isCoach} // Required only for Captain/Coach (frontend validation in FormContent)
                  className="text-white bg-[#1B253B] placeholder:text-gray-400 border-[#747F99]"
                  // disabled={isSubmittingFinal} // Optional: Disable inputs
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {/* Mobile Number Input */}
              <div className="space-y-2">
                <Label htmlFor={`player-${playerIndex}-mobile`} className="text-white">
                  Mobile Number
                </Label>
                <Input
                  id={`player-${playerIndex}-mobile`} // Unique ID
                  type="tel" // Semantic type for phone number
                  value={player.mobile || ""} // Controlled input
                  onChange={(e) => onPlayerChange(playerIndex, "mobile", e.target.value)} // Call parent handler
                  placeholder="Enter mobile number"
                  required={isCaptain || isCoach} // Required only for Captain/Coach (frontend validation in FormContent)
                  className="text-white bg-[#1B253B] placeholder:text-gray-400 border-[#747F99]"
                  // disabled={isSubmittingFinal} // Optional: Disable inputs
                />
              </div>
            </div>
          </>
        )}

         {/* Location Fields (State, City) */}
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`player-${playerIndex}-state`} className="text-white">
              State
            </Label>
            <Input
              id={`player-${playerIndex}-state`} // Unique ID
              value={player.state || ""} // Controlled input
              onChange={(e) => onPlayerChange(playerIndex, "state", e.target.value)} // Call parent handler
              placeholder="Enter state"
              className="text-white bg-[#1B253B] placeholder:text-gray-400 border-[#747F99]"
              // disabled={isSubmittingFinal} // Optional: Disable inputs
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`player-${playerIndex}-city`} className="text-white">
              City
            </Label>
            <Input
              id={`player-${playerIndex}-city`} // Unique ID
              value={player.city || ""} // Controlled input
              onChange={(e) => onPlayerChange(playerIndex, "city", e.target.value)} // Call parent handler
              placeholder="Enter city"
              className="text-white bg-[#1B253B] placeholder:text-gray-400 border-[#747F99]"
              // disabled={isSubmittingFinal} // Optional: Disable inputs
            />
          </div>
        </div>
      </CardContent>

      {/* Section: Extra Details & Uploads */}
      <CardContent className="p-5 flex flex-col gap-4 border rounded-lg border-[#747F99]">
        <h4 className="text-sm text-white font-bold mb-2 uppercase tracking-wider">
          Extra Details & Uploads
        </h4>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`player-${playerIndex}-device`} className="text-white">
              Device Name
            </Label>
            <Input
              id={`player-${playerIndex}-device`} // Unique ID
              value={player.device || ""} // Controlled input
              onChange={(e) => onPlayerChange(playerIndex, "device", e.target.value)} // Call parent handler
              placeholder="Enter device (e.g., iPhone 16)"
              className="text-white bg-[#1B253B] placeholder:text-gray-400 border-[#747F99]"
              // disabled={isSubmittingFinal} // Optional: Disable inputs
            />
          </div>
        </div>

        {/* File Upload Components */}
        <div className="grid grid-cols-1 gap-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor={`player-${playerIndex}-studentId`} className="text-white"> {/* Unique ID */}
              {isCoach ? "Coach ID Card" : "Student ID Card"}
            </Label>
            <FileUploader
              id={`player-${playerIndex}-studentId`} // Add ID for label association
              accept="image/*" // Or adjust based on allowed file types for ID cards
              onFileSelect={(file) => handleFileChange("student_id_url", file)} // Call local handler (which calls parent)
              helpText={" Upload your ID card (PNG or JPG, max 150KB)"}
              currentFile={player.student_id_url} // Pass current file/URL for preview
              // disabled={isSubmittingFinal} // Optional: Disable file uploader
            />
          </div>
        </div>

        {/* Conditional Important Notes Section */}
        {(isCaptain || isCoach) && (
          <div className="flex bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-2xl flex-col gap-3 text-white text-[13px]">
            <h3 className="text-[15px] font-semibold">Important notes to the team:</h3>
            <li>We are taking the email and whatsapp from Captain/Leader and Coach/Manager for communications between us</li>
            <li>For {isCoach ? "ID Card, you can upload collage/university ID card or any government ID" : "Student ID Card, you can upload your currently studying collage or university ID card it doesn't need to be the same university/collage you are representing"}</li>
            <li>We hope you understand our requirements and compile with it.</li>
          </div>
        )}
      </CardContent>
    </CardContent>
  );
}