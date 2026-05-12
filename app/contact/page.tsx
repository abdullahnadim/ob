"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Mail, Send, MapPin, MessageSquare } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 🚀 Saves the message directly to your Firebase Database!
      await addDoc(collection(db, "contactMessages"), {
        ...formData,
        read: false, // You can use this later in an admin panel to mark as read
        createdAt: serverTimestamp(),
      });
      
      setIsSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      
      // Reset success message after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-24 md:pt-32 pb-32 px-4 flex justify-center">
      <div className="w-full max-w-5xl">
        
        {/* HEADER SECTION */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4">
            Get in <span className="text-[#FF3B30]">Touch</span>
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto">
            Have a scoop, a meme idea, or want to advertise with OsthirBengali? Drop us a line below and our desk will get back to you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* LEFT: CONTACT INFO CARDS */}
          <div className="lg:col-span-2 space-y-4">
            <div className="obsidian-glass p-6 rounded-3xl border border-white/5 flex items-start gap-4 hover:border-white/10 transition-colors">
              <div className="w-12 h-12 bg-[#FF3B30]/10 rounded-full flex items-center justify-center shrink-0">
                <Mail className="text-[#FF3B30]" size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-300 mb-1">Email Us</h3>
                <p className="text-white font-medium">desk@osthirbengali.com</p>
                <p className="text-xs text-zinc-500 mt-1">We usually reply within 24 hours.</p>
              </div>
            </div>

            <div className="obsidian-glass p-6 rounded-3xl border border-white/5 flex items-start gap-4 hover:border-white/10 transition-colors">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center shrink-0">
                <MessageSquare className="text-zinc-300" size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-300 mb-1">Social Media</h3>
                <p className="text-white font-medium">@OsthirBengali</p>
                <p className="text-xs text-zinc-500 mt-1">DM us on Facebook or Instagram.</p>
              </div>
            </div>

            <div className="obsidian-glass p-6 rounded-3xl border border-white/5 flex items-start gap-4 hover:border-white/10 transition-colors">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center shrink-0">
                <MapPin className="text-zinc-300" size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-300 mb-1">Location</h3>
                <p className="text-white font-medium">Dhaka, Bangladesh</p>
                <p className="text-xs text-zinc-500 mt-1">Digital Operations</p>
              </div>
            </div>
          </div>

          {/* RIGHT: CONTACT FORM */}
          <div className="lg:col-span-3 obsidian-glass p-6 md:p-10 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden">
            
            {/* SUCCESS OVERLAY */}
            {isSuccess && (
              <div className="absolute inset-0 bg-[#050505]/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-300">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                  <Send size={32} className="text-green-500 ml-2" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Message Sent!</h3>
                <p className="text-zinc-400">Thanks for reaching out. We will read it shortly.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Your Name</label>
                  <input 
                    type="text" name="name" required value={formData.name} onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-[#FF3B30] outline-none transition-all shadow-inner text-sm"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input 
                    type="email" name="email" required value={formData.email} onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-[#FF3B30] outline-none transition-all shadow-inner text-sm"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Subject</label>
                <input 
                  type="text" name="subject" required value={formData.subject} onChange={handleChange}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-[#FF3B30] outline-none transition-all shadow-inner text-sm"
                  placeholder="What is this regarding?"
                />
              </div>

              <div className="space-y-2 pb-4">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Message</label>
                <textarea 
                  name="message" required value={formData.message} onChange={handleChange} rows={5}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-[#FF3B30] outline-none transition-all shadow-inner text-sm resize-none"
                  placeholder="Type your message here..."
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#FF3B30] hover:bg-red-600 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,59,48,0.2)]"
              >
                {isSubmitting ? "Sending..." : "Send Message"} <Send size={16} />
              </button>
            </form>

          </div>
        </div>
      </div>
    </main>
  );
}