"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause } from "lucide-react"
import { cn } from "@/lib/utils"
import { MediaItem } from "@/types/homepageTypes"

type Props = {
  items: MediaItem[]
}

export default function EventCarousel({ items }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAutoScrolling, setIsAutoScrolling] = useState(true)
  const [userInteracted, setUserInteracted] = useState(false)
  const [isHovering, setIsHovering] = useState(false) // This still controls visibility of nav buttons
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  const [isPlaying, setIsPlaying] = useState<Record<string, boolean>>({})
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({})

  const activeItem: MediaItem = items[activeIndex]

  const resetAutoScrollTimer = useCallback(() => {
    if (autoScrollTimerRef.current) {
      clearTimeout(autoScrollTimerRef.current)
    }

    if (!isVideoPlaying) {
      autoScrollTimerRef.current = setTimeout(() => {
        setUserInteracted(false)
        setIsAutoScrolling(true)
      }, 10000)
    } else {
      setIsAutoScrolling(false);
    }
  }, [isVideoPlaying, setIsAutoScrolling, setUserInteracted]);

  const handleCardClick = (index: number) => {
    if (index === activeIndex) return

    setActiveIndex(index)
    setUserInteracted(true)
    setIsAutoScrolling(false)
    resetAutoScrollTimer()

    Object.values(videoRefs.current).forEach((video) => {
      if (video && !video.paused) {
        video.pause()
        setIsPlaying((prev) => ({ ...prev, [video.id]: false }))
      }
    })
    setIsVideoPlaying(false);
  }

  useEffect(() => {
    if (isAutoScrolling && !userInteracted && !isHovering && !isVideoPlaying) {
      const timer = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % items.length)
      }, 5000)
      return () => clearInterval(timer)
    }
    return () => {}
  }, [isAutoScrolling, userInteracted, isHovering, isVideoPlaying, items.length])

  useEffect(() => {
    return () => {
      if (autoScrollTimerRef.current) {
        clearTimeout(autoScrollTimerRef.current)
      }
    }
  }, [])

  const toggleVideoPlay = (id: string) => {
    const video = videoRefs.current[id]
    if (!video) {
      console.error("Video element not found for id:", id)
      return
    }

    if (video.paused) {
      Object.entries(videoRefs.current).forEach(([, videoEl]) => {
        if (videoEl && !videoEl.paused) {
          videoEl.pause();
          setIsPlaying((prev) => ({ ...prev, [videoEl.id]: false }));
        }
      });

      video.muted = false; // Unmute the video for audible playback

      video
        .play()
        .then(() => {
          setIsPlaying((prev) => ({ ...prev, [id]: true }))
          setIsVideoPlaying(true)
          setIsAutoScrolling(false)
          if (autoScrollTimerRef.current) {
            clearTimeout(autoScrollTimerRef.current);
          }
        })
        .catch((error) => {
          console.error("Error playing video:", error)
          if (error.name === "NotAllowedError") {
              console.warn("Autoplay with sound was prevented. Browser policy requires user gesture.");
          }
          setIsPlaying((prev) => ({ ...prev, [id]: false }));
          setIsVideoPlaying(false);
          resetAutoScrollTimer();
        })
    } else {
      video.pause()
      setIsPlaying((prev) => ({ ...prev, [id]: false }))
      setIsVideoPlaying(false)
      video.muted = true; // Mute the video when paused
      resetAutoScrollTimer()
    }
  }

  const registerVideoRef = (id: string, element: HTMLVideoElement | null) => {
    if (element) {
      videoRefs.current[id] = element
      element.onended = () => {
        setIsPlaying((prev) => ({ ...prev, [id]: false }));
        setIsVideoPlaying(false);
        resetAutoScrollTimer();
      };
      element.onpause = () => {
        setIsPlaying((prev) => ({ ...prev, [id]: false }));
        setIsVideoPlaying(false);
        resetAutoScrollTimer();
      };
    } else {
      delete videoRefs.current[id]
    }
  }

  useEffect(() => {
    const initialPlayingState: Record<string, boolean> = {}
    items.forEach((item) => {
      if (item.type === "video") {
        initialPlayingState[item.id] = false
      }
    })
    setIsPlaying(initialPlayingState)
    setIsVideoPlaying(false);

    const currentVideoRefs = videoRefs.current;

    return () => {
      Object.values(currentVideoRefs).forEach((video) => {
        if (video && !video.paused) {
          video.pause();
        }
      });
    }
  }, [items]);

  return (
    <div className="w-full relative"> {/* This is the outermost relative container */}
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
        {/* Layer 1: Main animated media content (video/image) - Base layer inside carouselRef */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeItem.id}
            className="absolute inset-0 w-full h-full z-10" // Base content layer
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
                  id={activeItem.id}
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
                  onError={(e) => console.error("Video error:", e)}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Layer 2: Content overlay (title, description) - Non-interactive, sits above media */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-16 pb-6 px-6 text-white pointer-events-none z-20">
          <div className="max-w-3xl">
            <div className="absolute bottom-64 md:bottom-123 inline-block bg-emerald-500 text-white text-xs font-medium px-2 py-1 rounded mb-2">
              {activeItem.date}
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">{activeItem.title}</h2>
            {activeItem.description && (
              <p className="text-sm md:text-base text-white/80 max-w-xl">{activeItem.description}</p>
            )}
          </div>
        </div>

        {/* Layer 3: Play/Pause Button overlay - Interactive, sits above content */}
        {activeItem.type === "video" && ( // Only render play button for videos
          <div className="absolute inset-0 flex items-center justify-center z-30">
            <button
              className={cn(
                "h-20 w-20 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 hover:scale-105 transition-all duration-200",
                {
                  // Logic for Play/Pause button visibility
                  "md:opacity-100 md:pointer-events-auto": !isPlaying[activeItem.id] || (isPlaying[activeItem.id] && isHovering),
                  "md:opacity-0 md:pointer-events-none": isPlaying[activeItem.id] && !isHovering,
                }
              )}
              onClick={(e) => {
                e.stopPropagation()
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
        )}
      </div> {/* End carouselRef div */}
      <div className="flex justify-start md:justify-center space-x-2 md:space-x-4 mb-3 md:mb-5 overflow-x-auto py-2 px-2 md:px-4 scrollbar-hide">
        {items.map((item, index) => (
          <button
            key={item.id}
            className={cn(
              "relative flex-shrink-0 h-14 w-20 sm:h-16 sm:w-24 md:h-20 md:w-32 rounded-md overflow-hidden transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500",
              activeIndex === index ? "ring-2 ring-emerald-500" : "ring-1 ring-white/20 opacity-70 hover:opacity-100",
            )}
            onClick={() => handleCardClick(index)}
            aria-label={`View ${item.title}`}
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
                <Image src={`https://placehold.co/200x120/000000/FFFFFF?text=Video`} alt={item.title} fill className="object-cover" />
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
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