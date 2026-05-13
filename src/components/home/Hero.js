// src/components/home/Hero.js
// Matches nmegym-main/public/index.html lines 57-92 exactly
"use client";

export default function Hero({ offer }) {
  return (
    <section className="hero">
      <div className="hero-bg"></div>
      <div className="hero-bg-img"></div>
      <div className="hero-vignette"></div>
      <div className="hero-grid"></div>
      <div className="hero-number">NME</div>
      <div className="hero-content page-entrance">
        <div className="hero-tag">
          <span></span>
          <p>Now Open — Chumoukedima, Nagaland</p>
        </div>
        <h1 className="hero-title">
          FORGE<br />
          <span className="stroke">YOUR</span><br />
          <span className="red">LEGACY</span>
        </h1>

        {/* Promo badge container — old index.html line 68 */}
        <div id="promoBadge" className="promo-badge-container">
          {offer && offer.isActive && (
            <div className="promo-badge reveal visible">
              <span className="pb-tag">{offer.badge || 'OFFER'}</span>
              <span className="pb-text">{offer.title} — {offer.discount ? offer.discount + '% OFF' : 'CLAIM NOW'}</span>
            </div>
          )}
        </div>

        <p className="hero-sub">START TODAY, FEEL IT TOMORROW</p>
        <div className="hero-actions">
          <a href="#" className="btn-primary" id="heroBookTrial">Book Free Trial</a>
          <a href="#plans" className="btn-outline">See Plans</a>
        </div>
      </div>
      <div className="hero-scroll">
        <span>Scroll</span>
        <div className="scroll-line"></div>
      </div>
      <div className="hero-stats">
        <div className="stat-item">
          <div className="stat-num">200+</div>
          <div className="stat-label">Members</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">Expert</div>
          <div className="stat-label">Trainers</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">5★</div>
          <div className="stat-label">Rated</div>
        </div>
      </div>
    </section>
  );
}
