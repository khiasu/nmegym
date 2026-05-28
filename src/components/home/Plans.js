"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import CheckoutModal from "@/components/ui/CheckoutModal";

export default function Plans({ plans, onOpenBooking, settings, offers }) {
  const { data: session } = useSession();
  const [checkoutPlan, setCheckoutPlan] = useState(null);

  const displayPlans = plans && plans.length > 0 ? plans : [
    { id: 'p1', name: '1 Month', price: 1500, period: 'per month', badge: 'BASIC' },
    { id: 'p2', name: '3 Months', price: 4000, period: 'quarterly', badge: 'MOST POPULAR' },
    { id: 'p3', name: '6 Months', price: 7500, period: 'half-year', badge: 'BEST VALUE' },
    { id: 'p4', name: '12 Months', price: 13000, period: 'annual', badge: 'PRO ELITE' }
  ];

  return (
    <section className="membership-section" id="plans">
      <div className="max-w">
        <div className="section-label reveal"><span>Join the Mission</span></div>
        <h2 className="section-title reveal reveal-heading">SELECT YOUR<br /><span className="gray">PLAN.</span></h2>


        <div className="membership-layout reveal">
          {/* Pay Per Session Card (Primary) */}
          <div className="membership-trial-card">
            <div className="mtc-tag">DAILY WORKOUT PASS</div>
            <h3 className="mtc-title">PAY PER<br /><span className="red">SESSION.</span></h3>
            <p className="mtc-desc">No long-term commitment. Get full access to the gym, weights, and cardio section for a single day.</p>
            <button 
              className="btn-primary" 
              id="trialBookBtn"
              onClick={() => setCheckoutPlan({ 
                id: 'pay-per-session', 
                name: 'Pay Per Session', 
                price: settings?.payPerSessionPrice || 200, 
                period: 'session' 
              })}
            >
              BUY DAILY PASS — ₹{settings?.payPerSessionPrice || 200}
            </button>
          </div>

          {/* Plans Grid (2x2) */}
          <div className="membership-plans">
            <div className="admission-banner reveal">
              <span className="ab-dot"></span> ₹<span id="dynamicAdmissionFee">{(settings?.admissionFee || 1000).toLocaleString()}</span> ANNUAL RENEWAL ADMISSION FEE APPLIES TO ALL PLANS
            </div>
            <div className="plans-2x2-grid">
              {displayPlans.map((plan, i) => {
                const isFeatured = plan.name === '3 Months' || i === 1;
                const badgeText = plan.badge;

                return (
                  <div
                    className={`plan-mini ${isFeatured ? 'featured' : ''} reveal`}
                    key={plan.id}
                    style={{ transitionDelay: `${(i + 1) * 0.1}s`, paddingBottom: '30px' }}
                  >
                    {badgeText && <div className="pm-badge">{badgeText}</div>}
                    <div className="pm-dur">{plan.name || plan.period}</div>
                    <div className="pm-price">₹{plan.price?.toLocaleString()}</div>

                    <button className="pm-btn" onClick={() => setCheckoutPlan(plan)}>JOIN NOW</button>
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
      
      <CheckoutModal 
        isOpen={!!checkoutPlan} 
        onClose={() => setCheckoutPlan(null)} 
        selectedPlan={checkoutPlan}
        session={session}
        settings={settings}
        offers={offers}
      />
    </section>
  );
}
