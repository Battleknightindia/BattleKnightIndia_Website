// ./app/step2/steps/Step4.tsx
'use client';

import { AlertDescription } from "@/components/ui/alert";
import { Alert } from "@/components/ui/alert";
import { AlertTriangle, FileCheck, GraduationCap, User, Users, Pencil } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";
import { Button } from "@/components/ui/button";

// Import types from registrationTypes.ts
import {
  RegistrationFormData,
  Player
} from "@/types/registrationTypes";


// Helper functions (getPlayerRole, getFileDisplayName - remain the same)
const getPlayerRole = (role: Player['role'] | null): string => {
  if (!role) return "Player";
  switch (role) {
    case 'captain': return 'Captain';
    case 'coach': return 'Coach';
    case 'substitute': return 'Substitute';
    case 'player': return 'Player';
    default:
       console.warn("Unexpected player role string encountered:", role);
       return "Unknown Role";
  }
};

const getFileDisplayName = (fileOrUrl: File | string | null | undefined): string | null => {
  if (!fileOrUrl) {
      return null;
  }
  if (fileOrUrl instanceof File) {
    return fileOrUrl.name;
  } else if (typeof fileOrUrl === 'string') {
    try {
      const url = new URL(fileOrUrl);
      const pathname = url.pathname;
      const segments = pathname.split('/');
      return segments[segments.length - 1] || fileOrUrl;
    } catch (e) {
       console.error("Invalid URL string for file display:", fileOrUrl, e);
      return "Invalid file URL";
    }
  }
  return null;
};


// Define props Step4 expects from its parent (FormContent)
interface Step4Props {
    data: RegistrationFormData;
    termsAccepted: boolean;
    onTermsChange: (checked: boolean) => void;
    onEdit: (section: string, index?: number | null) => void;
    isSubmitting?: boolean;
}


