import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Clock, Play, Pause } from 'lucide-react';

interface TimerProps {
  initialSeconds: number;
  onComplete: () => void;
  autoStart?: boolean;
  className?: string;
  showControls?: boolean;
}

interface TimerRef {
  pause: () => void;
  resume: () => void;
  reset: () => void;
  stop: () => void;
}

export const Timer = ({
  initialSeconds,
  onComplete,
  autoStart = true,
  className,
  showControls = true
}: TimerProps) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsComplete(true);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, seconds, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const reset = () => {
    setSeconds(initialSeconds);
    setIsRunning(autoStart);
    setIsComplete(false);
  };

  const pause = () => {
    setIsRunning(false);
  };

  const resume = () => {
    setIsRunning(true);
  };

  const stop = () => {
    setIsRunning(false);
    setSeconds(initialSeconds);
    setIsComplete(false);
  };

  const progressPercentage = ((initialSeconds - seconds) / initialSeconds) * 100;

  return (
    <div className={cn('flex flex-col items-center space-y-3', className)}>
      {/* Timer Display */}
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-muted-foreground" />
        <span
          className={cn(
            'text-2xl font-bold font-mono',
            isComplete ? 'text-destructive' : seconds <= 10 ? 'text-orange-500' : 'text-foreground'
          )}
        >
          {formatTime(seconds)}
        </span>
      </div>

      {/* Progress Ring */}
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 32 32">
          <circle
            cx="16"
            cy="16"
            r="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-secondary"
          />
          <circle
            cx="16"
            cy="16"
            r="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="87.96"
            strokeDashoffset={87.96 - (87.96 * progressPercentage) / 100}
            className={cn(
              'transition-all duration-1000 ease-linear',
              isComplete ? 'text-destructive' : seconds <= 10 ? 'text-orange-500' : 'text-primary'
            )}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold text-muted-foreground">
            {Math.round(progressPercentage)}%
          </span>
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="flex gap-2">
          <button
            onClick={resume}
            disabled={isRunning}
            className="flex items-center gap-1 px-3 py-1 bg-secondary rounded-md hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            <Play className="w-3 h-3" />
            <span className="text-xs">Play</span>
          </button>
          <button
            onClick={pause}
            disabled={!isRunning}
            className="flex items-center gap-1 px-3 py-1 bg-secondary rounded-md hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            <Pause className="w-3 h-3" />
            <span className="text-xs">Pause</span>
          </button>
          <button
            onClick={reset}
            className="px-3 py-1 bg-secondary rounded-md hover:bg-secondary/80 transition-colors text-xs"
          >
            Reset
          </button>
        </div>
      )}

      {/* Status */}
      {isComplete && (
        <div className="text-sm text-destructive font-medium animate-bounce-in">
          Time's up!
        </div>
      )}
    </div>
  );
};