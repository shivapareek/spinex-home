import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans, Tiro_Devanagari_Hindi } from "next/font/google";
import { getSetting } from "@/lib/settings";
import "./globals.css";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display", axes: ["SOFT", "opsz"], display: "swap" });
const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const deva = Tiro_Devanagari_Hindi({ subsets: ["devanagari", "latin"], weight: "400", variable: "--font-deva", display: "swap" });

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

export const viewport: Viewport = { themeColor: "#140A0C" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${deva.variable}`}>
      <body>{children}</body>
    </html>
  );
}
