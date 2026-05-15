// src/components/layout/Footer.js
"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="footer-grid max-w">
        <div className="footer-brand">
          <div className="logo-wrap">
            <img src="/newlogo.png" alt="NME Gym Logo" className="nav-logo-img" style={{ height: "48px", width: "auto" }} />
          </div>
          <p>No Mercy. No Excuses. Chumoukedima's most serious fitness destination.</p>
          <div className="footer-social">
            <a href="https://www.instagram.com/nme_gym?igsh=MWwzeXJ5aDVwa3o1aA==" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="ig2" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f09433" />
                    <stop offset="50%" stopColor="#dc2743" />
                    <stop offset="100%" stopColor="#bc1888" />
                  </linearGradient>
                </defs>
                <rect width="24" height="24" rx="6" fill="url(#ig2)" />
                <circle cx="12" cy="12" r="4.2" stroke="white" strokeWidth="1.8" fill="none" />
                <circle cx="17.5" cy="6.5" r="1.2" fill="white" />
              </svg>
            </a>
            <a href="https://wa.me/917005310568" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="12" fill="#25D366" />
                <path d="M17.5 6.5A7.4 7.4 0 0 0 12 4.2a7.4 7.4 0 0 0-6.3 11.2L4.2 19.8l4.5-1.2a7.4 7.4 0 0 0 3.3.8 7.4 7.4 0 0 0 7.4-7.4 7.4 7.4 0 0 0-2-5zm-5.5 11.4a6.1 6.1 0 0 1-3.1-.8l-.2-.1-2.5.7.7-2.5-.2-.2A6.1 6.1 0 1 1 12 17.9zm3.3-4.6c-.2-.1-1-.5-1.2-.6-.2-.1-.3-.1-.4.1-.1.2-.5.6-.6.7-.1.1-.2.1-.4 0-.2-.1-.8-.3-1.5-.9-.5-.5-.9-1-.9-1.2-.1-.2 0-.3.1-.4l.3-.4.2-.3v-.3c-.1-.2-.5-1-.6-1.4-.1-.4-.3-.3-.4-.3h-.4c-.1 0-.4.1-.6.3-.2.2-.8.8-.8 1.8s.8 2.1.9 2.3c.1.1 1.5 2.3 3.7 3.2.5.2.9.4 1.2.5.5.2 1 .2 1.3.1.4-.1 1.2-.5 1.4-1 .2-.4.2-.9.1-.9-.1-.1-.2-.1-.4-.2z" fill="white" />
              </svg>
            </a>
            <a href="mailto:nmegym.india@gmail.com">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" rx="4" fill="#444" />
                <path d="M4 8l8 5 8-5" stroke="white" strokeWidth="1.5" fill="none" />
                <rect x="4" y="6" width="16" height="12" rx="2" stroke="white" strokeWidth="1.5" fill="none" />
              </svg>
            </a>
          </div>
        </div>
        
        <div className="footer-links-row">
          <div className="footer-col">
            <h5>Quick Links</h5>
            <a href="#about">About Us</a>
            <a href="#classes">Classes</a>
            <a href="#plans">Membership</a>
            <a href="#trainers">Trainers</a>
            <a href="#" onClick={(e) => { e.preventDefault(); document.getElementById('trialBookBtn')?.click(); }}>Free Trial</a>
          </div>
          <div className="footer-col">
            <h5>Support</h5>
            <Link href="/legal">Legal Policy</Link>
            <a href="#contact">Contact</a>
            <a href="https://wa.me/917005310568" target="_blank" rel="noopener noreferrer">WhatsApp</a>
          </div>
          <div className="footer-col">
            <h5>Contact</h5>
            <a href="tel:+917005310568">+91 70053 10568</a>
            <a href="mailto:nmegym.india@gmail.com">nmegym.india@gmail.com</a>
            <a href="https://maps.app.goo.gl/9egiUnvKSZbBp9jc9?g_st=ac" target="_blank" rel="noopener noreferrer">View on Maps</a>
            <Link href="/admin" style={{ color: "#333", fontSize: "10px", marginTop: "10px" }}>Admin</Link>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} NME GYM • Chumoukedima, Nagaland • All rights reserved.</p>
        <p style={{ color: "#333" }}>EST. 2025.</p>
      </div>
    </footer>
  );
}
