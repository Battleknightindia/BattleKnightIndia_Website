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
  const [isViewProfileOpen, setIsViewProfileOpen] = useState(false);
  const { profile, loading } = useProfile();
  const [hasCheckedProfile, setHasCheckedProfile] = useState(false);
  const searchParams = useSearchParams();
  const loginSuccessParam = searchParams.get("loginSuccess");
  const pathname = usePathname();

  // Effect to get the current user and their profile avatar data
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) console.error("Error fetching user:", error);
      setUser(user);

      // If user is logged in, fetch avatar data (initials, color, URL)
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

    // Event listener to close the mobile menu when browser history changes (e.g., back/forward buttons)
    const handleRouteChange = () => {
      setIsMenuOpen(false);
    };

    window.addEventListener("popstate", handleRouteChange);
    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, [supabase.auth]); // Re-run when Supabase auth state might change

  // Effect to check profile completion after login and open edit profile if needed
  useEffect(() => {
    // Ensure profile data is loaded, we haven't already checked/processed this login success,
    // AND the loginSuccessParam is actually present and true.
    if (!loading && !hasCheckedProfile && loginSuccessParam === "true") {
      console.log(
        "Processing login success. User:", user, "Profile IGN:", profile?.ign
      );

      if (user && !profile?.ign) {
        setIsEditProfileOpen(true);
        console.log("Profile incomplete after login, opening edit profile modal.");
      } else if (profile?.ign) {
        console.log("Profile complete after login.");
      } else if (!user) {
        // This case might occur if the effect runs before the user state is updated from the getUser effect.
        // It's less likely if `user` is in the dependency array and getUser updates user state promptly.
        console.log("User object not available yet, though loginSuccessParam is true. Profile check will defer or rely on subsequent runs.");
      }

      // IMPORTANT: Remove the loginSuccessParam from the URL to prevent this effect
      // from re-triggering on subsequent navigations or if the user navigates back.
      // We use router.replace to avoid adding a new entry to the history stack and to prevent scroll jumps.
      // The current pathname is used to stay on the same page.
      router.replace(pathname, { scroll: false });
      console.log(`loginSuccessParam cleared from URL. Current path: ${pathname}`);

      setHasCheckedProfile(true); // Mark that we've processed this login success.

    } else if (!loading && !hasCheckedProfile && loginSuccessParam !== "true") {
      // If it's not a login success (param is not 'true' or not present, or already cleared),
      // still mark as checked if profile is loaded, to prevent repeated checks on other page loads.
      // This ensures that hasCheckedProfile is set even if there was no loginSuccessParam.
      setHasCheckedProfile(true);
      console.log("Initial profile status check complete (not a loginSuccess redirect or param already cleared).");
    }
    // Dependencies: This effect should run when loading state changes, profile data changes,
    // user state changes, the loginSuccessParam itself changes (e.g., cleared),
    // or pathname/router instances change (though router instance is stable).
    // hasCheckedProfile is included to ensure it respects its own stateful check.
  }, [loading, profile, user, loginSuccessParam, pathname, router, hasCheckedProfile]);

  // Effect to manage body overflow when modals/menus are open
  useEffect(() => {
    if (isMenuOpen || isEditProfileOpen || isViewProfileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    // Cleanup function to reset overflow when component unmounts or dependencies change
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen, isEditProfileOpen, isViewProfileOpen]);

  // Toggles the mobile menu open/closed
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Handles user logout via Supabase and redirects to login page
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Opens the Edit Profile modal and closes the mobile menu if open
  const openEditProfileCard = () => {
    setIsEditProfileOpen(true);
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  // Opens the View Profile modal and closes the mobile menu if open
  const openViewProfileCard = () => {
    setIsViewProfileOpen(true);
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  // Define your primary navigation items for desktop and mobile
  // These links will now only be full page routes.
  const navItems = [
    { id:"1", name: "Home", link: "/" },
    { id:"2", name: "Tournament", link: "/tournaments" },
    { id:"3", name: "About", link:"/about"}
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
        <nav className="hidden md:flex md:gap-4 items-center space-x-1 lg:space-x-2">
          {navItems.map((item) => (
            <Link key={item.id} className="text-white border border-zinc-900 hover:bg-emerald-500 bg-zinc-950 p-2 px-3 rounded-full" href={item.link}>{item.name}</Link>
          ))}
        </nav>

        {/* User Actions - Auth or Profile */}
        <div className="flex items-center gap-2">
          {user ? (
            // Dropdown menu for logged-in users
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 ring-emerald-500 transition rounded-full overflow-hidden bg-zinc-100">
                  <AvatarImage
                    src={avatarUrl || undefined} // Display user's avatar image if available
                    alt={profile?.ign || "User"} // Alt text for accessibility
                    className="h-full w-full object-cover"
                  />
                  <AvatarFallback
                    className={`text-zinc-950 text-xs bg-gradient-to-br ${avatarColor}`} // Fallback with initials and dynamic background color
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end" // Aligns the dropdown to the end of the trigger
                className="w-48 mt-1 bg-zinc-950 border border-zinc-800 rounded-md shadow-lg text-white"
              >
                <DropdownMenuItem
                  onClick={openEditProfileCard}
                  className="cursor-pointer hover:bg-zinc-900 focus:bg-zinc-900 focus:text-white"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={openViewProfileCard}
                  className="cursor-pointer hover:bg-zinc-900 focus:bg-zinc-900 focus:text-white"
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  View Profile
                </DropdownMenuItem>
                {/* Volunteer Dashboard link, only visible if the user is a volunteer */}
                {isVolunteer(profile) && (
                  <DropdownMenuItem
                    onClick={() => router.push("/volunteers/dashboard")}
                    className="cursor-pointer text-emerald-500 hover:bg-zinc-900 focus:bg-zinc-900 focus:text-emerald-400"
                  >
                    <Diamond className="mr-2 h-4 w-4" />
                    Your Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-500 hover:bg-zinc-900 focus:bg-zinc-900 focus:text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Login button for unauthenticated users (desktop only)
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

          {/* Mobile Menu Toggle Button (Hamburger Icon) */}
          <button
            className="md:hidden relative z-20 p-2 -mr-2 text-white"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <div className="flex flex-col justify-center items-center w-7 h-7 relative">
              {/* Top bar of the hamburger icon */}
              <div
                className={`bg-white h-0.5 w-5.5 rounded-full absolute transition-all duration-300 ease-in-out ${
                  isMenuOpen ? "rotate-45" : "translate-y-[-6px]"
                }`}
              />
              {/* Middle bar of the hamburger icon */}
              <div
                className={`bg-white h-0.5 w-5.5 rounded-full absolute transition-all duration-200 ease-in-out ${
                  isMenuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              {/* Bottom bar of the hamburger icon */}
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
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.link}
                onClick={toggleMenu} // Close menu when a link is clicked
                className={cn(
                  "py-3 px-4 text-lg font-medium rounded-md transition-colors",
                  "text-zinc-300 hover:text-white hover:bg-zinc-900"
                )}
                style={{ transition: "all 0.2s" }}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Auth Buttons (visible if not logged in) */}
          {!user && (
            <Link href="/login" className="mt-auto"> {/* Use mt-auto to push to bottom */}
              <Button
                variant="outline"
                className="w-full border-zinc-700 bg-emerald-500 text-white hover:bg-emerald-600"
                onClick={toggleMenu}
              >
                Login
              </Button>
            </Link>
          )}
          {/* Mobile User Actions (visible if logged in) */}
          {user && (
            <div className="flex flex-col space-y-3 mt-auto">
              <Button
                variant="outline"
                className="w-full border-none bg-blue-500 text-white hover:bg-blue-600"
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
                className="w-full border-zinc-700 text-white bg-emerald-500 hover:bg-emerald-600"
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
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ProfileCard and ProfileView components are rendered outside the main NavBar structure
          but controlled by its state. */}
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
