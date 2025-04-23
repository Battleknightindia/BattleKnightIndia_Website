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
import { useRouter } from "next/navigation"; // ✅ Correct

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
    if (formData.whatsapp || formData.email) {
      localStorage.setItem("volunteerFormData", JSON.stringify(formData))
    }
  }, [formData])

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
    const result = VolunteerFormSchema.safeParse(formData);
    
    try{
      const result = await handlevolunteers({
        email: formData.email,
        phone: formData.whatsapp,
      })
      if (!result.success) {
        console.log("Volunteer registration failed:")
      }
      router.push("/volunteers")
    } catch (error) {
      console.error("Error during volunteer registration:", error)
      return
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
                <li>You'll be redirected to the volunteers dashboard</li>
                <li>Get your unique referral code to share with teams</li>
                <li>Teams use your code during registration</li>
                <li>Earn diamonds in your dashboard</li>
                <li>
                  Diamonds will be transferred to your game account using your Game ID and Server ID from your profile
                </li>
              </ol>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <p id="error" className="text-red-500"></p>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              Submit & Continue
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
