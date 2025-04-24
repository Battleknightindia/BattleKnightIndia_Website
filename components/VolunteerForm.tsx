"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Diamond } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { handlevolunteers } from "@/lib/server_actions/volunteer"
import { z } from "zod"
import { useRouter } from "next/navigation";

// Form data type
type FormData = {
  whatsapp: string
  email: string
}

const VolunteerFormSchema = z.object({
  whatsapp: z.string().min(1, "WhatsApp number is required"),
  email: z.string().email("Invalid email address"),
});

export function VolunteerForm({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    whatsapp: "",
    email: "",
  })

  // Load saved form data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("volunteerFormData")
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData))
      } catch (e) {
        console.error("Error parsing saved form data", e)
      }
    }
  }, [])

  // Save form data to localStorage when it changes
  useEffect(() => {
    // Only save if the dialog is not open and there's data, or if the dialog is open
    // This prevents saving empty data on load if local storage is cleared
    if (open || (formData.whatsapp || formData.email)) {
       localStorage.setItem("volunteerFormData", JSON.stringify(formData));
    }
  }, [formData, open]); // Added 'open' to dependencies

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[handleSubmit] FormData:", formData)

    const validationResult = VolunteerFormSchema.safeParse(formData);

    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error.errors);
       const errorElement = document.getElementById("form-error-message");
       if (errorElement) {
         errorElement.textContent = "Validation failed: " + validationResult.error.errors.map(e => e.message).join(", ");
       }
      return; // Stop submission if validation fails
    }

    // Clear any previous form errors if validation passes
     const errorElement = document.getElementById("form-error-message");
     if (errorElement) {
        errorElement.textContent = "";
     }

    try{
      const serverActionResult = await handlevolunteers({
        email: formData.email,
        phone: formData.whatsapp,
      })

      // Access .error instead of .message
      if (!serverActionResult.success) {
        console.log("Volunteer registration failed:", serverActionResult.error || "Unknown error")
        const submissionErrorElement = document.getElementById("form-error-message");
         if (submissionErrorElement) {
            // Use .error here
            submissionErrorElement.textContent = serverActionResult.error || "Volunteer registration failed.";
         }
      } else {
         console.log("Volunteer registration successful!")
         // Clear saved data on successful submission
         localStorage.removeItem("volunteerFormData");
         onOpenChange(false); // Close the dialog on success
         router.push("/volunteers");
      }

    } catch (error) {
      console.error("Error during volunteer registration:", error)
       const submissionErrorElement = document.getElementById("form-error-message");
       if (submissionErrorElement) {
          submissionErrorElement.textContent = "An unexpected error occurred during submission.";
       }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Diamond className="h-5 w-5 text-blue-600" />
            <span className="text-blue-700">Join Volunteer Program</span>
          </DialogTitle>
          <DialogDescription>Please provide your contact information to join our volunteer program.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="eg:9473625276"
                value={formData.whatsapp}
                onChange={handleInputChange}
                className="border-blue-200 focus-visible:ring-blue-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="border-blue-200 focus-visible:ring-blue-500"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="mb-2 font-medium text-blue-600">What happens next?</p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>You&apos;ll be redirected to the volunteers dashboard</li> {/* Escaped apostrophe */}
                <li>Get your unique referral code to share with teams</li>
                <li>Teams use your code during registration</li>
                <li>Earn diamonds in your dashboard</li>
                <li>
                  Diamonds will be transferred to your game account using your Game ID and Server ID from your profile
                </li>
              </ol>
            </div>
          </div>
          <DialogFooter className="mt-4 flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0"> {/* Added flex classes for responsiveness */}
            <p id="form-error-message" className="text-red-500 text-sm text-center sm:text-left w-full sm:w-auto"></p> {/* Added ID and styling for displaying errors */}
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"> {/* Added width classes */}
              Submit & Continue
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}