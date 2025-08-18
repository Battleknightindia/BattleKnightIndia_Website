// Interface.tsx
"use client";

import { useState, useEffect, ReactEventHandler } from "react";
import { SpinWheel } from "@/components/spinner/SpinWheel";
import { NameEntry } from "@/components/spinner/NameEntry";
import { WinnerDisplay } from "@/components/spinner/WinnerDisplay";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CongratsDisplay } from "./CongratsDisplay";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Plus, RotateCcw } from "lucide-react";

type Phase = "entry" | "finalist" | "reward" | "congrats";

interface AppState {
  phase: Phase;
  names: string[];
  winners: string[];
  finalist: string;
  reward: number;
  maxFinalist: number;
  // Track completion of each phase to prevent re-spinning
  phaseCompleted: {
    entry: boolean;
    finalist: boolean;
    reward: boolean;
  };
}

const REWARDS = [99, 199, 299, 399, 499, 599, 699, 799, 899];

const LOCAL_STORAGE_NAMES_KEY = "savedNames";
const LOCAL_STORAGE_STATE_KEY = "appGameState";

const defaultState: AppState = {
  phase: "entry",
  names: [],
  winners: [],
  finalist: "",
  reward: 0,
  maxFinalist: 0,
  phaseCompleted: {
    entry: false,
    finalist: false,
    reward: false,
  },
};

