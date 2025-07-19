"use client"; // This component will use client-side features like useRouter

import Interface from "@/components/spinner/Interface"; // Import the SpinTheWheel component
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import { cn } from '@/lib/utils'; // Assuming you have a cn utility for class merging

export default function SpinTheWheel() {
  const router = useRouter(); // Initialize the router

  return (
    <div className="">
      <div className="hidden md:block">
        <Interface/>
      </div>

      {/* Mobile View: Show the enhanced message and button */}
      <div className="md:hidden w-90 bg-gray-800 rounded-lg shadow-xl p-6 text-center border border-gray-700 animate-fade-in">
        <div className="mb-6">
          {/* Warning Icon (using Lucide-React if available, otherwise a simple text/emoji) */}
          {/* Assuming you have 'lucide-react' installed, otherwise use a warning emoji ⚠️ */}
          {/* If you don't have Lucide-React or prefer not to use it, you can remove the import and use ⚠️ */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-triangle-alert text-yellow-400 mx-auto mb-4 animate-pulse"
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>

          <h3 className="text-2xl font-bold text-red-400 mb-3">
            Feature Not Available
          </h3>
          <p className="text-gray-300 leading-relaxed">
            We apologize, but this interactive feature is optimized for larger screens and is not available on mobile devices.
            Please access this page from a desktop or tablet for the best experience.
          </p>
        </div>

        {/* Go Back Button */}
        <button
          onClick={() => router.push('/')} // Navigate to the home route
          className={cn(
            "mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md",
            "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75",
            "transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
          )}
        >
          Go Back to Home
        </button>
      </div>
    </div>
  );
}