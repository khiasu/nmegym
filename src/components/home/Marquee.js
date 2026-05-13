// src/components/home/Marquee.js
"use client";

export default function Marquee() {
  const items = [
    "CARDIO SECTION", "WEIGHTS AREA", "POWER RACK ZONE", "RESISTANCE SECTION", "INDOOR TRACK",
    "ZUMBA CLASSES", "YOGA & FLEXIBILITY", "PERSONAL TRAINING",
    "CARDIO SECTION", "WEIGHTS AREA", "POWER RACK ZONE", "RESISTANCE SECTION", "INDOOR TRACK"
  ];

  return (
    <div className="marquee-section">
      <div className="marquee-track">
        {items.map((text, i) => (
          <div className="marquee-item" key={i}>
            <span className="marquee-text">{text}</span>
            <div className="marquee-dot"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
