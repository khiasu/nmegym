"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import TestimonialModal from "@/components/ui/TestimonialModal";
import Link from "next/link";

export default function Testimonials() {
  const { data: session } = useSession();
  const [modalOpen, setModalOpen] = useState(false);
  const [dynamicTestis, setDynamicTestis] = useState([]);

  useEffect(() => {
    fetch("/api/testimonials")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDynamicTestis(data);
      })
      .catch(err => console.error("Failed to fetch testimonials", err));
  }, []);

  const staticTestis = [
    { name: "Vizo Yhome", role: "Lost 14 kg · 4 Months", text: "I lost 14 kg in 4 months. The trainers at NME didn't just give me a workout — they gave me a lifestyle change." },
    { name: "Keviseno Chishi", role: "Member · 8 Months", text: "As a working woman in Chumoukedima, I needed flexible hours and real results. NME delivered both. The Zumba classes are incredible!" },
    { name: "Theja Sumi", role: "Elite Member · 1 Year", text: "Best gym in Nagaland. No nonsense, clean equipment, and coaches who actually track your progress. Highly recommend the Elite plan." },
    { name: "Thinuo Sangtam", role: "Strength Trainee", text: "I was nervous starting. Walked into NME and everyone was welcoming. Within 3 months I'm deadlifting twice my body weight." },
    { name: "Atola Longkumer", role: "Transformation · 6 Months", text: "The diet plans they gave me changed everything. Combined with the training, I'm in the best shape of my life at 32." },
    { name: "Nzanthung Kikon", role: "Warrior Member · 9 Months", text: "NME is more than a gym — it's a community. Everyone pushes each other. The energy here is unlike anything in Nagaland." },
  ];

  const allTestis = [...staticTestis, ...dynamicTestis.map(t => ({
    name: `${t.user.firstName} ${t.user.lastName}`,
    role: t.user.memberships?.[0]?.planTier || "Member",
    text: t.content
  }))];

  return (
    <section className="testimonials-section" id="testimonials">
      <div className="max-w" style={{ paddingBottom: 0 }}>
        <div className="section-label reveal"><span>Real People</span></div>
        <h2 className="section-title reveal reveal-heading">THEY STARTED<br /><span className="gray">YOU'RE NEXT.</span></h2>
      </div>

      <div className="testimonials-track-wrap" style={{ marginTop: "50px" }}>
        <div className="testimonials-track">
          {/* Main set */}
          {allTestis.map((t, i) => (
            <div className="testi-card" key={`t1-${i}`}>
              <div className="testi-stars">★★★★★</div>
              <div className="testi-text">"{t.text}"</div>
              <div className="testi-name">{t.name}</div>
              <div className="testi-role">{t.role}</div>
            </div>
          ))}
          {/* Duplicate set for infinite marquee */}
          {allTestis.map((t, i) => (
            <div className="testi-card" key={`t2-${i}`}>
              <div className="testi-stars">★★★★★</div>
              <div className="testi-text">"{t.text}"</div>
              <div className="testi-name">{t.name}</div>
              <div className="testi-role">{t.role}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w reveal" style={{ textAlign: "center", marginTop: "40px" }}>
        {session ? (
          <Link href="/dashboard?tab=testimonials" className="testi-login-link">
            SHARE YOUR STORY
          </Link>
        ) : (
          <Link href="/auth/login?callbackUrl=/dashboard?tab=testimonials" className="testi-login-link">
            SHARE YOUR STORY
          </Link>
        )}
      </div>

      <TestimonialModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </section>
  );
}
