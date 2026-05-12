"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ViralCard from "./ViralCard";
import { getFirestore, collection, getDocs, query, orderBy, limit, where, doc, getDoc, startAfter } from "firebase/firestore/lite";
import { app } from "@/lib/firebase";

const db = getFirestore(app);

// We define a flexible type to handle your post data
type PostType = any; 

export default function InfiniteFeed({ initialPosts, currentCategory }: { initialPosts: PostType[], currentCategory: string }) {
  const [posts, setPosts] = useState<PostType[]>(initialPosts);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length === 10); // If less than 10, there are no more posts to load
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Reset the feed if the user clicks a different category (e.g., switches from All to Sports)
  useEffect(() => {
    setPosts(initialPosts);
    setHasMore(initialPosts.length === 10);
  }, [initialPosts, currentCategory]);

  const loadMorePosts = useCallback(async () => {
    if (loadingMore || !hasMore || posts.length === 0) return;
    setLoadingMore(true);

    try {
      const lastPost = posts[posts.length - 1];
      
      // 1. Get the actual Firebase document snapshot for the last post so we know exactly where to start
      const lastPostSnap = await getDoc(doc(db, "posts", lastPost.id));

      // 2. Build the query to get the NEXT 10 posts
      const postsRef = collection(db, "posts");
      let q;

      if (currentCategory && currentCategory !== "All") {
        q = query(
          postsRef,
          where("category", ">=", currentCategory),
          where("category", "<=", currentCategory + "\uf8ff"),
          startAfter(lastPostSnap),
          limit(10)
        );
      } else {
        q = query(postsRef, orderBy("createdAt", "desc"), startAfter(lastPostSnap), limit(10));
      }

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setHasMore(false);
      } else {
        const newPosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        }));
        
        // Re-apply sorting if filtering by category
        if (currentCategory && currentCategory !== "All") {
           newPosts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        // Add the new posts to the bottom of the list
        setPosts((prev) => [...prev, ...newPosts]);
        if (newPosts.length < 10) setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more posts:", error);
    }

    setLoadingMore(false);
  }, [posts, loadingMore, hasMore, currentCategory]);

  // 🚀 The Magic: Detects when the last post enters the screen
  const lastPostElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMorePosts();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loadingMore, hasMore, loadMorePosts]
  );

  return (
    <div className="w-full flex flex-col gap-8">
      {posts.map((post, index) => {
        // Attach the invisible sensor to the very last post in the array
        if (posts.length === index + 1) {
          return (
            <div ref={lastPostElementRef} key={post.id} className="w-full block">
              <ViralCard post={post} />
            </div>
          );
        }
        return (
          <div key={post.id} className="w-full block">
            <ViralCard post={post} />
          </div>
        );
      })}

      {/* The sleek loading spinner */}
      {loadingMore && (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-[#780000] border-t-transparent rounded-full animate-spin shadow-[0_0_10px_rgba(120,0,0,0.5)]" />
        </div>
      )}

      {/* When they reach the absolute bottom */}
      {!hasMore && posts.length > 0 && (
         <div className="text-center text-zinc-600 text-[10px] font-bold tracking-[0.2em] uppercase py-10 opacity-50">
            End of Feed
         </div>
      )}
    </div>
  );
}