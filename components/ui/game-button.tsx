"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"

import type { ButtonProps } from "@/components/ui/button"

interface GameButtonProps extends Omit<ButtonProps, "variant"> {
  variant?: "default" | "outline" | "purple" | "blue"
}

export const GameButton = forwardRef<HTMLButtonElement, GameButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const baseStyles = "transition-all duration-300 hover:scale-105"

    const variantStyles = {
      default:
        "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-black",
      outline: "bg-transparent border-2 border-white/20 hover:border-emerald-500/70 hover:bg-emerald-500/10 text-white",
      purple: "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white",
      blue: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white",
    }

    return <Button ref={ref} className={cn(baseStyles, variantStyles[variant], className)} {...props} />
  },
)

GameButton.displayName = "GameButton"

