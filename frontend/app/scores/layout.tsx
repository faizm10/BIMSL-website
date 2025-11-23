import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scores",
  description: "Latest game scores and results from the Brampton Intra-Masjid Soccer League. View completed game results and match details.",
  openGraph: {
    title: "BIMSL Scores | Game Results",
    description: "Latest game scores and results from the Brampton Intra-Masjid Soccer League.",
  },
};

export default function ScoresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

