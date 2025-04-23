import { Card, CardContent } from "@/components/ui/card"; 
import React from "react";
import { PARTNERS } from "@/lib/constant/home_page";

export function OurPartnersSection() { 
  return ( 
    <section className="w-full bg-black py-16 max-md:py-8"> 
      <div className="container mx-auto px-4 max-md:px-2"> 
        <div className="flex flex-col items-center justify-center mb-16 max-md:mb-8"> 
          <h2 className="font-bold text-3xl sm:text-4xl lg:text-5xl text-white text-center font-['Poppins-Bold',Helvetica] mb-4 sm:mb-6 max-md:text-2xl"> 
            Our Partners 
          </h2> 
          <p className="text-base sm:text-xl lg:text-2xl text-[#b7b7b7] text-center font-['Poppins-Regular',Helvetica] max-w-4xl max-md:text-sm"> 
            We're proud to work with leading brands and organizations in the gaming industry. 
          </p> 
        </div>

        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8">
          {PARTNERS.map((logoSrc, index) => (
            <Card
              key={index}
              className="w-[138px] h-[138px] rounded-full bg-white border border-gray-300 flex items-center justify-center overflow-hidden max-md:w-[80px] max-md:h-[80px]"
            >
              <CardContent className="p-0 flex items-center justify-center h-full">
                <img
                  src={logoSrc}
                  alt="Partner Logo"
                  className="w-[80px] h-[80px] object-contain max-md:w-[40px] max-md:h-[40px]"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  ); 
}