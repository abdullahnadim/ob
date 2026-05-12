"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { ShieldAlert, Loader2, FileText, Trash2, Edit3, Flame, Eye, ExternalLink } from "lucide-react";

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

export default function ManagePosts() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) fetchPosts();
      else setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

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

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to completely delete "${title}"?`)) return;
    setIsDeleting(id);
    try {
      await deleteDoc(doc(db, "posts", id));
      setPosts(posts.filter(post => post.id !== id));
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#050505]"><Loader2 size={48} className="text-[#780000] animate-spin" /></div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center bg-[#050505]"><ShieldAlert size={48} className="text-[#780000]" /></div>;

  return (
    // 🚀 THE FIX: flex flex-col items-center forces the inner div to stay dead center
    <div className="pt-24 md:pt-12 pb-32 px-4 md:px-8 w-full min-h-screen flex flex-col items-center">
      
      {/* 🚀 THE FIX: max-w-3xl mimics the width of your public feed perfectly! */}
      <div className="w-full max-w-3xl">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#780000] shrink-0">
              <FileText size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-widest">
                Manage <span className="text-[#780000]">Posts</span>
              </h1>
              <p className="text-zinc-500 text-sm font-bold tracking-widest mt-1">
                {posts.length} Published Articles
              </p>
            </div>
          </div>
          <Link href="/admin">
            <button className="bg-[#780000] hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest transition-colors shrink-0">
              + New Post
            </button>
          </Link>
        </div>

        <div className="space-y-4 w-full">
          {posts.map((post) => (
            <div key={post.id} className="obsidian-glass p-4 rounded-2xl border border-white/5 grid grid-cols-1 md:grid-cols-[160px_1fr_auto] gap-4 md:gap-6 items-center w-full overflow-hidden">
              
              {/* THUMBNAIL */}
              <div className="relative w-full h-48 md:h-[100px] rounded-xl overflow-hidden bg-black">
                <Image 
                  src={post.thumbnailUrl || "/placeholder.jpg"} 
                  alt={post.title} 
                  fill 
                  className="object-cover opacity-80"
                  unoptimized
                />
                {post.isTrending && (
                  <div className="absolute top-2 left-2 bg-[#780000] w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                    <Flame size={12} className="text-white fill-white" />
                  </div>
                )}
              </div>

              {/* TEXT INFO */}
              <div className="flex flex-col justify-center min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-white/10 text-zinc-300 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest shrink-0">
                    {post.category}
                  </span>
                  <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest truncate">
                    By {post.authorName}
                  </span>
                </div>
                
                <h3 className="text-white font-black text-lg leading-snug mb-2 truncate">
                  {post.title}
                </h3>
                
                <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Eye size={14} /> {post.views || 0} Views</span>
                  <span>{post.createdAt ? new Date(post.createdAt.toDate?.() || post.createdAt).toLocaleDateString() : "Just now"}</span>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center justify-end gap-2 pt-4 md:pt-0 border-t border-white/5 md:border-transparent">
                <Link href={`/post/${post.slug}`} target="_blank">
                  <button className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors">
                    <ExternalLink size={16} />
                  </button>
                </Link>
                
                <Link href={`/admin/edit/${post.id}`}>
                  <button className="w-10 h-10 rounded-xl bg-white/5 hover:bg-[#780000]/20 text-zinc-400 hover:text-[#780000] flex items-center justify-center transition-colors">
                    <Edit3 size={16} />
                  </button>
                </Link>

                <button 
                  onClick={() => handleDelete(post.id, post.title)}
                  disabled={isDeleting === post.id}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-500 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  {isDeleting === post.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>

            </div>
          ))}

          {posts.length === 0 && (
            <div className="text-center py-20 obsidian-glass rounded-3xl border border-white/5">
              <p className="text-zinc-500 font-bold uppercase tracking-widest">No posts published yet.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}