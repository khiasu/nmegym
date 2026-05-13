"use client";

export default function Facilities() {
  const mainFacility = {
    name: "POWER RACK ZONE",
    desc: "Squat racks, Deadlift platforms, Olympic bars & more.",
    img: "https://images.unsplash.com/photo-1534367958379-246eb47144e4?w=1200&q=80"
  };

  const secondaryFacilities = [
    {
      name: "CARDIO SECTION",
      desc: "Treadmills, Cycles, Stairmasters & Arc Trainers.",
      img: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&q=80"
    },
    {
      name: "WEIGHTS AREA",
      desc: "Dumbbells, Barbells, Benches & Free weights.",
      img: "https://images.unsplash.com/photo-1583454110551-21f2fa2adfcd?w=600&q=80"
    },
    {
      name: "RESISTANCE ZONE",
      desc: "Machine-based strength & Pulley systems.",
      img: "https://images.unsplash.com/photo-1544033527-b192daee1f5b?w=600&q=80"
    }
  ];

  return (
    <section className="media-section" id="facilities">
      <div className="max-w">
        <div className="section-label reveal"><span>Facilities</span></div>
        <h2 className="section-title reveal reveal-heading">TRAIN LIKE<br /><span className="gray">YOU MEAN IT.</span></h2>

        <div className="facilities-showcase reveal">
          {/* Main Landscape Hero */}
          <div className="facility-hero">
            <img src={mainFacility.img} alt={mainFacility.name} />
            <div className="facility-hero-overlay"></div>
            <div className="facility-hero-content">
              <span className="facility-tag">ELITE ZONE</span>
              <h3>{mainFacility.name}</h3>
              <p>{mainFacility.desc}</p>
            </div>
          </div>

          {/* Secondary Grid */}
          <div className="facilities-sub-grid">
            {secondaryFacilities.map((f, i) => (
              <div className="facility-card-mini" key={i}>
                <img src={f.img} alt={f.name} />
                <div className="facility-mini-overlay"></div>
                <div className="facility-mini-content">
                  <h3>{f.name}</h3>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Subtle More Indicator */}
          <div className="facilities-more-hint">
            <span>+ EXPLORE 12+ MORE SPECIALIZED ZONES</span>
          </div>
        </div>
      </div>
    </section>
  );
}
