// lib/server/homepageActions.ts
"use server";

import {
  CosplayItem,
  FeaturedItem,
  NorthEastCupItem,
  MediaItem, // Ensure MediaItem is imported if used
} from "@/types/homepageTypes";
import { createClient } from "@/utils/supabase/server"; // Use server-side Supabase client
import { revalidatePath } from "next/cache"; // For revalidation after DB updates

// Helper to extract file path from a Supabase URL for deletion
function getFilePathFromSupabaseUrl(
  url: string,
  bucketName: string
): string | null {
  // Supabase public URL typically looks like:
  // https://[project_ref].supabase.co/storage/v1/object/public/[bucketName]/[path_in_bucket]
  const storagePathSegment = `/${bucketName}/`;
  const pathStartIndex = url.indexOf(storagePathSegment);
  if (pathStartIndex !== -1) {
    // Extract everything after the bucket name and before any query parameters or hash
    const filePathInBucket = url.substring(
      pathStartIndex + storagePathSegment.length
    );
    return filePathInBucket.split("?")[0].split("#")[0]; // Remove query params/hash
  }
  return null;
}

export async function saveCosplayData(
  // Now receives pre-uploaded URLs, not File objects
  cosplayGalleryPayload: CosplayItem[] // The items should already have correct image URLs
): Promise<{ data: CosplayItem[] | null; error: string | null }> {
  const supabase = await createClient();
  const itemsToInsert: Omit<CosplayItem, "id" | "created_at">[] = [];
  const itemsToUpdate: CosplayItem[] = [];
  const existingItemIdsInPayload = new Set<string>();

  // Process items: assign order_index and separate for insert/update
  const finalCosplayItems = cosplayGalleryPayload.map((item, i) => {
    const mutableItem = { ...item, order_index: i + 1, id: String(item.id) }; // Ensure id is a string and order_index is sequential
    if (mutableItem.id) {
      itemsToUpdate.push(mutableItem);
      existingItemIdsInPayload.add(mutableItem.id);
    } else {
      const { id, created_at, ...newItem } = mutableItem; // Omit id for new inserts
      itemsToInsert.push(newItem);
    }
    return mutableItem; // Return the item for consistent state
  });

  let insertedItems: CosplayItem[] = [];
  if (itemsToInsert.length > 0) {
    const { data: newItems, error: insertError } = await supabase
      .from("cosplay_gallery")
      .insert(itemsToInsert)
      .select("*"); // Select all columns to get generated IDs and created_at

    if (insertError) {
      console.error("Failed to insert new cosplay items:", insertError);
      return { data: null, error: `Failed to insert new items: ${insertError.message}` };
    }
    insertedItems = newItems;
    newItems.forEach((item) => existingItemIdsInPayload.add(item.id));
  }

  let updatedItems: CosplayItem[] = [];
  if (itemsToUpdate.length > 0) {
    // Use upsert to handle updates if IDs are present
    const { data: upsertedData, error: upsertError } = await supabase
      .from("cosplay_gallery")
      .upsert(itemsToUpdate, { onConflict: "id" }) // Conflict on 'id' to update existing records
      .select("*");

    if (upsertError) {
      console.error("Failed to update existing cosplay items:", upsertError);
      return { data: null, error: `Failed to update existing items: ${upsertError.message}` };
    }
    updatedItems = upsertedData;
  }

  // --- Deletion Logic ---
  const { data: currentDbItems, error: fetchError } = await supabase
    .from("cosplay_gallery")
    .select("id, image"); // Fetch IDs and image URLs from DB

  if (fetchError) {
    console.error("Error fetching current DB items for deletion check:", fetchError.message);
    // Continue despite fetch error, as main save operations are done.
  } else {
    const idsToDelete: string[] = [];
    const imagesToDeleteFromStorage: string[] = [];

    for (const dbItem of currentDbItems) {
      // If a DB item's ID is NOT in our payload, it means it was removed
      if (!existingItemIdsInPayload.has(dbItem.id)) {
        idsToDelete.push(dbItem.id);
        const filePath = getFilePathFromSupabaseUrl(dbItem.image, "cosplay-gallery");
        if (filePath) {
          imagesToDeleteFromStorage.push(filePath);
        }
      }
    }

    if (idsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from("cosplay_gallery")
        .delete()
        .in("id", idsToDelete);

      if (deleteError) {
        console.error("Error deleting items from DB:", deleteError.message);
      } else {
        // Delete corresponding images from storage
        if (imagesToDeleteFromStorage.length > 0) {
          const { error: storageDeleteError } = await supabase.storage
            .from("cosplay-gallery")
            .remove(imagesToDeleteFromStorage);
          if (storageDeleteError) {
            console.error("Error deleting storage files:", storageDeleteError.message);
          }
        }
      }
    }
  }

  // Revalidate the path that uses this data to ensure fresh content
  revalidatePath("/admin"); // Assuming /admin is where this data is displayed

  // Return all items, combining inserted and updated ones
  const allProcessedItems = [...insertedItems, ...updatedItems].sort((a, b) => a.order_index - b.order_index);
  return { data: allProcessedItems, error: null };
}

