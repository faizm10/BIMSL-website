import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "League Leaders",
  description: "Top scorers and league leaders in the Brampton Intra-Masjid Soccer League. See who's leading in goals and assists.",
  openGraph: {
    title: "BIMSL League Leaders | Top Scorers",
    description: "Top scorers and league leaders in the Brampton Intra-Masjid Soccer League.",
  },
};

export default function LeagueLeadersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

