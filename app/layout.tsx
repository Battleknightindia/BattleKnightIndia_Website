import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { fontClass } from "@/lib/constant/fonts";

 
const metadata = {
  title: 'Battle Knight India',
  description: "Battle Knight India is a gaming community that focuses on competitive gaming and esports.",
  icons: {
    icon: '/favicon.ico', // You can specify the path to your favicon here
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
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
