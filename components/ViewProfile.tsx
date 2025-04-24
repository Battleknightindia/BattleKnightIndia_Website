"use client";

import React from "react"; // Keep React import if using JSX
import { X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/hooks/useProfile";
import Image from "next/image"; // Import Image component

// Props
interface ProfileViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileView({ isOpen, onClose }: ProfileViewProps) {
  // useEffect and useState are used within useProfile, not directly here,
  // so they are not needed as direct imports in this component.
  const { profile, loading, error } = useProfile();

  if (!isOpen) return null;

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div className="relative w-full max-w-md rounded-lg bg-zinc-900 p-6 shadow-lg">
          <p className="text-sm text-zinc-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="relative w-full max-w-md rounded-lg bg-zinc-900 p-6 shadow-lg">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 text-center">
          <h2 className="mb-1 text-2xl font-bold text-emerald-400">
            PROFILE DETAILS
          </h2>
          <p className="text-sm text-zinc-400">Your tournament identity</p>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center text-sm text-zinc-400">Loading...</div>
        ) : (
          <>
            {/* Profile Image */}
            <div className="mb-6 flex justify-center">
              {/* Add relative positioning for Image fill */}
              <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-emerald-500 bg-zinc-800 relative">
                {profile?.avatar_url ? (
                  <Image // Use Next.js Image component
                    src={profile.avatar_url}
                    alt="Profile"
                    fill={true} // Fill the parent container
                    sizes="96px" // Specify size as parent is 24x24 (96px)
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-zinc-500 text-xs">
                    No Image
                  </div>
                )}
              </div>
            </div>

            {/* Display Info */}
            <div className="grid gap-4 text-sm text-white">
              <DisplayField label="In Game Name" value={profile?.ign} />
              <div className="grid grid-cols-2 gap-4">
                <DisplayField label="Game ID" value={profile?.game_id} />
                <DisplayField label="Server ID" value={profile?.server_id} />
              </div>
              <div className="grid gap-1">
                <Label className="text-zinc-400">Roles</Label>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(profile?.roles) ? profile.roles : (profile?.roles ? profile.roles.split(",") : [])).map((role: string) => {
                    let color = "bg-emerald-600";
                    let display = role;
                    if (role === "hyper") { color = "bg-purple-600"; display = "Hyper/Jungler"; }
                    else if (role === "mage") { color = "bg-blue-600"; display = "Mage"; }
                    else if (role === "marksmen") { color = "bg-orange-500"; display = "Marksmen"; }
                    else if (role === "fighter") { color = "bg-red-600"; display = "Fighter"; }
                    else if (role === "tank") { color = "bg-cyan-500"; display = "Tank/Support"; }
                     else if (role === "gold") { color = "bg-yellow-500"; display = "Gold Laner"; } // Added Gold Laner
                     else if (role === "exp") { color = "bg-rose-600"; display = "EXP Laner"; } // Added EXP Laner
                    return (
                      <span key={role} className={`px-2 py-1 rounded text-white text-xs font-semibold ${color}`}>
                        {display}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <DisplayField label="State" value={profile?.state || "-"} />
                <DisplayField label="City" value={profile?.city || "-"} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Reusable display field
function DisplayField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="grid gap-1">
      <Label className="text-zinc-400">{label}</Label>
      <div className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white">
        {value || "-"}
      </div>
    </div>
  );
}