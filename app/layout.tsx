import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "InstaBot - Instagram DM Automation",
  description: "Automatically send DMs to users who comment keywords on your Instagram posts. Grow followers with follow-gating.",
  keywords: ["instagram", "automation", "DM", "marketing", "social media"],
  authors: [{ name: "InstaBot" }],
  openGraph: {
    title: "InstaBot - Instagram DM Automation",
    description: "Turn Instagram comments into customers with automated DMs",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable)}>
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
