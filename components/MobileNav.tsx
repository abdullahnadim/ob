"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Flame, Search, Mail } from "lucide-react"; 
import Logo from "@/components/Logo"; 

export default function MobileNav() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const navLinks = [
    { name: "Feed", path: "/", icon: <Home size={24} strokeWidth={2.5} /> },
    { name: "Trending", path: "/trending", icon: <Flame size={24} strokeWidth={2.5} /> },
    { name: "Search", path: "/search", icon: <Search size={24} strokeWidth={2.5} /> },
    { name: "Contact", path: "/contact", icon: <Mail size={24} strokeWidth={2.5} /> }, 
  ];

  return (
    <>
      {/* THE TOP HEADER */}
      <header className="md:hidden fixed top-0 inset-x-0 z-40 bg-gradient-to-b from-[#050505] via-[#050505]/95 to-transparent pt-4 pb-6 flex justify-center pointer-events-none">
        <div className="pointer-events-auto drop-shadow-[0_4px_20px_rgba(0,0,0,1)]">
          <Link href="/" className="flex items-center gap-3 active:scale-95 transition-transform outline-none">
            <Logo />
            <h1 className="text-2xl font-black tracking-widest uppercase flex items-center mt-0.5">
              <span className="text-[#fdf0d5]">OSTHIR</span> &nbsp;
              {/* 🚀 Changed to your deep logo red */}
              <span className="text-[#fdf0d5]">BENGALI</span>
            </h1>
          </Link>
        </div>
      </header>

      {/* THE BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#050505]/80 backdrop-blur-3xl border-t border-white/10 pt-3 pb-6 px-8 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;

            return (
              <Link key={link.name} href={link.path} className="relative p-2 outline-none">
                <motion.div
                  whileTap={{ scale: 0.8 }}
                  className={`flex flex-col items-center gap-1 transition-colors duration-300 ${
                    /* 🚀 Changed active icon color to deep red */
                    isActive ? "text-[#780000]" : "text-zinc-600 hover:text-zinc-400"
                  }`}
                >
                  {link.icon}
                  
                  {/* THE LASER DOT INDICATOR */}
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-dot"
                      /* 🚀 Changed dot color and shadow to RGB 120,0,0 */
                      className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#780000] shadow-[0_0_10px_rgba(120,0,0,1)]"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}