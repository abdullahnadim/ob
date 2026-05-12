"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
// 🚀 ONE clean line of imports to prevent duplication errors!
import { PenBox, FolderTree, Settings, Globe, LogOut, FileText, Mail } from "lucide-react";

export default function AdminNavigation() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut(auth);
  };

  const navLinks = [
    { name: "Write", path: "/admin", icon: <PenBox size={20} /> },
    { name: "Posts", path: "/admin/posts", icon: <FileText size={20} /> },
    { name: "Inbox", path: "/admin/inbox", icon: <Mail size={20} /> },
    { name: "Categories", path: "/admin/categories", icon: <FolderTree size={20} /> },
    { name: "Settings", path: "/admin/profile", icon: <Settings size={20} /> },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-[#050505] border-r border-white/10 z-50">
        <div className="p-6 border-b border-white/10">
          <Link href="/admin">
            <h2 className="text-xl font-black text-white uppercase tracking-widest">
              Studio <span className="text-[#FF3B30]">OB</span>
            </h2>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Admin Control</p>
          </Link>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.name}
                href={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 ${
                  isActive
                    ? "bg-[#FF3B30] text-white shadow-[0_0_15px_rgba(255,59,48,0.3)]"
                    : "text-zinc-500 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <Link href="/" target="_blank" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-zinc-500 hover:bg-white/5 hover:text-white transition-all">
            <Globe size={20} /> View Site
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-zinc-500 hover:bg-red-500/10 hover:text-red-500 transition-all text-left">
            <LogOut size={20} /> Log Out
          </button>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-[#050505]/90 backdrop-blur-xl border-t border-white/10 z-50 pb-safe">
        <div className="flex items-center justify-around px-2 py-3">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.name}
                href={link.path}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
                  isActive ? "text-[#FF3B30]" : "text-zinc-500 hover:text-white"
                }`}
              >
                {link.icon}
                <span className="text-[9px] font-bold uppercase tracking-widest">{link.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}