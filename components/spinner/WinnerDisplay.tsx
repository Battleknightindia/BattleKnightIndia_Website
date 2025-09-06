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
    <div className="relative">
      <Card className={cn('w-full max-w-sm', className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-primary" />
            <span className="font-semibold text-[15px]">{title}</span>
            <Badge variant="secondary" className="ml-auto">
              Total: {maxDisplay}
            </Badge>
            <Badge variant="secondary" className="ml-auto">
              {winners.length}
            </Badge>
          </div>
          <div className="space-y-2 overflow-auto max-h-68">
            {winners.length === 0 ? (
              <div className="text-center text-muted-foreground py-6">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No selected names yet</p>
                <p className="text-xs">Selected names will appear here</p>
              </div>
            ) : (
              <>
                {displayedWinners.map((winner, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20 animate-bounce-in group"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <Star className="w-4 h-4 text-primary-foreground" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{winner}</p>
                      <p className="text-xs text-muted-foreground">
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
                        className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all duration-200 ml-2"
                        title={`Remove ${winner}`}
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    )}
                  </div>
                ))}
               
                {remainingCount > 0 && (
                  <div className="text-center pt-2">
                    <Badge variant="outline" className="text-xs">
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
              className="mt-5 relative z-10"
              id="finalist-count-button"
            >
              Add <Plus className="w-4 h-4" />
            </Button>
            <Button 
              onClick={handleReset} 
              size={"sm"} 
              className="mt-5 bg-blue-500 relative z-10"
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
            <div className="bg-white text-gray-800 px-4 py-3 rounded-lg text-sm font-medium shadow-lg max-w-xs text-center">
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