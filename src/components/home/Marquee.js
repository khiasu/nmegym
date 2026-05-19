// src/components/home/Marquee.js
"use client";

export default function Marquee({ settings }) {
  const defaults = [
    "CARDIO SECTION", "WEIGHTS AREA", "POWER RACK ZONE", "RESISTANCE SECTION", "INDOOR TRACK",
    "PERSONAL TRAINING", "YOGA & FLEXIBILITY"
  ];

  const items = [];
  for (let i = 1; i <= 7; i++) {
    const val = settings?.[`marqueeItem${i}`];
    items.push(val || defaults[i-1]);
  }

  // Duplicate for seamless loop
  const displayItems = [...items, ...items];

  return (
    <div className="marquee-section">
      <div className="marquee-track">
        {displayItems.map((text, i) => (
          <div className="marquee-item" key={i}>
            <span className="marquee-text">{text}</span>
            <div className="marquee-dot"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
