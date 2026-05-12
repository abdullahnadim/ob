import { app } from "@/lib/firebase";
import { getFirestore, collection, getDocs, query, orderBy, limit, where } from "firebase/firestore/lite";
import ViralCard from "@/components/ViralCard";
import Link from "next/link"; 

const dbServer = getFirestore(app);

// 🚀 1. FETCH DYNAMIC CATEGORIES FOR THE TOP BAR
async function getDynamicCategories() {
  try {
    const catSnapshot = await getDocs(collection(dbServer, "categories"));
    const parentCategories: { name: string, order: number }[] = [];
    
    catSnapshot.forEach((doc) => {
      const data = doc.data();
      // If isVisibleOnHome is explicitly false, we skip it. 
      // (Undefined/null defaults to true for older data)
      if (data.isVisibleOnHome !== false) {
        parentCategories.push({
          name: data.name,
          order: data.order || 0 // Default to 0 if not set yet
        });
      }
    });
    
    // Sort by the 'order' number we set via drag-and-drop in the Admin panel!
    return parentCategories
      .sort((a, b) => a.order - b.order)
      .map(cat => cat.name);
      
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// 🚀 2. SAFELY FETCH & FILTER POSTS
async function getPosts(selectedCategory: string) {
  try {
    const postsRef = collection(dbServer, "posts");
    let q;

    if (selectedCategory && selectedCategory !== "All") {
      // 🚀 THE TRICK: This grabs exactly "Sports", but ALSO grabs "Sports > Football" automatically!
      // The \uf8ff is a high Unicode character that acts as a wildcard boundary.
      q = query(
        postsRef, 
        where("category", ">=", selectedCategory),
        where("category", "<=", selectedCategory + "\uf8ff"),
        limit(50)
      );
    } else {
      // If "All" is selected, just get the latest 24 normally
      q = query(postsRef, orderBy("createdAt", "desc"), limit(24));
    }

    const snapshot = await getDocs(q);

    let fetchedPosts = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      };
    });

    // 🚀 Sort the dates manually here to avoid Firebase Composite Index errors when filtering
    if (selectedCategory && selectedCategory !== "All") {
      fetchedPosts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return fetchedPosts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  // Read the current category from the URL (e.g., /?category=Tech)
  const resolvedParams = await searchParams;
  const currentCategory = resolvedParams.category || "All";

  // 🚀 Fetch the dynamic data from Firebase
  const posts = await getPosts(currentCategory);
  const categories = await getDynamicCategories(); 

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-6 md:pt-32 pb-32 w-full overflow-x-hidden flex flex-col items-center">
      
      {/* THE CATEGORY ROW */}
      <div className="w-full border-b border-white/10 pb-4 mb-6 px-4">
        <div className="flex md:justify-center gap-3 overflow-x-auto hide-scrollbar">
          
          {/* Active Tab (All) */}
          <Link 
            href="/"
            className={`shrink-0 px-6 py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors ${
              currentCategory === "All" 
                ? "bg-[#FF3B30] text-white shadow-[0_0_15px_rgba(255,59,48,0.4)]" 
                : "bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
            }`}
          >
            All
          </Link>

          {/* 🚀 DYNAMIC TABS RENDERED FROM FIREBASE */}
          {categories.map((cat) => {
            const isActive = currentCategory === cat;
            
            return (
              <Link 
                key={cat} 
                href={`/?category=${cat}`}
                className={`shrink-0 px-6 py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors ${
                  isActive 
                    ? "bg-[#FF3B30] text-white shadow-[0_0_15px_rgba(255,59,48,0.4)]" 
                    : "bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>
      </div>

      {/* THE NATIVE FEED CONSTRAINER */}
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
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h3 className="text-zinc-500 font-bold tracking-widest uppercase text-[10px]">
              No posts found in this category.
            </h3>
          </div>
        )}
      </section>

    </main>
  );
}