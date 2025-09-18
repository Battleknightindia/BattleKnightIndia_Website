"use client";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Users, Plus, X, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useState, useEffect } from 'react';

interface WinnerDisplayProps {
  winners: string[];
  className?: string;
  title?: string;
  maxDisplay?: number;
  handleModel?: () => void;
  handleReset?: () => void;
  handleRemoveWinner?: (index: number) => void; // New prop for removing individual winners
}

export const WinnerDisplay = ({
  winners,
  className,
  title = "Selected Winners",
  maxDisplay = 0,
  handleModel,
  handleReset,
  handleRemoveWinner
}: WinnerDisplayProps) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const displayedWinners = winners.slice(0, maxDisplay);
  const remainingCount = winners.length - maxDisplay;

  // Show overlay when no winners and hide after 3 seconds or when winners are added
  useEffect(() => {
    if (maxDisplay === 0) {
      const timer = setTimeout(() => {
        setShowOverlay(true);
      }, 500); // Small delay before showing overlay
      
      return () => clearTimeout(timer);
    } else {
      setShowOverlay(false);
    }
  }, [maxDisplay]);

  // Hide overlay when user clicks anywhere
  const handleOverlayClick = () => {
    setShowOverlay(false);
  };

  return (
    <div className="relative ml-10">
      <Card className={cn('w-full max-w-sm bg-white/60 border border-gray-200/50 shadow-lg', className)}>
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-3 bg-white/80 h-10 w-76 px-3 rounded-md border border-gray-200/30">
            <Trophy className="w-5 h-5 text-gray-700" />
            <span className="font-semibold text-[15px] text-gray-800">{title}</span>
            <Badge variant="secondary" className="ml-auto bg-gray-100 text-gray-700 border-gray-200">
              Total: {maxDisplay}
            </Badge>
            <Badge variant="secondary" className="ml-auto bg-gray-100 text-gray-700 border-gray-200">
              {winners.length}
            </Badge>
          </div>
          <div className="space-y-2 overflow-auto max-h-68">
            {winners.length === 0 ? (
              <div className="text-center text-gray-500 py-6">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50 text-gray-400" />
                <p className="text-sm">No selected names yet</p>
                <p className="text-xs">Selected names will appear here</p>
              </div>
            ) : (
              <>
                {displayedWinners.map((winner, index) => (
                  <div
                    key={index}
                    className="flex bg-white/90 items-center gap-3 p-3 rounded-lg border border-gray-300/50 animate-bounce-in group shadow-sm"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-pink-400 rounded-full flex items-center justify-center">
                        <Star className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate text-gray-800">{winner}</p>
                      <p className="text-xs text-gray-600">
                        Selected Members #{index + 1}
                      </p>
                    </div>
                    {/* Delete button for individual winners */}
                    {handleRemoveWinner && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveWinner(index);
                        }}
                        className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all duration-200 ml-2 shadow-sm"
                        title={`Remove ${winner}`}
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    )}
                  </div>
                ))}
               
                {remainingCount > 0 && (
                  <div className="text-center pt-2">
                    <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">
                      +{remainingCount} more
                    </Badge>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex justify-center gap-3">
            <Button 
              onClick={handleModel} 
              size={"sm"} 
              className="mt-5 relative z-10 bg-gray-800 hover:bg-gray-700 text-white"
              id="finalist-count-button"
            >
              Add <Plus className="w-4 h-4" />
            </Button>
            <Button 
              onClick={handleReset} 
              size={"sm"} 
              className="mt-5 bg-blue-500 hover:bg-blue-600 relative z-10 text-white"
              id="finalist-count-button"
            >
              Reset <RefreshCw/>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overlay Guide */}
      {showOverlay && (
        <div 
          className="absolute inset-0 z-20 pointer-events-auto"
          onClick={handleOverlayClick}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 rounded-lg" />
          
          {/* Guide Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="bg-white text-gray-800 px-4 py-3 rounded-lg text-sm font-medium shadow-lg max-w-xs text-center border border-gray-200">
              Click the + button below to set how many finalists to select
            </div>
          </div>

          {/* Subtle close hint */}
          <div className="absolute top-2 right-2 text-white/70 text-xs pointer-events-none">
            Click anywhere to dismiss
          </div>
        </div>
      )}
    </div>
  );
};