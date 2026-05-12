import { app } from "@/lib/firebase";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore/lite";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/Logo";
import FadeIn from "@/components/FadeIn";
import { Flame, Share2 } from "lucide-react";

// 1. INITIALIZE THE SAFE SERVER-SIDE DATABASE
const dbServer = getFirestore(app);

// 2. SAFELY FETCH THE POST DATA
async function getPost(slug: string) {
  try {
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

  // Bulletproof Date Formatter
  let displayDate = "Recently Published";
  if (post.createdAt) {
    try {
      const dateObj = post.createdAt.toDate ? post.createdAt.toDate() : new Date(post.createdAt);
      if (!isNaN(dateObj.getTime())) {
        displayDate = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      }
    } catch (e) {
      console.error("Date parsing error", e);
    }
  }

  return (
    <main className="min-h-screen text-white pb-32 w-full overflow-x-hidden pt-24 md:pt-32">
      <div className="relative w-full max-w-4xl mx-auto px-4 md:px-8">
        
        {/* CINEMATIC HERO SECTION */}
        <FadeIn delay={0.1}>
          <div className="relative w-full aspect-[4/3] md:aspect-video max-h-[70vh] rounded-[2rem] overflow-hidden bg-black border border-white/10 shadow-2xl">
            <Image 
              src={post.thumbnailUrl || "/placeholder.jpg"} 
              alt={post.title} 
              fill
              priority 
              unoptimized={true} 
              className="object-cover object-top opacity-90"
            />
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent pointer-events-none" />
          </div>
        </FadeIn>
        
        {/* Floating Title Card */}
        <FadeIn delay={0.2}>
          <div className="relative -mt-16 md:-mt-24 mx-2 sm:mx-6 md:mx-12 bg-[#050505]/80 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl z-10 flex flex-col min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <Link href={`/?category=${post.category || "Trending"}`}>
                <span className="bg-[#780000] text-white px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(255,59,48,0.3)] hover:bg-white hover:text-[#780000] transition-colors cursor-pointer">
                  {post.category || "Trending"}
                </span>
              </Link>
              <span className="text-zinc-400 text-xs md:text-sm font-bold tracking-widest flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                <Flame size={14} className="text-[#780000]" /> {post.views || 0}
              </span>
            </div>
            <h1 className="font-bengali text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold leading-tight md:leading-snug text-white drop-shadow-md">
              {post.title}
            </h1>
          </div>
        </FadeIn>
      </div>

      {/* RICH TEXT CONTENT */}
      <article className="w-full max-w-3xl mx-auto px-6 py-12 md:py-16 overflow-hidden">
        <FadeIn delay={0.3}>
          <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-10">
            <div className="flex items-center gap-4">
              <Logo />
              <div>
                <p className="font-bold text-sm text-zinc-200">{post.authorName || "Osthir Desk"}</p>
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-0.5">
                  {displayDate}
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
            className="
              font-bengali text-zinc-300 text-lg md:text-xl leading-loose md:leading-[2.2] 
              w-full max-w-full
              [&_*]:whitespace-normal
              [&>p]:mb-6 
              [&>h1]:text-3xl [&>h1]:font-black [&>h1]:text-white [&>h1]:mb-4 [&>h1]:mt-8 [&>h1]:leading-tight
              [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-white [&>h2]:mb-4 [&>h2]:mt-8 [&>h2]:leading-tight
              [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-white [&>h3]:mb-3 [&>h3]:mt-6 [&>h3]:leading-tight
              [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>ul>li]:mb-2
              [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-6 [&>ol>li]:mb-2
              [&>a]:text-[#780000] [&>a]:underline [&>a]:font-bold
              [&>blockquote]:border-l-4 [&>blockquote]:border-[#780000] [&>blockquote]:pl-5 [&>blockquote]:italic [&>blockquote]:text-zinc-400 [&>blockquote]:my-8 [&>blockquote]:text-xl
              [&>img]:rounded-3xl [&>img]:w-full [&>img]:my-10 [&>img]:border [&>img]:border-white/10 [&>img]:shadow-2xl
            "
            dangerouslySetInnerHTML={{ __html: (post.content || "").replace(/&nbsp;/g, " ") }}
          />
        </FadeIn>
      </article>
      
    </main>
  );
}