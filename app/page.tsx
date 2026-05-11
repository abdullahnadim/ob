import { app } from "@/lib/firebase";
import { getFirestore, collection, getDocs, query, orderBy, limit } from "firebase/firestore/lite";
import ViralCard from "@/components/ViralCard";

// 1. INITIALIZE THE SAFE SERVER-SIDE DATABASE
const dbServer = getFirestore(app);

// 2. SAFELY FETCH POSTS (Server-Side Rendering)
async function getPosts() {
  try {
    const postsRef = collection(dbServer, "posts");
    // Fetch the latest 24 posts
    const q = query(postsRef, orderBy("createdAt", "desc"), limit(24));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Firebase timestamp to string for safe component passing
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      };
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

export default async function Home() {
  const posts = await getPosts();

  const categories = [
    "Memes", 
    "Satire", 
    "Tech", 
    "Gaming", 
    "Awareness", 
    "Culture", 
    "Music"
  ];

  return (
    // pt-12 for mobile (clears status bar), md:pt-32 for desktop (clears navbar)
    // overflow-x-hidden is the "Lock" that prevents the whole page from wobbling
    <main className="min-h-screen text-white pt-12 md:pt-32 px-4 max-w-2xl mx-auto pb-32 overflow-x-hidden">
      
      {/* 🚀 THE PINTEREST-STYLE HORIZONTAL CATEGORY MENU */}
      <div className="relative mb-8 w-full border-b border-white/10 pb-4">
        {/* - flex gap-3: Spacing between buttons
            - overflow-x-auto: Allows swiping
            - hide-scrollbar: Removes ugly gray scroll bars (requires the CSS we added earlier)
        */}
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
          
          {/* Active Tab (All) */}
          {/* shrink-0 is CRITICAL: It stops the button from squishing on mobile */}
          <div className="shrink-0 px-6 py-2 bg-[#FF3B30] text-white rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(255,59,48,0.4)] cursor-pointer">
            All
          </div>

          {/* Inactive Tabs */}
          {categories.map((cat) => (
            <div 
              key={cat} 
              className="shrink-0 px-6 py-2 bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors"
            >
              {cat}
            </div>
          ))}
        </div>
      </div>

      {/* 🚀 THE NATIVE FEED GRID (1 Column for Mobile, Multi for PC) */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {posts.map((post) => (
            <ViralCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 border-4 border-white/10 border-t-[#FF3B30] rounded-full animate-spin mb-4" />
          <h3 className="text-zinc-500 font-bold tracking-widest uppercase text-[10px]">
            Connecting to the Pulse...
          </h3>
        </div>
      )}

    </main>
  );
}