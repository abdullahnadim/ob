"use client";
import { useState } from "react";
import { Flame, Share2, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";

export default function ViralCard({ post }: any) {
  const [copied, setCopied] = useState(false);
  const [isHyped, setIsHyped] = useState(false);
  const [localViews, setLocalViews] = useState(post.views || 0);

  const handleHype = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isHyped) return;

    setIsHyped(true);
    setLocalViews((prev: number) => prev + 1);

    try {
      const postRef = doc(db, "posts", post.id);
      await updateDoc(postRef, { views: increment(1) });
    } catch (error) {
      console.error("Failed to update hype score:", error);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = `${window.location.origin}/post/${post.slug}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: "Check out this post on OsthirBengali!",
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.log("Share failed.", error);
    }
  };

  return (
    // 🚀 FIX 1: Removed 'h-full'. The card will now perfectly wrap its content without stretching!
    <Link href={`/post/${post.slug || '#'}`} className="group block w-full outline-none">
      
      {/* 🚀 FIX 2: Increased padding (p-3.5) and softened the border radius for a premium look */}
      <div className="obsidian-glass rounded-[2rem] p-3.5 md:p-4 flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.8)] border border-white/5 hover:border-white/10">
        
        {/* 🚀 FIX 3: Mobile is now aspect-square! PC stays aspect-[4/5]. This stops the massive stretching. */}
        <div className="relative aspect-square md:aspect-[4/5] w-full rounded-2xl overflow-hidden bg-black mb-4 md:mb-5">
          <Image 
            src={post.thumbnailUrl || "/placeholder.jpg"} 
            alt={post.title} 
            fill 
            unoptimized={true}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover opacity-100 md:opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          />
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-zinc-300 shadow-xl">
            {post.category || "Trending"}
          </div>
        </div>
        
        {/* Metadata Container */}
        <div className="flex flex-col px-1 md:px-2">
          
          {/* 🚀 Increased line height (leading-relaxed) so the Bengali text breathes nicely */}
          <h3 className="font-bengali text-base md:text-lg font-medium leading-relaxed text-white md:text-zinc-300 group-hover:text-white transition-colors mb-4 line-clamp-2">
            {post.title}
          </h3>
          
          {/* 🚀 Cleaned up the bottom row spacing and border */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
            
            <motion.button 
              onClick={handleHype}
              whileTap={{ scale: 0.85 }} 
              animate={isHyped ? { scale: [1, 1.3, 1] } : { scale: 1 }} 
              transition={{ duration: 0.3, ease: "easeInOut" }} 
              className={`flex items-center gap-2 text-xs font-bold tracking-widest px-3 py-1.5 -ml-3 rounded-full transition-all duration-300 ${
                isHyped 
                  ? "text-[#FF3B30] bg-[#FF3B30]/10" 
                  : "text-zinc-500 hover:text-white hover:bg-white/5"
              }`}
            >
              <Flame 
                size={16} 
                className={`transition-all duration-500 ${isHyped ? "fill-[#FF3B30]" : "fill-transparent"}`} 
              /> 
              {localViews}
            </motion.button>
            
            <button 
              onClick={handleShare}
              className={`transition-all duration-300 p-2 rounded-full ${
                copied 
                  ? "bg-green-500/20 text-green-400" 
                  : "text-zinc-500 hover:text-white hover:bg-white/5 bg-white/5 md:bg-transparent"
              }`}
            >
              {copied ? <Check size={16} /> : <Share2 size={16} />}
            </button>
            
          </div>
        </div>

      </div>
    </Link>
  );
}