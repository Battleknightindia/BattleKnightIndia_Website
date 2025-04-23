"use client";

import FormCard from "./FormCard";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import TournamentFooter from "./Footer";

export function RegisterPage() {
  return (
    <motion.div
      className="w-full h-full overflow-y-auto no-scrollbar relative bg-[url('/10.webp')] bg-cover bg-[top-0.1px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Back Button */}
      <Link
        href="/"
        className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      {/* Background Images */}
      <div className="w-full">
        <Image
          src="/Frame 18.webp"
          alt="background"
          width={1000}
          height={1000}
          className="object-cover mx-[0.5px]"
        />
      </div>

      {/* Form Card Centered */}
      <div className="w-full flex flex-col justify-center items-center gap-2">
        <FormCard />
        <div className="w-full flex flex-col items-center gap-8 h-[320px] bg-[linear-gradient(to_bottom,#0A1C44_6%,#122D6B_27%,#111828_65%)]">
          <div className="flex justify-center pt-10 pl-4">
            <Image
              src="/ncc_logo.png"
              alt="Battle Knight Logo"
              width={170}
              height={70}
              className="h-20 md:h-16 w-26"
            />
            <div className="ml-4">
              <h3 className="text-[#FFF3A7] text-lg font-bold">
                NATIONAL COLLEGE CUP
              </h3>
              <p className="text-white text-sm font-light pt-3">
                The premier esport tournament for university student across the
                nation
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center text-[#2EE5E5]">
            <p className=" text-sm font-semibold">For more information</p>
            <p className=" text-sm font-semibold">
              Join our social media channels
            </p>
          </div>
          <div className="flex gap-5">
            <div className="bg-black w-[50px] h-[50px] flex items-center justify-center rounded-full">
              <a
                href="https://discord.com/invite/battleknight"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="/discord_1.png"
                  alt="Discord"
                  width={30}
                  height={30}
                />
              </a>
            </div>
            <div className="bg-black w-[50px] h-[50px] flex items-center justify-center rounded-full">
              <a
                href="https://www.facebook.com/battleknightindia"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="/whatsapp_1.png"
                  alt="Whatsapp"
                  width={30}
                  height={30}
                />
              </a>
            </div>
            <div className="bg-black w-[50px] h-[50px] flex items-center justify-center rounded-full">
              <a
                href="https://www.instagram.com/battleknightindia/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="/instagram_1.png"
                  alt="Instagram"
                  width={30}
                  height={30}
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
