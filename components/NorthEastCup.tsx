"use client";

import { useEffect, useRef, useState } from "react";
import { motion} from "framer-motion";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TOURNAMENT_DATA } from "@/lib/constant/home_page";
import Image from "next/image";

export default function HorizontalTournamentShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const lastInteractionTime = useRef(Date.now());

  const handleCardClick = (index: number) => {
    setActiveIndex(index);
    setUserInteracted(true);
    lastInteractionTime.current = Date.now();
    resetAutoScrollTimer();
  };

  const resetAutoScrollTimer = () => {
    if (autoScrollTimerRef.current) {
      clearTimeout(autoScrollTimerRef.current);
    }

    autoScrollTimerRef.current = setTimeout(() => {
      setUserInteracted(false);
      setIsAutoScrolling(true);
    }, 10000);
  };

  useEffect(() => {
    if (isAutoScrolling && !userInteracted) {
      const timer = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % TOURNAMENT_DATA.length);
      }, 5000);

      return () => clearInterval(timer);
    }

    return () => {};
  }, [isAutoScrolling, userInteracted]);

  useEffect(() => {
    return () => {
      if (autoScrollTimerRef.current) {
        clearTimeout(autoScrollTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const carouselElement = carouselRef.current; // Capture ref value

    const handleWheel = (e: WheelEvent) => {
      if (carouselElement && carouselElement.contains(e.target as Node)) {
        e.preventDefault();

        if (e.deltaX > 0 || e.deltaY > 0) {
          setActiveIndex((prev) => (prev + 1) % TOURNAMENT_DATA.length);
        } else {
          setActiveIndex(
            (prev) =>
              (prev - 1 + TOURNAMENT_DATA.length) % TOURNAMENT_DATA.length
          );
        }

        setUserInteracted(true);
        lastInteractionTime.current = Date.now();
        resetAutoScrollTimer();
      }
    };

    // Attach to window to capture wheel events over the element
    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [carouselRef]); // Removed TOURNAMENT_DATA.length

  useEffect(() => {
    const carouselElement = carouselRef.current; // Capture ref value
    let startX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      setUserInteracted(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (carouselElement && carouselElement.contains(e.target as Node)) {
        e.preventDefault();
        const currentX = e.touches[0].clientX;
        const diff = startX - currentX;

        if (Math.abs(diff) > 50) {
          if (diff > 0) {
            setActiveIndex((prev) => (prev + 1) % TOURNAMENT_DATA.length);
          } else {
            setActiveIndex(
              (prev) =>
                (prev - 1 + TOURNAMENT_DATA.length) % TOURNAMENT_DATA.length
            );
          }
          startX = currentX;
          lastInteractionTime.current = Date.now();
          resetAutoScrollTimer();
        }
      }
    };

    const handleTouchEnd = () => {
      resetAutoScrollTimer();
    };

    if (carouselElement) {
      carouselElement.addEventListener("touchstart", handleTouchStart, {
        passive: false,
      });
      carouselElement.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      carouselElement.addEventListener("touchend", handleTouchEnd, {
        passive: false,
      });
    }

    return () => {
      if (carouselElement) {
        carouselElement.removeEventListener("touchstart", handleTouchStart);
        carouselElement.removeEventListener("touchmove", handleTouchMove);
        carouselElement.removeEventListener("touchend", handleTouchEnd);
      }
    };
  }, [carouselRef]); // Removed TOURNAMENT_DATA.length

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <div className="w-full bg-black px-4 py-12 md:py-16 relative">
      <motion.div
        className="mb-12 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInVariants}
      >
        <Badge className="mb-4 bg-blue-500 text-white hover:bg-blue-600 hover:scale-105 transition-all duration-300">
          Our Past Work
        </Badge>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
          NorthEast Cup
        </h2>
        <div className="w-24 h-1 bg-white mx-auto"></div>
      </motion.div>

      <div
        ref={carouselRef}
        className="relative h-[400px] md:h-[550px] w-full overflow-hidden mb-8 md:mb-12"
        onMouseDown={() => setUserInteracted(true)}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {TOURNAMENT_DATA.map((item, index) => {
            const distance = Math.abs(activeIndex - index);
            const isActive = activeIndex === index;
            const zIndex = TOURNAMENT_DATA.length - distance;

            let offset = 0;
            if (index < activeIndex) offset = -30 * (activeIndex - index);
            else if (index > activeIndex) offset = 30 * (index - activeIndex);

            return (
              <motion.div
                key={item.id}
                className="absolute w-[340px] h-[280px] md:w-[600px] md:h-[400px] cursor-pointer"
                style={{ zIndex }}
                initial={{ x: index === 0 ? 0 : 100 * index }}
                animate={{
                  x: offset + "%",
                  scale: isActive ? 1 : 1 - distance * 0.15,
                  opacity: 1 - distance * 0.2,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  mass: 1,
                }}
                onClick={() => handleCardClick(index)}
                whileHover={isActive ? { scale: 1.05 } : {}}
              >
                <Card className="w-full h-full overflow-hidden rounded-xl border-0 shadow-lg relative">
                  <Image
                    src={item.image}
                    alt={`Slide ${index + 1}`}
                    fill={true}
                    sizes="(max-width: 768px) 340px, 600px"
                    className="object-cover"
                    priority={isActive}
                  />
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
      {/* Indicator Dots */}
      <div className="flex justify-center space-x-3 mb-5">
        {TOURNAMENT_DATA.map((_, index) => (
          <button
            key={index}
            className={cn(
              "h-3 rounded-full transition-all",
              activeIndex === index ? "w-10 bg-white" : "w-3 bg-gray-500"
            )}
            onClick={() => handleCardClick(index)}
          >
            <span className="sr-only">Go to slide {index + 1}</span>
          </button>
        ))}
      </div>

      {/* Info Section with Animation */}
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="bg-black rounded-xl shadow-lg p-6 md:p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          key={activeIndex} // Force re-render animation on active index change
        >
          <div className="mb-6">
            <motion.h2
              className="text-2xl md:text-4xl font-bold mb-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {TOURNAMENT_DATA[activeIndex].title}
            </motion.h2>

            <motion.p
              className="text-gray-600 mb-6 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {TOURNAMENT_DATA[activeIndex].description}
            </motion.p>
          </div>

          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {TOURNAMENT_DATA[activeIndex].stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-4 md:gap-6">
                {Object.entries(TOURNAMENT_DATA[activeIndex].stats).map(
                  ([label, value], index, array) => {
                    const colorClass =
                      TOURNAMENT_DATA[activeIndex].statColors?.[
                        label as keyof (typeof TOURNAMENT_DATA)[number]["statColors"]
                      ] || "bg-blue-500";

                    // Determine if the current panel is the third one when there are exactly three stats
                    const isThirdPanelWhenThreeStats =
                      array.length === 3 && index === 2;

                    // Add col-span-2 class for desktop if it's the third panel and there are exactly three stats
                    const colSpanClass = isThirdPanelWhenThreeStats
                      ? "md:col-span-2"
                      : "";

                    return (
                      <div
                        key={label}
                        className={`${colorClass} p-5 rounded-lg text-white text-center flex flex-col items-center justify-center ${colSpanClass}`}
                      >
                        <p className="font-semibold text-base md:text-lg capitalize">
                          {label}
                        </p>
                        <p className="text-2xl md:text-3xl font-bold">
                          {value}
                        </p>
                      </div>
                    );
                  }
                )}
              </div>
            )}

            {TOURNAMENT_DATA[activeIndex].team && (
              <div className="bg-gray-100 text-black p-5 rounded-lg">
                <p className="font-semibold mb-3 text-lg">Team</p>
                <ul className="list-none space-y-2">
                  {TOURNAMENT_DATA[activeIndex].team.map((member, i) => (
                    <li
                      key={i}
                      className="flex items-start text-base md:text-lg"
                    >
                      <span className="mr-2 text-lg">•</span>
                      <span>{member}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}