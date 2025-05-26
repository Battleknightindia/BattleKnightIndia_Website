"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/utils/supabase/client";
import { Users, Plus, User, Eye, EyeClosed } from "lucide-react";
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
} from "@/types/homepageType";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TournamentForm } from "../components/Tournament/TournamentForm";
import { FeaturedSectionAdmin } from "../components/Homepage/FeaturedForm";
import { EventCarouselAdmin } from "../components/Homepage/EventCardForm";
import { NorthEastCupAdmin } from "../components/Homepage/NorthEastCupForm";
import { CosplaySectionAdmin } from "../components/Homepage/CosplayForm";
import {
  insertTournament,
  updateTournament,
  deleteTournament,
} from "@/lib/server_actions/tournaments";
import { TournamentList } from "../components/Tournament/TournamentList";
import { UpdateForm } from "../components/Tournament/UpdateTournament";
import type {
  Tournament,
  TournamentUpdate,
  TournamentInputs,
} from "@/types/tournamentsType";
import { uploadHomepageImage } from "@/lib/homepageImageUpload";
import TeamList from "../components/Stats/TeamList";
import { TeamListType } from "@/lib/data/statsData";

type UpdateTournamentResult = {
  success: boolean;
  error?: string;
};

interface AdminPanelProps {
    teams: TeamListType[] | undefined;
}

