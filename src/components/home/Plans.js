"use client";

import Link from "next/link";

export default function Plans({ plans, onOpenBooking }) {
  const fallbackPlans = [
    { id: '1', name: 'Monthly', price: 800, period: 'month', badge: "STARTER" },
    { id: '2', name: '3 Months', price: 2000, period: '3 months', featured: true, badge: "POPULAR" },
    { id: '3', name: '6 Months', price: 4000, period: '6 months', badge: "BEST VALUE" },
  ];
  
  const displayPlans = (plans && plans.length > 0) ? plans : fallbackPlans;

  const getBadge = (name) => {
    if (name.toLowerCase().includes('monthly')) return "STARTER";
    if (name.toLowerCase().includes('3 month')) return "BEST VALUE";
    if (name.toLowerCase().includes('6 month')) return "MOST POPULAR";
    if (name.toLowerCase().includes('year')) return "ELITE CHOICE";
    return "MEMBER";
  };

  return (
    <section className="membership-section" id="plans">
      <div className="max-w">
        <div className="section-label reveal"><span>Join the Mission</span></div>
        <h2 className="section-title reveal reveal-heading">SELECT YOUR<br /><span className="gray">PLAN.</span></h2>


        <div className="membership-layout reveal">
          {/* Trial Card (Primary) */}
          <div className="membership-trial-card">
            <div className="mtc-tag">NEW MEMBER SPECIAL</div>
            <h3 className="mtc-title">FIRST SESSION<br /><span className="red">IS ON US.</span></h3>
            <p className="mtc-desc">Experience the energy, the equipment, and the culture. Claim your free 1-day pass now.</p>
            <button className="btn-primary" id="trialBookBtn">BOOK 1-DAY TRIAL</button>
          </div>

          {/* Plans Grid (2x2) */}
          <div className="membership-plans">
            <div className="admission-banner reveal">
              <span className="ab-dot"></span> ₹1,000 ONE-TIME ADMISSION FEE APPLIES TO ALL PLANS
            </div>
            <div className="plans-2x2-grid">
              {displayPlans.map((plan, i) => {
                const isFeatured = plan.featured || plan.name === '3 Months' || i === 1;
                const badgeText = plan.badge || getBadge(plan.name);

                return (
                  <div
                    className={`plan-mini ${isFeatured ? 'featured' : ''} reveal`}
                    key={plan.id}
                    style={{ transitionDelay: `${(i + 1) * 0.1}s`, paddingBottom: '30px' }}
                  >
                    <div className="pm-badge">{badgeText}</div>
                    <div className="pm-dur">{plan.name || plan.period}</div>
                    <div className="pm-price">₹{plan.price?.toLocaleString()}</div>

                    <Link href="/auth/login">
                      <button className="pm-btn">JOIN NOW</button>
                    </Link>
                  </div>
                );
              })}
            </div>
            <div className="reveal" style={{ textAlign: 'center', marginTop: '30px' }}>
              <span className="plan-hostel-note">
                *Plan prices differ for Kemnbay hostellers. Contact management for details.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
