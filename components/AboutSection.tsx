"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { ABOUT_DATA } from "@/lib/constant/home_page";
import Image from "next/image"; // Import the Image component

const AboutSection = () => {
  return (
    <section className="flex overflow-hidden flex-col justify-center items-end px-16 py-20 bg-black shadow-2xl max-md:px-5 max-md:py-10">
      <div className="w-full max-w-[1589px] max-md:max-w-full">
        <div className="flex gap-5 max-md:flex-col">
          <div className="w-6/12 max-md:w-full">
            <section className="flex flex-col mt-24 w-full text-2xl font-medium text-white max-md:mt-10 max-md:text-base">
              <h2 className="max-md:self-center lg:self-start text-5xl font-bold text-center border border-black border-solid max-md:text-2xl">
                {ABOUT_DATA.title}
              </h2>
              <p className="mt-6 text-xl text-neutral-400 max-md:text-sm">
                {ABOUT_DATA.description}
              </p>
              <p className="mt-9 mr-9 text-xl text-neutral-400 max-md:mr-2.5 max-md:text-sm">
                Founded by professional players and esports enthusiasts, we understand what makes a great tournament experience. Our platform is designed to make competitive play accessible to everyone, from amateurs to professionals.
              </p>
              {[ABOUT_DATA.mission, ABOUT_DATA.values].map((item, index) => (
                <div key={index} className="mt-6">
                  <div className="flex gap-2 self-start font-semibold">
                    {/*
                      Ensure the path in item.icon is correct and the image file
                      exists in your project's public directory.
                      e.g., if item.icon is '/icons/my-icon.svg', the file should be at public/icons/my-icon.svg
                    */}
                    <Image
                      src={item.icon}
                      className="object-contain shrink-0 self-start rounded-md aspect-[1.03] w-[35px] max-md:w-[25px]"
                      alt={item.title}
                      width={35} // Added intrinsic width
                      height={35} // Added intrinsic height
                    />
                    <h3 className="basis-auto max-md:text-base">{item.title}</h3>
                  </div>
                  <p className="mt-2.5 mr-6 ml-11 text-base text-neutral-400 max-md:mr-2.5 max-md:text-sm max-md:ml-8">
                    {item.description}
                  </p>
                </div>
              ))}
              <button className="flex overflow-hidden gap-5 max-md:self-center self-start py-1 pr-6 pl-14 mt-12 text-center bg-emerald-500 rounded-md border border-emerald-900 border-solid shadow-2xl text-neutral-950 max-md:px-5 max-md:mt-10 max-md:text-sm">
                <span className="grow">Learn More About Us</span>
                <ArrowRight className="my-1.5 w-6 h-6 max-md:w-4 max-md:h-4" />
              </button>
            </section>
          </div>
          <div className="ml-5 w-6/12 max-md:ml-0 max-md:w-full">
            {/* Assuming this div is intended as a placeholder or background image */}
            {/* If it should display an image, replace this div with <Image /> */}
            <div className="flex shrink-0 mx-auto max-w-full bg-white rounded-2xl h-[788px] w-[788px] max-md:h-[300px] max-md:w-[500px]" aria-label="Battle Knight image" role="img" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
