"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface Step {
  id: number
  label: string
}

const initialSteps: Step[] = [
  { id: 1, label: "University" },
  { id: 2, label: "Team" },
  { id: 3, label: "Players" },
  { id: 4, label: "Review" },
]

interface GroupStepperProps {
  activeStep: number
  setActiveStep: (step: number) => void
}

export const GroupStepper = ({ activeStep, setActiveStep }: GroupStepperProps) => {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      <nav aria-label="Progress" className="flex items-center justify-between bg-[#0F172A] px-4 py-2 rounded-md w-full">
        {initialSteps.map((step, index) => {
          const isActive = step.id <= activeStep
          const isCurrentStep = step.id === activeStep

          return (
            <div
              key={step.id}
              className="flex flex-col items-center flex-1 relative"
            >
              <motion.div
                className={cn(
                  "w-6 h-6 flex items-center justify-center rounded-full border text-xs font-medium z-10",
                  "transition-shadow text-white",
                )}
                animate={{
                  backgroundColor: isActive ? "#3B82F6" : "#1E293B",
                  borderColor: isActive ? "white" : "#334155",
                  scale: isCurrentStep ? 1.1 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
              >
                {step.id}
              </motion.div>

              <motion.span
                className="mt-1 text-xs font-medium"
                animate={{
                  color: isActive ? "white" : "#94A3B8",
                }}
              >
                {step.label}
              </motion.span>

              {index < initialSteps.length - 1 && (
                <div className="absolute top-3 left-1/2 w-full h-px bg-[#334155] z-0">
                  <motion.div
                    className="h-full bg-blue-500 origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{
                      scaleX: step.id < activeStep ? 1 : 0,
                    }}
                    transition={{
                      delay: 0.1,
                      type: "spring",
                      stiffness: 200,
                      damping: 30,
                    }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </div>
  )
}

