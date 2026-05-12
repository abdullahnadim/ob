"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase"; // Ensure auth is exported from your firebase.ts
import { onAuthStateChanged, updateProfile, updatePassword, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { User as UserIcon, Lock, ShieldCheck } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [displayName, setDisplayName] = useState("");
  const [nickname, setNickname] = useState("");
  const [displayPreference, setDisplayPreference] = useState("main"); // "main" or "nickname"
  const [newPassword, setNewPassword] = useState("");

  // 🚀 1. Listen for the logged-in user and fetch their extra data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || "");

        // Fetch extra data (nickname) from Firestore 'users' collection
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          setNickname(data.nickname || "");
          setDisplayPreference(data.displayPreference || "main");
        }
      } else {
        // Redirect to login if not logged in
        window.location.href = "/admin"; // Or wherever your login page is
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🚀 2. Handle Profile Saving
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      // A. Update Firebase Auth Profile (Main Name)
      if (displayName !== user.displayName) {
        await updateProfile(user, { displayName });
      }

      // B. Update Firestore (Nickname & Preference)
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        nickname,
        displayPreference,
        updatedAt: new Date(),
      }, { merge: true });

      // C. Update Password (if they typed a new one)
      if (newPassword) {
        await updatePassword(user, newPassword);
        setNewPassword(""); // Clear the password field after success
        alert("🔒 Password updated successfully!");
      }

      alert("✅ Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      // Firebase requires a "recent login" to change passwords. Catch that specific error.
      if (error.code === 'auth/requires-recent-login') {
        alert("⚠️ You need to log out and log back in to change your password for security reasons.");
      } else {
        alert("❌ Failed to update profile.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-[#050505]" />; // Blank screen while checking auth

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-32 px-4 flex flex-col items-center">
      
      <div className="w-full max-w-2xl obsidian-glass p-8 md:p-12 rounded-[2rem] border border-white/10 shadow-2xl">
        
        <div className="flex items-center gap-4 mb-10 border-b border-white/10 pb-6">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
            <UserIcon size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-widest">
              Author <span className="text-[#FF3B30]">Profile</span>
            </h1>
            <p className="text-zinc-500 text-sm font-bold tracking-widest mt-1">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-8">
          
          {/* SECTION: Identity */}
          <div className="space-y-6">
            <h3 className="text-[#FF3B30] text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={14} /> Public Identity
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Main Name (Legal/Real)</label>
                <input 
                  type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FF3B30] outline-none transition-all shadow-inner"
                  placeholder="E.g. John Doe"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Nickname (Anonymous)</label>
                <input 
                  type="text" value={nickname} onChange={(e) => setNickname(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FF3B30] outline-none transition-all shadow-inner"
                  placeholder="E.g. GhostWriter99"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Which name should appear on your posts?</label>
              <select 
                value={displayPreference} onChange={(e) => setDisplayPreference(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FF3B30] outline-none appearance-none cursor-pointer"
              >
                <option value="main" className="bg-[#050505]">Use Main Name ({displayName || "Not set"})</option>
                <option value="nickname" className="bg-[#050505]">Use Nickname ({nickname || "Not set"})</option>
              </select>
            </div>
          </div>

          {/* SECTION: Security */}
          <div className="space-y-6 pt-6 border-t border-white/10">
            <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Lock size={14} /> Security
            </h3>

            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Change Password (Leave blank to keep current)</label>
              <input 
                type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FF3B30] outline-none transition-all shadow-inner"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* SUBMIT */}
          <button 
            type="submit" disabled={isSaving}
            className="w-full mt-8 bg-[#FF3B30] hover:bg-red-600 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-[0_0_20px_rgba(255,59,48,0.2)]"
          >
            {isSaving ? "Saving..." : "Save Profile Changes"}
          </button>

        </form>
      </div>
    </div>
  );
}