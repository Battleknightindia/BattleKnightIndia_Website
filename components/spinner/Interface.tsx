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
import { Plus } from "lucide-react";

type Phase = "entry" | "finalist" | "reward" | "congrats";

const REWARDS = [99, 199, 299, 399, 499, 599, 699, 799, 899];

const Interface = () => {
  const [phase, setPhase] = useState<Phase>("entry");
  const [names, setNames] = useState<string[]>([]);
  const [winners, setWinners] = useState<string[]>([]);
  const [finalist, setFinalist] = useState<string>("");
  const [reward, setReward] = useState<number>(0);
  const [showTransition, setShowTransition] = useState(false);
  const [maxFinalist, setMaxFinalist] = useState<number>(1);
  const [InputValue, setInputVaule] = useState<number>(0);
  const [spinable, setSpinable] = useState<boolean>(false); // Changed initial value to false
  const [openModel, setOpenModel] = useState<boolean>(false);

  // Handler for bulk name entry
  const handleAddBulkNames = (bulkNames: string[]) => {
    setNames((prev) => {
      const uniqueNames = bulkNames.filter((name) => !prev.includes(name));
      return [...prev, ...uniqueNames].slice(0, 100);
    });
  };

  const handleAddName = (name: string) => {
    if (names.length < 100) {
      setNames((prev) => [...prev, name]);
    }
  };

  const handleRemoveName = (index: number) => {
    setNames((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearNames = () => {
    setNames([]);
  };

  const handleWinnerSelected = (winner: string) => {
    setWinners((prev) => {
      const newWinners = [...prev, winner];
      // Show winner for 2s before removing from names
      setTimeout(() => {
        setNames((prevNames) => prevNames.filter((name) => name !== winner));
      }, 1000);
      return newWinners;
    });
  };

  const handleFinalistSelected = (selected: string) => {
    setTimeout(() => {
      setFinalist(selected);
      setPhase("reward");
    }, 1000);
  };

  const handleRewardSelected = (selectedReward: string) => {
    setTimeout(() => {
      setReward(parseInt(selectedReward));
      setPhase("congrats");
    }, 1000);
  };

  const handleNextRound = () => {
    // Reset all state for new round
    setPhase("entry");
    setNames([]);
    setWinners([]);
    setFinalist("");
    setReward(0);
    setShowTransition(false);
    setMaxFinalist(0); // Reset maxFinalist
    setSpinable(false); // Reset spinable to false
    setInputVaule(0); // Reset input value
  };

  // Manual transition to finalist phase
  const handleManualTransition = () => {
    setShowTransition(true);
    setTimeout(() => {
      setPhase("finalist");
      setShowTransition(false);
    }, 500); // Match animation duration
  };

  const handleModel = () => {
    setOpenModel(true);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            NCC Spin Wheel Giveaway
          </h1>
          <p className="text-muted-foreground">
            {phase === "entry" && "Add participants and spin to select winners"}
            {phase === "finalist" && "Selecting the finalist from 5 winners"}
            {phase === "reward" && "Spinning for the reward"}
            {phase === "congrats" && "Congratulations to the winner!"}
          </p>

          {/* Phase Indicator */}
          <div className="flex justify-center gap-2 mt-4">
            <Badge variant={phase === "entry" ? "default" : "secondary"}>
              Phase 1: Selection
            </Badge>
            <Badge variant={phase === "finalist" ? "default" : "secondary"}>
              Phase 2: Finalist
            </Badge>
            <Badge variant={phase === "reward" ? "default" : "secondary"}>
              Phase 3: Reward
            </Badge>
          </div>
        </div>

        {/* Phase 1: Entry and Selection */}
        {phase === "entry" && (
          <div
            className={cn(
              "grid grid-cols-1 lg:grid-cols-3 relative gap-6 transition-all duration-500",
              showTransition && "animate-slide-left"
            )}
          >
            {/* Left Panel - Name Entry */}
            <div className="lg:col-span-1 mr-15">
              <NameEntry
                names={names}
                onAddName={handleAddName}
                onRemoveName={handleRemoveName}
                onClearAll={handleClearNames}
                onAddBulkNames={handleAddBulkNames}
              />
              {/* Manual transition button to next phase */}
              {winners.length === maxFinalist && maxFinalist != 0 && (
                <button
                  onClick={handleManualTransition}
                  className={cn(
                    "mt-8 px-8 py-3 bg-primary text-primary-foreground rounded-lg font-bold shadow-soft transition-all duration-200",
                    "hover:bg-primary/90 hover:shadow-medium active:scale-95"
                  )}
                >
                  Proceed to Finalist Selection
                </button>
              )}
            </div>

            {/* Center Panel - Spin Wheel */}
            <div className="lg:col-span-1 flex flex-col items-center mr-5 space-y-6">
              <SpinWheel
                items={names || []}
                onSpin={handleWinnerSelected}
                disabled={names.length === 0 || winners.length >= maxFinalist || !spinable || maxFinalist === 0}
                wheelType="entry"
                logoSrc="/ncc_logo.png"
              />
            </div>

            {/* Right Panel - Winners */}
            <div className="lg:col-span-1 ml-15">
              {!openModel ? (
                <WinnerDisplay
                  winners={winners}
                  title="Selected Members"
                  maxDisplay={maxFinalist}
                  handleModel={handleModel}
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
                        onChange={(e)=>{setInputVaule(Number(e.target.value))}}
                        onKeyDown={
                          (e) => {
                            if (e.key === 'Enter') {
                              setMaxFinalist(InputValue)
                              setOpenModel(false)
                              setSpinable(true); // Changed to true to enable spinning
                            }
                          }
                        }
                        className="ring-0 focus-visible:ring-blue-500"
                      />
                      <Button onClick={()=>{setMaxFinalist(InputValue); setSpinable(true); setOpenModel(false)}} className="px-3"><Plus className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Phase 2 & 3: Finalist and Reward */}
        {(phase === "finalist" || phase === "reward") && (
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
                  items={winners || []}
                  onSpin={handleFinalistSelected}
                  size="md"
                  wheelType="finalist"
                  logoSrc="/ncc_logo.png"
                  disabled={winners.length !== maxFinalist || phase !== "finalist"}
                />
              </div>

              {/* Wheel 3 - Reward Selection */}
              <div className="flex flex-col items-center space-y-4">
                <h3 className="text-xl pb-10 font-semibold text-foreground">
                  Reward Wheel
                </h3>
                {phase === "reward" && finalist ? (
                  <div className="text-center space-y-4">
                    <SpinWheel
                      items={REWARDS.map((r) => r.toString()) || []}
                      onSpin={handleRewardSelected}
                      size="md"
                      wheelType="reward"
                      logoSrc="/ncc_logo.png"
                      disabled={!finalist || phase !== "reward"}
                    />
                  </div>
                ) : (
                  <div className="w-[24rem] h-[24rem] bg-muted rounded-full flex items-center justify-center border-4 border-white shadow-strong">
                    <span className="text-muted-foreground">
                      {phase === "finalist"
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
        {phase === "congrats" && (
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