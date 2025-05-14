"use server";

import { createClient } from "@/utils/supabase/server";
import { SupabaseClient, User } from "@supabase/supabase-js";

interface volunteerType {
    email: string; // This is the email from the form data
    phone: string;
}

// Get a consistent gradient color for the avatar
export async function getReferral(supabase: SupabaseClient, user: User){
    console.log("Referral_code is generated for user")

    const { data: profile, error: profileError } = await supabase // Added error handling
      .from("profiles")
      .update({is_volunteer:true})
      .eq("user_id", user.id)
      .select("ign")
      .single();

    // Handle case where profile might not exist for the user
    if (profileError || !profile) {
        console.error("Could not find or update profile for user:", user.id, profileError);
        // Decide how to handle this - maybe return a default or throw an error
        // For now, returning a generic code or handle it in handlevolunteers
         return `user_${user.id}_${Math.floor(10000 + Math.random() * 90000)}`; // Fallback referral code
    }


    const rand = Math.floor(10000 + Math.random() * 90000);
    return `${profile.ign}_${rand}`; // Use profile.ign directly now that we handled the possible null/undefined case
}

export async function handlevolunteers(data: volunteerType) {
    console.log("handlevolunteers function called", data)
    const supabase = await createClient();
    const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

    if(userError || !user) {
        return { success: false, error: "Not logged in" };
    }

    console.log("User data:", user)

    // Get the referral code AFTER confirming the user is logged in
    const referralCode = await getReferral(supabase, user);
    console.log("Referral code generated:", referralCode)


    const volunteerData = {
        // *** MODIFICATION HERE: Use the email from the submitted form data ***
        email: data.email,
        phone: data.phone,
        referral_code: referralCode,
        profile_id: user.id, // This links the volunteer record to the authenticated user's profile ID
        reward_points: "0", // Consider using numbers
        total_teams: "0",   // Consider using numbers
        approved_teams: "0" // Consider using numbers
    }

    console.log("Volunteer data:", volunteerData)

    try{
        // *** MODIFICATION HERE: Check for existing record by profile_id (user.id) ***
        // This is generally more reliable than checking by email,
        // as the profile_id is the primary link to the user profile
        const { data: exists, error: existsError } = await supabase
            .from("volunteers")
            .select("*")
            .eq("profile_id", volunteerData.profile_id) // Check by the user's profile_id
            .single();

        if (!existsError && exists) {
            console.log("Volunteer record exists for this profile, attempting update")
            // *** MODIFICATION HERE: Update the email and phone with the new form data ***
            const { error: updateError, data: updateData } = await supabase.from("volunteers").update({
                email: volunteerData.email, // Update with email from form data
                phone: volunteerData.phone, // Update with phone from form data
                referral_code: volunteerData.referral_code, // Update referral code (if getReferral logic allows changes)
                // Do NOT update profile_id here as it's the linking key
            }).eq("profile_id", volunteerData.profile_id); // Update the record linked to this profile_id
            if(updateError){
                console.error("Update error:", updateError);
                return { success: false, error: updateError.message };
            }
            console.log("Volunteer record updated:", updateData)
            return { success: true, data: updateData };
        }

        console.log("No existing volunteer record for this profile, attempting insert")
        // Insert the new volunteer record
        const { error: insertError, data: insertData } = await supabase.from("volunteers").insert({
            ...volunteerData, // volunteerData already contains the correct email, phone, profile_id etc.
        });
        if(insertError){
            console.error("Insert error:", insertError);
            return { success: false, error: insertError.message };
        }
        console.log("Volunteer record inserted:", insertData)
        return { success: true, data: insertData };
    } catch (error) {
        console.error("Unexpected error during volunteer handling:", error);
        return { success: false, error: (error as Error).message };
    }
}

