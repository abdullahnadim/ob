import { app } from "@/lib/firebase";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore/lite";
import { notFound } from "next/navigation";
import Image from "next/image";
import Logo from "@/components/Logo";
import FadeIn from "@/components/FadeIn";
import { Flame, Share2 } from "lucide-react";

// 1. INITIALIZE THE SAFE SERVER-SIDE DATABASE
const dbServer = getFirestore(app);

// 2. SAFELY FETCH THE POST DATA (With URL Decoding!)
async function getPost(slug: string) {
  try {
    // 🚀 THE FIX: Decode the URL back to native Bengali characters
    const decodedSlug = decodeURIComponent(slug); 

    const postsRef = collection(dbServer, "posts");
    const q = query(postsRef, where("slug", "==", decodedSlug));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as any;
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

// 3. DYNAMIC SEO METADATA
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.slug);
  
  if (!post) return { title: "Post Not Found | OsthirBengali" };

  return {
    title: `${post.title} | OsthirBengali`,
    description: post.content?.replace(/<[^>]*>?/gm, '').substring(0, 150) + "...", 
    openGraph: {
      title: post.title,
      images: [post.thumbnailUrl],
    },
  };
}

// 4. THE OBSIDIAN & LASER PAGE COMPONENT
export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.slug);

  if (!post) {
    notFound(); 
  }

  return (
    <main className="min-h-screen text-white pb-32 overflow-hidden pt-10">

      {/* CINEMATIC HERO SECTION */}
      <div className="relative w-full max-w-5xl mx-auto px-4 md:px-8">
        <FadeIn delay={0.1}>
          <div className="relative w-full aspect-[4/3] md:aspect-[21/9] rounded-[2.5rem] overflow-hidden bg-black border border-white/10 shadow-2xl">
            <Image 
              src={post.thumbnailUrl || "/placeholder.jpg"} 
              alt={post.title} 
              fill
              priority /* 🚀 FIXES LCP WARNING: Loads this image immediately */
              unoptimized={true} /* 🚀 FIXES TIMEOUT: Bypasses Next.js server compression */
              className="object-cover opacity-90"
            />
            {/* Gradient overlay to fade out the sharp bottom edge of the image */}
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent pointer-events-none" />
          </div>
        </FadeIn>
        
        {/* Floating Title Card */}
        <FadeIn delay={0.2}>
          {/* Thicker frosted glass (bg-[#050505]/80) to clean up the overlap */}
          <div className="relative -mt-16 md:-mt-24 mx-4 md:mx-12 bg-[#050505]/80 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl z-10">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="bg-[#FF3B30] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(255,59,48,0.3)]">
                {post.category || "Trending"}
              </span>
              <span className="text-zinc-400 text-sm font-bold tracking-widest flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                <Flame size={16} className="text-[#FF3B30]" /> {post.views || 0}
              </span>
            </div>
            <h1 className="font-bengali text-3xl md:text-5xl lg:text-6xl font-bold leading-tight text-white drop-shadow-md">
              {post.title}
            </h1>
          </div>
        </FadeIn>
      </div>

      {/* RICH TEXT CONTENT */}
      <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <FadeIn delay={0.3}>
          <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-10">
            <div className="flex items-center gap-4">
              
              <Logo />
              
              <div>
                <p className="font-bold text-sm text-zinc-200">Osthir Desk</p>
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-0.5">
                  {post.createdAt ? new Date(post.createdAt.toDate?.() || post.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }) : "Recently Published"}
                </p>
              </div>
            </div>

            <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2.5 rounded-full text-sm font-bold text-zinc-300 transition-all hover:text-white cursor-pointer">
              <Share2 size={16} /> <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </FadeIn>

        <FadeIn delay={0.4}>
          <div 
            className="prose prose-invert prose-lg max-w-none font-bengali 
                       prose-headings:font-bold prose-headings:text-white prose-headings:tracking-tight
                       prose-p:text-zinc-300 prose-p:leading-relaxed
                       prose-a:text-[#FF3B30] prose-a:no-underline hover:prose-a:underline
                       prose-img:rounded-3xl prose-img:border prose-img:border-white/10 prose-img:shadow-2xl"
            dangerouslySetInnerHTML={{ __html: post.content || "" }}
          />
        </FadeIn>
      </article>
    </main>
  );
}