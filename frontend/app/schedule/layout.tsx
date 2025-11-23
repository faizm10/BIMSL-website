import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Schedule",
  description: "View the complete game schedule for the Brampton Intra-Masjid Soccer League. All games are played Sunday nights 8:30-11PM at Save Max Sports Centre.",
  openGraph: {
    title: "BIMSL Schedule | Game Times & Dates",
    description: "View the complete game schedule for the Brampton Intra-Masjid Soccer League.",
  },
};

export default function ScheduleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

