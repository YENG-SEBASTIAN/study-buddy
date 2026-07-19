import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://akosua-ai.vercel.app";
const TITLE = "Akosua - AWS Cloud Practitioner Study Buddy";
const DESCRIPTION =
  "Akosua is an AI study assistant for the AWS re/Start cohort - ask questions about AWS Cloud Practitioner topics and get answers grounded in your own study notes, not generic training data.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | Akosua",
  },
  description: DESCRIPTION,
  applicationName: "Akosua",
  keywords: [
    "AWS Cloud Practitioner",
    "AWS re/Start",
    "AWS exam prep",
    "study assistant",
    "RAG chatbot",
    "Akosua",
  ],
  authors: [{ name: "Yeng Sebastian" }],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Akosua",
    images: [{ url: "/logo.png", width: 1254, height: 1254, alt: "Akosua" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/logo.png"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <Header />
          <div className="flex flex-1 flex-col">{children}</div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
