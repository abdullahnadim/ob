"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase"; 
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, updateDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";
import dynamic from "next/dynamic";
import Image from "next/image";
import "react-quill-new/dist/quill.snow.css"; 
import ImageUploader from "@/components/ImageUploader";
import { ShieldAlert, Loader2, Flame, Check, ArrowLeft, Save } from "lucide-react"; 

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  // 🔒 AUTH & LOADING STATE
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // POST STATE
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [content, setContent] = useState("");
  const [isTrending, setIsTrending] = useState(false);
  
  // CATEGORY STATE
  const [availableCategories, setAvailableCategories] = useState<{name: string, subcategories: string[]}[]>([]);
  const [category, setCategory] = useState("Trending");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  
  const [uploaderKey, setUploaderKey] = useState(Date.now()); 

  // 1. INITIALIZATION: Check Auth, Fetch Categories, Fetch Post Data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      setUser(currentUser);

      try {
        // A. Fetch Dynamic Categories
        const catSnapshot = await getDocs(collection(db, "categories"));
        const cats: any[] = [];
        catSnapshot.forEach(catDoc => Object.assign(cats, [...cats, catDoc.data()]));
        const uniqueCats = Array.from(new Set(cats.map(a => a.name)))
          .map(name => cats.find(a => a.name === name))
          .sort((a, b) => a.name.localeCompare(b.name));
        setAvailableCategories(uniqueCats);

        // B. Fetch the specific post we are editing
        if (postId) {
          const postRef = doc(db, "posts", postId);
          const postSnap = await getDoc(postRef);

          if (postSnap.exists()) {
            const data = postSnap.data();
            setTitle(data.title || "");
            setSlug(data.slug || "");
            setThumbnailUrl(data.thumbnailUrl || "");
            setContent(data.content || "");
            setIsTrending(data.isTrending || false);
            
            // Handle Category assignment
            setCategory(data.category || "Trending");
          } else {
            setError("Post not found. It may have been deleted.");
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load post data.");
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [postId]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    // Auto-generate slug just like the create page
    const generatedSlug = newTitle
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\p{M}\s-]/gu, "") 
      .replace(/[\s]+/g, "-")
      .replace(/-+/g, "-");
    setSlug(generatedSlug);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!thumbnailUrl) {
      alert("⚠️ Cover image is required!");
      return;
    }

    const finalCategory = isCustomCategory ? customCategory.trim() : category;

    if (!finalCategory) {
      alert("⚠️ Please provide a category!");
      return;
    }

    setIsSaving(true);

    try {
      const postRef = doc(db, "posts", postId);
      
      // 🚀 THE FIX: Use updateDoc instead of addDoc!
      await updateDoc(postRef, {
        title,
        slug,
        category: finalCategory,
        thumbnailUrl, 
        content,
        isTrending,
        updatedAt: serverTimestamp(), // Track when it was edited
      });
      
      alert("✅ Post Updated Successfully!");
      router.push("/admin/posts"); // Send them back to the manager!
      
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Failed to update post.");
    } finally {
      setIsSaving(false);
    }
  };

  // 🔄 LOADING STATE
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#050505]"><Loader2 size={48} className="text-[#780000] animate-spin" /></div>;
  }

  // 🚫 ERROR / NOT FOUND STATE
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4">
        <div className="obsidian-glass p-8 text-center rounded-3xl border border-white/10 max-w-md">
          <ShieldAlert size={48} className="text-[#780000] mx-auto mb-4" />
          <h2 className="text-xl font-black text-white uppercase tracking-widest mb-2">Error</h2>
          <p className="text-zinc-400 mb-6">{error}</p>
          <button onClick={() => router.push("/admin/posts")} className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl font-bold transition-colors">Go Back</button>
        </div>
      </div>
    );
  }

  // 🚫 DENY ACCESS IF NOT LOGGED IN
  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4"><ShieldAlert size={48} className="text-[#780000]" /></div>;
  }

  // 📝 RENDER THE EDITOR
  return (
    <div className="pt-24 pb-32 px-4 max-w-5xl mx-auto">
      
      {/* 🚀 BACK BUTTON */}
      <button 
        onClick={() => router.push("/admin/posts")}
        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6 font-bold uppercase tracking-widest text-xs"
      >
        <ArrowLeft size={16} /> Back to Posts
      </button>

      <div className="obsidian-glass p-8 md:p-12 rounded-3xl border border-[#780000]/20 shadow-2xl relative overflow-hidden">
        
        {/* Subtle red gradient indicating Edit Mode */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#780000] to-transparent opacity-50" />

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">
              Edit <span className="text-[#780000]">Post</span>
            </h2>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">ID: {postId}</p>
          </div>
        </div>
        
        <form onSubmit={handleUpdate} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Post Title</label>
              <input 
                type="text" required value={title} onChange={handleTitleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#780000] outline-none transition-all shadow-inner"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">URL Slug</label>
              <input 
                type="text" required value={slug} onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 text-zinc-500 outline-none shadow-inner"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Category</label>
              {!isCustomCategory ? (
                <select 
                  value={category} 
                  onChange={(e) => {
                    if (e.target.value === "CUSTOM") setIsCustomCategory(true);
                    else setCategory(e.target.value);
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#780000] outline-none transition-all cursor-pointer"
                >
                  <option value="Trending" className="bg-[#050505] text-white font-bold">🔥 Trending Main</option>
                  
                  {availableCategories.map((cat, idx) => (
                    <optgroup key={idx} label={`── ${cat.name.toUpperCase()} ──`} className="bg-[#050505] text-[#780000] font-black uppercase tracking-widest">
                      <option value={cat.name} className="text-white font-medium capitalize">{cat.name} (General)</option>
                      {cat.subcategories && cat.subcategories.map((sub, subIdx) => (
                        <option key={subIdx} value={`${cat.name} > ${sub}`} className="text-zinc-300 capitalize">↳ {sub}</option>
                      ))}
                    </optgroup>
                  ))}
                  <option value="CUSTOM" className="bg-[#780000] text-white font-bold mt-4">➕ Add Custom Category...</option>
                </select>
              ) : (
                <div className="flex items-center gap-2">
                  <input 
                    type="text" required value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} autoFocus
                    className="w-full bg-white/5 border border-[#780000] rounded-xl px-4 py-3 text-white outline-none"
                    placeholder="Type new category..."
                  />
                  <button type="button" onClick={() => setIsCustomCategory(false)} className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white text-xs font-bold">Cancel</button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">Cover Image</label>
              
              {/* 🚀 Shows the current image so the user knows what is already saved! */}
              {thumbnailUrl && (
                <div className="flex items-center gap-4 p-3 bg-black/50 border border-white/5 rounded-xl mb-3">
                  <div className="relative w-16 h-10 rounded-md overflow-hidden bg-black shrink-0">
                    <Image src={thumbnailUrl} alt="Current" fill className="object-cover" unoptimized />
                  </div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Current Image</span>
                </div>
              )}

              <ImageUploader 
                key={uploaderKey} 
                onUploadSuccess={(url) => setThumbnailUrl(url)} 
              />
            </div>
          </div>

          <div className="space-y-3 pb-4">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Article Content</label>
            <div className="bg-zinc-100 rounded-xl overflow-hidden text-black border border-white/10">
              <ReactQuill theme="snow" value={content} onChange={setContent} className="h-[300px] mb-12" />
            </div>
          </div>

          <div onClick={() => setIsTrending(!isTrending)} className={`flex items-center gap-4 p-5 rounded-xl border cursor-pointer transition-all duration-300 ${isTrending ? "bg-[#780000]/10 border-[#780000]" : "bg-white/5 border-white/10 hover:border-white/20"}`}>
            <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${isTrending ? "bg-[#780000]" : "bg-black/50 border border-white/20"}`}>
              {isTrending && <Check size={14} className="text-white" />}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                Push to Trending <Flame size={16} className={isTrending ? "text-[#780000] fill-[#780000]" : "text-zinc-500"} />
              </span>
              <span className="text-[10px] text-zinc-400 mt-1">
                If checked, this post will jump to the top of the Trending page.
              </span>
            </div>
          </div>

          <button type="submit" disabled={isSaving} className="w-full bg-[#780000] hover:bg-red-600 text-white font-black uppercase tracking-widest text-lg py-5 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-[0_0_40px_rgba(255,59,48,0.2)] flex justify-center items-center gap-2">
            {isSaving ? <Loader2 size={24} className="animate-spin" /> : <><Save size={20} /> Save Changes</>}
          </button>
        </form>
      </div>
    </div>
  );
}