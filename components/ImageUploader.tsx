"use client";

import { useState, useCallback, useRef } from "react";
import { UploadCloud, Loader2, CheckCircle } from "lucide-react";
import Image from "next/image";

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void;
}

export default function ImageUploader({ onUploadSuccess }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ⚠️ PASTE YOUR IMGBB API KEY HERE! 
  const IMGBB_API_KEY = "11a8a10756622124d541e3ae9321d6a2"; 

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const uploadFile = (file: File) => {
    if (!file || !file.type.includes("image")) return;

    setIsUploading(true);
    setProgress(0);
    
    const formData = new FormData();
    formData.append("image", file);

    // We use XMLHttpRequest here instead of fetch() so we can perfectly 
    // track the upload progress for your red loading bar!
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const currentProgress = Math.round((event.loaded / event.total) * 100);
        setProgress(currentProgress);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        const downloadURL = response.data.url; // The direct image link!
        
        setPreviewUrl(downloadURL);
        setIsUploading(false);
        onUploadSuccess(downloadURL); // Sends link back to your Admin form
      } else {
        console.error("Upload failed", xhr.responseText);
        setIsUploading(false);
        alert("Upload failed. Check console.");
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      alert("Network error. Are you connected to the internet?");
    };

    xhr.send(formData);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  return (
    <div className="w-full">
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange}
      />
      
      {previewUrl ? (
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden obsidian-glass border border-white/10 group">
          <Image src={previewUrl} alt="Uploaded preview" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
            <button 
              type="button"
              onClick={() => {
                setPreviewUrl(null);
                onUploadSuccess(""); // Clear the form state too
              }}
              className="bg-[#FF3B30] hover:bg-red-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg transition-colors"
            >
              Remove Image
            </button>
          </div>
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10 shadow-xl">
            <CheckCircle size={16} className="text-green-400" />
            <span className="text-xs font-bold text-white uppercase tracking-widest">Uploaded</span>
          </div>
        </div>
      ) : (
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative aspect-video w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
            isDragging 
              ? "border-[#FF3B30] bg-[#FF3B30]/5 scale-[0.98]" 
              : "border-white/10 obsidian-glass hover:border-white/20 hover:bg-white/[0.02]"
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 size={32} className="text-[#FF3B30] animate-spin" />
              <div className="text-center">
                <p className="text-sm font-bold text-white uppercase tracking-widest mb-2">Uploading Protocol</p>
                <div className="w-48 h-2 bg-black rounded-full overflow-hidden border border-white/10">
                  <div 
                    className="h-full bg-[#FF3B30] transition-all duration-300 ease-out shadow-[0_0_10px_rgba(255,59,48,0.8)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-zinc-500 group">
              <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center border border-white/5 group-hover:scale-110 group-hover:border-white/20 transition-all duration-500 shadow-inner">
                <UploadCloud size={28} className="text-zinc-400 group-hover:text-white transition-colors" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-zinc-300">Click or drag & drop</p>
                <p className="text-xs mt-1 uppercase tracking-widest opacity-50">JPG, PNG, WEBP (Max 32MB)</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}