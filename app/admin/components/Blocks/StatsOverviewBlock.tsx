"use client";
// StatsOverviewBlock.tsx
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, User } from "lucide-react";
import TeamList from "../Stats/TeamList"; // Adjust path as necessary
import { TeamListType } from "@/lib/data/stats_data"; // Adjust path as necessary

interface StatsOverviewBlockProps {
  teamsCount: number;
  volunteersCount: number;
  usersCount: number;
  teams: TeamListType[] | undefined;
}

export default function StatsOverviewBlock({
  teamsCount,
  volunteersCount,
  usersCount,
  teams,
}: StatsOverviewBlockProps) {
  const [TeamOpen, setTeamOpen] = useState<boolean>(false);

  // Effect to handle body scroll when modal is open/closed
  useEffect(() => {
    if (TeamOpen) {
      document.body.style.overflow = "hidden"; // desktop
      document.body.style.touchAction = "none"; // mobile touch scroll
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [TeamOpen]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Teams Card */}
        <Card className="bg-white text-zinc-900 rounded-[20px] shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamsCount}</div>
            <Button
              className="mt-2 text-xs"
              variant="outline"
              onClick={() => setTeamOpen(true)}
            >
              View Teams
            </Button>
          </CardContent>
        </Card>

        {/* Volunteers Card */}
        <Card className="bg-white text-zinc-900 rounded-[20px] shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Volunteers
            </CardTitle>
            <User className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{volunteersCount}</div>
            <p className="text-xs text-muted-foreground">
              Number of registered volunteers
            </p>
          </CardContent>
        </Card>

        {/* Users Card */}
        <Card className="bg-white text-zinc-900 rounded-[20px] shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <User className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersCount}</div>
            <p className="text-xs text-muted-foreground">
              Number of registered users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* TeamList Modal */}
      {teams && (
        <TeamList
          open={TeamOpen}
          onClose={() => setTeamOpen(false)}
          teams={teams}
        />
      )}
    </>
  );
}
