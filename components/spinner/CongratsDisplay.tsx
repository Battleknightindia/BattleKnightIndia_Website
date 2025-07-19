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
  className
}: CongratsDisplayProps) => {
  return (
    <div className={cn("relative flex flex-col items-center text-center space-y-6", className)}>
      <div className="z-10 animate-bounce-in">
        <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4 drop-shadow-lg" />

        <h2 className="text-4xl font-extrabold text-primary mb-2">
          🎉 Congratulations! 🎉
        </h2>

        <div className="space-y-1">
          <p className="text-2xl font-bold text-foreground">
            {winner}, you’re the champion!
          </p>
          <p className="text-lg text-muted-foreground">
            You won
          </p>
        </div>

        <div className="inline-flex items-center justify-center rounded-full bg-yellow-100 p-4 mt-4 shadow-inner">
          <Image
            src={`/diamonds/${reward}.png`}
            alt={`Reward of ${reward}`}
            width={90}
            height={90}
            className="object-contain"
          />
          <span className="text-3xl mt-5 font-bold text-black">
            {reward}
          </span>
        </div>
      </div>

      <button
        onClick={onNextRound}
        className="z-10 px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold shadow-soft hover:bg-primary/90 hover:shadow-md transition-all duration-200 active:scale-95"
      >
        Next Round
      </button>
    </div>
  );
};
