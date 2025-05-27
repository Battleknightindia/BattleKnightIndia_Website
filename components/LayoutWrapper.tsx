'use client'

import { usePathname } from "next/navigation";
import NavBar from "./NavBar";
import { Toaster } from "@/components/ui/toaster";
import Footer from "./Footer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const hideNavBar = pathname === "/register" || pathname === "/volunteers" || pathname === "/admin";
    
    return (
        <div className="min-h-screen flex flex-col">
            {!hideNavBar && <NavBar />}
            <div className="flex-1">
                {children}
            </div>
            <Toaster />
            {!hideNavBar && <Footer/>}
        </div>
    );
}