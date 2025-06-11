"use client";
// app/admin/components/Blocks/HomepageContentManagerBlock.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { saveCosplayData, saveFeaturedEventData, saveEventCarouselData, saveNorthEastCupData } from "@/lib/client/home_block_content";
import { uploadHomepageImage, uploadHomepageVideo } from "@/lib/services/storageService";

// Progress Bar Component
interface ProgressBarProps {
  progress: number;
  label?: string;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label, className = "" }) => {
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
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 w-96 max-w-md mx-4 shadow-2xl border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Uploading Files</h3>
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
              Please don't close this window while uploading...
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
const uploadWithProgress = async (
  file: File,
  bucket: string,
  path: string,
  uploadFunction: (file: File, bucket: string, path: string) => Promise<string | null>,
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
    const result = await uploadFunction(file, bucket, path);
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
  const [carouselSelectedFiles, setCarouselSelectedFiles] = useState<(File | null)[]>([]);
  const [northEastCupSelectedFiles, setNorthEastCupSelectedFiles] = useState<(File | null)[]>([]);
  const [carouselData, setCarouselData] = useState<MediaItem[]>([]);
  const [northEastCupData, setNorthEastCupData] = useState<NorthEastCupItem[]>([]);
  const [cosplayGallerySelectedFiles, setCosplayGallerySelectedFiles] = useState<Array<File | null>>([]);
  const [featuredEvent, setFeaturedEvent] = useState<FeaturedItem>({ ...FEATURED_EVENT });
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

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
          setCosplayGallery(COSPLAY_DATA.map((e, index) => ({
            id: e.id,
            image: e.image,
            order_index: e.order_index || (index + 1),
          })) as CosplayItem[]);
          setCosplayGallerySelectedFiles(COSPLAY_DATA.map(() => null));
        } else if (cgItems) {
          setCosplayGallery(cgItems.map(item => ({
            id: item.id,
            image: item.image,
            order_index: item.order_index,
          })) as CosplayItem[]);
          setCosplayGallerySelectedFiles(cgItems.map(() => null));
        } else {
          setCosplayGallery(COSPLAY_DATA.map((e, index) => ({
            id: e.id,
            image: e.image,
            order_index: e.order_index || (index + 1),
          })) as CosplayItem[]);
          setCosplayGallerySelectedFiles(COSPLAY_DATA.map(() => null));
        }
      } catch (err) {
        console.error("An unexpected error occurred while fetching homepage content:", err);
        toast({
          title: "Error",
          description: "An unexpected error occurred while loading homepage content.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchHomepageContent();
  }, [supabase, toast]);

  async function handleSaveFeaturedEvent(updatedData: FeaturedItem, file: File | null) {
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

      const storage_path = `banner/${file.name}`;
      const url = await uploadWithProgress(
        file,
        "featured-event",
        storage_path,
        uploadHomepageImage,
        (progress) => setUploadProgress(prev => ({ ...prev, progress }))
      );

      setUploadProgress(prev => ({ ...prev, isUploading: false }));

      if (!url) {
        toast({ title: "Error", description: "Failed to upload banner image.", variant: "destructive" });
        setSaving((s) => ({ ...s, featured: false }));
        return;
      }
      bannerImageUrl = url;
    }

    const { data, error } = await saveFeaturedEventData(updatedData, bannerImageUrl);
    setSaving((s) => ({ ...s, featured: false }));

    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
    } else if (data) {
      toast({ title: "Featured Event updated!" });
      setFeaturedEvent(data);
    }
  }

  async function handleSaveEventCarousel(currentData: MediaItem[], selectedFiles: (File | null)[]) {
    setSaving((s) => ({ ...s, carousel: true }));
    const processedItems: MediaItem[] = [];
    let uploadFailed = false;

    const filesToUpload = selectedFiles.filter(file => file !== null) as File[];
    if (filesToUpload.length > 0) {
      setUploadProgress({
        isUploading: true,
        currentFile: "",
        progress: 0,
        totalFiles: filesToUpload.length,
        currentFileIndex: 0,
      });
    }

    let fileIndex = 0;
    for (let i = 0; i < currentData.length; i++) {
      const item = { ...currentData[i] };
      const file = selectedFiles[i];

      if (file) {
        setUploadProgress(prev => ({
          ...prev,
          currentFile: file.name,
          currentFileIndex: fileIndex,
          progress: 0,
        }));

        const uniqueId = item.id || `carousel-${Date.now()}-${i}`;
        const storage_path = `${item.type}-items/${uniqueId}_${file.name}`;

        let url: string | null;
        if (item.type === "image") {
          url = await uploadWithProgress(
            file,
            "event-carousel",
            storage_path,
            uploadHomepageImage,
            (progress) => setUploadProgress(prev => ({ ...prev, progress }))
          );
        } else if (item.type === "video") {
          url = await uploadWithProgress(
            file,
            "event-carousel",
            storage_path,
            uploadHomepageVideo,
            (progress) => setUploadProgress(prev => ({ ...prev, progress }))
          );
        } else {
          url = null;
        }

        if (!url) {
          toast({
            title: "Error",
            description: `Failed to upload media for carousel item ${item.title || i + 1}.`,
            variant: "destructive",
          });
          uploadFailed = true;
          break;
        }
        item.src = url;
        fileIndex++;
      }
      processedItems.push(item);
    }

    setUploadProgress(prev => ({ ...prev, isUploading: false }));

    if (uploadFailed) {
      setSaving((s) => ({ ...s, carousel: false }));
      return;
    }

    const { data, error } = await saveEventCarouselData(processedItems);
    setSaving((s) => ({ ...s, carousel: false }));

    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
    } else if (data) {
      setCarouselData(data);
      setCarouselSelectedFiles(data.map(() => null));
      toast({ title: "Event Carousel updated!" });
    }
  }

  const handleCarouselItemChange = (idx: number, newItem: MediaItem | null) => {
    setCarouselData((prev) => {
      const newData = [...prev];
      if (newItem === null) {
        newData.splice(idx, 1);
        setCarouselSelectedFiles((prevFiles) => { 
          const newFiles = [...prevFiles]; 
          newFiles.splice(idx, 1); 
          return newFiles; 
        });
      } else {
        if (idx === newData.length) {
          newData.push(newItem);
          setCarouselSelectedFiles((prevFiles) => [...prevFiles, null]);
        } else newData[idx] = newItem;
      }
      return newData;
    });
  };

  const handleNorthEastCupItemChange = (idx: number, newItem: NorthEastCupItem | null) => {
    setNorthEastCupData((prev) => {
      const newData = [...prev];
      if (newItem === null) {
        newData.splice(idx, 1);
        setNorthEastCupSelectedFiles((prevFiles) => { 
          const newFiles = [...prevFiles]; 
          newFiles.splice(idx, 1); 
          return newFiles; 
        });
      } else {
        if (idx === newData.length) {
          newData.push(newItem);
          setNorthEastCupSelectedFiles((prevFiles) => [...prevFiles, null]);
        } else newData[idx] = newItem;
      }
      return newData;
    });
  };

  async function handleSaveNorthEastCup(currentData: NorthEastCupItem[], selectedFiles: (File | null)[]) {
    setSaving((s) => ({ ...s, necup: true }));
    const processedItems: NorthEastCupItem[] = [];
    let uploadFailed = false;

    const filesToUpload = selectedFiles.filter(file => file !== null) as File[];
    if (filesToUpload.length > 0) {
      setUploadProgress({
        isUploading: true,
        currentFile: "",
        progress: 0,
        totalFiles: filesToUpload.length,
        currentFileIndex: 0,
      });
    }

    let fileIndex = 0;
    for (let i = 0; i < currentData.length; i++) {
      const item = { ...currentData[i] };
      const file = selectedFiles[i];

      if (file) {
        setUploadProgress(prev => ({
          ...prev,
          currentFile: file.name,
          currentFileIndex: fileIndex,
          progress: 0,
        }));

        const uniqueId = item.id || `necup-${Date.now()}-${i}`;
        const storage_path = `team-images/${uniqueId}_${file.name}`;

        const url = await uploadWithProgress(
          file,
          "northeast-cup",
          storage_path,
          uploadHomepageImage,
          (progress) => setUploadProgress(prev => ({ ...prev, progress }))
        );

        if (!url) {
          toast({
            title: "Error",
            description: `Failed to upload image for NorthEast Cup item ${item.title || i + 1}.`,
            variant: "destructive",
          });
          uploadFailed = true;
          break;
        }
        item.image = url;
        fileIndex++;
      }
      processedItems.push(item);
    }

    setUploadProgress(prev => ({ ...prev, isUploading: false }));

    if (uploadFailed) {
      setSaving((s) => ({ ...s, necup: false }));
      return;
    }

    const { data, error } = await saveNorthEastCupData(processedItems);
    setSaving((s) => ({ ...s, necup: false }));

    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
    } else if (data) {
      setNorthEastCupData(data);
      setNorthEastCupSelectedFiles(data.map(() => null));
      toast({ title: "NorthEast Cup updated!" });
    }
  }

  const handleCosplayGalleryItemChange = useCallback(
    (idx: number, newItem: CosplayItem | null, newFile?: File | null) => {
      console.log(`[handleCosplayGalleryItemChange] Initial Call - Index: ${idx}, New Item: ${newItem ? 'Provided' : 'Null'}, New File: ${newFile ? newFile.name : 'None'}`);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        console.log(`[handleCosplayGalleryItemChange] Cleared existing timeout.`);
      }

      timeoutRef.current = setTimeout(() => {
        console.group(`[handleCosplayGalleryItemChange] Debounced Execution (Index: ${idx})`);
        console.log(`  Processed New Item:`, newItem);
        console.log(`  Processed New File:`, newFile ? `Name: ${newFile.name}, Size: ${newFile.size}, Type: ${newFile.type}` : 'None');

        setCosplayGallery((prevGalleryItems) => {
          console.log(`  [setCosplayGallery] Previous State:`, prevGalleryItems.map(item => item.image));
          const updatedGalleryItems = [...prevGalleryItems];

          if (newItem === null) {
            console.log(`  [setCosplayGallery] Action: Removing item at index ${idx}`);
            updatedGalleryItems.splice(idx, 1);
          } else {
            if (idx === prevGalleryItems.length) {
              console.log(`  [setCosplayGallery] Action: Adding new item at index ${idx}`);
              updatedGalleryItems.push(newItem);
            } else {
              console.log(`  [setCosplayGallery] Action: Updating item at index ${idx}`);
              updatedGalleryItems[idx] = newItem;
            }
          }

          const finalGalleryState = updatedGalleryItems.map((item, i) => ({
            ...item,
            order_index: i + 1,
          }));
          console.log(`  [setCosplayGallery] Final State Returned:`, finalGalleryState.map(item => item.image));
          return finalGalleryState;
        });

        setCosplayGallerySelectedFiles((prevFiles) => {
          console.log(`  [setCosplayGallerySelectedFiles] Previous State:`, prevFiles.map(f => f ? f.name : 'null'));
          const updatedFiles = [...prevFiles];

          if (newItem === null) {
            console.log(`  [setCosplayGallerySelectedFiles] Action: Removing file at index ${idx}`);
            updatedFiles.splice(idx, 1);
          } else {
            if (idx === prevFiles.length) {
              const isAlreadyAdded = prevFiles.some(
                (existingFile) =>
                  existingFile && newFile &&
                  existingFile.name === newFile.name &&
                  existingFile.size === newFile.size &&
                  existingFile.type === newFile.type
              );

              if (!isAlreadyAdded) {
                console.log(`  [setCosplayGallerySelectedFiles] Action: Adding new file "${newFile?.name}" at index ${idx}`);
                updatedFiles.push(newFile || null);
              } else {
                console.log(`  [setCosplayGallerySelectedFiles] Skipped adding duplicate file: "${newFile?.name}"`);
              }
            } else {
              if (newFile !== undefined) {
                console.log(`  [setCosplayGallerySelectedFiles] Action: Updating file at index ${idx} with "${newFile?.name}"`);
                updatedFiles[idx] = newFile;
              } else {
                console.log(`  [setCosplayGallerySelectedFiles] Action: No new file provided for update at index ${idx}.`);
              }
            }
          }
          console.log(`  [setCosplayGallerySelectedFiles] Final State Returned:`, updatedFiles.map(f => f ? f.name : 'null'));
          return updatedFiles;
        });

        console.groupEnd();
      }, 0);
    },
    []
  );

  async function handleSaveCosplayGallery() {
    setSaving((s) => ({ ...s, cosplay: true }));
    const processedItems: CosplayItem[] = [];
    let uploadFailed = false;

    const filesToUpload = cosplayGallerySelectedFiles.filter(file => file !== null) as File[];
    if (filesToUpload.length > 0) {
      setUploadProgress({
        isUploading: true,
        currentFile: "",
        progress: 0,
        totalFiles: filesToUpload.length,
        currentFileIndex: 0,
      });
    }

    let fileIndex = 0;
    for (let i = 0; i < cosplayGallery.length; i++) {
      const item = { ...cosplayGallery[i] };
      const file = cosplayGallerySelectedFiles[i];

      if (file) {
        setUploadProgress(prev => ({
          ...prev,
          currentFile: file.name,
          currentFileIndex: fileIndex,
          progress: 0,
        }));

        const storage_path = `cosplay-items/${item.order_index}_${file.name}`;
        const url = await uploadWithProgress(
          file,
          "cosplay-gallery",
          storage_path,
          uploadHomepageImage,
          (progress) => setUploadProgress(prev => ({ ...prev, progress }))
        );

        if (!url) {
          toast({
            title: "Error",
            description: `Failed to upload image for cosplay item ${item.order_index}.`,
            variant: "destructive",
          });
          uploadFailed = true;
          break;
        }
        item.image = url;
        fileIndex++;
      }
      processedItems.push(item);
    }

    setUploadProgress(prev => ({ ...prev, isUploading: false }));

    if (uploadFailed) {
      setSaving((s) => ({ ...s, cosplay: false }));
      return;
    }

    const { data, error } = await saveCosplayData(processedItems);

    setSaving((s) => ({ ...s, cosplay: false }));

    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
    } else if (data) {
      setCosplayGallery(data);
      setCosplayGallerySelectedFiles(data.map(() => null));
      toast({ title: "Cosplay Gallery updated successfully!" });
    }
  }

  const handleCancelUpload = () => {
    setUploadProgress(prev => ({ ...prev, isUploading: false }));
    // Note: In a real implementation, you'd need to actually cancel the upload
    // This might require modifying your upload functions to support cancellation
  };

  if (loading) {
    return (
      <Card className="bg-white text-zinc-900 rounded-[20px] shadow-lg mt-8 p-6">
        <CardHeader><CardTitle className="text-xl font-bold tracking-tight">Homepage Content</CardTitle></CardHeader>
        <CardContent><p>Loading homepage content...</p></CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white text-zinc-900 rounded-[20px] shadow-lg mt-8">
        <CardHeader>
          <CardTitle className="text-xl font-bold tracking-tight">Homepage Content</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={homepageTab} onValueChange={setHomepageTab} className="w-full">
            <div className="flex justify-center w-full">
              <div className="">
                <TabsList className="mb-4 md:w-150 justify-between">
                  <TabsTrigger className="" value="featured"><p className="text-[10px] md:text-[13px] font-semibold">Featured Event</p></TabsTrigger>
                  <TabsTrigger value="carousel"><p className="text-[10px] md:text-[13px] font-semibold">Event Carousel</p></TabsTrigger>
                  <TabsTrigger value="necup"><p className="text-[10px] md:text-[13px] font-semibold">NorthEast Cup</p></TabsTrigger>
                  <TabsTrigger value="cosplay"><p className="text-[10px] md:text-[13px] font-semibold">Cosplay Gallery</p></TabsTrigger>
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
                onClick={() => handleSaveEventCarousel(carouselData, carouselSelectedFiles)} 
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
                onClick={() => handleSaveNorthEastCup(northEastCupData, northEastCupSelectedFiles)} 
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
                onClick={handleSaveCosplayGallery} 
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