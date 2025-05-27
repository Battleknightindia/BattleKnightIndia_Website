import { FileUploader } from "@/components/File-Uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NorthEastCupItem } from "@/types/homepageType";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

type NorthEastCupAdminProps = {
  data: NorthEastCupItem[];
  onItemChange: (idx: number, val: NorthEastCupItem | null) => void;
  onSave: (currentData: NorthEastCupItem[], files: (File | null)[]) => void;
};

export function NorthEastCupAdmin({
  data,
  onItemChange,
  onSave,
}: NorthEastCupAdminProps) {
  console.log("NorthEastCupAdmin received data:", data);
  const [selectedFiles, setSelectedFiles] = useState<(File | null)[]>(
    data.map(() => null)
  );
  const [previewUrls, setPreviewUrls] = useState<(string | null)[]>(
    data.map(() => null)
  );

  useEffect(() => {
    const newPreviewUrls = data.map((item, idx) => {
      const file = selectedFiles[idx];
      if (file) {
        return URL.createObjectURL(file);
      }
      return null;
    });

    setPreviewUrls(newPreviewUrls);

    return () => {
      newPreviewUrls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [selectedFiles, data]);

  const handleFileSelect = (file: File | null, idx: number) => {
    setSelectedFiles((prev) => {
      const newFiles = [...prev];
      newFiles[idx] = file;
      return newFiles;
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
        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mr-2 mb-2 whitespace-nowrap" // Added whitespace-nowrap
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

  const handleAddItem = () => {
    const newItem: NorthEastCupItem = {
      id: Date.now(),
      image: "",
      title: "",
      description: "",
      stats: {},
      statColors: {},
    };
    onItemChange(data.length, newItem);
    setSelectedFiles((prev) => [...prev, null]);
    setPreviewUrls((prev) => [...prev, null]);
  };

  const handleDeleteItem = (idx: number) => {
    onItemChange(idx, null);
    setSelectedFiles((prev) => {
      const newFiles = [...prev];
      newFiles.splice(idx, 1);
      return newFiles;
    });
    setPreviewUrls((prev) => {
      const newPreviews = [...prev];
      if (newPreviews[idx]) URL.revokeObjectURL(newPreviews[idx] as string);
      newPreviews.splice(idx, 1);
      return newPreviews;
    });
  };

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
                color: (item.statColors)?.[name] || "#",
              })
            );
            return (
              <div
                key={item.id}
                className="border rounded-lg p-4 flex flex-col md:flex-row gap-4 items-center relative"
              >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full"> {/* Added w-full */}
                  <div>
                    <Input
                      value={item.title}
                      onChange={(e) =>
                        onItemChange(idx, { ...item, title: e.target.value })
                      }
                      placeholder="Title"
                      className="mb-2" // Added margin-bottom
                    />
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
                    {/* Stat pills display area with horizontal scroll */}
                    <div className="mt-4 overflow-x-auto pb-2 custom-scrollbar"> {/* Added custom-scrollbar for styling */}
                      <div className=""> {/* Changed to flex-nowrap and added gap */}
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
                    <div className="mt-4 border-t pt-4"> {/* Added border-top and padding-top */}
                      <h4 className="text-sm font-semibold mb-2">Edit Stats:</h4>
                      {statsArr.map((stat) => (
                        <div
                          key={stat.name}
                          className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-3 p-2 border rounded" // Adjusted for better stacking on mobile
                        >
                          <Input
                            className="flex-1 min-w-[100px]" // Allow inputs to shrink
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
                              });
                            }}
                            placeholder="Stat Name"
                          />
                          <Input
                            className="flex-1 min-w-[100px]" // Allow inputs to shrink
                            value={stat.value}
                            onChange={(e) => {
                              const newStats = {
                                ...item.stats,
                                [stat.name]: e.target.value,
                              };
                              onItemChange(idx, { ...item, stats: newStats });
                            }}
                            placeholder="Stat Value"
                          />
                          <div className="flex items-center gap-1">
                            <input
                              type="color"
                              value={
                                /^#/.test(stat.color) ? stat.color : "#000000" // Fallback to black for color picker
                              }
                              onChange={(e) => {
                                const newColors = {
                                  ...item.statColors,
                                  [stat.name]: e.target.value,
                                };
                                onItemChange(idx, {
                                  ...item,
                                  statColors: newColors,
                                });
                              }}
                              title="Hex color picker"
                              className="h-9 w-9 p-0 border border-input rounded-md cursor-pointer" // Styled color input
                            />
                            <Input
                              className="w-full sm:w-36" // Adjusted width for responsiveness
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
                                });
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
                              });
                            }}
                            type="button"
                            className="shrink-0" // Prevent button from shrinking
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
                          });
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
                      currentFile={previewUrls[idx] || item.image}
                    />
                    {(previewUrls[idx] || item.image) && (
                      <Image
                        src={previewUrls[idx] || item.image}
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
        <div className="flex gap-2 mt-6">
          <Button
            className="bg-blue-600 text-white"
            onClick={() => onSave(data, selectedFiles)}
            type="button"
          >
            Save NorthEast Cup
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}