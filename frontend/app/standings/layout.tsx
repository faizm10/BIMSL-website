import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Standings",
  description: "Current league standings for the Brampton Intra-Masjid Soccer League. See team rankings, points, wins, losses, and goal differences.",
  openGraph: {
    title: "BIMSL Standings | League Table",
    description: "Current league standings for the Brampton Intra-Masjid Soccer League.",
  },
};

export default function StandingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

