"use client";

import HeroSection from "@/components/homepage/content/HeroSection";
import FeaturedSection from "@/components/homepage/content/FeaturedSection";
import AboutSection from "@/components/homepage/content/AboutSection";
import NorthEastCup from "@/components/homepage/content/NorthEastCup";
import CosplaySection from "@/components/homepage/content/CosplaySection";
import Footer from "@/components/homepage/content/Footer";
import { VolunteerForm } from "@/components/homepage/volunteer/VolunteerForm";
import { useEffect, useState } from "react";
import { ProfileCard } from "@/components/profile/EditProfile";
import NavBar from "@/components/layout/NavBar";
import { DiamondFab } from "@/components/homepage/volunteer/VolunteerJoin";
import { SlideInNotification } from "@/components/homepage/volunteer/VolunteerNotification";
import { useProfile } from "@/hooks/useProfile";

export default function HomeClient({isLoggedIn}:{isLoggedIn:boolean}) {
  const [refreshProfileKey, setRefreshProfileKey] = useState(0);
  const [showForceProfile, setShowForceProfile] = useState(false);
  const [showForm, setShowForm] = useState(false)
  const { profile } = useProfile()

  // Removed unused function: handleOpenForm

  useEffect(() => {
    async function checkUserProfile() {
      if (isLoggedIn && !profile) {
        setShowForceProfile(true);
      } else {
        setShowForceProfile(false);
      }
    }
    checkUserProfile();
    // Added supabase.auth to the dependency array to satisfy the hook's requirement
  }, [profile, isLoggedIn]); // Added supabase.auth here

  // Handler to be called when profile is updated
  function handleProfileUpdate() {
    setRefreshProfileKey(k => k + 1);
    setShowForceProfile(false);
  }

  return (
    <>
      <NavBar key={refreshProfileKey} />
      <div className="flex flex-col min-h-screen bg-black text-white">
        <HeroSection/>
        <FeaturedSection/>
        <NorthEastCup/>
        <CosplaySection/>
        <AboutSection/>
        <Footer/>
      </div>
      <ProfileCard
        isOpen={showForceProfile}
        onClose={() => {}}
        forceCompletion={true}
        onProfileUpdate={handleProfileUpdate}
      />
      {!isLoggedIn || !profile?.is_volunteer && (
        <>
          {/* Directly calling setShowForm(true) */}
          <DiamondFab onOpenForm={() => setShowForm(true)} />
          {/* Directly calling setShowForm(true) */}
          <SlideInNotification onOpenForm={() => setShowForm(true)} />
        </>
      )}
      <VolunteerForm open={showForm} onOpenChange={setShowForm} />
    </>
  );
}
