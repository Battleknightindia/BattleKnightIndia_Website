import { createClient } from "@/utils/supabase/client";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Uploads an image to the 'public' bucket for homepage content (featured, carousel, etc).
 * Returns the public URL or null on failure.
 */
export async function uploadHomepageImage(file: File, folder: string, uniqueId: string): Promise<string | null> {
  const supabase: SupabaseClient = createClient();
  const fileName = `${folder}/${file.name}`;
  const { error } = await supabase.storage.from("home").upload(fileName, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type,
  });
  if (error) {
    console.error("Supabase Storage upload error:", error);
    return null;
  }
  const { data } = supabase.storage.from("home").getPublicUrl(fileName);
  return data?.publicUrl || null;
}
