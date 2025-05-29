import { createClient } from "@/utils/supabase/server";
import { LiveTournament, UpcomingTournament, PastTournament, RegistrationTournament } from "@/types/tournamentsType";

export async function fetchLiveTournament():Promise<LiveTournament | null | undefined>{
    const supabase = await createClient()
    const { data:row, error } = await supabase.from("tournaments").select("*").eq("status", 'live').single();
    if (error || !row){
        console.error(`Could not fetch tournament data because: ${error} or no data found, using local data`)
        return null;
    }
    return{
        id: row.id,
        name: row.name,
        image: row.image,
        prizeMoney: row.prizemoney,
        registrationEndDate: row.registration_end_date,
        teamSlots: row.teamslots,
        description: row.description,
        tournamentStartDate: row.startdate,
        tournamentEndDate: row.enddate,
        status: 'live',
        liveStreamLink: row.livestreamlink,
    }
}

export async function fetchRegistrationTournament():Promise<RegistrationTournament[] | null | undefined>{
    const supabase = await createClient()
    const { data:row, error } = await supabase.from("tournaments").select("*").eq("status", 'registration');
    if (error){
        console.error(`Could not fetch tournament data because: ${error} using local data`)
    }
    return row?.map((row) => ({
        id: row.id,
        name: row.name,
        image: row.image,
        video: row.video_url,
        prizeMoney: row.prizemoney,
        registrationEndDate: row.registration_end_date,
        teamSlots: row.teamslots,
        description: row.description,
        tournamentStartDate: row.startdate,
        status: 'registration',
        registrationLink: row.registrationlink,
        liveStreamLink: row.livestreamlink,
    }
)
    )
}

export async function fetchUpcomingTournament():Promise<UpcomingTournament[] | null | undefined>{
    const supabase = await createClient()
    const { data, error } = await supabase.from("tournaments").select("*").eq("status", 'upcoming');
    if (error){
        console.log("Data: ", data)
        console.error(`Could not fetch tournament data because: ${error} using local data`)
    }
    return data?.map((row) => ({
        id: row.id,
        name: row.name,
        image: row.image,
        prizeMoney: row.prizemoney,
        teamSlots: row.teamslots,
        description: row.description,
        status: 'upcoming',
        registrationStartDate: row.registration_start_date,
    }));
}


export async function fetchPastTournament():Promise<PastTournament[] | undefined>{
    const supabase = await createClient()
    const { data, error } = await supabase.from("tournaments").select("*").eq("status", 'past');
    if (error){
        console.error(`Could not fetch tournament data because: ${error} using local data`)
    }
    return data?.map((row) => ({
        id: row.id,
        name: row.name,
        image: row.image,
        status: row.status,
        prizeMoney: row.prizemoney,
        teamSlots: row.teamslots,
        total_participants: row.total_participants,
        description: row.description,
        tournamentEndDate: row.enddate,
        champions: row.champions,
        champions_logo: row.champions_logo
    }))
}