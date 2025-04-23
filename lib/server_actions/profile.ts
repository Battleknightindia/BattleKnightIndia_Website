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

    return { success: false, error: "Invalid form data" };
  }

  const formData = parsed.data;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?message=Please login to update your profile");
    return { success: false, error: "Not logged in" };
  }

  const avatarUrl = formData.profileImage
    ? await uploadAvatarFromBase64(supabase, formData.profileImage, user.id)
    : undefined;
  
  

  const profileData = {
    fullName: formData.fullName,
    ign: formData.gameName,
    game_id: formData.gameId,
    server_id: formData.serverId,
    roles: formData.roles,
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
      const { error: updateError, data: updateData } = await supabase.from("profiles").update(profileData).eq("user_id", user.id);
      if (updateError) {
        return { success: false, error: updateError.message };
      }
    } else {
      const { error: insertError, data: insertData } = await supabase.from("profiles").insert({ 
        user_id: user.id,
        ...profileData,
      });
      if (insertError) {
        return { success: false, error: insertError.message };
      }
    }

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {

    return { success: false, error: (error as Error).message };
  }
}
