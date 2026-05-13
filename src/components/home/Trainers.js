// src/components/home/Trainers.js
// Matches nmegym-main/public/index.html lines 234-243 exactly
// Uses .squad-section, .squad-grid, .trainer-card
"use client";

export default function Trainers({ trainers }) {
  if (!trainers || trainers.length === 0) return null;

  return (
    <section className="squad-section" id="trainers">
      <div className="max-w">
        <div className="section-label reveal"><span>Trainers</span></div>
        <h2 className="section-title reveal reveal-heading">ELITE<br /><span className="gray">COACHES.</span></h2>
        <div className="squad-grid" id="trainerGrid">
          {trainers.slice(0, 2).map((t, i) => {
            const isMoa = i === 1;
            const name = isMoa ? "Moarenba Jamir" : t.name;
            const role = isMoa ? "Strength Coach" : (t.role || t.specialty);
            const bio = isMoa ? "Be stronger than your excuses" : (t.bio || '');
            const img = isMoa ? "/images/trainers/moa.png" : (t.imageUrl || "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&q=80");

            return (
              <div className="trainer-card reveal" key={t.id} style={{ transitionDelay: `${i * 80}ms` }}>
                <img
                  src={img}
                  alt={name}
                  className="trainer-img"
                />
                <div className="trainer-info">
                  <div className="trainer-role">{role}</div>
                  <div className="trainer-name">{name}</div>
                  <div className="trainer-bio">{bio}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
