import { app } from "@/lib/firebase";
import { getFirestore, collection, getDocs, query, orderBy, limit, where } from "firebase/firestore/lite";
import Link from "next/link"; 
import InfiniteFeed from "@/components/InfiniteFeed"; // 🚀 Imported your new component!

const dbServer = getFirestore(app);

async function getDynamicCategories() {
  try {
    const catSnapshot = await getDocs(collection(dbServer, "categories"));
    const parentCategories: { name: string, order: number }[] = [];
    
    catSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.isVisibleOnHome !== false) {
        parentCategories.push({
          name: data.name,
          order: data.order || 0 
        });
      }
    });
    
    return parentCategories
      .sort((a, b) => a.order - b.order)
      .map(cat => cat.name);
      
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

async function getPosts(selectedCategory: string) {
  try {
    const postsRef = collection(dbServer, "posts");
    let q;

    if (selectedCategory && selectedCategory !== "All") {
      q = query(
        postsRef, 
        where("category", ">=", selectedCategory),
        where("category", "<=", selectedCategory + "\uf8ff"),
        limit(10) // 🚀 limited to 10 for initial speed!
      );
    } else {
      q = query(postsRef, orderBy("createdAt", "desc"), limit(10)); // 🚀 limited to 10!
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
  const resolvedParams = await searchParams;
  const currentCategory = resolvedParams.category || "All";

  const posts = await getPosts(currentCategory);
  const categories = await getDynamicCategories(); 

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-20 md:pt-32 pb-32 w-full overflow-x-hidden flex flex-col items-center">
      
      {/* THE CATEGORY ROW */}
      <div className="w-full border-b border-white/10 pb-4 mb-6 px-4">
        <div className="flex md:justify-center gap-3 overflow-x-auto hide-scrollbar">
          
          <Link 
            href="/"
            className={`shrink-0 px-6 py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors ${
              currentCategory === "All" 
                ? "bg-[#780000] text-[#fdf0d5] shadow-[0_0_15px_rgba(120,0,0,0.6)]" 
                : "bg-white/5 border border-white/10 text-zinc-400 hover:text-[#fdf0d5] hover:bg-white/10"
            }`}
          >
            All
          </Link>

          {categories.map((cat) => {
            const isActive = currentCategory === cat;
            
            return (
              <Link 
                key={cat} 
                href={`/?category=${cat}`}
                className={`shrink-0 px-6 py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors ${
                  isActive 
                    ? "bg-[#780000] text-[#fdf0d5] shadow-[0_0_15px_rgba(120,0,0,0.6)]" 
                    : "bg-white/5 border border-white/10 text-zinc-400 hover:text-[#fdf0d5] hover:bg-white/10"
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>
      </div>

      {/* 🚀 THE INFINITE FEED SECTION */}
      <section className="w-full px-4 max-w-lg md:max-w-2xl mx-auto">
        {posts.length > 0 ? (
          /* Replaced the map loop with the Infinite Feed component */
          <InfiniteFeed initialPosts={posts} currentCategory={currentCategory} />
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