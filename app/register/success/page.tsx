// @register/success/page.tsx
'use client'; // This page needs to be a Client Component to use useRouter

import { useRouter } from 'next/navigation'; // Import the router hook
import { Button } from '@/components/ui/button'; // Assuming you have a Button component
import { CheckCircle } from 'lucide-react'; // Icon for success

export default function SuccessPage() {
  const router = useRouter(); // Initialize the router

  const handleGoHome = () => {
    router.push('/'); // Navigate to the home page
  };

  return (
    // Use a container div for layout and styling
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#111828] text-white p-6">
      <div className="bg-[#1B253B] p-8 rounded-lg shadow-xl text-center max-w-md w-full border border-[#747F99]">
        {/* Success Icon */}
        <div className="mb-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold mb-4">Registration Successful!</h1>
        <p className="text-lg text-[#747F99] mb-6">
          Congratulations! Your team registration is complete.
        </p>
        <p className="text-md text-[#747F99] mb-8">
          We wish you the best of luck in the upcoming tournament!
        </p>

        {/* Back to Home Button */}
        <Button
          onClick={handleGoHome} // Call the navigation handler
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
}
