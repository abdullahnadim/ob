"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Flame, Search, Mail } from "lucide-react"; // 🚀 Swapped LayoutDashboard for Mail

export default function MobileNav() {
  const pathname = usePathname();

  // 🚀 THE FIX: This completely hides the public mobile nav if you are inside the Admin Studio!
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // 🚀 THE FIX: Replaced "Studio" with "Contact" for your public audience
  const navLinks = [
    { name: "Feed", path: "/", icon: <Home size={24} strokeWidth={2.5} /> },
    { name: "Trending", path: "/trending", icon: <Flame size={24} strokeWidth={2.5} /> },
    { name: "Search", path: "/search", icon: <Search size={24} strokeWidth={2.5} /> },
    { name: "Contact", path: "/contact", icon: <Mail size={24} strokeWidth={2.5} /> }, 
  ];

  return (
    // md:hidden ensures this ONLY shows on phones
    // bg-[#050505]/80 + backdrop-blur gives it that expensive iOS frosted glass look
    <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#050505]/80 backdrop-blur-3xl border-t border-white/10 pt-3 pb-6 px-8 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {navLinks.map((link) => {
          const isActive = pathname === link.path;

          return (
            <Link key={link.name} href={link.path} className="relative p-2 outline-none">
              <motion.div
                whileTap={{ scale: 0.8 }} // Physical squish on press
                className={`flex flex-col items-center gap-1 transition-colors duration-300 ${
                  isActive ? "text-[#FF3B30]" : "text-zinc-600 hover:text-zinc-400"
                }`}
              >
                {link.icon}
                
                {/* 🚀 THE LASER DOT INDICATOR */}
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-dot"
                    className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#FF3B30] shadow-[0_0_10px_rgba(255,59,48,1)]"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}