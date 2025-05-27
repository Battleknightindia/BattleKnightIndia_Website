"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ProgressForm } from "./ProgressTournament";
import type { Tournament, TournamentForms, TournamentStatus } from "@/types/tournamentsType";



interface TournamentListProps {
  tournaments: Tournament[];
  onAddTournament: () => void;
  onDeleteTournament: (name: string,id: string, url:string) => void;
  onUpdateTournament: (tournament: Tournament) => void;
  deleting: { [id: string]: boolean };
}

export function TournamentList({
  tournaments,
  onAddTournament,
  onDeleteTournament,
  onUpdateTournament,
  deleting,
}: TournamentListProps) {
  const [progressOpen, setProgressOpen] = useState<boolean>(false);
  const [progressOpenId, setProgressOpenId] = useState<string | null>(null);
  const [progressForm, setProgressForm] = useState<TournamentForms | undefined>();
  const [progressStatus, setProgressStatus] = useState<TournamentStatus | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const statusStyles: Record<TournamentStatus, string> = {
    upcoming: "bg-amber-500 text-white",
    registration: "bg-emerald-500 text-white",
    live: "bg-red-500 text-white",
    past: "bg-gray-500 text-white",
  };
  const handleOpenProgress = (t: Tournament) => {
  setProgressOpen(true);
  setProgressOpenId(t.id);
  setProgressStatus(t.status as TournamentStatus);
  setProgressForm({
    ...t,
    champions_logo: t.champions_logo || "", // could be a string from Supabase
  });
};
  const handleCloseProgress = () => {
    setProgressOpen(false);
    setProgressOpenId(null);
    setProgressStatus(null);
  };
  return (
    <Card className="bg-white text-zinc-900 rounded-[20px] shadow-lg mt-8">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <CardTitle className="text-xl font-bold tracking-tight">Tournaments</CardTitle>
          <Button className="bg-blue-600 md:hidden" onClick={onAddTournament}>+</Button>
        </div>
        <Button className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition" onClick={onAddTournament}>
          + Add Tournament
        </Button>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          {tournaments.length === 0 && (
            <div className="text-center text-zinc-500 py-8 col-span-full">
              No tournaments found.
            </div>
          )}

          {tournaments.map((t) => {
            return (
              <AccordionItem key={t.id} value={t.id} className="mb-2 border rounded-full">
                <AccordionTrigger className="bg-gray-200 rounded-2xl flex justify-between items-center px-4 py-3 text-lg font-semibold">
                  <span className="flex items-center gap-2">
                    <span>{t.name}</span>
                  </span>
                  <Badge className={`px-3 py-1 -mr-38 rounded-full ${statusStyles[t.status as TournamentStatus]}`}>
                    {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                  </Badge>
                </AccordionTrigger>
                <AccordionContent className="bg-zinc-50 px-4 relative pb-4 rounded-b-2xl">


                  {/* Delete Button */}
                  <div className="flex absolute top-4 right-4">
                    <Button
                      size="icon"
                      className="bg-red-500 text-white hover:bg-red-600"
                      onClick={() => onDeleteTournament(t.name ,t.id, t.image || "")}
                      aria-label="Delete Tournament"
                      disabled={!!deleting[t.id]}
                    >
                      {deleting[t.id] ? <span className="loader h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>

                  {/* Image */}
                  {t.image && (
                    <div className="pt-3 mb-3">
                      <Image
                        src={t.image}
                        width={300}
                        height={200}
                        alt={`${t.name} Banner`}
                        className="flex justify-center items-center rounded-lg shadow-md object-cover"
                      />
                    </div>
                  )}

                  {/* Tournament Info */}
                  <div className="mt-5 space-y-2 text-sm">
                    <p><strong>Prize Money:</strong> {t.prizemoney || "-"}</p>
                    <p><strong>Team Slots:</strong> {t.teamslots || "-"}</p>
                    <p><strong>Registration Start Date:</strong> {t.registration_start_date || "-"}</p>
                    {t.registration_end_date ? (
                      <p><strong>Registration End Date:</strong> {t.registration_end_date || "-"}</p>
                    ) : (
                      <div className=""></div>
                    )}
                    { t.startdate && !t.enddate ?(
                      <p><strong> Tournament Start Date:</strong> {t.startdate || "-"}</p>
                    ): t.startdate && t.enddate ?(
                      <div className="space-y-2">
                        <p><strong>Tournament Start Date:</strong> {t.startdate || "-"}</p>
                        <p><strong>Tournament End Date:</strong> {t.enddate || "-"}</p>
                      </div>
                    ):(
                      <div className=""></div>
                    )}
                    {t.total_participants ? (
                      <p><p><strong> Total Team Participated:</strong> {t.total_participants || "-"}</p></p>
                    ):(
                      <p></p>
                    )}
                    <p><strong>Description:</strong> {t.description || "-"}</p>
                    {t.registrationlink && ! t.livestreamlink ?(
                       <p><strong>Registration Link:</strong> {t.registrationlink || "-"}</p>
                    ): t.registrationlink && t.livestreamlink ? (
                       <div className="space-y-2">
                        <p><strong>Live Stream Link:</strong> {t.livestreamlink || "-"}</p>
                        <p><strong>Registration Link:</strong> {t.registrationlink || "-"}</p>
                       </div>
                    ):(
                      <p></p>
                    )}
                    {t.champions ? (
                      <div className="space-y-2">
                        <p><strong>Champions:</strong> {t.champions || "-"}</p>
                       <Image
                        src={t.champions_logo || ""}
                        width={300}
                        height={200}
                        alt={`${t.champions} Logo`}
                        className="flex justify-center items-center rounded-lg shadow-md object-cover"
                      />
                      </div>
                    ):(
                      <p></p>
                    )}

                  </div>

                  <div className="pt-4 flex gap-2">
                    <Button className="bg-emerald-500" onClick={() => handleOpenProgress(t)}>
                      Progress ({t.status.charAt(0).toUpperCase() + t.status.slice(1)})
                    </Button>
                    <Button className="bg-blue-500" onClick={() => onUpdateTournament(t)}>Update</Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
      <ProgressForm
        open={!!progressOpenId}
        status={progressStatus}
        onClose={handleCloseProgress}
        form={progressForm}
        tournamentId={progressOpenId}
      />
    </Card>
  );
}
