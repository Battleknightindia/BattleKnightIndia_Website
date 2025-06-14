// components/Homepage/NorthEastCupForm.tsx
import { FileUploader } from "@/components/File-Uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NorthEastCupItem, NorthEastCupStat } from "@/types/homepageTypes";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs for new stats

type NorthEastCupAdminProps = {
  data: NorthEastCupItem[];
  onItemChange: (idx: number, val: NorthEastCupItem | null, file?: File | null) => void;
};

// Default stat color map for new stats or when one isn't provided by the DB
// This should ideally be a configurable constant or fetched from a global setting
const DEFAULT_STAT_COLORS: { [key: string]: string } = {
  "Wins": "#22c55e",
  "Goals": "#3b82f6",
  "Losses": "#ef4444",
  "Draws": "#f59e0b",
  "Points": "#8b5cf6",
};

export function NorthEastCupAdmin({
  data,
  onItemChange,
}: NorthEastCupAdminProps) {
  const [localPreviewUrls, setLocalPreviewUrls] = useState<(string | null)[]>([]);

  useEffect(() => {
    setLocalPreviewUrls(prevUrls => {
      const newUrls: (string | null)[] = new Array(data.length).fill(null);
      data.forEach((item, idx) => {
        // Only set existing images if they are not blob URLs (meaning they are from DB)
        if (item.image && !item.image.startsWith("blob:")) {
          newUrls[idx] = item.image;
        } 
        // Keep existing blob URLs if they were set by the file uploader for the current session
        else if (prevUrls[idx] && prevUrls[idx]?.startsWith("blob:")) {
          newUrls[idx] = prevUrls[idx];
        }
      });
      return newUrls;
    });

    // Cleanup blob URLs on unmount
    return () => {
      localPreviewUrls.forEach((url) => {
        if (url && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [data]); // Depend on data to re-evaluate preview URLs when data changes

  const handleFileSelect = (file: File | null, idx: number) => {
    const currentBlobUrl = localPreviewUrls[idx];
    if (currentBlobUrl && currentBlobUrl.startsWith("blob:")) {
      URL.revokeObjectURL(currentBlobUrl);
    }

    let tempUrl: string | null = null;
    if (file) {
      tempUrl = URL.createObjectURL(file);
    }

    setLocalPreviewUrls((prev) => {
      const newUrls = [...prev];
      newUrls[idx] = tempUrl;
      return newUrls;
    });

    // Update item with new image URL
    onItemChange(
      idx,
      {
        ...data[idx],
        image: tempUrl || "", // Use empty string if no file, as image is text null in DB
      },
      file
    );
  };

  const handleAddItem = () => {
    const newItem: NorthEastCupItem = {
      id: undefined, // Let Supabase generate ID on insert
      image: "",
      title: "",
      description: "",
      stats: [], // Always initialize stats as an empty array
      statColors: {}, // Always initialize statColors as an empty object
      order_index: data.length + 1,
    };
    onItemChange(data.length, newItem, null);
  };

  const handleDeleteItem = (idx: number) => {
    const urlToDelete = localPreviewUrls[idx];
    if (urlToDelete && urlToDelete.startsWith("blob:")) {
      URL.revokeObjectURL(urlToDelete);
    }

    onItemChange(idx, null, null); // Pass null to signify deletion

    setLocalPreviewUrls((prev) => {
      const newUrls = [...prev];
      newUrls.splice(idx, 1);
      return newUrls;
    });
  };

  const handleStatChange = (
    itemIdx: number,
    statId: string,
    field: keyof NorthEastCupStat,
    value: string
  ) => {
    const currentItem = data[itemIdx];
    // Ensure currentItem.stats is always an array for safe mapping
    const currentStats = Array.isArray(currentItem.stats) ? currentItem.stats : [];

    const newStats = currentStats.map((s) =>
      s.id === statId ? { ...s, [field]: value } : s
    );

    // If the color of a stat is changed, also update the statColors map
    let newStatColors = { ...currentItem.statColors };
    if (field === 'color') {
        const statName = currentStats.find(s => s.id === statId)?.name;
        if (statName) {
            newStatColors[statName] = value;
        }
    }

    onItemChange(itemIdx, { ...currentItem, stats: newStats, statColors: newStatColors }, null);
  };

  const handleAddStat = (itemIdx: number) => {
    const currentItem = data[itemIdx];
    const currentStats = Array.isArray(currentItem.stats) ? currentItem.stats : [];
    
    const newStatName = `Stat ${currentStats.length + 1}`;
    const newStatColor = DEFAULT_STAT_COLORS[newStatName] || "#808080"; // Default to gray if not in map

    const newStat: NorthEastCupStat = {
      id: uuidv4(), // Generate a unique ID for the new stat
      name: newStatName,
      value: "",
      color: newStatColor,
    };

    const updatedStats = [...currentStats, newStat];
    
    // Also update the statColors object for the new stat
    const newStatColors = { ...currentItem.statColors, [newStat.name]: newStat.color };

    onItemChange(
      itemIdx,
      {
        ...currentItem,
        stats: updatedStats,
        statColors: newStatColors,
      },
      null
    );
  };

  const handleDeleteStat = (itemIdx: number, statId: string) => {
    const currentItem = data[itemIdx];
    const currentStats = Array.isArray(currentItem.stats) ? currentItem.stats : [];

    const statToDelete = currentStats.find(s => s.id === statId);
    
    const newStats = currentStats.filter((s) => s.id !== statId);

    // Optionally remove the stat from statColors if it's no longer present in stats array
    let newStatColors = { ...currentItem.statColors };
    if (statToDelete && newStatColors[statToDelete.name]) {
        // Only delete if no other stat uses this name (less common, but good for cleanliness)
        const nameStillExists = newStats.some(s => s.name === statToDelete.name);
        if (!nameStillExists) {
            delete newStatColors[statToDelete.name];
        }
    }

    onItemChange(itemIdx, { ...currentItem, stats: newStats, statColors: newStatColors }, null);
  };

  // Helper component for displaying a stat pill
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
          color: "#fff", // Text color on the pill
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
            // Ensure item.stats is always an array for safe iteration
            // This is the crucial safeguard for data coming from the DB which might be null/object
            const itemStats: NorthEastCupStat[] = Array.isArray(item.stats)
              ? item.stats
              : [];
            
            // Ensure item.statColors is always an object
            const itemStatColors: { [key: string]: string } = item.statColors && typeof item.statColors === 'object'
                ? item.statColors
                : {};


            return (
              <div
                key={item.id || `temp-${idx}`} // Use ID if available, otherwise a temporary key
                className="border rounded-lg p-4 flex flex-col md:flex-row gap-4 items-center relative"
              >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <div>
                    <Input
                      value={item.title}
                      onChange={(e) =>
                        onItemChange(idx, { ...item, title: e.target.value }, null)
                      }
                      placeholder="Title"
                      className="mb-2"
                    />
                    <textarea
                      className="w-full rounded border p-2 text-zinc-900 resize-none min-h-[3rem] max-h-60"
                      value={item.description}
                      onChange={(e) =>
                        onItemChange(idx, { ...item, description: e.target.value }, null)
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
                      <div className="flex flex-nowrap gap-2">
                        {/* Use itemStats (guaranteed array) for mapping */}
                        {itemStats.map((stat) => (
                          <StatPill
                            key={stat.id}
                            name={stat.name}
                            value={stat.value}
                            // Use stat.color first, fall back to itemStatColors, then default
                            color={stat.color || itemStatColors[stat.name] || DEFAULT_STAT_COLORS[stat.name] || "#808080"}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Stat editor section */}
                    <div className="mt-4 border-t pt-4">
                      <h4 className="text-sm font-semibold mb-2">Edit Stats:</h4>
                      {/* Use itemStats (guaranteed array) for mapping */}
                      {itemStats.map((stat) => (
                        <div
                          key={stat.id}
                          className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-3 p-2 border rounded"
                        >
                          <Input
                            // ref={(el) => { statNameRefs.current.set(stat.id, el); }} // No longer needed for this use case
                            className="flex-1 min-w-[100px]"
                            value={stat.name}
                            onChange={(e) => handleStatChange(idx, stat.id, 'name', e.target.value)}
                            placeholder="Stat Name"
                          />
                          <Input
                            className="flex-1 min-w-[100px]"
                            value={stat.value}
                            onChange={(e) => handleStatChange(idx, stat.id, 'value', e.target.value)}
                            placeholder="Stat Value"
                          />
                          <div className="flex items-center gap-1">
                            <input
                              type="color"
                              value={stat.color.startsWith("#") ? stat.color : "#000000"} // Ensure valid hex for color picker
                              onChange={(e) => handleStatChange(idx, stat.id, 'color', e.target.value)}
                              title="Hex color picker"
                              className="h-9 w-9 p-0 border border-input rounded-md cursor-pointer"
                            />
                            <Input
                              className="w-full sm:w-36"
                              placeholder="e.g. #RRGGBB or rgba(255, 0, 0, 0.5)"
                              value={stat.color}
                              onChange={(e) => handleStatChange(idx, stat.id, 'color', e.target.value)}
                              title="Accepts hex, rgb, rgba, etc."
                            />
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteStat(idx, stat.id)}
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
                        onClick={() => handleAddStat(idx)}
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
                      currentFile={localPreviewUrls[idx] || item.image}
                    />
                    {(localPreviewUrls[idx] || item.image) && (
                      <Image
                        src={localPreviewUrls[idx] || item.image}
                        alt={`Cup image for ${item.title || 'item'}`}
                        width={200}
                        height={200}
                        className="rounded mt-2 object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = '/path/to/placeholder-image.png'; // Fallback image
                            (e.target as HTMLImageElement).alt = 'Image failed to load';
                        }}
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
        <div className="flex gap-2 mt-6"></div> {/* This div seems extraneous */}
      </CardContent>
    </Card>
  );
}