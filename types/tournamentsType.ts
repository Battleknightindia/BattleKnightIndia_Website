export interface Tournament {
  id: string;
  name: string;
  image: string ;
  video?: string;
  prizemoney: string;
  registration_start_date?: string;
  total_participants?: string;
  teamslots: number;
  description?: string;
  startdate?: string;
  enddate?: string;
  status: TournamentStatus;
  registration_end_date?: string;
  registrationlink?: string;
  livestreamlink?: string;
  champions?: string;
  champions_logo?:string
}

export type TournamentStatus = "upcoming" | "registration" | "live" | "past";

export type TournamentInputs = Partial<Tournament>


export type TournamentUpdate = Partial<Omit<Tournament, 'id'>> &{
  id?: string | null;
};


export type TournamentForms = Partial<Omit<Tournament, "id" | "champions_logo">> & {
  id?: string | null;
  champions_logo?: File | string | null;
};


export type BaseTournament = {
  id: string;
  name: string;
  image: string
  prizeMoney: string;
  teamSlots: number;
  description:string;
  status: 'upcoming' | 'live' | 'past' | 'registration';
};

export type LiveTournament = BaseTournament & {
  status: 'live';
  registrationEndDate?:string;
  tournamentStartDate?:string;
  liveStreamLink?:string
  tournamentEndDate?:string;
};

export type RegistrationTournament = BaseTournament & {
  status: 'registration';
  video?:string;
  registrationLink?: string;
  registrationEndDate?:string;
  tournamentStartDate?:string;
  liveStreamLink?:string
};

export type UpcomingTournament = BaseTournament & {
  status: 'upcoming';
  registrationStartDate: string;
};

export type PastTournament = BaseTournament & {
  status: 'past';
  total_participants?: string;
  tournamentEndDate?: string;
  champions?: string;
  champions_logo?:string
}