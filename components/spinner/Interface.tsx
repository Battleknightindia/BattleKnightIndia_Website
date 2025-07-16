// Interface.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { SpinWheel } from '@/components/spinner/SpinWheel';
import { NameEntry } from '@/components/spinner/NameEntry';
import { Timer } from '@/components/spinner/Timer';
import { WinnerDisplay } from '@/components/spinner/WinnerDisplay';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CongratsDisplay } from './CongratsDisplay';

type Phase = 'entry' | 'finalist' | 'reward' | 'congrats';

const REWARDS = [99,199,299,399,499,599,699,799,899];


const Interface = () => {
  const [phase, setPhase] = useState<Phase>('entry');
  const [names, setNames] = useState<string[]>([]);
  const [winners, setWinners] = useState<string[]>([]);
  const [finalist, setFinalist] = useState<string>('');
  const [reward, setReward] = useState<number>(0);
  const [timerKey, setTimerKey] = useState(0);
  const [showTransition, setShowTransition] = useState(false);

  // Entry wheel auto-spin state
  const [entryAutoSpin, setEntryAutoSpin] = useState(false);
  const [entryWheelSpinning, setEntryWheelSpinning] = useState(false);
  const [isFirstEntrySpin, setIsFirstEntrySpin] = useState(true); // New state for first spin

  // Separate flags for each wheel with better state management
  const [finalistWheelState, setFinalistWheelState] = useState<'idle' | 'spinning' | 'completed'>('idle');
  const [rewardWheelState, setRewardWheelState] = useState<'idle' | 'spinning' | 'completed'>('idle');

  // Refs to track if auto-spin has been triggered to prevent multiple calls
  const finalistSpinTriggered = useRef(false);
  const rewardSpinTriggered = useRef(false);

  // Handler for bulk name entry
  const handleAddBulkNames = (bulkNames: string[]) => {
    setNames(prev => {
      const uniqueNames = bulkNames.filter(name => !prev.includes(name));
      return [...prev, ...uniqueNames].slice(0, 100);
    });
  };

  const handleAddName = (name: string) => {
    if (names.length < 100) {
      setNames(prev => [...prev, name]);
    }
  };

  const handleRemoveName = (index: number) => {
    setNames(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearNames = () => {
    setNames([]);
  };

  const handleWinnerSelected = (winner: string) => {
    setWinners(prev => {
      const newWinners = [...prev, winner];
      setNames(prevNames => prevNames.filter(name => name !== winner));
      setEntryWheelSpinning(false);
      setIsFirstEntrySpin(false); // Mark that the first spin has occurred

      // Decide if next auto-spin or phase transition
      if (newWinners.length < 5 && phase === 'entry') {
        // Schedule the next auto-spin with delay
        setTimeout(() => {
          setEntryAutoSpin(true);
        }, 8000);
      } else {
        setEntryAutoSpin(false); // Stop auto-spinning if 5 winners are selected or phase changes
      }
      return newWinners;
    });
  };

  const handleFinalistSelected = (selected: string) => {
    // Only process if we haven't already completed this step
    if (finalistWheelState === 'spinning') {
      setFinalist(selected);
      setFinalistWheelState('completed');
      // Move to reward phase after showing finalist (10s delay)
      setTimeout(() => {
        setPhase('reward');
      }, 10000);
    }
  };

  const handleRewardSelected = (selectedReward: string) => {
    // Only process if we haven't already completed this step
    if (rewardWheelState === 'spinning') {
      setReward(parseInt(selectedReward));
      setRewardWheelState('completed');
      
      // Move to congrats phase after showing reward
      setTimeout(() => {
        setPhase('congrats');
      }, 5000);
    }
  };


  const handleTimeUp = () => {
    if (names.length > 0 && winners.length < 5) {
      setEntryAutoSpin(true); // Start the first auto-spin after timer
      setIsFirstEntrySpin(true); // Ensure this is treated as the immediate first spin
    }
  };

  // Handler for manual spin button (first spin only)
  const handleManualSpin = () => {
    setEntryAutoSpin(true); // Start auto-spin sequence
    setIsFirstEntrySpin(true); // Ensure this is treated as the immediate first spin
  };


  const handleNextRound = () => {
    // Reset all state for new round
    setPhase('entry');
    setNames([]);
    setWinners([]);
    setFinalist('');
    setReward(0);
    setTimerKey(prev => prev + 2); // Increment key more to force remount of Timer
    setShowTransition(false);
    setEntryAutoSpin(false);
    setEntryWheelSpinning(false);
    setIsFirstEntrySpin(true); // Reset for a new round
    // Reset wheel states
    setFinalistWheelState('idle');
    setRewardWheelState('idle');
    // Reset refs
    finalistSpinTriggered.current = false;
    rewardSpinTriggered.current = false;
  };

  // Effect to handle transition from entry to finalist phase
  useEffect(() => {
    if (winners.length === 5 && phase === 'entry') {
      // First, let the current state with 5 winners be visible for 8 seconds
      const holdTimer = setTimeout(() => {
        setShowTransition(true); // Now trigger the slide animation
        // After the slide animation starts, typically it takes some time (e.g., 500ms for your transition-all duration-500)
        const transitionTimer = setTimeout(() => {
          setPhase('finalist');
          setShowTransition(false); // Reset for next use
          setFinalistWheelState('idle');
          finalistSpinTriggered.current = false;
        }, 500); // This duration should match your CSS transition duration

        return () => clearTimeout(transitionTimer); // Cleanup for the inner timer
      }, 11000); // This is the 11-second delay before the animation starts

      return () => clearTimeout(holdTimer); // Cleanup for the outer timer
    }
  }, [winners.length, phase]);

  // Effect to trigger finalist wheel spin - only once when entering finalist phase
  useEffect(() => {
    if (phase === 'finalist' && 
        finalistWheelState === 'idle' && 
        !finalistSpinTriggered.current &&
        winners.length === 5) {
      
      finalistSpinTriggered.current = true;
      
      const spinTimer = setTimeout(() => {
        setFinalistWheelState('spinning');
      }, 500); // Small delay for smooth transition

      return () => clearTimeout(spinTimer);
    }
  }, [phase, finalistWheelState, winners.length]);

  // Effect to trigger reward wheel spin - only once when entering reward phase
  useEffect(() => {
    if (phase === 'reward' && 
        rewardWheelState === 'idle' && 
        !rewardSpinTriggered.current &&
        finalist) {
      
      rewardSpinTriggered.current = true;
      
      const spinTimer = setTimeout(() => {
        setRewardWheelState('spinning');
      }, 500); // Small delay for smooth transition

      return () => clearTimeout(spinTimer);
    }
  }, [phase, rewardWheelState, finalist]);

  // Timer visibility
  const shouldShowTimer = phase === 'entry' && names.length > 0 && winners.length < 5 && !entryAutoSpin;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            NCC Spin Wheel Giveaway
          </h1>
          <p className="text-muted-foreground">
            {phase === 'entry' && 'Add participants and spin to select winners'}
            {phase === 'finalist' && 'Selecting the finalist from 5 winners'}
            {phase === 'reward' && 'Spinning for the reward'}
            {phase === 'congrats' && 'Congratulations to the winner!'}
          </p>

          {/* Phase Indicator */}
          <div className="flex justify-center gap-2 mt-4">
            <Badge variant={phase === 'entry' ? 'default' : 'secondary'}>
              Phase 1: Selection
            </Badge>
            <Badge variant={phase === 'finalist' ? 'default' : 'secondary'}>
              Phase 2: Finalist
            </Badge>
            <Badge variant={phase === 'reward' ? 'default' : 'secondary'}>
              Phase 3: Reward
            </Badge>
          </div>
        </div>

        {/* Phase 1: Entry and Selection */}
        {phase === 'entry' && (
          <div className={cn(
            'grid grid-cols-1 lg:grid-cols-3 relative gap-6 transition-all duration-500',
            showTransition && 'animate-slide-left'
          )}>
            {/* Left Panel - Name Entry */}
            <div className="lg:col-span-1 mr-15">
              <NameEntry
                names={names}
                onAddName={handleAddName}
                onRemoveName={handleRemoveName}
                onClearAll={handleClearNames}
                onAddBulkNames={handleAddBulkNames}
              />
            </div>

            {/* Center Panel - Spin Wheel */}
            <div className="lg:col-span-1 flex flex-col items-center space-y-6">
              <SpinWheel
                items={names || []}
                onSpin={handleWinnerSelected}
                autoSpin={entryAutoSpin}
                autoSpinDelay={isFirstEntrySpin ? 0 : 7000} // Pass delay here
                disabled={names.length === 0 || entryWheelSpinning || winners.length >= 5}
                wheelType='entry'
                logoSrc='/ncc_logo.png'
              />

              {/* Timer and Manual Spin Button only before first spin */}
              {shouldShowTimer && (
                <>
                  <Card className="p-4 fixed right-10 bottom-3">
                    <CardContent className="flex flex-col items-center space-y-2">
                      <p className="text-sm text-muted-foreground">Time remaining</p>
                      <Timer
                        key={timerKey}
                        initialSeconds={60}
                        onComplete={handleTimeUp}
                        autoStart={true}
                      />
                    </CardContent>
                  </Card>
                  {/* Manual Spin Button (only before first spin) */}
                  <button
                    onClick={handleManualSpin}
                    disabled={names.length === 0 || entryAutoSpin || winners.length >= 5}
                    className={cn(
                      'mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold shadow-soft transition-all duration-200',
                      'hover:bg-primary/90 hover:shadow-medium active:scale-95',
                      'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary'
                    )}
                  >
                    Spin Wheel
                  </button>
                </>
              )}
            </div>

            {/* Right Panel - Winners */}
            <div className="lg:col-span-1 ml-15">
              <WinnerDisplay
                winners={winners}
                title="Selected Members"
              />
            </div>
          </div>
        )}

        {/* Phase 2 & 3: Finalist and Reward */}
        {(phase === 'finalist' || phase === 'reward') && (
          <div className={cn(
            'flex flex-col items-center space-y-8 transition-all duration-500',
            !showTransition && 'animate-slide-in-right'
          )}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
              {/* Wheel 2 - Finalist Selection */}
              <div className="flex flex-col items-center space-y-4">
                <h3 className="text-xl pb-10 font-semibold text-foreground">
                  Finalist Selection
                </h3>
                <SpinWheel
                  items={winners || []}
                  onSpin={handleFinalistSelected}
                  autoSpin={finalistWheelState === 'spinning'}
                  size="md"
                  wheelType='finalist'
                  logoSrc='/ncc_logo.png'
                />
              </div>

              {/* Wheel 3 - Reward Selection */}
              <div className="flex flex-col items-center space-y-4">
                <h3 className="text-xl pb-10 font-semibold text-foreground">
                  Reward Wheel
                </h3>
                {phase === 'reward' && finalist ? (
                  <div className="text-center space-y-4">
                    <SpinWheel
                      items={REWARDS.map(r => r.toString()) || []}
                      onSpin={handleRewardSelected}
                      autoSpin={rewardWheelState === 'spinning'}
                      size="md"
                      wheelType='reward'
                      logoSrc='/ncc_logo.png'
                    />
                  </div>
                ) : (
                  <div className="w-[24rem] h-[24rem] bg-muted rounded-full flex items-center justify-center border-4 border-white shadow-strong">
                    <span className="text-muted-foreground">
                      {phase === 'finalist' ? 'Waiting for finalist...' : 'Waiting for reward phase...'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Phase 4: Congratulations */}
        {phase === 'congrats' && (
          <div className="flex justify-center">
            <CongratsDisplay
              winner={finalist}
              reward={reward}
              onNextRound={handleNextRound}
              className="animate-bounce-in"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Interface;