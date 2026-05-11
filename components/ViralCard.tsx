"use client";
import { Flame, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ViralCard({ post }: any) {
  return (
    <Link href={`/post/${post.slug || '#'}`} className="group block w-full h-full">
      <div className="liquid-glass rounded-[2rem] p-3 flex flex-col h-full transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:bg-white/80">
        
        {/* Image Section */}
        <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden mb-5 bg-gray-100">
          <Image 
            src={post.thumbnailUrl || "/placeholder.jpg"} 
            alt={post.title} 
            fill 
            className="object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
          />
          {/* Floating Pill Tag */}
          <div className="absolute top-4 left-4 bg-white/70 backdrop-blur-md border border-white/50 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-800 shadow-sm">
            {post.category || "Trending"}
          </div>
        </div>
        
        {/* Content Section */}
        <div className="flex flex-col flex-grow px-3 pb-2">
          <h3 className="font-bengali text-lg md:text-xl font-bold leading-snug text-gray-900 mb-4 line-clamp-2">
            {post.title}
          </h3>
          
          <div className="flex items-center justify-between mt-auto pt-2">
            <span className="flex items-center gap-1.5 font-semibold text-sm text-gray-500">
              <Flame size={16} className="text-[#FF3B30]" /> 
              {post.views || 0}
            </span>
            <button className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <Share2 size={14} className="text-gray-600" />
            </button>
          </div>
        </div>

      </div>
    </Link>
  );
}