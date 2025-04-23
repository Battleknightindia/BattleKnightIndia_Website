"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import { Copy, Diamond, ExternalLink, HelpCircle, Search, Users} from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { volunteerData, referredTeams, REFERRALTOAST} from "@/lib/constant/volunteers_page";
import { useProfile } from "@/hooks/useProfile";
import { getInitials, getAvatarColor, getAvatarUrl } from "@/lib/profileData";
import { createClient } from "@/utils/supabase/client";
import { useVolunteer } from "@/hooks/useVolunteer";

export function Volunteer() {
  const { volunteer } = useVolunteer();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const { profile } = useProfile();
  const [initials, setInitials] = useState<string>("??");
  const [avatarColor, setAvatarColor] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
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
          const userAvatarUrl = await getAvatarUrl();

          setInitials(userInitials);
          setAvatarColor(userAvatarColor);
          setAvatarUrl(userAvatarUrl);
        } catch (error) {
          console.error("Error fetching avatar data:", error);
        }
      }
    };

    getUser();
  }, []);

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
        {/* <Card className="bg-white text-zinc-900 rounded-[20px] shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold tracking-tight">
              Teams Referred
            </CardTitle>
            <CardDescription>
              Monitor and manage your team referrals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <TabsList className="bg-zinc-100">
                  <TabsTrigger value="all">All Teams</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                </TabsList>
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input
                    type="search"
                    placeholder="Search teams..."
                    className="pl-8 w-full sm:w-[250px] bg-zinc-100 border-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="md:hidden">
                <TabsContent value="all" className="m-0 space-y-4">
                  {filteredTeams.length > 0 ? (
                    filteredTeams.map((team) => (
                      <Card
                        key={team.id}
                        className="overflow-hidden border border-zinc-200"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-full overflow-hidden bg-zinc-200 flex-shrink-0">
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
                </TabsContent>

                <TabsContent value="approved" className="m-0 space-y-4">
                  {filteredTeams.filter((team) => team.status === "approved")
                    .length > 0 ? (
                    filteredTeams
                      .filter((team) => team.status === "approved")
                      .map((team) => (
                        <Card
                          key={team.id}
                          className="overflow-hidden border border-zinc-200"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="h-10 w-10 rounded-full overflow-hidden bg-zinc-200 flex-shrink-0">
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
                      <p className="text-zinc-500">No approved teams found.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="pending" className="m-0 space-y-4">
                  {filteredTeams.filter((team) => team.status === "pending")
                    .length > 0 ? (
                    filteredTeams
                      .filter((team) => team.status === "pending")
                      .map((team) => (
                        <Card
                          key={team.id}
                          className="overflow-hidden border border-zinc-200"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="h-10 w-10 rounded-full overflow-hidden bg-zinc-200 flex-shrink-0">
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
                      <p className="text-zinc-500">No pending teams found.</p>
                    </div>
                  )}
                </TabsContent>
              </div>

              <div className="hidden md:block">
                <TabsContent value="all" className="m-0">
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
                          {filteredTeams.length > 0 ? (
                            filteredTeams.map((team, index) => (
                              <tr
                                key={team.id}
                                className={
                                  index % 2 === 0 ? "bg-white" : "bg-zinc-50"
                                }
                              >
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full overflow-hidden bg-zinc-200">
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
                                  {getStatusBadge(team.status)}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={6}
                                className="p-6 text-center text-zinc-500"
                              >
                                No teams found matching your search criteria.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="approved" className="m-0">
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
                          {filteredTeams.filter(
                            (team) => team.status === "approved"
                          ).length > 0 ? (
                            filteredTeams
                              .filter((team) => team.status === "approved")
                              .map((team, index) => (
                                <tr
                                  key={team.id}
                                  className={
                                    index % 2 === 0 ? "bg-white" : "bg-zinc-50"
                                  }
                                >
                                  <td className="p-4">
                                    <div className="flex items-center gap-3">
                                      <div className="h-8 w-8 rounded-full overflow-hidden bg-zinc-200">
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
                                    {getStatusBadge(team.status)}
                                  </td>
                                </tr>
                              ))
                          ) : (
                            <tr>
                              <td
                                colSpan={6}
                                className="p-6 text-center text-zinc-500"
                              >
                                No approved teams found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="pending" className="m-0">
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
                          {filteredTeams.filter(
                            (team) => team.status === "pending"
                          ).length > 0 ? (
                            filteredTeams
                              .filter((team) => team.status === "pending")
                              .map((team, index) => (
                                <tr
                                  key={team.id}
                                  className={
                                    index % 2 === 0 ? "bg-white" : "bg-zinc-50"
                                  }
                                >
                                  <td className="p-4">
                                    <div className="flex items-center gap-3">
                                      <div className="h-8 w-8 rounded-full overflow-hidden bg-zinc-200">
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
                                    {getStatusBadge(team.status)}
                                  </td>
                                </tr>
                              ))
                          ) : (
                            <tr>
                              <td
                                colSpan={6}
                                className="p-6 text-center text-zinc-500"
                              >
                                No pending teams found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>*/}
      </div>
    </div>
  );
}
