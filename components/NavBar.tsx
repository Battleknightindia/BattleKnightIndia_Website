"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { getInitials, getAvatarColor, getAvatarUrl } from "@/lib/data/profile_data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, LogOut, Settings, Diamond, User as Users } from "lucide-react";
import { ProfileCard } from "./EditProfile";
import { ProfileView } from "./ViewProfile";
import { useProfile } from "@/hooks/useProfile";
import { isAdmin, isVolunteer } from "@/utils/volunteer_helper";

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();
  const router = useRouter();
  const [initials, setInitials] = useState<string>("??");
  const [avatarColor, setAvatarColor] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
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

    window.addEventListener("popstate", handleRouteChange);
    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, [supabase.auth]);

  useEffect(() => {
    if (!loading && !hasCheckedProfile) {
      console.log(
        "Checking profile status after load. Login success param:",
        loginSuccessParam
      );

      if (!profile?.ign && loginSuccessParam === "true") {
        setIsEditProfileOpen(true);
        console.log("Profile incomplete after login, opening edit profile.");
      } else if (profile?.ign) {
        console.log("Profile complete.");
      } else {
        console.log("Profile incomplete, but not a login redirect.");
      }

      setHasCheckedProfile(true);
    }
  }, [loading, profile, hasCheckedProfile, loginSuccessParam]);

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
  const Nav = [
    { id:"1",name:"Home", link:"/"},
    { id:"2",name:"Tournament", link:"/tournaments"},
    {id:"3", name:"Cosplay Gallery", link:"/cosplay"},
    { id:"4",name:"About", link:"/about"}
  ]

  const sectionNav = [
    { id: "home", label: "Home" },
    { id: "featured", label: "Featured Tournament" },
    { id: "northeastcup", label: "Past Work" },
    { id: "cosplay", label: "Cosplay Gallery" },
    { id: "about", label: "About" },
    { id: "partners", label: "Sponsors" },
  ];

  const handleNavItemClick = (id: string) => {
    if (pathname !== "/") {
      router.push("/");
      setTimeout(() => {
        scrollToSection(id);
      }, 1005); // Adjust timeout as needed for navigation to complete
    } else {
      scrollToSection(id);
    }
  };

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
          {Nav.map((nav) =>(
            <Link className={cn(
                "px-3 py-2 text-sm lg:text-base font-medium rounded-md transition-colors",
                "text-zinc-400 hover:text-white hover:bg-zinc-900"
              )} key={nav.id} href={nav.link}>{nav.name}</Link>
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
                {isAdmin(profile) && (
                  <DropdownMenuItem
                    onClick={() => router.push("/volunteers/dashboard")}
                    className="cursor-pointer text-emerald-500 hover:bg-zinc-900"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Admin Dashboard
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
            {sectionNav.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => {
                  handleNavItemClick(section.id);
                  setIsMenuOpen(false);
                }}
                className={cn(
                  "py-3 px-4 text-lg font-medium rounded-md transition-colors",
                  "text-zinc-300 hover:text-white hover:bg-zinc-900"
                )}
                style={{ transition: "all 0.2s" }}
              >
                {section.label}
              </button>
            ))}
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
              {/* Volunteer Dashboard Button (Mobile) */}
              {isVolunteer(profile) && (
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
      />
      <ProfileView
        isOpen={isViewProfileOpen}
        onClose={() => setIsViewProfileOpen(false)}
      />
    </>
  );
}

