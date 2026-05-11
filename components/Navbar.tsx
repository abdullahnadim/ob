// components/Navbar.tsx
"use client";

import Link from "next/link";
import { Search, Menu } from "lucide-react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";

export default function Navbar() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  // Hide navbar when scrolling down, show when scrolling up
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) setHidden(true);
    else setHidden(false);
  });

  return (
    <motion.nav
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-black text-2xl tracking-tighter text-white">
          Osthir<span className="text-primary">Bengali</span>.
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 font-medium text-sm text-zinc-400">
          <Link href="/category/memes" className="hover:text-white transition-colors">Memes</Link>
          <Link href="/category/satire" className="hover:text-white transition-colors">Satire</Link>
          <Link href="/category/tech" className="hover:text-white transition-colors">Tech</Link>
          <Link href="/category/trending" className="text-primary font-bold">Trending</Link>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-zinc-400 hover:text-white transition-colors">
            <Search size={20} />
          </button>
          <button className="md:hidden text-zinc-400 hover:text-white">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </motion.nav>
  );
}