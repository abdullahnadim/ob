"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PenBox, FolderTree, Settings, Globe, LogOut, FileText } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export default function AdminNavigation() {
  const pathname = usePathname();

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out?")) {
      await signOut(auth);
      window.location.href = "/";
    }
  };

  const navLinks = [
    { name: "Write", path: "/admin", icon: <PenBox size={20} /> },
    { name: "Posts", path: "/admin/posts", icon: <FileText size={20} /> }, 
    { name: "Categories", path: "/admin/categories", icon: <FolderTree size={20} /> },
    { name: "Settings", path: "/admin/profile", icon: <Settings size={20} /> },
  ];

  return (
    <>
      {/* 💻 DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 w-64 h-screen obsidian-glass border-r border-white/5 z-50 p-6 bg-[#050505]">
        <div className="mb-10 pl-2">
          <h2 className="text-2xl font-black text-white uppercase tracking-widest">
            Studio <span className="text-[#FF3B30]">OB</span>
          </h2>
          <p className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase mt-1">Admin Control</p>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link key={link.name} href={link.path}>
                <div className={`flex items-center gap-4 px-4 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all duration-300 ${
                  isActive 
                    ? "bg-[#FF3B30] text-white shadow-[0_0_15px_rgba(255,59,48,0.3)]" 
                    : "text-zinc-500 hover:text-white hover:bg-white/5"
                }`}>
                  {link.icon}
                  {link.name}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col gap-2 pt-6 border-t border-white/5">
          <Link href="/">
            <div className="flex items-center gap-4 px-4 py-3 rounded-xl font-bold uppercase tracking-widest text-xs text-zinc-500 hover:text-white hover:bg-white/5 transition-all">
              <Globe size={20} /> View Site
            </div>
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-4 px-4 py-3 rounded-xl font-bold uppercase tracking-widest text-xs text-zinc-500 hover:text-[#FF3B30] hover:bg-white/5 transition-all w-full text-left">
            <LogOut size={20} /> Log Out
          </button>
        </div>
      </aside>

      {/* 📱 MOBILE BOTTOM BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full obsidian-glass bg-[#050505]/90 backdrop-blur-md border-t border-white/10 z-50 px-6 py-4 pb-safe flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
        {navLinks.map((link) => {
          const isActive = pathname === link.path;
          return (
            <Link key={link.name} href={link.path}>
              <div className={`flex flex-col items-center gap-1 transition-colors ${
                isActive ? "text-[#FF3B30]" : "text-zinc-500 hover:text-white"
              }`}>
                {link.icon}
                <span className="text-[9px] font-bold uppercase tracking-widest">{link.name}</span>
              </div>
            </Link>
          );
        })}
        <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-zinc-500 hover:text-[#FF3B30] transition-colors">
          <LogOut size={20} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Exit</span>
        </button>
      </nav>
    </>
  );
}