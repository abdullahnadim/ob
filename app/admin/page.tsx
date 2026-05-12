"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase"; 
import { onAuthStateChanged, User } from "firebase/auth";
// 🚀 ADDED getDocs to the imports
import { collection, addDoc, serverTimestamp, doc, getDoc, getDocs } from "firebase/firestore";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css"; 
import ImageUploader from "@/components/ImageUploader";
import { ShieldAlert, Loader2, Flame, Check } from "lucide-react"; 

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function AdminDashboard() {
  // 🔒 REAL FIREBASE AUTH STATE
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  
  // AUTHOR PROFILE DATA
  const [authorName, setAuthorName] = useState("Osthir Desk");

  // POST STATE
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [content, setContent] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  
  // TRENDING STATE
  const [isTrending, setIsTrending] = useState(false);
  
  // DYNAMIC CATEGORY STATE
  const [availableCategories, setAvailableCategories] = useState<{name: string, subcategories: string[]}[]>([]);
  
  // CATEGORY STATE
  const [category, setCategory] = useState("Trending");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  
  const [uploaderKey, setUploaderKey] = useState(Date.now()); 

  // 1. LISTEN FOR AUTHENTICATED USER & FETCH PROFILE + CATEGORIES
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        try {
          // Fetch Author Name
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            const preferredName = data.displayPreference === "nickname" && data.nickname 
              ? data.nickname 
              : (currentUser.displayName || "Anonymous Author");
              
            setAuthorName(preferredName);
          } else {
            setAuthorName(currentUser.displayName || "Anonymous Author");
          }

          // 🚀 FETCH DYNAMIC CATEGORIES
          const catSnapshot = await getDocs(collection(db, "categories"));
          const cats: any[] = [];
          catSnapshot.forEach(catDoc => Object.assign(cats, [...cats, catDoc.data()]));
          
          // Using a Set to remove duplicates in case of strict mode firing twice, and sorting
          const uniqueCats = Array.from(new Set(cats.map(a => a.name)))
            .map(name => cats.find(a => a.name === name))
            .sort((a, b) => a.name.localeCompare(b.name));
            
          setAvailableCategories(uniqueCats);

        } catch (error) {
          console.error("Failed to fetch user data or categories:", error);
          setAuthorName(currentUser.displayName || "Anonymous Author");
        }
      } else {
        setUser(null);
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    const generatedSlug = newTitle
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\p{M}\s-]/gu, "") 
      .replace(/[\s]+/g, "-")
      .replace(/-+/g, "-");
    setSlug(generatedSlug);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("⚠️ You must be logged in to publish.");
      return;
    }

    if (!thumbnailUrl) {
      alert("⚠️ Please upload a cover image first!");
      return;
    }

    const finalCategory = isCustomCategory ? customCategory.trim() : category;

    if (!finalCategory) {
      alert("⚠️ Please provide a category!");
      return;
    }

    setIsPublishing(true);

    try {
      await addDoc(collection(db, "posts"), {
        title,
        slug,
        category: finalCategory,
        authorId: user.uid, 
        authorName: authorName, 
        thumbnailUrl, 
        content,
        views: 0,
        isTrending,
        createdAt: serverTimestamp(),
      });
      
      alert("🔥 Post Published Successfully!");
      
      // Reset form
      setTitle("");
      setSlug("");
      setThumbnailUrl("");
      setContent("");
      setCustomCategory("");
      setIsCustomCategory(false);
      setCategory("Trending");
      setIsTrending(false); 
      setUploaderKey(Date.now()); 
    } catch (error) {
      console.error("Error publishing:", error);
      alert("Failed to publish post.");
    } finally {
      setIsPublishing(false);
    }
  };

  // 🔄 LOADING STATE
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 size={48} className="text-[#780000] animate-spin" />
      </div>
    );
  }

  // 🚫 DENY ACCESS IF NOT LOGGED IN
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#050505]">
        <div className="obsidian-glass p-8 md:p-12 rounded-3xl border border-[#780000]/30 shadow-2xl flex flex-col items-center max-w-md text-center">
          <ShieldAlert size={48} className="text-[#780000] mb-6" />
          <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-4">Access Denied</h2>
          <p className="text-zinc-400 mb-8">You must be an authenticated author to access the Studio. Please log in to continue.</p>
          <a href="/login" className="w-full bg-[#780000] hover:bg-red-600 text-white font-bold uppercase tracking-widest py-4 rounded-xl transition-all block">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // 📝 RENDER THE MAIN DASHBOARD
  return (
    <div className="pt-24 pb-32 px-4 max-w-5xl mx-auto">
      <div className="obsidian-glass p-8 md:p-12 rounded-3xl border border-white/5 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">
            Create New <span className="text-[#780000]">Post</span>
          </h2>
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-full flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-zinc-300">Posting as: <span className="text-white">{authorName}</span></span>
          </div>
        </div>
        
        <form onSubmit={handlePublish} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Post Title</label>
              <input 
                type="text" required value={title} onChange={handleTitleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#780000] focus:bg-white/10 outline-none transition-all shadow-inner"
                placeholder="Enter a catchy title..."
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
                    if (e.target.value === "CUSTOM") {
                      setIsCustomCategory(true);
                    } else {
                      setCategory(e.target.value);
                    }
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#780000] focus:bg-white/10 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="Trending" className="bg-[#050505] text-white font-bold">🔥 Trending Main</option>
                  
                  {/* 🚀 Render Dynamic Categories from Firebase */}
                  {availableCategories.map((cat, idx) => (
                    <optgroup key={idx} label={`── ${cat.name.toUpperCase()} ──`} className="bg-[#050505] text-[#780000] font-black uppercase tracking-widest">
                      {/* Parent Category Option */}
                      <option value={cat.name} className="text-white font-medium capitalize">
                        {cat.name} (General)
                      </option>
                      
                      {/* Subcategory Options */}
                      {cat.subcategories && cat.subcategories.map((sub, subIdx) => (
                        <option key={subIdx} value={`${cat.name} > ${sub}`} className="text-zinc-300 capitalize">
                          ↳ {sub}
                        </option>
                      ))}
                    </optgroup>
                  ))}

                  <option value="CUSTOM" className="bg-[#780000] text-white font-bold mt-4">➕ Add Custom Category...</option>
                </select>
              ) : (
                <div className="flex items-center gap-2">
                  <input 
                    type="text" required value={customCategory} onChange={(e) => setCustomCategory(e.target.value)}
                    autoFocus
                    className="w-full bg-white/5 border border-[#780000] rounded-xl px-4 py-3 text-white outline-none shadow-[0_0_15px_rgba(255,59,48,0.2)]"
                    placeholder="Type new category..."
                  />
                  <button 
                    type="button" 
                    onClick={() => setIsCustomCategory(false)}
                    className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">Cover Image</label>
              <ImageUploader 
                key={uploaderKey} 
                onUploadSuccess={(url) => setThumbnailUrl(url)} 
              />
            </div>
          </div>

          <div className="space-y-3 pb-4">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Article Content</label>
            <div className="bg-zinc-100 rounded-xl overflow-hidden text-black border border-white/10">
              <ReactQuill 
                theme="snow" 
                value={content} 
                onChange={setContent} 
                className="h-[300px] mb-12"
              />
            </div>
          </div>

          {/* 🚀 THE TRENDING TOGGLE UI */}
          <div 
            onClick={() => setIsTrending(!isTrending)}
            className={`flex items-center gap-4 p-5 rounded-xl border cursor-pointer transition-all duration-300 ${
              isTrending ? "bg-[#780000]/10 border-[#780000]" : "bg-white/5 border-white/10 hover:border-white/20"
            }`}
          >
            <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
              isTrending ? "bg-[#780000]" : "bg-black/50 border border-white/20"
            }`}>
              {isTrending && <Check size={14} className="text-white" />}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                Push to Trending <Flame size={16} className={isTrending ? "text-[#780000] fill-[#780000]" : "text-zinc-500"} />
              </span>
              <span className="text-[10px] text-zinc-400 mt-1">
                Post will stay on the 🔥 Trending page for exactly 7 days before expiring to standard feeds.
              </span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isPublishing}
            className="w-full bg-[#780000] hover:bg-red-600 text-white font-black uppercase tracking-widest text-lg py-5 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-[0_0_40px_rgba(255,59,48,0.2)] hover:shadow-[0_0_60px_rgba(255,59,48,0.4)]"
          >
            {isPublishing ? "Uploading to Void..." : "Publish Post 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}