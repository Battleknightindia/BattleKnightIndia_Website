export const dynamic = 'force-dynamic';

import PastTournamentCard from "@/app/tournaments/components/PastTournaments";
import UpcomingTournamentCard from "@/app/tournaments/components/UpcomingTournaments";
import LiveTournament from "./components/LiveTournament";
import RegistrationTournamentCard from "@/app/tournaments/components/RegistrationTournaments";
import { fetchPastTournament, fetchRegistrationTournament, fetchUpcomingTournament } from "@/lib/data/tournament_data";
import { UpcomingTournament, PastTournament, RegistrationTournament } from "@/types/tournamentsType";

// The main TournamentPage component, which is a Server Component.
// It fetches all necessary tournament data on the server.
export default async function TournamentPage() {
  let upcomingTournaments: UpcomingTournament[] | null | undefined = [];
  let pastTournaments: PastTournament[] | null | undefined = [];
  let registrationTournaments: RegistrationTournament[] | null | undefined = [];
  let fetchError: string | null = null;

  try {
    // Fetch all tournament data concurrently using Promise.all
    // This improves performance by running fetches in parallel.
    [upcomingTournaments, pastTournaments, registrationTournaments] = await Promise.all([
      fetchUpcomingTournament(),
      fetchPastTournament(),
      fetchRegistrationTournament()
    ]);

  } catch (error) {
    // Catch any errors during data fetching and store them
    console.error("Error fetching tournament data:", error);
    fetchError = "Failed to load tournament data. Please try again later.";
    // Optionally, you could set default empty arrays here if you want to render empty sections
    // instead of a full error message.
    upcomingTournaments = [];
    pastTournaments = [];
    registrationTournaments = [];
  }

  // If there was a critical error fetching data, display a global error message.
  if (fetchError) {
    return (
      <div className="min-h-screen bg-[#18181B] px-4 py-28 md:px-6 lg:px-8 flex items-center justify-center">
        <p className="text-red-500 text-xl font-semibold">{fetchError}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#18181B] px-4 py-28 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page Title and Description */}
        <h1 className="mb-4 text-center text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
          Tournament Hub
        </h1>
        <p className="mx-auto mb-16 max-w-3xl text-center text-lg text-muted-foreground md:text-xl">
          Your hub for all esports tournaments - watch live events, register for ongoing competitions, and stay updated
          on upcoming tournaments.
        </p>

        {/* Live Tournament Section */}
        {/* Assuming LiveTournament component handles its own live data fetching/display */}
        <LiveTournament/>

        {/* Registration Open Section */}
        <section className="mb-12">
          <h2 className="mb-8 text-2xl font-bold tracking-tight text-white md:text-3xl">Registration Open</h2>
          {registrationTournaments && registrationTournaments.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {registrationTournaments.map((tournament) => (
                // Pass serialized tournament data to the card component
                <RegistrationTournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500 font-semibold text-lg">No tournaments currently open for registration.</p>
            </div>
          )}
        </section>

        {/* Upcoming Tournaments Section */}
        <section className="mb-12">
          <h2 className="mb-8 text-2xl font-bold tracking-tight text-white md:text-3xl">Upcoming Tournaments</h2>
          {upcomingTournaments && upcomingTournaments.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingTournaments.map((tournament) => (
                // Pass serialized tournament data to the card component
                <UpcomingTournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500 font-semibold text-lg">Currently no Upcoming Tournaments.</p>
            </div>
          )}
        </section>

        {/* Past Tournaments Section */}
        <section className="mb-20">
          <h2 className="mb-8 text-2xl font-bold tracking-tight text-white md:text-3xl">Past Tournaments</h2>
          {pastTournaments && pastTournaments.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {pastTournaments.map((tournament) => (
                // Pass serialized tournament data to the card component
                <PastTournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500 font-semibold text-lg">Currently no Past Tournaments.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
