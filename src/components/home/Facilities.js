"use client";

export default function Facilities({ facilities = [] }) {
  // Use DB data if available, otherwise fall back to hardcoded
  let mainFacility = facilities.length > 0 ? {
    name: facilities[0].name,
    desc: facilities[0].description,
    img: facilities[0].mediaUrl,
    type: facilities[0].mediaType || "IMAGE"
  } : {
    name: "POWER RACK ZONE",
    desc: "Squat racks, Deadlift platforms, Olympic bars & more.",
    img: "https://images.unsplash.com/photo-1534367958379-246eb47144e4?w=1200&q=80",
    type: "IMAGE"
  };

  let secondaryFacilities = facilities.length > 1 
    ? facilities.slice(1, 4).map(f => ({
        name: f.name,
        desc: f.description,
        img: f.mediaUrl,
        type: f.mediaType || "IMAGE"
      }))
    : [
      {
        name: "CARDIO SECTION",
        desc: "Treadmills, Cycles, Stairmasters & Arc Trainers.",
        img: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&q=80",
        type: "IMAGE"
      },
      {
        name: "WEIGHTS AREA",
        desc: "Dumbbells, Barbells, Benches & Free weights.",
        img: "https://images.unsplash.com/photo-1583454110551-21f2fa2adfcd?w=600&q=80",
        type: "IMAGE"
      },
      {
        name: "RESISTANCE ZONE",
        desc: "Machine-based strength & Pulley systems.",
        img: "https://images.unsplash.com/photo-1544033527-b192daee1f5b?w=600&q=80",
        type: "IMAGE"
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
            {mainFacility.type === "VIDEO" ? (
              <video src={mainFacility.img} autoPlay muted loop playsInline />
            ) : (
              <img src={mainFacility.img} alt={mainFacility.name} />
            )}
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
                {f.type === "VIDEO" ? (
                  <video src={f.img} autoPlay muted loop playsInline />
                ) : (
                  <img src={f.img} alt={f.name} />
                )}
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
            <span>......</span>
          </div>
        </div>
      </div>
    </section>
  );
}
