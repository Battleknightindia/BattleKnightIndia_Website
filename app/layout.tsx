import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { fontClass } from "@/lib/constant/fonts";

const metadata = {
  title: 'Battle Knight India',
  description: "Battle Knight India is a gaming community that focuses on competitive gaming and esports."
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
