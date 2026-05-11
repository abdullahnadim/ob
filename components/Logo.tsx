"use client";
import { motion } from "framer-motion";

export default function Logo() {
  return (
    <motion.div 
      className="relative flex items-center justify-center w-12 h-12 group cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {/* Soothing, infinitely breathing ambient glow */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-tr from-[#FF3B30] to-orange-300 rounded-full blur-[8px] opacity-40 group-hover:opacity-70 transition-opacity duration-500"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Crisp frosted glass core */}
      <div className="relative w-full h-full bg-white/70 backdrop-blur-xl rounded-full border border-white/80 flex items-center justify-center shadow-sm">
        <span className="font-bold text-[#1D1D1F] text-[15px] tracking-tighter">
          O<span className="text-[#FF3B30]">B</span>
        </span>
      </div>
    </motion.div>
  );
}