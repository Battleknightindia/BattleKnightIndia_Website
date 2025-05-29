'use client';
import HeroSection from "@/components/homepage/content/HeroSection";
import FeaturedSection from "@/components/homepage/content/FeaturedSection";
import AboutSection from "@/components/homepage/content/AboutSection";
import NorthEastCup from "@/components/homepage/content/NorthEastCup";
import CosplaySection from "@/components/homepage/content/CosplaySection";
import Footer from "@/components/Footer";
import { VolunteerForm } from "@/components/homepage/volunteer/VolunteerForm";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ProfileCard } from "@/components/profile/EditProfile";
import { useProfile } from "@/hooks/useProfile";
import NavBar from "@/components/layout/NavBar";
import { DiamondFab } from "@/components/homepage/volunteer/VolunteerJoin";
import { isVolunteer } from "@/utils/volunteer_helper";
import { SlideInNotification } from "@/components/homepage/volunteer/VolunteerNotification";
import { User } from "@supabase/supabase-js";
import { FeaturedItem, MediaItem, NorthEastCupItem, CosplayItem } from "@/types/homepageTypes";

type Props = {
  featuredData:FeaturedItem,
  eventData: MediaItem[],
  northeastData: NorthEastCupItem[],
  cosplayData: CosplayItem[],
}

export default function HomeClient({featuredData, eventData, northeastData, cosplayData}: Props) {
  const supabase = createClient();
  const [refreshProfileKey, setRefreshProfileKey] = useState(0);
  const { profile, loading } = useProfile();
  const [showForceProfile, setShowForceProfile] = useState(false);
  const [showForm, setShowForm] = useState(false)
  const [user, setUser] = useState<User| null>(null)

  // Removed unused function: handleOpenForm

  useEffect(() => {
    async function checkUserProfile() {
      // Ensure supabase.auth is included in the dependency array as it's used here
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user)
      if (user && !loading && !profile) {
        setShowForceProfile(true);
      } else {
        setShowForceProfile(false);
      }
    }
    checkUserProfile();
    // Added supabase.auth to the dependency array to satisfy the hook's requirement
  }, [profile, loading, supabase.auth]); // Added supabase.auth here

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
        <FeaturedSection featuredData={featuredData} eventData={eventData}/>
        <NorthEastCup items={northeastData}/>
        <CosplaySection cosplayData={cosplayData}/>
        <AboutSection/>
        <Footer />
      </div>
      <ProfileCard
        isOpen={showForceProfile}
        onClose={() => {}}
        forceCompletion={true}
        onProfileUpdate={handleProfileUpdate}
      />
      {user && !isVolunteer(profile) && (
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
