"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { Lock } from "lucide-react";

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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Checking credentials...</div>;

  // IF NOT LOGGED IN: SHOW LOGIN SCREEN
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-4">
        <form onSubmit={handleLogin} className="w-full max-w-md bg-zinc-900/50 p-8 rounded-3xl border border-white/10 glass">
          <div className="flex justify-center mb-6 text-primary">
            <Lock size={40} />
          </div>
          <h1 className="text-2xl font-bold text-center mb-6">Admin Access</h1>
          
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          
          <input
            type="email"
            placeholder="Admin Email"
            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 mb-4 text-white focus:border-primary outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 mb-6 text-white focus:border-primary outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-colors">
            Enter Command Center
          </button>
        </form>
      </div>
    );
  }

  // IF LOGGED IN: SHOW DASHBOARD
  return (
    <div className="min-h-screen bg-black">
      <header className="bg-zinc-900 border-b border-white/5 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Osthir<span className="text-primary">Admin</span></h1>
        <button onClick={() => signOut(auth)} className="text-sm text-zinc-400 hover:text-white">
          Sign Out
        </button>
      </header>
      <main className="p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}