export default function AdminPanel({ teams }: AdminPanelProps){
  const { toast } = useToast();
  const supabase = createClient();
  const [teamsCount, setTeamsCount] = useState<number>(0);
  const [volunteersCount, setVolunteersCount] = useState<number>(0);
  const [usersCount, setUsersCount] = useState<number>(0);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [form, setForm] = useState<TournamentInputs>({
    name: "",
    image: "",
    prizemoney: "",
    registration_start_date: "",
    teamslots: 0,
    startdate: "",
    enddate: "",
    description: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [TeamOpen, setTeamOpen] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [championImage, setChampionImage] = useState<File | null>(null);
  const [championImagePreview, setChampionImagePreview] = useState<string>("");
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState<
    Partial<TournamentUpdate & { id?: string }>
  >({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleting, setDeleting] = useState<{ [id: string]: boolean }>({});
  // Add state for the file selected in FeaturedSectionAdmin
  const [featuredBannerFile, setFeaturedBannerFile] = useState<File | null>(
    null
  );
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
    useState<(File | null)[]>([]);
  const [featuredEvent, setFeaturedEvent] = useState<FeaturedItem>({
    ...FEATURED_EVENT,
  });
  const [cosplayGallery, setCosplayGallery] = useState<CosplayItem[]>([]);
  const [homepageTab, setHomepageTab] = useState<string>("featured");
  const [saving, setSaving] = useState<{ [key: string]: boolean }>({});

  // Fetch stats and tournaments
  useEffect(() => {
    async function fetchStatsAndTournaments() {
      const { data: teams, error: teamsError } = await supabase
        .from("teams")
        .select("id");
      if (!teamsError && teams) setTeamsCount(teams.length);

      const { data: volunteers, error: volError } = await supabase
        .from("volunteers")
        .select("volunteer_id");
      if (!volError && volunteers) setVolunteersCount(volunteers.length);

      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select("user_id");
      if (!usersError && users) setUsersCount(users.length);

      const { data, error } = await supabase.from("tournaments").select("*");
      if (!error && data) setTournaments(data);
    }
    fetchStatsAndTournaments();
  }, [supabase]);

  // Fetch homepage content from Supabase on mount
  useEffect(() => {
    async function fetchHomepageContent() {
      setLoading(true); // Start loading state for the entire homepage content section
      try {
        // --- Fetch Featured Event ---
        const { data: featuredEventData, error: featuredError } = await supabase
          .from("featured_event")
          .select("*")
          .single(); // Use .single() if you expect only one featured event record

        if (featuredError && featuredError.code !== "PGRST116") {
          // PGRST116 is 'No rows found', which is fine for initial empty state
          console.error("Error fetching featured event:", featuredError);
          toast({
            title: "Error",
            description: "Failed to load featured event data.",
            variant: "destructive",
          });
          setFeaturedEvent({ ...FEATURED_EVENT }); // Fallback to default if error
        } else if (featuredEventData) {
          setFeaturedEvent(featuredEventData);
        } else {
          setFeaturedEvent({ ...FEATURED_EVENT }); // Set default if no data found
        }

        // --- Fetch Event Carousel ---
        const { data: carouselItems, error: carouselError } = await supabase
          .from("event_carousel")
          .select("*")
          .order("id", { ascending: true }); // Order by ID to maintain consistent order

        if (carouselError) {
          console.error("Error fetching event carousel:", carouselError);
          toast({
            title: "Error",
            description: "Failed to load event carousel data.",
            variant: "destructive",
          });
          setCarouselData(EVENT_DATA.map((e) => ({ ...e }))); // Fallback to default
          setCarouselSelectedFiles(EVENT_DATA.map(() => null)); // Initialize selectedFiles for defaults
        } else if (carouselItems) {
          setCarouselData(carouselItems as MediaItem[]);
          setCarouselSelectedFiles(carouselItems.map(() => null)); // Initialize selectedFiles for fetched items
        } else {
          setCarouselData(EVENT_DATA.map((e) => ({ ...e }))); // Set default if no data found
          setCarouselSelectedFiles(EVENT_DATA.map(() => null)); // Initialize selectedFiles for defaults
        }

        // --- Fetch NorthEast Cup ---
        console.log("Attempting to fetch NorthEast Cup data...");
        const { data: necItems, error: necError } = await supabase
          .from("northeast_cup")
          .select("*")
          .order("id", { ascending: true });

        if (necError) {
          console.error("Error fetching NorthEast Cup data:", necError);
          // This console.log was checking northEastCupData (the prop's source),
          // but the error path is setting the *other* state.
          // console.log("NorthEast Cup data (error path):", northEastCupData);
          toast({
            /* ... */
          });
          // Make sure this fallback updates northEastCupData too
          setNorthEastCupData(TOURNAMENT_DATA.map((e) => ({ ...e })));
          setNorthEastCupSelectedFiles(TOURNAMENT_DATA.map(() => null));
        } else if (necItems) {
          console.log("Successfully fetched NorthEast Cup data:", necItems);
          // *** CHANGE THIS LINE ***
          setNorthEastCupData(necItems as NorthEastCupItem[]); // <-- Update northEastCupData
          setNorthEastCupSelectedFiles(necItems.map(() => null));
        } else {
          console.log("No NorthEast Cup data found, using defaults.");
          // Make sure this fallback updates northEastCupData too
          setNorthEastCupData(TOURNAMENT_DATA.map((e) => ({ ...e })));
          setNorthEastCupSelectedFiles(TOURNAMENT_DATA.map(() => null));
        }

        // --- Fetch Cosplay Gallery ---
        const { data: cgItems, error: cgError } = await supabase
          .from("cosplay_gallery")
          .select("*");

        if (cgError) {
          console.error("Error fetching cosplay gallery:", cgError);
          toast({
            title: "Error",
            description: "Failed to load cosplay gallery data.",
            variant: "destructive",
          });
          // Fallback to default data and initialize selected files for defaults
          setCosplayGallery(
            COSPLAY_DATA.map((e) => ({ id: e.id, image: e.image }))
          );
          setCosplayGallerySelectedFiles(COSPLAY_DATA.map(() => null));
        } else if (cgItems) {
          setCosplayGallery(cgItems as CosplayItem[]);
          // Initialize selected files state to match the fetched data length
          setCosplayGallerySelectedFiles(cgItems.map(() => null));
        } else {
          // Set default if no data found and initialize selected files for defaults
          setCosplayGallery(
            COSPLAY_DATA.map((e) => ({ id: e.id, image: e.image }))
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
        setLoading(false); // End loading state
      }
    }

    fetchHomepageContent();
  }, [supabase, toast]); // Ensure useEffect runs when supabase client or toast changes

  // Handle form input for adding a tournament
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Handle adding a tournament
  async function handleAddTournament(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (!image) {
        alert("No image selected!");
        setLoading(false);
        return;
      }

      const { success, error } = await insertTournament(
        {
          name: form.name,
          prizemoney: form.prizemoney,
          registration_start_date: form.registration_start_date,
          teamslots: Number(form.teamslots),
          startdate: form.startdate,
          enddate: form.enddate,
          description: form.description,
          status: "upcoming", // Default status
        },
        image
      );

      if (success) {
        toast({ title: "Tournament added!" });
        setForm({
          name: "",
          image: "",
          prizemoney: "",
          registration_start_date: "",
          teamslots: 0,
          startdate: "",
          enddate: "",
          description: "",
        });
        setImagePreview("");
        setImage(null);
        setModalOpen(false);

        const { data } = await supabase.from("tournaments").select("*");
        if (data) setTournaments(data);
      } else if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to add tournament",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  // Update tournament (for champions_logo, only when status is 'past')
  async function handleUpdateTournament(
    id: string | undefined,
    updateData: TournamentInputs
  ) {
    setLoading(true);

    try {
      let Result: UpdateTournamentResult = { success: true, error: undefined };

      // Conditionally upload champion image
      if (championImage) {
        Result = await updateTournament({
          id,
          updateData,
          imageFile: image,
          championLogoFile: championImage,
        });
      } else {
        Result = await updateTournament({
          id,
          updateData,
          imageFile: image,
        });
      }

      // Handle success/failure
      if (Result.success) {
        toast({ title: "Tournament updated!" });
      } else {
        const errorMsg = Result.error || "Unknown error";
        toast({
          title: "Error updating tournament",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Unexpected Error",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  // Delete tournament
  async function handleDeleteTournament(name: string, id: string, url: string) {
    if (!confirm("Delete this tournament?")) return;
    setDeleting((prev) => ({ ...prev, [id]: true }));
    const { success, error } = await deleteTournament(name, id, url);
    setDeleting((prev) => ({ ...prev, [id]: false }));
    if (success) {
      setTournaments(tournaments.filter((t) => t.id !== id));
      toast({ title: "Tournament deleted" });
    } else {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }

  // Handle image upload for tournament image
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setImagePreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  // Handle image upload for champion logo
  async function handleChampionImageUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    setChampionImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setChampionImagePreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  // When closing the add tournament modal, also clear the image preview
  function handleCloseModal() {
    setModalOpen(false);
    setImagePreview("");
  }

  // Handle form input changes for updating a tournament
  function handleUpdateFormChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setUpdateForm((prev) => {
      const value = e.target.value;
      if (e.target.name === "id" && (value === null || value === "null")) {
        return { ...prev, id: undefined };
      }
      return { ...prev, [e.target.name]: value };
    });
  }

  // Handler to open the update modal with selected tournament data
  function handleOpenUpdateModal(tournament: TournamentUpdate) {
    setUpdateForm({ ...tournament, id: tournament.id ?? undefined });
    setUpdateModalOpen(true);
  }

  // Close the update tournament modal and clear image previews
  function handleUpdateClose() {
    setUpdateModalOpen(false);
    setImagePreview("");
    setChampionImagePreview("");
  }

  // Handler for submitting the update tournament form
  async function handleUpdateFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUpdateLoading(true);
    await handleUpdateTournament(updateForm.id, updateForm);
    setUpdateLoading(false);
    setImagePreview("");
    setChampionImagePreview("");
    setUpdateModalOpen(false);
    const { data } = await supabase.from("tournaments").select("*");
    if (data) setTournaments(data);
  }

  // --- Homepage Content Save Handlers ---
  async function handleSaveFeaturedEvent(
    updatedData: FeaturedItem,
    file: File | null
  ) {
    setSaving((s) => ({ ...s, featured: true }));

    let finalBannerImage = updatedData.bannerImage;

    // Only upload if a new file has been selected
    if (file) {
      const url = await uploadHomepageImage(file, "featured-event", "banner");
      if (url) {
        finalBannerImage = url;
        setFeaturedBannerFile(null); // Clear the file after successful upload
      } else {
        toast({
          title: "Error",
          description: "Failed to upload banner image.",
          variant: "destructive",
        });
        setSaving((s) => ({ ...s, featured: false }));
        return; // Stop if image upload fails
      }
    }

    const { error } = await supabase
      .from("featured_event")
      .upsert({ ...updatedData, bannerImage: finalBannerImage }); // Use the potentially new image URL

    setSaving((s) => ({ ...s, featured: false }));
    if (!error) toast({ title: "Featured Event updated!" });
    else
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
  }

  // Modified: Handle saving Event Carousel
  async function handleSaveEventCarousel(
    currentData: MediaItem[],
    selectedFiles: (File | null)[]
  ) {
    setSaving((s) => ({ ...s, carousel: true }));

    const updatedCarouselItems: MediaItem[] = [];

    for (let i = 0; i < currentData.length; i++) {
      const item = { ...currentData[i] }; // Create a copy of the item
      const fileToUpload = selectedFiles[i];

      // Only upload if a new file exists AND it's an image
      if (fileToUpload && item.type === "image") {
        const url = await uploadHomepageImage(
          fileToUpload,
          "event-carousel",
          item.id || `carousel-${i}`
        );
        if (url) {
          item.src = url;
        } else {
          toast({
            title: "Error",
            description: `Failed to upload image for carousel item ${
              item.title || i + 1
            }.`,
            variant: "destructive",
          });
          setSaving((s) => ({ ...s, carousel: false }));
          return; // Stop if image upload fails
        }
      }
      // If it's a video and a new file was selected, its src is already a local URL for preview
      // We'd need a separate video upload logic here if you want to upload videos to Supabase storage.
      // For now, it will remain a local URL or the previously saved URL if no new file was selected.

      updatedCarouselItems.push(item);
    }

    const { error } = await supabase
      .from("event_carousel")
      .upsert(updatedCarouselItems);

    setSaving((s) => ({ ...s, carousel: false }));
    if (!error) {
      toast({ title: "Event Carousel updated!" });
      setCarouselData(updatedCarouselItems); // Update the main state with new URLs
      setCarouselSelectedFiles(updatedCarouselItems.map(() => null)); // Clear selected files after successful upload
    } else {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  // Handle individual item changes from EventCarouselAdmin
  const handleCarouselItemChange = (idx: number, newItem: MediaItem | null) => {
    setCarouselData((prev) => {
      const newData = [...prev];
      if (newItem === null) {
        // Delete item
        newData.splice(idx, 1);
        setCarouselSelectedFiles((prevFiles) => {
          const newFiles = [...prevFiles];
          newFiles.splice(idx, 1);
          return newFiles;
        });
      } else {
        // Add or update item
        if (idx === newData.length) {
          newData.push(newItem);
          setCarouselSelectedFiles((prevFiles) => [...prevFiles, null]); // Add null for new item's file
        } else {
          newData[idx] = newItem;
        }
      }
      return newData;
    });
  };

  // Handle individual item changes from NorthEastCupAdmin
  const handleNorthEastCupItemChange = (
    idx: number,
    newItem: NorthEastCupItem | null
  ) => {
    setNorthEastCupData((prev) => {
      const newData = [...prev];
      if (newItem === null) {
        // Delete item
        newData.splice(idx, 1);
        setNorthEastCupSelectedFiles((prevFiles) => {
          const newFiles = [...prevFiles];
          newFiles.splice(idx, 1);
          return newFiles;
        });
      } else {
        // Add or update item
        if (idx === newData.length) {
          newData.push(newItem);
          setNorthEastCupSelectedFiles((prevFiles) => [...prevFiles, null]); // Add null for new item's file
        } else {
          newData[idx] = newItem;
        }
      }
      return newData;
    });
  };

  // NEW/MODIFIED: Handle saving NorthEast Cup items including image upload
  async function handleSaveNorthEastCup(
    currentData: NorthEastCupItem[],
    selectedFiles: (File | null)[]
  ) {
    setSaving((s) => ({ ...s, necup: true })); // Assuming 'necup' is the key for NorthEast Cup

    const updatedCupItems: NorthEastCupItem[] = [];

    for (let i = 0; i < currentData.length; i++) {
      const item = { ...currentData[i] }; // Create a copy of the item
      const fileToUpload = selectedFiles[i];

      // Only upload if a new file has been selected
      if (fileToUpload) {
        const url = await uploadHomepageImage(
          fileToUpload,
          "northeast-cup", // Your specific folder for these images
          item.id?.toString() || `necup-${i}` // Ensure a unique ID for the file
        );
        if (url) {
          item.image = url;
        } else {
          toast({
            title: "Error",
            description: `Failed to upload image for NorthEast Cup item ${
              item.title || i + 1
            }.`,
            variant: "destructive",
          });
          setSaving((s) => ({ ...s, necup: false }));
          return; // Stop if image upload fails
        }
      }
      updatedCupItems.push(item);
    }

    const { error } = await supabase
      .from("north_east_cup") // Make sure this table name is correct
      .upsert(updatedCupItems);

    setSaving((s) => ({ ...s, necup: false }));
    if (!error) {
      toast({ title: "NorthEast Cup updated!" });
      setNorthEastCupData(updatedCupItems); // Update the main state with new URLs
      setNorthEastCupSelectedFiles(updatedCupItems.map(() => null)); // Clear selected files after successful upload
    } else {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  const handleCosplayGalleryItemChange = (
    idx: number,
    newItem: CosplayItem | null,
    newFile?: File | null
  ) => {
    setCosplayGallery((prev) => {
      const newData = [...prev];
      if (newItem === null) {
        // Delete item
        newData.splice(idx, 1);
        // Also remove the corresponding file from the selected files array
        setCosplayGallerySelectedFiles((prevFiles) => {
          const newFiles = [...prevFiles];
          newFiles.splice(idx, 1);
          return newFiles;
        });
      } else {
        // Add or update item
        if (idx === newData.length) {
          // Add new item
          newData.push(newItem);
          // Add the new file (or null) to the selected files array
          setCosplayGallerySelectedFiles((prevFiles) => [
            ...prevFiles,
            newFile || null,
          ]);
        } else {
          // Update existing item
          newData[idx] = newItem;
          // If a new file is provided, update it in the selected files array
          if (newFile !== undefined) {
            setCosplayGallerySelectedFiles((prevFiles) => {
              const newFiles = [...prevFiles];
              newFiles[idx] = newFile;
              return newFiles;
            });
          }
        }
      }
      return newData;
    });
  };

  async function handleSaveCosplayGallery() {
    // Removed currentData, selectedFiles from params
    setSaving((s) => ({ ...s, cosplay: true }));

    const finalCosplayItemsToSave: CosplayItem[] = [];

    // Iterate through the current cosplayGallery state to process uploads
    for (let i = 0; i < cosplayGallery.length; i++) {
      const item = { ...cosplayGallery[i] }; // Create a copy of the item
      const fileToUpload = cosplayGallerySelectedFiles[i];

      // Only upload if a new file has been selected for this item
      if (fileToUpload) {
        const url = await uploadHomepageImage(
          fileToUpload,
          "cosplay-gallery", // Your specific folder for these images
          `cosplay-${item.id || Date.now()}` // Use existing ID or new unique one for filename
        );
        if (url) {
          item.image = url; // Update the item's image URL with the uploaded one
        } else {
          toast({
            title: "Error",
            description: `Failed to upload image for cosplay item ${
              item.id || i + 1
            }.`,
            variant: "destructive",
          });
          setSaving((s) => ({ ...s, cosplay: false }));
          return; // Stop if image upload fails
        }
      }
      finalCosplayItemsToSave.push(item);
    }

    // --- Perform the Save Operations ---
    // For a gallery where items can be reordered/deleted/added freely,
    // it's often easiest to clear all existing and then insert the new set.
    // This matches your previous intent for this section.
    const { error: deleteError } = await supabase
      .from("cosplay_gallery")
      .delete()
      .neq("id", ""); // Deletes all rows

    if (deleteError) {
      console.error("Error clearing old cosplay gallery items:", deleteError);
      toast({
        title: "Error",
        description: `Failed to clear old cosplay gallery items: ${deleteError.message}`,
        variant: "destructive",
      });
      setSaving((s) => ({ ...s, cosplay: false }));
      return;
    }

    const { error: insertError } = await supabase
      .from("cosplay_gallery")
      .insert(finalCosplayItemsToSave); // Insert the items with updated image URLs

    setSaving((s) => ({ ...s, cosplay: false }));
    if (!insertError) {
      toast({ title: "Cosplay Gallery updated!" });
      // After successful save, ensure local state is updated with the new URLs
      setCosplayGallery(finalCosplayItemsToSave);
      setCosplayGallerySelectedFiles(finalCosplayItemsToSave.map(() => null)); // Clear selected files after successful save
    } else {
      toast({
        title: "Error",
        description: insertError.message,
        variant: "destructive",
      });
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-3 md:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Admin Panel
          </h1>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 mb-4">
          <Card
            onClick={() => {
              setTeamOpen(true);
            }}
            className="bg-white cursor-pointer text-blue-500  active:text-amber-600 rounded-xl shadow-md p-2"
          >
            <CardHeader className="p-2 pb-0">
              <CardTitle className="text-xs text-zinc-900 font-bold tracking-tight">
                Teams
              </CardTitle>
            </CardHeader>
            <CardContent className=" flex items-center justify-between p-2 pt-1">
              <div className="flex items-center gap-1 text-xl font-bold text-blue-600">
                <Users className="h-5 w-5" /> {teamsCount}
              </div>
              {TeamOpen ? (
                <Eye className="mr-5" />
              ) : (
                <EyeClosed className="mr-5" />
              )}
            </CardContent>
          </Card>
          <Card className="bg-white text-zinc-900 rounded-xl shadow-md p-2">
            <CardHeader className="p-2 pb-0">
              <CardTitle className="text-xs font-bold tracking-tight">
                Volunteers
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-1">
              <div className="flex items-center gap-1 text-xl font-bold text-blue-600">
                <User className="h-5 w-5" /> {volunteersCount}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white text-zinc-900 rounded-xl shadow-md p-2">
            <CardHeader className="p-2 pb-0">
              <CardTitle className="text-xs font-bold tracking-tight">
                Users
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-1">
              <div className="flex items-center gap-1 text-xl font-bold text-blue-600">
                <Users className="h-5 w-5" /> {usersCount}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white text-zinc-900 rounded-xl shadow-md p-2 hidden md:block">
            <CardHeader className="p-2 pb-0">
              <CardTitle className="text-xs font-bold tracking-tight">
                Admin Utilities
              </CardTitle>
              <CardDescription className="text-[10px]">
                More features soon...
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2 pt-1">
              <div className="text-zinc-500 text-xs">
                User management, analytics, and more.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tournament Modals */}
        <TournamentForm
          open={modalOpen}
          onClose={handleCloseModal}
          onSubmit={handleAddTournament}
          form={form}
          handleChange={handleChange}
          loading={loading}
          handleImageUpload={handleImageUpload}
          imagePreview={imagePreview}
        />

        <UpdateForm
          open={updateModalOpen}
          onClose={handleUpdateClose}
          status={updateForm.status}
          form={updateForm}
          handleChange={handleUpdateFormChange}
          handleImageUpload={handleImageUpload}
          championImagePreview={championImagePreview}
          handleChampionImageUpload={handleChampionImageUpload}
          onSubmit={handleUpdateFormSubmit}
          loading={updateLoading}
          imagePreview={imagePreview}
        />

        {/* Tournament List */}
        <TournamentList
          tournaments={tournaments}
          onAddTournament={() => setModalOpen(true)}
          onDeleteTournament={handleDeleteTournament}
          onUpdateTournament={handleOpenUpdateModal}
          deleting={deleting}
        />

        {/* --- Homepage Content Management Section --- */}
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
                  <p className="text-[10px] md:text-[13px] font-semibold">Featured Event</p>
                </TabsTrigger>
                <TabsTrigger value="carousel">
                  <p className="text-[10px] md:text-[13px] font-semibold">Event Carousel</p>
                </TabsTrigger>
                <TabsTrigger value="necup">
                  <p className="text-[10px] md:text-[13px] font-semibold">NorthEast Cup</p>
                </TabsTrigger>
                <TabsTrigger value="cosplay">
                  <p className="text-[10px] md:text-[13px] font-semibold">Cosplay Gallery</p>
                </TabsTrigger>
              </TabsList>
                </div>
              </div>

              <TabsContent value="featured">
                <FeaturedSectionAdmin
                  onSave={handleSaveFeaturedEvent}
                  data={featuredEvent}
                  onChange={setFeaturedEvent}
                />
              </TabsContent>

              <TabsContent value="carousel">
                <EventCarouselAdmin
                  data={carouselData}
                  onItemChange={handleCarouselItemChange} // Pass the modified item change handler
                  onSave={handleSaveEventCarousel} // Pass the save handler
                />
              </TabsContent>

              <TabsContent value="necup">
                <NorthEastCupAdmin
                  data={northEastCupData}
                  onItemChange={handleNorthEastCupItemChange} // Pass the modified item change handler
                  onSave={handleSaveNorthEastCup} // Pass the save handler
                />
              </TabsContent>

              <TabsContent value="cosplay">
                <CosplaySectionAdmin
                  data={cosplayGallery}
                  onChange={handleCosplayGalleryItemChange} // Pass the new dedicated handler
                />
                {/* The Save button should now be in AdminPanel directly, calling the new save function */}
                <Button
                  className="mt-6 bg-blue-600 text-white"
                  onClick={handleSaveCosplayGallery} // Call the modified save handler
                  disabled={saving.cosplay}
                >
                  <Plus className="mr-2 h-4 w-4" /> Save Cosplay Gallery
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <TeamList teams={teams} open={TeamOpen} onClose={()=>( setTeamOpen(false))} />
    </div>
  );
}
