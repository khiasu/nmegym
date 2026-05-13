// src/app/page.js — Homepage (Server Component)
// Fetches data from Neon DB and composes all section components

import { getTrainers, getPlans, getActiveOffer } from "@/lib/data";
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
  const [trainers, plans, offer] = await Promise.all([
    getTrainers(),
    getPlans(),
    getActiveOffer(),
  ]);

  return (
    <HomepageClient>
      <Hero offer={offer} />
      <Marquee />
      <About />
      <Facilities />
      <Trainers trainers={trainers} />
      <Plans plans={plans} />
      <Testimonials />
      <Contact />
    </HomepageClient>
  );
}
