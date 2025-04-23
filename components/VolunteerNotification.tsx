"use client"

import { useState, useEffect } from "react"
import { Diamond, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type SlideInNotificationProps = {
  onOpenForm: () => void
}

export function SlideInNotification({ onOpenForm }: SlideInNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Show notification after user has scrolled or spent time on page
  useEffect(() => {
    if (isDismissed) return

    const handleScroll = () => {
      if (window.scrollY > 300 && !isVisible && !isDismissed) {
        setIsVisible(true)
      }
    }

    // Show after scroll or time delay, whichever comes first
    window.addEventListener("scroll", handleScroll)

    const timer = setTimeout(() => {
      if (!isVisible && !isDismissed) {
        setIsVisible(true)
      }
    }, 20000) // 20 seconds

    return () => {
      window.removeEventListener("scroll", handleScroll)
      clearTimeout(timer)
    }
  }, [isVisible, isDismissed])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
  }

  return (
    <div
      className={cn(
        "fixed z-40 transition-all duration-500 ease-in-out shadow-lg bg-white border border-blue-200 rounded-lg",
        isMobile
          ? "left-4 right-4 bottom-0 rounded-b-none" // Mobile: bottom slide-up
          : "top-1/3 -right-1 rounded-r-none", // Desktop: side slide-in
        isVisible
          ? isMobile
            ? "transform translate-y-0 mb-0"
            : "transform translate-x-0 mr-0"
          : isMobile
            ? "transform translate-y-full mb-[-100%]"
            : "transform translate-x-full mr-[-100%]",
      )}
    >
      <div className="relative p-4">
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={handleDismiss}>
          <X className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-3 mb-3">
          <div className="bg-blue-600 p-2 rounded-full">
            <Diamond className="h-5 w-5 text-yellow-400" />
          </div>
          <h3 className="font-bold text-lg text-blue-700">Earn More Diamonds!</h3>
        </div>

        <p className="text-sm text-gray-700 mb-4 pr-6">
          Join our volunteer program and earn diamonds by referring teams for registration.
        </p>

        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
            onClick={handleDismiss}
          >
            Dismiss
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => {
              onOpenForm()
              handleDismiss()
            }}
          >
            Learn More
          </Button>
        </div>
      </div>
    </div>
  )
}
