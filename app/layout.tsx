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
  themeColor: "#050505", // 🚀 Deep Obsidian background
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  // 1. MAIN SEO
  title: "OsthirBengali | Trending, Satire & Meme Culture",
  description: "The ultimate Bengali Gen-Z entertainment portal. Your daily dose of the most viral and trending content, memes, and news in Bangladesh.",
  keywords: [
    "Osthir Bengali", 
    "Bangladesh viral news", 
    "Bengali memes", 
    "trending news BD", 
    "satire Bangladesh", 
    "Dhaka viral", 
    "Bengali entertainment",
    "Gen-Z BD"
  ],

  // 2. PWA & WEB APP SETTINGS
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent", // iOS status bar blends into your app
    title: "OsthirBengali",
  },

  // 3. ICONS (Favicon & Apple Touch)
  icons: {
    icon: "/favicon.ico", 
    apple: "/icons/apple-touch-icon.png", // 🚀 Points to your new icons folder!
  },

  // 4. OPEN GRAPH (Facebook, WhatsApp, LinkedIn)
  openGraph: {
    title: "OsthirBengali | Trending, Satire & Meme Culture",
    description: "The ultimate hub for viral Bengali content, memes, and trending news.",
    url: "https://osthirbengali.com", // Remember to update this to your real domain!
    siteName: "OsthirBengali",
    images: [
      {
        url: "/icons/og-banner.jpg", // 🚀 Points to your 1200x630 banner!
        width: 1200,
        height: 630,
        alt: "OsthirBengali Official Banner",
      },
    ],
    locale: "bn_BD", // Optimized for Bangladesh!
    type: "website",
  },

  // 5. TWITTER / X
  twitter: {
    card: "summary_large_image",
    title: "OsthirBengali",
    description: "The ultimate Bengali Gen-Z entertainment portal.",
    images: ["/icons/og-banner.jpg"], // 🚀 Uses the same banner
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className="dark">
      <body className={`${inter.variable} ${bengali.variable} font-sans bg-[#050505] text-white antialiased`}>
        <div className="flex flex-col min-h-screen">
          {/* 🚀 NATIVE NAVIGATION */}
          <Navbar />
          <MobileNav />
          
          {children}
        </div>
      </body>
    </html>
  );
}