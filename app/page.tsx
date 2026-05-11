// app/page.tsx
import { Metadata } from "next";
import Script from "next/script";
import FeedContent from "@/components/FeedContent"; // Safe client-side fetcher

// 1. ADVANCED DYNAMIC METADATA (SEO Core)
export const metadata: Metadata = {
  title: "OsthirBengali | Trending Memes, Satire & Entertainment",
  description: "Bangladesh's fastest-growing platform for viral Gen-Z content, savage memes, tech news, esports, and deep satire. The pulse of Bengali internet culture.",
  keywords: ["Bengali memes", "Bangladesh trending", "Satire Bangladesh", "Osthir", "Tech news BD", "Esports Bangladesh"],
  alternates: {
    canonical: "https://osthirbengali.com",
  },
  openGraph: {
    title: "OsthirBengali | Trending Viral Culture",
    description: "The ultimate Bengali Gen-Z entertainment and meme portal.",
    url: "https://osthirbengali.com",
    siteName: "OsthirBengali",
    images: [
      {
        url: "https://osthirbengali.com/og-home.jpg",
        width: 1200,
        height: 630,
        alt: "OsthirBengali Viral Media Platform",
      },
    ],
    locale: "bn_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@OsthirBengali",
    creator: "@OsthirBengali",
  },
};

// 2. SERVER COMPONENT HOMEPAGE (Handles SEO, delegates fetching)
export default function HomePage() {
  // 3. JSON-LD SCHEMA MARKUP (For Rich Google Results)
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "OsthirBengali",
    url: "https://osthirbengali.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://osthirbengali.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "OsthirBengali",
    url: "https://osthirbengali.com",
    logo: "https://osthirbengali.com/logo.png",
    sameAs: [
      "https://facebook.com/osthirbengali",
      "https://instagram.com/osthirbengali",
      "https://tiktok.com/@osthirbengali",
    ],
  };

  return (
    <>
      {/* Injecting Schema Markup for Google Crawlers */}
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <main className="min-h-screen container mx-auto px-4 py-8 max-w-7xl">
        
        {/* SEMANTIC HEADER - Critical for SEO hierarchy */}
        <header className="mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary via-orange-500 to-yellow-500">
              OsthirBengali.
            </h1>
            <p className="text-zinc-400 mt-2 text-lg font-bengali font-medium">
              বাঙালি ইন্টারনেটের পালস। (The pulse of the Bengali internet.)
            </p>
          </div>
          
          <div className="flex gap-2">
            <span className="glass px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 text-primary">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              LIVE TRENDING
            </span>
          </div>
        </header>

        {/* 
          Instead of fetching on the server and freezing the PC, 
          we mount the safe client component here.
        */}
        <FeedContent />

      </main>
    </>
  );
}