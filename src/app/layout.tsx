import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Noto_Sans_Devanagari } from "next/font/google";
import { getSetting } from "@/lib/settings";
import "./globals.css";

const deva = Noto_Sans_Devanagari({ subsets: ["devanagari"], weight: ["500"], variable: "--font-deva", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const site = getSetting("site");
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    title: { default: site.seo.title, template: `%s · ${site.name}` },
    description: site.seo.description,
    openGraph: { siteName: site.name, type: "website", locale: "en_IN" },
    icons: { icon: "/favicon.svg" },
  };
}

export const viewport: Viewport = { themeColor: "#FFFFFF" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} ${deva.variable}`}>
      <body>{children}</body>
    </html>
  );
}
