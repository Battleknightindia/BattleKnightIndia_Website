"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation"; // Added import
import { createClient } from "@/utils/supabase/client";
import { ProfileCard } from "@/components/EditProfile";
import { useProfile } from "@/hooks/useProfile";
import { DiamondFab } from "@/components/VolunteerJoin";
import { isVolunteer } from "@/utils/volunteer_helper";
import { SlideInNotification } from "@/components/VolunteerNotification";
import { VolunteerForm } from "@/components/VolunteerForm";

export default function HomeClient() {
  const searchParams = useSearchParams();
  const loginSuccessParam = searchParams.get("loginSuccess");
  const supabase = createClient();
  const [refreshProfileKey, setRefreshProfileKey] = useState(0);
  const { profile, loading } = useProfile();
  const [showForceProfile, setShowForceProfile] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function checkUserProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      // Only show force profile if user is logged in, profile is not loading, and profile is null or empty
      // Only show force profile if user is logged in, profile is not loading, profile is null,
    // AND it's not a loginSuccess redirect (NavBar handles that case).
    if (user && !loading && !profile && loginSuccessParam !== "true") {
        setShowForceProfile(true);
      } else {
        setShowForceProfile(false);
      }
    }
    // The dependency array ensures this runs when profile or loading state changes,
    // or when supabase.auth changes (e.g., after login/logout)
    checkUserProfile();
  }, [profile, loading, supabase.auth, loginSuccessParam]); // Added loginSuccessParam to dependencies

  function handleProfileUpdate() {
    // Increment key to force re-render of ProfileCard if needed, though not directly used here
    setRefreshProfileKey(k => k + 1);
    setShowForceProfile(false); // Close the force profile modal after update
  }

  return (
    <>
      {/* ProfileCard for forced completion after login */}
      <ProfileCard
        isOpen={showForceProfile}
        onClose={() => {}} // onClose is intentionally empty to force completion
        forceCompletion={true}
        onProfileUpdate={handleProfileUpdate}
      />
      {/* Volunteer related components, only shown if user is not a volunteer */}
      {!isVolunteer(profile) && (
        <>
          <DiamondFab onOpenForm={() => setShowForm(true)} />
          <SlideInNotification onOpenForm={() => setShowForm(true)} />
        </>
      )}
      {/* Volunteer form modal */}
      <VolunteerForm open={showForm} onOpenChange={setShowForm} />
    </>
  );
}
