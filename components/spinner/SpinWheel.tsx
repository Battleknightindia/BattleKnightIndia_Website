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
    const [lastWinnerIndex, setLastWinnerIndex] = useState<number | null>(null);
    // Session-based tracking - only persists within current session/tab
    const [recentWinners, setRecentWinners] = useState<{ index: number; timestamp: number }[]>([]);
    const [rewardCounts, setRewardCounts] = useState<number[]>([]);
    const [consecutiveWins, setConsecutiveWins] = useState(0);
    const [lastWinnerReward, setLastWinnerReward] = useState<number | null>(null);
    
    // Generate a unique session ID for this tab/session
    const sessionId = useRef<string>("");
    
    useEffect(() => {
      // Generate session ID only once per tab/session
      if (!sessionId.current) {
        sessionId.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
    }, []);
    
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

    // Initialize reward counts for current session only
    useEffect(() => {
      if (wheelType === "reward" && items.length > 0) {
        setRewardCounts(new Array(items.length).fill(0));
      }
    }, [items.length, wheelType]);

    // Expose spin method via ref
    useImperativeHandle(ref, () => ({
      spin,
    }));

    // Enhanced reward selection algorithm with session-based balancing
    const selectRewardIndex = useCallback((numItems: number) => {
      let baseWeights: number[];
      
      if (numItems === 9) {
        // Improved weights - made ultra-rare rewards slightly more obtainable
        // 99(~55%), 199(~22%), 299(~12%), 399(~6%), 499(~3%), 599(~1.5%), 699(~0.8%), 799(~0.4%), 899(~0.2%)
        baseWeights = [120, 48, 26, 13, 6.5, 3.2, 1.8, 1, 0.5];
      } else {
        // Dynamic weights for other numbers of items
        baseWeights = Array.from({ length: numItems }, (_, i) => {
          return Math.max(0.3, 120 * Math.pow(0.55, i));
        });
      }

      // Apply session-based pity system - only within current session
      const totalSpins = rewardCounts.reduce((a, b) => a + b, 0);
      const pityWeights = baseWeights.map((weight, index) => {
        // More aggressive pity system since it resets each session
        if (totalSpins > 8 && rewardCounts[index] === 0) {
          // Boost rewards that haven't appeared after 8 spins in this session
          const boostMultiplier = Math.min(4, 1 + Math.floor(totalSpins / 5));
          
          // Higher boost for rarer items (indices 6, 7, 8)
          if (index >= 6) {
            return weight * (boostMultiplier * 3);
          } else if (index >= 4) {
            return weight * (boostMultiplier * 2);
          }
          return weight * boostMultiplier;
        }
        return weight;
      });

      // Session-based anti-repetition with recency weighting
      const now = Date.now();
      const adjustedWeights = pityWeights.map((weight, index) => {
        let adjustmentFactor = 1;
        
        // Apply recency-based penalties within session
        recentWinners.forEach(({ index: winnerIdx, timestamp }, spinIndex) => {
          if (winnerIdx === index) {
            const timeSince = now - timestamp;
            const recentSpins = recentWinners.length;
            const recencyFactor = Math.max(0.2, Math.min(1, timeSince / (20 * 1000))); // 20 second decay
            const positionFactor = (recentSpins - spinIndex) / recentSpins;
            
            let penalty = index === 0 ? 0.15 : 0.4; // Gentler for 99
            penalty *= positionFactor * (1 - recencyFactor);
            
            adjustmentFactor *= (1 - penalty);
          }
        });

        // Stronger streak breaker for session-based system
        if (consecutiveWins >= 3 && lastWinnerReward === index) {
          adjustmentFactor *= 0.05; // Very harsh penalty for 3+ consecutive
        } else if (consecutiveWins >= 2 && lastWinnerReward === index) {
          adjustmentFactor *= 0.2; // Strong penalty for 2 consecutive
        }
        
        return Math.max(0.01, weight * adjustmentFactor);
      });

      // Weighted random selection
      const totalWeight = adjustedWeights.reduce((sum, weight) => sum + weight, 0);
      let random = Math.random() * totalWeight;
      
      for (let i = 0; i < adjustedWeights.length; i++) {
        random -= adjustedWeights[i];
        if (random <= 0) {
          return i;
        }
      }
      
      // Fallback
      return 0;
    }, [rewardCounts, recentWinners, consecutiveWins, lastWinnerReward]);

    // Testing function for session-based distribution
    const testDistribution = useCallback((spins = 100) => {
      if (wheelType !== "reward" || items.length !== 9) return;
      
      console.log(`🎯 Testing Session-Based Distribution (${spins} spins)`);
      console.log(`Session ID: ${sessionId.current}`);
      
      const counts = new Array(9).fill(0);
      const rewards = [99, 199, 299, 399, 499, 599, 699, 799, 899];
      
      // Simulate current session state
      let testRecentWinners: { index: number; timestamp: number }[] = [...recentWinners];
      let testRewardCounts = [...rewardCounts];
      let testConsecutiveWins = consecutiveWins;
      let testLastWinnerReward = lastWinnerReward;
      
      for (let i = 0; i < spins; i++) {
        // Use a simplified version of the actual selection logic
        const weights = [120, 48, 26, 13, 6.5, 3.2, 1.8, 1, 0.5];
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        const random = Math.random() * totalWeight;
        
        let selectedIndex = 0;
        let cumWeight = 0;
        for (let j = 0; j < weights.length; j++) {
          cumWeight += weights[j];
          if (random <= cumWeight) {
            selectedIndex = j;
            break;
          }
        }
        
        counts[selectedIndex]++;
        
        // Update test tracking
        testRecentWinners.push({ index: selectedIndex, timestamp: Date.now() });
        if (testRecentWinners.length > 6) testRecentWinners.shift();
        
        testRewardCounts[selectedIndex]++;
        
        if (testLastWinnerReward === selectedIndex) {
          testConsecutiveWins++;
        } else {
          testConsecutiveWins = 1;
          testLastWinnerReward = selectedIndex;
        }
      }
      
      console.log("📊 Distribution Results:");
      counts.forEach((count, i) => {
        const percentage = (count / spins * 100).toFixed(1);
        console.log(`💎 ${rewards[i]}: ${count} times (${percentage}%)`);
      });
      
      console.log("🎮 Current Session Stats:");
      console.log(`Total session spins: ${rewardCounts.reduce((a, b) => a + b, 0)}`);
      console.log(`Consecutive wins: ${consecutiveWins}`);
      console.log(`Recent winners: ${recentWinners.length}`);
    }, [wheelType, items.length, sessionId, rewardCounts, consecutiveWins, recentWinners, lastWinnerReward]);

    // Add test function to window for easy access (remove in production)
    useEffect(() => {
      if (typeof window !== 'undefined') {
        (window as any).testWheelDistribution = testDistribution;
      }
    }, [testDistribution]);

    const spin = useCallback(() => {
      if (!isReady || isSpinning || disabled || items.length === 0) return;

      setIsSpinning(true);
      setIsReady(false);
      setWinner(null);

      const numItems = items.length;
      const segmentAngle = 360 / numItems;

      let selectedWinnerIndex: number;

      if (wheelType === "reward") {
        selectedWinnerIndex = selectRewardIndex(numItems);
        
        // Update tracking within current session only - no localStorage persistence
        const now = Date.now();
        setRecentWinners(prev => {
          const updated = [...prev, { index: selectedWinnerIndex, timestamp: now }];
          return updated.slice(-6); // Keep only last 6 spins in session
        });

        // Update reward counts for session-based pity system
        setRewardCounts(prev => {
          const updated = [...prev];
          updated[selectedWinnerIndex] = (updated[selectedWinnerIndex] || 0) + 1;
          return updated;
        });

        // Update consecutive wins tracking
        const newConsecutiveWins = lastWinnerReward === selectedWinnerIndex ? consecutiveWins + 1 : 1;
        setConsecutiveWins(newConsecutiveWins);
        setLastWinnerReward(selectedWinnerIndex);
        
      } else if (wheelType === "entry" && numItems > 1) {
        const minGap = Math.max(1, Math.floor(numItems / 8));
        let possibleIndexes: number[] = [];
        if (lastWinnerIndex === null) {
          possibleIndexes = Array.from({ length: numItems }, (_, i) => i);
        } else {
          for (let i = 0; i < numItems; i++) {
            const gap = Math.abs(i - lastWinnerIndex);
            const wrapGap = Math.min(gap, numItems - gap);
            if (wrapGap >= minGap) {
              possibleIndexes.push(i);
            }
          }
          if (possibleIndexes.length === 0) {
            possibleIndexes = Array.from({ length: numItems }, (_, i) => i);
          }
        }
        selectedWinnerIndex =
          possibleIndexes[Math.floor(Math.random() * possibleIndexes.length)];
      } else {
        selectedWinnerIndex = Math.floor(Math.random() * numItems);
      }

      const sliceCenterAngle =
        selectedWinnerIndex * segmentAngle + segmentAngle / 2;
      let desiredStopAngle = 270 - sliceCenterAngle;
      desiredStopAngle = ((desiredStopAngle % 360) + 360) % 360;

      const minRevolutions = 5;
      const additionalRandomRevolutions = Math.floor(Math.random() * 5);
      const totalRevolutions = minRevolutions + additionalRandomRevolutions;

      const currentNormalizedRotation = rotation % 360;
      let deltaRotation = desiredStopAngle - currentNormalizedRotation;

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
        if (wheelType === "entry") setLastWinnerIndex(selectedWinnerIndex);
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
      items,
      rotation,
      onSpin,
      wheelType,
      animationDuration,
      lastWinnerIndex,
      selectRewardIndex,
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
            const getDiamondImage = (rewardValue: string) => {
              return `/diamonds/${rewardValue}.webp`;
            };

            // Check if this is a rare reward that should have visual enhancement
            const isRareReward = wheelType === "reward" && index >= 6; // 699, 799, 899
            const isUltraRare = wheelType === "reward" && index >= 7; // 799, 899

            return (
              <g key={index}>
                <path
                  d={pathData}
                  fill={colorValues[colorClass as keyof typeof colorValues]}
                  stroke="white"
                  strokeWidth="2"
                  style={{
                    filter: isUltraRare ? "drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))" : 
                            isRareReward ? "drop-shadow(0 0 4px rgba(255, 255, 255, 0.4))" : "none"
                  }}
                />
                <text
                  x={textX}
                  y={textY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={cn(
                    "font-semibold text-xs",
                    isUltraRare ? "fill-yellow-200" : "fill-white"
                  )}
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
                    style={{ 
                      pointerEvents: "none",
                      filter: isUltraRare ? "drop-shadow(0 0 6px rgba(255, 215, 0, 0.8))" : "none"
                    }}
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
        {/* Pointer - fixed at the top */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20">
          <div className="w-0 h-0 border-l-6 border-r-6 border-t-12 border-l-transparent border-r-transparent border-t-primary drop-shadow-lg" />
        </div>

        {/* Wheel Container */}
        <div className="relative">
          <div
            ref={wheelRef}
            className={cn(
              "relative  rounded-full border-4 border-white overflow-hidden",
              sizeClasses[size],
              isSpinning && "pointer-events-none" // Prevent interactions during spin
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
          {/* Stationary Center Circle / Logo - Moved outside the rotating wheelRef */}
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
              {/* This div remains if no logoSrc is provided, providing the default white circle */}
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
        {/* Manual Spin Button */}
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
                  This is some helpful info about this section.
                </PopoverContent>
              </Popover>
            </span>
          </div>
        )}

        {/* Enhanced Winner Display with rarity indication */}
        {winner && !isSpinning && wheelType != "entry" && (
          <div className={cn(
            "mt-2 w-40 h-20 flex-col flex justify-center items-center bg-white rounded-lg shadow-medium border animate-bounce-in",
            // Add special styling for rare wins
            wheelType === "reward" && (winner === "799" || winner === "899") && "border-2 border-yellow-400 shadow-yellow-200",
            wheelType === "reward" && winner === "699" && "border-2 border-purple-400 shadow-purple-200"
          )}>
            <p className="text-sm font-medium text-muted-foreground">
              {wheelType === "reward" ? "Reward:" : "Selected Member:"}
            </p>
            <p className={cn(
              "text-lg text-center font-semibold",
              wheelType === "reward" && (winner === "799" || winner === "899") ? "text-yellow-600" :
              wheelType === "reward" && winner === "699" ? "text-purple-600" : "text-primary"
            )}>
              {wheelType === "reward" ? `$${winner}` : winner}
              {wheelType === "reward" && (winner === "799" || winner === "899") && " ✨"}
              {wheelType === "reward" && consecutiveWins > 1 && ` (x${consecutiveWins})`}
            </p>
          </div>
        )}

        {/* Session info for reward wheel (remove in production) */}
        {wheelType === "reward" && process.env.NODE_ENV === "development" && (
          <div className="mt-4 text-xs text-muted-foreground text-center space-y-1">
            <p>🎮 Session spins: {rewardCounts.reduce((a, b) => a + b, 0)}</p>
            <p>🔄 Consecutive: {consecutiveWins}</p>
            <p>⏰ Recent: {recentWinners.length} entries</p>
            <p>🧪 Test: window.testWheelDistribution(100)</p>
            <p className="text-green-400">✅ Session-Based (No Cross-User Impact)</p>
          </div>
        )}
      </div>
    );
  }
);
SpinWheel.displayName = "SpinWheel";
export { SpinWheel };