export async function saveFeaturedEventData(
  updatedData: FeaturedItem,
  // Now receives the pre-uploaded URL
  bannerImageUrl: string | null
): Promise<{ data: FeaturedItem | null; error: string | null }> {
  const supabase = await createClient();
  // Assign the banner image URL directly from the argument
  const dataToUpsert = { ...updatedData, bannerImage: bannerImageUrl };

  const { data, error } = await supabase
    .from("featured_event")
    .upsert(dataToUpsert)
    .select("*")
    .single();

  if (error) {
    console.error("Failed to update featured event:", error);
    return { data: null, error: `Failed to update featured event: ${error.message}` };
  }

  revalidatePath("/admin");
  return { data: data, error: null };
}

export async function saveEventCarouselData(
  // Now receives array of MediaItem with pre-uploaded URLs
  eventCarouselPayload: MediaItem[]
): Promise<{ data: MediaItem[] | null; error: string | null }> {
  const supabase = await createClient();
  const itemsToInsert: Omit<MediaItem, "id" | "created_at">[] = [];
  const itemsToUpdate: MediaItem[] = [];
  const existingItemIdsInPayload = new Set<string>();

  // Process items: assign order_index and separate for insert/update
  const finalEventCarouselItems = eventCarouselPayload.map((item, i) => {
    const mutableItem = { ...item, order_index: i + 1, id: String(item.id) }; // Ensure id is a string and order_index is sequential
    if (mutableItem.id) {
      itemsToUpdate.push(mutableItem);
      existingItemIdsInPayload.add(mutableItem.id);
    } else {
      const { id, ...newItem } = mutableItem; // Omit id for new inserts
      itemsToInsert.push(newItem);
    }
    return mutableItem; // Return the item for consistent state
  });

  let insertedItems: MediaItem[] = [];
  if (itemsToInsert.length > 0) {
    const { data: newItems, error: insertError } = await supabase
      .from("event_carousel")
      .insert(itemsToInsert)
      .select("*");

    if (insertError) {
      console.error("Failed to insert new event carousel items:", insertError);
      return { data: null, error: `Failed to insert new items: ${insertError.message}` };
    }
    insertedItems = newItems;
    newItems.forEach((item) => existingItemIdsInPayload.add(item.id));
  }

  let updatedItems: MediaItem[] = [];
  if (itemsToUpdate.length > 0) {
    const { data: upsertedData, error: upsertError } = await supabase
      .from("event_carousel")
      .upsert(itemsToUpdate, { onConflict: "id" })
      .select("*");

    if (upsertError) {
      console.error("Failed to update existing event carousel items:", upsertError);
      return { data: null, error: `Failed to update existing items: ${upsertError.message}` };
    }
    updatedItems = upsertedData;
  }

  // --- Deletion Logic for Event Carousel ---
  const { data: currentDbItems, error: fetchError } = await supabase
    .from("event_carousel")
    .select("id, image");

  if (fetchError) {
    console.error("Error fetching current DB items for event carousel deletion check:", fetchError.message);
  } else {
    const idsToDelete: string[] = [];
    const imagesToDeleteFromStorage: string[] = [];

    for (const dbItem of currentDbItems) {
      if (!existingItemIdsInPayload.has(dbItem.id)) {
        idsToDelete.push(dbItem.id);
        const filePath = getFilePathFromSupabaseUrl(dbItem.image, "event-carousel");
        if (filePath) {
          imagesToDeleteFromStorage.push(filePath);
        }
      }
    }

    if (idsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from("event_carousel")
        .delete()
        .in("id", idsToDelete);

      if (deleteError) {
        console.error("Error deleting event carousel items from DB:", deleteError.message);
      } else {
        if (imagesToDeleteFromStorage.length > 0) {
          const { error: storageDeleteError } = await supabase.storage
            .from("event-carousel")
            .remove(imagesToDeleteFromStorage);
          if (storageDeleteError) {
            console.error("Error deleting event carousel storage files:", storageDeleteError.message);
          }
        }
      }
    }
  }

  revalidatePath("/admin");
  const allProcessedItems = [...insertedItems, ...updatedItems].sort((a, b) => a.order_index - b.order_index);
  return { data: allProcessedItems, error: null };
}

