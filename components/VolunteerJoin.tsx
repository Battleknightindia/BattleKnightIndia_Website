"use client"

import { useState, useEffect } from "react"
import { Diamond, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type DiamondFabProps = {
  onOpenForm: () => void
}

export function DiamondFab({ onOpenForm }: DiamondFabProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasBeenShown, setHasBeenShown] = useState(false)

  // Auto-expand the FAB after a delay if it hasn't been shown yet
  useEffect(() => {
    if (!hasBeenShown) {
      const timer = setTimeout(() => {
        setIsExpanded(true)
        setHasBeenShown(true)
      }, 10000) // 10 seconds delay
      return () => clearTimeout(timer)
    }
  }, [hasBeenShown])

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-end">
      {/* Expanded info card */}
      <Card
        className={cn(
          "mr-3 mb-2 p-3 w-64 shadow-lg border-blue-200 bg-white transition-all duration-300 overflow-hidden",
          isExpanded ? "max-h-40 opacity-100" : "max-h-0 opacity-0 pointer-events-none",
        )}
      >
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-sm font-semibold text-blue-700">Earn More Diamonds!</h4>
          <Button variant="ghost" size="icon" className="h-5 w-5 -mr-1 -mt-1" onClick={() => setIsExpanded(false)}>
            <X className="h-3 w-3" />
          </Button>
        </div>
        <p className="text-xs text-gray-600 mb-2">Join our volunteer program and earn diamonds by referring teams.</p>
        <Button size="sm" className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white" onClick={onOpenForm}>
          Learn More
        </Button>
      </Card>

      {/* FAB Button */}
      <Button
        size="icon"
        className={cn(
          "h-12 w-12 rounded-full shadow-lg transition-all duration-300",
          isExpanded ? "bg-blue-700" : "bg-blue-600 hover:bg-blue-700",
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Diamond className="h-5 w-5 text-yellow-400" />
      </Button>
    </div>
  )
}
