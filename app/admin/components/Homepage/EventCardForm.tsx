import { FileUploader } from "@/components/File-Uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MediaItem } from "@/types/homepageTypes";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react"; // Import useState and useEffect

type EventCarouselAdminProps = {
  data: MediaItem[];
  // Renamed prop for clarity
  onItemChange: (idx: number, val: MediaItem | null) => void;
  // New prop to communicate selected files and trigger save
  onSave: (currentData: MediaItem[], files: (File | null)[]) => void;
};

export function EventCarouselAdmin({
  data,
  onItemChange,
  onSave,
}: EventCarouselAdminProps) {
  // State to store the actual File objects for upload
  const [selectedFiles, setSelectedFiles] = useState<(File | null)[]>(
    data.map(() => null)
  );
  // State to store local preview URLs for immediate display
  const [previewUrls, setPreviewUrls] = useState<(string | null)[]>(
    data.map(() => null)
  );

  // Effect to manage object URLs for previews
  useEffect(() => {
    const newPreviewUrls = data.map((item, idx) => {
      const file = selectedFiles[idx];
      if (file) {
        return URL.createObjectURL(file);
      }
      return null;
    });

    setPreviewUrls(newPreviewUrls);

    // Cleanup function to revoke object URLs when component unmounts or files change
    return () => {
      newPreviewUrls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [selectedFiles, data]); // Depend on selectedFiles and data to update previews

  // Handler for file selection in FileUploader
  const handleFileSelect = (file: File | null, idx: number) => {
    setSelectedFiles((prev) => {
      const newFiles = [...prev];
      newFiles[idx] = file;
      return newFiles;
    });
    // For videos, we still need to set the src immediately for previewing, as we don't upload them yet.
    // For images, the actual src will be updated on save.
    if (file && file.type.startsWith("video/")) {
      onItemChange(idx, { ...data[idx], src: URL.createObjectURL(file), type: "video" });
    } else if (file && file.type.startsWith("image/")) {
      onItemChange(idx, { ...data[idx], src: data[idx]?.src || '', type: "image" }); // Keep existing src for now, it'll be updated on save
    } else {
        onItemChange(idx, { ...data[idx], src: "", type: "image" });
    }
  };

  // Handler for adding a new item
  const handleAddItem = () => {
    const newItem: MediaItem = {
      id: Date.now().toString(),
      title: "",
      date: "",
      type: "image",
      src: "",
      aspectRatio: "landscape",
      description: "",
    };
    onItemChange(data.length, newItem); // Add the new item to the data array in the parent
    setSelectedFiles((prev) => [...prev, null]); // Add a null entry for the new file
    setPreviewUrls((prev) => [...prev, null]); // Add a null entry for the new preview URL
  };

  // Handler for deleting an item
  const handleDeleteItem = (idx: number) => {
    onItemChange(idx, null); // Inform parent to remove item
    setSelectedFiles((prev) => {
        const newFiles = [...prev];
        newFiles.splice(idx, 1);
        return newFiles;
    });
    setPreviewUrls((prev) => {
        const newPreviews = [...prev];
        if (newPreviews[idx]) URL.revokeObjectURL(newPreviews[idx] as string); // Revoke URL if exists
        newPreviews.splice(idx, 1);
        return newPreviews;
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
              key={item.id}
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
                    placeholder="Date"
                  />
                  {/* Select for Type (Image/Video) */}
                  <select
                    className="w-full rounded border p-2 text-zinc-900"
                    value={item.type} // Ensure this is item.type
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
                  {item.type === "image"?(
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
                  ):(
                    <div className=""></div>
                  )}
                </div>
                <div className="flex flex-col gap-2 items-center">
                  <FileUploader
                    id={`carousel-image-${idx}`}
                    accept={item.type === "video" ? "video/*" : "image/*"} // Dynamic accept
                    onFileSelect={(file) => handleFileSelect(file, idx)} // Pass index
                    currentFile={previewUrls[idx] || item.src} // Show local preview if available, else saved URL
                  />
                  {/* Live aspect ratio preview */}
                  {(previewUrls[idx] || item.src) && (
                    <div
                      className={`
                        ${item.aspectRatio === "square" ? "w-40 h-40" : ""}
                        ${item.aspectRatio === "portrait" ? "w-32 h-48" : ""}
                        ${item.aspectRatio === "landscape" ? "w-64 h-36" : ""}
                      `}
                    >
                      {item.type === "video" ? (
                        <video
                          src={previewUrls[idx] || item.src}
                          controls
                          className="object-cover w-full h-full rounded"
                        />
                      ) : (
                        <Image
                          src={previewUrls[idx] || item.src}
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
                onClick={() => handleDeleteItem(idx)} // Use new delete handler
                aria-label="Delete card"
                type="button"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          ))}
          <Button
            className="bg-blue-600 text-white self-start"
            onClick={handleAddItem} // Use new add item handler
            type="button"
          >
            + Add Event Card
          </Button>
        </div>
        <div className="flex gap-2 mt-6">
          <Button
            className="bg-blue-600 text-white"
            onClick={() => onSave(data, selectedFiles)} // Pass data and selectedFiles
            type="button"
          >
            Save Carousel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}