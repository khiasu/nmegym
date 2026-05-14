// src/components/home/Trainers.js
// Premium Interactive Trainer Carousel — swipe, auto-slide, one card at a time
"use client";
import { useState, useEffect, useRef, useCallback } from "react";

export default function Trainers({ trainers }) {
  const [active, setActive] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState("next");
  const [touchStart, setTouchStart] = useState(null);
  const [touchDiff, setTouchDiff] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // Build trainer data with fallbacks
  const trainerData = trainers?.length > 0 ? trainers.map(t => ({
    name: t.name,
    role: t.role,
    bio: t.bio,
    img: t.imageUrl || "/images/trainers/temp_trainer.png",
    quote: "Discipline is the bridge between goals and accomplishment."
  })) : [
    {
      name: "Keneizetuo Angami",
      role: "Head Coach",
      bio: "Certified S&C specialist with 10+ years experience in bodybuilding. Transforming lives through structured training programs and nutritional guidance.",
      img: "/images/trainers/temp_trainer.png",
      quote: "Discipline is the bridge between goals and accomplishment.",
    },
    {
      name: "Moarenba Jamir",
      role: "Strength Coach",
      bio: "Specializing in powerlifting, functional fitness, and athletic conditioning for all levels. Dedicated to pushing every member past their limits.",
      img: "/images/trainers/temp_trainer.png",
      quote: "Be stronger than your excuses.",
    },
  ];

  const total = trainerData.length;

  const goTo = useCallback((idx, dir) => {
    if (isAnimating) return;
    setDirection(dir);
    setIsAnimating(true);
    setTimeout(() => {
      setActive(idx);
      setTimeout(() => setIsAnimating(false), 50);
    }, 400);
  }, [isAnimating]);

  const goNext = useCallback(() => {
    goTo((active + 1) % total, "next");
  }, [active, total, goTo]);

  const goPrev = useCallback(() => {
    goTo((active - 1 + total) % total, "prev");
  }, [active, total, goTo]);

  // Auto-slide every 4 seconds
  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(goNext, 4000);
    return () => clearInterval(timerRef.current);
  }, [goNext, isPaused]);

  // Touch handlers for swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
    setIsPaused(true);
  };

  const handleTouchMove = (e) => {
    if (touchStart === null) return;
    setTouchDiff(e.touches[0].clientX - touchStart);
  };

  const handleTouchEnd = () => {
    if (Math.abs(touchDiff) > 60) {
      if (touchDiff > 0) goPrev();
      else goNext();
    }
    setTouchStart(null);
    setTouchDiff(0);
    setTimeout(() => setIsPaused(false), 4000);
  };

  const t = trainerData[active];

  return (
    <section className="squad-section" id="trainers" style={{ overflow: "hidden" }}>
      <div className="max-w">
        <div className="section-label reveal"><span>Trainers</span></div>
        <h2 className="section-title reveal reveal-heading">ELITE<br /><span className="gray">COACHES.</span></h2>
        <p className="reveal" style={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: '15px',
          maxWidth: '500px',
          lineHeight: '1.7',
          marginTop: '10px',
          fontFamily: "'Barlow', sans-serif"
        }}>
          Our certified coaches bring decades of combined experience. Every rep, every set — guided by expertise that transforms.
        </p>
      </div>

      {/* Carousel Container */}
      <div
        className="trainer-slider max-w reveal"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Main Card */}
        <div className={`trainer-slide ${isAnimating ? `slide-out-${direction}` : "slide-in"}`}>
          {/* Image Side */}
          <div className="trainer-slide-img-wrap">
            <img src={t.img} alt={t.name} className="trainer-slide-img" />
            <div className="trainer-slide-img-overlay" />
            {/* Counter Badge */}
            <div className="trainer-counter">
              <span className="trainer-counter-active">{String(active + 1).padStart(2, "0")}</span>
              <span className="trainer-counter-sep">/</span>
              <span className="trainer-counter-total">{String(total).padStart(2, "0")}</span>
            </div>
          </div>

          {/* Content Side */}
          <div className="trainer-slide-content">
            <div className="trainer-slide-role">{t.role}</div>
            <div className="trainer-slide-name">{t.name}</div>
            <div className="trainer-slide-bio">{t.bio}</div>

            {/* Quote */}
            <div className="trainer-slide-quote">
              <span className="quote-mark">&ldquo;</span>
              {t.quote}
            </div>

            {/* Dots Only */}
            <div className="trainer-dots">
              {trainerData.map((_, i) => (
                <button
                  key={i}
                  className={`trainer-dot ${i === active ? "active" : ""}`}
                  onClick={() => goTo(i, i > active ? "next" : "prev")}
                  aria-label={`Go to trainer ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
