"use client";

import React from "react";
import { ArrowRight } from "lucide-react"; // Keep if needed elsewhere, but not used in the current render
import Image from "next/image";

const AboutSection = () => {
  return (
    <section className="bg-black py-12 md:py-20 overflow-hidden"> {/* Adjusted padding and background */}
      <div className="container mx-auto px-6 lg:px-16"> {/* Centered container with responsive padding */}
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20"> {/* Flex container for text and image, stacked on mobile, side-by-side on md+ */}

          {/* Text Content */}
          <div className="md:w-1/2 flex flex-col justify-center"> {/* Text column, takes half width on md+ */}
            <h2 className="text-3xl md:text-5xl lg:text-5xl font-bold mb-6 text-center md:text-left"> {/* Responsive heading size, removed border */}
              About <span className="text-emerald-500">BATTLEKNIGHTS</span>
            </h2>
            {/* Removed the empty paragraph */}
            <div className="text-sm text-neutral-400 space-y-6 md:space-y-4 lg:space-y-6"> {/* Space between paragraphs */}
              <p>
                BattleKnights is a competitive esports organization forging the future of mobile gaming in India, with a sharp focus on MOBA Legends 5v5. Founded and led by Reinhardt and his team, BattleKnights stormed onto the scene by hosting the official LAN tournament – the North East Cup, powered by Vizta. This high-stakes event brought together some of the most skilled players and teams from across the region, placing Northeast India firmly on the esports map.
              </p>
              <p>
                Now, BattleKnights is leveling up its game.
              </p>
              <p>
                We are proud to announce our next major initiative: the National College Cup (NCC) — an ambitious tournament series aimed at uniting college players from all over India through rigorous online qualifiers culminating in thrilling LAN finals. Our core mission is to provide rising stars with the ultimate platform to shine, compete, and dramatically accelerate their growth in the esports arena.
              </p>
              <p>We don&apos;t just run events — we engineer unforgettable experiences. From widespread online qualifiers and state-level promotional matches to high-energy in-person LAN events, BattleKnights is dedicated to taking esports to the grassroots level and beyond, cultivating a vibrant and competitive ecosystem.</p>
              <p>
                Whether you&apos;re a seasoned player ready to claim glory or a passionate fan eager to witness legends in the making, this is your battlefield. Welcome to BattleKnights – where champions are forged and legends are born.
              </p>
            </div>
          </div>

          {/* Image */}
          <div className="md:w-1/2 flex justify-center items-center"> {/* Image column, takes half width on md+, centered */}
            <Image
              src="/1.png" // Make sure this path is correct
              alt="Battle Knights Logo"
              width={500} // Adjusted size slightly, can be refined
              height={300} // Adjusted size slightly, can be refined
              layout="intrinsic" // Good default for controlling size
              objectFit="contain"
              className="w-full max-w-sm md:max-w-md lg:max-w-lg h-auto" // Responsive image sizing
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;