import { cn } from "@/lib/utils";
import Image from "next/image";
import { Trophy } from "lucide-react";

interface CongratsDisplayProps {
  winner: string;
  reward: number;
  onNextRound: () => void;
  className?: string;
}

export const CongratsDisplay = ({
  winner,
  reward,
  onNextRound,
  className,
}: CongratsDisplayProps) => {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center text-center",
        className
      )}
    >
      {/* Congratulations Title */}
      <div className="z-10 ml-20 pb-70">
        <Image
          src="/congratulations.png"
          alt="Sanrio Congratulations"
          width={700}
          height={100}
          className="object-contain"
        />
      </div>

      <div className="absolute bottom-10 space-y-6 z-10">
        {/* Winner Name */}
      <p className="text-3xl font-bold text-yellow-300 mt-2">
        {winner}
      </p>

      {/* You Won Text */}
      <p className="text-xl text-purple-200 mt-1">You won</p>

      {/* Reward Display */}
      <div className="flex items-center ml-7 mt-2">
        <Image
          src={`/diamonds/${reward}.webp`}
          alt={`Reward of ${reward}`}
          width={60}
          height={60}
          className="object-contain"
        />
        <span className="text-4xl font-bold text-white">{reward}</span>
      </div>

      {/* Next Round Button */}
      <button
        onClick={onNextRound}
        className="mt-6 px-12 py-4 bg-pink-500 text-white rounded-full font-semibold shadow-lg hover:bg-pink-700 transition-all duration-200 active:scale-95"
      >
        Next Round
      </button>
      </div>
    </div>
  );
};