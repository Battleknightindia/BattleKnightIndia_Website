// components/Homepage/NorthEastCupForm.tsx
import { FileUploader } from "@/components/File-Uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NorthEastCupItem } from "@/types/homepageTypes";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

type NorthEastCupAdminProps = {
  data: NorthEastCupItem[];
  // onItemChange now accepts a File | null for the associated file
  onItemChange: (idx: number, val: NorthEastCupItem | null, file?: File | null) => void;
};

export function NorthEastCupAdmin({
  data,
  onItemChange,
}: NorthEastCupAdminProps) {
  // We'll manage local preview URLs here, as `FileUploader` uses `currentFile`
  // and we want immediate feedback for newly selected images.
  const [localPreviewUrls, setLocalPreviewUrls] = useState<(string | null)[]>([]);

  // Effect to update local preview URLs based on data changes or file selections.
  useEffect(() => {
    setLocalPreviewUrls(prevUrls => {
      const newUrls: (string | null)[] = new Array(data.length).fill(null);
      data.forEach((item, idx) => {
        // If the item has an existing image URL (from DB or a temporary URL from a previous onFileSelect call), use it.
        // This is important to retain previews for newly added items before they are saved.
        if (item.image) {
          newUrls[idx] = item.image;
        } else if (prevUrls[idx] && prevUrls[idx]?.startsWith("blob:")) {
            // If the item doesn't have an image, but we had a temporary blob URL from a prior selection at this index,
            // we'll keep it for continuity unless the data entry explicitly removed it.
            newUrls[idx] = prevUrls[idx];
        }
      });
      return newUrls;
    });

    // Cleanup function for object URLs when component unmounts or data changes significantly
    return () => {
      localPreviewUrls.forEach((url) => {
        if (url && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [data]); // Depend on `data` to react to parent changes

  const handleFileSelect = (file: File | null, idx: number) => {
    let tempUrl: string = "";
    if (file) {
      tempUrl = URL.createObjectURL(file);
      // Update local preview state for immediate feedback
      setLocalPreviewUrls((prev) => {
        const newUrls = [...prev];
        if (newUrls[idx] && newUrls[idx]?.startsWith("blob:")) {
            URL.revokeObjectURL(newUrls[idx] as string); // Revoke old URL if it was a blob
        }
        newUrls[idx] = tempUrl;
        return newUrls;
      });
    } else {
        // If file is null (cleared selection), clear local preview and revoke URL
        setLocalPreviewUrls((prev) => {
            const newUrls = [...prev];
            if (newUrls[idx] && newUrls[idx]?.startsWith("blob:")) {
                URL.revokeObjectURL(newUrls[idx] as string);
            }
            newUrls[idx] = null;
            return newUrls;
        });
    }

    // Call parent's onItemChange with the updated item and the actual File object
    // We pass the temporary URL for immediate display, but the parent uses the File object for upload.
    onItemChange(
      idx,
      {
        ...data[idx], // Spread existing item properties
        image: tempUrl, // Set temporary local URL for immediate display
      },
      file // Pass the actual File object to the parent
    );
  };

  const handleAddItem = () => {
    // No need to generate an ID client-side; Supabase will handle it.
    // Use `undefined` or `null` for `id` as it will be assigned by the DB.
    const newItem: NorthEastCupItem = {
      id: undefined as unknown as string, // Supabase generates this
      image: "", // Will be updated by FileUploader's onFileSelect
      title: "",
      description: "",
      stats: {}, // Initialize with empty objects
      statColors: {}, // Initialize with empty objects
      order_index: data.length + 1, // Assign a temporary order_index
    };
    // Pass null for the file since no file is selected yet for this new item.
    onItemChange(data.length, newItem, null);
  };

  const handleDeleteItem = (idx: number) => {
    // Inform parent to remove item from its data array
    onItemChange(idx, null, null); // Pass null for item and file to signal deletion

    // Cleanup local preview URL if it was a blob and remove from array
    setLocalPreviewUrls((prev) => {
        const newUrls = [...prev];
        if (newUrls[idx] && newUrls[idx]?.startsWith("blob:")) {
            URL.revokeObjectURL(newUrls[idx] as string);
        }
        newUrls.splice(idx, 1);
        return newUrls;
    });
  };

  function StatPill({
    name,
    value,
    color,
  }: {
    name: string;
    value: string;
    color: string;
  }) {
    return (
      <span
        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mr-2 mb-2 whitespace-nowrap"
        style={{
          background: color,
          color: "#fff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        }}
      >
        {name}: {value}
      </span>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>NorthEast Cup</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          {data.map((item, idx) => {
            const statsArr = Object.entries(item.stats || {}).map(
              ([name, value]) => ({
                name,
                value: String(value),
                color: (item.statColors)?.[name] || "#000000", // Fallback to black for display if undefined
              })
            );
            return (
              <div
                key={item.id || `temp-${idx}`} // Use real ID if available, else temporary based on index
                className="border rounded-lg p-4 flex flex-col md:flex-row gap-4 items-center relative"
              >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <div>
                    <Input
                      value={item.title}
                      onChange={(e) =>
                        onItemChange(idx, { ...item, title: e.target.value }, null) // Pass null for file as title is not file-related
                      }
                      placeholder="Title"
                      className="mb-2"
                    />
                    <textarea
                      className="w-full rounded border p-2 text-zinc-900 resize-none min-h-[3rem] max-h-60"
                      value={item.description}
                      onChange={(e) =>
                        onItemChange(idx, { ...item, description: e.target.value }, null) // Pass null for file
                      }
                      rows={3}
                      style={{ overflow: "hidden" }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = "auto";
                        target.style.height = target.scrollHeight + "px";
                      }}
                    />
                    {/* Stat pills display area with horizontal scroll */}
                    <div className="mt-4 overflow-x-auto pb-2 custom-scrollbar">
                      <div className="flex flex-nowrap gap-2"> {/* Changed to flex-nowrap and added gap */}
                        {statsArr.map((stat) => (
                          <StatPill
                            key={stat.name}
                            name={stat.name}
                            value={stat.value}
                            color={stat.color}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Stat editor section */}
                    <div className="mt-4 border-t pt-4">
                      <h4 className="text-sm font-semibold mb-2">Edit Stats:</h4>
                      {statsArr.map((stat) => (
                        <div
                          key={stat.name}
                          className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-3 p-2 border rounded"
                        >
                          <Input
                            className="flex-1 min-w-[100px]"
                            value={stat.name}
                            onChange={(e) => {
                              const newName = e.target.value;
                              const newStats = { ...item.stats };
                              const newColors = { ...item.statColors };
                              newStats[newName] = newStats[stat.name];
                              newColors[newName] = newColors[stat.name];
                              delete newStats[stat.name];
                              delete newColors[stat.name];
                              onItemChange(idx, {
                                ...item,
                                stats: newStats,
                                statColors: newColors,
                              }, null); // Pass null for file
                            }}
                            placeholder="Stat Name"
                          />
                          <Input
                            className="flex-1 min-w-[100px]"
                            value={stat.value}
                            onChange={(e) => {
                              const newStats = {
                                ...item.stats,
                                [stat.name]: e.target.value,
                              };
                              onItemChange(idx, { ...item, stats: newStats }, null); // Pass null for file
                            }}
                            placeholder="Stat Value"
                          />
                          <div className="flex items-center gap-1">
                            <input
                              type="color"
                              value={
                                /^#/.test(stat.color) ? stat.color : "#000000"
                              }
                              onChange={(e) => {
                                const newColors = {
                                  ...item.statColors,
                                  [stat.name]: e.target.value,
                                };
                                onItemChange(idx, {
                                  ...item,
                                  statColors: newColors,
                                }, null); // Pass null for file
                              }}
                              title="Hex color picker"
                              className="h-9 w-9 p-0 border border-input rounded-md cursor-pointer"
                            />
                            <Input
                              className="w-full sm:w-36"
                              placeholder="e.g. rgba(255, 0, 0, 0.5)"
                              value={stat.color}
                              onChange={(e) => {
                                const value = e.target.value;
                                const newColors = {
                                  ...item.statColors,
                                  [stat.name]: value,
                                };
                                onItemChange(idx, {
                                  ...item,
                                  statColors: newColors,
                                }, null); // Pass null for file
                              }}
                              title="Accepts hex, rgb, rgba, etc."
                            />
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              const newStats = { ...item.stats };
                              const newColors = { ...item.statColors };
                              delete newStats[stat.name];
                              delete newColors[stat.name];
                              onItemChange(idx, {
                                ...item,
                                stats: newStats,
                                statColors: newColors,
                              }, null); // Pass null for file
                            }}
                            type="button"
                            className="shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        size="sm"
                        className="mt-2 bg-blue-600 text-white"
                        onClick={() => {
                          const newStatName =
                            "New Stat " + (Object.keys(item.stats || {}).length + 1);
                          const newStats = {
                            ...item.stats,
                            [newStatName]: "",
                          };
                          const newColors = {
                            ...item.statColors,
                            [newStatName]: "#000000", // Default color for new stat
                          };
                          onItemChange(idx, {
                            ...item,
                            stats: newStats,
                            statColors: newColors,
                          }, null); // Pass null for file
                        }}
                        type="button"
                      >
                        + Add Stat
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <FileUploader
                      id={`necup-image-${idx}`}
                      accept="image/*"
                      onFileSelect={(file) => handleFileSelect(file, idx)}
                      currentFile={localPreviewUrls[idx] || item.image} // Use localPreviewUrls for immediate feedback
                    />
                    {(localPreviewUrls[idx] || item.image) && (
                      <Image
                        src={localPreviewUrls[idx] || item.image}
                        alt="Cup"
                        width={200}
                        height={200}
                        className="rounded mt-2 object-cover"
                      />
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
            );
          })}
          <Button
            className="bg-blue-600 text-white self-start"
            onClick={handleAddItem}
            type="button"
          >
            + Add Cup Card
          </Button>
        </div>
        <div className="flex gap-2 mt-6"></div>
      </CardContent>
    </Card>
  );
}