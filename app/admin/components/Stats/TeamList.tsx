"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { TeamListType } from "@/lib/data/stats_data";
import { updateTeamsApiClient } from "@/lib/client/stats";
import { statusClass, TeamStatus } from "@/lib/constant/stats_page";

type StatusFilter = "all" | TeamStatus;

type Props = {
  teams: TeamListType[] | undefined;
  onClose: () => void;
  open: boolean;
};

export default function TeamList({ teams, onClose, open }: Props) {
  const [teamState, setTeamState] = useState<TeamListType[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const getDisplayStatus = (team: TeamListType): TeamStatus => {
    return team.referral_code
      ? (team.team_status as TeamStatus)
      : "no_referral";
  };

  useEffect(() => {
    if (teams) setTeamState(teams);
  }, [teams]);

  const toggleStatus = (id: string) => {
    const updated = teamState.map((team) =>
      team.id === id && team.referral_code
        ? {
            ...team,
            team_status:
              team.team_status === "pending" ? "approved" : "pending",
          }
        : team
    );
    setTeamState(updated);
  };

  useEffect(() => {
  if (open) {
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
}, [open]);


  async function handleUpdate() {
    try {
      const result = await updateTeamsApiClient(teamState); 
      if (result.success) {
        console.log("Teams updated successfully:", result.results);
      } else {
        console.error("Failed to update teams:", result.error);
      }
    } catch (error) {
      console.error("Error during team update process:", error);
    }
  }

  if (!open) return null;

  const filteredTeams = teamState.filter((team) => {
    const displayStatus = getDisplayStatus(team);
    return statusFilter === "all" || displayStatus === statusFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <Card className="relative w-[90%] max-w-xl bg-white shadow-xl rounded-2xl p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-900 text-2xl"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold text-zinc-900 mb-4">
          Team List: {filteredTeams.length}
        </h2>

        {/* Search and Filter Section */}
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="border rounded-md px-2 py-1 text-sm"
          >
            <option value="all">All</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="no_referral">No Referral</option>
          </select>
        </div>

        <div className="flex justify-between mb-2 px-1">
          <span className="font-semibold text-zinc-700">Name</span>
          <span className="font-semibold text-zinc-700">Referral Status</span>
        </div>

        <CardContent className="space-y-2 max-h-[300px] overflow-y-auto px-1">
          {filteredTeams.map((team) => {
            const displayStatus = getDisplayStatus(team);
            const canToggle = displayStatus !== "no_referral";

            return (
              <div
                key={team.id}
                className="flex justify-between items-center border-b py-2"
              >
                <span className="text-zinc-900">{team.name}</span>
                <span
                  className={`text-white rounded-2xl p-1 px-3 ${
                    statusClass[displayStatus]
                  } ${canToggle ? "cursor-pointer transition-colors" : ""}`}
                  onClick={() => canToggle && toggleStatus(team.id)}
                >
                  {displayStatus}
                </span>
              </div>
            );
          })}
        </CardContent>

        <div className="flex justify-center mt-4">
          <Button onClick={handleUpdate}>Update Changes</Button>
        </div>
      </Card>
    </div>
  );
}
