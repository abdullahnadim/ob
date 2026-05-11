import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const bengali = Noto_Sans_Bengali({ 
  subsets: ["bengali"], 
  weight: ["400", "700"], 
  variable: "--font-bengali" 
});

export const viewport: Viewport = {
  themeColor: "#050505", // 🚀 Updated to match your deep Obsidian background
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "OsthirBengali | Trending, Satire & Meme Culture",
  description: "The ultimate Bengali Gen-Z entertainment portal.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent", // 🚀 Makes the iOS status bar blend into your app
    title: "OsthirBengali",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className="dark">
      <body className={`${inter.variable} ${bengali.variable} font-sans bg-[#050505] text-white antialiased`}>
        <div className="flex flex-col min-h-screen">
          {/* 🚀 INJECTED THE NAVIGATION HERE */}
          <Navbar />
          <MobileNav />
          
          {children}
        </div>
      </body>
    </html>
  );
}