// src/components/home/About.js
// Matches nmegym-main/public/index.html lines 136-198 exactly
"use client";

export default function About() {
  return (
    <section className="about-strip" id="about">
      <div className="max-w">
        <div className="section-label reveal"><span>Who We Are</span></div>
        <h2 className="section-title reveal reveal-heading">NOT JUST A GYM.<br /><span className="gray">A MOVEMENT.</span></h2>
        <div className="about-content">
          <div className="about-text reveal">
            <p className="highlight">"We don't just build bodies here — we build discipline, character, and champions."</p>
            <p>NME Gym was born from a single belief: everyone deserves access to elite-level training without the elite price tag. Located in the heart of Chumoukedima, Nagaland, we've built a space where beginners find their footing and athletes push their limits — side by side.</p>
            <br />
            <p>Our certified coaches, premium equipment, and charged atmosphere make every rep count. Whether you're chasing a physique, building strength, or just starting your fitness journey — NME is where it begins.</p>
          </div>
          <div className="about-img-grid reveal">
            <div className="about-img about-img-tall">
              <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80" alt="NME Gym interior" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div className="about-img">
                <img src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80" alt="Training" />
              </div>
              <div className="about-img">
                <img src="https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=80" alt="Equipment" />
              </div>
            </div>
          </div>
        </div>
        <div className="about-features reveal">
          {/* Feature 1 — Pro Equipment (dumbbell SVG) */}
          <div className="feature-item">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="var(--red)">
                <path d="M21 11h-1.12c-.41-1.5-1.74-2.62-3.38-2.62s-2.97 1.12-3.38 2.62h-2.24c-.41-1.5-1.74-2.62-3.38-2.62s-2.97 1.12-3.38 2.62H3c-.55 0-1 .45-1 1s.45 1 1 1h1.12c.41 1.5 1.74 2.62 3.38 2.62s2.97-1.12 3.38-2.62h2.24c.41 1.5 1.74 2.62 3.38 2.62s2.97-1.12 3.38-2.62H21c.55 0 1-.45 1-1s-.45-1-1-1z" />
              </svg>
            </div>
            <div className="feature-title">Pro Equipment</div>
            <div className="feature-desc">Top-grade machines & free weights for every muscle group.</div>
          </div>
          {/* Feature 2 — Expert Coaches (person SVG) */}
          <div className="feature-item">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="var(--red)">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
            </div>
            <div className="feature-title">Expert Coaches</div>
            <div className="feature-desc">Certified trainers who are invested in YOUR results.</div>
          </div>
          {/* Feature 3 — Flexible Hours (clock SVG) */}
          <div className="feature-item">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="var(--red)">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
              </svg>
            </div>
            <div className="feature-title">Flexible Hours</div>
            <div className="feature-desc">Early morning to late night — train on your schedule.</div>
          </div>
          {/* Feature 4 — Real Results (checkmark SVG) */}
          <div className="feature-item">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="var(--red)">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <div className="feature-title">Real Results</div>
            <div className="feature-desc">200+ members transformed. Your turn is now.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
