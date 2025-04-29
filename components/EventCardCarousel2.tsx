"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { EVENT_DATA, MediaItem } from "@/lib/constant/home_page"

export default function EventCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAutoScrolling, setIsAutoScrolling] = useState(true)
  const [userInteracted, setUserInteracted] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isPlaying, setIsPlaying] = useState<Record<string, boolean>>({})
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<Record<string, HTMLVideoElement>>({})

  const activeItem = EVENT_DATA[activeIndex]

  const handleCardClick = (index: number) => {
    if (index === activeIndex) return

    setActiveIndex(index)
    setUserInteracted(true)
    resetAutoScrollTimer()

    // Pause all videos when changing slides
    Object.values(videoRefs.current).forEach((video) => {
      if (!video.paused) video.pause()
    })
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
    if (isAutoScrolling && !userInteracted && !isHovering) {
      const timer = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % EVENT_DATA.length)
      }, 5000)

      return () => clearInterval(timer)
    }

    return () => {}
  }, [isAutoScrolling, userInteracted, isHovering])

  useEffect(() => {
    return () => {
      if (autoScrollTimerRef.current) {
        clearTimeout(autoScrollTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const carouselElement = carouselRef.current

    const handleWheel = (e: WheelEvent) => {
      if (carouselElement && carouselElement.contains(e.target as Node)) {
        e.preventDefault()

        if (e.deltaX > 0 || e.deltaY > 0) {
          setActiveIndex((prev) => (prev + 1) % EVENT_DATA.length)
        } else {
          setActiveIndex((prev) => (prev - 1 + EVENT_DATA.length) % EVENT_DATA.length)
        }

        setUserInteracted(true)
        resetAutoScrollTimer()
      }
    }

    window.addEventListener("wheel", handleWheel, { passive: false })
    return () => {
      window.removeEventListener("wheel", handleWheel)
    }
  }, [])

  useEffect(() => {
    const carouselElement = carouselRef.current

    let startX = 0

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      setUserInteracted(true)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (carouselElement && carouselElement.contains(e.target as Node)) {
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
          resetAutoScrollTimer()
        }
      }
    }

    const handleTouchEnd = () => {
      resetAutoScrollTimer()
    }

    if (carouselElement) {
      carouselElement.addEventListener("touchstart", handleTouchStart, { passive: false })
      carouselElement.addEventListener("touchmove", handleTouchMove, { passive: false })
      carouselElement.addEventListener("touchend", handleTouchEnd, { passive: false })
    }

    return () => {
      if (carouselElement) {
        carouselElement.removeEventListener("touchstart", handleTouchStart)
        carouselElement.removeEventListener("touchmove", handleTouchMove)
        carouselElement.removeEventListener("touchend", handleTouchEnd)
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

  // Function to handle video play/pause
  const toggleVideoPlay = (id: string) => {
    console.log("Toggling video play for id:", id)
    const video = videoRefs.current[id]
    if (!video) {
      console.error("Video element not found for id:", id)
      return
    }

    console.log("Video paused state:", video.paused)

    if (video.paused) {
      // Pause all other videos first
      Object.entries(videoRefs.current).forEach(([videoId, videoEl]) => {
        if (videoId !== id && !videoEl.paused) {
          videoEl.pause()
          setIsPlaying((prev) => ({ ...prev, [videoId]: false }))
        }
      })

      // Play this video
      console.log("Attempting to play video")
      video
        .play()
        .then(() => {
          console.log("Video playing successfully")
          setIsPlaying((prev) => ({ ...prev, [id]: true }))
        })
        .catch((error) => {
          console.error("Error playing video:", error)
        })
    } else {
      console.log("Pausing video")
      video.pause()
      setIsPlaying((prev) => ({ ...prev, [id]: false }))
    }
  }

  // Register video ref
  const registerVideoRef = (id: string, element: HTMLVideoElement | null) => {
    if (element) {
      videoRefs.current[id] = element
    }
  }

  // Initialize video playing state when component mounts or videos change
  useEffect(() => {
    // Initialize playing state for all videos
    const initialPlayingState: Record<string, boolean> = {}
    EVENT_DATA.forEach((item) => {
      if (item.type === "video") {
        initialPlayingState[item.id] = false
      }
    })
    setIsPlaying(initialPlayingState)

    // Pause all videos when component unmounts
    return () => {
      Object.values(videoRefs.current).forEach((video) => {
        if (!video.paused) {
          video.pause()
        }
      })
    }
  }, [])

  return (
    <div className="w-full relative">
      <motion.h3
        className="text-xl md:text-2xl font-bold mb-4 md:mb-8 text-white"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        NCC Promotional Matches
      </motion.h3>

      <div
        ref={carouselRef}
        className="relative h-[300px] sm:h-[350px] md:h-[450px] lg:h-[550px] w-full overflow-hidden mb-4 md:mb-8 rounded-xl"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Main featured content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeItem.id}
            className="absolute inset-0 w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {activeItem.type === "image" ? (
              <div className="relative w-full h-full">
                <Image
                  src={activeItem.src || "/placeholder.svg"}
                  alt={activeItem.title}
                  fill
                  className={cn(
                    "transition-all duration-500",
                    activeItem.aspectRatio === "portrait" ? "object-contain" : "object-cover",
                  )}
                  sizes="(max-width: 768px) 100vw, 80vw"
                  priority
                />
              </div>
            ) : (
              <div className="relative w-full h-full bg-black">
                <video
                  ref={(el) => registerVideoRef(activeItem.id, el)}
                  src={activeItem.src}
                  className={cn(
                    "w-full h-full transition-all duration-500",
                    activeItem.aspectRatio === "portrait" ? "object-contain" : "object-cover",
                  )}
                  loop
                  muted
                  playsInline
                  onPlay={() => setIsPlaying((prev) => ({ ...prev, [activeItem.id]: true }))}
                  onPause={() => setIsPlaying((prev) => ({ ...prev, [activeItem.id]: false }))}
                />
                {/* Play/Pause button with higher z-index and pointer-events-auto */}
                <div
                  className="absolute inset-0 flex items-center justify-center z-96 pointer-events-none"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="h-20 w-20 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 hover:scale-105 transition-all duration-200 pointer-events-auto"
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log("Play/Pause button clicked")
                      toggleVideoPlay(activeItem.id)
                    }}
                  >
                    {isPlaying[activeItem.id] ? (
                      <Pause className="h-10 w-10 text-white" />
                    ) : (
                      <Play className="h-10 w-10 text-white ml-1" />
                    )}
                  </button>
                </div>

                {/* Remove any overlay that might be capturing clicks */}
                {/* <div className="absolute inset-0 pointer-events-none"></div> */}
              </div>
            )}

            {/* Content overlay - positioned at bottom with subtle gradient background */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-16 pb-6 px-6 text-white">
              <div className="max-w-3xl">
                <div className="inline-block bg-emerald-500 text-white text-xs font-medium px-2 py-1 rounded mb-2">
                  {activeItem.date}
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">{activeItem.title}</h2>
                {activeItem.description && (
                  <p className="text-sm md:text-base text-white/80 max-w-xl">{activeItem.description}</p>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons - only visible on hover or mobile tap */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-between px-4 transition-opacity duration-300",
            isHovering ? "opacity-100" : "opacity-0 md:opacity-0",
          )}
        >
          <Button
            variant="outline"
            size="icon"
            className="bg-black/30 backdrop-blur-sm border-white/20 text-white hover:bg-black/50 hover:text-white"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Previous slide</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="bg-black/30 backdrop-blur-sm border-white/20 text-white hover:bg-black/50 hover:text-white"
            onClick={nextSlide}
          >
            <ChevronRight className="h-6 w-6" />
            <span className="sr-only">Next slide</span>
          </Button>
        </div>
      </div>

      {/* Thumbnail navigation */}
      <div className="flex justify-start md:justify-center space-x-2 md:space-x-4 mb-3 md:mb-5 overflow-x-auto py-2 px-2 md:px-4 scrollbar-hide">
        {EVENT_DATA.map((item, index) => (
          <button
            key={item.id}
            className={cn(
              "relative flex-shrink-0 h-14 w-20 sm:h-16 sm:w-24 md:h-20 md:w-32 rounded-md overflow-hidden transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500",
              activeIndex === index ? "ring-2 ring-emerald-500" : "ring-1 ring-white/20 opacity-70 hover:opacity-100",
            )}
            onClick={() => handleCardClick(index)}
          >
            {item.type === "image" ? (
              <Image
                src={item.src || "/placeholder.svg"}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 80px, 120px"
              />
            ) : (
              <div className="relative w-full h-full">
                <Image src={`/placeholder.svg?height=120&width=200`} alt={item.title} fill className="object-cover" />
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40">
                  <Play className="h-4 w-4 text-white" fill="white" />
                </div>
              </div>
            )}
            {activeIndex === index && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500"></div>}
          </button>
        ))}
      </div>
    </div>
  )
}
