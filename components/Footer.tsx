'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';

const Footer = () => {
  return (
    <footer className="bottom-0 left-0 w-full">
      <div className="bg-[#0F0F0F] text-white px-6 py-4 flex flex-col md:flex-row md:justify-between md:items-center border-t border-zinc-800">
        <p className="text-center md:text-left text-sm font-medium">
          © 2023 Battle Knight India. All rights reserved.
        </p>
        <div className="flex justify-center md:justify-end items-center space-x-4 mt-2 md:pr-20 md:mt-0">
          <p className="text-sm">Follow us on:</p>
          <a href="#" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" className="text-white">
              <Image src="/svgs/instagram-svgrepo-com.svg" alt="Instagram" width={24} height={24} />
            </Button>
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" className="text-white">
              <Image src="/svgs/discord-icon-svgrepo-com.svg" alt="Discord" width={24} height={24} />
            </Button>
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" className="text-white">
              <Image src="/svgs/youtube-svgrepo-com.svg" alt="Youtube" width={24} height={24} />
            </Button>
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" className="text-white">
              <Image src="/svgs/whatsapp-svgrepo-com.svg" alt="Whatsapp" width={24} height={24} />
            </Button>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;