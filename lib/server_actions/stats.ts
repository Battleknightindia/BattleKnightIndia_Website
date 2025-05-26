"use server";
import { createClient } from "@/utils/supabase/server";
import { TeamListType } from "../data/statsData";

export async function statusUpdate(teams:TeamListType[]){
    const supabase = await createClient();
    for (const team of teams){
        const {error} = await supabase
        .from("teams")
        .update({team_status:team.team_status})
        .eq("id",team.id);
        if (error) {
            console.log(error);
        }
    }
}