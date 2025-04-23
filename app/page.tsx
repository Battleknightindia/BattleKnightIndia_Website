'use client';
import HeroSection from "@/components/HeroSection";
import FeaturedSection from "@/components/FeaturedSection";
import AboutSection from "@/components/AboutSection";
import { OurPartnersSection } from "@/components/PartnerSection";
import NorthEastCup from "@/components/NorthEastCup";
import CosplaySection from "@/components/CosplaySection";
import Footer from "@/components/Footer";
import { VolunteerForm } from "@/components/VolunteerForm"; 
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ProfileCard } from "@/components/EditProfile";
import { useProfile } from "@/hooks/useProfile";
import NavBar from "@/components/NavBar";
import { DiamondFab } from "@/components/VolunteerJoin";
import { isVolunteer } from "@/utils/volunteer_helper";
import { SlideInNotification } from "@/components/VolunteerNotification";

export default function Home() {
  const supabase = createClient();
  const [refreshProfileKey, setRefreshProfileKey] = useState(0);
  const { profile, loading } = useProfile();
  const [showForceProfile, setShowForceProfile] = useState(false);
  const [showForm, setShowForm] = useState(false)

  const handleOpenForm = () => {
    setShowForm(true)
  }
  
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
    // Also re-check if profile or loading changes
  }, [profile, loading]);

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
        {/* <div id="partners">
          <OurPartnersSection />
        </div> */}
        <Footer />
      </div>
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
