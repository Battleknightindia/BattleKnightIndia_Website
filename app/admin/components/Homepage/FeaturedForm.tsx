import { FeaturedItem } from "@/types/homepageType";
import { uploadHomepageImage } from "@/lib/homepageImageUpload"; // This file remains the same
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileUploader } from "@/components/File-Uploader"; // This is your existing FileUploader component
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react"; // Import useState and useEffect

type FeaturedSectionAdminProps = {
  data: FeaturedItem;
  onChange: (data: FeaturedItem) => void;
  onSave: (updatedData: FeaturedItem, file: File | null) => void; // New prop for saving
  onSeed?: () => void; // Optional seed prop
};

export function FeaturedSectionAdmin({
  data,
  onChange,
  onSave,
  onSeed, // Destructure onSeed here
}: FeaturedSectionAdminProps) {
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // Effect to create and revoke object URL for image preview
  useEffect(() => {
    if (!bannerFile) {
      setBannerPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(bannerFile);
    setBannerPreview(objectUrl);

    // Clean up when the component unmounts or file changes
    return () => URL.revokeObjectURL(objectUrl);
  }, [bannerFile]);

  // Handler for banner image selection (now just sets file state)
  function handleBannerFileSelect(file: File | null) {
    setBannerFile(file);
    // The actual data.bannerImage will be updated on save
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Featured Event</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <Label>Tournament Name</Label>
            <Input
              value={data.title}
              onChange={(e) => onChange({ ...data, title: e.target.value })}
              placeholder="Title"
            />
            <Label>Registration Date</Label>
            <Input
              value={data.date}
              onChange={(e) => onChange({ ...data, date: e.target.value })}
              placeholder="Date"
            />
            <Label>Location</Label>
            <Input
              value={data.location}
              onChange={(e) => onChange({ ...data, location: e.target.value })}
              placeholder="Location"
            />
            <Label>Teamslots</Label>
            <Input
              value={data.teamCount || 0}
              onChange={(e) =>
                onChange({ ...data, teamCount: Number(e.target.value) })
              }
              placeholder="Team Count"
              type="number"
            />
            <Label>Prizepool</Label>
            <Input
              value={data.prizePool || ""}
              onChange={(e) => onChange({ ...data, prizePool: e.target.value })}
              placeholder="Prize Pool"
            />
            <Label>Registration Link</Label>
            <Input
              value={data.ticketsUrl || ""}
              onChange={(e) =>
                onChange({ ...data, ticketsUrl: e.target.value })
              }
              placeholder="Registration/Tickets URL"
            />
            <Label>Live Stream Link</Label>
            <Input
              value={data.watchUrl || ""}
              onChange={(e) => onChange({ ...data, watchUrl: e.target.value })}
              placeholder="Watch/Stream URL"
            />
            <Label>Description</Label>
            <textarea
              className="w-full rounded border p-2 text-zinc-900 resize-none min-h-[3rem]"
              value={data.description}
              onChange={(e) =>
                onChange({ ...data, description: e.target.value })
              }
              rows={5}
              style={{ overflow: "hidden" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = target.scrollHeight + "px";
              }}
              placeholder="Description"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">
              Banner Image
            </label>
            <FileUploader
              id="featured-banner"
              accept="image/*"
              onFileSelect={handleBannerFileSelect} // Pass the new handler
              currentFile={data.bannerImage} // Still show the saved image
            />
            {(bannerPreview || data.bannerImage) && (
              <Image
                src={bannerPreview || data.bannerImage} // Show preview if available, else saved image
                alt="Banner"
                width={400}
                height={200}
                className="rounded mt-2 object-cover" // Added object-cover for better image fitting
              />
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <Button
            className="bg-blue-600 text-white"
            onClick={() => onSave(data, bannerFile)} // Call the onSave prop
            type="button"
          >
            Save Featured Event
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}