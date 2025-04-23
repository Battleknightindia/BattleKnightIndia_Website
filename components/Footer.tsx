'use client';

import { Instagram, Facebook, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer = () => {
  return (
    <footer className="bottom-0 left-0 w-full">
      <div className="bg-[#0F0F0F] text-white px-6 py-4 flex flex-col md:flex-row md:justify-between md:items-center border-t border-zinc-800">
        <p className="text-center md:text-left text-sm font-medium">
          © 2023 Battle Knight India. All rights reserved.
        </p>
        <div className="flex justify-center md:justify-end items-center space-x-4 mt-2 md:mt-0">
          <p className="text-sm">Follow us on:</p>
          <a href="https://www.instagram.com/battleknightindia/" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" className="text-white hover:text-emerald-400 hover:bg-zinc-950">
              <Instagram className="h-5 w-5" />
            </Button>
          </a>
          <a href="https://www.facebook.com/BattleKnightIndia/" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" className="text-white hover:text-emerald-400 hover:bg-zinc-950">
              <Facebook className="h-5 w-5" />
            </Button>
          </a>
          <a href="https://www.youtube.com/@battleknightindia" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" className="text-white hover:text-emerald-400 hover:bg-zinc-950">
              <Youtube className="h-5 w-5" />
            </Button>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;