"use client";

import React, { useState } from "react";
import { X, Upload } from "lucide-react";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { availableRoles } from "@/lib/constant/profile"
import { handleProfile } from "@/lib/server_actions/profile";
import Image from "next/image"; // Import the Image component
import { ProfileFormSchema, ProfileFormType } from "@/schema/profileSchema";


type Profile = {
  id?: string;
  fullName: string;
  gameName: string;
  gameId: string;
  serverId: string;
  roles: string; // comma-separated
  state?: string | null;
  city?: string | null;
  avatar_url?: string | null;
  // Add other profile fields as needed
};


// Props
interface ProfileCardProps {
  isOpen: boolean;
  onClose: () => void;
  forceCompletion?: boolean;
  // Changed 'profile: any' to 'profile: Profile' (assuming a Profile type exists)
  onProfileUpdate?: (profile: Profile) => void;
}

export function ProfileCard({
  isOpen,
  onClose,
  forceCompletion,
  onProfileUpdate,
}: ProfileCardProps) {
  const [formData, setFormData] = useState<ProfileFormType>({
    fullName: "",
    gameName: "",
    gameId: "",
    serverId: "",
    roles: "",
    state: "",
    city: "",
  });

  const selectedRoles = formData.roles ? formData.roles.split(",").filter(Boolean) : [];
  const [roleInput, setRoleInput] = useState("");
  const [profilePreview, setProfilePreview] = useState<string | null>(null)
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const addRole = (roles: string) => {
    if (!roles) return;
    const normalized = roles.trim().toLowerCase();
    if (selectedRoles.map(r => r.toLowerCase()).includes(normalized)) return;
    const updatedRoles = [...selectedRoles, roles.trim()];
    setFormData((prev) => ({ ...prev, roles: updatedRoles.join(",") }));
    setRoleInput("");
  };

  const removeRole = (roles: string) => {
    const updatedRoles = selectedRoles.filter((r) => r !== roles);
    setFormData((prev) => ({ ...prev, roles: updatedRoles.join(",") }));
  };

  const handleRoleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (roleInput.trim()) {
        addRole(roleInput);
      }
    } else if (e.key === "Backspace" && !roleInput && selectedRoles.length > 0) {
      removeRole(selectedRoles[selectedRoles.length - 1]);
    }
  };

  const handleRoleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoleInput(e.target.value);
  };

  const filteredSuggestions = availableRoles.filter(
    (role) => !selectedRoles.includes(role.value)
      && role.label.toLowerCase().includes(roleInput.toLowerCase())
  );

  const handleSuggestionClick = (roleValue: string) => {
    addRole(roleValue);
  };

  // Handle text input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setProfileImage(file)
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Form submission with Zod validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = ProfileFormSchema.safeParse(formData);

    if (!result.success) {
      alert(result.error.errors[0].message);
      return;
    }

    try {
      const response = await handleProfile(result.data, profileImage);

      if (response.success) {
        setMessage("Profile updated successfully!");
        setSuccess(true);
        if (onProfileUpdate) {
          // Only call with response.profile if it exists and matches the expected type
          if ('profile' in response && response.profile) {
             // Ensure the profile object passed matches the Profile type
            onProfileUpdate(response.profile as Profile); // Type assertion might be needed depending on actual response type
          } else {
             // Construct a Profile object from available data
            const updatedProfile: Profile = {
              ...result.data,
              avatar_url: profilePreview, // Use profileImage as avatar_url
              // Add other default/placeholder fields if needed
            };
            onProfileUpdate(updatedProfile);
          }
        }
        if (!forceCompletion) {
          setTimeout(() => {
            setMessage("");
            setSuccess(false);
            onClose();
          }, 1200);
        }
      } else {
        setMessage(`Error: ${response.error}`);
      }
    } catch (err) {
      console.error("Submission failed:", err);
      setMessage("Something went wrong.");
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md rounded-lg bg-zinc-900 p-6 shadow-lg"
      >
        {/* Conditionally render close button */}
        {!forceCompletion && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 text-zinc-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <div className="mb-6 text-center">
          <h2 className="mb-1 text-2xl font-bold text-emerald-400">
            PLAYER PROFILE
          </h2>
          {/* Show message if forcing completion */}
          {forceCompletion ? (
            <p className="text-sm text-yellow-500 font-semibold mt-2">
              Please complete your profile to continue.
            </p>
          ) : (
            <p className="text-sm text-zinc-400">Customize your gaming identity</p>
          )}
        </div>

        {/* Profile Image Upload */}
        <div className="mb-6 flex justify-center">
          <div className="relative h-24 w-24">
            <div
              className={cn(
                "flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-emerald-500 bg-zinc-800",
                profileImage ? "p-0" : "p-2"
              )}
            >
              {profilePreview ? (
                // Replaced <img> with <Image />
                <Image
                  src={profilePreview}
                  alt="Profile"
                  width={96} // Set intrinsic width based on container size (h-24 w-24 = 96px)
                  height={96} // Set intrinsic height
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center text-zinc-500">
                  <Upload className="mb-1 h-6 w-6" />
                  <span className="text-xs">
                    {isUploading ? "Uploading..." : "Upload"}
                  </span>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid gap-4">
        <InputField
            label="Full Name"
            id="fullName"
            value={formData.fullName}
            onChange={handleChange}
          />
          <InputField
            label="In Game Name"
            id="gameName"
            value={formData.gameName}
            onChange={handleChange}
          />
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Game ID"
              id="gameId"
              value={formData.gameId}
              onChange={handleChange}
            />
            <InputField
              label="Server ID"
              id="serverId"
              value={formData.serverId}
              onChange={handleChange}
            />
          </div>

          {/* Role Selection (Tag Input style) */}
          <div className="grid gap-2">
            <Label className="text-white">Roles</Label>
            <div className="flex flex-wrap gap-2 min-h-[38px] p-1 border border-zinc-700 rounded bg-zinc-800">
              {selectedRoles.map((role) => {
  let color = "bg-emerald-600 hover:bg-emerald-600";
  if (role === "hyper") color = "bg-purple-600 hover:bg-purple-600";
  else if (role === "mage") color = "bg-blue-600 hover:bg-blue-600";
  else if (role === "marksmen") color = "bg-orange-500 hover:bg-orange-500";
  else if (role === "fighter") color = "bg-red-600 hover:bg-red-600";
  else if (role === "tank") color = "bg-cyan-500 hover:bg-cyan-500";
  return (
    <span
      key={role}
      className={`flex items-center gap-1 px-2 py-1 rounded ${color} text-white text-xs cursor-pointer transition-colors`}
    >
      {availableRoles.find(r => r.value === role)?.label || role}
      <button
        type="button"
        className="ml-1 text-white hover:text-zinc-200"
        onClick={() => removeRole(role)}
        tabIndex={-1}
      >
        ×
      </button>
    </span>
  );
})}
              <input
                type="text"
                value={roleInput}
                onChange={handleRoleInputChange}
                onKeyDown={handleRoleInputKeyDown}
                className="flex-1 min-w-[80px] border-none bg-transparent text-white outline-none"
                placeholder={selectedRoles.length === 0 ? "Type or select a role..." : ""}
              />
            </div>
            {/* Suggestions */}
            {filteredSuggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {filteredSuggestions.map((roles) => (
                  <button
                    key={roles.value}
                    type="button"
                    className="px-2 py-1 rounded bg-zinc-700 text-white text-xs hover:bg-emerald-500 hover:text-black"
                    onClick={() => handleSuggestionClick(roles.value)}
                  >
                    {roles.label}
                  </button>
                ))}
              </div>
            )}
            <span className="text-xs text-zinc-400">Type and press Enter or select from below</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="State"
              id="state"
              value={formData.state}
              onChange={handleChange}
            />
            <InputField
              label="City"
              id="city"
              value={formData.city}
              onChange={handleChange}
            />
          </div>

          <Button
            type="submit"
            className="mt-2 bg-emerald-500 text-white hover:bg-emerald-600"
            disabled={success}
          >
            {forceCompletion ? "Make Profile" : "Save Profile"}
          </Button>

          {message && <p className="mt-2 text-emerald-400">{message}</p>}
        </div>
      </form>
    </div>
  );
}

// Reusable input field component
function InputField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value?: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="text-white">
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        onChange={onChange}
        placeholder={label}
        className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
      />
    </div>
  );
}
