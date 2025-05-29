"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
// Assuming EVENT_DATA and MediaItem are correctly defined in this path
import { EVENT_DATA, MediaItem } from "@/lib/constant/home_page"

export default function EventCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAutoScrolling, setIsAutoScrolling] = useState(true)
  const [userInteracted, setUserInteracted] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  // Explicitly type the isPlaying state
  const [isPlaying, setIsPlaying] = useState<Record<string, boolean>>({})
  // Explicitly type the timer ref
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null)
  // Explicitly type the carousel ref
  const carouselRef = useRef<HTMLDivElement>(null)
  // Ref to store video elements by their ID, allowing null
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({})

  // Ensure activeItem is typed correctly based on EVENT_DATA structure
  const activeItem: MediaItem = EVENT_DATA[activeIndex];

  const handleCardClick = (index: number) => {
    // Prevent action if clicking the currently active card
    if (index === activeIndex) return

    setActiveIndex(index)
    setUserInteracted(true)
    resetAutoScrollTimer()

    // Pause all videos when changing slides
    // Iterate over the values of the videoRefs.current object
    Object.values(videoRefs.current).forEach((video) => {
      // Check if the video element exists and is not already paused
      if (video && !video.paused) {
        video.pause()
      }
    })
  }

  const resetAutoScrollTimer = () => {
    // Clear the existing timer if it exists
    if (autoScrollTimerRef.current) {
      clearTimeout(autoScrollTimerRef.current)
    }

    // Set a new timer to resume auto-scrolling after a delay
    autoScrollTimerRef.current = setTimeout(() => {
      setUserInteracted(false) // Reset user interaction flag
      setIsAutoScrolling(true) // Resume auto-scrolling
    }, 10000) // 10 seconds delay
  }

  // Effect for auto-scrolling
  useEffect(() => {
    // Only auto-scroll if enabled, no user interaction, and not hovering
    if (isAutoScrolling && !userInteracted && !isHovering) {
      const timer = setInterval(() => {
        // Cycle through the items in EVENT_DATA
        setActiveIndex((prev) => (prev + 1) % EVENT_DATA.length)
      }, 5000) // Auto-scroll interval: 5 seconds

      // Cleanup function to clear the interval when dependencies change or component unmounts
      return () => clearInterval(timer)
    }

    // Return a no-op cleanup function if auto-scrolling is not active
    return () => {}
  }, [isAutoScrolling, userInteracted, isHovering]) // Dependencies: re-run effect if these states change

  // Effect for clearing the auto-scroll timer on component unmount
  useEffect(() => {
    // Cleanup function to clear the timer when the component unmounts
    return () => {
      if (autoScrollTimerRef.current) {
        clearTimeout(autoScrollTimerRef.current)
      }
    }
  }, []) // Empty dependency array: runs only on mount and unmount

  // Effect for handling wheel events for navigation
  useEffect(() => {
    const carouselElement = carouselRef.current

    // Check if the carousel element exists before adding listeners
    if (!carouselElement) return;

    const handleWheel = (e: WheelEvent) => {
      // Check if the wheel event occurred within the carousel element
      if (carouselElement.contains(e.target as Node)) {
        e.preventDefault() // Prevent default vertical scrolling

        // Determine scroll direction based on deltaX or deltaY
        if (e.deltaX > 0 || e.deltaY > 0) {
          setActiveIndex((prev) => (prev + 1) % EVENT_DATA.length)
        } else {
          setActiveIndex((prev) => (prev - 1 + EVENT_DATA.length) % EVENT_DATA.length)
        }

        setUserInteracted(true) // Mark user interaction
        resetAutoScrollTimer() // Reset the auto-scroll timer
      }
    }

    // Add event listener to the window
    window.addEventListener("wheel", handleWheel, { passive: false })
    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener("wheel", handleWheel)
    }
  }, []) // Empty dependency array: runs only on mount and unmount

  // Effect for handling touch events for navigation
  useEffect(() => {
    const carouselElement = carouselRef.current

    // Check if the carousel element exists before adding listeners
    if (!carouselElement) return;

    let startX = 0

    const handleTouchStart = (e: TouchEvent) => {
      // Store the starting X coordinate of the touch
      startX = e.touches[0].clientX
      setUserInteracted(true) // Mark user interaction
    }

    const handleTouchMove = (e: TouchEvent) => {
      // Check if the touch move occurred within the carousel element
      if (carouselElement.contains(e.target as Node)) {
        e.preventDefault() // Prevent default touch scrolling
        const currentX = e.touches[0].clientX
        const diff = startX - currentX

        // Trigger slide change if swipe distance is significant
        if (Math.abs(diff) > 50) { // Threshold of 50 pixels
          if (diff > 0) {
            setActiveIndex((prev) => (prev + 1) % EVENT_DATA.length)
          } else {
            setActiveIndex((prev) => (prev - 1 + EVENT_DATA.length) % EVENT_DATA.length)
          }
          startX = currentX // Update startX for continuous swiping
          resetAutoScrollTimer() // Reset the auto-scroll timer
        }
      }
    }

    const handleTouchEnd = () => {
      resetAutoScrollTimer() // Reset the auto-scroll timer after touch ends
    }

    // Add event listeners to the carousel element
    carouselElement.addEventListener("touchstart", handleTouchStart, { passive: false })
    carouselElement.addEventListener("touchmove", handleTouchMove, { passive: false })
    carouselElement.addEventListener("touchend", handleTouchEnd, { passive: false })


    // Cleanup function to remove the event listeners
    return () => {
      carouselElement.removeEventListener("touchstart", handleTouchStart)
      carouselElement.removeEventListener("touchmove", handleTouchMove)
      carouselElement.removeEventListener("touchend", handleTouchEnd)
    }
  }, []) // Empty dependency array: runs only on mount and unmount

  // Navigation button handlers
  const nextSlide = () => {
    if (!userInteracted) setUserInteracted(true) // Mark user interaction
    // Move to the next slide, cycling back to the start if at the end
    setActiveIndex((prev) => (prev + 1) % EVENT_DATA.length)
    resetAutoScrollTimer() // Reset the auto-scroll timer
  }

  const prevSlide = () => {
    if (!userInteracted) setUserInteracted(true) // Mark user interaction
    // Move to the previous slide, cycling to the end if at the start
    setActiveIndex((prev) => (prev - 1 + EVENT_DATA.length) % EVENT_DATA.length)
    resetAutoScrollTimer() // Reset the auto-scroll timer
  }

  // Function to handle video play/pause
  const toggleVideoPlay = (id: string) => {
    console.log("Toggling video play for id:", id)
    // Get the specific video element from the ref object
    const video = videoRefs.current[id]
    // Check if the video element exists
    if (!video) {
      console.error("Video element not found for id:", id)
      return
    }

    console.log("Video paused state:", video.paused)

    if (video.paused) {
      // Pause all other videos first before playing the selected one
      Object.entries(videoRefs.current).forEach(([videoId, videoEl]) => {
        // Check if it's a different video element and if it exists and is not paused
        if (videoId !== id && videoEl && !videoEl.paused) {
          videoEl.pause()
          // Update the playing state for the paused video
          setIsPlaying((prev) => ({ ...prev, [videoId]: false }))
        }
      })

      // Play the selected video
      console.log("Attempting to play video")
      video
        .play()
        .then(() => {
          console.log("Video playing successfully")
          // Update the playing state for the currently playing video
          setIsPlaying((prev) => ({ ...prev, [id]: true }))
        })
        .catch((error) => {
          console.error("Error playing video:", error)
          // Handle potential errors like user gesture requirement for autoplay
          // You might want to show a message to the user here, e.g., "Click to play video"
        })
    } else {
      // Pause the selected video
      console.log("Pausing video")
      video.pause()
      // Update the playing state for the paused video
      setIsPlaying((prev) => ({ ...prev, [id]: false }))
    }
  }

  // Register video ref - called from the video element's ref prop
  // This function is used to populate the videoRefs.current object
  const registerVideoRef = (id: string, element: HTMLVideoElement | null) => {
    if (element) {
      // Store the video element in the ref object using its ID as the key
      videoRefs.current[id] = element
    } else {
        // Clean up the ref entry when the element is unmounted (e.g., slide changes)
        delete videoRefs.current[id];
    }
  }

  // Initialize video playing state and handle cleanup on unmount
  useEffect(() => {
    // Initialize playing state for all videos listed in EVENT_DATA
    const initialPlayingState: Record<string, boolean> = {}
    EVENT_DATA.forEach((item) => {
      if (item.type === "video") {
        initialPlayingState[item.id] = false // Initially set all videos to not playing
      }
    })
    setIsPlaying(initialPlayingState)

    // --- FIX for react-hooks/exhaustive-deps warning ---
    // Capture the current value of videoRefs.current when the effect is set up
    const currentVideoRefs = videoRefs.current;

    // Cleanup function: Pause all videos when the component unmounts
    return () => {
      console.log("Cleaning up video refs on unmount.");
      // Use the captured value (currentVideoRefs) in the cleanup function
      Object.values(currentVideoRefs).forEach((video) => {
        // Check if the video element exists and is not already paused
        if (video && !video.paused) {
          console.log("Pausing video during cleanup:", video.id); // Add logging for debugging
          video.pause();
        }
      });
       // Optional: Clear the ref object itself on unmount if needed.
       // Be cautious if other effects rely on the ref after this cleanup runs.
       // videoRefs.current = {};
    }
    // Dependency array: Empty, as this effect should only run on mount and cleanup on unmount.
    // The captured `currentVideoRefs` variable handles the ref access in cleanup.
  }, []);


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
        {/* AnimatePresence handles exit/enter animations for changing items */}
        <AnimatePresence mode="wait">
          {/* motion.div applies animations to the changing active item */}
          <motion.div
            key={activeItem.id} // Key is crucial for AnimatePresence to track items
            className="absolute inset-0 w-full h-full"
            initial={{ opacity: 0 }} // Initial state (before entering)
            animate={{ opacity: 1 }} // State when entering/active
            exit={{ opacity: 0 }} // State when exiting
            transition={{ duration: 0.5 }} // Animation duration
          >
            {/* Render content based on item type (image or video) */}
            {activeItem.type === "image" ? (
              <div className="relative w-full h-full">
                <Image
                  src={activeItem.src || "/placeholder.svg"} // Use placeholder if src is missing
                  alt={activeItem.title}
                  fill // Fill the parent div
                  className={cn(
                    "transition-all duration-500",
                    activeItem.aspectRatio === "portrait" ? "object-contain" : "object-cover", // Adjust object fit based on aspect ratio
                  )}
                  sizes="(max-width: 768px) 100vw, 80vw" // Responsive image sizes
                  priority // Prioritize loading for LCP
                />
              </div>
            ) : (
              <div className="relative w-full h-full bg-black">
                <video
                  // Use the registerVideoRef function to store the video element
                  ref={(el) => registerVideoRef(activeItem.id, el)}
                  src={activeItem.src} // Video source URL
                  className={cn(
                    "w-full h-full transition-all duration-500",
                    activeItem.aspectRatio === "portrait" ? "object-contain" : "object-cover", // Adjust object fit
                  )}
                  loop // Loop the video
                  muted // Mute by default (often required for autoplay)
                  playsInline // Ensure inline playback on mobile devices
                  // Update state when video playback state changes
                  onPlay={() => setIsPlaying((prev) => ({ ...prev, [activeItem.id]: true }))}
                  onPause={() => setIsPlaying((prev) => ({ ...prev, [activeItem.id]: false }))}
                  // Consider adding onError handler for video playback issues
                  onError={(e) => console.error("Video error:", e)}
                />
                {/* Play/Pause button overlay */}
                <div
                  // Position the button in the center and ensure clicks are handled by the button
                  className="absolute inset-0 flex items-center justify-center z-50" // Increased z-index, removed pointer-events-none here
                >
                  <button
                    // Style the button and control its visibility based on playing state
                    className={cn(
                        "h-20 w-20 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 hover:scale-105 transition-all duration-200",
                        isPlaying[activeItem.id] ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto" // Hide and disable button when playing
                    )}
                    onClick={(e) => {
                      e.stopPropagation() // Prevent click from bubbling up and triggering other handlers
                      console.log("Play/Pause button clicked")
                      toggleVideoPlay(activeItem.id) // Call the toggle function
                    }}
                    // Explicitly manage pointer events based on playing state
                    style={{ pointerEvents: isPlaying[activeItem.id] ? 'none' : 'auto' }}
                  >
                    {/* Render Play or Pause icon based on playing state */}
                    {isPlaying[activeItem.id] ? (
                      <Pause className="h-10 w-10 text-white" />
                    ) : (
                      <Play className="h-10 w-10 text-white ml-1" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Content overlay for title, date, description */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-16 pb-6 px-6 text-white pointer-events-none z-40"> {/* Added z-index and pointer-events-none */}
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

        {/* Navigation buttons (Previous/Next) */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-between px-4 transition-opacity duration-300 z-50", // Added z-index
            isHovering ? "opacity-100" : "opacity-0 md:opacity-0", // Show on hover (or always on mobile if md:opacity-0 is overridden by CSS)
          )}
        >
          <Button
            variant="outline"
            size="icon"
            className="bg-black/30 backdrop-blur-sm border-white/20 text-white hover:bg-black/50 hover:text-white"
            onClick={prevSlide}
            aria-label="Previous slide" // Add accessibility label
          >
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Previous slide</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="bg-black/30 backdrop-blur-sm border-white/20 text-white hover:bg-black/50 hover:text-white"
            onClick={nextSlide}
            aria-label="Next slide" // Add accessibility label
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
            key={item.id} // Key is crucial for list rendering performance
            className={cn(
              "relative flex-shrink-0 h-14 w-20 sm:h-16 sm:w-24 md:h-20 md:w-32 rounded-md overflow-hidden transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500",
              activeIndex === index ? "ring-2 ring-emerald-500" : "ring-1 ring-white/20 opacity-70 hover:opacity-100", // Highlight active thumbnail
            )}
            onClick={() => handleCardClick(index)} // Handle click to change active slide
            aria-label={`View ${item.title}`} // Add accessibility label
          >
            {item.type === "image" ? (
              <Image
                src={item.src || "/placeholder.svg"} // Use placeholder if src is missing
                alt={item.title} // Alt text for accessibility
                fill // Fill the button area
                className="object-cover" // Cover the area without distorting aspect ratio
                sizes="(max-width: 768px) 80px, 120px" // Responsive image sizes
              />
            ) : (
              <div className="relative w-full h-full">
                 {/* Use a placeholder image for video thumbnails */}
                <Image src={`https://placehold.co/200x120/000000/FFFFFF?text=Video`} alt={item.title} fill className="object-cover" />
                {/* Overlay with play icon for video thumbnails */}
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40"> {/* Lower z-index than main content */}
                  <Play className="h-4 w-4 text-white" fill="white" />
                </div>
              </div>
            )}
            {/* Highlight bar for the active thumbnail */}
            {activeIndex === index && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500"></div>}
          </button>
        ))}
      </div>
    </div>
  )
}
