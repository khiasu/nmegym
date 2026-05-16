// src/app/layout.js — Root Layout
// Loads fonts, global CSS
// WhatsApp FAB is inside Contact.js (unified with footer, matching old index.html)

import "./globals.css";
import AuthProvider from "@/components/providers/SessionProvider";
import { getSettings } from "@/lib/data";

export async function generateMetadata() {
  const settings = await getSettings();
  const logo = settings?.logoUrl || "/newlogo.png";

  return {
    title: "NME GYM — FITNESS BEYOND LIMITS",
    description:
      "FITNESS BEYOND LIMITS at NME GYM, Nagaland's premium fitness center. Strength training, Zumba, Yoga, personal coaching & more. Join 200+ members transforming their lives.",
    keywords: "gym, fitness, Nagaland, Chumoukedima, NME GYM, workout, training",
    openGraph: {
      title: "NME GYM — FITNESS BEYOND LIMITS",
      description: "Premium fitness center in Chumoukedima, Nagaland.",
      type: "website",
      locale: "en_IN",
    },
    icons: {
      icon: logo,
      shortcut: logo,
      apple: logo,
    },
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@300;400;500;600;700;900&family=Barlow:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
