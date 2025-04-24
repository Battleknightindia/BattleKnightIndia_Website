'use client';
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { GameButton } from "@/components/ui/game-button";


const HeroSection = () => {
    const heroRef = useRef<HTMLDivElement>(null)

    return (
        <div>
            {/* Hero Section */}
            <section
                ref={heroRef}
                className="relative min-h-[100svh] flex items-center justify-center overflow-hidden"
            >

                {/* Dark overlays */}
                <div className="absolute inset-0 bg-black/80 z-[2]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-[3]" />

                {/* Content */}
                <div className="relative z-[5] text-center px-4 max-w-md sm:max-w-xl lg:max-w-3xl mx-auto">
                {/* Logo */}
                <div className="mb-6 flex justify-center">
                    <Image
                        src={"/1.png"}
                        alt="Logo"
                        width={200}
                        height={200}
                    />
                </div>

                {/* Title */}
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black leading-tight tracking-tight">
                    <span className="relative text-white">BATTLE</span>{" "}
                    <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent drop-shadow-glow">
                        KNIGHT
                    </span>{" "}
                    <span className="bg-gradient-to-r pr-0.5 from-amber-500 to-yellow-600 bg-clip-text text-transparent drop-shadow-glow">
                        INDIA
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="mt-4 text-zinc-500 text-sm sm:text-base lg:text-xl font-medium leading-relaxed">
                The ultimate MOBA Legends 5v5 tournament platform. Compete, win, and become a legend.
                </p>

                {/* Buttons */}
                <div className="flex mt-6 flex-col gap-3 items-center sm:flex-row sm:justify-center w-full">
                    <GameButton
                        size="default"
                        className="w-72 sm:w-auto text-black font-semibold px-6 py-3 sm:py-4 shadow-[0_0_15px_rgba(16,185,129,0.5)] hover:shadow-[0_0_25px_rgba(16,185,129,0.8)] hover:scale-105 transition-all"
                        asChild
                    >
                        <Link href="/register" className="flex items-center justify-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            Register Now
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </GameButton>

                    {/* <GameButton
                        size="default"
                        variant="outline"
                        className="w-72 sm:w-auto border-white/30 hover:border-emerald-400 hover:bg-emerald-400/10 backdrop-blur-sm px-6 py-3 sm:py-4 hover:scale-105 transition-all"
                        asChild
                    >
                        <Link href="#featured-tournament">View Tournament</Link>
                    </GameButton> */}
      </div>
    </div>
  </section>
    </div>
  )
}

export default HeroSection