import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConditionalNavigation } from "@/components/conditional-navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "BIMSL - Brampton Intra-Masjid Soccer League",
    template: "%s | BIMSL"
  },
  description: "Join the inaugural Brampton Intra-Masjid Soccer League (BIMSL). 8 game round robin league with playoffs. Games Sunday nights 8:30-11PM at Save Max Sports Centre. October 2025 - February 2026.",
  keywords: [
    "Brampton soccer",
    "intra-masjid soccer",
    "BIMSL",
    "soccer league",
    "Brampton sports",
    "community soccer",
    "indoor soccer",
    "soccer tournament",
    "Brampton football"
  ],
  authors: [{ name: "BIMSL" }],
  creator: "Brampton Intra-Masjid Soccer League",
  publisher: "Brampton Intra-Masjid Soccer League",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://bimsl.ca'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: "/",
    siteName: "BIMSL - Brampton Intra-Masjid Soccer League",
    title: "BIMSL - Brampton Intra-Masjid Soccer League | Inaugural Season 2025-2026",
    description: "Join the inaugural Brampton Intra-Masjid Soccer League. 8 game round robin league with playoffs. Games Sunday nights 8:30-11PM at Save Max Sports Centre.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "BIMSL - Brampton Intra-Masjid Soccer League",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BIMSL - Brampton Intra-Masjid Soccer League",
    description: "Join the inaugural Brampton Intra-Masjid Soccer League. 8 game round robin league with playoffs.",
    images: ["/og-image.jpg"],
    creator: "@bram.imsl",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add verification codes when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConditionalNavigation />
        {children}
      </body>
    </html>
  );
}
