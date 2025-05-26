"use client";

import { useState, useRef, ChangeEvent, useEffect } from "react";
// We will remove the direct use of Shadcn Button for the main clickable area
// import { Button } from "@/components/ui/button" // You might still need this if you use Button elsewhere
import { Input } from "@/components/ui/input"; // Keep Input for the hidden file input
import { Upload, Check, AlertCircle, XCircle } from "lucide-react"; // Check if all are used

interface FileUploaderProps {
  id?: string; // Add id prop here for accessibility
  accept?: string;
  onFileSelect: (file: File | null) => void;
  currentFile?: File | string | null; // Represents a file already selected or a URL passed from parent
  helpText?: string;
  maxSize?: number; // in bytes
}

export function FileUploader({
  id, // Accept the id prop
  accept = "image/*",
  onFileSelect,
  currentFile, // Data passed from parent (can be File, URL string, or null)
  helpText,
  maxSize = 5 * 1024 * 1024, // 5MB default
}: FileUploaderProps) {
  // Internal state to display file name, synchronized with currentFile prop via effect
  const [displayedFileName, setDisplayedFileName] = useState<string | null>(
    null
  );
  // The 'error' state variable is used below in JSX conditional rendering
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Effect to synchronize internal displayed file name with the parent's currentFile prop
  useEffect(() => {
    setError(null); // Clear error when parent file changes - USED
    if (currentFile) {
      if (typeof currentFile === "string") {
        // If it's a URL string, display the file name part or a generic name
        try {
          const url = new URL(currentFile);
          const segments = url.pathname.split("/");
          setDisplayedFileName(
            segments[segments.length - 1] || "Uploaded file"
          );
        } catch (err) { // Changed error to err to avoid conflict with state variable name
          // Handle invalid URL strings gracefully
          console.error("Error parsing URL for displayed file name:", err);
          setDisplayedFileName("Uploaded file");
        }
      } else {
        // If it's a File object, display its name
        setDisplayedFileName(currentFile.name);
      }
    } else {
      // If currentFile is null, clear the displayed name
      setDisplayedFileName(null);
    }
    // Add currentFile to dependencies so this effect re-runs when the prop changes
  }, [currentFile]);

  // handleClick is no longer needed as the label click will trigger the input directly
  // const handleClick = () => { /* ... */ };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null); // Clear previous errors - USED

    if (!file) {
      // If file selection was cancelled or no file selected
      setDisplayedFileName(null); // Clear displayed name
      onFileSelect(null); // Notify parent that file is null
      // Reset the input value manually here as well for consistency
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      return;
    }

    // Check file type
    if (accept) {
      // Support multiple accept types (e.g., 'image/*,video/*')
      const acceptPatterns = accept.split(',').map(s => s.trim()).filter(Boolean);
      const matches = acceptPatterns.some(pattern => {
        if (pattern === '*/*') return true;
        if (pattern.endsWith('/*')) {
          // e.g., image/*
          return file.type.startsWith(pattern.slice(0, -1));
        }
        return file.type === pattern;
      });
      if (!matches) {
        setError(`Invalid file type. Please upload a ${accept} file.`);
        setDisplayedFileName(null);
        onFileSelect(null);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
        return;
      }
    }

    // Check file size
    if (file.size > maxSize) {
      setError(`File size exceeds ${maxSize / (1024 * 1024)}MB limit.`); // USED
      setDisplayedFileName(null); // Clear displayed name
      onFileSelect(null); // Do not select the invalid file
      // Reset the input value
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      return;
    }

    // File is valid
    setDisplayedFileName(file.name); // Display file name
    onFileSelect(file); // Notify parent with the valid File object
    // The input value is already set by the browser when a valid file is selected
  };

  // Handle clearing the selected file
  const handleClearFile = () => {
    setDisplayedFileName(null); // Clear displayed name
    setError(null); // Clear any previous error - USED
    if (inputRef.current) {
      inputRef.current.value = ""; // Clear the input value programmatically
    }
    onFileSelect(null); // Notify parent that the file is null
  };

  // Determine what content goes INSIDE the LABEL element
  const labelContent = displayedFileName ? (
    // Display file name, success icon, and clear control when a file is selected/uploaded
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center flex-grow min-w-0">
        {" "}
        {/* Use flex-grow and min-w-0 for truncation */}
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 mr-2">
          {" "}
          {/* Removed group-hover */}
          <Check className="h-3 w-3" /> {/* Check icon is used */}
        </div>
        {/* Truncate long file names */}
        <span className="truncate text-black">
          {" "}
          {/* Let flexbox handle truncation */}
          {displayedFileName}
        </span>
      </div>
      {/* Static error/info message for users (replace as needed) */}
      {/* This static message seems redundant if 'error' state is also used for messages */}
      {/* <span className="text-xs text-red-500 block mt-2">Only image files up to 5MB are allowed.</span> */}

      {/* Use a SPAN for the clear control */}
      <span
        role="button" // Indicate that this span is interactive
        tabIndex={0} // Make it focusable
        onClick={(e) => {
          // Stop propagation to prevent label from triggering input
          e.stopPropagation(); // Prevent event from bubbling up to the parent label
          handleClearFile(); // Call the clear handler
        }}
        onKeyDown={(e) => {
          // Add keyboard support (Enter/Space)
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault(); // Prevent default scroll/submit
            e.stopPropagation(); // Prevent event from bubbling up
            handleClearFile(); // Call the clear handler
          }
        }}
        className="ml-2 p-1 rounded-full hover:bg-red-100 text-red-600 transition-colors duration-200 flex-shrink-0 cursor-pointer"
        aria-label="Clear file"
      >
        <XCircle className="h-4 w-4" /> {/* XCircle icon is used */}
      </span>
    </div>
  ) : (
    // Display "Choose File" and upload icon if no file is selected
    <div className="flex items-center gap-2 justify-center w-full">
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600">
        {" "}
        {/* Removed group-hover */}
        <Upload className="h-6 w-6" /> {/* Upload icon is used */}
      </div>
      <span className="text-zinc-700 font-semibold">Choose File</span>
    </div>
  );

  return (
    <div className="space-y-2">
      {/* --- The LABEL element styled as a button --- */}
      <label
        htmlFor={id} // Associate label with the hidden input using id
        className="
          inline-flex items-center justify-center rounded-md text-sm font-medium
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50
          disabled:pointer-events-none ring-offset-background
          bg-blue-50
          border hover:bg-accent hover:text-accent-foreground
          h-10 py-2 px-4 w-full group transition-all duration-200 hover:border-blue-400 cursor-pointer
          text-white border-[#747F99]
        " // Apply button-like styles directly to the label
      >
        {/* Render the content inside the label */}
        {labelContent}
      </label>
      {/* --- End LABEL element --- */}

      {/* Display error message */}
      {error && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-red-600 text-sm animate-in fade-in-0">
          <AlertCircle className="h-4 w-4 flex-shrink-0" /> {/* AlertCircle icon is used */}
          {/* FIX: Explicitly use 'error' in a template literal to ensure linter recognizes the read */}
          <span className="truncate">{`${error}`}</span>
        </div>
      )}
      {/* Display help text */}
      {helpText && <p className="text-sm text-gray-500">{helpText}</p>}

      {/* The actual hidden file input */}
      <Input
        id={id} // Pass the id prop down to the hidden input (must match label's htmlFor)
        type="file"
        ref={inputRef} // Reference for programmatic clearing
        accept={accept}
        onChange={handleFileChange} // Handle file selection changes
        className="hidden" // Hide the default input visually
        // aria-label is not needed here if id/htmlFor are used
      />
    </div>
  );
}