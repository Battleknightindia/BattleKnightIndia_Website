"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { motion, useAnimation } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EVENT_DATA } from "@/lib/constant/home_page"

export default function EventCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAutoScrolling, setIsAutoScrolling] = useState(true)
  const [userInteracted, setUserInteracted] = useState(false)
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()
  const lastInteractionTime = useRef(Date.now())

  const handleCardClick = (index: number) => {
    setActiveIndex(index)
    setUserInteracted(true)
    lastInteractionTime.current = Date.now()
    resetAutoScrollTimer()
  }

  const resetAutoScrollTimer = () => {
    if (autoScrollTimerRef.current) {
      clearTimeout(autoScrollTimerRef.current)
    }

    autoScrollTimerRef.current = setTimeout(() => {
      setUserInteracted(false)
      setIsAutoScrolling(true)
    }, 10000)
  }

  useEffect(() => {
    if (isAutoScrolling && !userInteracted) {
      const timer = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % EVENT_DATA.length)
      }, 5000)

      return () => clearInterval(timer)
    }

    return () => {}
  }, [isAutoScrolling, userInteracted])

  useEffect(() => {
    return () => {
      if (autoScrollTimerRef.current) {
        clearTimeout(autoScrollTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (carouselRef.current && carouselRef.current.contains(e.target as Node)) {
        e.preventDefault()

        if (e.deltaX > 0 || e.deltaY > 0) {
          setActiveIndex((prev) => (prev + 1) % EVENT_DATA.length)
        } else {
          setActiveIndex((prev) => (prev - 1 + EVENT_DATA.length) % EVENT_DATA.length)
        }

        setUserInteracted(true)
        lastInteractionTime.current = Date.now()
        resetAutoScrollTimer()
      }
    }

    window.addEventListener("wheel", handleWheel, { passive: false })
    return () => window.removeEventListener("wheel", handleWheel)
  }, [])

  useEffect(() => {
    let startX = 0

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      setUserInteracted(true)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (carouselRef.current && carouselRef.current.contains(e.target as Node)) {
        e.preventDefault()
        const currentX = e.touches[0].clientX
        const diff = startX - currentX

        if (Math.abs(diff) > 50) {
          if (diff > 0) {
            setActiveIndex((prev) => (prev + 1) % EVENT_DATA.length)
          } else {
            setActiveIndex((prev) => (prev - 1 + EVENT_DATA.length) % EVENT_DATA.length)
          }
          startX = currentX
          lastInteractionTime.current = Date.now()
          resetAutoScrollTimer()
        }
      }
    }

    const handleTouchEnd = () => {
      resetAutoScrollTimer()
    }

    if (carouselRef.current) {
      carouselRef.current.addEventListener("touchstart", handleTouchStart, { passive: false })
      carouselRef.current.addEventListener("touchmove", handleTouchMove, { passive: false })
      carouselRef.current.addEventListener("touchend", handleTouchEnd, { passive: false })
    }

    return () => {
      if (carouselRef.current) {
        carouselRef.current.removeEventListener("touchstart", handleTouchStart)
        carouselRef.current.removeEventListener("touchmove", handleTouchMove)
        carouselRef.current.removeEventListener("touchend", handleTouchEnd)
      }
    }
  }, [])

  const nextSlide = () => {
    if (!userInteracted) setUserInteracted(true)
    setActiveIndex((prev) => (prev + 1) % EVENT_DATA.length)
    resetAutoScrollTimer()
  }

  const prevSlide = () => {
    if (!userInteracted) setUserInteracted(true)
    setActiveIndex((prev) => (prev - 1 + EVENT_DATA.length) % EVENT_DATA.length)
    resetAutoScrollTimer()
  }

  return (
    <div className="w-full relative">
      <motion.h3
        className="text-2xl font-bold mb-8 text-white"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Event Highlights
      </motion.h3>

      <div
        ref={carouselRef}
        className="relative h-[300px] md:h-[400px] w-full overflow-hidden mb-8"
        onMouseDown={() => setUserInteracted(true)}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {EVENT_DATA.map((item, index) => {
            const distance = Math.abs(activeIndex - index)
            const isActive = activeIndex === index
            const zIndex = EVENT_DATA.length - distance

            let offset = 0
            if (index < activeIndex) offset = -30 * (activeIndex - index)
            else if (index > activeIndex) offset = 30 * (index - activeIndex)

            return (
              <motion.div
                key={item.id}
                className="absolute w-[280px] h-[220px] md:w-[500px] md:h-[320px] cursor-pointer"
                style={{ zIndex }}
                initial={{ x: index === 0 ? 0 : 100 * index }}
                animate={{
                  x: offset + "%",
                  scale: isActive ? 1 : 1 - distance * 0.15,
                  opacity: 1 - distance * 0.2,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30, mass: 1 }}
                onClick={() => handleCardClick(index)}
                whileHover={isActive ? { scale: 1.05 } : {}}
              >
                <Card className="w-full h-full overflow-hidden rounded-xl border-0 shadow-xl bg-white">
                  <div className="relative h-[60%]">
                    <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-medium px-2 py-1 rounded">
                      {item.date}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-bold text-lg text-white mb-1">{item.title}</h4>
                    <p className="text-zinc-600 text-sm line-clamp-2">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 border-white/20 text-white hover:bg-black/70 hover:text-white z-10"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 border-white/20 text-white hover:bg-black/70 hover:text-white z-10"
          onClick={nextSlide}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Indicator Dots */}
      <div className="flex justify-center space-x-3 mb-5">
        {EVENT_DATA.map((_, index) => (
          <button
            key={index}
            className={cn(
              "h-3 rounded-full transition-all",
              activeIndex === index ? "w-10 bg-emerald-500" : "w-3 bg-gray-500",
            )}
            onClick={() => handleCardClick(index)}
          >
            <span className="sr-only">Go to slide {index + 1}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
