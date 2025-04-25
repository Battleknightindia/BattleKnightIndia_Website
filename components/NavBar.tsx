"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { getInitials, getAvatarColor, getAvatarUrl } from "@/lib/profileData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, LogOut, Settings, Diamond } from "lucide-react";
import { ProfileCard } from "./EditProfile";
import { ProfileView } from "./ViewProfile";
import { useProfile } from "@/hooks/useProfile";
import { isVolunteer } from "@/utils/volunteer_helper";

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();
  const router = useRouter();
  const [initials, setInitials] = useState<string>("??");
  const [avatarColor, setAvatarColor] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  // Removed isFirstLogin state
  const [isViewProfileOpen, setIsViewProfileOpen] = useState(false);
  const { profile, loading } = useProfile();
  const [hasCheckedProfile, setHasCheckedProfile] = useState(false);
  const searchParams = useSearchParams();
  const loginSuccessParam = searchParams.get("loginSuccess");
  const pathname = usePathname();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) console.error(error);
      setUser(user);

      // If user is logged in, fetch avatar data
      if (user) {
        try {
          const userInitials = await getInitials();
          const userAvatarColor = await getAvatarColor();
          const userAvatarUrl = await getAvatarUrl();

          setInitials(userInitials);
          setAvatarColor(userAvatarColor);
          setAvatarUrl(userAvatarUrl);
        } catch (error) {
          console.error("Error fetching avatar data:", error);
        }
      }
    };

    getUser();

    // Close mobile menu when route changes
    const handleRouteChange = () => {
      setIsMenuOpen(false);
    };

    // Use router.events if available in your Next.js version,
    // otherwise window.addEventListener('popstate') is a fallback.
    // popstate is generally fine for back/forward navigation, but not all route changes.
    // For a more robust solution in Next.js 13+, you might use router.events (requires enabling in next.config.js)
    // or rely on the fact that the component might remount/re-render on route changes.
    // Sticking to popstate for now as it was in your original code.
    window.addEventListener("popstate", handleRouteChange);
    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, [supabase.auth]); // Added supabase.auth as a dependency

  // Only open ProfileCard on first login after profile is loaded and only once
  useEffect(() => {
    // This effect should run after loading finishes and only if we haven't checked profile status during this mount.
    if (!loading && !hasCheckedProfile) {
      console.log(
        "Checking profile status after load. Login success param:",
        loginSuccessParam
      ); // Debugging line

      // Check if profile is incomplete AND the URL indicates a successful login redirect
      if (!profile?.ign && loginSuccessParam === "true") {
        setIsEditProfileOpen(true);
        console.log("Profile incomplete after login, opening edit profile."); // Debugging line
      } else if (profile?.ign) {
        console.log("Profile complete."); // Debugging line
      } else {
        console.log("Profile incomplete, but not a login redirect."); // Debugging line
      }

      // In all cases after the initial load/check logic runs,
      // mark that we have performed this check for this mount.
      // This prevents the popup from re-opening if the component re-renders later.
      setHasCheckedProfile(true);
    }

    // Dependencies: Re-run this effect if loading status, profile data,
    // the hasCheckedProfile flag, or the loginSuccess query parameter changes.
  }, [loading, profile, hasCheckedProfile, loginSuccessParam]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen || isEditProfileOpen || isViewProfileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen, isEditProfileOpen, isViewProfileOpen]); // Combined scroll effects and added isViewProfileOpen

  // Removed the separate useEffect for isEditProfileOpen scroll

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const openEditProfileCard = () => {
    setIsEditProfileOpen(true);
    // If the menu is open (on mobile), close it
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };
  const openViewProfileCard = () => {
    setIsViewProfileOpen(true);
    // If the menu is open (on mobile), close it
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  // Removed isActive function
  // Removed navLinks array

  // Section navigation for scrolling
  const sectionNav = [
    { id: "home", label: "Home" },
    { id: "featured", label: "Featured Tournament" },
    { id: "northeastcup", label: "Past Work" },
    { id: "cosplay", label: "Cosplay Gallery" },
    { id: "about", label: "About" },
    { id: "partners", label: "Sponsors" },
  ];

  // Smooth scroll to section by ID
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false); // close mobile menu if open
    }
  };

  return (
    <>
      {/* Fixed header - optimized for mobile first */}
      <header className="fixed w-full top-0 left-0 z-50 bg-zinc-950 border-b border-zinc-800 px-4 py-3 md:py-4 flex items-center justify-between">
        {/* Logo - smaller on mobile, larger on desktop */}
        <Link href="/" className="relative z-20">
          <Image
            src="/5.png"
            alt="logo"
            width={120}
            height={40}
            className="h-8 w-auto md:h-10"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {/* Section scroll nav */}
          {sectionNav.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollToSection(section.id)}
              className={cn(
                "px-3 py-2 text-sm lg:text-base font-medium rounded-md transition-colors",
                // Active state if section is in view (optional: can add logic)
                "text-zinc-400 hover:text-white hover:bg-zinc-900"
              )}
              style={{ transition: "all 0.2s" }}
            >
              {section.label}
            </button>
          ))}
        </nav>

        {/* User Actions - Auth or Profile */}
        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 ring-emerald-500 transition rounded-full overflow-hidden bg-zinc-100">
                  <AvatarImage
                    src={avatarUrl || undefined}
                    alt={profile?.ign || "User"}
                    className="h-full w-full object-cover"
                  />
                  <AvatarFallback
                    className={`text-zinc-950 text-xs bg-gradient-to-br ${avatarColor}`}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-48 mt-1 bg-zinc-950 border border-zinc-800 rounded-md shadow-lg"
              >
                <DropdownMenuItem
                  onClick={openEditProfileCard}
                  className="cursor-pointer text-white hover:bg-zinc-900"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={openViewProfileCard}
                  className="cursor-pointer text-white hover:bg-zinc-900"
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  View Profile
                </DropdownMenuItem>
                {isVolunteer(profile) && (
                  <DropdownMenuItem
                    onClick={() => router.push("/volunteers/dashboard")}
                    className="cursor-pointer text-emerald-500 hover:bg-zinc-900"
                  >
                    <Diamond className="mr-2 h-4 w-4" />
                    Your Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-500 hover:bg-zinc-900"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-sm font-medium hover:bg-zinc-900 text-white hover:text-emerald-400"
                  size="sm"
                >
                  Login
                </Button>
              </Link>
              {/* <Link href="/signup">
                <Button
                  className="text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-black"
                  size="sm"
                >
                  Sign Up
                </Button>
              </Link> */}
            </div>
          )}

          <button
            className="md:hidden relative z-20 p-2 -mr-2 text-white"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <div className="flex flex-col justify-center items-center w-7 h-7 relative">
              {/* First bar */}
              <div
                className={`bg-white h-0.5 w-5.5 rounded-full absolute transition-all duration-300 ease-in-out ${
                  isMenuOpen ? "rotate-45" : "translate-y-[-6px]"
                }`}
              />

              {/* Middle bar */}
              <div
                className={`bg-white h-0.5 w-5.5 rounded-full absolute transition-all duration-200 ease-in-out ${
                  isMenuOpen ? "opacity-0" : "opacity-100"
                }`}
              />

              {/* Last bar */}
              <div
                className={`bg-white h-0.5 w-5.5 rounded-full absolute transition-all duration-300 ease-in-out ${
                  isMenuOpen ? "-rotate-45" : "translate-y-[6px]"
                }`}
              />
            </div>
          </button>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-zinc-950/95 backdrop-blur-sm z-40 transition-all duration-300 md:hidden",
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="flex flex-col h-full pt-20 pb-6 px-6">
          {/* Mobile Navigation Links */}
          <nav className="flex flex-col space-y-4 mb-8">
            {/* Section scroll nav for mobile */}
            {sectionNav.map((section) => {
              if (section.id === "home") {
                if (pathname !== "/") { // Use the variable obtained from the hook
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        router.push("/");
                      }}
                      className={cn(
                        "py-3 px-4 text-lg font-medium rounded-md transition-colors",
                        "text-zinc-300 hover:text-white hover:bg-zinc-900"
                      )}
                      style={{ transition: "all 0.2s" }}
                    >
                      {section.label}
                    </button>
                  );
                }
              }
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  className={cn(
                    "py-3 px-4 text-lg font-medium rounded-md transition-colors",
                    "text-zinc-300 hover:text-white hover:bg-zinc-900"
                  )}
                  style={{ transition: "all 0.2s" }}
                >
                  {section.label}
                </button>
              );
            })}
          </nav>

          {/* Mobile Auth Buttons */}
          {!user && (
            <Link href="/login" className="pt-10">
              <Button
                variant="outline"
                className="w-full p border-zinc-700 bg-emerald-500 text-white hover:bg-emerald-600"
                onClick={toggleMenu}
              >
                Login
              </Button>
            </Link>
          )}
          {/* Mobile User Actions */}
          {user && (
            <div className="flex flex-col space-y-3 mt-auto">
              <Button
                variant="outline"
                className="w-full border-none bg-blue-500 text-white"
                onClick={() => {
                  openEditProfileCard();
                  toggleMenu();
                }}
              >
                <Settings className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
              <Button
                variant="outline"
                className="w-full border-zinc-700 text-white bg-emerald-500 hover:bg-zinc-900"
                onClick={() => {
                  openViewProfileCard();
                  toggleMenu();
                }}
              >
                <UserIcon className="mr-2 h-4 w-4" />
                View Profile
              </Button>
              {isVolunteer(profile) && (
                <Button
                  variant="outline"
                  className="w-full border-zinc-700 text-emerald-500 hover:bg-zinc-900"
                  onClick={() => {
                    router.push("/volunteers/dashboard");
                    toggleMenu();
                  }}
                >
                  <Diamond className="mr-2 h-4 w-4" />
                  Your Dashboard
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full border-zinc-700 text-red-500 hover:bg-zinc-900"
                onClick={() => {
                  handleLogout();
                  toggleMenu();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add the ProfileCard component */}
      <ProfileCard
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />
      <ProfileView
        isOpen={isViewProfileOpen}
        onClose={() => setIsViewProfileOpen(false)}
      />
    </>
  );
}
