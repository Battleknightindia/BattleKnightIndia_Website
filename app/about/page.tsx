import React from "react";
import Image from "next/image";
import Link from "next/link"; // Import Link
import { ArrowRight, Trophy, Users, Lightbulb } from "lucide-react"; // Icons for added visual flair

export default function AboutPage(){
  return (
    <main className="min-h-screen bg-black text-neutral-200">
      {/* Hero Section - A strong introduction */}
      <section className="relative w-full h-[90vh] md:h-[70vh] flex items-center justify-center text-center overflow-hidden">
        <div className="relative z-10 p-8 max-w-4xl mx-auto bg-black bg-opacity-70 rounded-lg shadow-2xl border border-emerald-700">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
            Forge Your Legacy with <span className="text-emerald-500">BattleKnights</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-300 mb-6 font-light">
            Empowering the future of mobile esports in India, one champion at a time.
          </p>
          <Link // Use Link instead of a
            href="/tournaments" // Link to your tournaments page
            className="inline-flex items-center px-8 py-3 bg-emerald-600 text-white font-semibold rounded-full hover:bg-emerald-700 transition-all duration-300 shadow-lg group"
          >
            Explore Tournaments
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* About BattleKnights - Detailed Narrative */}
      <section className="py-20 bg-neutral-950">
        <div className="container mx-auto px-6 lg:px-16 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-8 text-white text-center md:text-left">
              Who Are <span className="text-emerald-500">We?</span>
            </h2>
            <div className="text-sm text-neutral-400 space-y-6 leading-relaxed">
              <p>
                BATTLEKNIGHTS isn&apos;t just an esports organization; it&apos;s a movement to redefine competitive mobile gaming in India. With an unwavering focus on titles like MOBA Legends 5v5, we are dedicated to cultivating a robust ecosystem where talent thrives and legends are born.
              </p>
              <p>
                Our journey began under the visionary leadership of Reinhardt and his dedicated team. We didn&apos;t just enter the scene; we stormed it by orchestrating the groundbreaking North East Cup. This official LAN tournament, powered by Vizta, wasn&apos;t merely an event; it was a watershed moment that spotlighted the immense, untapped potential of players and teams across the Northeast, firmly embedding the region on India&apos;s esports map.
              </p>
              <p>
                Today, BattleKnights is scaling new heights. We&apos;re launching the National College Cup (NCC) – an ambitious, nationwide tournament series designed to unify college players from every corner of India. This initiative features rigorous online qualifiers leading to exhilarating LAN finals, providing an unparalleled platform for rising stars to accelerate their growth and shine on a grand stage.
              </p>
            </div>
          </div>

          {/* Image */}
          <div className="flex justify-center items-center">
            <Image
              src="/1.png" // Placeholder, consider using a high-impact image related to tournaments or community
              alt="BattleKnights Team"
              width={250}
              height={250}
              objectFit="contain"
              className="rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Our Purpose - Mission, Vision, Values with Icons */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-6 lg:px-16">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-white">
            Our <span className="text-emerald-500">Purpose</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Mission Card */}
            <div className="bg-neutral-900 p-8 rounded-xl shadow-xl border border-emerald-700 hover:shadow-2xl hover:border-emerald-600 transition-all duration-300 flex flex-col items-center text-center group">
              <Trophy className="h-16 w-16 text-emerald-500 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl md:text-2xl font-semibold mb-4 text-emerald-400">
                Our Mission
              </h3>
              <p className="text-sm md:text-base leading-relaxed text-neutral-400">
                To empower the next generation of Indian esports athletes by
                providing unparalleled competitive opportunities, comprehensive
                support, and a clear pathway to professional gaming.
              </p>
            </div>

            {/* Vision Card */}
            <div className="bg-neutral-900 p-8 rounded-xl shadow-xl border border-emerald-700 hover:shadow-2xl hover:border-emerald-600 transition-all duration-300 flex flex-col items-center text-center group">
              <Lightbulb className="h-16 w-16 text-emerald-500 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl md:text-2xl font-semibold mb-4 text-emerald-400">
                Our Vision
              </h3>
              <p className="text-sm md:text-base leading-relaxed text-neutral-300">
                To be the leading esports organization in India, recognized for
                our unwavering commitment to player development, integrity, and
                fostering a thriving, inclusive gaming community at every level.
              </p>
            </div>

            {/* Values Card */}
            <div className="bg-neutral-900 p-8 rounded-xl shadow-xl border border-emerald-700 hover:shadow-2xl hover:border-emerald-600 transition-all duration-300 flex flex-col items-center text-center group">
              <Users className="h-16 w-16 text-emerald-500 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-semibold mb-4 text-emerald-400">
                Our Values
              </h3>
              <ul className="list-none space-y-3 text-base leading-relaxed text-neutral-300">
                <li className="text-sm md:text-base">
                  <span className="font-semibold text-white">Excellence:</span> Striving for the highest standards in competition and organization.
                </li>
                <li className="text-sm md:text-base">
                  <span className="font-semibold text-white">Integrity:</span> Upholding fairness, transparency, and sportsmanship.
                </li>
                <li className="text-sm md:text-base">
                  <span className="font-semibold text-white">Community:</span> Building a supportive and engaging environment for all gamers.
                </li>
                <li className="text-sm md:text-base">
                  <span className="font-semibold text-white">Innovation:</span> Continuously exploring new ways to advance Indian esports.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach - Highlighting different event types */}
      <section className="py-20 bg-neutral-950">
        <div className="container mx-auto px-6 lg:px-16">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-white">
            Our <span className="text-emerald-500">Approach</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <div className="bg-neutral-900 p-8 rounded-xl shadow-xl border border-emerald-700 flex flex-col items-start group">
              <h3 className="text-xl md:text-2xl font-semibold mb-4 text-emerald-400">
                Grassroots Development
              </h3>
              <p className="text-sm md:text-base leading-relaxed text-neutral-300 mb-4">
                We believe in nurturing talent from the ground up. Our initiatives include widespread online qualifiers and state-level promotional matches, ensuring opportunities reach aspiring players across diverse regions.
              </p>
              <ArrowRight className="h-6 w-6 text-emerald-500 group-hover:translate-x-2 transition-transform" />
            </div>

            <div className="bg-neutral-900 p-8 rounded-xl shadow-xl border border-emerald-700 flex flex-col items-start group">
              <h3 className="text-xl md:text-2xl font-semibold mb-4 text-emerald-400">
                High-Stakes LAN Events
              </h3>
              <p className="text-sm md:text-base leading-relaxed text-neutral-300 mb-4">
                Experience the thrill of in-person competition. Our high-energy LAN finals provide players with the ultimate stage to showcase their skills and compete under the brightest spotlights.
              </p>
              <ArrowRight className="h-6 w-6 text-emerald-500 group-hover:translate-x-2 transition-transform" />
            </div>

            <div className="bg-neutral-900 p-8 rounded-xl shadow-xl border border-emerald-700 flex flex-col items-start group">
              <h3 className="text-xl md:text-2xl font-semibold mb-4 text-emerald-400">
                Unforgettable Experiences
              </h3>
              <p className="text-sm md:text-base leading-relaxed text-neutral-300 mb-4">
                Beyond competition, we engineer memorable events. From seamless organization to immersive fan experiences, BattleKnights ensures every event is a spectacle.
              </p>
              <ArrowRight className="h-6 w-6 text-emerald-500 group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action / Join Us */}
      <section className="py-20 bg-black text-center">
        <div className="container mx-auto px-6 lg:px-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-8 text-white">
            Your <span className="text-emerald-500">Battlefield</span> Awaits.
          </h2>
          <p className="text-sm md:text-xl text-neutral-300 mb-10 max-w-3xl mx-auto">
            Whether you&apos;re a seasoned player ready to claim glory or a passionate fan eager to witness legends in the making, BattleKnights is where champions are forged and legacies are born.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-6">
            <Link // Use Link instead of a
              href="/tournaments" // Link to your registration page
              className="flex text-md justify-center px-10 py-4 bg-emerald-600 text-white font-bold rounded-full hover:bg-emerald-700 transition-all duration-300 shadow-lg group"
            >
              Join a Tournament
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link // Use Link instead of a
              href="/contact" // Link to your contact page
              className="flex text-md justify-center px-10 py-4 border border-emerald-600 text-emerald-500 font-bold text-lg
               rounded-full hover:bg-emerald-600 hover:text-white transition-all duration-300 shadow-lg group"
            >
              Contact Us
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};