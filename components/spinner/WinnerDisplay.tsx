"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface WinnerDisplayProps {
  winners: string[];
  className?: string;
  title?: string;
  maxDisplay?: number;
}

export const WinnerDisplay = ({
  winners,
  className,
  title = "Selected Winners",
  maxDisplay = 5
}: WinnerDisplayProps) => {
  const displayedWinners = winners.slice(0, maxDisplay);
  const remainingCount = winners.length - maxDisplay;

  return (
    <Card className={cn('w-full max-w-sm', className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-5 h-5 text-primary" />
          <span className="font-semibold text-[15px]">{title}</span>
          <Badge variant="secondary" className="ml-auto">
            {winners.length}
          </Badge>
        </div>

        <div className="space-y-2">
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
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20 animate-bounce-in"
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
      </CardContent>
    </Card>
  );
};

