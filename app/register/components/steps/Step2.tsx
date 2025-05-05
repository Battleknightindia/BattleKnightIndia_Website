// ./app/step2/steps/Step2.tsx
'use client';

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Users } from "lucide-react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import Image from "next/image"; // Import the Image component
import { FileUploader } from "@/components/File-Uploader";

// --- Import types, update Step2Props ---
// Assuming TeamStepData in "@/types/registrationTypes" will be updated
// to include 'referral_code: string | null;'
 
import { TeamStepData } from "@/types/registrationTypes"; // Import the type
// --- End Import ---

// Define props Step2 expects from its parent (FormContent)
// --- Update Step2Props to include 'referral_code' ---
interface Step2Props {
    // Data slice for this step, managed by the parent
    data: {
        name: string;
        referral_code: string | null; // Added referral_code
        logo: File | string | null; // File before upload, URL after
        // tag is removed from here
        // ... other team fields if any
    };
    // Callback to notify the parent when a field changes
    // Update the union type for fields to include 'referral_code'
    onDataChange: (field: 'name' | 'referral_code' | 'logo', value: string | File | null) => void;
    // Removed unused prop: universityId?: string | null;
}
// --- End Update Step2Props ---


// Removed universityId from props
export default function Step2({ data, onDataChange }: Step2Props) {

    // Local state for image preview URL
    const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

    // Effect to create and revoke the object URL for image preview
    useEffect(() => {
        if (data.logo instanceof File) {
            const url = URL.createObjectURL(data.logo);
            setLogoPreviewUrl(url);
            return () => {
                URL.revokeObjectURL(url);
            };
        } else if (typeof data.logo === 'string' && data.logo) {
            setLogoPreviewUrl(data.logo);
            return () => {};
        }
        else {
            setLogoPreviewUrl(null);
        }
    }, [data.logo]);


    // Handle file selection from FileUploader
    const handleFileChange = (file: File | null) => {
        // Basic file size validation (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file && file.size > maxSize) {
            alert("File size should be less than 5MB");
            // Optionally clear the file input or handle error differently
            onDataChange('logo', null); // Clear the selected file
            return;
        }
        onDataChange('logo', file);
    };

    // --- Update handleInputChange to handle 'name' and 'referral_code' ---
    // Handle input changes (Name and Referral Code)
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'name' | 'referral_code') => {
        onDataChange(field, e.target.value);
    };
    // --- End Update handleInputChange ---


    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <Users color="lightblue"/>
                    <h1 className="text-[23px] text-white font-bold">Team</h1>
                </div>
                <p className="text-[15px] text-[#747F99]">Enter team details</p>
            </div>

            {/* Team Name Input */}
            <div className="flex flex-col gap-2">
                <Label htmlFor="team-name" className="text-white">Team Name *</Label>
                <Input
                    id="team-name"
                    name="name"
                    value={data.name || ''}
                    onChange={(e) => handleInputChange(e, 'name')} // Call updated handler
                    placeholder="Enter team name"
                    className="bg-[#1B253B] border-[#747F98] placeholder:text-gray-400 text-white"
                    required
                />
            </div>

            {/* Referral Code Input */}
            <div className="flex flex-col gap-2">
                <Label htmlFor="referral-code" className="text-white">Referral Code</Label>
                <Input
                    id="referral-code"
                    name="referral_code"
                    value={data.referral_code || ''}
                    onChange={(e) => handleInputChange(e, 'referral_code')} // Handle referral_code changes
                    placeholder="Enter referral code (Optional)"
                    className="bg-[#1B253B] border-[#747F98] placeholder:text-gray-400 text-white"
                    // referral_code is optional, so no 'required' attribute
                />
            </div>

             {/* --- Remove Team Tag Input JSX --- */}
             {/* ... (commented out tag input remains as you had it) ... */}
             {/* --- End Remove Team Tag Input JSX --- */}


            {/* Team Logo File Upload */}
            <div className="flex flex-col gap-2">
                <Label htmlFor="team-logo" className="text-white">Team Logo *</Label>
                <FileUploader
                    id="team-logo"
                    accept="image/*"
                    onFileSelect={handleFileChange}
                    helpText="Upload your team logo (PNG or JPG, max 5MB)"
                    currentFile={data.logo}
                />
                {data.logo instanceof File && <p className="text-sm text-white/70">Selected file: {data.logo.name}</p>}
                {typeof data.logo === 'string' && data.logo && <p className="text-sm text-white/70">Using uploaded logo: {data.logo.split('/').pop()}</p>}
            </div>

            {/* Image Preview */}
            {logoPreviewUrl && (
                <div className="mt-4 flex justify-center">
                    {/* Replaced <img> with <Image /> */}
                    <Image
                        src={logoPreviewUrl}
                        alt="Team Logo Preview"
                        width={150} // Provide a reasonable intrinsic width
                        height={150} // Provide a reasonable intrinsic height
                        className="max-h-[150px] max-w-full object-contain rounded-md border border-[#747F99]"
                        // layout="responsive" // Optional: use if you want the image to scale with container
                        // objectFit="contain" // Optional: specify object-fit via prop
                    />
                </div>
            )}

            {/* Discord Information Card */}
            <div className="">
                <Card className="bg-[#1B253B] border-[#747F98] text-center">
                    <CardHeader>
                        <CardTitle className="text-white text-[17px] font-bold">Important Information</CardTitle>
                        <CardDescription className="text-[#747F98] text-[13px]">Team must join our Discord server to participate in the tournament</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <a href="https://discord.gg/aEFSXJfv" className="flex justify-center items-center bg-[#3752DB] py-2 rounded-lg">
                            <Image src="/discord.svg" alt="Discord" width={100} height={100} />
                        </a>
                        <p className="text-[#747F98] pt-2 text-[12px]">Click here to join our Discord server</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
