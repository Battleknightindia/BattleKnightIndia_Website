"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button"; // Assuming this is a shadcn/ui button

const Footer = () => {
  const currentYear = new Date().getFullYear(); // Get the current year dynamically

  return (
    <footer className="bottom-0 left-0 w-full bg-[#0F0F0F] text-white">
      <div className="container mx-auto px-6 py-6 border-t border-zinc-800 grid grid-cols-1 md:grid-cols-3 gap-y-6 items-center">

        {/* Copyright Section */}
        <div className="text-center md:text-left text-sm font-medium">
          <p>&copy; {currentYear} Battle Knight India. All rights reserved.</p>
        </div>

        {/* Social Media Section */}
        <div className="flex flex-col items-center md:items-center space-y-2">
           <p className="text-sm mb-2">Follow us on:</p>
           <div className="flex justify-center md:justify-center items-center space-x-4">
             {/* Instagram */}
             <a href="https://www.instagram.com/battleknightsindia?igsh=aXo0eGV4M244emdx" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram">
               <Button variant="ghost" size="icon" className="text-white hover:bg-zinc-800 transition-colors">
                 <Image
                   src="/svgs/instagram-svgrepo-com.svg"
                   alt="" // alt text can be empty if aria-label is used and the image is decorative
                   width={24}
                   height={24}
                 />
               </Button>
             </a>

             {/* Discord */}
             <a href="https://discord.gg/UW4YWvR5QR" target="_blank" rel="noopener noreferrer" aria-label="Join us on Discord">
               <Button variant="ghost" size="icon" className="text-white hover:bg-zinc-800 transition-colors">
                 <Image
                   src="/svgs/discord-icon-svgrepo-com.svg" // Corrected path separator
                   alt="" // alt text can be empty if aria-label is used and the image is decorative
                   width={24}
                   height={24}
                 />
               </Button>
             </a>

             {/* Youtube */}
             <a href="https://youtube.com/@battleknightsindia?si=2xhxJC4rFCdzWyJE" target="_blank" rel="noopener noreferrer" aria-label="Subscribe to our Youtube channel">
               <Button variant="ghost" size="icon" className="text-white hover:bg-zinc-800 transition-colors">
                 <Image
                   src="/svgs/youtube-svgrepo-com.svg"
                   alt="" // alt text can be empty if aria-label is used and the image is decorative
                   width={24}
                   height={24}
                 />
               </Button>
             </a>

             {/* Whatsapp */}
             <a href="https://chat.whatsapp.com/K5BXRXVVy1N7lgCQSEzXey" target="_blank" rel="noopener noreferrer" aria-label="Contact us on Whatsapp">
               <Button variant="ghost" size="icon" className="text-white hover:bg-zinc-800 transition-colors">
                 <Image
                   src="/svgs/whatsapp-svgrepo-com.svg"
                   alt="" // alt text can be empty if aria-label is used and the image is decorative
                   width={24}
                   height={24}
                 />
               </Button>
             </a>
           </div>
        </div>

          {/* Developer Info Section */}
        <div className="flex flex-col gap-2 items-center md:items-center text-center md:text-right">
          <a href="#">
          <Image
            src="/logo/nexelio_logo.jpg"
            alt="Nexelio logo" // More descriptive alt text
            width={50} // Slightly increased size
            height={50} // Slightly increased size
            className="rounded-full border border-zinc-700" // Added a subtle border
          />
          </a>
          <p className="text-sm mb-2">Developed by Nexelios</p> {/* Added margin bottom */}
        </div>
        </div>
    </footer>
  );
};

export default Footer;