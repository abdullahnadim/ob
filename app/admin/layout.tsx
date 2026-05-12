"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { Lock, Loader2 } from "lucide-react";
import AdminNavigation from "./_components/AdminNavigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError("Invalid credentials. Nice try, hacker.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505]">
        <Loader2 size={40} className="text-[#FF3B30] animate-spin mb-4" />
        <span className="text-zinc-500 text-xs font-bold tracking-widest uppercase">Checking credentials...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4">
        <form onSubmit={handleLogin} className="w-full max-w-md obsidian-glass p-8 md:p-10 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#FF3B30] to-transparent opacity-50" />
          <div className="flex justify-center mb-6 text-[#FF3B30]">
            <div className="w-16 h-16 bg-[#FF3B30]/10 rounded-full flex items-center justify-center">
              <Lock size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-black text-center mb-8 text-white uppercase tracking-widest">Studio <span className="text-[#FF3B30]">Access</span></h1>
          {error && <p className="text-[#FF3B30] text-xs font-bold tracking-widest uppercase text-center mb-6 bg-[#FF3B30]/10 py-2 rounded-lg">{error}</p>}
          <input type="email" placeholder="Admin Email" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 mb-4 text-white focus:border-[#FF3B30] outline-none transition-colors" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 mb-8 text-white focus:border-[#FF3B30] outline-none transition-colors" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" className="w-full bg-[#FF3B30] hover:bg-red-600 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(255,59,48,0.2)]">Enter Command Center</button>
        </form>
      </div>
    );
  }

  // 📝 IF LOGGED IN: SHOW NEW DASHBOARD ARCHITECTURE
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      
      <AdminNavigation />
      
      {/* 🚀 THE FIX: md:pl-64 safely pads the exact width of the sidebar (16rem). 
          No flexbox, no calc math, just a solid block. */}
      <main className="w-full md:pl-64 pb-24 md:pb-0 min-h-screen overflow-x-hidden">
        {children}
      </main>

    </div>
  );
}