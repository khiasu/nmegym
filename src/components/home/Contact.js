// src/components/home/Contact.js
// Matches nmegym-main/public/index.html lines 386-492 exactly
// Uses .contact-section with .contact-header-compact, .contact-social-strip, .immersive-map
// Footer links are INSIDE the contact section, not a separate component
"use client";

import Link from "next/link";

export default function Contact() {
  return (
    <>
      {/* CONTACT + FOOTER (UNIFIED) — old index.html line 386 */}
      <section className="contact-section" id="contact" style={{ paddingBottom: '30px' }}>
        <div className="max-w">
          <div className="contact-header-original reveal">
            <div className="cho-left">
              <div className="section-label"><span>FIND US</span></div>
              <h2 className="section-title reveal reveal-heading">COME SAY<br /><span className="gray">HELLO.</span></h2>
            </div>
            <div className="cho-right">
              <div className="sh-label">TIMINGS</div>
              <div className="cho-timings-list">
                <div className="cho-time-group">
                  <span className="cho-season">MON-SAT</span>
                  <span className="sh-red">5:30 AM - 10:00 PM</span>
                </div>
                <div className="cho-time-group">
                  <span className="cho-season">SUNDAY</span>
                  <span className="sh-red">7:00 AM - 1:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-social-strip reveal">
            <a href="https://www.instagram.com/nme_gym" className="cs-item" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
              </svg>
              <span>@nme_gym</span>
            </a>
            <div className="cs-sep"></div>
            <a href="mailto:nmegym.india@gmail.com" className="cs-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <polyline points="2,4 12,13 22,4" />
              </svg>
              <span>nmegym.india</span>
            </a>
            <div className="cs-sep"></div>
            <a href="https://wa.me/917005310568" className="cs-item" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>+91 70053 10568</span>
            </a>
          </div>

          <div className="immersive-map reveal">
            <iframe
              src="https://maps.google.com/maps?q=Kemnbay+School,Tenyiphe-1,Chumoukedima,Nagaland&output=embed"
              allowFullScreen
              loading="lazy"
            ></iframe>
            <div className="map-smoky-overlay"></div>
          </div>

          {/* QUICK LINKS — old index.html line 449-471 */}
          <div className="footer-links-row" style={{ marginTop: "32px" }}>
            <div className="footer-col">
              <h5>Quick Links</h5>
              <a href="#about">About Us</a>
              <a href="#facilities">Facilities</a>
              <a href="#plans">Membership</a>
            </div>
            <div className="footer-col">
              <h5>Support</h5>
              <a href="https://wa.me/919863765861" target="_blank" rel="noopener noreferrer">WhatsApp</a>
              <a href="mailto:nmegym.india@gmail.com">Email Us</a>
              <Link href="/auth/login">Member Login</Link>
            </div>
            <div className="footer-col">
              <h5>Follow</h5>
              <a href="https://www.instagram.com/nme_gym?igsh=MWwzeXJ5aDVwa3o1aA==" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="https://wa.me/919863765861" target="_blank" rel="noopener noreferrer">WhatsApp</a>
              <a href="https://share.google/SStiUEM2Xh5EhoU0q" target="_blank" rel="noopener noreferrer">View on Maps</a>
            </div>
          </div>
        </div>

        {/* COPYRIGHT — old index.html line 475-478 */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} NME GYM · Chumoukedima, Nagaland · All rights reserved.</p>
        </div>
      </section>

      {/* FLOATING WA — old index.html line 482-492 */}
      <a
        href="https://wa.me/917005310568?text=Hi%20NME%20Gym!%20I%20need%20some%20assistance."
        className="wa-float"
        target="_blank"
        rel="noopener noreferrer"
        title="WhatsApp"
      >
        <svg viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.7-30.6-38.1-3.2-5.5-.3-8.4 2.4-11.2 2.5-2.5 5.5-6.4 8.3-9.6 2.8-3.2 3.7-5.5 5.6-9.2 1.9-3.7 1-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.5 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" fill="#fff" />
        </svg>
      </a>
    </>
  );
}
