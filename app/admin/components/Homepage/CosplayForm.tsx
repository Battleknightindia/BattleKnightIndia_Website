// components/Homepage/CosplayForm.tsx (or CosplaySectionAdmin.tsx)
import { FileUploader } from "@/components/File-Uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CosplayItem } from "@/types/homepageTypes";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import { Plus } from "lucide-react";
// import { Input } from "@/components/ui/input"; // Input component is no longer needed

// Correct location for CosplaySectionAdminProps definition
type CosplaySectionAdminProps = {
  data: CosplayItem[];
  onChange: (idx: number, val: CosplayItem | null, file?: File | null) => void;
};

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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {data.map((item, idx) => (
            <div
              key={item.id || `temp-${idx}`}
              className="relative w-full aspect-[3/4] flex flex-col items-center justify-end bg-zinc-800 rounded-lg overflow-hidden"
            >
              {item.image && (
                <Image
                  src={item.image}
                  alt={`Cosplay ${item.order_index}`} // Alt text simplified
                  fill
                  className="object-cover"
                />
              )}
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-1 right-1 rounded-full bg-white hover:text-red-600 transition z-10"
                onClick={() => onChange(idx, null)}
                aria-label="Delete image"
                type="button"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              {/* Removed the title input */}
            </div>
          ))}
          <div className="relative flex flex-col items-center justify-center w-full aspect-[3/4] bg-zinc-700 rounded-lg cursor-pointer border-2 border-dashed border-blue-400 hover:bg-zinc-600 transition">
            <FileUploader
              id="cosplay-add-image"
              accept="image/*"
              onFileSelect={(file) => {
                console.count('onFileSelect triggered'); // <--- ADD THIS
                if (!file) return;

                // --- ADD THIS LOG ---
                console.log("FileUploader - onFileSelect called:");
                console.log("  Selected File Name:", file.name);
                console.log("  Selected File Size:", file.size);
                // -------------------

                const tempUrl = URL.createObjectURL(file);
                const newTempItem: CosplayItem = {
                  image: tempUrl,
                  order_index: data.length + 1,
                };
                console.log("TempURL:", tempUrl)
                console.log("Temp:", newTempItem)
                console.log("data_lenght:", data.length)

                console.log("  Selected File Name:", file.name);
                onChange(data.length, newTempItem, file);
              }}
            />
            <Plus className="h-6 w-6 text-white" />
            <span className="text-xs text-white mt-2">Add Image</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
