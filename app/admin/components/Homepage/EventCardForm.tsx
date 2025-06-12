// components/Homepage/EventCardForm.tsx
import { FileUploader } from "@/components/File-Uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MediaItem } from "@/types/homepageTypes";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

// Adjusted props to match the CosplayForm pattern
type EventCarouselAdminProps = {
  data: MediaItem[];
  // onItemChange now accepts a File | null for the associated file
  onItemChange: (idx: number, val: MediaItem | null, file?: File | null) => void;
};

export function EventCarouselAdmin({
  data,
  onItemChange,
}: EventCarouselAdminProps) {
  // Local state to manage preview URLs for files currently selected in the UI
  const [localPreviewUrls, setLocalPreviewUrls] = useState<(string | null)[]>([]);

  // Effect to manage object URLs for previews whenever the `data` prop changes.
  // This ensures previews are updated when the parent adds/removes items,
  // or when the image property itself changes (e.g., after save).
  useEffect(() => {
    // We only create new object URLs for new files selected.
    // Existing item.image URLs are used directly.
    setLocalPreviewUrls(prevUrls => {
      const newUrls: (string | null)[] = new Array(data.length).fill(null);
      data.forEach((item, idx) => {
        // If an item has an existing image URL from DB, use it directly.
        // Otherwise, if we had a local preview for a new item, keep it.
        // This relies on the parent's `onItemChange` being called with `null`
        // for `newFile` when a file is not changed/added, so `localPreviewUrls`
        // would only contain URLs for *newly selected* files.
        // A more robust approach might be to have `FileUploader` manage its own
        // current preview state and only `onFileSelect` passes the file up.
        // However, let's keep this based on your current `FileUploader` usage.

        // If the item itself has an image property (e.g., from DB or a temporary URL from handleFileSelect)
        // and it's not a URL already created by createObjectURL, then use it directly.
        if (item.image && !item.image.startsWith("blob:")) {
            newUrls[idx] = item.image;
        } else {
            // Otherwise, if there was a previous local preview URL for this index, try to maintain it.
            // This is crucial for newly added items before they are saved to DB.
            if (prevUrls[idx] && prevUrls[idx]?.startsWith("blob:") && data[idx]?.image?.startsWith("blob:")) {
                newUrls[idx] = prevUrls[idx];
            }
        }
      });
      return newUrls;
    });

    // Cleanup function to revoke object URLs (not strictly necessary here as
    // URL.createObjectURL is generally managed by FileUploader's internal state
    // and cleanup in the current FileUploader implementation.
    // However, if local state *did* manage object URLs, this is where you'd clean up)
    return () => {
      // This part would typically be more focused if `localPreviewUrls` strictly
      // contained only `URL.createObjectURL` outputs.
      // For now, `FileUploader` handles its own URL revocation when `currentFile` changes or unmounts.
    };
  }, [data]); // Depend on `data` to react to parent changes

  // Handler for file selection in FileUploader
  const handleFileSelect = (file: File | null, idx: number) => {
    let tempUrl: string = "";
    if (file) {
      tempUrl = URL.createObjectURL(file);
      // Update local preview state for immediate feedback
      setLocalPreviewUrls((prev) => {
        const newUrls = [...prev];
        newUrls[idx] = tempUrl;
        return newUrls;
      });
    } else {
        // If file is null (cleared selection), clear local preview
        setLocalPreviewUrls((prev) => {
            const newUrls = [...prev];
            if (newUrls[idx] && newUrls[idx]?.startsWith("blob:")) {
                URL.revokeObjectURL(newUrls[idx] as string); // Revoke old URL if it was a blob
            }
            newUrls[idx] = null;
            return newUrls;
        });
    }

    // Call parent's onItemChange with the updated item and the actual File object
    onItemChange(
      idx,
      {
        ...data[idx],
        image: tempUrl || data[idx].image, // Use temporary local URL for immediate display or retain existing image
        type: file && file.type.startsWith("video/") ? "video" : "image",
      },
      file // Pass the actual File object to the parent
    );
  };

  // Handler for adding a new item
  const handleAddItem = () => {
    // For a new item, `id` should be undefined (or null), so Supabase generates it.
    // We use `null` or `undefined` for `id` and allow parent to handle `tempId` if it needs.
    // For React's key, we can fall back to `temp-${data.length}` as done in CosplayForm.
    const newItem: MediaItem = {
      id: undefined as unknown as string, // id will be generated by Supabase on insert
      title: "",
      date: "",
      type: "image", // Default type
      image: "", // Will be updated by FileUploader's onFileSelect
      aspectRatio: "landscape",
      description: "",
      order_index: data.length + 1, // Set order_index for new item
    };
    // No file is selected yet, so pass null for file
    onItemChange(data.length, newItem, null);
  };

  // Handler for deleting an item
  const handleDeleteItem = (idx: number) => {
    // Inform parent to remove item from its data array
    onItemChange(idx, null, null); // Pass null for item and file to signal deletion

    // Cleanup local preview URL if it was a blob
    setLocalPreviewUrls((prev) => {
        const newUrls = [...prev];
        if (newUrls[idx] && newUrls[idx]?.startsWith("blob:")) {
            URL.revokeObjectURL(newUrls[idx] as string);
        }
        newUrls.splice(idx, 1);
        return newUrls;
    });
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Event Card Carousel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          {data.map((item, idx) => (
            <div
              key={item.id || `temp-${idx}`} // Use real ID if available, else temporary based on index
              className="border rounded-lg p-4 flex flex-col md:flex-row gap-4 items-center relative"
            >
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Input
                    value={item.title}
                    onChange={(e) =>
                      onItemChange(idx, { ...item, title: e.target.value })
                    }
                    placeholder="Title"
                  />
                  <Input
                    value={item.date}
                    onChange={(e) =>
                      onItemChange(idx, { ...item, date: e.target.value })
                    }
                    type="date"
                    placeholder="Date"
                  />
                  {/* Select for Type (Image/Video) */}
                  <select
                    className="w-full rounded border p-2 text-zinc-900"
                    value={item.type}
                    onChange={(e) =>
                      onItemChange(idx, {
                        ...item,
                        type: e.target.value as "image" | "video",
                      })
                    }
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                  {/* Select for Aspect Ratio */}
                  <select
                    className="w-full rounded border p-2 text-zinc-900"
                    value={item.aspectRatio}
                    onChange={(e) =>
                      onItemChange(idx, {
                        ...item,
                        aspectRatio: e.target.value as
                          | "portrait"
                          | "landscape"
                          | "square",
                      })
                    }
                  >
                    <option value="landscape">Landscape</option>
                    <option value="square">Square</option>
                    <option value="portrait">Portrait</option>
                  </select>
                  {item.type === "image" ? (
                    <textarea
                      className="w-full rounded border p-2 text-zinc-900 resize-none min-h-[3rem] max-h-60"
                      value={item.description}
                      onChange={(e) =>
                        onItemChange(idx, { ...item, description: e.target.value })
                      }
                      rows={3}
                      style={{ overflow: "hidden" }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = "auto";
                        target.style.height = target.scrollHeight + "px";
                      }}
                    />
                  ) : (
                    <div className=""></div>
                  )}
                </div>
                <div className="flex flex-col gap-2 items-center">
                  <FileUploader
                    id={`carousel-image-${idx}`}
                    accept={item.type === "video" ? "video/*" : "image/*"} // Dynamic accept
                    onFileSelect={(file) => handleFileSelect(file, idx)} // Pass file and index
                    // Show local preview if available, else saved URL from DB
                    currentFile={localPreviewUrls[idx] || item.image}
                  />
                  {/* Live aspect ratio preview */}
                  {(localPreviewUrls[idx] || item.image) && (
                    <div
                      className={`
                        ${item.aspectRatio === "square" ? "w-40 h-40" : ""}
                        ${item.aspectRatio === "portrait" ? "w-32 h-48" : ""}
                        ${item.aspectRatio === "landscape" ? "w-64 h-36" : ""}
                      `}
                    >
                      {item.type === "video" ? (
                        <video
                          src={localPreviewUrls[idx] || item.image}
                          controls
                          className="object-cover w-full h-full rounded"
                        />
                      ) : (
                        <Image
                          src={localPreviewUrls[idx] || item.image}
                          alt="Preview"
                          width={256}
                          height={144}
                          className="object-cover w-full h-full rounded"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 rounded-full hover:bg-red-100 hover:text-red-600 transition"
                onClick={() => handleDeleteItem(idx)}
                aria-label="Delete card"
                type="button"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          ))}
          <Button
            className="bg-blue-600 text-white self-start"
            onClick={handleAddItem}
            type="button"
          >
            + Add Event Card
          </Button>
        </div>
        <div className="flex gap-2 mt-6"></div>
      </CardContent>
    </Card>
  );
}