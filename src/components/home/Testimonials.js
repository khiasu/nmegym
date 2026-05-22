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

  const allTestis = dynamicTestis.map(t => ({
    name: `${t.user?.firstName || ""} ${t.user?.lastName || ""}`.trim(),
    role: t.user?.memberships?.[0]?.planTier ? `${t.user.memberships[0].planTier} Member` : "Member",
    text: t.content
  }));

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
