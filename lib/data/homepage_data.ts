import { createClient } from "@/utils/supabase/server";
import { MediaItem, NorthEastCupItem, CosplayItem, FeaturedItem } from "@/types/homepageType";

// --- Featured Event ---
export async function getFeaturedEvent():Promise<FeaturedItem> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("featured_event")
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

// --- Event Carousel ---
export async function getEventCarousel():Promise<MediaItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("event_carousel").select("*");
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    title: row.title,
    date: row.date,
    type: row.type,
    src: row.src,
    aspectRatio: row.aspectRatio,
    description: row.description,
  }));
}

// --- NorthEast Cup ---
export async function getNorthEastCup(): Promise<NorthEastCupItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("northeast_cup").select("*");

  if (error) throw error;

  return data.map((row) => {
    const stats = row.stats || {};
    const statColors = row.statColors || {};

    return {
      id: row.id,
      image: row.image || "",
      title: row.title || "",
      description: row.description || "",
      stats: row.stats || [],
      statColors: row.statColors || [],
    };
  });
}


// --- Cosplay Gallery ---
export async function getCosplayGallery():Promise<CosplayItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("cosplay_gallery").select("*");
  if (error) throw error;
  return data.map((row) => ({
     id: row.id,
    image: row.image,
  }));
}
