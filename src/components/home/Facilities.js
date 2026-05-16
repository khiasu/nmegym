"use client";

export default function Facilities({ facilities = [] }) {
  let displayFacilities = facilities.length > 0 
    ? facilities.slice(0, 5).map(f => ({
        name: f.name,
        desc: f.description,
        img: f.mediaUrl,
        type: f.mediaType || "IMAGE",
        tag: f.tag
      }))
    : [
      {
        name: "POWER RACK ZONE",
        desc: "Squat racks, Deadlift platforms, Olympic bars & more.",
        img: "https://images.unsplash.com/photo-1534367958379-246eb47144e4?w=1200&q=80",
        type: "IMAGE"
      },
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
      },
      {
        name: "CROSSFIT RIG",
        desc: "Battle ropes, kettlebells, and functional training.",
        img: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=600&q=80",
        type: "IMAGE"
      }
    ];

  return (
    <section className="media-section" id="facilities">
      <div className="max-w">
        <div className="section-label reveal"><span>Facilities</span></div>
        <h2 className="section-title reveal reveal-heading">TRAIN LIKE<br /><span className="gray">YOU MEAN IT.</span></h2>

        <div className="facilities-unified-showcase reveal">
          {displayFacilities.map((f, i) => (
            <div className={`facility-unified-card facility-pos-${i}`} key={i}>
              {f.type === "VIDEO" ? (
                <video src={f.img} autoPlay muted loop playsInline />
              ) : (
                <img src={f.img} alt={f.name} />
              )}
              <div className="facility-unified-overlay"></div>
              <div className="facility-unified-content">
                {f.tag && <span className="facility-unified-tag">{f.tag}</span>}
                <h3>{f.name}</h3>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
          <div className="facilities-more-hint" style={{ gridColumn: '1 / -1' }}>
            <span>......</span>
          </div>
        </div>
      </div>
      <style jsx>{`
        .facilities-unified-showcase {
          margin-top: 40px;
          display: grid;
          gap: 16px;
          grid-template-columns: 1fr;
        }
        .facility-unified-card {
          position: relative;
          width: 100%;
          height: 240px;
          overflow: hidden;
          border: 1px solid var(--border);
          border-radius: 4px;
        }
        .facility-unified-card img, .facility-unified-card video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(40%) brightness(0.85);
          transition: transform 1.2s cubic-bezier(0.19, 1, 0.22, 1), filter 1s ease;
        }
        .facility-unified-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 60%, transparent 100%);
          pointer-events: none;
        }
        .facility-unified-content {
          position: absolute;
          bottom: 20px;
          left: 20px;
          right: 20px;
          z-index: 2;
          pointer-events: none;
        }
        .facility-unified-tag {
          background: var(--red);
          color: #fff;
          padding: 4px 10px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 11px;
          letter-spacing: 2px;
          display: inline-block;
          margin-bottom: 10px;
        }
        .facility-unified-content h3 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 24px;
          letter-spacing: 1px;
          line-height: 1;
          margin-bottom: 6px;
        }
        .facility-unified-content p {
          color: rgba(255,255,255,0.7);
          font-size: 13px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .facility-unified-card:hover img, .facility-unified-card:hover video {
          transform: scale(1.05);
          filter: grayscale(0%) brightness(1.1);
        }
        .facility-unified-card:hover {
          border-color: rgba(232,0,29,0.5);
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        }

        /* Desktop Layout */
        @media (min-width: 769px) {
          .facilities-unified-showcase {
            grid-template-columns: 1fr 1fr 1fr;
          }
          /* Wide banner on top */
          .facility-pos-0 {
            grid-column: 1 / -1;
            height: 280px;
          }
          .facility-pos-0 .facility-unified-content h3 { font-size: 38px; margin-bottom: 8px; }
          .facility-pos-0 .facility-unified-content p { font-size: 15px; max-width: 500px; -webkit-line-clamp: unset; }

          /* 3 square boxes in one row below */
          .facility-pos-1,
          .facility-pos-2,
          .facility-pos-3 {
            grid-column: span 1;
            height: 220px;
          }
          .facility-pos-1 .facility-unified-content h3,
          .facility-pos-2 .facility-unified-content h3,
          .facility-pos-3 .facility-unified-content h3 { font-size: 20px; }

          /* 5th card hidden */
          .facility-pos-4 {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
