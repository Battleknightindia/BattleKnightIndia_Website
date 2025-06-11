"use client";

import { useEffect, useState } from "react";
// Button might not be directly used here if TournamentList handles its own "Add" button
// import { Button } from "@/components/ui/button"; 
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/utils/supabase/client";
import { TournamentForm } from "../Tournament/TournamentForm";
import { TournamentList } from "../Tournament/TournamentList";
import { UpdateForm } from "../Tournament/UpdateTournament";
import type {
  Tournament,
  TournamentUpdate,
  TournamentInputs,
} from "@/types/tournamentsType";
import {
  insertTournament,
  updateTournament,
  deleteTournament,
} from "@/lib/server_actions/tournaments";

export default function TournamentManagerBlock() {
  const { toast } = useToast();
  const supabase = createClient();

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
  const [imagePreview, setImagePreview] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [championImage, setChampionImage] = useState<File | null>(null);
  const [championImagePreview, setChampionImagePreview] = useState<string>("");
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateFormState, setUpdateFormState] = useState< // Renamed to avoid conflict with 'form' state
    Partial<TournamentUpdate & { id?: string }>
  >({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleting, setDeleting] = useState<{ [id: string]: boolean }>({});

  // Fetch tournaments
  useEffect(() => {
    async function fetchTournaments() {
      const { data, error } = await supabase.from("tournaments").select("*").order('registration_start_date', { ascending: false, nullsFirst: false });
      if (!error && data) setTournaments(data);
      else if (error) console.error("Error fetching tournaments:", error);
    }
    fetchTournaments();
  }, [supabase]);

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
        toast({ title: "No image selected!", variant: "destructive" });
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
          status: "upcoming",
        },
        image
      );

      if (success) {
        toast({ title: "Tournament added!" });
        setForm({
          name: "", image: "", prizemoney: "", registration_start_date: "",
          teamslots: 0, startdate: "", enddate: "", description: "",
        });
        setImagePreview("");
        setImage(null);
        setModalOpen(false);
        const { data } = await supabase.from("tournaments").select("*").order('registration_start_date', { ascending: false, nullsFirst: false });
        if (data) setTournaments(data);
      } else if (error) {
        toast({
          title: "Error adding tournament",
          description: typeof error === 'string' ? error : (error as Error)?.message || "Failed to add tournament.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in handleAddTournament:", error);
      toast({
        title: "Error",
        description: "Failed to add tournament due to an unexpected issue.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }
  
  // Handle form input changes for updating a tournament
  function handleUpdateFormChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setUpdateFormState((prev) => { // Use renamed state setter
      const value = e.target.value;
      // Ensure 'id' is handled correctly, especially if it might be null/undefined
      if (e.target.name === "id" && (value === null || value === "null" || value === "")) {
        return { ...prev, id: undefined };
      }
      return { ...prev, [e.target.name]: value };
    });
  }

  // Handler to open the update modal with selected tournament data
  function handleOpenUpdateModal(tournament: TournamentUpdate) {
    setUpdateFormState({ ...tournament, id: tournament.id ?? undefined }); // Use renamed state setter
    // Reset image previews when opening update modal for a new tournament
    setImagePreview(tournament.image || ""); 
    setChampionImagePreview(tournament.champions_logo || "");
    setImage(null); // Clear any previously selected new image
    setChampionImage(null); // Clear any previously selected new champion image
    setUpdateModalOpen(true);
  }

  // Close the update tournament modal and clear image previews
  function handleUpdateClose() {
    setUpdateModalOpen(false);
    setImagePreview("");
    setChampionImagePreview("");
    setImage(null);
    setChampionImage(null);
    setUpdateFormState({}); // Reset update form state
  }
  
  // Handler for submitting the update tournament form
  async function handleUpdateFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!updateFormState.id) {
        toast({ title: "Error", description: "Tournament ID is missing.", variant: "destructive" });
        return;
    }
    setUpdateLoading(true);
  
    // Prepare the data, excluding 'id' from the main updateData object
    // as it's passed separately to the server action.
    const { id, ...updateDataPayload } = updateFormState;
  
    try {
      const result = await updateTournament({
        id: id, 
        updateData: updateDataPayload as TournamentInputs, // Cast if necessary, ensure types align
        imageFile: image, // This is the new tournament image, if any
        championLogoFile: championImage, // This is the new champion logo, if any
      });
  
      if (result.success) {
        toast({ title: "Tournament updated!" });
        const { data } = await supabase.from("tournaments").select("*").order('registration_start_date', { ascending: false, nullsFirst: false });
        if (data) setTournaments(data);
        handleUpdateClose(); // Close modal and clear states
      } else {
        const errorMsg = result.error || "Unknown error";
        toast({
          title: "Error updating tournament",
          description: typeof errorMsg === 'string' ? errorMsg : (errorMsg as Error)?.message || "Update failed.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error in handleUpdateFormSubmit:", err);
      toast({
        title: "Unexpected Error",
        description: (err as Error).message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setUpdateLoading(false);
    }
  }

  // Delete tournament
  async function handleDeleteTournament(name: string, id: string, url: string) {
    if (!confirm(`Are you sure you want to delete the tournament: "${name}"? This action cannot be undone.`)) return;
    setDeleting((prev) => ({ ...prev, [id]: true }));
    try {
        const { success, error } = await deleteTournament(name, id, url);
        if (success) {
        setTournaments(tournaments.filter((t) => t.id !== id));
        toast({ title: "Tournament deleted successfully" });
        } else {
        toast({
            title: "Error deleting tournament",
            description: error || "Failed to delete tournament.",
            variant: "destructive",
        });
        }
    } catch (err) {
        console.error("Error in handleDeleteTournament:", err);
        toast({
            title: "Unexpected Error",
            description: (err as Error).message || "An unexpected error occurred while deleting.",
            variant: "destructive",
        });
    } finally {
        setDeleting((prev) => ({ ...prev, [id]: false }));
    }
  }

  // Handle image upload for tournament image (used by both add and update)
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file); // This is for the new image file for upload
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") setImagePreview(reader.result); // This is for the preview
    };
    reader.readAsDataURL(file);
  }

  // Handle image upload for champion logo
  async function handleChampionImageUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    setChampionImage(file); // This is for the new champion image file for upload
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") setChampionImagePreview(reader.result); // This is for the preview
    };
    reader.readAsDataURL(file);
  }

  // When closing the add tournament modal
  function handleCloseModal() {
    setModalOpen(false);
    setImagePreview("");
    setImage(null);
    setForm({
        name: "", image: "", prizemoney: "", registration_start_date: "",
        teamslots: 0, startdate: "", enddate: "", description: "",
    });
  }

  return (
    <div className="space-y-6">
      {/* Tournament Modals & List */}
      <TournamentForm
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddTournament}
        form={form}
        handleChange={handleChange}
        loading={loading}
        handleImageUpload={handleImageUpload} // For the main tournament image
        imagePreview={imagePreview}
      />

      <UpdateForm
        open={updateModalOpen}
        onClose={handleUpdateClose}
        status={updateFormState.status} // Pass status from updateFormState
        form={updateFormState} // Pass the whole updateFormState
        handleChange={handleUpdateFormChange}
        handleImageUpload={handleImageUpload} // For the main tournament image
        championImagePreview={championImagePreview}
        handleChampionImageUpload={handleChampionImageUpload} // For the champion's logo
        onSubmit={handleUpdateFormSubmit}
        loading={updateLoading}
        imagePreview={imagePreview} // Preview for the main tournament image
      />

      <TournamentList
        tournaments={tournaments}
        onAddTournament={() => setModalOpen(true)}
        onDeleteTournament={handleDeleteTournament}
        onUpdateTournament={handleOpenUpdateModal}
        deleting={deleting}
      />
    </div>
  );
}
