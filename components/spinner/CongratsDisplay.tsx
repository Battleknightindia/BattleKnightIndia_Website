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
    <div className={cn('flex flex-col items-center text-center space-y-6', className)}>
      <div className="animate-bounce-in">
        <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-primary mb-2">
          Congratulations!
        </h2>
        <div className="space-y-2">
          <p className="text-xl font-semibold text-foreground">
            {winner}
          </p>
          <p className="text-lg text-muted-foreground">
            You won
          </p>
          <div className="inline-flex items-center justify-center rounded-full text-black">
            <Image
              src={`/diamonds/${reward}.png`} // Path to your reward image
              alt={`Reward of ${reward}`}
              width={128} // Set appropriate width
              height={128} // Set appropriate height
              className="object-contain"
            />
            <span className="text-2xl font-bold">
              {reward}
            </span>
          </div>
        </div>
      </div>
      
      <button
        onClick={onNextRound}
        className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold shadow-soft hover:bg-primary/90 hover:shadow-medium transition-all duration-200 active:scale-95"
      >
        Next Round
      </button>
    </div>
  );
};