"use client";
// app/admin/components/Blocks/HomepageContentManagerBlock.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/utils/supabase/client";
import { Plus, Upload } from "lucide-react";
import {
  FEATURED_EVENT,
  EVENT_DATA,
  TOURNAMENT_DATA,
  COSPLAY_DATA,
} from "@/lib/constant/home_page";
import {
  FeaturedItem,
  MediaItem,
  NorthEastCupItem,
  CosplayItem,
} from "@/types/homepageTypes";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FeaturedSectionAdmin } from "../Homepage/FeaturedForm";
import { EventCarouselAdmin } from "../Homepage/EventCardForm";
import { NorthEastCupAdmin } from "../Homepage/NorthEastCupForm";
import { CosplaySectionAdmin } from "../Homepage/CosplayForm";
import {
  saveCosplayData,
  saveFeaturedEventData,
  saveEventCarouselData,
  saveNorthEastCupData,
} from "@/lib/client/home_block_content";
import {
  runPromisesInParallel,
  uploadHomepageImage,
  uploadHomepageVideo,
} from "@/lib/services/storageService";

// Progress Bar Component
interface ProgressBarProps {
  progress: number;
  label?: string;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  className = "",
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

// Upload Progress Modal Component
interface UploadProgressModalProps {
  isOpen: boolean;
  currentFile: string;
  progress: number;
  totalFiles: number;
  currentFileIndex: number;
  onCancel?: () => void;
}

const UploadProgressModal: React.FC<UploadProgressModalProps> = ({
  isOpen,
  currentFile,
  progress,
  totalFiles,
  currentFileIndex,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 w-96 max-w-md mx-4 shadow-2xl border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Uploading Files
          </h3>
          <div className="bg-blue-100 p-2 rounded-full">
            <Upload className="h-5 w-5 text-blue-600" />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              File {currentFileIndex + 1} of {totalFiles}
            </p>
            <p className="text-sm font-medium text-gray-800 truncate bg-gray-50 px-3 py-2 rounded-lg">
              {currentFile}
            </p>
          </div>

          <ProgressBar progress={progress} />

          <div className="text-center bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-700 font-medium">
              {/* FIX: Removed nested <p> tag */}
              Please do not close this window while uploading&hellip;
            </p>
          </div>

          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
            >
              Cancel Upload
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced upload function with progress tracking
// IMPORTANT: This 'uploadWithProgress' now expects 'uploadFunction' to NOT take a 'bucket' parameter
const uploadWithProgress = async (
  file: File,
  // Removed 'bucket' parameter as it will be hardcoded in the specific upload functions (e.g., uploadHomepageImage)
  path: string, // This will be the full path including the folder (e.g., "event-carousel/...")
  uploadFunction: (file: File, path: string) => Promise<string | null>, // Updated type signature for uploadFunction
  onProgress: (progress: number) => void
): Promise<string | null> => {
  // Simulate progress since we can't get real progress from uploadFunction
  // In a real implementation, you'd modify your upload functions to support progress callbacks
  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 90) {
        clearInterval(interval);
        onProgress(90);
      } else {
        onProgress(progress);
      }
    }, 100);
    return interval;
  };

  const progressInterval = simulateProgress();

  try {
    // Removed 'bucket' from the call to uploadFunction
    const result = await uploadFunction(file, path);
    clearInterval(progressInterval);
    onProgress(100);
    return result;
  } catch (error) {
    clearInterval(progressInterval);
    throw error;
  }
};

