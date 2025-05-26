import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tournament, TournamentInputs } from "@/types/tournamentsType";
import Image from "next/image";

interface TournamentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: TournamentInputs;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imagePreview: string;
  loading: boolean;
}

export function TournamentForm({
  open,
  onClose,
  onSubmit,
  form,
  handleChange,
  loading,
  handleImageUpload,
  imagePreview,
}: TournamentFormProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-900 text-2xl"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-zinc-900">
          Add New Tournament
        </h2>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-zinc-700 font-medium mb-1">
              Tournament Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
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
          <div>
            <label className="block text-zinc-700 font-medium mb-1">
              Tournament Name
            </label>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="text-zinc-900"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-700 font-medium mb-1">
                Prize Money
              </label>
              <Input
                name="prizemoney"
                value={form.prizemoney}
                onChange={handleChange}
                required
                className="text-zinc-900"
              />
            </div>
            <div>
              <label className="block text-zinc-700 font-medium mb-1">
                Team Slots
              </label>
              <Input
                name="teamslots"
                type="number"
                value={form.teamslots}
                onChange={handleChange}
                required
                className="text-zinc-900"
              />
            </div>
          </div>
          <div>
              <label className="block text-zinc-700 font-medium mb-1">
                Registration Date
              </label>
              <Input
                name="registration_start_date"
                type="date"
                value={form.registration_start_date}
                onChange={handleChange}
                required
                className="text-zinc-900"
              />
            </div>
          <div>
            <label className="block text-zinc-700 font-medium mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description || ""}
              rows={3}
              className="resize-none min-h-[3rem] max-h-60 w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              style={{ overflow: "hidden" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = target.scrollHeight + "px";
              }}
              placeholder="Enter tournament description..."
            />
          </div>         
          <Button
            type="submit"
            className="w-full bg-blue-600 text-white mt-2"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Tournament"}
          </Button>
        </form>
      </div>
    </div>
  );
}