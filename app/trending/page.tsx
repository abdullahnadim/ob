import { app } from "@/lib/firebase";
import { getFirestore, collection, getDocs, query, where, orderBy, limit } from "firebase/firestore/lite";
import ViralCard from "@/components/ViralCard";
import { Flame } from "lucide-react";

const dbServer = getFirestore(app);

// 🚀 SAFELY FETCH TRENDING POSTS
async function getTrendingPosts() {
  try {
    const postsRef = collection(dbServer, "posts");
    
    // 1. Fetch only posts marked as trending
    const q = query(
      postsRef, 
      where("isTrending", "==", true), 
      orderBy("createdAt", "desc"), 
      limit(50)
    );
    
    const snapshot = await getDocs(q);

    // 2. The Expiration Logic (7 Days)
    // We calculate what the date was exactly 7 days ago.
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let fetchedPosts = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(), // Keep as Date object for comparison
      };
    });

    // 3. Filter out posts older than 7 days!
    // They will still exist on the main feed and categories, but disappear from here.
    const activeTrendingPosts = fetchedPosts.filter((post) => {
      return post.createdAt >= sevenDaysAgo;
    });

    // 4. Clean up the dates for the React Client
    return activeTrendingPosts.map(post => ({
      ...post,
      createdAt: post.createdAt.toISOString()
    }));

  } catch (error) {
    console.error("Error fetching trending posts:", error);
    return [];
  }
}

export default async function TrendingPage() {
  const posts = await getTrendingPosts();

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-24 md:pt-32 pb-32 w-full overflow-x-hidden flex flex-col items-center">
      
      {/* 🚀 CINEMATIC HEADER */}
      <div className="w-full max-w-lg md:max-w-2xl px-4 text-center mb-10">
        <div className="inline-flex items-center justify-center gap-2 w-16 h-16 rounded-full bg-[#FF3B30]/10 mb-4 shadow-[0_0_30px_rgba(255,59,48,0.3)]">
          <Flame size={32} className="text-[#FF3B30] fill-[#FF3B30]" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-3">
          Trending <span className="text-[#FF3B30]">Now</span>
        </h1>
        <p className="text-zinc-400 text-sm md:text-base">
          The absolute hottest stories, memes, and culture drops of the last 7 days.
        </p>
      </div>

      {/* 🚀 THE NATIVE FEED CONSTRAINER */}
      <section className="w-full px-4 max-w-lg md:max-w-2xl mx-auto">
        {posts.length > 0 ? (
          <div className="w-full flex flex-col gap-8">
            {posts.map((post) => (
              <div key={post.id} className="w-full block">
                <ViralCard post={post} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center obsidian-glass rounded-3xl border border-white/5">
            <h3 className="text-zinc-400 font-bold tracking-widest uppercase text-sm mb-2">
              The wire is quiet...
            </h3>
            <p className="text-zinc-500 text-xs">No posts have gone viral in the last 7 days.</p>
          </div>
        )}
      </section>

    </main>
  );
}