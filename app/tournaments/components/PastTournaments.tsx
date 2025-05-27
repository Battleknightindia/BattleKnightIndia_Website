'use client';

import React from "react";
import {
  Card,
  CardContent,
} from "../../../components/ui/card";
import { CalendarIcon, Clock, Trophy, Users } from "lucide-react";
import Image from "next/image";
import { PastTournament } from "@/types/tournamentsType";
import { Badge } from "@/components/ui/badge";

export default function OngoingTournaments({
  tournament,
}: {
  tournament: PastTournament;
}) {
  return (
    <Card className="flex relative h-full flex-col overflow-hidden bg-black/40 shadow-md shadow-black/10 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5">
      <div className="absolute left-4 top-4">
        <Badge className="bg-gray-500 px-3 py-1 text-white">
          Past
        </Badge>
      </div>
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={tournament.image || "/placeholder.svg"}
          alt={tournament.name || "Tournament image"}
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <CardContent className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-emerald-500" />
          <p className="text-lg font-semibold text-white">
            {tournament.prizeMoney || "N/A"}
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h3 className="line-clamp-2 text-xl font-bold text-white">
              {tournament.name || "Unnamed Tournament"}
            </h3>
            <p className="text-gray-500">{tournament.description || "No description available."}</p>
            </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-cyan-500" />
              <p className="text-sm text-muted-foreground">Tournament ended on {tournament.tournamentEndDate || "Unknown date"}</p>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <p className="text-sm text-muted-foreground">Team Slot was {tournament.teamSlots ?? "N/A"}</p>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <p className="text-sm text-muted-foreground">{tournament.total_participants || "N/A"} Team Participated</p>
            </div>
          </div>
        </div>
        
        <div className="pt-5 text-muted-foreground flex items-center justify-between">
          <h3 className="font-semibold text-muted-foreground">Champions:</h3>
          <div className="flex gap-4 items-center">
            <Image alt="team_logo" src={"/placeholder.svg"} width={50} height={50} className="rounded-full bg-white "/>
            <div className="text-white p-1 px-3">Neon Veil</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
