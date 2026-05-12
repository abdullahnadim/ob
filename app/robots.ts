import { MetadataRoute } from 'next';

const BASE_URL = 'https://osthirbengali.com'; // Replace with your live domain

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*', // Allow all web crawlers (Google, Bing, etc.)
      allow: '/',
      // 🚀 Keep Google out of your Admin Studio!
      disallow: '/admin/', 
    },
    // Point Google directly to the dynamic sitemap we just built
    sitemap: `${BASE_URL}/sitemap.xml`, 
  };
}