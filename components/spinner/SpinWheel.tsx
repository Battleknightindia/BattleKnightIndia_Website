"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface SpinWheelProps {
  items: string[];
  onSpin?: (winner: string) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  logoSrc?: string;
  wheelType?: "reward" | "finalist" | "entry";
}

// Global state to persist across component re-renders and type changes
const globalSpinState = {
  totalSpins: 0,
  recentWinners: [] as {
    index: number;
    wheelType: string;
    timestamp: number;
  }[],
  lastWinnerByType: {} as Record<string, number>,
  rewardSpinCount: 0, // Track spins specifically for reward wheels
  hasUsedOneTimeBonus: false, // Track if one-time bonus has been used
  lastGuaranteedSpin: 0, // Track last guaranteed spin for reward wheels
};

const SpinWheel = forwardRef<{ spin: () => void }, SpinWheelProps>(
  (
    {
      items,
      onSpin,
      className,
      size = "lg",
      disabled = false,
      logoSrc,
      wheelType = "entry",
    },
    ref
  ) => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [isReady, setIsReady] = useState(true);
    const [rotation, setRotation] = useState(0);
    const [winner, setWinner] = useState<string | null>(null);
    const wheelRef = useRef<HTMLDivElement>(null);
    const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const animationDuration = 3000; // 3 seconds for spin animation

    const sizeClasses = {
      sm: "w-48 h-48",
      md: "w-[24rem] h-[24rem]",
      lg: "w-[30rem] h-[30rem]",
    };

    const colors = [
      "wheel-slice-1",
      "wheel-slice-2",
      "wheel-slice-3",
      "wheel-slice-3",
      "wheel-slice-4",
      "wheel-slice-5",
      "wheel-slice-6",
      "wheel-slice-7",
      "wheel-slice-8",
    ];

    // Expose spin method via ref
    useImperativeHandle(ref, () => ({
      spin,
    }));

    // Check if we should avoid selecting this index (anti-clustering logic)
    const shouldAvoidIndex = useCallback(
      (index: number, typeKey: string, timestamp: number): boolean => {
        const recentSameTypeWinners = globalSpinState.recentWinners.filter(
          (entry) =>
            entry.wheelType === wheelType && timestamp - entry.timestamp < 10000 // Last 10 seconds
        );

        // For entry wheels, avoid consecutive selections of nearby items
        if (wheelType === "entry" && items.length > 3) {
          const lastWinner = globalSpinState.lastWinnerByType[typeKey];
          if (lastWinner !== undefined) {
            const minDistance = Math.max(1, Math.floor(items.length / 6));
            const distance = Math.abs(index - lastWinner);
            const wrapDistance = Math.min(distance, items.length - distance);

            // Only avoid if we have a very recent spin (last 5 seconds) and it's too close
            const veryRecentSpin = recentSameTypeWinners.find(
              (entry) => timestamp - entry.timestamp < 5000
            );

            if (veryRecentSpin && wrapDistance < minDistance) {
              return true;
            }
          }
        }

        // For all types, avoid excessive repetition in recent history
        const sameIndexCount = recentSameTypeWinners.filter(
          (entry) => entry.index === index
        ).length;

        // Allow some repetition, but not too much
        const maxRecentSame = Math.max(1, Math.floor(items.length / 4));
        return sameIndexCount >= maxRecentSame;
      },
      [wheelType, items.length]
    );

    // Improved truly random selection with anti-clustering and guaranteed rewards
    // Improved truly random selection with anti-clustering and guaranteed rewards
    const selectRandomIndex = useCallback(
      (numItems: number) => {
        const now = Date.now();
        const typeKey = `${wheelType}-${numItems}`;

        // Clean old entries (older than 30 seconds for anti-clustering)
        globalSpinState.recentWinners = globalSpinState.recentWinners.filter(
          (entry) => now - entry.timestamp < 30000
        );

        let selectedIndex: number;

        // 🔥 Force reward wheel to only pick from 599,699,799,899
        if (wheelType === "reward" && numItems === 9) {
          const premiumRewardIndices = [5, 6, 7, 8]; // indices for 599–899
          const randomPremiumIndex = Math.floor(
            Math.random() * premiumRewardIndices.length
          );
          selectedIndex = premiumRewardIndices[randomPremiumIndex];
          return selectedIndex;
        }

        // Default behavior for entry/finalist wheels
        let attempts = 0;
        const maxAttempts = 50;
        do {
          const crypto = window.crypto;
          let randomValue: number;

          if (crypto?.getRandomValues) {
            const array = new Uint32Array(1);
            crypto.getRandomValues(array);
            randomValue = array[0] / (0xffffffff + 1);
          } else {
            randomValue = Math.random();
          }

          const timeEntropy = (now % 1000) / 1000;
          const spinEntropy = (globalSpinState.totalSpins % 100) / 100;

          const combinedRandom = (randomValue + timeEntropy + spinEntropy) % 1;
          selectedIndex = Math.floor(combinedRandom * numItems);

          attempts++;
        } while (
          attempts < maxAttempts &&
          shouldAvoidIndex(selectedIndex, typeKey, now)
        );

        return selectedIndex;
      },
      [wheelType, shouldAvoidIndex, items]
    );

    const spin = useCallback(() => {
      if (!isReady || isSpinning || disabled || items.length === 0) return;

      setIsSpinning(true);
      setIsReady(false);
      setWinner(null);

      const numItems = items.length;
      const segmentAngle = 360 / numItems;
      const now = Date.now();
      const typeKey = `${wheelType}-${numItems}`;

      // Select random index
      const selectedWinnerIndex = selectRandomIndex(numItems);

      // Update global state
      globalSpinState.totalSpins++;
      globalSpinState.recentWinners.push({
        index: selectedWinnerIndex,
        wheelType: wheelType,
        timestamp: now,
      });
      globalSpinState.lastWinnerByType[typeKey] = selectedWinnerIndex;

      // Calculate rotation
      const sliceCenterAngle =
        selectedWinnerIndex * segmentAngle + segmentAngle / 2;
      let desiredStopAngle = 270 - sliceCenterAngle;
      desiredStopAngle = ((desiredStopAngle % 360) + 360) % 360;

      // Add randomness to number of revolutions
      const minRevolutions = 4;
      const maxRevolutions = 8;
      const randomRevolutions =
        minRevolutions + Math.random() * (maxRevolutions - minRevolutions);
      const totalRevolutions = Math.floor(randomRevolutions);

      // Add small random offset to make it less predictable
      const randomOffset = (Math.random() - 0.5) * 20; // ±10 degrees

      const currentNormalizedRotation = rotation % 360;
      let deltaRotation =
        desiredStopAngle - currentNormalizedRotation + randomOffset;

      if (deltaRotation < 0) {
        deltaRotation += 360;
      }

      const newRotation = rotation + totalRevolutions * 360 + deltaRotation;
      setRotation(newRotation);

      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current);
      }

      spinTimeoutRef.current = setTimeout(() => {
        setIsSpinning(false);
        const winningItem = items[selectedWinnerIndex];
        setWinner(winningItem);
        onSpin?.(winningItem);

        setTimeout(
          () => {
            setIsReady(true);
          },
          wheelType === "entry" ? 1000 : 2000
        );
      }, animationDuration);
    }, [
      isReady,
      isSpinning,
      disabled,
      items.length,
      wheelType,
      rotation,
      onSpin,
      animationDuration,
      selectRandomIndex,
      items,
    ]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (spinTimeoutRef.current) {
          clearTimeout(spinTimeoutRef.current);
        }
      };
    }, []);

    const createWheelSlices = () => {
      if (items.length === 0) return null;

      const segmentAngle = 360 / items.length;
      const radius = 150;

      return (
        <svg className="w-full h-full absolute inset-0" viewBox="0 0 300 300">
          {items.map((item, index) => {
            const startAngle = index * segmentAngle;
            const endAngle = (index + 1) * segmentAngle;

            const x1 = 150 + radius * Math.cos((startAngle * Math.PI) / 180);
            const y1 = 150 + radius * Math.sin((startAngle * Math.PI) / 180);
            const x2 = 150 + radius * Math.cos((endAngle * Math.PI) / 180);
            const y2 = 150 + radius * Math.sin((endAngle * Math.PI) / 180);

            const largeArcFlag = segmentAngle > 180 ? 1 : 0;

            const pathData = [
              `M 150 150`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              `Z`,
            ].join(" ");

            const textAngleRad =
              (index * segmentAngle + segmentAngle / 2) * (Math.PI / 180);
            // Move text closer to inner circle
            const textRadius = radius * 0.45;
            const textX = 150 + textRadius * Math.cos(textAngleRad);
            const textY = 150 + textRadius * Math.sin(textAngleRad);

            // Position diamond at outer edge
            const diamondRadius = radius * 0.85;
            const diamondX = 150 + diamondRadius * Math.cos(textAngleRad);
            const diamondY = 150 + diamondRadius * Math.sin(textAngleRad);

            const colorClass = colors[index % colors.length];

            const colorValues = {
              "wheel-slice-1": "hsl(262, 83%, 58%)",
              "wheel-slice-2": "hsl(224, 71%, 60%)",
              "wheel-slice-3": "hsl(186, 91%, 56%)",
              "wheel-slice-4": "hsl(142, 76%, 57%)",
              "wheel-slice-5": "hsl(47, 96%, 56%)",
              "wheel-slice-6": "hsl(21, 90%, 56%)",
              "wheel-slice-7": "hsl(340, 82%, 62%)",
              "wheel-slice-8": "hsl(291, 84%, 61%)",
            };

            // Generate dynamic image path based on reward value
            const getDiamondImage = (rewardValue: string): string => {
              return `/diamonds/${rewardValue}.webp`;
            };

            return (
              <g key={index}>
                <path
                  d={pathData}
                  fill={colorValues[colorClass as keyof typeof colorValues]}
                  stroke="white"
                  strokeWidth="2"
                />
                <text
                  x={textX}
                  y={textY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-white font-semibold text-xs"
                  transform={`rotate(${
                    (textAngleRad * 180) / Math.PI + 180
                  }, ${textX}, ${textY})`}
                >
                  {item.length > 12 ? item.substring(0, 10) + "..." : item}
                </text>
                {wheelType === "reward" && (
                  <image
                    href={getDiamondImage(item)}
                    x={diamondX - 20}
                    y={diamondY - 20}
                    width="40"
                    height="40"
                    style={{ pointerEvents: "none" }}
                  />
                )}
              </g>
            );
          })}
        </svg>
      );
    };

    return (
      <div className={cn("relative flex flex-col items-center", className)}>
        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === "development" && (
          <div className="absolute top-0 right-0 text-xs text-gray-500 bg-white p-2 rounded shadow">
            <div>Total Spins: {globalSpinState.totalSpins}</div>
            {wheelType === "reward" && (
              <>
                <div>Reward Spins: {globalSpinState.rewardSpinCount}</div>
                <div>Premium Mode: 🎁 $599-$899 Only</div>
              </>
            )}
          </div>
        )}

        {/* Pointer - fixed at the top */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20">
          <div className="w-0 h-0 border-l-6 border-r-6 border-t-12 border-l-transparent border-r-transparent border-t-primary drop-shadow-lg" />
        </div>

        {/* Wheel Container */}
        <div className="relative">
          <div
            ref={wheelRef}
            className={cn(
              "relative rounded-full border-4 border-white overflow-hidden",
              sizeClasses[size],
              isSpinning && "pointer-events-none"
            )}
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning
                ? `transform ${
                    animationDuration / 1000
                  }s cubic-bezier(0.25, 0.46, 0.45, 0.94)`
                : "none",
            }}
          >
            {items.length > 0 ? (
              createWheelSlices()
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                <span className="text-sm">No items</span>
              </div>
            )}
          </div>

          {/* Stationary Center Circle / Logo */}
          {logoSrc ? (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] rounded-full overflow-hidden z-10 flex items-center justify-center">
              <Image
                src={logoSrc}
                width={100}
                height={100}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-15 h-15 bg-white rounded-full shadow-md border-2 border-gray-200 z-10 flex items-center justify-center">
              {/* Default white circle */}
            </div>
          )}
        </div>

        {/* Manual Spin Button */}
        {(wheelType === "finalist" || wheelType === "reward") &&
          isReady &&
          !isSpinning &&
          !winner && (
            <button
              onClick={spin}
              className={cn(
                "mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold shadow-soft transition-all duration-200",
                "hover:bg-primary/90 hover:shadow-medium active:scale-95",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
              )}
            >
              Spin Wheel
            </button>
          )}

        {/* Entry wheel button with info */}
        {wheelType === "entry" && (
          <div className="relative">
            <button
              onClick={spin}
              disabled={
                !isReady || isSpinning || disabled || items.length === 0
              }
              className={cn(
                "mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold shadow-soft transition-all duration-200",
                "hover:bg-primary/90 hover:shadow-medium active:scale-95",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
              )}
            >
              Spin Wheel
            </button>
            <span className="absolute bottom-3 -right-7">
              <Popover>
                <PopoverTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
                </PopoverTrigger>
                <PopoverContent side="top" className="text-sm max-w-xs p-2">
                  Each spin is completely random with anti-clustering to ensure
                  fair distribution.
                </PopoverContent>
              </Popover>
            </span>
          </div>
        )}

        {/* Winner Display */}
        {winner && !isSpinning && wheelType !== "entry" && (
          <div className="mt-2 w-40 h-20 flex-col flex justify-center items-center bg-white rounded-lg shadow-medium border animate-bounce-in">
            <p className="text-sm font-medium text-muted-foreground">
              {wheelType === "reward" ? "Reward:" : "Selected Member:"}
            </p>
            <p className="text-lg text-center font-semibold text-primary">
              {wheelType === "reward" ? `$${winner}` : winner}
            </p>
          </div>
        )}
      </div>
    );
  }
);

SpinWheel.displayName = "SpinWheel";
export { SpinWheel };
