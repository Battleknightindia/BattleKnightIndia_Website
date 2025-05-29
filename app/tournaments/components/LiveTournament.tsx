import React from "react";
import Image from "next/image";
import { Trophy, Users, Clock, Eye, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchLiveTournament } from "@/lib/data/tournament_data";

export default async function LiveTournament() {
  const liveTournament = await fetchLiveTournament();
  return (
    <section className="mb-20">
      {liveTournament ? (
        <div className="">
          <div className="mb-6 flex items-center">
        <span className="mr-3 h-3 w-3 animate-pulse rounded-full bg-red-500"></span>
        <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
          Live Now
        </h2>
      </div>
          <Card className="overflow-hidden bg-black/40 shadow-lg shadow-black/20">
        <Tabs defaultValue="video" className="w-full">
          <div className="flex justify-end p-4">
            <TabsList className="bg-black/50">
              <TabsTrigger
                value="video"
                className="data-[state=active]:bg-black/80"
              >
                <Video className="mr-2 h-4 w-4" />
                Video
              </TabsTrigger>
              <TabsTrigger
                value="image"
                className="data-[state=active]:bg-black/80"
              >
                <Eye className="mr-2 h-4 w-4" />
                Image
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="video" className="mt-0">
            <div className="flex flex-col lg:flex-row">
              <div className="relative h-72 w-full lg:h-[400px] lg:w-3/5">
                {/* Video placeholder - in a real app, this would be a video player */}
                <div className="flex h-full w-full items-center justify-center bg-black/80">
                  <div className="text-center">
                    <Video className="mx-auto h-16 w-16 text-red-500 opacity-50" />
                    <p className="mt-4 text-muted-foreground">
                      Video stream would appear here
                    </p>
                  </div>
                </div>
                <div className="absolute left-4 top-4">
                  <Badge className="bg-red-500 px-3 py-1 text-white">
                    LIVE
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col justify-between p-6 lg:w-2/5">
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <Trophy className="h-6 w-6 text-emerald-500" />
                    <span className="text-xl font-bold text-white">
                      {liveTournament.prizeMoney}
                    </span>
                  </div>

                  <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">
                    {liveTournament.name}
                  </h2>

                  <p className="mb-6 text-muted-foreground">
                    {liveTournament.description}
                  </p>
                </div>

                <div>
                  <div className="mb-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      <span className="text-muted-foreground">
                        {liveTournament.teamSlots} teams competing
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-amber-500" />
                      <span className="text-muted-foreground">Day 2 of 5</span>
                    </div>
                  </div>

                  <Button className="w-full bg-red-500 text-white hover:bg-red-600 sm:w-auto">
                    Watch Now
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="image" className="mt-0">
            <div className="flex flex-col lg:flex-row">
              <div className="relative h-72 w-full lg:h-[400px] lg:w-3/5">
                <Image
                  src={liveTournament.image || "/placeholder.svg"}
                  alt={liveTournament.name || "Live tournament image"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw"
                />
                <div className="absolute left-4 top-4">
                  <Badge className="bg-red-500 px-3 py-1 text-white">
                    LIVE
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col justify-between p-6 lg:w-2/5">
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <Trophy className="h-6 w-6 text-emerald-500" />
                    <span className="text-xl font-bold text-white">
                      {liveTournament.prizeMoney}
                    </span>
                  </div>

                  <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">
                    {liveTournament.name}
                  </h2>

                  <p className="mb-6 text-muted-foreground">
                    {liveTournament.description}
                  </p>
                </div>

                <div>
                  <div className="mb-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      <span className="text-muted-foreground">
                        {liveTournament.teamSlots} teams competing
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-amber-500" />
                      <span className="text-muted-foreground">Day 2 of 5</span>
                    </div>
                  </div>

                  <Button className="w-full bg-red-500 text-white hover:bg-red-600 sm:w-auto">
                    Watch Now
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
        </div>
      ) : (
        <div className="text-center py-10">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-white md:text-3xl">
            Live Now
          </h2>
          <p className="text-gray-500 font-semibold text-lg">No tournament is currently live. Check back soon!</p>
        </div>
      )}
    </section>
  );
}
