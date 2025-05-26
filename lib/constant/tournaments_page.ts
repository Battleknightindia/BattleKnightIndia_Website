import { Tournament, LiveTournament, PastTournament, UpcomingTournament } from "@/types/tournamentsType" 





export const liveTournament: LiveTournament = {
    id: "1",
    name: "National Collage Cup 2025",
    image: "/placeholder.svg?height=600&width=1200",
    prizeMoney: "5,00,000 INR",
    tournamentStartDate: "",
    tournamentEndDate:"",
    registrationEndDate: "",
    teamSlots: 512,
    status: 'live',
    description:
      "Join the most prestigious collegiate esports tournament in the country, featuring top teams from universities nationwide.",
  }

export const pastTournaments: PastTournament[] = [
    {
      id: "1",
      name: "Valorant Masters",
      image: "/placeholder.svg?height=400&width=600",
      prizeMoney: "$75,000",
      teamSlots: 24,
      tournamentEndDate: "June 30, 2025",
      description: 
      "Join the most prestigious collegiate esports tournament in the country, featuring top teams from universities nationwide.",
      status: "past",
      champions: "Neon Veil",
      champions_logo: "/placeholder.svg"
    },
    {
      id: '2',
      name: "League of Legends Regional Qualifier",
      image: "/placeholder.svg?height=400&width=600",
      prizeMoney: "$50,000",
      teamSlots: 16,
      tournamentEndDate: "June 12, 2025",
      description: 
      "Join the most prestigious collegiate esports tournament in the country, featuring top teams from universities nationwide.",
      status: "past",
      champions: "Neon Veil",
      champions_logo: "/placeholder.svg"
    },
    {
      id: "3",
      name: "Fortnite Summer Showdown",
      image: "/placeholder.svg?height=400&width=600",
      prizeMoney: "$100,000",
      teamSlots: 50,
      tournamentEndDate: "Ended on July 2, 2025",
      description: 
      "Join the most prestigious collegiate esports tournament in the country, featuring top teams from universities nationwide.",
      status: "past",
      champions: "Neon Veil",
      champions_logo: "/placeholder.svg"
    },
  ]

export const upcomingTournaments: UpcomingTournament[] = [
    {
      id: "1",
      name: "Apex Legends Championship",
      image: "/placeholder.svg?height=400&width=600",
      prizeMoney: "$50,000",
      registrationStartDate: "Starts June 15, 2025",
      teamSlots: 32,
      description:"Join the most prestigious collegiate esports tournament in the country, featuring top teams from universities nationwide.",
      status:"upcoming"
    },
    {
      id: '2',
      name: "Counter-Strike Global Tournament",
      image: "/placeholder.svg?height=400&width=600",
      prizeMoney: "$80,000",
      registrationStartDate: "Starts July 1, 2025",
      teamSlots: 20,
      description:"Join the most prestigious collegiate esports tournament in the country, featuring top teams from universities nationwide.",
      status:"upcoming"
    },
    {
      id: "3",
      name: "Rocket League Championship",
      image: "/placeholder.svg?height=400&width=600",
      prizeMoney: "$45,000",
      registrationStartDate: "Starts July 15, 2025",
      teamSlots: 16,
      description:"Join the most prestigious collegiate esports tournament in the country, featuring top teams from universities nationwide.",
      status:"upcoming"
    },
    {
      id: "4",
      name: "Dota 2 International Qualifier",
      image: "/placeholder.svg?height=400&width=600",
      prizeMoney: "$120,000",
      registrationStartDate: "Starts August 1, 2025",
      teamSlots: 24,
      description:"Join the most prestigious collegiate esports tournament in the country, featuring top teams from universities nationwide.",
      status:"upcoming"
    },
    {
      id: "5",
      name: "Rainbow Six Invitational",
      image: "/placeholder.svg?height=400&width=600",
      prizeMoney: "$60,000",
      registrationStartDate: "Starts August 15, 2025",
      teamSlots: 16,
      description:"Join the most prestigious collegiate esports tournament in the country, featuring top teams from universities nationwide.",
      status:"upcoming"
    },
    {
      id: "6",
      name: "Overwatch World Cup",
      image: "/placeholder.svg?height=400&width=600",
      prizeMoney: "$90,000",
      registrationStartDate: "Starts September 1, 2025",
      teamSlots: 32,
      description:"Join the most prestigious collegiate esports tournament in the country, featuring top teams from universities nationwide.",
      status:"upcoming"
    },
  ]