'use client';
import HeroSection from "@/components/HeroSection";
import FeaturedSection from "@/components/FeaturedSection";
import AboutSection from "@/components/AboutSection";
// Removed unused import: import { OurPartnersSection } from "@/components/PartnerSection";
import NorthEastCup from "@/components/NorthEastCup";
import CosplaySection from "@/components/CosplaySection";
import Footer from "@/components/Footer";
import { createClient } from "@/utils/supabase/client";
import { ProfileCard } from "@/components/EditProfile";
import { useProfile } from "@/hooks/useProfile";
import NavBar from "@/components/NavBar";
import { useState } from "react";
export default function Home() {
  const supabase = createClient();
  const [refreshProfileKey, setRefreshProfileKey] = useState(0);
  const { profile, loading } = useProfile();
  const [showForceProfile, setShowForceProfile] = useState(false);

  // Removed unused function: handleOpenForm

  useEffect(() => {
    async function checkUserProfile() {
      // Ensure supabase.auth is included in the dependency array as it's used here
      const { data: { user } } = await supabase.auth.getUser();
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
        <div id="home">
          <HeroSection />
        </div>
        <div id="featured">
          <FeaturedSection />
        </div>
        <div id="northeastcup">
          <NorthEastCup />
        </div>
        <div id="cosplay">
          <CosplaySection />
        </div>
        <div id="about">
          <AboutSection />
        </div>
        <Footer />
      </div>
      <ProfileCard
        isOpen={showForceProfile}
        onClose={() => {}}
        forceCompletion={true}
        onProfileUpdate={handleProfileUpdate}
      />
    </>
  );
}
