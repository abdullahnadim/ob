"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase"; 
import ViralCard from "@/components/ViralCard";
import Link from "next/link";
import FadeIn from "@/components/FadeIn"; // Re-using our premium motion!

export default function FeedContent() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Memes", "Satire", "Tech", "Gaming", "Awareness"];

  useEffect(() => {
    async function fetchPosts() {
      try {
        const postsRef = collection(db, "posts");
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

  if (loading) {
    return (
      <div className="pt-10 md:pt-20 px-4 md:px-8 max-w-7xl mx-auto pb-24 w-full">
        <div className="flex gap-6 mb-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-6 w-16 bg-white/5 rounded animate-pulse" />
          ))}
        </div>
        <div className="w-full aspect-[21/9] bg-white/5 rounded-3xl mb-16 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[4/5] bg-white/5 rounded-3xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const filteredPosts = activeCategory === "All" 
    ? posts 
    : posts.filter(post => post.category?.toLowerCase() === activeCategory.toLowerCase());

  const featuredPost = filteredPosts[0];
  const feedPosts = filteredPosts.slice(1);

  return (
    <div className="pt-10 md:pt-20 px-4 md:px-8 max-w-7xl mx-auto pb-24">
      
      {/* ELITE CATEGORY NAVIGATION */}
      <FadeIn delay={0.1}>
        <div className="flex gap-8 overflow-x-auto pb-4 mb-12 scrollbar-hide border-b border-white/10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`pb-4 -mb-[17px] text-sm font-medium tracking-widest uppercase transition-all duration-300 ${
                activeCategory === cat 
                  ? "text-white border-b-2 border-[#780000]" 
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </FadeIn>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-32 obsidian-glass rounded-3xl">
          <p className="text-xl font-medium text-zinc-400">The void is empty.</p>
        </div>
      ) : (
        <>
          {/* CINEMATIC FEATURED MAG */}
          {featuredPost && (
            <FadeIn delay={0.2}>
              <section className="mb-20">
                <Link href={`/post/${featuredPost.slug}`} className="group relative block aspect-[4/3] md:aspect-[21/9] w-full rounded-3xl overflow-hidden bg-black">
                  <img 
                    src={featuredPost.thumbnailUrl || "/placeholder.jpg"} 
                    alt={featuredPost.title}
                    className="object-cover w-full h-full opacity-60 group-hover:opacity-40 transition-opacity duration-700"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full md:w-3/4">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-[1px] w-12 bg-[#780000]"></div>
                      <span className="text-[#780000] text-xs font-bold uppercase tracking-widest">
                        {featuredPost.category || "Hottest"}
                      </span>
                    </div>
                    <h2 className="font-bengali text-3xl md:text-5xl lg:text-6xl font-bold leading-tight text-white group-hover:text-zinc-300 transition-colors">
                      {featuredPost.title}
                    </h2>
                  </div>
                </Link>
              </section>
            </FadeIn>
          )}

          {/* GALLERY GRID */}
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {feedPosts.map((post, index) => (
                <FadeIn key={post.id} delay={0.1 * (index % 4)}>
                  <ViralCard post={post} />
                </FadeIn>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}