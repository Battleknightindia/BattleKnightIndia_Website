"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TeamListType } from "@/lib/data/statsData";

type Props = {
  teams: TeamListType[] | undefined;
  onClose: () => void;
  open: boolean;
};

type TeamStatus = "pending" | "approved";

export default function TeamList({ teams, onClose, open }: Props) {
  const [teamState, setTeamState] = useState<TeamListType[]>([]);

  const statusClass: Record<TeamStatus, string> = {
    pending: "bg-amber-500",
    approved: "bg-emerald-500",
  };

  // Initialize local state with fetched teams
  useEffect(() => {
    if (teams) setTeamState(teams);
  }, [teams]);

  const toggleStatus = (id: string) => {
    const updated = teamState.map((team) =>
      team.id === id
        ? {
            ...team,
            team_status:
              team.team_status === "pending" ? "approved" : "pending",
          }
        : team
    );
    setTeamState(updated);
  };

  async function handleUpdate(){
    console.log(teamState)
    const response = await fetch("/api/update-teams", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(teamState), // build from changed data
  });

  if (response.ok) {
    console.log("Teams updated successfully");
  }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <Card className="relative w-[90%] max-w-xl bg-white shadow-xl rounded-2xl p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-900 text-2xl"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold text-zinc-900 mb-2">
          Team List: {teamState.length}
        </h2>

        <div className="flex justify-between mb-4 px-1">
          <span className="font-semibold text-zinc-700">Name</span>
          <span className="font-semibold text-zinc-700">Referral Status</span>
        </div>

        <CardContent className="space-y-2 max-h-[300px] overflow-y-auto px-1">
          {teamState.map((team) => (
            <div
              key={team.id}
              className="flex justify-between items-center border-b py-2"
            >
              <span className="text-zinc-900">{team.name}</span>
              {team.referral_code?(
                <span
                className={`text-white rounded-2xl p-1 px-3 cursor-pointer transition-colors ${
                  statusClass[team.team_status as TeamStatus]
                }`}
                onClick={() => toggleStatus(team.id)}
              >
                {team.team_status}
              </span>
              ):(
                <span></span>
              )}
            </div>
          ))}
        </CardContent>

        <div className="flex justify-center mt-4">
          <Button onClick={(handleUpdate)}>Update Changes</Button>
        </div>
      </Card>
    </div>
  );
}
