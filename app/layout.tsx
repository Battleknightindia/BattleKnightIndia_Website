// app/layout.tsx
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { fontClass } from "@/lib/constant/fonts";
import { Suspense } from 'react'; // Import Suspense from react
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata = {
  title: 'Battle Knight India',
  description: "Battle Knight India is a gaming community that focuses on competitive gaming and esports.",
  icons: {
    icon: '/logo/logo.webp', // You can specify the path to your favicon here
    // You can add other icon sizes or types if needed, e.g.:
    // apple: '/apple-touch-icon.png',
    // shortcut: '/shortcut-icon.png'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-screen w-full no-scrollbar overflow-y-auto">
      <body className={`${fontClass} bg-[#0F0F0F] text-white`}>
        {/* Wrap LayoutWrapper (and its children) with Suspense */}
        <Suspense fallback={<div>Loading layout...</div>}> {/* Add a fallback UI */}
          <LayoutWrapper>
            <SpeedInsights />
            {children}
          </LayoutWrapper>
        </Suspense>
      </body>
    </html>
  );
}