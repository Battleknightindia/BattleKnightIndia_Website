"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { COSPLAY_DATA } from "@/lib/constant/home_page"

export default function CosplaySection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Track user likes separately from the like counts
  const [userLikes, setUserLikes] = useState<Record<number, boolean>>({});
  // Store the cosplay data in state so we can update like counts
  const [cosplays, setCosplays] = useState(COSPLAY_DATA);
  // Track touch positions for mobile swipe
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

  const handleLike = (id: number) => {
    // Toggle the user like status
    setUserLikes(prev => {
      const newLikes = { ...prev, [id]: !prev[id] };
      return newLikes;
    });
    
    // Update the like count based on user action
    setCosplays(prev => prev.map(cosplay => {
      if (cosplay.id === id) {
        // If user is liking, increment; if unliking, decrement
        const isLiking = !userLikes[id];
        const increment = isLiking ? 1 : -1;

        return { ...cosplay, likeCount: cosplay.likeCount + increment };
      }
      return cosplay;
    }));
  };

  const nextCard = () => {
    setCurrentIndex(prev => (prev + 1) % cosplays.length);
  };

  const prevCard = () => {
    setCurrentIndex(prev => (prev - 1 + cosplays.length) % cosplays.length);
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
      document.getElementsByTagName('head')[0].removeChild(metaTag);
    };
  }, []);

  // Prevent default touchmove to stop page scrolling during swipe
  useEffect(() => {
    const preventScroll = (e: TouchEvent) => {
      if (touchStart) {
        e.preventDefault();
      }
    };

    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    const cardElement = document.getElementById('swipe-container');
    if (cardElement) {
      cardElement.addEventListener('touchmove', preventScroll, { passive: false });
      // Prevent pinch zoom
      document.addEventListener('touchstart', preventZoom, { passive: false });
    }

    return () => {
      if (cardElement) {
        cardElement.removeEventListener('touchmove', preventScroll);
      }
      document.removeEventListener('touchstart', preventZoom);
    };
  }, [touchStart]);

  return (
    <section className="lg:px-50 w-full bg-[#18181B] py-8 lg:py-24 overflow-hidden">
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
        <div className="mb-8 lg:mb-16 overflow-hidden rounded-xl relative">
          <div className="absolute inset-0 bg-emerald-500/10 animate-pulse rounded-xl z-0"></div>
          <div className="absolute inset-2 bg-[#18181B] rounded-xl z-10"></div>
          <div className="relative z-20 m-2">
            <div className="relative aspect-[3/4] lg:aspect-[16/9] w-full overflow-hidden rounded-xl">
              <Image
                src="/cosplay/cosplay2.webp"
                alt="Featured cosplay"
                width={600}
                height={800}
                className="object-cover w-full h-full"
              />
              <div className="absolute top-2 right-2 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg rotate-3">
                BEST IN SHOW
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#18181B] to-transparent opacity-90"></div>
            <div className="absolute bottom-0 left-0 p-4 lg:p-8">
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-1 lg:mb-2">Best in Show Winner</h3>
              <p className="text-gray-300 text-sm lg:text-base max-w-md">
                An incredible recreation of the iconic character that captivated our judges and audience alike.
              </p>
              <Button className="mt-3 lg:mt-4 bg-emerald-500 hover:bg-emerald-600 text-white">View Gallery</Button>
            </div>
          </div>
        </div>

        {/* Tinder-Style Card Swipe (Mobile) */}
        <div className="block lg:hidden mb-8">
          <h3 className="text-xl font-bold text-white mb-4 text-center">Swipe Through Cosplays</h3>
          <div 
            id="swipe-container"
            className="relative h-[550px] w-full overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="absolute inset-0 flex">
              {cosplays.map((cosplay, index) => {


                // Calculate relative position for infinite card display
                const position = (index - currentIndex + cosplays.length) % cosplays.length;
                let transformClass = 'opacity-0 invisible';
                let zIndex = 0;
                const isSecondImage = index === 1;
                const lowerImageClass = isSecondImage
                      ? "object-contain"
                      : "object-cover";

                if (position === 0) {
                  transformClass = 'translate-x-0 opacity-100 visible';
                  zIndex = 10;
                } else if (position === 1) {
                  transformClass = 'translate-x-full opacity-0 invisible';
                  zIndex = 5;
                } else if (position === cosplays.length - 1) {
                  transformClass = '-translate-x-full opacity-0 invisible';
                  zIndex = 5;
                }
                
                return (
                  <div
                    key={cosplay.id}
                    className={cn(
                      "absolute inset-0 w-full h-full transition-all duration-300 ease-in-out",
                      transformClass
                    )}
                    style={{ zIndex }}
                  >
                    <div className="bg-white rounded-xl p-3 shadow-xl h-full">
                      <div className={cn(
  "relative h-[450px] w-full overflow-hidden rounded-lg",
  index === 1 && "mt-8"
)}>
                        <Image
                          src={cosplay.image || "/placeholder.svg"}
                          alt={cosplay.character}
                          fill
                          className={cn(
                            "transition-all duration-500",
                            lowerImageClass
                          )}
                        />
                        <div className="absolute bottom-3 right-3 flex flex-col items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike(cosplay.id);
                            }}
                            className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg"
                          >
                            <Heart
                              className={cn(
                                "w-6 h-6 transition-colors",
                                userLikes[cosplay.id] ? "fill-red-500 text-red-500" : "text-gray-600"
                              )}
                            />
                          </button>
                          <span className="bg-gray-800 text-white px-2 py-1 rounded-full text-xs font-medium shadow-md">
                            {cosplay.likeCount}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 px-1">
                        <h4 className="font-bold text-[#18181B]">{cosplay.character}</h4>
                        <p className="text-sm text-gray-600">by {cosplay.cosplayer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Small indicator dots to show position */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1 z-20">
              {cosplays.map((_, index) => (
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
          <div className="grid grid-cols-3 gap-8">
            {cosplays.map((cosplay, index) => (
              <div
                key={cosplay.id}
                className={cn(
                  "group relative bg-white p-3 pb-16 shadow-lg transform transition-all duration-300",
                  index % 3 === 0 ? "rotate-[-2deg]" : index % 3 === 1 ? "rotate-[1deg]" : "rotate-[3deg]",
                  "hover:rotate-0 hover:z-10 hover:scale-105"
                )}
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  <Image
                    src={cosplay.image || "/placeholder.svg"}
                    alt={cosplay.character}
                    fill
                    className={cn("object-cover transition-all duration-500", "grayscale group-hover:grayscale-0")}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="absolute bottom-3 left-0 right-0 px-3">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-['Caveat',_cursive] text-lg text-[#18181B]">{cosplay.character}</p>
                    <div className="flex flex-col items-center">
                      <button 
                        onClick={() => handleLike(cosplay.id)} 
                        className="p-1"
                      >
                        <Heart
                          className={cn(
                            "w-5 h-5 transition-colors",
                            userLikes[cosplay.id] ? "fill-red-500 text-red-500" : "text-gray-600"
                          )}
                        />
                      </button>
                      <span className="text-xs font-medium text-gray-800 bg-gray-100 px-2 rounded-full">
                        {cosplay.likeCount}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">by {cosplay.cosplayer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
