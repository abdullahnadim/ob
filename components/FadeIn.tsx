"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function FadeIn({ children, delay = 0 }: { children: ReactNode, delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      // This specific custom ease array is Apple's signature fluid curve
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }} 
    >
      {children}
    </motion.div>
  );
}