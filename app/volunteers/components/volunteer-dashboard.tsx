"use client";

import { useState, useEffect } from "react";

import ReferredTeamsSection from "./referredteamlist";

import { Copy, Diamond, ExternalLink, HelpCircle, Users} from "lucide-react";
// Removed unused import: import { Search } from "lucide-react";


import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
// Removed unused imports: import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { volunteerData, REFERRALTOAST} from "@/lib/constant/volunteers_page";
import { useProfile } from "@/hooks/useProfile";
import { getInitials, getAvatarColor} from "@/lib/profileData";
import { createClient } from "@/utils/supabase/client";
import { useVolunteer } from "@/hooks/useVolunteer";

export function Volunteer() {
  const { volunteer } = useVolunteer();
  const { toast } = useToast();
  const { profile } = useProfile();
  const [initials, setInitials] = useState<string>("??");
  const [avatarColor, setAvatarColor] = useState<string>("");
  // Removed unused state: const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      // Add supabase.auth to the dependency array as it's used here
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) console.error(error);

      // If user is logged in, fetch avatar data
      if (user) {
        try {
          const userInitials = await getInitials();
          const userAvatarColor = await getAvatarColor();
          // Removed setAvatarUrl as avatarUrl state is unused
          // const userAvatarUrl = await getAvatarUrl();

          setInitials(userInitials);
          setAvatarColor(userAvatarColor);
          // Removed setAvatarUrl as avatarUrl state is unused
          // setAvatarUrl(userAvatarUrl);
        } catch (error) {
          console.error("Error fetching avatar data:", error);
        }
      }
    };

    getUser();
    // Added supabase.auth to the dependency array
  }, [supabase.auth]); // Added supabase.auth here

  const copyReferralCode = () => {
    navigator.clipboard.writeText(volunteerData.referralCode);
    toast(REFERRALTOAST);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-3 md:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Welcome back, {profile?.fullName || "Not Provided"}
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Profile Section */}
          <Card className="bg-white text-zinc-900 rounded-[20px] shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold tracking-tight">
                Volunteer Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-blue-600">
                    <Avatar className="h-full w-full">
                      {/* AvatarImage likely uses Next.js Image internally */}
                      <AvatarImage
                        src={profile?.avatar_url || undefined}
                        alt={profile?.ign || "User"}
                        className="h-full w-full object-cover"
                      />
                      <AvatarFallback
                        className={`h-full w-full flex items-center justify-center text-zinc-950 text-xs bg-gradient-to-br ${avatarColor}`}
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg">{profile?.fullName || "Not Provided"}</h3>
                  <p className="text-zinc-500 text-sm">{profile?.ign || "Not Provided"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-2">
                <div className="space-y-1.5">
                  <p className="text-xs font-medium uppercase text-zinc-500">
                    Game ID
                  </p>
                  <p className="text-sm font-medium">{profile?.game_id || "Not Provided"}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-medium uppercase text-zinc-500">
                    Server ID
                  </p>
                  <p className="text-sm font-medium">{profile?.server_id || "Not Provided"}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-medium uppercase text-zinc-500">
                    State
                  </p>
                  <p className="text-sm font-medium">{profile?.state || "Not Provided"}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-medium uppercase text-zinc-500">
                    City
                  </p>
                  <p className="text-sm font-medium">{profile?.city || "Not Provided"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Referral Code Section */}
          <Card className="bg-white text-zinc-900 rounded-[20px] shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold tracking-tight">
                Your Referral Code
              </CardTitle>
              <CardDescription>
                Share this code with teams during registration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex items-center gap-1">
                <div className="relative flex-1">
                  <Input
                    value={volunteer?.referral_code|| "-----------"}
                    readOnly
                    className="bg-zinc-100 text-center font-bold text-lg py-6 border-2 border-zinc-200"
                  />
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={copyReferralCode}
                        className="bg-black hover:bg-black/80 text-white rounded-md h-12 w-12"
                      >
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy Code</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy to clipboard</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-100 rounded-xl p-5 text-center">
                  <div className="flex items-center justify-center gap-2 text-2xl font-bold text-blue-600">
                    <Users className="h-5 w-5" />
                    {volunteer?.total_teams || "0"}
                  </div>
                  <p className="text-xs font-medium uppercase text-zinc-500 mt-2">
                    Teams Joined
                  </p>
                </div>
                <div className="bg-zinc-100 rounded-xl p-5 text-center">
                  <div className="flex items-center justify-center gap-2 text-2xl font-bold text-blue-600">
                    <Diamond className="h-5 w-5" />
                    {volunteer?.reward_points || "0"}
                  </div>
                  <p className="text-xs font-medium uppercase text-zinc-500 mt-2">
                    Diamonds Earned
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions Section */}
          <Card className="bg-white text-zinc-900 rounded-[20px] shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold tracking-tight">
                Volunteer Instructions
              </CardTitle>
              <CardDescription>
                Guidelines for team referrals and rewards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
                <p className="text-sm">
                  Provide your referral code to teams during the registration
                  process.
                </p>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
                <p className="text-sm">
                  Each successful team registration earns 100 diamonds upon
                  approval.
                </p>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
                <p className="text-sm">
                  Rewards are credited within 24 hours of team approval by
                  administrators.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <ReferredTeamsSection />
      </div>
    </div>
  );
}
