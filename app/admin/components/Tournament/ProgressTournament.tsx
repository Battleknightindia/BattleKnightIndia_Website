import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useState } from "react";
import { updateTournament } from "@/lib/server_actions/tournaments";
import { useRouter } from 'next/navigation';
import { TournamentForms, TournamentStatus, TournamentInputs } from "@/types/tournamentsType";

interface ProgressFormProps {
  form?: TournamentForms;
  status: TournamentStatus | null;
  tournamentId: string | null;
  open: boolean;
  onClose: () => void;
}


export function ProgressForm({ open, onClose, status, form, tournamentId}: ProgressFormProps) {
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState<TournamentForms>({ ...form });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [image, setImage] = useState<File| null>();
  const router = useRouter();

  const refreshPage = () => {
    router.refresh(); // 🔄 This triggers a re-fetch of server data
  };

  if (!open) return null;

  // Handle input changes
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFields((prev: TournamentForms) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // Handle file input (for champion logo)
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setFields((prev: TournamentForms) => ({ ...prev, champions_logo: file }));
      setImagePreview(URL.createObjectURL(file));
      setImage(file)
    }
  }

  // Handle form submit for each status
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    let updateData: TournamentInputs = {};
    if (status === "upcoming") {
      updateData = {
        registrationlink: fields.registrationlink,
        registration_end_date: fields.registration_end_date,
        startdate: fields.startdate,
        status: "registration",
      };
    } else if (status === "registration") {
      updateData = {
        livestreamlink: fields.livestreamlink,
        status: "live",
        enddate: fields.enddate,
      };
    } else if (status === "live") {
      updateData = {
        champions: fields.champions,
        status: "past",
      };
    }
    const { success, error } = await updateTournament({id:tournamentId, updateData, championLogoFile : image});
    setLoading(false);
    if (success) {
      onClose();
      setImage(null);
      setFields({});
      setImagePreview("");
      refreshPage(); // Refresh the page to reflect changes
    } else {
      alert(error || "Failed to update tournament");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-900 text-2xl"
        >
          &times;
        </button>
        {status === "upcoming" ? (
          <div className="">
            <h2 className="text-2xl font-bold mb-6 text-zinc-900">
              Add Registration Details
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="flex justify-between">
                <div className="">
                  <Label className="">Registration Link</Label>
                  <Input
                    name="registrationlink"
                    value={fields.registrationlink || ""}
                    onChange={handleChange}
                    required
                    className="text-zinc-900"
                  />
                </div>
                <div className="">
                  <Label>Registration End Date</Label>
                  <Input
                    name="registration_end_date"
                    value={fields.registration_end_date || ""}
                    onChange={handleChange}
                    type="date"
                    required
                    className="text-zinc-900"
                  />
                </div>
              </div>
              <div className="">
                  <Label>Tournament Start Date</Label>
                  <Input
                    name="startdate"
                    value={fields.startdate || ""}
                    onChange={handleChange}
                    type="date"
                    required
                    className="text-zinc-900"
                  />
                </div>
              <Button
                type="submit"
                className="w-full bg-emerald-500 text-white mt-2"
                disabled={loading}
              >
                {loading ? "Saving..." : "Start Registration"}
              </Button>
            </form>
          </div>
        ) : status === "registration" ? (
          <div className="">
            <h2 className="text-2xl font-bold mb-6 text-zinc-900">
              Add Live Stream Link
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="flex">
                <div className="flex-1/2 pr-3">
                <Label>Live Stream Link</Label>
                <Input
                  name="livestreamlink"
                  value={fields.livestreamlink || ""}
                  onChange={handleChange}
                  required
                  className="text-zinc-900"
                />
              </div>
              <div className="flex-1/2 pl-3">
                  <Label>Tournament End Date</Label>
                  <Input
                    name="registration_end_date"
                    value={fields.enddate}
                    onChange={handleChange}
                    type="date"
                    required
                    className="text-zinc-900"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-red-500 text-white mt-2"
                disabled={loading}
              >
                {loading ? "Saving..." : "Go Live"}
              </Button>
            </form>
          </div>
        ): status === "live" ?(
            <div className="">
            <h2 className="text-2xl font-bold mb-6 text-zinc-900">
              Add Champion Details
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="">
                <Label>Total Participants</Label>
                <Input
                  name="total_participants"
                  value={fields.total_participants || ""}
                  onChange={handleChange}
                  required
                  className="text-zinc-900 hover:ring-2 focus-visible:ring-blue-500 ring-blue-500 duration-200 ease-initial"
                />
              </div>
              <div>
                <Label>Champion Team Name</Label>
                <Input
                  name="champions"
                  value={fields.champions || ""}
                  onChange={handleChange}
                  required
                  className="text-zinc-900 hover:ring-2 focus-visible:ring-blue-500 ring-blue-500 duration-200 ease-initial"
                />
              </div>
               <div className="">
                <Label>Champion Team Logo</Label>
                 <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-zinc-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                 />
                 {imagePreview && (
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={200}
                      height={200}
                      className="mt-2 rounded-lg max-h-40 object-contain border"
                    />
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-gray-500 text-white mt-2"
                disabled={loading}
              >
                {loading ? "Saving..." : "Over an Out"}
              </Button>
            </form>
          </div>
        ): (
            <div className="text-center">
              <h1 className="font-bold text-lg">No More Updates</h1>
            </div>
        )}
      </div>
    </div>
  );
}
