// ./app/step1/Step1.tsx
'use client';

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { GraduationCap } from "lucide-react"; // Upload and Loader2 are not needed in this component anymore
import { FileUploader } from "@/components/File-Uploader";
import { useState, useEffect } from "react"; // Keep useState and useEffect for preview logic
import Image from "next/image"; // Import the Image component

// Define props Step1 expects from its parent (FormContent)
interface Step1Props {
    // Data slice for this step, managed by the parent
    data: {
        name: string;
        city: string;
        state: string;
        logo: File | string | null; // Can be File, URL string (if loaded), or null
        // Add universityId here if you want to display it after saving,
        // but it's primarily for passing to Step3, not edited in Step1
        // universityId?: string | null;
    };
    // Callback to notify the parent when a field changes
    onDataChange: (field: 'name' | 'city' | 'state' | 'logo', value: string | File | null) => void;
    // You might also receive global loading/error states from the parent if you want to show them here
    // isSubmitting?: boolean;
    // submitError?: string | null;
}

// Step1 functional component, accepts data and change handler
export default function Step1({ data, onDataChange }: Step1Props) {

  // Local state for image preview URL (derived from the 'logo' data prop)
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

  // Effect to create and revoke the object URL for image preview
  // This effect now runs when the 'data.logo' prop changes
  useEffect(() => {
    // If the logo data is a File object, create a temporary object URL
    if (data.logo instanceof File) {
      const url = URL.createObjectURL(data.logo);
      setLogoPreviewUrl(url);

      // Cleanup function to revoke the object URL
      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (typeof data.logo === 'string' && data.logo) {
        // If the logo data is a URL string (e.g., loaded from DB), just use it directly
        setLogoPreviewUrl(data.logo);
        // No cleanup needed for external URLs
        return () => {};
    }
    else {
      // If no file or URL, clear the preview URL
      setLogoPreviewUrl(null);
    }

    // Re-run this effect whenever data.logo changes
  }, [data.logo]);


  // Handle file selection from FileUploader
  const handleFileChange = (file: File | null) => {
     // Optional frontend validation (can also be done in parent or backend)
     if (file && file.size > 5 * 1024 * 1024) { // 5MB limit
       alert("File size should be less than 5MB");
       onDataChange('logo', null); // Notify parent to clear the file
       return;
     }
     // Notify parent about the selected file (File object or null)
     onDataChange('logo', file);
     // useEffect above will handle updating the preview URL
  };

  // Handle input changes (Name, City, State)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'name' | 'city' | 'state') => {
    // Notify parent about the input change
    onDataChange(field, e.target.value);
  };


  return (
    // Removed the <form> element as the parent handles it
    <div className="flex flex-col gap-4"> {/* Use a div or fragment as the root */}
      <div className="flex flex-col pb-4">
        <div className="flex items-center gap-2">
          <GraduationCap color="lightblue"/>
          <h1 className="text-[23px] text-white font-bold">University</h1>
        </div>
        <p className="text-[15px] text-[#747F99]">Enter university details</p>
      </div>

      {/* University Name Input */}
      <div className="flex flex-col gap-2 pb-4">
        <Label htmlFor="university-name" className="text-white">University Name *</Label>
        <Input
          id="university-name"
          name="name" // Include name attribute for FormData collection by parent
          value={data.name || ''} // Value comes from parent data prop
          onChange={(e) => handleInputChange(e, 'name')} // Call parent change handler
          placeholder="Enter university name"
          className="bg-[#1B253B] placeholder:text-gray-400 border-[#747F99] text-white"
          required // Keep required attribute for browser validation if parent form uses it
        />
      </div>

      {/* City Input */}
      <div className="flex flex-col gap-2 pb-4">
        <Label htmlFor="university-city" className="text-white">City *</Label>
        <Input
          id="university-city"
          name="city" // Include name attribute
          value={data.city || ''} // Value from parent data prop
          onChange={(e) => handleInputChange(e, 'city')} // Call parent change handler
          placeholder="Enter city"
          className="bg-[#1B253B] placeholder:text-gray-400 border-[#747F99] text-white"
          required // Keep required attribute
        />
      </div>

      {/* State Input */}
      <div className="flex flex-col gap-2 pb-4">
        <Label htmlFor="university-state" className="text-white">State *</Label>
        <Input
          id="university-state"
          name="state" // Include name attribute
          value={data.state || ''} // Value from parent data prop
          onChange={(e) => handleInputChange(e, 'state')} // Call parent change handler
          placeholder="Enter state"
          className="bg-[#1B253B] placeholder:text-gray-400 border-[#747F99] text-white"
          required // Keep required attribute
        />
      </div>

      {/* University Logo File Upload */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="university-logo" className="text-white">University Logo *</Label>
        <FileUploader
          id="university-logo" // Pass ID for accessibility
          accept="image/*"
          onFileSelect={handleFileChange} // Call local handler (which calls parent)
          helpText="Upload your university logo (PNG or JPG, max 150KB)"
          // Pass the current file/URL down for FileUploader to display preview logic internally if it supports it
          // currentFile={data.logo} // If FileUploader has a value/currentFile prop
        />
         {/* Display file name feedback */}
         {data.logo instanceof File && <p className="text-sm text-white/70">Selected file: {data.logo.name}</p>}
         {typeof data.logo === 'string' && data.logo && <p className="text-sm text-white/70">Using uploaded logo: {data.logo.split('/').pop()}</p>} {/* Display filename from URL */}
      </div>

      {/* Image Preview (uses local state derived from parent data) */}
       {logoPreviewUrl && (
           <div className="mt-4 flex justify-center">
               {/* Replaced <img> with <Image /> */}
               <Image
                   src={logoPreviewUrl}
                   alt="University Logo Preview"
                   width={150} // Provide a reasonable intrinsic width
                   height={150} // Provide a reasonable intrinsic height
                   className="max-h-[150px] max-w-full object-contain rounded-md border border-[#747F99]"
                   // layout="responsive" // Optional: use if you want the image to scale with container
                   // objectFit="contain" // Optional: specify object-fit via prop
               />
           </div>
       )}

       {/* Removed the submit button and status messages */}
    </div>
  );
}
