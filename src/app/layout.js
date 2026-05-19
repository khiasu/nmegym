// src/app/layout.js — Root Layout
// Loads fonts, global CSS
// WhatsApp FAB is inside Contact.js (unified with footer, matching old index.html)

import "./globals.css";
import AuthProvider from "@/components/providers/SessionProvider";
import { getSettings } from "@/lib/data";

export async function generateMetadata() {
  const settings = await getSettings();
  const logo = settings?.logoUrl || "/newlogo.png";
  
  const title = "NME Gym — Fitness Beyond Limits | Best Gym in Dimapur & Chumoukedima";
  const description = "NME Gym is a premium fitness center in Diphupar 'B', Chumoukedima, Dimapur offering modern workout equipment, expert training, cardio workouts, bodybuilding programs, and wellness-focused fitness solutions designed for all age groups and fitness levels.";
  const keywords = [
    "NME Gym", "NME Gym Dimapur", "NME Gym Nagaland", "NME Gym Chumoukedima", "gym in Dimapur",
    "best gym in Dimapur", "gym in Chumoukedima", "fitness center in Dimapur", "fitness center in Chumoukedima",
    "gym in Diphupar", "gym in Diphupar B", "gym in Sovima", "premium gym in Nagaland", "modern gym in Dimapur",
    "best fitness center in Nagaland", "bodybuilding gym in Dimapur", "strength training gym", "cardio workout gym",
    "personal trainer Dimapur", "fitness transformation gym", "weight loss gym in Nagaland", "modern workout equipment",
    "beginner friendly gym", "gym for all ages", "family fitness center", "unisex gym in Dimapur", "wellness focused gym",
    "professional fitness coaching", "student gym in Dimapur", "gym near Kenmbay Hostel", "fitness center near Kenmbay Hostel",
    "gym near me", "best gym near me", "fitness center near me", "top gym in Nagaland", "affordable gym in Dimapur",
    "premium workout experience", "healthy lifestyle gym", "fitness for all age groups", "muscle building gym",
    "body transformation gym", "gym with modern equipment", "fitness coaching in Dimapur", "cardio training Dimapur",
    "workout gym in Nagaland", "best local gym in Dimapur", "strength and conditioning gym", "professional fitness environment",
    "modern fitness center", "gym membership Dimapur", "fitness club in Dimapur", "advanced gym equipment", "fitness gym Nagaland",
    "best unisex gym in Dimapur", "fitness center for beginners", "elite training environment", "community fitness gym",
    "gym for students", "gym for working professionals", "fitness center in Nagaland", "best gym in Nagaland", "top rated gym in Dimapur",
    "high quality gym equipment", "modern cardio equipment", "bodybuilding training Nagaland", "fat loss training gym",
    "health and wellness center", "active lifestyle gym", "premium fitness experience"
  ].join(", ");

  return {
    metadataBase: new URL("https://nmegym.in"),
    title,
    description,
    keywords,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title,
      description,
      url: "https://nmegym.in",
      siteName: "NME Gym",
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: logo,
          width: 500,
          height: 500,
          alt: "NME Gym Logo",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [logo],
    },
    icons: {
      icon: logo,
      shortcut: logo,
      apple: logo,
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
  };
}

export default function RootLayout({ children }) {
  const gymSchema = {
    "@context": "https://schema.org",
    "@type": "Gym",
    "@id": "https://nmegym.in/#gym",
    "name": "NME Gym",
    "image": "https://nmegym.in/newlogo.png",
    "url": "https://nmegym.in",
    "telephone": "+917005310568",
    "priceRange": "INR",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Diphupar 'B', Sovima, inside Kenmbay Hostel campus",
      "addressLocality": "Chumoukedima",
      "addressRegion": "Nagaland",
      "postalCode": "797115",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "25.8453",
      "longitude": "93.7712"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "05:30",
        "closes": "22:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Sunday",
        "opens": "07:00",
        "closes": "13:00"
      }
    ],
    "sameAs": [
      "https://www.instagram.com/nme_gym"
    ]
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://nmegym.in/#localbusiness",
    "name": "NME Gym",
    "image": "https://nmegym.in/newlogo.png",
    "url": "https://nmegym.in",
    "telephone": "+917005310568",
    "priceRange": "INR",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Diphupar 'B', Sovima, inside Kenmbay Hostel campus",
      "addressLocality": "Chumoukedima",
      "addressRegion": "Nagaland",
      "postalCode": "797115",
      "addressCountry": "IN"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Which is the best gym in Dimapur?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "NME Gym is widely considered the best gym in Dimapur and Chumoukedima, offering a premium fitness environment, modern workout equipment, certified personal trainers, and comprehensive strength, conditioning, and cardio programs."
        }
      },
      {
        "@type": "Question",
        "name": "Is NME Gym beginner friendly?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, NME Gym is highly beginner friendly. We offer wellness-focused guidance, professional fitness coaching, and a supportive, non-intimidating atmosphere for all fitness levels."
        }
      },
      {
        "@type": "Question",
        "name": "Does NME Gym offer personal training?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, NME Gym offers professional personal training in Chumoukedima and Dimapur with expert fitness coaches to help you achieve your muscle-building, weight loss, and general wellness goals."
        }
      },
      {
        "@type": "Question",
        "name": "Is NME Gym suitable for all age groups?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely. NME Gym is designed for all age groups, including students, working professionals, families, and seniors, providing safe and effective fitness solutions for everyone."
        }
      },
      {
        "@type": "Question",
        "name": "Where is NME Gym located?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "NME Gym is located in Diphupar 'B', Sovima, Chumoukedima, Dimapur, Nagaland, India. It is situated inside the Kenmbay Hostel campus."
        }
      },
      {
        "@type": "Question",
        "name": "Is NME Gym inside Kenmbay Hostel campus?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, NME Gym is located inside the Kenmbay Hostel campus in Diphupar 'B', Sovima, Chumoukedima, making it highly accessible and convenient, especially for students and local residents."
        }
      },
      {
        "@type": "Question",
        "name": "Does NME Gym have modern workout equipment?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, NME Gym is equipped with premium, state-of-the-art strength training and cardio equipment, including advanced treadmills, power racks, resistance machines, and free weights."
        }
      },
      {
        "@type": "Question",
        "name": "Does NME Gym offer bodybuilding and cardio training?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, NME Gym provides specialized bodybuilding programs, strength training, advanced cardio workouts, and customized fat loss or muscle building training."
        }
      }
    ]
  };

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(gymSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
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
