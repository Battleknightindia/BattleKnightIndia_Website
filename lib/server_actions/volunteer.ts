"use server";

import { createClient } from "@/utils/supabase/server";
import { SupabaseClient, User } from "@supabase/supabase-js";

interface volunteerType {
    email: string;
    phone: string;
}

// Get a consistent gradient color for the avatar
export async function getReferral(supabase: SupabaseClient, user: User){
    console.log("Referral_code is generated for user")
    const { data: profile } = await supabase
      .from("profiles")
      .update({is_volunteer:true})
      .eq("user_id", user.id))
      .select("ign")
      .single();
    const rand = Math.floor(10000 + Math.random() * 90000); 
    return `${profile?.ign}_${rand}`;
}

export async function handlevolunteers(data: volunteerType) {
    console.log("handlevolunteers function called", data)
    const supabase = await createClient();
    const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

    const referralCode = await getReferral(supabase, user!);
    console.log("Referral code generated:", referralCode)

    if(userError || !user) {
        return { success: false, error: "Not logged in" };
    }
    console.log("User data:", user)
    const volunteerData = {
        email: user.email,
        phone: data.phone,
        referral_code: referralCode,
        profile_id: user.id,
        reward_points: "0",
        total_teams: "0",
        approved_teams: "0"
    }

    console.log("Volunteer data:", volunteerData)

    try{
        const { data: exists, error: existsError } = await supabase
            .from("volunteers")
            .select("*")
            .eq("email", volunteerData.email)
            .single();
        
        if (!existsError && exists) {
            const { error: updateError, data: updateData } = await supabase.from("volunteers").update({ 
                ...volunteerData,
            }).eq("email", volunteerData.email);
            if(updateError){
                return { success: false, error: updateError.message };
            }
            return { success: true, data: updateData };
        }

        // No existing record found or error occurred during check, proceed with insert
        const { error: insertError, data: insertData } = await supabase.from("volunteers").insert({ 
            ...volunteerData,
        });
        if(insertError){
            return { success: false, error: insertError.message };
        }
        return { success: true, data: insertData };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}
