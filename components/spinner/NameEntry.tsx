"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, Users, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface NameEntryProps {
  names: string[];
  onAddName: (name: string) => void;
  onRemoveName: (index: number) => void;
  onClearAll: () => void;
  onAddBulkNames: (names: string[]) => void;
  maxNames?: number;
  className?: string;
}

export const NameEntry = ({
  names,
  onAddName,
  onRemoveName,
  onClearAll,
  onAddBulkNames,
  maxNames = 100,
  className,
}: NameEntryProps) => {
  const [inputValue, setInputValue] = useState("");
  const [bulkInput, setBulkInput] = useState("");
  const [showBulkInput, setShowBulkInput] = useState(false);

  // Load persisted values on mount
  useEffect(() => {
    const savedInput = localStorage.getItem("nameEntry_inputValue");
    const savedBulk = localStorage.getItem("nameEntry_bulkInput");
    if (savedInput !== null) setInputValue(savedInput);
    if (savedBulk !== null) setBulkInput(savedBulk);
  }, []);

  // Persist inputValue
  useEffect(() => {
    localStorage.setItem("nameEntry_inputValue", inputValue);
  }, [inputValue]);

  // Persist bulkInput
  useEffect(() => {
    localStorage.setItem("nameEntry_bulkInput", bulkInput);
  }, [bulkInput]);

  const handleAddName = () => {
    const trimmedName = inputValue.trim();
    if (
      trimmedName &&
      !names.includes(trimmedName) &&
      names.length < maxNames
    ) {
      onAddName(trimmedName);
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddName();
    }
  };

  const handleBulkAdd = () => {
    if (!bulkInput.trim()) return;

    // Parse numbered list format (1. Name1, 2. Name2, etc.)
    const lines = bulkInput.split("\n");
    const parsedNames: string[] = [];

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        // Remove numbering (1., 2., etc.) and extract name
        const nameMatch = trimmedLine.match(/^\d+\.\s*(.+)$/) || [
          null,
          trimmedLine,
        ];
        const name = nameMatch[1]?.trim();
        if (name && !names.includes(name) && !parsedNames.includes(name)) {
          parsedNames.push(name);
        }
      }
    });

    if (parsedNames.length > 0) {
      onAddBulkNames(parsedNames);
      setBulkInput("");
      setShowBulkInput(false);
    }
  };

  return (
    <Card className={cn("lg:w-70 lg:max-w-sm ml-10 bg-white/60 border border-gray-200/50 shadow-lg", className)}>
      <CardHeader className="pb-3 m-3 mb-3 bg-white rounded-lg border border-gray-200/30">
        <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
          <Users className="w-5 h-5 text-gray-700" />
          Participants
        </CardTitle>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {names.length} / {maxNames}
          </span>
          {names.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 ">
        {/* Toggle Buttons */}
        <div className="flex gap-2 mr-10">
          <Button
            variant={!showBulkInput ? "default" : "outline"}
            size="sm"
            onClick={() => setShowBulkInput(false)}
            className={cn("w-30", 
              !showBulkInput 
                ? "bg-gray-800 hover:bg-gray-700 text-white" 
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            )}
          >
            <Plus className="w-4 h-4" />
            Single Entry
          </Button>
          <Button
            variant={showBulkInput ? "default" : "outline"}
            size="sm"
            onClick={() => setShowBulkInput(true)}
            className={cn("w-30",
              showBulkInput 
                ? "bg-gray-800 hover:bg-gray-700 text-white" 
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            )}
          >
            <FileText className="w-4 h-4" />
            Bulk Entry
          </Button>
        </div>

        {/* Input Section */}
        {!showBulkInput ? (
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => {
                const val = e.target.value;
                setInputValue(val);
                localStorage.setItem("nameEntry_inputValue", val);
              }}
              onKeyDown={handleKeyPress}
              placeholder="Enter participant name..."
              className="flex-1 bg-white/70 border-gray-300 text-gray-800 placeholder:text-gray-500 focus:border-gray-500 focus:ring-gray-500"
              disabled={names.length >= maxNames}
            />
            <Button
              onClick={handleAddName}
              disabled={
                !inputValue.trim() ||
                names.includes(inputValue.trim()) ||
                names.length >= maxNames
              }
              size="sm"
              className="px-3 bg-gray-800 hover:bg-gray-700 text-white disabled:bg-gray-400"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Textarea
              value={bulkInput}
              onChange={(e) => {
                const val = e.target.value;
                setBulkInput(val);
                localStorage.setItem("nameEntry_bulkInput", val);
              }}
              placeholder="Enter names in this format:&#10;1. Name1&#10;2. Name2&#10;3. Name3&#10;&#10;Or just paste a list of names (one per line)"
              className="min-h-24 bg-white/70 border-gray-300 text-gray-800 placeholder:text-gray-500 focus:border-gray-500 focus:ring-gray-500"
              disabled={names.length >= maxNames}
            />
            <Button
              onClick={handleBulkAdd}
              disabled={!bulkInput.trim() || names.length >= maxNames}
              size="sm"
              className="w-full bg-gray-800 hover:bg-gray-700 text-white disabled:bg-gray-400"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Names
            </Button>
          </div>
        )}

        {/* Names List */}
        <div className="space-y-2 max-h-35 overflow-y-auto">
          {names.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50 text-gray-400" />
              <p className="text-sm">No participants yet</p>
              <p className="text-xs">Start adding names to begin</p>
            </div>
          ) : (
            names.map((name, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-100 rounded-md group hover:bg-gray-200/80 transition-colors border border-gray-200/30"
              >
                <span className="text-sm font-medium truncate text-gray-800">{name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveName(index)}
                  className="p-1 h-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Progress Bar */}
        <div className="bg-white p-3 rounded-lg border border-gray-200/30">
          <div className="w-full bg-gray-200/80 rounded-full h-2">
            <div
              className="bg-gray-800 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(names.length / maxNames) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};