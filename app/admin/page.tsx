"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css"; 
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function AdminDashboard() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Trending");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [content, setContent] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setSlug(newTitle.toLowerCase().trim().replace(/[\s\W-]+/g, "-"));
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);

    try {
      await addDoc(collection(db, "posts"), {
        title,
        slug,
        category,
        thumbnailUrl,
        content,
        views: 0, // Starts at 0 views
        createdAt: serverTimestamp(),
      });
      
      alert("🔥 Post Published Successfully!");
      
      // Reset form
      setTitle("");
      setSlug("");
      setThumbnailUrl("");
      setContent("");
    } catch (error) {
      console.error("Error publishing:", error);
      alert("Failed to publish post.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-zinc-900/30 p-6 md:p-8 rounded-3xl border border-white/5">
      <h2 className="text-3xl font-black mb-8 text-white">Create New Post</h2>
      
      <form onSubmit={handlePublish} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* TITLE */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-400">Post Title</label>
            <input 
              type="text" required value={title} onChange={handleTitleChange}
              className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
              placeholder="Enter a catchy title..."
            />
          </div>

          {/* SLUG (URL) */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-400">URL Slug</label>
            <input 
              type="text" required value={slug} onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CATEGORY */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-400">Category</label>
            <select 
              value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
            >
              <option value="Trending">Trending</option>
              <option value="Memes">Memes</option>
              <option value="Satire">Satire</option>
              <option value="Tech">Tech</option>
              <option value="Gaming">Gaming</option>
              <option value="Awareness">Awareness</option>
            </select>
          </div>

          {/* THUMBNAIL URL */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-400">Thumbnail Image URL</label>
            <input 
              type="url" required value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
              placeholder="https://imgur.com/... or Unsplash URL"
            />
          </div>
        </div>

        {/* RICH TEXT EDITOR */}
        <div className="space-y-2 pb-10">
          <label className="text-sm font-bold text-zinc-400">Article Content</label>
          <div className="bg-white rounded-xl overflow-hidden text-black">
            <ReactQuill 
              theme="snow" 
              value={content} 
              onChange={setContent} 
              className="h-64"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isPublishing}
          className="w-full bg-primary hover:bg-orange-600 text-white font-black text-lg py-4 rounded-xl transition-all disabled:opacity-50"
        >
          {isPublishing ? "Publishing to Homepage..." : "Publish Post Now 🚀"}
        </button>
      </form>
    </div>
  );
}