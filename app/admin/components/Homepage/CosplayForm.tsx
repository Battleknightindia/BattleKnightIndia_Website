// Inside components/CosplayForm.tsx (or CosplaySectionAdmin.tsx)

import { FileUploader } from "@/components/File-Uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { uploadHomepageImage } from "@/lib/homepageImageUpload"; // No longer needed here
import { CosplayItem } from "@/types/homepageType";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import { Plus } from "lucide-react"; // Import Plus icon for the "Add Image" text

type CosplaySectionAdminProps = {
  data: CosplayItem[];
  // Modified onChange to also accept a File object when adding/updating an item
  onChange: (idx: number, val: CosplayItem | null, file?: File | null) => void;
};

// Removed onSeed from props type as it's not used in this component.
export function CosplaySectionAdmin({
  data,
  onChange,
}: CosplaySectionAdminProps) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Cosplay Gallery</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"> {/* Changed to grid for better layout */}
          {data.map((item, idx) => (
            <div
              key={item.id}
              className="relative w-full aspect-[3/4] flex flex-col items-center justify-end bg-zinc-800 rounded-lg overflow-hidden" // Use w-full aspect for responsiveness
            >
              {item.image && (
                <Image
                  src={item.image.startsWith("blob:") ? item.image : item.image} // Use blob URL for preview if present
                  alt={`Cosplay ${item.id}`}
                  fill // Use fill for better responsive image handling
                  className="object-cover"
                />
              )}
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-1 right-1 rounded-full bg-white hover:text-red-600 transition z-10" // z-10 to ensure it's on top
                onClick={() => onChange(idx, null)} // Pass null to indicate deletion
                aria-label="Delete image"
                type="button"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="relative flex flex-col items-center justify-center w-full aspect-[3/4] bg-zinc-700 rounded-lg cursor-pointer border-2 border-dashed border-blue-400 hover:bg-zinc-600 transition">
            <FileUploader
              id="cosplay-add-image"
              accept="image/*"
              onFileSelect={(file) => { // No longer async here, just pass the file up
                if (!file) return;

                // Create a temporary URL for immediate preview (browser-only URL)
                const tempUrl = URL.createObjectURL(file);
                // Create a temporary item with a unique ID and the temporary URL
                const newTempItem: CosplayItem = { id: Date.now(), image: tempUrl };

                // Pass the new item data AND the actual File object up to AdminPanel
                onChange(data.length, newTempItem, file);
              }}
            />
            <Plus className="h-6 w-6 text-white" /> {/* Plus icon */}
            <span className="text-xs text-white mt-2">Add Image</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}