"use server";

import { uploadHomepageImage } from "@/lib/services/storageService";

export async function handleBannerImageUpload(bannerImageFile: File | null) {
  if (!bannerImageFile) {
    console.log("No banner image file provided to handleBannerImageUpload.");
    return null; 
  }

  const folder = "featured"; 
  const uniqueId = bannerImageFile.name; 

  try {
    const publicUrl = await uploadHomepageImage(bannerImageFile, folder, uniqueId);

    if (!publicUrl) {
      console.error("Error uploading banner image via storageService.");
      return null; 
    }
    
    console.log("Banner image uploaded successfully. URL:", publicUrl);
    return publicUrl;

  } catch (error) {
    console.error("An unexpected error occurred in handleBannerImageUpload:", error);
    return null;
  }
}

// Placeholder for other potential server actions related to home page management
// export async function updateHomepageData(data: any) { ... }
// export async function updateSectionActive(section: string, isActive: boolean) { ... }