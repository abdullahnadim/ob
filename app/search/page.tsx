"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { Search, Loader2, Flame, Eye, ArrowLeft, FileQuestion } from "lucide-react";
import Navbar from "@/components/Navbar";

interface Post {
  id: string;
  title: string;
  slug: string;
  category: string;
  thumbnailUrl: string;
  views: number;
  isTrending: boolean;
  createdAt: any;
  authorName: string;
}

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedPosts: Post[] = [];
        querySnapshot.forEach((doc) => {
          fetchedPosts.push({ id: doc.id, ...doc.data() } as Post);
        });
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // INSTANT CLIENT-SIDE FILTERING
  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    post.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-24 md:pt-32 pb-32 px-4 flex flex-col items-center">
      <Navbar />

      <div className="w-full max-w-3xl">
        
        {/* BACK BUTTON */}
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-bold uppercase tracking-widest text-[10px] mb-8">
          <ArrowLeft size={14} /> Back to Feed
        </Link>

        {/* 🚀 THE FIXED SEARCH INPUT - Uses padding instead of height, standard 2xl radius, and group-focus colors */}
        <div className="relative mb-12 w-full group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-5 md:pl-6 pointer-events-none">
            <Search className="text-zinc-500 group-focus-within:text-[#FF3B30] transition-colors duration-300" size={22} />
          </div>
          <input
            type="text"
            autoFocus
            placeholder="Search articles, topics, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full bg-[#0A0A0A] border border-white/10 rounded-2xl py-4 md:py-5 pl-14 md:pl-16 pr-6 text-base md:text-lg text-white placeholder:text-zinc-600 focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] focus:bg-[#FF3B30]/5 outline-none transition-all duration-300 shadow-inner"
          />
        </div>

        {/* RESULTS AREA */}
        <div className="space-y-6 w-full">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={40} className="text-[#FF3B30] animate-spin mb-4" />
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Accessing Database...</p>
            </div>
          ) : (
            <>
              {/* RESULTS COUNT */}
              {searchTerm && (
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">
                  Found {filteredPosts.length} result{filteredPosts.length !== 1 ? 's' : ''}
                </p>
              )}

              {/* POST CARDS */}
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <Link href={`/post/${post.slug}`} key={post.id} className="block group">
                    <div className="obsidian-glass p-4 md:p-5 rounded-3xl border border-white/5 group-hover:border-white/20 transition-all duration-300 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 items-center w-full group-hover:bg-white/5 overflow-hidden">
                      
                      {/* THUMBNAIL */}
                      <div className="relative w-full h-48 md:h-[120px] rounded-2xl overflow-hidden bg-black">
                        <Image 
                          src={post.thumbnailUrl || "/placeholder.jpg"} 
                          alt={post.title} 
                          fill 
                          className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                          unoptimized
                        />
                        {post.isTrending && (
                          <div className="absolute top-2 left-2 bg-[#FF3B30] w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                            <Flame size={12} className="text-white fill-white" />
                          </div>
                        )}
                      </div>

                      {/* TEXT INFO */}
                      <div className="flex flex-col justify-center min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-[#FF3B30] text-white px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest shrink-0">
                            {post.category}
                          </span>
                        </div>
                        
                        <h3 className="text-white font-black text-xl leading-tight mb-2 group-hover:text-[#FF3B30] transition-colors truncate md:whitespace-normal md:line-clamp-2">
                          {post.title}
                        </h3>
                        
                        <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                          <span className="flex items-center gap-1"><Eye size={14} /> {post.views || 0}</span>
                          <span>•</span>
                          <span>{post.createdAt ? new Date(post.createdAt.toDate?.() || post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "Just now"}</span>
                        </div>
                      </div>

                    </div>
                  </Link>
                ))
              ) : (
                /* NO RESULTS STATE */
                <div className="text-center py-20 obsidian-glass rounded-[2rem] border border-white/5 flex flex-col items-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <FileQuestion size={32} className="text-zinc-600" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-widest text-white mb-2">No Records Found</h3>
                  <p className="text-zinc-500 text-sm max-w-sm mx-auto">
                    We couldn't find any articles matching "{searchTerm}". Try using different keywords or checking your spelling.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </main>
  );
}