"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { getInitials, getAvatarColor } from "@/lib/client/profileData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, LogOut, Settings, Diamond } from "lucide-react";
import { ProfileCard } from "@/components/profile/EditProfile";
import { ProfileView } from "@/components/profile/ViewProfile";
import { useProfile } from "@/hooks/useProfile";
import { User } from "@supabase/supabase-js";

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isForceCompleteOpen, setIsForceCompleteOpen] = useState<boolean>(false)
  const supabase = useMemo(() => createClient(), []); // Memoize supabase client
  const router = useRouter();
  const [isUser, setIsUser] = useState<User | null>(null)
  const [initials, setInitials] = useState<string>("??");
  const [avatarColor, setAvatarColor] = useState<string>("");
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isViewProfileOpen, setIsViewProfileOpen] = useState(false);
  const { profile, loading } = useProfile();
  const [hasCheckedProfile, setHasCheckedProfile] = useState(false);
  const searchParams = useSearchParams();
  const loginSuccessParam = searchParams.get("loginSuccess");

  useEffect(() => {
    const fetchUserAndAvatar = async () => {
      const { data: { user: fetchedUser }, error: authError } = await supabase.auth.getUser();
      setIsUser(fetchedUser); // Correctly set isUser state

      if (authError) {
        console.error("Error fetching user:", authError.message);
        setInitials("??");
        setAvatarColor("");
        return;
      }

      if (fetchedUser && profile?.ign) {
        try {
          const userInitials = await getInitials(profile.ign);
          const userAvatarColor = await getAvatarColor(profile.ign);
          setInitials(userInitials);
          setAvatarColor(userAvatarColor);
        } catch (error) {
          console.error("Error fetching avatar data:", error);
          setInitials("??"); // Reset on error
          setAvatarColor("");
        }
      } else if (!fetchedUser) {
        // User is not logged in, ensure avatar details are reset
        setInitials("??");
        setAvatarColor("");
      }
    };

    fetchUserAndAvatar();

    // Close mobile menu when route changes
    const handleRouteChange = () => {
      setIsMenuOpen(false);
    };

    window.addEventListener("popstate", handleRouteChange);
    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, [profile, supabase]); // Dependencies: profile for avatar, supabase client instance

  useEffect(() => {
    if (!loading && !hasCheckedProfile) {
      console.log(
        "Checking profile status. User logged in:", !!isUser,
        "Profile IGN:", profile?.ign,
        "Login success param:", loginSuccessParam
      );

      // Only force completion if user is logged in, profile is incomplete, AND it's a login success redirect
      if (isUser && !profile?.ign && loginSuccessParam === "true") {
        setIsEditProfileOpen(true);
        setIsForceCompleteOpen(true);
        console.log("User logged in, profile incomplete after login, opening edit profile.");
      } else if (isUser && profile?.ign) {
        console.log("User logged in, profile complete.");
      } else if (isUser && !profile?.ign) {
        console.log("User logged in, profile incomplete, but not a login redirect.");
      } else if (!isUser) {
        console.log("User not logged in. Not checking for profile completion.");
        // Explicitly ensure profile completion is not forced if user is not logged in
        setIsEditProfileOpen(false); 
        setIsForceCompleteOpen(false);
      }

      setHasCheckedProfile(true);
    }
  }, [isUser, loading, profile, hasCheckedProfile, loginSuccessParam, router]);

  useEffect(() => {
    if (isMenuOpen || isEditProfileOpen || isViewProfileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen, isEditProfileOpen, isViewProfileOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const openEditProfileCard = () => {
    setIsEditProfileOpen(true);
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };
  const openViewProfileCard = () => {
    setIsViewProfileOpen(true);
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  const NavLink = [
    { id: "1", label: "Home", link:"/" },
    { id: "2", label: "Tournaments", link:"/tournaments" },
    { id: "3", label: "Cosplay", link:"/cosplay" },
    { id: "4", label: "About", link:"/about" },
  ];

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
          {NavLink.map((item) => (
            <Link className={cn(
              "px-3 py-2 text-sm lg:text-base font-medium rounded-md transition-colors",
              "text-zinc-400 hover:text-white hover:bg-zinc-900"
            )} key={item.id} href={item.link}>{item.label}</Link>
          ))}
        </nav>

        {/* User Actions - Auth or Profile */}
        <div className="flex items-center gap-2">
          {isUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 ring-emerald-500 transition rounded-full overflow-hidden bg-zinc-100">
                  <AvatarImage
                    src={profile?.avatar_url || undefined}
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
                {profile?.is_volunteer && (
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
            {NavLink.map((item) => (
              <Link key={item.id} href={item.link} className={cn(
                "py-3 px-4 text-lg font-medium rounded-md transition-colors",
                "text-zinc-300 hover:text-white hover:bg-zinc-900"
              )}>{item.label}</Link>
            ))}
          </nav>

          {/* Mobile Auth Buttons */}
          {!isUser && (
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
          {isUser && (
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
              {/* Volunteer Dashboard Button (Mobile) */}
              {profile?.is_volunteer && (
                <Button
                  variant="outline"
                  className="w-full border-zinc-700 text-emerald-500 hover:bg-zinc-900"
                  onClick={() => {
                    router.push("/volunteers");
                    toggleMenu(); // Close menu after navigating
                  }}
                >
                  <Diamond className="mr-2 h-4 w-4" />
                  Your Dashboard
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full border-zinc-700 text-red-500 hover:bg-zinc-900 relative z-50"
                onClick={() => {
                  handleLogout();
                  toggleMenu();
                }}
              >
                <LogOut className="mr-2 h-4 w-4"/>
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
        forceCompletion={isForceCompleteOpen}
      />
      <ProfileView
        isOpen={isViewProfileOpen}
        onClose={() => setIsViewProfileOpen(false)}
      />
    </>
  );
}
