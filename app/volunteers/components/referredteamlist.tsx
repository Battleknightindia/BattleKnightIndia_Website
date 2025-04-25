import React, { useState, useEffect } from 'react';
// Assuming these components are imported from your UI library (e.g., shadcn/ui)
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge"; // <<< Added import for Badge
// Assuming Image is a component for handling images (e.g., from Next.js or similar)
import Image from 'next/image';

// Import the data fetching function from your volunteersData.ts file
// Adjust the import path as necessary based on your project structure
import { fetchTeamsByReferralCodeAndCaptainData } from "@/lib/volunteersData"; // <<< ADJUST PATH

// getStatusBadge is defined and will be called in the JSX
// Using the getStatusBadge implementation provided by the user
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

// Define the type for the data structure returned by fetchTeamsByReferralCodeAndCaptainData
// This should match the structure you defined or expect from your volunteersData.ts
interface ReferredTeam {
    id: string; // Based on your teams table schema (uuid)
    logo: string | null; // Based on your teams table schema (logo_url text null)
    name: string;
    captainName: string; // This should correspond to the captain's IGN from 'players'
    captainGameId: string; // From 'players'
    captainServerId: string; // From 'players'
    registrationDate: string; // Corresponds to 'created_at' (timestamp)
    status: string | null; // Corresponds to 'team_status' (text null)
}


// Define the React component
const ReferredTeamsSection: React.FC = () => {
  const [teams, setTeams] = useState<ReferredTeam[]>([]); // State to hold all fetched teams
  const [filteredTeams, setFilteredTeams] = useState<ReferredTeam[]>([]); // State for filtered teams (used for display)
  const [searchQuery, setSearchQuery] = useState<string>(""); // State for the search input
  const [loading, setLoading] = useState<boolean>(true); // State to indicate loading status
  const [error, setError] = useState<string | null>(null); // State to hold any error messages

  // Assume the referral_code is available here, e.g., from context, props, or a constant
  // As per your instruction, we assume referralCode is available in this scope.
  // Replace "YOUR_STATIC_REFERRAL_CODE" with how you obtain the referral code if it's not a constant
  const referralCode = "YOUR_STATIC_REFERRAL_CODE"; // <<< IMPORTANT: Ensure this variable holds the correct referral code

  // useEffect to fetch data when the component mounts or referralCode changes
  useEffect(() => {
    const loadTeams = async () => {
      setLoading(true);
      setError(null);
      try {
        // Call the imported data fetching function
        const fetchedTeams = await fetchTeamsByReferralCodeAndCaptainData();
        setTeams(fetchedTeams); // Store all fetched teams
        setFilteredTeams(fetchedTeams); // Initially, filtered teams are all fetched teams
      } catch (err: any) { // Use 'any' or a more specific error type if known
        console.error("Failed to fetch referred teams:", err);
        setError(`Failed to load referred teams: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    // Only load teams if referralCode is available (optional, but good practice if referralCode might be initially null/undefined)
    if (referralCode) {
        loadTeams();
    } else {
        setLoading(false); // Stop loading if no referral code is available
        setError("Referral code not provided.");
    }

  }, [referralCode]); // Re-run effect if referralCode changes

  // useEffect to filter teams based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTeams(teams); // If search query is empty, show all teams
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = teams.filter(team =>
        team.name.toLowerCase().includes(lowerCaseQuery) ||
        team.captainName.toLowerCase().includes(lowerCaseQuery) ||
        team.captainGameId.toLowerCase().includes(lowerCaseQuery) ||
        team.captainServerId.toLowerCase().includes(lowerCaseQuery) ||
        team.status?.toLowerCase().includes(lowerCaseQuery)
      );
      setFilteredTeams(filtered); // Update filtered teams based on search
    }
  }, [searchQuery, teams]); // Re-run effect when searchQuery or teams change


  return (
    // Teams Referred Section - Using the JSX structure you provided
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
        <div className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="relative w-full sm:w-auto">
              {/* Using the Search icon from lucide-react directly */}
              {/* Ensure lucide-react is installed and configured if you prefer using its components */}
              {/* For simplicity, keeping the SVG icon as provided */}
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

          {loading && (
              <div className="p-8 text-center">
                  <p className="text-zinc-500">Loading teams...</p>
              </div>
          )}

          {error && (
              <div className="p-8 text-center text-red-600">
                  <p>{error}</p>
              </div>
          )}

          {!loading && !error && (
            <>
              {/* Mobile View */}
              <div className="md:hidden">
                {filteredTeams.length > 0 ? (
                  filteredTeams.map((team) => (
                    <Card
                      key={team.id}
                      className="overflow-hidden border border-zinc-200 mb-4" // Added margin bottom for spacing
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-10 w-10 rounded-full overflow-hidden bg-zinc-200 flex-shrink-0">
                            {/* Using Image component */}
                            {/* Ensure your Image component handles the src correctly */}
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
                          <div>{getStatusBadge(team.status || "")}</div>
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

              {/* Desktop View */}
              <div className="hidden md:block">
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
                            <th className="p-4 text-sm font-medium uppercase text-zinc-500">
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
                                {getStatusBadge(team.status || "")}
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
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferredTeamsSection;