export async function saveNorthEastCupData(
  // Now receives array of NorthEastCupItem with pre-uploaded URLs
  northEastCupPayload: NorthEastCupItem[]
): Promise<{ data: NorthEastCupItem[] | null; error: string | null }> {
  const supabase = await createClient();
  const itemsToInsert: Omit<NorthEastCupItem, "id" | "created_at">[] = [];
  const itemsToUpdate: NorthEastCupItem[] = [];
  const existingItemIdsInPayload = new Set<string>();

  // Process items: assign order_index and separate for insert/update
  const finalNorthEastCupItems = northEastCupPayload.map((item, i) => {
    const mutableItem = { ...item, order_index: i + 1 }; // Ensure order_index is sequential
    existingItemIdsInPayload.add(String(mutableItem.id)); // Convert id to string only when adding to the Set
    return mutableItem; // Return the item for consistent state
  });

  let insertedItems: NorthEastCupItem[] = [];
  if (itemsToInsert.length > 0) {
    const { data: newItems, error: insertError } = await supabase
      .from("northeast_cup")
      .insert(itemsToInsert)
      .select("*");

    if (insertError) {
      console.error("Failed to insert new NorthEast Cup items:", insertError);
      return { data: null, error: `Failed to insert new items: ${insertError.message}` };
    }
    insertedItems = newItems;
    newItems.forEach((item) => existingItemIdsInPayload.add(item.id));
  }

  let updatedItems: NorthEastCupItem[] = [];
  if (itemsToUpdate.length > 0) {
    const { data: upsertedData, error: upsertError } = await supabase
      .from("northeast_cup")
      .upsert(itemsToUpdate, { onConflict: "id" })
      .select("*");

    if (upsertError) {
      console.error("Failed to update existing NorthEast Cup items:", upsertError);
      return { data: null, error: `Failed to update existing items: ${upsertError.message}` };
    }
    updatedItems = upsertedData;
  }

  // --- Deletion Logic for NorthEast Cup ---
  const { data: currentDbItems, error: fetchError } = await supabase
    .from("northeast_cup")
    .select("id, image");

  if (fetchError) {
    console.error("Error fetching current DB items for NorthEast Cup deletion check:", fetchError.message);
  } else {
    const idsToDelete: string[] = [];
    const imagesToDeleteFromStorage: string[] = [];

    for (const dbItem of currentDbItems) {
      if (!existingItemIdsInPayload.has(dbItem.id)) {
        idsToDelete.push(dbItem.id);
        const filePath = getFilePathFromSupabaseUrl(dbItem.image, "northeast-cup");
        if (filePath) {
          imagesToDeleteFromStorage.push(filePath);
        }
      }
    }

    if (idsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from("northeast_cup")
        .delete()
        .in("id", idsToDelete);

      if (deleteError) {
        console.error("Error deleting NorthEast Cup items from DB:", deleteError.message);
      } else {
        if (imagesToDeleteFromStorage.length > 0) {
          const { error: storageDeleteError } = await supabase.storage
            .from("northeast-cup")
            .remove(imagesToDeleteFromStorage);
          if (storageDeleteError) {
            console.error("Error deleting NorthEast Cup storage files:", storageDeleteError.message);
          }
        }
      }
    }
  }

  revalidatePath("/admin");
  const allProcessedItems = [...insertedItems, ...updatedItems].sort((a, b) => a.order_index - b.order_index);
  return { data: allProcessedItems, error: null };
}