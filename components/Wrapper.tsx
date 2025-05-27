"use client";

import HeroSection from "@/components/HeroSection";
import FeaturedSection from "@/components/FeaturedSection";
import AboutSection from "@/components/AboutSection";
// Removed unused import: import { OurPartnersSection } from "@/components/PartnerSection";
import NorthEastCup from "@/components/NorthEastCup";
import CosplaySection from "@/components/CosplaySection";
import { VolunteerForm } from "@/components/VolunteerForm";
import { useEffect, useState } from "react";
import { ProfileCard } from "@/components/EditProfile";
import { useProfile } from "@/hooks/useProfile";
import { DiamondFab } from "@/components/VolunteerJoin";
import { isVolunteer } from "@/utils/volunteer_helper";
import { SlideInNotification } from "@/components/VolunteerNotification";
import { User } from "@supabase/supabase-js";
import { FeaturedItem, NorthEastCupItem, CosplayItem, MediaItem } from "@/types/homepageType";

interface ClientHomeProps {
  user: User | null;
  featuredData: FeaturedItem;
  eventData: MediaItem[];
  northeastcupData: NorthEastCupItem[];
  cosplayData: CosplayItem[];
}

export default function ClientHome({ user, featuredData, northeastcupData, cosplayData, eventData }: ClientHomeProps) {
   const [refreshProfileKey, setRefreshProfileKey] = useState(0);
   const { profile, loading } = useProfile();
   const [showForceProfile, setShowForceProfile] = useState(false);
   const [showForm, setShowForm] = useState(false);
   const [ forceProfileKey, setForceProfileKey] = useState(false);

  // // Removed unused function: handleOpenForm

   useEffect(() => {
     async function checkUserProfile() {
       // Ensure supabase.auth is included in the dependency array as it's used here
       if (user && !loading && !profile) {
        setForceProfileKey(true);
         setShowForceProfile(true);
       } else {
         setShowForceProfile(false);
       }
     }
     checkUserProfile();
     // Added supabase.auth to the dependency array to satisfy the hook's requirement
   }, [profile, loading, user]); // Added supabase.auth here

   // Handler to be called when profile is updated
   function handleProfileUpdate() {
     setRefreshProfileKey(k => k + 1);
     setShowForceProfile(false);
   }

  return (
    <div className="">
        <HeroSection />
        <FeaturedSection featuredData={featuredData} eventData={eventData}/>
        <NorthEastCup items={northeastcupData}/>
        <CosplaySection cosplayData={cosplayData}/>
        <AboutSection />
        <ProfileCard
        isOpen={showForceProfile}
        onClose={() => {}}
        forceCompletion={true}
        onProfileUpdate={handleProfileUpdate}
        />
        {!isVolunteer(profile) && (
        <>
          {/* Directly calling setShowForm(true) */}
          <DiamondFab onOpenForm={() => setShowForm(true)} />
          {/* Directly calling setShowForm(true) */}
          <SlideInNotification onOpenForm={() => setShowForm(true)} />
        </>
      )}
      <VolunteerForm open={showForm} onOpenChange={setShowForm} />
    </div>
  );
}