const Interface = () => {
  const [gameState, setGameState] = useState<AppState>(defaultState);
  const [showTransition, setShowTransition] = useState(false);
  const [InputValue, setInputValue] = useState<number>(0);
  const [openModel, setOpenModel] = useState<boolean>(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(LOCAL_STORAGE_STATE_KEY);
    const savedNames = localStorage.getItem(LOCAL_STORAGE_NAMES_KEY);

    if (savedState) {
      try {
        const parsedState: AppState = JSON.parse(savedState);
        setGameState(parsedState);
      } catch (e) {
        console.error("Failed to parse game state from localStorage", e);
        // Fallback to loading just names
        if (savedNames) {
          try {
            const parsed = JSON.parse(savedNames);
            if (Array.isArray(parsed)) {
              setGameState((prev) => ({
                ...prev,
                names: parsed.slice(0, 100),
              }));
            }
          } catch (e) {
            console.error("Failed to parse names from localStorage", e);
          }
        }
      }
    } else if (savedNames) {
      // Legacy support for old names-only storage
      try {
        const parsed = JSON.parse(savedNames);
        if (Array.isArray(parsed)) {
          setGameState((prev) => ({
            ...prev,
            names: parsed.slice(0, 100),
          }));
        }
      } catch (e) {
        console.error("Failed to parse names from localStorage", e);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_STATE_KEY, JSON.stringify(gameState));
    // Also keep names in the old key for backward compatibility
    localStorage.setItem(
      LOCAL_STORAGE_NAMES_KEY,
      JSON.stringify(gameState.names)
    );
  }, [gameState]);

  // Handler for bulk name entry
  const handleAddBulkNames = (bulkNames: string[]) => {
    setGameState((prev) => {
      const uniqueNames = bulkNames.filter(
        (name) => !prev.names.includes(name)
      );
      return {
        ...prev,
        names: [...prev.names, ...uniqueNames].slice(0, 100),
      };
    });
  };

  const handleAddName = (name: string) => {
    if (gameState.names.length < 100) {
      setGameState((prev) => ({
        ...prev,
        names: [...prev.names, name],
      }));
    }
  };

  const handleRemoveName = (index: number) => {
    setGameState((prev) => ({
      ...prev,
      names: prev.names.filter((_, i) => i !== index),
    }));
  };

  const handleClearNames = () => {
    setGameState((prev) => ({
      ...prev,
      names: [],
    }));
  };

  const handleWinnerSelected = (winner: string) => {
    setGameState((prev) => {
      const newWinners = [...prev.winners, winner];
      const isEntryComplete = newWinners.length === prev.maxFinalist;

      // Remove winner from names after delay
      setTimeout(() => {
        setGameState((current) => ({
          ...current,
          names: current.names.filter((name) => name !== winner),
          phaseCompleted: {
            ...current.phaseCompleted,
            entry: isEntryComplete,
          },
        }));
      }, 1000);

      return {
        ...prev,
        winners: newWinners,
      };
    });
  };

  const handleFinalistSelected = (selected: string) => {
    setTimeout(() => {
      setGameState((prev) => ({
        ...prev,
        finalist: selected,
        phase: "reward",
        phaseCompleted: {
          ...prev.phaseCompleted,
          finalist: true,
        },
      }));
    }, 1000);
  };

  const handleRewardSelected = (selectedReward: string) => {
    setTimeout(() => {
      setGameState((prev) => ({
        ...prev,
        reward: parseInt(selectedReward),
        phase: "congrats",
        phaseCompleted: {
          ...prev.phaseCompleted,
          reward: true,
        },
      }));
    }, 1000);
  };

  const handleNextRound = () => {
    // Reset all state for new round but preserve original names
    const freshState = {
      ...defaultState,
      names: gameState.names.length > 0 ? gameState.names : [], // Keep current names if available
    };
    setGameState(freshState);
    setShowTransition(false);
    setInputValue(0);
    setOpenModel(false);
  };

  // Completely reset everything including names
  const handleCompleteReset = () => {
  const completelyFreshState = { ...defaultState };
  setGameState(completelyFreshState);
  setShowTransition(false);
  setInputValue(0);
  setOpenModel(false);
  localStorage.removeItem(LOCAL_STORAGE_STATE_KEY);
  
  // NEW: Also clear reward tracking data
  localStorage.removeItem("wheelRewardTracking");
  localStorage.removeItem("wheelRewardHistory");
};


  const handleResetWinners = () => {
    setGameState((prev) => {
      const updatedState = {
        ...prev,
        winners: [], // Reset winners to an empty array
      };

      localStorage.setItem(
        LOCAL_STORAGE_STATE_KEY,
        JSON.stringify(updatedState)
      );
      return updatedState;
    });
  };

  // Manual transition to finalist phase
  const handleManualTransition = () => {
    setShowTransition(true);
    setTimeout(() => {
      setGameState((prev) => ({
        ...prev,
        phase: "finalist",
      }));
      setShowTransition(false);
    }, 500);
  };

  const handleModel = () => {
    setOpenModel(true);
  };

  const handleMaxFinalistChange = () => {
    setGameState((prev) => ({
      ...prev,
      maxFinalist: InputValue,
    }));
    setOpenModel(false);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mt-15 mb-2">
            NCC Spin Wheel Giveaway
          </h1>
          <p className="text-muted-foreground">
            {gameState.phase === "entry" &&
              "Add participants and spin to select winners"}
            {gameState.phase === "finalist" &&
              "Selecting the finalist from winners"}
            {gameState.phase === "reward" && "Spinning for the reward"}
            {gameState.phase === "congrats" && "Congratulations to the winner!"}
          </p>

          {/* Phase Indicator */}
          <div className="flex justify-center gap-2 mt-4">
            <Badge
              variant={gameState.phase === "entry" ? "default" : "secondary"}
            >
              Phase 1: Selection
            </Badge>
            <Badge
              variant={gameState.phase === "finalist" ? "default" : "secondary"}
            >
              Phase 2: Finalist
            </Badge>
            <Badge
              variant={gameState.phase === "reward" ? "default" : "secondary"}
            >
              Phase 3: Reward
            </Badge>
          </div>
        </div>

        {/* Phase 1: Entry and Selection */}
        {gameState.phase === "entry" && (
          <div
            className={cn(
              "grid grid-cols-1 lg:grid-cols-3 relative gap-6 transition-all duration-500",
              showTransition && "animate-slide-left"
            )}
          >
            {/* Left Panel - Name Entry */}
            <div className="lg:col-span-1 mr-15 mb-10">
              <NameEntry
                names={gameState.names}
                onAddName={handleAddName}
                onRemoveName={handleRemoveName}
                onClearAll={handleClearNames}
                onAddBulkNames={handleAddBulkNames}
              />
            </div>

            {/* Center Panel - Spin Wheel */}
            <div className="lg:col-span-1 flex flex-col items-center mr-5 mt-5 space-y-6">
              <SpinWheel
                items={gameState.names || []}
                onSpin={handleWinnerSelected}
                disabled={
                  gameState.names.length === 0 ||
                  gameState.winners.length >= gameState.maxFinalist ||
                  gameState.maxFinalist === 0 ||
                  gameState.phaseCompleted.entry
                }
                wheelType="entry"
                logoSrc="/ncc_logo.png"
              />
            </div>

            {/* Right Panel - Winners */}
            <div className="lg:col-span-1 relative ml-15">
              {!openModel ? (
                <div className="">
                  <WinnerDisplay
                    winners={gameState.winners}
                    title="Selected Members"
                    maxDisplay={gameState.maxFinalist}
                    handleModel={handleModel}
                    handleReset={handleResetWinners}
                  />
                </div>
              ) : (
                <Card className="w-full max-w-sm">
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-2 mb-3">
                      <Label className="font-semibold text-[15px]">
                        Enter the number of Finalist:
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder=""
                          onChange={(e) => {
                            setInputValue(Number(e.target.value));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleMaxFinalistChange();
                            }
                          }}
                          className="ring-0 focus-visible:ring-blue-500"
                        />
                        <Button
                          onClick={handleMaxFinalistChange}
                          className="px-3"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Manual transition button to next phase */}
              {gameState.winners.length === gameState.maxFinalist &&
                gameState.maxFinalist !== 0 && (
                  <button
                    onClick={handleManualTransition}
                    className={cn(
                      "absolute bottom-25 mt-3 px-8 ml-3 py-3 bg-primary text-primary-foreground rounded-lg font-bold shadow-soft transition-all duration-200",
                      "hover:bg-primary/90 hover:shadow-medium active:scale-95"
                    )}
                  >
                    Proceed to Finalist Selection
                  </button>
                )}
            </div>
          </div>
        )}

        {/* Phase 2 & 3: Finalist and Reward */}
        {(gameState.phase === "finalist" || gameState.phase === "reward") && (
          <div
            className={cn(
              "flex flex-col items-center space-y-8 transition-all duration-500",
              !showTransition && "animate-slide-in-right"
            )}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
              {/* Wheel 2 - Finalist Selection */}
              <div className="flex flex-col items-center space-y-4">
                <h3 className="text-xl pb-10 font-semibold text-foreground">
                  Finalist Selection
                </h3>
                <SpinWheel
                  items={gameState.winners || []}
                  onSpin={handleFinalistSelected}
                  size="md"
                  wheelType="finalist"
                  logoSrc="/ncc_logo.png"
                  disabled={
                    gameState.winners.length !== gameState.maxFinalist ||
                    gameState.phase !== "finalist" ||
                    gameState.phaseCompleted.finalist
                  }
                />
              </div>

              {/* Wheel 3 - Reward Selection */}
              <div className="flex flex-col items-center space-y-4">
                <h3 className="text-xl pb-10 font-semibold text-foreground">
                  Reward Wheel
                </h3>
                {gameState.phase === "reward" && gameState.finalist ? (
                  <div className="text-center space-y-4">
                    <SpinWheel
                      items={REWARDS.map((r) => r.toString()) || []}
                      onSpin={handleRewardSelected}
                      size="md"
                      wheelType="reward"
                      logoSrc="/ncc_logo.png"
                      disabled={
                        !gameState.finalist ||
                        gameState.phase !== "reward" ||
                        gameState.phaseCompleted.reward
                      }
                    />
                    {gameState.reward > 0 && (
                      <div className="text-center p-4 bg-blue-100 rounded-lg">
                        <p className="text-sm text-blue-800">
                          Reward Selected:
                        </p>
                        <p className="font-bold text-blue-900">
                          ₹{gameState.reward}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-[24rem] h-[24rem] bg-muted rounded-full flex items-center justify-center border-4 border-white shadow-strong">
                    <span className="text-muted-foreground">
                      {gameState.phase === "finalist"
                        ? "Waiting for finalist..."
                        : "Waiting for reward phase..."}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Phase 4: Congratulations */}
        {gameState.phase === "congrats" && (
          <div className="flex flex-col items-center space-y-6">
            <CongratsDisplay
              winner={gameState.finalist}
              reward={gameState.reward}
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
