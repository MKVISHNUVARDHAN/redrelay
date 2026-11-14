import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RedRelay — AI Emergency Blood Rescue Network",
  description:
    "From urgent blood request to verified hospital handoff — one coordinated mission. AI-assisted coordination layer connecting hospitals, licensed blood banks, and cold-chain medical couriers.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen bg-[#090F19] text-slate-100 font-sans bg-tactical-grid selection:bg-crimson-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
