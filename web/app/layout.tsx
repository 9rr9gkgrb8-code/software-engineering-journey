import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const sans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") || "localhost";
  const protocol = requestHeaders.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const image = `${protocol}://${host}/og.png`;
  return {
    title: "Forge — Code, design, and build with AI",
    description: "A safe, local-first coding and AI assistant design lab for middle-school learners.",
    icons: { icon: "/favicon.svg" },
    openGraph: { title: "Forge — Code. Think. Build.", description: "A creative tech lab for ages 11–14.", images: [image] },
    twitter: { card: "summary_large_image", title: "Forge — Code. Think. Build.", description: "A creative tech lab for ages 11–14.", images: [image] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${sans.variable} ${mono.variable}`}>{children}</body></html>;
}
