"use client";

import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Flame, Mail, Search } from "lucide-react"; 
import Logo from "@/components/Logo";

export default function Navbar() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const pathname = usePathname();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  // 🚀 THE FIX: This line completely destroys the public Navbar 
  // if you are anywhere inside the /admin routes!
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const navLinks = [
    { name: "Feed", path: "/", icon: <Home size={16} /> },
    { name: "Trending", path: "/trending", icon: <Flame size={16} /> },
    { name: "Contact", path: "/contact", icon: <Mail size={16} /> }, 
  ];

  return (
    <motion.nav
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: "-150%", opacity: 0 },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="hidden md:flex fixed top-4 md:top-6 inset-x-0 z-50 justify-center px-4 pointer-events-none"
    >
      <div className="pointer-events-auto obsidian-glass p-1.5 md:p-2 rounded-full flex items-center gap-1 md:gap-2 shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-white/10 w-full max-w-fit">
        
        <Link href="/" className="pl-2 pr-3 md:pr-4 md:border-r border-white/10 hidden md:block transition-transform hover:scale-105">
          <Logo />
        </Link>

        <div className="flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;

            return (
              <Link key={link.name} href={link.path} className="relative z-10 outline-none">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative px-4 py-2.5 rounded-full flex items-center gap-2 text-xs md:text-sm font-bold tracking-widest uppercase transition-colors duration-300 ${
                    isActive ? "text-white" : "text-zinc-500 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-[#FF3B30] rounded-full shadow-[0_0_20px_rgba(255,59,48,0.4)]"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }} 
                      style={{ zIndex: -1 }}
                    />
                  )}

                  <span className="relative z-20 flex items-center gap-2">
                    {link.icon}
                    <span className="hidden sm:block">{link.name}</span>
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>

        <div className="pl-2 pr-1 md:border-l border-white/10 ml-auto md:ml-0">
          {/* 🚀 THE SEARCH LINK FIX */}
          <Link href="/search" className="outline-none block">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border ${
                pathname === "/search" 
                  ? "bg-[#FF3B30] text-white border-transparent shadow-[0_0_20px_rgba(255,59,48,0.4)]" 
                  : "bg-black/50 hover:bg-white/10 text-zinc-400 hover:text-white border-white/5 hover:border-white/20"
              }`}
            >
              <Search size={16} />
            </motion.div>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}