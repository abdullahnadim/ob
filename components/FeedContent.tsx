"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase"; 
import ViralCard from "@/components/ViralCard";
import Link from "next/link";

export default function FeedContent() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  // iOS-style categories for the top navigation
  const categories = ["All", "Memes", "Satire", "Tech", "Gaming", "Awareness"];

  useEffect(() => {
    async function fetchPosts() {
      try {
        const postsRef = collection(db, "posts");
        // Fetch top 20 trending posts to have enough data for filtering
        const q = query(postsRef, orderBy("views", "desc"), limit(20));
        const snapshot = await getDocs(q);
        
        const fetchedPosts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Firebase fetch error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  // 1. LIQUID GLASS SKELETON LOADER
  if (loading) {
    return (
      <div className="pt-10 md:pt-20 px-4 md:px-8 max-w-7xl mx-auto pb-24 w-full">
        {/* Tab Skeletons */}
        <div className="flex gap-3 mb-10 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-24 bg-gray-200/50 rounded-full animate-pulse shrink-0" />
          ))}
        </div>

        {/* Featured Post Skeleton */}
        <div className="w-full aspect-[4/3] md:aspect-[21/9] bg-gray-200/50 rounded-[2.5rem] mb-16 animate-pulse" />
        
        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex flex-col h-full liquid-glass rounded-[2rem] p-3 animate-pulse">
              <div className="aspect-[4/3] w-full bg-gray-200 rounded-3xl mb-5" />
              <div className="px-3 pb-2 flex flex-col gap-3">
                <div className="h-5 bg-gray-200 rounded-md w-full" />
                <div className="h-5 bg-gray-200 rounded-md w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Filter posts instantly on the client side
  const filteredPosts = activeCategory === "All" 
    ? posts 
    : posts.filter(post => post.category?.toLowerCase() === activeCategory.toLowerCase());

  const featuredPost = filteredPosts[0];
  const feedPosts = filteredPosts.slice(1);

  return (
    <div className="pt-10 md:pt-20 px-4 md:px-8 max-w-7xl mx-auto pb-24">
      {/* 2. IOS-STYLE SEGMENTED TABS */}
      <div className="flex gap-3 overflow-x-auto pb-6 mb-10 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide whitespace-nowrap transition-all duration-300 ${
              activeCategory === cat 
                ? "bg-white text-black shadow-md border border-gray-200 scale-105" 
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3. EMPTY STATE */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-32 liquid-glass rounded-[2rem]">
          <p className="text-xl font-semibold text-gray-900">No content found.</p>
          <p className="text-sm text-gray-500 mt-2">Check back later.</p>
        </div>
      ) : (
        <>
          {/* 4. CINEMATIC FEATURED POST */}
          {featuredPost && (
            <section className="mb-16">
              <Link href={`/post/${featuredPost.slug}`} className="group relative block aspect-[4/3] md:aspect-[21/9] w-full rounded-[2.5rem] overflow-hidden bg-gray-200 shadow-sm hover:shadow-xl transition-shadow duration-700">
                <img 
                  src={featuredPost.thumbnailUrl || "/placeholder.jpg"} 
                  alt={featuredPost.title}
                  className="object-cover w-full h-full group-hover:scale-[1.02] transition-transform duration-1000 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                />
                
                {/* Floating Glass Panel for Text */}
                <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 w-[calc(100%-2rem)] md:w-2/3 lg:w-1/2 liquid-glass rounded-3xl p-6 md:p-8">
                  <span className="bg-[#FF3B30] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest inline-block mb-4 shadow-sm">
                    {featuredPost.category || "Featured"}
                  </span>
                  <h2 className="font-bengali text-2xl md:text-4xl lg:text-5xl font-bold leading-tight text-gray-900 group-hover:text-[#FF3B30] transition-colors">
                    {featuredPost.title}
                  </h2>
                </div>
              </Link>
            </section>
          )}

          {/* 5. BREATHABLE GRID */}
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {feedPosts.map((post) => (
                <ViralCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}