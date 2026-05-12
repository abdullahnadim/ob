"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, addDoc, deleteDoc, doc, getDocs, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
// 🚀 ADDED: GripVertical (for drag handle), Eye, and EyeOff
import { ShieldAlert, Loader2, FolderTree, Plus, Trash2, GripVertical, Eye, EyeOff } from "lucide-react";

interface Category {
  id: string;
  name: string;
  subcategories: string[];
  isVisibleOnHome?: boolean; // New field
  order?: number; // New field
}

export default function CategoryManager() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubcatInput, setNewSubcatInput] = useState<{ [key: string]: string }>({});

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");

  // 🚀 DRAG AND DROP STATE
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) fetchCategories();
      else setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchCategories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "categories"));
      const cats: Category[] = [];
      querySnapshot.forEach((doc) => {
        cats.push({ id: doc.id, ...doc.data() } as Category);
      });
      // 🚀 SORT BY ORDER INSTEAD OF ALPHABETICAL
      cats.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
      setCategories(cats);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      await addDoc(collection(db, "categories"), {
        name: newCategoryName.trim(),
        subcategories: [],
        isVisibleOnHome: true, // 🚀 Defaults to true
        order: categories.length, // 🚀 Adds to the bottom of the list
      });
      setNewCategoryName("");
      fetchCategories();
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  // 🚀 TOGGLE VISIBILITY FUNCTION
  const handleToggleVisibility = async (id: string, currentStatus: boolean | undefined) => {
    // If undefined, assume it was true and we are turning it false
    const newStatus = currentStatus === undefined ? false : !currentStatus;
    
    // Optimistic UI update
    setCategories(cats => cats.map(c => c.id === id ? { ...c, isVisibleOnHome: newStatus } : c));

    try {
      await updateDoc(doc(db, "categories", id), { isVisibleOnHome: newStatus });
    } catch (error) {
      console.error("Error updating visibility:", error);
      fetchCategories(); // Revert on failure
    }
  };

  // 🚀 NATIVE DRAG AND DROP LOGIC
  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const oldIdx = categories.findIndex(c => c.id === draggedId);
    const newIdx = categories.findIndex(c => c.id === targetId);
    
    const newCats = [...categories];
    const [movedItem] = newCats.splice(oldIdx, 1);
    newCats.splice(newIdx, 0, movedItem);

    // 1. Update UI Instantly (Optimistic UI)
    const reorderedCats = newCats.map((cat, idx) => ({ ...cat, order: idx }));
    setCategories(reorderedCats);
    setDraggedId(null);

    // 2. Save new order to Firebase silently in the background
    try {
      const promises = reorderedCats.map(cat => 
        updateDoc(doc(db, "categories", cat.id), { order: cat.order })
      );
      await Promise.all(promises);
    } catch (error) {
      console.error("Error saving new order:", error);
      fetchCategories(); // Reload if it fails
    }
  };

  // ... (Keep handleRenameCategory, handleDeleteCategory, handleAddSubcategory, handleRemoveSubcategory unchanged)
  const handleRenameCategory = async (id: string) => {
    if (!editingCategoryName.trim()) {
      setEditingCategoryId(null);
      return;
    }
    try {
      await updateDoc(doc(db, "categories", id), { name: editingCategoryName.trim() });
      setEditingCategoryId(null);
      fetchCategories();
    } catch (error) {
      console.error("Error renaming:", error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure? This will delete the category and all its subcategories!")) return;
    try {
      await deleteDoc(doc(db, "categories", id));
      fetchCategories();
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const handleAddSubcategory = async (categoryId: string) => {
    const subName = newSubcatInput[categoryId]?.trim();
    if (!subName) return;
    try {
      await updateDoc(doc(db, "categories", categoryId), { subcategories: arrayUnion(subName) });
      setNewSubcatInput({ ...newSubcatInput, [categoryId]: "" });
      fetchCategories();
    } catch (error) {
      console.error("Error adding subcat:", error);
    }
  };

  const handleRemoveSubcategory = async (categoryId: string, subName: string) => {
    if (!confirm(`Delete subcategory: ${subName}?`)) return;
    try {
      await updateDoc(doc(db, "categories", categoryId), { subcategories: arrayRemove(subName) });
      fetchCategories();
    } catch (error) {
      console.error("Error removing subcat:", error);
    }
  };


  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#050505]"><Loader2 size={48} className="text-[#FF3B30] animate-spin" /></div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center bg-[#050505]"><ShieldAlert size={48} className="text-[#FF3B30]" /></div>;

  return (
    <div className="pt-24 pb-32 px-4 max-w-4xl mx-auto min-h-screen bg-[#050505]">
      
      <div className="flex items-center gap-4 mb-10">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FF3B30]">
          <FolderTree size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-widest">
            Architecture <span className="text-[#FF3B30]">Panel</span>
          </h1>
          <p className="text-zinc-500 text-sm font-bold tracking-widest mt-1">Drag to reorder. Hide from Navbar.</p>
        </div>
      </div>

      <div className="obsidian-glass p-6 rounded-3xl border border-white/10 mb-8 shadow-xl">
        <form onSubmit={handleAddCategory} className="flex gap-4">
          <input 
            type="text" required value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)}
            className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FF3B30] outline-none"
            placeholder="Create Parent Category..."
          />
          <button type="submit" className="bg-[#FF3B30] hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
            <Plus size={18} /> Add
          </button>
        </form>
      </div>

      {/* CATEGORY LIST WITH DRAG AND DROP */}
      <div className="space-y-4">
        {categories.map((cat) => (
          <div 
            key={cat.id} 
            draggable // 🚀 MAKES IT DRAGGABLE
            onDragStart={() => setDraggedId(cat.id)}
            onDragOver={(e) => e.preventDefault()} // 🚀 REQUIRED TO ALLOW DROPPING
            onDrop={(e) => handleDrop(e, cat.id)}
            className={`obsidian-glass p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden group ${
              draggedId === cat.id ? "opacity-50 border-[#FF3B30] scale-[0.98]" : "border-white/5 hover:border-white/20"
            } ${cat.isVisibleOnHome === false ? "opacity-60 grayscale" : ""}`}
          >
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-white/10 gap-4">
              
              {/* DRAG HANDLE & TITLE */}
              <div className="flex items-center gap-3 flex-1">
                <div className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-white transition-colors">
                  <GripVertical size={20} />
                </div>
                
                {editingCategoryId === cat.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input 
                      type="text" value={editingCategoryName} onChange={(e) => setEditingCategoryName(e.target.value)} autoFocus
                      className="w-full bg-black/50 border border-[#FF3B30] rounded-xl px-4 py-2 text-white font-black uppercase tracking-widest outline-none shadow-[0_0_15px_rgba(255,59,48,0.2)]"
                      onKeyDown={(e) => e.key === "Enter" && handleRenameCategory(cat.id)}
                    />
                    <button onClick={() => handleRenameCategory(cat.id)} className="bg-[#FF3B30] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest">Save</button>
                    <button onClick={() => setEditingCategoryId(null)} className="bg-white/10 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest">Cancel</button>
                  </div>
                ) : (
                  <h2 className="text-xl font-black text-white uppercase tracking-widest flex-1">
                    {cat.name} 
                    {cat.isVisibleOnHome === false && <span className="text-[10px] text-[#FF3B30] ml-3 bg-[#FF3B30]/10 px-2 py-1 rounded-full border border-[#FF3B30]/20">HIDDEN</span>}
                  </h2>
                )}
              </div>

              {/* ACTION BUTTONS */}
              {editingCategoryId !== cat.id && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleToggleVisibility(cat.id, cat.isVisibleOnHome)}
                    className={`transition-colors p-2 rounded-lg border ${cat.isVisibleOnHome !== false ? "text-green-400 border-green-400/20 bg-green-400/10 hover:bg-green-400/20" : "text-zinc-500 border-white/5 bg-white/5 hover:text-white"}`}
                    title={cat.isVisibleOnHome !== false ? "Hide from Navbar" : "Show on Navbar"}
                  >
                    {cat.isVisibleOnHome !== false ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                  <div className="w-px h-6 bg-white/10 mx-1"></div>
                  <button onClick={() => { setEditingCategoryId(cat.id); setEditingCategoryName(cat.name); }} className="text-zinc-500 hover:text-white transition-colors p-2 text-xs font-bold uppercase tracking-widest">
                    Edit
                  </button>
                  <button onClick={() => handleDeleteCategory(cat.id)} className="text-zinc-600 hover:text-[#FF3B30] transition-colors p-2">
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* SUBCATEGORIES ... (Code here remains exactly the same) */}
            <div className="flex flex-wrap gap-2 mb-6 ml-8">
              {cat.subcategories.map((sub, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-xs font-bold text-zinc-300">
                  {sub}
                  <button onClick={() => handleRemoveSubcategory(cat.id, sub)} className="text-zinc-500 hover:text-[#FF3B30] transition-colors">&times;</button>
                </div>
              ))}
              {cat.subcategories.length === 0 && <span className="text-zinc-600 text-xs italic">No subcategories yet.</span>}
            </div>

            <div className="flex items-center gap-3 ml-8">
              <input 
                type="text" value={newSubcatInput[cat.id] || ""} onChange={(e) => setNewSubcatInput({ ...newSubcatInput, [cat.id]: e.target.value })}
                className="w-full max-w-[250px] bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-[#FF3B30] outline-none"
                placeholder={`Add subcategory to ${cat.name}...`}
                onKeyDown={(e) => e.key === "Enter" && handleAddSubcategory(cat.id)}
              />
              <button onClick={() => handleAddSubcategory(cat.id)} className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors"><Plus size={14} /></button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}