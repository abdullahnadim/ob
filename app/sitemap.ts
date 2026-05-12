import { MetadataRoute } from 'next';
import { app } from "@/lib/firebase";
import { getFirestore, collection, getDocs } from "firebase/firestore/lite";

const dbServer = getFirestore(app);

// 🚀 Change this to your actual live domain!
const BASE_URL = 'https://osthirbengali.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. DEFINE YOUR STATIC ROUTES
  const staticRoutes = [
    {
      url: `${BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: 'always' as const,
      priority: 1.0, // Homepage is the most important
    },
    {
      url: `${BASE_URL}/trending`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  // 2. FETCH ALL DYNAMIC POSTS FROM FIREBASE
  let dynamicRoutes: MetadataRoute.Sitemap = [];
  
  try {
    const postsRef = collection(dbServer, "posts");
    const snapshot = await getDocs(postsRef);
    
    dynamicRoutes = snapshot.docs.map((doc) => {
      const data = doc.data();
      // Use createdAt if it exists, otherwise default to right now
      const lastMod = data.createdAt?.toDate?.() || new Date();

      return {
        url: `${BASE_URL}/post/${doc.id}`, // Adjust /post/ if your URL structure is different!
        lastModified: lastMod,
        changeFrequency: 'daily' as const,
        priority: 0.7, // Individual articles have high priority
      };
    });
  } catch (error) {
    console.error("Error fetching posts for sitemap:", error);
  }

  // 3. COMBINE AND RETURN EVERYTHING TO GOOGLE
  return [...staticRoutes, ...dynamicRoutes];
}