export default function Step4({ data, termsAccepted, onTermsChange, onEdit, isSubmitting }: Step4Props) {

  const universityData = data.university;
  const teamData = data.team;
  // Iterate over Object.entries to get both key (1-based index string) and value (Player object)
  const playersAndStaffEntries = Object.entries(data.players)
                           .filter(([, player]) => player !== undefined) as [string, Player][];
                           // Optional: Sort the array if you want a specific display order
                           // .e.sort(([, a], [, b]) => { /* sorting logic */ }); // Sorting needs to handle the [key, value] structure


  // Handle terms change - calls the parent handler
  const handleTermsChange = (checked: CheckedState): void => {
    onTermsChange(checked === true);
  };

  // Handle edit button click - calls the parent handler
  const handleEditClick = (section: string, index?: number | null): void => {
    // Prevent editing while the final submission is in progress
    if (!isSubmitting) {
      onEdit(section, index);
    }
  };


  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <FileCheck color="teal" />
          <h1 className="text-[23px] text-white font-bold">Review</h1>
        </div>
        <p className="text-[15px] text-[#747F98]">Review your information</p>
      </div>

      {/* Warning Alert */}
      <div className="flex justify-center items-center">
        <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-sm">
            Please review all information carefully before submitting.
            {isSubmitting ? "Finalizing submission..." : "You cannot edit after submission."}
          </AlertDescription>
        </Alert>
      </div>

      {/* Accordion for Review Sections */}
      <div className="rounded-lg overflow-hidden">
        <Accordion type="single" collapsible className="flex flex-col gap-2 pb-10">

          {/* University Details Accordion Item */}
          <AccordionItem value="university" className="border rounded-lg overflow-hidden">
             <div className="flex items-center justify-between px-4 py-3 bg-[#1B253B]">
               <AccordionTrigger className="flex-1 hover:no-underline hover:bg-transparent">
                 <div className="flex items-center">
                   <GraduationCap className="h-5 w-5 mr-2 text-white" />
                   <span className="font-medium text-white">University Details</span>
                 </div>
               </AccordionTrigger>
               {/* Edit Button for University */}
               <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditClick('university')} // Call handler with section name
                  disabled={isSubmitting} // Disable edit while submitting
                  className="text-white hover:text-white/80" // Add basic styling
               >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit University</span>
               </Button>
             </div>
             <AccordionContent className="px-4 py-3 bg-[#1B253B]">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <Label className="text-sm text-gray-500">University Name</Label>
                   <p className="font-medium">{universityData?.name || "Not provided"}</p>
                 </div>
                 <div>
                   <Label className="text-sm text-gray-500">Location</Label>
                   <p className="font-medium">
                     {universityData?.city && universityData?.state
                       ? `${universityData.city}, ${universityData.state}`
                       : universityData?.city || universityData?.state || "Not provided"}
                   </p>
                 </div>
                 <div className="md:col-span-2">
                   <Label className="text-sm text-gray-500">University Logo</Label>
                   <p className="font-medium">{getFileDisplayName(universityData?.logo) || "Not provided"}</p>
                    {getFileDisplayName(universityData?.logo) && universityData?.logo && (
                        <div className="mt-2">
                            <img
                                src={typeof universityData.logo === 'string' ? universityData.logo : URL.createObjectURL(universityData.logo)}
                                alt="University Logo Preview"
                                className="max-h-[80px] object-contain rounded-md"
                            />
                        </div>
                    )}
                 </div>
               </div>
             </AccordionContent>
           </AccordionItem>

          {/* Team Details Accordion Item */}
          <AccordionItem value="team" className="border rounded-lg overflow-hidden mt-3">
            <div className="flex items-center justify-between px-4 py-3 bg-[#1B253B]">
               <AccordionTrigger className="flex-1 hover:no-underline hover:bg-transparent">
                 <div className="flex items-center">
                   <Users className="h-5 w-5 mr-2 text-white" />
                   <span className="font-medium text-white">Team Details</span>
                 </div>
               </AccordionTrigger>
                {/* Edit Button for Team */}
               <Button
                 type="button"
                 variant="ghost"
                 size="sm"
                 onClick={() => handleEditClick('team')} // Call handler with section name
                 disabled={isSubmitting} // Disable edit while submitting
                 className="text-white hover:text-white/80" // Add basic styling
               >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit Team</span>
               </Button>
            </div>
            <AccordionContent className="px-4 py-3 bg-[#1B253B]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">Team Name</Label>
                  <p className="font-medium">{teamData?.name || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Team Logo</Label>
                  <p className="font-medium">{getFileDisplayName(teamData?.logo) || "Not provided"}</p>
                   {getFileDisplayName(teamData?.logo) && teamData?.logo && (
                       <div className="mt-2">
                           <img
                               src={typeof teamData.logo === 'string' ? teamData.logo : URL.createObjectURL(teamData.logo)}
                               alt="Team Logo Preview"
                               className="max-h-[80px] object-contain rounded-md"
                           />
                       </div>
                   )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Team Members (Players, Coach, Substitute) Details Accordion Item */}
          <AccordionItem value="players" className="border rounded-lg overflow-hidden mt-3">
            <div className="flex items-center justify-between px-4 py-3 bg-[#1B253B]">
              <AccordionTrigger className="flex-1 hover:no-underline hover:bg-transparent">
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-white" />
                  <span className="font-medium text-white">Team Members Details</span>
                </div>
              </AccordionTrigger>
               {/* Edit Button for Players Section */}
               {/* This button goes back to the start of Step 3 */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditClick('players')} // Call handler with section name 'players'
                  disabled={isSubmitting} // Disable edit while submitting
                  className="text-white hover:text-white/80" // Add basic styling
                >
                   <Pencil className="h-4 w-4" />
                   <span className="sr-only">Edit Team Members</span>
                </Button>
            </div>
            <AccordionContent className="px-4 py-3 bg-[#1B253B]">
              <div className="space-y-6">
                 {/* Loop through the players entries (key and value) */}
                {playersAndStaffEntries.length > 0 ? (
                  // Map gets [key, player] array, where key is the original '1'...'7' string
                  playersAndStaffEntries.map(([playerKey, member], index: number) => (
                    // Use the original playerKey as the React key
                    <div key={playerKey} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-white">
                             {/* Display Player N or Role Name */}
                             {member.role === 'coach' || member.role === 'substitute'
                                ? getPlayerRole(member.role)
                                : `Player ${index + 1}` // Use current loop index + 1 for display number in the list
                            }
                          </h4>
                          {member.role && (
                            <span className="px-2 py-1 text-xs font-medium bg-white text-black border border-white rounded-full">
                              {getPlayerRole(member.role)} {/* Display role badge */}
                            </span>
                          )}
                        </div>
                         {/* Edit Button for Individual Player */}
                         {/* This button goes back to Step 3 AND specifies the player index */}
                         <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick('player', parseInt(playerKey, 10))} // Pass section 'player' and the original 1-based index
                            disabled={isSubmitting} // Disable edit while submitting
                            className="text-white hover:text-white/80" // Add basic styling
                         >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit {getPlayerRole(member.role)}</span> {/* Use role in SR text */}
                         </Button>
                      </div>
                      {/* ... rest of player details display ... */}
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-500">Full Name</Label>
                          <p className="text-sm font-medium">{member.name || "Not provided"}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">In-Game Name</Label>
                          <p className="text-sm font-medium">{member.ign || "Not provided"}</p>
                        </div>
                         {member.role === 'captain' || member.role === 'player' ? (
                             <>
                                 <div>
                                   <Label className="text-xs text-gray-500">Game ID</Label>
                                   <p className="text-sm font-medium">{member.game_id || "Not provided"}</p>
                                 </div>
                                 <div>
                                   <Label className="text-xs text-gray-500">Server ID</Label>
                                   <p className="text-sm font-medium">{member.server_id || "Not provided"}</p>
                                 </div>
                             </>
                         ) : (
                             <div className="md:col-span-2">
                                 <Label className="text-xs text-gray-500">Game Details</Label>
                                 <p className="text-sm font-medium">Not Applicable</p>
                             </div>
                         )}
                        <div>
                          <Label className="text-xs text-gray-500">Email</Label>
                          <p className="text-sm font-medium">{member.email || "Not provided"}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Mobile</Label>
                          <p className="text-sm font-medium">{member.mobile || "Not provided"}</p>
                        </div>
                         {member.role === 'captain' || member.role === 'player' ? (
                             <>
                                <div>
                                   <Label className="text-xs text-gray-500">Location</Label>
                                   <p className="text-sm font-medium">
                                     {member.city && member.state ? `${member.city}, ${member.state}` : member.city || member.state || "Not provided"}
                                   </p>
                                 </div>
                                 <div>
                                   <Label className="text-xs text-gray-500">Device</Label>
                                   <p className="text-sm font-medium">{member.device || "Not provided"}</p>
                                 </div>
                             </>
                         ) : (
                             <div className="md:col-span-2">
                                 <Label className="text-xs text-gray-500">Location/Device</Label>
                                 <p className="text-sm font-medium">Not Applicable</p>
                             </div>
                         )}
                         <div className={(member.role === 'coach' || member.role === 'substitute') ? "md:col-span-2" : ""}>
                           <Label className="text-xs text-gray-500">Role</Label>
                           <p className="text-sm font-medium">{getPlayerRole(member.role) || "Not provided"}</p>
                         </div>
                        <div>
                          <Label className="text-xs text-gray-500">Photo</Label>
                          <p className="font-medium">{getFileDisplayName(member.picture_url) || "Not provided"}</p>
                           {getFileDisplayName(member.picture_url) && member.picture_url && (
                                <div className="mt-2">
                                   <img
                                       src={typeof member.picture_url === 'string' ? member.picture_url : URL.createObjectURL(member.picture_url)}
                                       alt={`${getPlayerRole(member.role)} Photo Preview`}
                                       className="max-h-[80px] object-contain rounded-md"
                                   />
                                </div>
                            )}
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Student Proof</Label>
                           <p className="font-medium">
                             {getFileDisplayName(member.student_id_url) ||
                              (member.role === 'coach' || member.role === 'substitute' ? "Not Required" : "Not provided")}
                          </p>
                           {getFileDisplayName(member.student_id_url) && member.student_id_url && (
                                getFileDisplayName(member.student_id_url) !== "Not Required" && (
                                    <div className="mt-2">
                                       <img
                                           src={typeof member.student_id_url === 'string' ? member.student_id_url : URL.createObjectURL(member.student_id_url)}
                                           alt={`${getPlayerRole(member.role)} Student Proof Preview`}
                                           className="max-h-[80px] object-contain rounded-md"
                                       />
                                    </div>
                                )
                           )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No team member information available
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

        </Accordion>

        {/* --- Terms and Conditions Checkbox (Restored) --- */}
        <div className="pt-10 border-t">
          <div className="flex items-start space-x-2 mb-4">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={handleTermsChange}
              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 rounded-none border-white bg-white"
              disabled={isSubmitting}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white"
              >
                Accept Terms and Conditions
              </label>
              <p className="text-sm text-gray-400">
                I confirm that all information provided is accurate and complete. I have read and agree to the tournament
                rules and regulations.
              </p>
            </div>
          </div>
        </div>
        {/* --- End Terms and Conditions Checkbox --- */}

        {/* --- Rulebook Download Section (Restored) --- */}
        <div className="mt-6 p-4 bg-[#1B253B] rounded-lg border border-[#2D3748]">
          <div className="flex items-center gap-3 mb-3">
            <FileCheck className="h-5 w-5 text-teal-400" />
            <h3 className="text-white font-medium">Tournament Rulebook</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Please download and review the tournament rulebook before submitting your registration.
          </p>
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open('/rulebook.pdf', '_blank');
            }}
            className="w-full bg-blue-500 text-white font-bold"
            disabled={isSubmitting}
          >
            <FileCheck className="h-4 w-4 mr-2" />
            Download Rulebook
          </Button>
        </div>
        {/* --- End Rulebook Download Section --- */}

        {/* Final Instruction Message */}
        <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg border border-blue-100 mt-6">
          <FileCheck className="h-5 w-5 text-blue-600 mr-2" />
          <p className="text-sm text-blue-700 font-medium">
            Please click "Submit Registration" below to complete your registration
          </p>
        </div>
      </div>
    </div>
  );
}