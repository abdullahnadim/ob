"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css"; 
import ImageUploader from "@/components/ImageUploader";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function AdminDashboard() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Trending");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [content, setContent] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  
  // This key forces the ImageUploader to clear its preview after publishing
  const [uploaderKey, setUploaderKey] = useState(Date.now()); 

  // Auto-generate slug from title (Fully supports Bengali & English)
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    const generatedSlug = newTitle
      .trim()
      .toLowerCase()
      // \p{L}: Letters, \p{N}: Numbers, \p{M}: Bengali Vowel/Consonant marks (কার ও হসন্ত)
      .replace(/[^\p{L}\p{N}\p{M}\s-]/gu, "") 
      // Replace spaces with hyphens
      .replace(/[\s]+/g, "-")
      // Ensure no double-hyphens
      .replace(/-+/g, "-");

    setSlug(generatedSlug);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent publishing if the user forgot to upload an image
    if (!thumbnailUrl) {
      alert("⚠️ Please upload a cover image first!");
      return;
    }

    setIsPublishing(true);

    try {
      await addDoc(collection(db, "posts"), {
        title,
        slug,
        category,
        thumbnailUrl, // Safely holds your ImgBB URL
        content,
        views: 0,
        createdAt: serverTimestamp(),
      });
      
      alert("🔥 Post Published Successfully!");
      
      // Reset form
      setTitle("");
      setSlug("");
      setThumbnailUrl("");
      setContent("");
      setUploaderKey(Date.now()); // Clears the drag-and-drop preview
    } catch (error) {
      console.error("Error publishing:", error);
      alert("Failed to publish post.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="pt-24 pb-32 px-4 max-w-5xl mx-auto">
      <div className="obsidian-glass p-8 md:p-12 rounded-3xl border border-white/5 shadow-2xl">
        <h2 className="text-3xl font-black mb-10 text-white uppercase tracking-tight">
          Create New <span className="text-[#FF3B30]">Post</span>
        </h2>
        
        <form onSubmit={handlePublish} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* TITLE */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Post Title</label>
              <input 
                type="text" required value={title} onChange={handleTitleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FF3B30] focus:bg-white/10 outline-none transition-all shadow-inner"
                placeholder="Enter a catchy title..."
              />
            </div>

            {/* SLUG (URL) */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">URL Slug</label>
              <input 
                type="text" required value={slug} onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 text-zinc-500 outline-none shadow-inner"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* CATEGORY */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Category</label>
              <select 
                value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FF3B30] focus:bg-white/10 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="Trending" className="bg-[#050505] text-white">Trending</option>
                <option value="Memes" className="bg-[#050505] text-white">Memes</option>
                <option value="Satire" className="bg-[#050505] text-white">Satire</option>
                <option value="Tech" className="bg-[#050505] text-white">Tech</option>
                <option value="Gaming" className="bg-[#050505] text-white">Gaming</option>
                <option value="Awareness" className="bg-[#050505] text-white">Awareness</option>
              </select>
            </div>

            {/* DIRECT IMAGE UPLOADER */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">Cover Image</label>
              
              {/* Note the key prop here. It forces React to refresh the uploader when we publish! */}
              <ImageUploader 
                key={uploaderKey} 
                onUploadSuccess={(url) => setThumbnailUrl(url)} 
              />
              
            </div>
          </div>

          {/* RICH TEXT EDITOR */}
          <div className="space-y-3 pb-10">
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

          <button 
            type="submit" 
            disabled={isPublishing}
            className="w-full bg-[#FF3B30] hover:bg-red-600 text-white font-black uppercase tracking-widest text-lg py-5 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-[0_0_40px_rgba(255,59,48,0.2)] hover:shadow-[0_0_60px_rgba(255,59,48,0.4)]"
          >
            {isPublishing ? "Uploading to Void..." : "Publish Post 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}