"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ProfileCard } from "@/components/EditProfile";
import { useProfile } from "@/hooks/useProfile";
import { DiamondFab } from "@/components/VolunteerJoin";
import { isVolunteer } from "@/utils/volunteer_helper";
import { SlideInNotification } from "@/components/VolunteerNotification";
import { VolunteerForm } from "@/components/VolunteerForm";

export default function HomeClient() {
  const supabase = createClient();
  const [refreshProfileKey, setRefreshProfileKey] = useState(0);
  const { profile, loading } = useProfile();
  const [showForceProfile, setShowForceProfile] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function checkUserProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !loading && !profile) {
        setShowForceProfile(true);
      } else {
        setShowForceProfile(false);
      }
    }
    checkUserProfile();
  }, [profile, loading, supabase.auth]);

  function handleProfileUpdate() {
    setRefreshProfileKey(k => k + 1);
    setShowForceProfile(false);
  }

  return (
    <>
      <ProfileCard
        isOpen={showForceProfile}
        onClose={() => {}}
        forceCompletion={true}
        onProfileUpdate={handleProfileUpdate}
      />
      {!isVolunteer(profile) && (
        <>
          <DiamondFab onOpenForm={() => setShowForm(true)} />
          <SlideInNotification onOpenForm={() => setShowForm(true)} />
        </>
      )}
      <VolunteerForm open={showForm} onOpenChange={setShowForm} />
    </>
  );
}
