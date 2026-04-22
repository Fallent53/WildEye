/* (c) 2026 - Loris Dc - WildEye Project */
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WildEye — L'Observatoire National du Sauvage",
  description:
    "Plateforme communautaire de cartographie pour la minéralogie, la faune et la flore sauvage en France. Partagez vos observations en toute confidentialité.",
  keywords: [
    "minéralogie",
    "faune sauvage",
    "flore",
    "cartographie",
    "France",
    "observation nature",
    "cristaux",
    "montagne",
  ],
  openGraph: {
    title: "WildEye — L'Observatoire National du Sauvage",
    description:
      "Cartographiez et partagez vos observations de la faune, flore et minéralogie en France.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
