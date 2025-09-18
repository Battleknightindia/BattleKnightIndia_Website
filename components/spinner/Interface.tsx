// Interface.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SpinWheel } from "@/components/spinner/SpinWheel";
import { NameEntry } from "@/components/spinner/NameEntry";
import { WinnerDisplay } from "@/components/spinner/WinnerDisplay";
import { cn } from "@/lib/utils";
import { CongratsDisplay } from "./CongratsDisplay";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";

// ----------------- Types & Constants -----------------
type Phase = "entry" | "finalist" | "reward" | "congrats";

interface AppState {
  phase: Phase;
  names: string[];
  winners: string[];
  finalist: string;
  reward: number;
  maxFinalist: number;
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

const phases: Phase[] = ["entry", "finalist", "reward", "congrats"];

// ----------------- Phase Components -----------------
const EntryPhase = ({
  gameState,
  setGameState,
  openModel,
  setOpenModel,
  InputValue,
  setInputValue,
}: any) => {
  const handleAddBulkNames = (bulkNames: string[]) => {
    setGameState((prev: any) => {
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
      setGameState((prev: any) => ({
        ...prev,
        names: [...prev.names, name],
      }));
    }
  };

  const handleRemoveName = (index: number) => {
    setGameState((prev: any) => ({
      ...prev,
      names: prev.names.filter((_: any, i: number) => i !== index),
    }));
  };

  const handleClearNames = () => {
    setGameState((prev: any) => ({
      ...prev,
      names: [],
    }));
  };

  const handleModel = () => setOpenModel(true);

  const handleMaxFinalistChange = () => {
    setGameState((prev: any) => ({
      ...prev,
      maxFinalist: InputValue,
      phaseCompleted: {
        ...prev.phaseCompleted,
        entry: prev.winners.length === InputValue && InputValue > 0,
      },
    }));
    setOpenModel(false);
  };

  const handleResetWinners = () => {
    setGameState((prev: any) => {
      const updatedState = {
        ...prev,
        winners: [],
        phaseCompleted: { ...prev.phaseCompleted, entry: false },
      };
      localStorage.setItem(
        LOCAL_STORAGE_STATE_KEY,
        JSON.stringify(updatedState)
      );
      return updatedState;
    });
  };

  const handleRemoveWinner = (index: number) => {
    setGameState((prev: any) => {
      const removedWinner = prev.winners[index];
      const newWinners = prev.winners.filter(
        (_: any, i: number) => i !== index
      );
      const shouldAddBackToNames = !prev.names.includes(removedWinner);

      const updatedState = {
        ...prev,
        winners: newWinners,
        names: shouldAddBackToNames
          ? [...prev.names, removedWinner]
          : prev.names,
        phaseCompleted: {
          ...prev.phaseCompleted,
          entry: newWinners.length === prev.maxFinalist && prev.maxFinalist > 0,
        },
      };
      localStorage.setItem(
        LOCAL_STORAGE_STATE_KEY,
        JSON.stringify(updatedState)
      );
      return updatedState;
    });
  };

  return (
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{
        backgroundImage: "url('/hello_kitty2.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 relative pt-50 [@media(max-width:1366px)]:p-43] pl-5 gap-6">
        <div className="lg:col-span-1 mr-15 mb-10">
          <NameEntry
            names={gameState.names}
            onAddName={handleAddName}
            onRemoveName={handleRemoveName}
            onClearAll={handleClearNames}
            onAddBulkNames={handleAddBulkNames}
          />
        </div>

        <div className="lg:col-span-1 flex flex-col items-center mr-5 mt-5 space-y-6">
          <SpinWheel
            items={gameState.names || []}
            onSpin={(winner: string) => {
              setGameState((prev: any) => {
                const newWinners = [...prev.winners, winner];
                const isEntryComplete = newWinners.length === prev.maxFinalist;

                setTimeout(() => {
                  setGameState((current: any) => ({
                    ...current,
                    names: current.names.filter(
                      (name: string) => name !== winner
                    ),
                    phaseCompleted: {
                      ...current.phaseCompleted,
                      entry: isEntryComplete,
                    },
                  }));
                }, 1000);

                return { ...prev, winners: newWinners };
              });
            }}
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

        <div className="lg:col-span-1 relative ml-10">
          {!openModel ? (
            <WinnerDisplay
              winners={gameState.winners}
              title="Selected Members"
              maxDisplay={gameState.maxFinalist}
              handleModel={handleModel}
              handleReset={handleResetWinners}
              handleRemoveWinner={handleRemoveWinner}
            />
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
                      onChange={(e) => setInputValue(Number(e.target.value))}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleMaxFinalistChange()
                      }
                      className="ring-0 focus-visible:ring-blue-500"
                    />
                    <Button onClick={handleMaxFinalistChange} className="px-3">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {gameState.winners.length === gameState.maxFinalist &&
            gameState.maxFinalist !== 0 && (
              <button
                onClick={() => {
                  setGameState((prev: any) => ({ ...prev, phase: "finalist" }));
                }}
                className={cn(
                  "absolute bottom-20 left-13 px-8 ml-3 py-3 bg-primary text-primary-foreground rounded-lg font-bold shadow-soft transition-all duration-200",
                  "hover:bg-primary/90 hover:shadow-medium active:scale-95"
                )}
              >
                Proceed to Finalist Selection
              </button>
            )}
        </div>
      </div>
    </div>
  );
};

const FinalistRewardPhase = ({ gameState, setGameState }: any) => {
  const handleFinalistSelected = (selected: string) => {
    setTimeout(() => {
      setGameState((prev: any) => ({
        ...prev,
        finalist: selected,
        phase: "reward",
        phaseCompleted: { ...prev.phaseCompleted, finalist: true },
      }));
    }, 1000);
  };

  const handleRewardSelected = (selectedReward: string) => {
    setTimeout(() => {
      setGameState((prev: any) => ({
        ...prev,
        reward: parseInt(selectedReward),
        phase: "congrats",
        phaseCompleted: { ...prev.phaseCompleted, reward: true },
      }));
    }, 1000);
  };

  return (
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{
        backgroundImage: "url('/Frame 29.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col items-center space-y-8 pt-70">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* Finalist Selection */}
          <div className="flex flex-col items-center space-y-4">
            <SpinWheel
              items={gameState.winners || []}
              onSpin={handleFinalistSelected}
              size="md"
              wheelType="finalist"
              logoSrc="/ncc_logo.png"
              disabled={
                gameState.winners.length !== gameState.maxFinalist ||
                (gameState.phase !== "finalist" &&
                  gameState.phase !== "reward") ||
                gameState.phaseCompleted.finalist
              }
            />
          </div>

          {/* Reward Selection */}
          <div className="flex flex-col items-center space-y-4">
            <div className="text-center space-y-4">
              <SpinWheel
                items={REWARDS.map((r) => r.toString()) || []}
                onSpin={handleRewardSelected}
                size="md"
                wheelType="reward"
                logoSrc="/ncc_logo.png"
                previousWinner={gameState.finalist}
                disabled={
                  gameState.phase === "finalist" || // 👈 This ensures it's disabled during finalist phase
                  !gameState.finalist ||
                  gameState.phase !== "reward" ||
                  gameState.phaseCompleted.reward
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CongratsPhase = ({ gameState, setGameState }: any) => {
  const handleNextRound = () => {
    const freshState = {
      ...defaultState,
      names: gameState.names.length > 0 ? gameState.names : [],
    };
    setGameState(freshState);
  };

  return (
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{
        backgroundImage: "url('/Frame 34.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-screen">
        <CongratsDisplay
          winner={gameState.finalist}
          reward={gameState.reward}
          onNextRound={handleNextRound}
        />
      </div>
    </div>
  );
};

// ----------------- Main Interface -----------------
const Interface = () => {
  const [gameState, setGameState] = useState<AppState>(defaultState);
  const [InputValue, setInputValue] = useState<number>(0);
  const [openModel, setOpenModel] = useState<boolean>(false);

  // preload images
  useEffect(() => {
    ["/hello_kitty2.png", "/Frame 29.png"].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // load saved state
  useEffect(() => {
    const savedState = localStorage.getItem(LOCAL_STORAGE_STATE_KEY);
    const savedNames = localStorage.getItem(LOCAL_STORAGE_NAMES_KEY);

    if (savedState) {
      try {
        setGameState(JSON.parse(savedState));
      } catch {
        console.error("Failed to parse game state");
      }
    } else if (savedNames) {
      try {
        const parsed = JSON.parse(savedNames);
        if (Array.isArray(parsed)) {
          setGameState((prev) => ({ ...prev, names: parsed.slice(0, 100) }));
        }
      } catch {
        console.error("Failed to parse names");
      }
    }
  }, []);

  // save state
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_STATE_KEY, JSON.stringify(gameState));
    localStorage.setItem(
      LOCAL_STORAGE_NAMES_KEY,
      JSON.stringify(gameState.names)
    );
  }, [gameState]);

  // treat finalist & reward as the same "phase index"
  const phaseGroups: Phase[][] = [
    ["entry"],
    ["finalist", "reward"], // grouped
    ["congrats"],
  ];

  // find the group index of current phase
  const currentIndex = phaseGroups.findIndex((group) =>
    group.includes(gameState.phase)
  );

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {phaseGroups.map((group, index) => {
        const offset = (index - currentIndex) * 100;

        return (
          <motion.div
            key={group.join("-")}
            initial={false}
            animate={{ x: `${offset}%` }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            {group.includes("entry") && (
              <EntryPhase
                gameState={gameState}
                setGameState={setGameState}
                openModel={openModel}
                setOpenModel={setOpenModel}
                InputValue={InputValue}
                setInputValue={setInputValue}
              />
            )}

            {group.includes("finalist") && (
              <FinalistRewardPhase
                key={gameState.phase} // 🔑 forces remount when switching
                gameState={gameState}
                setGameState={setGameState}
              />
            )}

            {group.includes("congrats") && (
              <CongratsPhase
                key={gameState.phase} // 🔑 forces remount when switching 
                gameState={gameState}
                setGameState={setGameState}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default Interface;
