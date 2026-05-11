"use client";
import { motion } from "framer-motion";
import { Flame, Share2, MessageSquare } from "lucide-react";
import Image from "next/image";

export default function ViralCard({ post }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group relative bg-[#111] rounded-3xl overflow-hidden border border-white/10 hover:border-primary/50 transition-all"
    >
      <div className="relative aspect-[16/9] w-full">
        <Image 
          src={post.image || "/placeholder.jpg"} 
          alt={post.title} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4 bg-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
          {post.category}
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="font-bengali text-2xl font-bold leading-tight mb-3">
          {post.title}
        </h3>
        
        <div className="flex items-center justify-between text-zinc-500">
          <div className="flex gap-4">
            <span className="flex items-center gap-1 text-orange-500">
              <Flame size={18} /> {post.reactions}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare size={18} /> {post.comments}
            </span>
          </div>
          <button className="hover:text-white">
            <Share2 size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}