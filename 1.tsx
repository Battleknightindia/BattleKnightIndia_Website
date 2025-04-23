"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { GraduationCap, Users, User, FileCheck, AlertTriangle } from "lucide-react"
import { useState } from "react"
import { CheckedState } from "@radix-ui/react-checkbox"
export function ReviewForm({ formData }) {
  const [termsAccepted, setTermsAccepted] = useState(false)

  const getPlayerRole = (role) => {
    if (!role) return "Not specified"
    return role.charAt(0).toUpperCase() + role.slice(1)
  }

  const getFileName = (file) => {
    if (!file) return "No file uploaded"
    return typeof file === "string" ? file : file.name
  }

  const handleSubmit = () => {
    console.log("Form submitted")
  }
  const handleTermsChange = (checked: CheckedState) => {
    setTermsAccepted(checked)
  }

  return (
    <div className="space-y-6">
      <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
        <AlertTriangle className="h-4 w-4 text-orange-500" />
        <AlertDescription className="text-sm">
          Please review all information carefully before submitting. You cannot edit after submission.
        </AlertDescription>
      </Alert>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="university" className="border rounded-lg overflow-hidden">
          <AccordionTrigger className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 hover:no-underline hover:bg-blue-100">
            <div className="flex items-center">
              <GraduationCap className="h-5 w-5 mr-2 text-blue-600" />
              <span className="font-medium text-blue-700">University Information</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-3 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-500">University Name</Label>
                <p className="font-medium">{formData.university.name || "Not provided"}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Location</Label>
                <p className="font-medium">
                  {formData.university.city && formData.university.state
                    ? `${formData.university.city}, ${formData.university.state}`
                    : "Not provided"}
                </p>
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm text-gray-500">University Logo</Label>
                <p className="font-medium">{getFileName(formData.university.logo)}</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="team" className="border rounded-lg overflow-hidden mt-3">
          <AccordionTrigger className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 hover:no-underline hover:bg-blue-100">
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              <span className="font-medium text-blue-700">Team Information</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-3 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-500">Team Name</Label>
                <p className="font-medium">{formData.team.name || "Not provided"}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Team Logo</Label>
                <p className="font-medium">{getFileName(formData.team.logo)}</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="players" className="border rounded-lg overflow-hidden mt-3">
          <AccordionTrigger className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 hover:no-underline hover:bg-blue-100">
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              <span className="font-medium text-blue-700">Player Information</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-3 bg-white">
            <div className="space-y-6">
              {formData.players.map((player, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-blue-700">
                      {index === 6 ? "Coach/Manager" : `Player ${index + 1}`}
                    </h4>
                    {player.role && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {getPlayerRole(player.role)}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-gray-500">Full Name</Label>
                      <p className="text-sm font-medium">{player.fullName || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">In-Game Name</Label>
                      <p className="text-sm font-medium">{player.ign || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Game ID</Label>
                      <p className="text-sm font-medium">{player.gameId || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Server ID</Label>
                      <p className="text-sm font-medium">{player.serverId || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Email</Label>
                      <p className="text-sm font-medium">{player.email || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Mobile</Label>
                      <p className="text-sm font-medium">{player.mobile || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Location</Label>
                      <p className="text-sm font-medium">
                        {player.city && player.state ? `${player.city}, ${player.state}` : "Not provided"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Device</Label>
                      <p className="text-sm font-medium">{player.deviceName || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Photo</Label>
                      <p className="text-sm font-medium">{getFileName(player.photo)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Student Proof</Label>
                      <p className="text-sm font-medium">{getFileName(player.studentProof)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="pt-4 border-t">
        <div className="flex items-start space-x-2 mb-4">
          <Checkbox id="terms" checked={termsAccepted} onCheckedChange={setTermsAccepted} />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Accept Terms and Conditions
            </label>
            <p className="text-sm text-gray-500">
              I confirm that all information provided is accurate and complete. I have read and agree to the tournament
              rules and regulations.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg border border-blue-100">
        <FileCheck className="h-5 w-5 text-blue-600 mr-2" />
        <p className="text-sm text-blue-700 font-medium">
          Please click &quot;Submit Registration&quot; below to complete your registration
        </p>
      </div>
    </div>
  )
}
