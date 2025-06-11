import { createClient } from "@/utils/supabase/server";
import { MediaItem, NorthEastCupItem, CosplayItem, FeaturedItem } from "@/types/homepageTypes";

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
  const { data, error } = await supabase
    .from("event_carousel")
    .select("id, title, date, type, image, aspectRatio, description, order_index") // Explicitly select all required columns and order_index
    .order('order_index', { ascending: true }); // Order by order_index

  if (error) {
    console.error("Error fetching event carousel:", error.message);
    throw error;
  }

  return data.map((row) => ({
    id: row.id,
    title: row.title || "", // Provide default empty string for title
    date: row.date || "",   // Provide default empty string for date
    type: row.type || "",   // Provide default empty string for type
    image: row.image || "", // Assuming your DB column is 'image' for MediaItem
    aspectRatio: row.aspectRatio || 1, // Provide default aspect ratio if not present
    description: row.description || "", // Provide default empty string for description
    order_index: row.order_index, // Include order_index
  }));
}

// --- NorthEast Cup ---
export async function getNorthEastCup(): Promise<NorthEastCupItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("northeast_cup")
    .select("id, image, title, description, stats, statColors, order_index") // Explicitly select all required columns and order_index
    .order('order_index', { ascending: true }); // Order by order_index

  if (error) {
    console.error("Error fetching NorthEast Cup:", error.message);
    throw error;
  }

  return data.map((row) => {
    return {
      id: row.id,
      image: row.image || "",
      title: row.title || "",
      description: row.description || "",
      stats: row.stats || [],
      statColors: row.statColors || [],
      order_index: row.order_index, // Include order_index
    };
  });
}


export async function getCosplayGallery(): Promise<CosplayItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cosplay_gallery")
    .select("id, image, order_index")
    .order('order_index', { ascending: true });

  if (error) {
    console.error("Error fetching cosplay gallery:", error.message);
    throw error;
  }

  return data.map((row) => ({
    id: row.id,
    image: row.image,
    order_index: row.order_index,
  }));
}