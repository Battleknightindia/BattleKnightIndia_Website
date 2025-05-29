import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { TournamentInputs } from "@/types/tournamentsType";

interface UpdateFormProps {
  open: boolean;
  onClose: () => void;
  status: string | undefined;
  form: TournamentInputs;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  championImagePreview: string;
  handleChampionImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
  imagePreview: string;
}

export function UpdateForm({
  open,
  imagePreview,
  handleImageUpload,
  handleChampionImageUpload,
  championImagePreview,
  onClose,
  status,
  form,
  handleChange,
  onSubmit,
  loading,
}: UpdateFormProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 relative max-h-[80vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-900 text-2xl z-10"
        >
          &times;
        </button>
        <div className="overflow-y-auto flex-1 pr-2">
          <h2 className="text-2xl font-bold mb-6 text-zinc-900">
            Update the Tournament Details
          </h2>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="">
              <label className="block text-zinc-700 font-medium mb-1">
                Tournament Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-zinc-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <Image
                src={imagePreview || form.image || ""}
                alt="Tournament Image"
                width={300}
                height={200}
                className="mt-2 rounded-lg shadow-md object-cover"
              ></Image>
            </div>
            <div className="">
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
                  name="prizeMoney"
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
                  name="teamSlots"
                  type="number"
                  value={form.teamslots}
                  onChange={handleChange}
                  required
                  className="text-zinc-900"
                />
              </div>
            </div>
            <div className="flex justify-between gap-4">
              <div className="flex-1/2">
                <label className="block text-zinc-700 font-medium mb-1">
                  Registration Start Date
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
              {status !== "upcoming"  ? (
                <div className="flex-1/2">
                  <label className="block text-zinc-700 font-medium mb-1">
                    Registration End Date
                  </label>
                  <Input
                    name="registration_end_date"
                    type="date"
                    value={form.registration_end_date}
                    onChange={handleChange}
                    required
                    className="text-zinc-900"
                  />
                </div>
              ) : (
                <div className=""></div>
              )}
            </div>
            {status !== "upcoming" ? (
              <div className="space-y-3">
                <div className="flex gap-4">
                  <div className="flex-1/2">
                    <label className="block text-zinc-700 font-medium mb-1">
                      Registration Link
                    </label>
                    <Input
                      name="registrationlink"
                      value={form.registrationlink || ""}
                      onChange={handleChange}
                      required
                      className="text-zinc-900"
                    />
                  </div>
                  {status !== "registration" ? (
                    <div className="flex-1/2">
                    <label className="block text-zinc-700 font-medium mb-1">
                      Live Stream Link
                    </label>
                    <Input
                      name="livestreamlink"
                      value={form.livestreamlink || ""}
                      onChange={handleChange}
                      required
                      className="text-zinc-900"
                    />
                  </div>
                  ) : (
                    <div className=""></div>
                  )}
                </div>
                <div className="flex gap-4">
                    <div className="flex-1/2">
                      <label className="block text-zinc-700 font-medium mb-1">
                        Tournament Start Date
                      </label>
                      <Input
                        name="startdate"
                        type="date"
                        value={form.startdate || ""}
                        onChange={handleChange}
                        required
                        className="text-zinc-900"
                      />
                    </div>
                    {status !== "registration" ? (
                      <div className="flex-1/2">
                        <label className="block text-zinc-700 font-medium mb-1">
                          Tournament End Date
                        </label>
                        <Input
                          name="enddate"
                          type="date"
                          value={form.enddate || ""}
                          onChange={handleChange}
                          required
                          className="text-zinc-900"
                        />
                      </div>
                    ) : (
                      <div className=""></div>
                    )}
                  </div>
              </div>
            ) : (
              <div className=""></div>
            )}
            {status === "past" ? (
              <div className="space-y-4">
                <div className="">
                  <label className="block text-zinc-700 font-medium mb-1">
                  Total Team Participants
                </label>
                <Input
                  name="total_participants"
                  value={form.total_participants || ""}
                  onChange={handleChange}
                  required
                  className="text-zinc-900"
                />
                </div>
                <div className="">
                  <label className="block text-zinc-700 font-medium mb-1">
                  Champion Team Name
                </label>
                <Input
                  name="champions"
                  value={form.champions || ""}
                  onChange={handleChange}
                  required
                  className="text-zinc-900"
                />
                </div>
                <div className="">
                  <label className="block text-zinc-700 font-medium mb-1">
                    Champion Team Logo
                  </label>
                  <input
                    type="file"
                    onChange={handleChampionImageUpload}
                    accept="image/*"
                    className="block w-full text-sm text-zinc-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {championImagePreview && (
                    <Image
                      src={championImagePreview || form.champions_logo || ""}
                      alt="Champion Team Logo"
                      width={300}
                      height={200}
                      className="mt-2 rounded-lg shadow-md object-cover"
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className=""></div>
            )}
            <div>
              <label className="block text-zinc-700 font-medium mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={form.description || ""}
                onChange={handleChange}
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
              {loading ? "Updating..." : "Update"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
