"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
// Removed Heart import
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { CosplayItem } from "@/types/homepageType"

type Props = {
  cosplayData: CosplayItem[]
}

export default function CosplaySection({cosplayData}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Removed userLikes state
  // Removed cosplays state - using cosplayData directly now
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Handle mobile touch events for swipe
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(null); // Reset on new touch
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;

    const distance = touchStart - touchEnd;
    const isSwipe = Math.abs(distance) > 50;

    if (isSwipe) {
      if (distance > 0) {
        nextCard(); // swipe left
      } else {
        prevCard(); // swipe right
      }
    }

    // Reset values
    setTouchStart(null);
    setTouchEnd(null);
  };

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
      },
    },
  }

  // Removed handleLike function

  const nextCard = () => {
    setCurrentIndex(prev => (prev + 1) % cosplayData.length);
  };

  const prevCard = () => {
    setCurrentIndex(prev => (prev - 1 + cosplayData.length) % cosplayData.length);
  };

  // Add meta viewport tag to prevent zoom
  useEffect(() => {
    // Add meta viewport tag to prevent zooming
    const metaTag = document.createElement('meta');
    metaTag.name = 'viewport';
    metaTag.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.getElementsByTagName('head')[0].appendChild(metaTag);

    return () => {
      // Remove meta tag when component unmounts
      const tag = document.querySelector('meta[name="viewport"]');
      if (tag && tag.parentNode) {
          tag.parentNode.removeChild(tag);
      }
    };
  }, []);

  // Prevent default touchmove to stop page scrolling during swipe
  useEffect(() => {
    const preventScroll = (e: TouchEvent) => {
       // Only prevent scroll if a touch swipe might be in progress horizontally
       if (touchStart !== null) {
        const currentX = e.targetTouches[0]?.clientX || 0;
        const distanceX = Math.abs(currentX - touchStart);
        // Check if the primary scroll direction is horizontal
         if (distanceX > 10 && distanceX > Math.abs((e.targetTouches[0]?.clientY || 0) - (e.targetTouches[0]?.clientY || 0))) { // Simplified check
           e.preventDefault();
         }
       }
    };

    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    const cardElement = document.getElementById('swipe-container');
    if (cardElement) {
      // Use passive: false to allow preventDefault
      cardElement.addEventListener('touchmove', preventScroll, { passive: false });
      // Prevent pinch zoom on the document itself
      document.addEventListener('touchstart', preventZoom, { passive: false });
    }

    return () => {
      if (cardElement) {
        cardElement.removeEventListener('touchmove', preventScroll);
      }
      document.removeEventListener('touchstart', preventZoom);
    };
  }, [touchStart]); // Re-run effect if touchStart changes


  return (
    <section className="lg:px-50 w-full bg-[#18181B] py-8 lg:py-24 overflow-hidden text-white"> {/* Added text-white */}
      <div className="container px-4 lg:px-6">
        <div className="flex flex-col items-center justify-center space-y-3 text-center mb-8 lg:mb-12">
          <motion.div
            className="mb-12 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInVariants}
            >
            <Badge className="mb-4 bg-amber-500 text-white hover:bg-amber-600 hover:scale-105 transition-all duration-300">Showcase</Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Cosplay Gallery</h2>
            <div className="w-24 h-1 bg-white mx-auto"></div>
          </motion.div>
          <p className="max-w-[700px] text-gray-400 text-sm lg:text-xl/relaxed">
            Explore the incredible talent and creativity of cosplayers who brought their favorite characters to life.
          </p>
        </div>

        {/* Featured Cosplay - Best in Show */}
        {/* Keeping the hardcoded best in show section as it was */}
        <div className="mb-8 lg:mb-16 overflow-hidden rounded-xl relative">
          <div className="absolute inset-0 bg-emerald-500/10 animate-pulse rounded-xl z-0"></div>
          <div className="absolute inset-2 bg-[#18181B] rounded-xl z-10"></div>
          <div className="relative z-20 m-2">
            <div className="relative aspect-[3/4] md:aspect-[16/9] w-full overflow-hidden rounded-xl">
              <Image
                src="/cosplay/cosplay1.webp"
                alt="Featured cosplay - Best in Show"
                width={1200} // Adjusted width for better aspect ratio
                height={675} // Adjusted height for better aspect ratio (16/9)
                className="md:object-contain object-cover w-full h-full" // object-cover works better for fixed aspect ratio container
              />
              <div className="absolute top-2 right-2 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg rotate-3">
                BEST IN SHOW
              </div>
            </div>
            {/* Adjusted gradient opacity and direction slightly */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#18181B]/90 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-4 lg:p-8">
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-1 lg:mb-2">Best in Show Winner</h3>
              <p className="text-gray-300 text-sm lg:text-base max-w-md">
                An incredible recreation of the iconic character that captivated our judges and audience alike.
              </p>
            </div>
          </div>
        </div>


        {/* Tinder-Style Card Swipe (Mobile) */}
        <div className="block lg:hidden mb-8">
          <h3 className="text-xl font-bold text-white mb-4 text-center">Swipe Through Cosplays</h3>
          <div
            id="swipe-container"
            className="relative h-[550px] w-full max-w-sm mx-auto overflow-hidden" // Added max-w-sm and mx-auto to center on small screens
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="absolute inset-0 flex">
              {cosplayData.map((cosplay, index) => {

                // Calculate relative position for infinite card display
                const position = (index - currentIndex + cosplayData.length) % cosplayData.length;
                let transformClass = 'opacity-0 invisible';
                let zIndex = 0;
                // Removed isSecondImage and lowerImageClass logic

                if (position === 0) {
                  transformClass = 'translate-x-0 opacity-100 visible';
                  zIndex = 10;
                }
                 // Keep adjacent cards off-screen but in the flow for smooth transition
                 else if (position === 1) {
                   transformClass = 'translate-x-[105%] opacity-0 invisible'; // Position next card off-screen to the right
                   zIndex = 5;
                 } else if (position === cosplayData.length - 1) {
                   transformClass = 'translate-x-[-105%] opacity-0 invisible'; // Position previous card off-screen to the left
                   zIndex = 5;
                 }

                return (
                  <motion.div
                    key={cosplay.id}
                     // Use motion.div for potential future animations if needed, although not strictly required for this change
                    className={cn(
                      "absolute inset-0 w-full h-full flex-shrink-0 transition-all duration-300 ease-in-out",
                      transformClass
                    )}
                    style={{ zIndex }}
                     // Removed initial/animate/variants - swipe handles visual transitions
                  >
                    {/* Card Content */}
                    <div className="bg-white rounded-xl p-3 shadow-xl h-full flex flex-col">
                      <div className="relative h-[450px] w-full overflow-hidden rounded-lg"> {/* Keep fixed height for card image area */}
                        <Image
                          src={cosplay.image || "/placeholder.svg"}
                          alt={"Cosplay"} // Still useful for alt text
                          fill // Use fill to make image responsive within its container
                          className="object-cover transition-all duration-500" // object-cover or object-contain depending on desired fit
                          sizes="(max-width: 768px) 100vw, 33vw" // Add sizes for better performance
                        />
                        {/* Removed Like Button and count */}
                      </div>
                       {/* Removed Cosplayer Name and Character Name display */}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Small indicator dots to show position */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1 z-20">
              {cosplayData.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    index === currentIndex ? "bg-white scale-110" : "bg-white/40"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Polaroid Style Gallery (Desktop) */}
        <div className="hidden lg:block">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Cosplay Gallery</h3>
          {/* Reverted grid back to 3 columns as requested */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {cosplayData.map((cosplay, index) => (
              <div
                key={cosplay.id}
                className={cn(
                  "group relative bg-white p-3 pb-16 shadow-lg transform transition-all duration-300",
                  // Adjusted rotations for 3 columns
                  index % 3 === 0 ? "rotate-[-2deg]" : index % 3 === 1 ? "rotate-[1deg]" : "rotate-[3deg]",
                  "hover:rotate-0 hover:z-10 hover:scale-105"
                )}
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                <Image
                    src={cosplay.image || "/placeholder.svg"}
                    alt={"Cosplay"}
                    fill
                    className={cn("object-cover transition-all duration-500", "grayscale group-hover:grayscale-0")}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                {/* Removed Cosplayer Name and Character Name display */}
                 {/* Keeping the space at the bottom consistent with pb-16 on the parent div */}
                 <div className="absolute bottom-0 left-0 right-0 h-12"> {/* Placeholder div to maintain layout space */}
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}