export default function HomepageContentManagerBlock() {
  const { toast } = useToast();
  const supabase = createClient();

  const [loading, setLoading] = useState<boolean>(true);
  const [carouselSelectedFiles, setCarouselSelectedFiles] = useState<
    (File | null)[]
  >([]);
  const [northEastCupSelectedFiles, setNorthEastCupSelectedFiles] = useState<
    (File | null)[]
  >([]);
  const [carouselData, setCarouselData] = useState<MediaItem[]>([]);
  const [northEastCupData, setNorthEastCupData] = useState<NorthEastCupItem[]>(
    []
  );
  const [cosplayGallerySelectedFiles, setCosplayGallerySelectedFiles] =
    useState<Array<File | null>>([]);
  const [featuredEvent, setFeaturedEvent] = useState<FeaturedItem>({
    ...FEATURED_EVENT,
  });
  const [cosplayGallery, setCosplayGallery] = useState<CosplayItem[]>([]);
  const [homepageTab, setHomepageTab] = useState<string>("featured");
  const [saving, setSaving] = useState<{ [key: string]: boolean }>({});

  // Upload progress states
  const [uploadProgress, setUploadProgress] = useState({
    isUploading: false,
    currentFile: "",
    progress: 0,
    totalFiles: 0,
    currentFileIndex: 0,
  });

  useEffect(() => {
    async function fetchHomepageContent() {
      setLoading(true);
      try {
        const { data: featuredEventData, error: featuredError } = await supabase
          .from("featured_event")
          .select("*")
          .single();
        if (featuredError && featuredError.code !== "PGRST116") {
          console.error("Error fetching featured event:", featuredError);
          toast({
            title: "Error",
            description: "Failed to load featured event data.",
            variant: "destructive",
          });
          setFeaturedEvent({ ...FEATURED_EVENT });
        } else if (featuredEventData) {
          setFeaturedEvent(featuredEventData);
        } else {
          setFeaturedEvent({ ...FEATURED_EVENT });
        }

        const { data: carouselItems, error: carouselError } = await supabase
          .from("event_carousel")
          .select("*")
          .order("id", { ascending: true });
        if (carouselError) {
          console.error("Error fetching event carousel:", carouselError);
          toast({
            title: "Error",
            description: "Failed to load event carousel data.",
            variant: "destructive",
          });
          setCarouselData(EVENT_DATA.map((e) => ({ ...e })));
          setCarouselSelectedFiles(EVENT_DATA.map(() => null));
        } else if (carouselItems) {
          setCarouselData(carouselItems as MediaItem[]);
          setCarouselSelectedFiles(carouselItems.map(() => null));
        } else {
          setCarouselData(EVENT_DATA.map((e) => ({ ...e })));
          setCarouselSelectedFiles(EVENT_DATA.map(() => null));
        }

        const { data: necItems, error: necError } = await supabase
          .from("northeast_cup")
          .select("*")
          .order("id", { ascending: true });
        if (necError) {
          console.error("Error fetching NorthEast Cup data:", necError);
          toast({
            title: "Error",
            description: "Failed to load NorthEast Cup data.",
            variant: "destructive",
          });
          setNorthEastCupData(TOURNAMENT_DATA.map((e) => ({ ...e })));
          setNorthEastCupSelectedFiles(TOURNAMENT_DATA.map(() => null));
        } else if (necItems) {
          setNorthEastCupData(necItems as NorthEastCupItem[]);
          setNorthEastCupSelectedFiles(necItems.map(() => null));
        } else {
          setNorthEastCupData(TOURNAMENT_DATA.map((e) => ({ ...e })));
          setNorthEastCupSelectedFiles(TOURNAMENT_DATA.map(() => null));
        }

        const { data: cgItems, error: cgError } = await supabase
          .from("cosplay_gallery")
          .select("id, image, order_index")
          .order("order_index", { ascending: true });
        if (cgError) {
          console.error("Error fetching cosplay gallery:", cgError);
          toast({
            title: "Error",
            description: "Failed to load cosplay gallery data.",
            variant: "destructive",
          });
          setCosplayGallery(
            COSPLAY_DATA.map((e, index) => ({
              id: e.id,
              image: e.image,
              order_index: e.order_index || index + 1,
            })) as CosplayItem[]
          );
          setCosplayGallerySelectedFiles(COSPLAY_DATA.map(() => null));
        } else if (cgItems) {
          setCosplayGallery(
            cgItems.map((item) => ({
              id: item.id,
              image: item.image,
              order_index: item.order_index,
            })) as CosplayItem[]
          );
          setCosplayGallerySelectedFiles(cgItems.map(() => null));
        } else {
          setCosplayGallery(
            COSPLAY_DATA.map((e, index) => ({
              id: e.id,
              image: e.image,
              order_index: e.order_index || index + 1,
            })) as CosplayItem[]
          );
          setCosplayGallerySelectedFiles(COSPLAY_DATA.map(() => null));
        }
      } catch (err) {
        console.error(
          "An unexpected error occurred while fetching homepage content:",
          err
        );
        toast({
          title: "Error",
          description:
            "An unexpected error occurred while loading homepage content.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchHomepageContent();
  }, [supabase, toast]);

  async function handleSaveFeaturedEvent(
    updatedData: FeaturedItem,
    file: File | null
  ) {
    setSaving((s) => ({ ...s, featured: true }));
    let bannerImageUrl: string | null = updatedData.bannerImage;

    if (file) {
      setUploadProgress({
        isUploading: true,
        currentFile: file.name,
        progress: 0,
        totalFiles: 1,
        currentFileIndex: 0,
      });

      const storage_path = `featured-event/banner/${file.name}`;
      const url = await uploadWithProgress(
        file,
        storage_path,
        uploadHomepageImage,
        (progress) => setUploadProgress((prev) => ({ ...prev, progress }))
      );

      setUploadProgress((prev) => ({ ...prev, isUploading: false }));

      if (!url) {
        toast({
          title: "Error",
          description: "Failed to upload banner image.",
          variant: "destructive",
        });
        setSaving((s) => ({ ...s, featured: false }));
        return;
      }
      bannerImageUrl = url;
    }

    const { data, error } = await saveFeaturedEventData(
      updatedData,
      bannerImageUrl
    );
    setSaving((s) => ({ ...s, featured: false }));

    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
    } else if (data) {
      toast({ title: "Featured Event updated!" });
      setFeaturedEvent(data);
    }
  }

  // Inside HomepageContentManagerBlock component

  async function handleSaveEventCarousel() {
    setSaving((s) => ({ ...s, carousel: true }));

    const filesToProcess: {
      file: File;
      itemIndex: number;
      oldImageUrl: string | null;
      itemType: "image" | "video";
    }[] = [];
    const itemsToUpdate = [...carouselData]; // Make a mutable copy of the current state data

    // Prepare a list of files that actually need uploading, linking them to their original item index
    for (let i = 0; i < carouselData.length; i++) {
      const file = carouselSelectedFiles[i];
      if (file) {
        filesToProcess.push({
          file,
          itemIndex: i,
          oldImageUrl: carouselData[i].image, // Capture the current URL for potential deletion
          itemType: carouselData[i].type, // Store type for correct upload function
        });
      }
    }

    // If no new files to upload, just save existing data (if any text/URL changes were made)
    if (filesToProcess.length === 0) {
      const { data, error } = await saveEventCarouselData(itemsToUpdate);
      setSaving((s) => ({ ...s, carousel: false }));
      if (error) {
        toast({ title: "Error", description: error, variant: "destructive" });
      } else if (data) {
        setCarouselData(data);
        // No need to reset selected files if no files were processed
        toast({ title: "Event Carousel updated!" });
      }
      return; // Exit early if no new files to upload
    }

    // Initialize upload progress modal for all files that *will* be uploaded
    setUploadProgress({
      isUploading: true,
      currentFile: "", // Will be updated by individual promise callbacks
      progress: 0,
      totalFiles: filesToProcess.length,
      currentFileIndex: 0, // Will be updated by individual promise callbacks
    });

    let uploadFailedCount = 0;

    // Create an array of functions that each return a promise for an upload operation
    const uploadPromisesFunctions = filesToProcess.map(
      (fileData, fileProcessIndex) => {
        return async () => {
          const { file, itemIndex, oldImageUrl, itemType } = fileData;

          // Update the progress modal to show which file is currently being processed
          // This will update for the *first* file that starts, then for others as they become the "current" focus
          setUploadProgress((prev) => ({
            ...prev,
            currentFile: file.name,
            currentFileIndex: fileProcessIndex, // This index relates to the `filesToProcess` array
            progress: 0, // Reset progress for the new file
          }));

          // Determine a unique ID for the file in storage.
          // Use item.id if available, otherwise generate a new unique ID
          const uniqueId =
            itemsToUpdate[itemIndex].id ||
            `carousel-${Date.now()}-${itemIndex}`;
          // Construct the storage path using the item's type and a unique identifier
          const storage_path = `event-carousel/${itemType}-items/${uniqueId}_${file.name}`;

          let uploadedUrl: string | null = null;
          try {
            if (itemType === "image") {
              uploadedUrl = await uploadWithProgress(
                file,
                storage_path,
                uploadHomepageImage,
                (progress) => {
                  // Only update the modal's progress bar if this is the file currently displayed
                  if (uploadProgress.currentFileIndex === fileProcessIndex) {
                    setUploadProgress((prev) => ({ ...prev, progress }));
                  }
                }
              );
            } else if (itemType === "video") {
              uploadedUrl = await uploadWithProgress(
                file,
                storage_path,
                uploadHomepageVideo,
                (progress) => {
                  if (uploadProgress.currentFileIndex === fileProcessIndex) {
                    setUploadProgress((prev) => ({ ...prev, progress }));
                  }
                }
              );
            }
          } catch (uploadErr) {
            console.error(`Error during upload for ${file.name}:`, uploadErr);
            uploadedUrl = null; // Ensure URL is null on error
          }

          if (!uploadedUrl) {
            console.error(
              `Failed to upload media for carousel item ${
                itemsToUpdate[itemIndex].title || itemIndex + 1
              }: ${file.name}.`
            );
            uploadFailedCount++;
            // If upload fails, the item in `itemsToUpdate` retains its `oldImageUrl` (or empty string if it was new)
            return null; // Indicate failure for this specific upload
          } else {
            itemsToUpdate[itemIndex].image = uploadedUrl; // Update the copied item with new URL

            // Delete old image if new one was successfully uploaded and an old URL exists and is different
            if (oldImageUrl && oldImageUrl !== uploadedUrl) {
              try {
                // Extract the path from the URL. Assuming public URLs are like ".../storage/v1/object/public/home/[path]"
                const pathParts = oldImageUrl.split("/home/");
                if (pathParts.length > 1) {
                  const oldStoragePath = pathParts[1]; // Get the path relative to the bucket (e.g., 'event-carousel/...')
                  const { error: deleteError } = await supabase.storage
                    .from("home")
                    .remove([oldStoragePath]);
                  if (deleteError) {
                    console.error(
                      `Error deleting old carousel image '${oldStoragePath}':`,
                      deleteError
                    );
                    toast({
                      title: "Warning",
                      description: `Failed to delete old image for ${file.name}: ${deleteError.message}`,
                      variant: "destructive",
                    });
                  } else {
                    console.log(
                      `Successfully deleted old carousel image: ${oldStoragePath}`
                    );
                  }
                } else {
                  console.warn(
                    `Could not parse old carousel image URL for deletion: ${oldImageUrl}. Does it match expected Supabase URL format?`
                  );
                }
              } catch (deleteErr) {
                console.error(
                  "Exception while trying to delete old carousel image:",
                  deleteErr
                );
              }
            }
            return uploadedUrl; // Return the successful URL
          }
        };
      }
    );

    // Run uploads concurrently with a limit
    const CONCURRENCY_LIMIT = 3; // Adjust this value based on desired concurrency and server/client capacity
    await runPromisesInParallel(
      uploadPromisesFunctions,
      CONCURRENCY_LIMIT
      // No need to pass onFileProgress/onFileStart directly here as each promise function manages its own modal state updates
    );

    // After all uploads (concurrently) have finished or failed, hide the modal
    setUploadProgress((prev) => ({ ...prev, isUploading: false }));

    if (uploadFailedCount > 0) {
      toast({
        title: "Uploads Incomplete",
        description: `Some files failed to upload (${uploadFailedCount} failed). Please check console for details.`,
        variant: "destructive",
      });
      // Do not return here, proceed to save whatever could be processed
    }

    // Finally, save all the processed items (with new URLs or old URLs for failed uploads) to the database
    const { data, error } = await saveEventCarouselData(itemsToUpdate); // Pass the updated copy to the save function
    setSaving((s) => ({ ...s, carousel: false }));

    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
    } else if (data) {
      setCarouselData(data);
      setCarouselSelectedFiles(data.map(() => null)); // Reset selected files state after successful DB save
      toast({ title: "Event Carousel updated!" });
    }
  }

  // Refactored to remove setTimeout(0)
  const handleCarouselItemChange = (
    idx: number,
    newItem: MediaItem | null,
    newFile?: File | null
  ) => {
    console.log(
      `[handleCarouselItemChange] Called for index ${idx}. New Item:`,
      newItem,
      `New File:`,
      newFile
    );

    // Update carouselData
    setCarouselData((prevData) => {
      const newData = [...prevData];
      if (newItem === null) {
        newData.splice(idx, 1);
      } else {
        if (idx === newData.length) {
          newData.push(newItem);
        } else {
          newData[idx] = newItem;
        }
      }
      return newData;
    });

    // Update carouselSelectedFiles (now directly in the function, not nested)
    setCarouselSelectedFiles((prevFiles) => {
      console.log(
        "[handleCarouselItemChange] setCarouselSelectedFiles - Previous files (direct update):",
        prevFiles.map((f) => (f ? f.name : "null"))
      );
      const newFiles = [...prevFiles];

      if (newItem === null) {
        // If item was removed
        newFiles.splice(idx, 1);
      } else {
        // If item was added or updated
        if (idx === newFiles.length) {
          // Adding a new item
          newFiles.push(newFile || null);
        } else {
          // Updating an existing item
          newFiles[idx] = newFile || null;
        }
      }
      console.log(
        "[handleCarouselItemChange] setCarouselSelectedFiles - Updated files (direct update):",
        newFiles.map((f) => (f ? f.name : "null"))
      );
      return newFiles;
    });
  };

  const handleNorthEastCupItemChange = (
    idx: number,
    newItem: NorthEastCupItem | null,
    newFile?: File | null
  ) => {
    setNorthEastCupData((prevData) => {
      const newData = [...prevData];
      if (newItem === null) {
        newData.splice(idx, 1);
      } else {
        if (idx === newData.length) {
          newData.push(newItem);
        } else newData[idx] = newItem;
      }
      return newData;
    });

    setNorthEastCupSelectedFiles((prevFiles) => {
      const newFiles = [...prevFiles];
      if (newItem === null) {
        newFiles.splice(idx, 1);
      } else {
        if (idx === newFiles.length) {
          newFiles.push(newFile || null); // Push new file if adding
        } else {
          newFiles[idx] = newFile || null; // Update file if modifying existing
        }
      }
      return newFiles;
    });
  };

  // Inside HomepageContentManagerBlock component

  async function handleSaveNorthEastCup() {
    setSaving((s) => ({ ...s, necup: true }));

    const filesToProcess: {
      file: File;
      itemIndex: number;
      oldImageUrl: string | null;
    }[] = [];
    const itemsToUpdate = [...northEastCupData]; // Make a mutable copy

    for (let i = 0; i < northEastCupData.length; i++) {
      const file = northEastCupSelectedFiles[i];
      if (file) {
        filesToProcess.push({
          file,
          itemIndex: i,
          oldImageUrl: northEastCupData[i].image,
        });
      }
    }

    if (filesToProcess.length === 0) {
      const { data, error } = await saveNorthEastCupData(itemsToUpdate);
      setSaving((s) => ({ ...s, necup: false }));
      if (error) {
        toast({ title: "Error", description: error, variant: "destructive" });
      } else if (data) {
        setNorthEastCupData(data);
        toast({ title: "NorthEast Cup updated!" });
      }
      return;
    }

    setUploadProgress({
      isUploading: true,
      currentFile: "",
      progress: 0,
      totalFiles: filesToProcess.length,
      currentFileIndex: 0,
    });

    let uploadFailedCount = 0;

    const uploadPromisesFunctions = filesToProcess.map(
      (fileData, fileProcessIndex) => {
        return async () => {
          const { file, itemIndex, oldImageUrl } = fileData;

          setUploadProgress((prev) => ({
            ...prev,
            currentFile: file.name,
            currentFileIndex: fileProcessIndex,
            progress: 0,
          }));

          const uniqueId =
            itemsToUpdate[itemIndex].id || `nec-${Date.now()}-${itemIndex}`;
          const storage_path = `northeast-cup/${uniqueId}_${file.name}`;

          let uploadedUrl: string | null = null;
          try {
            uploadedUrl = await uploadWithProgress(
              file,
              storage_path,
              uploadHomepageImage, // Assuming only images for NEC
              (progress) => {
                if (uploadProgress.currentFileIndex === fileProcessIndex) {
                  setUploadProgress((prev) => ({ ...prev, progress }));
                }
              }
            );
          } catch (uploadErr) {
            console.error(`Error during upload for ${file.name}:`, uploadErr);
            uploadedUrl = null;
          }

          if (!uploadedUrl) {
            console.error(
              `Failed to upload image for NorthEast Cup item ${
                itemsToUpdate[itemIndex].title || itemIndex + 1
              }.`
            );
            uploadFailedCount++;
            return null;
          } else {
            itemsToUpdate[itemIndex].image = uploadedUrl;

            if (oldImageUrl && oldImageUrl !== uploadedUrl) {
              try {
                const pathParts = oldImageUrl.split("/home/");
                if (pathParts.length > 1) {
                  const oldStoragePath = pathParts[1];
                  const { error: deleteError } = await supabase.storage
                    .from("home")
                    .remove([oldStoragePath]);
                  if (deleteError) {
                    console.error(
                      `Error deleting old NorthEast Cup image '${oldStoragePath}':`,
                      deleteError
                    );
                    toast({
                      title: "Warning",
                      description: `Failed to delete old image for ${file.name}: ${deleteError.message}`,
                      variant: "destructive",
                    });
                  } else {
                    console.log(
                      `Successfully deleted old NorthEast Cup image: ${oldStoragePath}`
                    );
                  }
                } else {
                  console.warn(
                    `Could not parse old NorthEast Cup image URL for deletion: ${oldImageUrl}`
                  );
                }
              } catch (deleteErr) {
                console.error(
                  "Exception while trying to delete old NorthEast Cup image:",
                  deleteErr
                );
              }
            }
            return uploadedUrl;
          }
        };
      }
    );

    const CONCURRENCY_LIMIT = 3; // Adjust as needed
    await runPromisesInParallel(uploadPromisesFunctions, CONCURRENCY_LIMIT);

    setUploadProgress((prev) => ({ ...prev, isUploading: false }));

    if (uploadFailedCount > 0) {
      toast({
        title: "Uploads Incomplete",
        description: `Some files failed to upload (${uploadFailedCount} failed). Please check console for details.`,
        variant: "destructive",
      });
    }

    const { data, error } = await saveNorthEastCupData(itemsToUpdate);
    setSaving((s) => ({ ...s, necup: false }));

    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
    } else if (data) {
      setNorthEastCupData(data);
      setNorthEastCupSelectedFiles(data.map(() => null));
      toast({ title: "NorthEast Cup updated!" });
    }
  }

  // Refactored to remove setTimeout(0) and use useCallback correctly for state updates
  const handleCosplayGalleryItemChange = useCallback(
    (idx: number, newItem: CosplayItem | null, newFile?: File | null) => {
      console.log(
        `[handleCosplayGalleryItemChange] Called for index ${idx}. New Item:`,
        newItem,
        `New File:`,
        newFile
      );

      // Directly update state without setTimeout
      console.group(
        `[handleCosplayGalleryItemChange] Direct Execution (Index: ${idx})`
      ); // Changed log to reflect direct execution
      console.log(`   Processed New Item:`, newItem);
      console.log(
        `   Processed New File:`,
        newFile
          ? `Name: ${newFile.name}, Size: ${newFile.size}, Type: ${newFile.type}`
          : "None"
      );

      setCosplayGallery((prevGalleryItems) => {
        console.log(
          `   [setCosplayGallery] Previous State:`,
          prevGalleryItems.map((item) => item.image)
        );
        const updatedGalleryItems = [...prevGalleryItems];

        if (newItem === null) {
          console.log(
            `   [setCosplayGallery] Action: Removing item at index ${idx}`
          );
          updatedGalleryItems.splice(idx, 1);
        } else {
          if (idx === prevGalleryItems.length) {
            console.log(
              `   [setCosplayGallery] Action: Adding new item at index ${idx}`
            );
            updatedGalleryItems.push(newItem);
          } else {
            console.log(
              `   [setCosplayGallery] Action: Updating item at index ${idx}`
            );
            updatedGalleryItems[idx] = newItem;
          }
        }

        const finalGalleryState = updatedGalleryItems.map((item, i) => ({
          ...item,
          order_index: i + 1,
        }));
        console.log(
          `   [setCosplayGallery] Final State Returned:`,
          finalGalleryState.map((item) => item.image)
        );
        return finalGalleryState;
      });

      setCosplayGallerySelectedFiles((prevFiles) => {
        console.log(
          `   [setCosplayGallerySelectedFiles] Previous State:`,
          prevFiles.map((f) => (f ? f.name : "null"))
        );
        const updatedFiles = [...prevFiles];

        if (newItem === null) {
          console.log(
            `   [setCosplayGallerySelectedFiles] Action: Removing file at index ${idx}`
          );
          updatedFiles.splice(idx, 1);
        } else {
          if (idx === prevFiles.length) {
            const isAlreadyAdded = prevFiles.some(
              (existingFile) =>
                existingFile &&
                newFile &&
                existingFile.name === newFile.name &&
                existingFile.size === newFile.size &&
                existingFile.type === newFile.type
            );

            if (!isAlreadyAdded) {
              console.log(
                `   [setCosplayGallerySelectedFiles] Action: Adding new file "${newFile?.name}" at index ${idx}`
              );
              updatedFiles.push(newFile || null);
            } else {
              console.log(
                `   [setCosplayGallerySelectedFiles] Skipped adding duplicate file: "${newFile?.name}"`
              );
            }
          } else {
            if (newFile !== undefined) {
              console.log(
                `   [setCosplayGallerySelectedFiles] Action: Updating file at index ${idx} with "${newFile?.name}"`
              );
              updatedFiles[idx] = newFile;
            } else {
              console.log(
                `   [setCosplayGallerySelectedFiles] Action: No new file provided for update at index ${idx}.`
              );
            }
          }
        }
        console.log(
          `   [setCosplayGallerySelectedFiles] Final State Returned:`,
          updatedFiles.map((f) => (f ? f.name : "null"))
        );
        return updatedFiles;
      });

      console.groupEnd();
    },
    []
  );

  // Inside HomepageContentManagerBlock component

async function handleSaveCosplayGallery() {
  setSaving((s) => ({ ...s, cosplay: true }));

  const filesToProcess: { file: File; itemIndex: number; oldImageUrl: string | null; orderIndex: number }[] = [];
  const itemsToUpdate = [...cosplayGallery]; // Make a mutable copy

  for (let i = 0; i < cosplayGallery.length; i++) {
    const file = cosplayGallerySelectedFiles[i];
    if (file) {
      filesToProcess.push({
        file,
        itemIndex: i,
        oldImageUrl: cosplayGallery[i].image,
        orderIndex: cosplayGallery[i].order_index // Use for storage path
      });
    }
  }

  if (filesToProcess.length === 0) {
    const { data, error } = await saveCosplayData(itemsToUpdate); // Save even if no files changed (e.g., reordered)
    setSaving((s) => ({ ...s, cosplay: false }));
    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
    } else if (data) {
      setCosplayGallery(data);
      toast({ title: "Cosplay Gallery updated successfully!" });
    }
    return;
  }

  setUploadProgress({
    isUploading: true,
    currentFile: "",
    progress: 0,
    totalFiles: filesToProcess.length,
    currentFileIndex: 0,
  });

  let uploadFailedCount = 0;

  const uploadPromisesFunctions = filesToProcess.map((fileData, fileProcessIndex) => {
    return async () => {
      const { file, itemIndex, oldImageUrl, orderIndex } = fileData;

      setUploadProgress(prev => ({
        ...prev,
        currentFile: file.name,
        currentFileIndex: fileProcessIndex,
        progress: 0,
      }));

      // Use a unique ID for the file in storage path
      // Consider using item.id if available, otherwise order_index + timestamp for uniqueness
      const uniqueId = itemsToUpdate[itemIndex].id || `cosplay-${Date.now()}-${itemIndex}`;
      const storage_path = `cosplay-gallery/cosplay-items/${uniqueId}_${file.name}`; // Updated path logic for uniqueness

      let uploadedUrl: string | null = null;
      try {
        uploadedUrl = await uploadWithProgress(
          file,
          storage_path,
          uploadHomepageImage, // Assuming only images for Cosplay
          (progress) => {
            if (uploadProgress.currentFileIndex === fileProcessIndex) {
              setUploadProgress(prev => ({ ...prev, progress }));
            }
          }
        );
      } catch (uploadErr) {
        console.error(`Error during upload for ${file.name}:`, uploadErr);
        uploadedUrl = null;
      }

      if (!uploadedUrl) {
        console.error(`Failed to upload image for cosplay item ${orderIndex}.`);
        uploadFailedCount++;
        return null;
      } else {
        itemsToUpdate[itemIndex].image = uploadedUrl; // Update the copied item

        if (oldImageUrl && oldImageUrl !== uploadedUrl) {
          try {
            const pathParts = oldImageUrl.split('/home/');
            if (pathParts.length > 1) {
              const oldStoragePath = pathParts[1];
              const { error: deleteError } = await supabase.storage.from('home').remove([oldStoragePath]);
              if (deleteError) {
                console.error(`Error deleting old cosplay image '${oldStoragePath}':`, deleteError);
                toast({
                  title: "Warning",
                  description: `Failed to delete old image for ${file.name}: ${deleteError.message}`,
                  variant: "destructive",
                });
              } else {
                console.log(`Successfully deleted old cosplay image: ${oldStoragePath}`);
              }
            } else {
                console.warn(`Could not parse old cosplay image URL for deletion: ${oldImageUrl}`);
            }
          } catch (deleteErr) {
            console.error("Exception while trying to delete old cosplay image:", deleteErr);
          }
        }
        return uploadedUrl;
      }
    };
  });

  const CONCURRENCY_LIMIT = 3; // Adjust as needed
  await runPromisesInParallel(uploadPromisesFunctions, CONCURRENCY_LIMIT);

  setUploadProgress(prev => ({ ...prev, isUploading: false }));

  if (uploadFailedCount > 0) {
    toast({
      title: "Uploads Incomplete",
      description: `Some files failed to upload (${uploadFailedCount} failed). Please check console for details.`,
      variant: "destructive",
    });
  }

  // After all uploads are done, save the updated `itemsToUpdate` to the database
  const { data, error } = await saveCosplayData(itemsToUpdate);
  setSaving((s) => ({ ...s, cosplay: false }));

  if (error) {
    toast({ title: "Error", description: error, variant: "destructive" });
  } else if (data) {
    setCosplayGallery(data);
    setCosplayGallerySelectedFiles(data.map(() => null)); // Reset selected files
    toast({ title: "Cosplay Gallery updated successfully!" });
  }
}

  const handleCancelUpload = () => {
    setUploadProgress((prev) => ({ ...prev, isUploading: false }));
    // Note: In a real implementation, you'd need to actually cancel the upload
    // This might require modifying your upload functions to support cancellation
  };

  if (loading) {
    return (
      <Card className="bg-white text-zinc-900 rounded-[20px] shadow-lg mt-8 p-6">
        <CardHeader>
          <CardTitle className="text-xl font-bold tracking-tight">
            Homepage Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading homepage content...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white text-zinc-900 rounded-[20px] shadow-lg mt-8">
        <CardHeader>
          <CardTitle className="text-xl font-bold tracking-tight">
            Homepage Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={homepageTab}
            onValueChange={setHomepageTab}
            className="w-full"
          >
            <div className="flex justify-center w-full">
              <div className="">
                <TabsList className="mb-4 md:w-150 justify-between">
                  <TabsTrigger className="" value="featured">
                    <p className="text-[10px] md:text-[13px] font-semibold">
                      Featured Event
                    </p>
                  </TabsTrigger>
                  <TabsTrigger value="carousel">
                    <p className="text-[10px] md:text-[13px] font-semibold">
                      Event Carousel
                    </p>
                  </TabsTrigger>
                  <TabsTrigger value="necup">
                    <p className="text-[10px] md:text-[13px] font-semibold">
                      NorthEast Cup
                    </p>
                  </TabsTrigger>
                  <TabsTrigger value="cosplay">
                    <p className="text-[10px] md:text-[13px] font-semibold">
                      Cosplay Gallery
                    </p>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
            <TabsContent value="featured">
              <FeaturedSectionAdmin
                data={featuredEvent}
                onChange={setFeaturedEvent}
              />
              <Button
                className="mt-6 bg-blue-600 text-white"
                onClick={() => handleSaveFeaturedEvent(featuredEvent, null)}
                disabled={saving.featured}
              >
                <Plus className="mr-2 h-4 w-4" />
                {saving.featured ? "Saving..." : "Save Featured Event"}
              </Button>
            </TabsContent>
            <TabsContent value="carousel">
              <EventCarouselAdmin
                data={carouselData}
                onItemChange={handleCarouselItemChange}
              />
              <Button
                className="mt-6 bg-blue-600 text-white"
                onClick={() => handleSaveEventCarousel()} // Changed call to no arguments
                disabled={saving.carousel}
              >
                <Plus className="mr-2 h-4 w-4" />
                {saving.carousel ? "Saving..." : "Save Event Carousel"}
              </Button>
            </TabsContent>
            <TabsContent value="necup">
              <NorthEastCupAdmin
                data={northEastCupData}
                onItemChange={handleNorthEastCupItemChange}
              />
              <Button
                className="mt-6 bg-blue-600 text-white"
                onClick={() => handleSaveNorthEastCup()} // Changed call to no arguments
                disabled={saving.necup}
              >
                <Plus className="mr-2 h-4 w-4" />
                {saving.necup ? "Saving..." : "Save NorthEast Cup"}
              </Button>
            </TabsContent>
            <TabsContent value="cosplay">
              <CosplaySectionAdmin
                data={cosplayGallery}
                onChange={handleCosplayGalleryItemChange}
              />
              <Button
                className="mt-6 bg-blue-600 text-white"
                onClick={handleSaveCosplayGallery} // Already no arguments
                disabled={saving.cosplay}
              >
                <Plus className="mr-2 h-4 w-4" />
                {saving.cosplay ? "Saving..." : "Save Cosplay Gallery"}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Upload Progress Modal */}
      <UploadProgressModal
        isOpen={uploadProgress.isUploading}
        currentFile={uploadProgress.currentFile}
        progress={uploadProgress.progress}
        totalFiles={uploadProgress.totalFiles}
        currentFileIndex={uploadProgress.currentFileIndex}
        onCancel={handleCancelUpload}
      />
    </>
  );
}
