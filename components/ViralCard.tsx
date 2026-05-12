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
    <Link href={`/post/${post.slug || '#'}`} className="group block w-full outline-none">
      
      <div className="obsidian-glass rounded-[2rem] p-3.5 md:p-4 flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.8)] border border-white/5 hover:border-white/10">
        
        {/* 🚀 THE DYNAMIC RATIO FIX 
            1. Removed aspect-square / aspect-[4/5].
            2. Added max-h-[75vh] so ultra-tall images don't take up the ENTIRE screen.
            3. Swapped Next.js 'fill' for width/height + 'w-full h-auto object-contain'. 
               This guarantees ZERO cropping ever! 
        */}
        <div className="relative w-full rounded-2xl overflow-hidden bg-[#050505] mb-4 md:mb-5 flex items-center justify-center max-h-[75vh]">
          <Image 
            src={post.thumbnailUrl || "/placeholder.jpg"} 
            alt={post.title} 
            // We use arbitrary large numbers here because unoptimized=true allows CSS to take full control
            width={1200} 
            height={1200}
            unoptimized={true}
            className="w-full h-auto max-h-[75vh] object-contain opacity-100 md:opacity-80 group-hover:opacity-100 transition-opacity duration-700 ease-in-out"
          />
          
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-zinc-300 shadow-xl z-10">
            {post.category || "Trending"}
          </div>
        </div>
        
        {/* Metadata Container */}
        <div className="flex flex-col px-1 md:px-2">
          
          <h3 className="font-bengali text-base md:text-lg font-medium leading-relaxed text-white md:text-zinc-300 group-hover:text-white transition-colors mb-4 line-clamp-2">
            {post.title}
          </h3>
          
          <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
            
            <motion.button 
              onClick={handleHype}
              whileTap={{ scale: 0.85 }} 
              animate={isHyped ? { scale: [1, 1.3, 1] } : { scale: 1 }} 
              transition={{ duration: 0.3, ease: "easeInOut" }} 
              className={`flex items-center gap-2 text-xs font-bold tracking-widest px-3 py-1.5 -ml-3 rounded-full transition-all duration-300 ${
                isHyped 
                  ? "text-[#780000] bg-[#780000]/10" 
                  : "text-zinc-500 hover:text-white hover:bg-white/5"
              }`}
            >
              <Flame 
                size={16} 
                className={`transition-all duration-500 ${isHyped ? "fill-[#780000]" : "fill-transparent"}`} 
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