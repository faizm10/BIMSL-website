import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about the Brampton Intra-Masjid Soccer League. Learn about registration, game times, rules, and more.",
  openGraph: {
    title: "BIMSL FAQ | Frequently Asked Questions",
    description: "Frequently asked questions about the Brampton Intra-Masjid Soccer League.",
  },
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

