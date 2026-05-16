// src/app/page.js — Homepage (Server Component)
// Fetches data from Neon DB and composes all section components
export const dynamic = "force-dynamic";

import { getTrainers, getPlans, getActiveOffer, getSettings, getFacilities, getAllOffers } from "@/lib/data";
import HomepageClient from "./HomepageClient";

// Sections
import Hero from "@/components/home/Hero";
import Marquee from "@/components/home/Marquee";
import About from "@/components/home/About";
import Facilities from "@/components/home/Facilities";
import Trainers from "@/components/home/Trainers";
import Plans from "@/components/home/Plans";
import Testimonials from "@/components/home/Testimonials";
import Contact from "@/components/home/Contact";

export default async function HomePage() {
  // Parallel data fetching — all queries run simultaneously
  const [trainers, plans, offer, settings, facilities, offers] = await Promise.all([
    getTrainers(),
    getPlans(),
    getActiveOffer(),
    getSettings(),
    getFacilities(),
    getAllOffers(),
  ]);

  return (
    <HomepageClient settings={settings}>
      <Hero offer={offer} settings={settings} />
      <Marquee settings={settings} />
      <About settings={settings} />
      <Facilities facilities={facilities} />
      <Trainers trainers={trainers} />
      <Plans plans={plans} settings={settings} offers={offers} />
      <Testimonials />
      <Contact settings={settings} />
    </HomepageClient>
  );
}
