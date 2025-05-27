"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { editprofileSchema } from "@/schema/profileSchema";
import { uploadAvatarFromBase64 } from "@/lib/imageUpload";

export async function handleProfile(rawForm: unknown) {
  const supabase = await createClient();
  const parsed = editprofileSchema.safeParse(rawForm);

  if (!parsed.success) {
    return { success: false, error: "Hmm, that doesn't look right. Please **ensure all fields are filled correctly**." };
  }

  const formData = parsed.data;

  const rolesArray = formData.roles.split(',').map(role => role.trim());

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?message=Please log in to update your profile information.");
    return { success: false, error: "It seems you're not logged in. **Please log in to continue.**" };
  }

  const avatarUrl = formData.profileImage
    ? await uploadAvatarFromBase64(supabase, formData.profileImage, user.id)
    : undefined;

  const profileData = {
    fullName: formData.fullName,
    ign: formData.ign,
    game_id: formData.gameId,
    server_id: formData.serverId,
    roles: rolesArray,
    state: formData.state,
    city: formData.city,
    avatar_url: avatarUrl,
  };

  try {
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (existingProfile) {
      const { error: updateError} = await supabase.from("profiles").update(profileData).eq("user_id", user.id);
      if (updateError) {
        console.error("Profile update error:", updateError);
        // Check for specific duplicate key error messages (may vary by database)
        if (updateError.message.includes('duplicate key value violates unique constraint')) {
          if (updateError.message.includes('ign_unique')) {
            return { success: false, error: "That in-game name is already taken. **Please choose a different one.**" };
          } else if (updateError.message.includes('game_id_unique')) {
            return { success: false, error: "That game ID is already associated with another profile. **Please double-check your game ID.**" };
          } else {
            return { success: false, error: "We encountered an issue while updating your profile due to a duplicate entry. **Please review your information.**" };
          }
        }
        return { success: false, error: "We encountered an issue while updating your profile. **Please double-check your entries** and try again." };
      }
    } else {
      const { error: insertError} = await supabase.from("profiles").insert({
        user_id: user.id,
        ...profileData,
      });
      if (insertError) {
        console.error("Profile insert error:", insertError);
        // Check for specific duplicate key error messages
        if (insertError.message.includes('duplicate key value violates unique constraint')) {
          if (insertError.message.includes('ign_unique')) {
            return { success: false, error: "That in-game name is of someone else. **Please write your own ingame name.**" };
          } else if (insertError.message.includes('game_id_unique')) {
            return { success: false, error: "That game ID is already associated with another profile. **Please double-check your game ID.**" };
          } else {
            return { success: false, error: "There was a problem saving your new profile information due to a duplicate entry. **Please review the information you entered.**" };
          }
        }
        return { success: false, error: "There was a problem saving your new profile information. **Please verify all the details you entered** and try again." };
      }
    }

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Unexpected profile update error:", error);
    return { success: false, error: "An unexpected error occurred while trying to update your profile. Please try again later. If the issue persists, contact support." };
  }
}
