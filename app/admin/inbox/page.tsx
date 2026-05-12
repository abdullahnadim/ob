"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { ShieldAlert, Loader2, Mail, Trash2, CheckCircle, MailOpen, User as UserIcon } from "lucide-react";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: any;
  isRead?: boolean;
}

export default function InboxPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // 1. Authenticate & Fetch Messages
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) fetchMessages();
      else setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchMessages = async () => {
    try {
      // Assuming your contact form saves to a collection called "messages"
      const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      const fetchedMessages: Message[] = [];
      querySnapshot.forEach((doc) => {
        fetchedMessages.push({ id: doc.id, ...doc.data() } as Message);
      });
      
      setMessages(fetchedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Mark as Read Logic
  const handleMarkAsRead = async (id: string, currentStatus: boolean | undefined) => {
    if (currentStatus) return; // Already read
    
    setIsProcessing(id);
    try {
      await updateDoc(doc(db, "messages", id), { isRead: true });
      setMessages(messages.map(msg => msg.id === id ? { ...msg, isRead: true } : msg));
    } catch (error) {
      console.error("Error updating message:", error);
    } finally {
      setIsProcessing(null);
    }
  };

  // 3. Delete Message Logic
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this message?")) return;
    
    setIsProcessing(id);
    try {
      await deleteDoc(doc(db, "messages", id));
      setMessages(messages.filter(msg => msg.id !== id));
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Failed to delete message.");
    } finally {
      setIsProcessing(null);
    }
  };

  // 🔄 LOADING STATE
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#050505]"><Loader2 size={48} className="text-[#780000] animate-spin" /></div>;
  
  // 🚫 DENY ACCESS IF NOT LOGGED IN
  if (!user) return <div className="min-h-screen flex items-center justify-center bg-[#050505]"><ShieldAlert size={48} className="text-[#780000]" /></div>;

  const unreadCount = messages.filter(m => !m.isRead).length;

  // 📝 RENDER THE INBOX
  return (
    <div className="pt-24 md:pt-12 pb-32 px-4 md:px-8 w-full min-h-screen flex flex-col items-center">
      <div className="w-full max-w-3xl">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#780000] shrink-0 relative">
              <Mail size={32} />
              {unreadCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-[#780000] text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,59,48,0.5)]">
                  {unreadCount}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-widest">
                Studio <span className="text-[#780000]">Inbox</span>
              </h1>
              <p className="text-zinc-500 text-sm font-bold tracking-widest mt-1">
                {messages.length} Total Messages
              </p>
            </div>
          </div>
        </div>

        {/* MESSAGES LIST */}
        <div className="space-y-4 w-full">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`obsidian-glass p-6 rounded-2xl border transition-all duration-300 w-full ${
                msg.isRead ? "border-white/5 opacity-70" : "border-[#780000]/30 shadow-[0_0_20px_rgba(255,59,48,0.05)]"
              }`}
            >
              
              {/* TOP ROW: Name, Email, Date & Actions */}
              <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4 pb-4 border-b border-white/5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {!msg.isRead && <div className="w-2 h-2 rounded-full bg-[#780000] shadow-[0_0_8px_rgba(255,59,48,0.8)] shrink-0" />}
                    <h3 className={`font-black text-lg truncate ${msg.isRead ? "text-white/80" : "text-white"}`}>
                      {msg.name}
                    </h3>
                  </div>
                  <a href={`mailto:${msg.email}`} className="text-[#780000] text-xs font-bold tracking-widest uppercase hover:underline inline-flex items-center gap-1 truncate">
                    <UserIcon size={12} /> {msg.email}
                  </a>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 md:gap-2 shrink-0">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                    {msg.createdAt ? new Date(msg.createdAt.toDate?.() || msg.createdAt).toLocaleDateString() : "Just now"}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {!msg.isRead && (
                      <button 
                        onClick={() => handleMarkAsRead(msg.id, msg.isRead)}
                        disabled={isProcessing === msg.id}
                        className="w-8 h-8 rounded-lg bg-[#780000]/10 hover:bg-[#780000]/20 text-[#780000] flex items-center justify-center transition-colors border border-[#780000]/20"
                        title="Mark as Read"
                      >
                        {isProcessing === msg.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                      </button>
                    )}
                    
                    <button 
                      onClick={() => handleDelete(msg.id)}
                      disabled={isProcessing === msg.id}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 text-zinc-500 hover:text-red-500 flex items-center justify-center transition-colors border border-transparent hover:border-red-500/30"
                      title="Delete Message"
                    >
                      {isProcessing === msg.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* BOTTOM ROW: Subject & Message */}
              <div>
                <h4 className="text-zinc-300 font-bold text-sm uppercase tracking-widest mb-2">
                  Subject: {msg.subject}
                </h4>
                <div className="bg-black/30 rounded-xl p-4 border border-white/5 text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {msg.message}
                </div>
              </div>

            </div>
          ))}

          {messages.length === 0 && (
            <div className="text-center py-20 obsidian-glass rounded-3xl border border-white/5 flex flex-col items-center">
              <MailOpen size={48} className="text-zinc-700 mb-4" />
              <p className="text-zinc-500 font-bold uppercase tracking-widest">Inbox is empty. Inbox Zero!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}