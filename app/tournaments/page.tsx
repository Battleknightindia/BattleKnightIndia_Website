import PastTournamentCard from "@/app/tournaments/components/PastTournaments"
import UpcomingTournamentCard from "@/app/tournaments/components/UpcomingTournaments"
import LiveTournament from "./components/LiveTournament";
import RegistrationTournamentCard from "@/app/tournaments/components/RegistrationTournaments";
import { fetchPastTournament, fetchRegistrationTournament, fetchUpcomingTournament } from "@/lib/data/tournament_data";

export default async function TournamentPage() {
  const [upcomingTournaments , pastTournaments, registrationTournaments] = await Promise.all([fetchUpcomingTournament(), fetchPastTournament(), fetchRegistrationTournament()]);

  return (
    <div className="min-h-screen bg-[#18181B] px-4 py-28 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-4 text-center text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
          Tournament Hub
        </h1>
        <p className="mx-auto mb-16 max-w-3xl text-center text-lg text-muted-foreground md:text-xl">
          Your hub for all esports tournaments - watch live events, register for ongoing competitions, and stay updated
          on upcoming tournaments.
        </p>
        <LiveTournament/>

        {/* Registration Open Section */}
        {registrationTournaments && registrationTournaments.length > 0 ? (
          <section className="mb-12">
            <h2 className="mb-8 text-2xl font-bold tracking-tight text-white md:text-3xl">Registration Open</h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {registrationTournaments.map((tournament) => (
                <RegistrationTournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          </section>
        ):(
          <div className=""></div>
        )}

        {/* Upcoming Tournaments Section */}
        <section className="mb-12">
          <h2 className="mb-8 text-2xl font-bold tracking-tight text-white md:text-3xl">Upcoming Tournaments</h2>

          {upcomingTournaments ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingTournaments.map((tournament) => (
              <UpcomingTournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
          ):
          <div className="text-center">
            <p className="text-gray-500 font-semibold text-lg py-10">Currently no Upcoming Tournaments</p>
          </div>
          }
        </section>

        {/* Past Tournaments Section */}
        <section className="mb-20">
          <h2 className="mb-8 text-2xl font-bold tracking-tight text-white md:text-3xl">Past Tournaments</h2>

          {pastTournaments!=null ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {pastTournaments.map((tournament) => (
              <PastTournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
          ):(
            <div className="text-center">
            <p className="text-gray-500 font-semibold text-lg py-10">Currently no Past Tournaments</p>
          </div>
          )
          }
        </section>
      </div>
    </div>
  )
}