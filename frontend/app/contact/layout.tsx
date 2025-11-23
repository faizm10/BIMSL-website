import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the Brampton Intra-Masjid Soccer League. Contact information, location, and social media links.",
  openGraph: {
    title: "Contact BIMSL | Get In Touch",
    description: "Get in touch with the Brampton Intra-Masjid Soccer League.",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

