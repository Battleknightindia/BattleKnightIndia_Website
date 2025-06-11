"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/utils/supabase/client";
import { TeamListType } from "@/lib/data/stats_data";
import TournamentManagerBlock from "../Blocks/TournamentManagerBlock"; 
import StatsOverviewBlock from "../Blocks/StatsOverviewBlock";
import HomepageContentManagerBlock from "../Blocks/HomepageContentManagerBlock";

interface AdminPanelProps {
  teams: TeamListType[] | undefined;
}

export default function AdminPanel({ teams }: AdminPanelProps){
  const { toast } = useToast();
  const supabase = createClient();
  const [teamsCount, setTeamsCount] = useState<number>(0);
  const [volunteersCount, setVolunteersCount] = useState<number>(0);
  const [usersCount, setUsersCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true); // For initial stats loading

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select("id");
      if (!teamsError && teamsData) setTeamsCount(teamsData.length);

      const { data: volunteersData, error: volError } = await supabase
        .from("volunteers")
        .select("volunteer_id");
      if (volError) {
        console.error('Error fetching volunteers:', volError);
      } else {
        console.log('Volunteers data:', volunteersData);
        if (volunteersData) setVolunteersCount(volunteersData.length);
      }

      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("user_id");
      if (usersError) {
        console.error('Error fetching users:', usersError);
      } else {
        console.log('Users data:', usersData);
        if (usersData) setUsersCount(usersData.length);
      }
      setLoading(false);
    }

    fetchStats();
  }, [supabase, toast]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-3 md:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Admin Panel
          </h1>
        </header>

        {/* Stats Cards */}
        <StatsOverviewBlock teamsCount={teamsCount} volunteersCount={volunteersCount} usersCount={usersCount} teams={teams} />

        <TournamentManagerBlock />

        {/* Homepage Content Management */}
        <HomepageContentManagerBlock />
      </div>
    </div>
  );
}
