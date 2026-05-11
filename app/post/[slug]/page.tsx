import { app } from "@/lib/firebase";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore/lite";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/Logo";
import FadeIn from "@/components/FadeIn";
import { Flame, Share2, ArrowLeft } from "lucide-react";

// 1. INITIALIZE THE SAFE SERVER-SIDE DATABASE
const dbServer = getFirestore(app);

// 2. SAFELY FETCH THE POST DATA (NO GRPC ERRORS!)
async function getPost(slug: string) {
  try {
    const postsRef = collection(dbServer, "posts");
    const q = query(postsRef, where("slug", "==", slug));
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

// 4. THE LIQUID GLASS PAGE COMPONENT
export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.slug);

  if (!post) {
    notFound(); 
  }

  return (
    <main className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] pb-32 overflow-hidden">
      {/* FLOATING GLASS NAVBAR */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/60 backdrop-blur-2xl border-b border-white/50 h-16 flex items-center px-4 md:px-8 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors bg-white/50 px-4 py-2 rounded-full shadow-sm border border-gray-200/50 hover:shadow-md hover:-translate-y-0.5 duration-300">
          <ArrowLeft size={18} />
          <span className="font-semibold text-sm">Back to Feed</span>
        </Link>
      </nav>

      {/* CINEMATIC HERO SECTION */}
      <div className="relative w-full max-w-5xl mx-auto mt-24 px-4 md:px-8">
        <FadeIn delay={0.1}>
          <div className="relative w-full aspect-[4/3] md:aspect-[21/9] rounded-[2.5rem] overflow-hidden shadow-xl bg-gray-200">
            <Image 
              src={post.thumbnailUrl || "/placeholder.jpg"} 
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </FadeIn>
        
        {/* Floating Title Card */}
        <FadeIn delay={0.2}>
          <div className="relative -mt-16 md:-mt-24 mx-4 md:mx-12 liquid-glass rounded-3xl p-6 md:p-10 shadow-2xl z-10">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="bg-[#FF3B30] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
                {post.category || "Trending"}
              </span>
              <span className="text-gray-500 text-sm font-semibold flex items-center gap-1.5 bg-gray-100/80 px-3 py-1.5 rounded-full border border-gray-200">
                <Flame size={16} className="text-[#FF3B30]" /> {post.views || 0} Views
              </span>
            </div>
            <h1 className="font-bengali text-3xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
              {post.title}
            </h1>
          </div>
        </FadeIn>
      </div>

      {/* RICH TEXT CONTENT */}
      <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <FadeIn delay={0.3}>
          <div className="flex items-center justify-between border-b border-gray-200 pb-6 mb-10">
            <div className="flex items-center gap-4">
              
              {/* THE NEW BREATHING LOGO */}
              <Logo />
              
              <div>
                <p className="font-bold text-sm text-gray-900">Osthir Desk</p>
                <p className="text-xs text-gray-500 font-medium">
                  {post.createdAt ? new Date(post.createdAt.toDate?.() || post.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }) : "Recently Published"}
                </p>
              </div>
            </div>

            <button className="flex items-center gap-2 bg-white hover:bg-gray-50 shadow-sm border border-gray-200 px-5 py-2.5 rounded-full text-sm font-bold text-gray-700 transition-all hover:shadow-md hover:-translate-y-0.5">
              <Share2 size={16} /> Share
            </button>
          </div>
        </FadeIn>

        {/* 
          The Tailwind Typography plugin automatically styles the HTML here. 
        */}
        <FadeIn delay={0.4}>
          <div 
            className="prose prose-gray prose-lg max-w-none font-bengali 
                       prose-headings:font-bold prose-headings:text-gray-900 prose-headings:tracking-tight
                       prose-p:text-gray-700 prose-p:leading-relaxed
                       prose-a:text-[#FF3B30] prose-a:no-underline hover:prose-a:underline
                       prose-img:rounded-[2rem] prose-img:shadow-md"
            dangerouslySetInnerHTML={{ __html: post.content || "" }}
          />
        </FadeIn>
      </article>
    </main>
  );
}