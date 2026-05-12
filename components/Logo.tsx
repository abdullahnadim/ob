"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Logo() {
  return (
    <motion.div 
      // Adjusted to standard app-icon size with rounded corners and a subtle red shadow
      className="relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden group cursor-pointer shadow-[0_0_15px_rgba(255,59,48,0.2)] shrink-0"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Image
        src="/icons/ob-logo.jpg" 
        alt="Osthir Bengali Logo"
        fill
        sizes="(max-width: 768px) 40px, 48px"
        // The image scales up slightly inside its box on hover for a premium feel
        className="object-cover transition-transform duration-500 group-hover:scale-110"
        priority
      />
    </motion.div>
  );
}