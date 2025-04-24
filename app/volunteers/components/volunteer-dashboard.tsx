"use client";

import { useState, useEffect } from "react";
// Restored import:
import Image from "next/image";


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

import { volunteerData, referredTeams, REFERRALTOAST} from "@/lib/constant/volunteers_page";
import { useProfile } from "@/hooks/useProfile";
import { getInitials, getAvatarColor} from "@/lib/profileData";
import { createClient } from "@/utils/supabase/client";
import { useVolunteer } from "@/hooks/useVolunteer";

export function Volunteer() {
  const { volunteer } = useVolunteer();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
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

  // filteredTeams is calculated and will now be used in the JSX
  const filteredTeams = referredTeams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.captainName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.captainGameId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const copyReferralCode = () => {
    navigator.clipboard.writeText(volunteerData.referralCode);
    toast(REFERRALTOAST);
  };

  // getStatusBadge is defined and will be called in the JSX
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-emerald-500 hover:bg-emerald-600">
            Approved
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600">Pending</Badge>
        );
      case "rejected":
        return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600">Unknown</Badge>;
    }
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
                    {volunteer?.team_count || "0"}
                  </div>
                  <p className="text-xs font-medium uppercase text-zinc-500 mt-2">
                    Teams Joined
                  </p>
                </div>
                <div className="bg-zinc-100 rounded-xl p-5 text-center">
                  <div className="flex items-center justify-center gap-2 text-2xl font-bold text-blue-600">
                    <Diamond className="h-5 w-5" />
                    {volunteer?.reward_point || "0"}
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
                  Each successful team registration earns 300 diamonds upon
                  approval.
                </p>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
                <p className="text-sm">
                  Achieve a bonus of 1000 diamonds when 10+ teams register with
                  your code.
                </p>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
                <p className="text-sm">
                  Rewards are credited within 24 hours of team approval by
                  administrators.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Documentation
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full">
                <HelpCircle className="mr-2 h-4 w-4" />
                Support Center
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Teams Referred Section */}
        <Card className="bg-white text-zinc-900 rounded-[20px] shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold tracking-tight">
              Teams Referred
            </CardTitle>
            <CardDescription>
              Monitor and manage your team referrals
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Using a div instead of Tabs as Tabs components were unused */}
            <div className="w-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                {/* Removed TabsList */}
                {/* Replaced Search icon with lucide-react Search component */}
                <div className="relative w-full sm:w-auto">
                  {/* Using the Search icon from lucide-react directly */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                  <Input
                    type="search"
                    placeholder="Search teams..."
                    className="pl-8 w-full sm:w-[250px] bg-zinc-100 border-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              {/* Using divs instead of TabsContent */}
              <div className="md:hidden">
                {/* Using filteredTeams directly */}
                {filteredTeams.length > 0 ? (
                  filteredTeams.map((team) => (
                    <Card
                      key={team.id}
                      className="overflow-hidden border border-zinc-200"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-10 w-10 rounded-full overflow-hidden bg-zinc-200 flex-shrink-0">
                            {/* Using Image component */}
                            <Image
                              src={team.logo || "/placeholder.svg"}
                              alt={team.name}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-base truncate">
                              {team.name}
                            </h4>
                            <p className="text-xs text-zinc-500">
                              Captain: {team.captainName}
                            </p>
                          </div>
                          {/* Calling getStatusBadge */}
                          <div>{getStatusBadge(team.status)}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-zinc-500 font-medium uppercase mb-1">
                              Game ID
                            </p>
                            <p className="font-medium">
                              {team.captainGameId}
                            </p>
                          </div>
                          <div>
                            <p className="text-zinc-500 font-medium uppercase mb-1">
                              Server ID
                            </p>
                            <p className="font-medium">
                              {team.captainServerId}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-zinc-500 font-medium uppercase mb-1">
                              Registered On
                            </p>
                            <p className="font-medium">
                              {team.registrationDate}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-zinc-500">
                      No teams found matching your search criteria.
                    </p>
                  </div>
                )}
              </div>

              <div className="hidden md:block">
                {/* Using filteredTeams directly */}
                {filteredTeams.length > 0 ? (
                  <div className="rounded-lg border border-zinc-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-zinc-100 text-left">
                            <th className="p-4 text-xs font-medium uppercase text-zinc-500">
                              Team
                            </th>
                            <th className="p-4 text-xs font-medium uppercase text-zinc-500">
                              Captain
                            </th>
                            <th className="p-4 text-xs font-medium uppercase text-zinc-500">
                              Game ID
                            </th>
                            <th className="p-4 text-xs font-medium uppercase text-zinc-500">
                              Server ID
                            </th>
                            <th className="p-4 text-xs font-medium uppercase text-zinc-500">
                              Registered On
                            </th>
                            <th className="p-4 text-xs font-medium uppercase text-zinc-500">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTeams.map((team, index) => (
                            <tr
                              key={team.id}
                              className={
                                index % 2 === 0 ? "bg-white" : "bg-zinc-50"
                              }
                            >
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full overflow-hidden bg-zinc-200">
                                    {/* Using Image component */}
                                    <Image
                                      src={team.logo || "/placeholder.svg"}
                                      alt={team.name}
                                      width={40}
                                      height={40}
                                      className="object-cover"
                                    />
                                  </div>
                                  <span className="font-medium">
                                    {team.name}
                                  </span>
                                </div>
                              </td>
                              <td className="p-4 text-sm">
                                {team.captainName}
                              </td>
                              <td className="p-4 text-sm">
                                {team.captainGameId}
                              </td>
                              <td className="p-4 text-sm">
                                {team.captainServerId}
                              </td>
                              <td className="p-4 text-sm">
                                {team.registrationDate}
                              </td>
                              <td className="p-4 text-sm">
                                {/* Calling getStatusBadge */}
                                {getStatusBadge(team.status)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-zinc-500">
                      No teams found matching your search criteria.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
