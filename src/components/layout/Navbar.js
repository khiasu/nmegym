// src/components/layout/Navbar.js — Main Navigation (Client Component)
// Matches nmegym-main/public/index.html lines 19-55 exactly
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar({ settings }) {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 60);
      
      if (currentScrollY > 150) {
        // Scrolling down hides, scrolling up shows
        setVisible(currentScrollY < lastScrollY);
      } else {
        setVisible(true);
      }
      lastScrollY = currentScrollY;
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMobile = () => {
    setMobileOpen(false);
    document.body.classList.remove("no-scroll");
    document.documentElement.classList.remove("no-scroll");
  };

  const toggleMobile = () => {
    const next = !mobileOpen;
    setMobileOpen(next);
    document.body.classList.toggle("no-scroll", next);
    document.documentElement.classList.toggle("no-scroll", next);
  };

  return (
    <>
      {/* NAV — old index.html line 20-33 */}
      <nav id="nav" className={`${scrolled ? "scrolled" : ""} ${!visible ? "nav-hidden" : ""}`}>
        <Link href="/" style={{ display: "flex", alignItems: "center" }}>
          <img src={settings?.logoUrl || "/newlogo.png"} alt="NME GYM" className="nav-logo-img" />
        </Link>
        <div className="nav-links">
          <a href="#about">About</a>
          <a href="#facilities">Facilities</a>
          <a href="#plans">Plans</a>
          <a href="#trainers">Trainers</a>
          <a href="#contact">Contact</a>
          <Link href="/auth/login" className="nav-member-btn">Member Login</Link>
          <a href="#plans" className="nav-cta" onClick={(e) => { e.preventDefault(); document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' }); }}>
            Join Now
          </a>
        </div>
        <div
          className={`hamburger ${mobileOpen ? "open" : ""}`}
          id="hamburger"
          onClick={toggleMobile}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </nav>

      {/* MOBILE MENU — PREMIUM REDESIGN */}
      <div className={`mobile-menu ${mobileOpen ? "open" : ""}`} id="mobileMenu">
        <div className="mm-bg-text">NME</div>
        
        <div className="mm-links">
          {[
            { name: "About", href: "#about" },
            { name: "Facilities", href: "#facilities" },
            { name: "Plans", href: "#plans" },
            { name: "Trainers", href: "#trainers" },
            { name: "Reviews", href: "#testimonials" },
            { name: "Contact", href: "#contact" }
          ].map((item, i) => (
            <a href={item.href} key={i} onClick={closeMobile} className="mm-link">
              <span className="mm-num">0{i + 1}</span>
              <span className="mm-text">{item.name}</span>
            </a>
          ))}
        </div>

        <div className="mm-footer">
          <Link href="/auth/login" onClick={closeMobile} className="mm-member-link">
            MEMBER LOGIN
          </Link>
          <a
            href="#plans"
            className="mm-cta"
            onClick={(e) => { e.preventDefault(); closeMobile(); document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' }); }}
          >
            JOIN NOW
          </a>
          
          <div className="mm-socials">
            <a href={settings?.instagramUrl || "https://instagram.com/nme_gym"} target="_blank" rel="noopener noreferrer">INSTA</a>
            <a href={`https://wa.me/${(settings?.whatsappNumber || "917005310568").replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">WHATSAPP</a>
          </div>
        </div>

        <Link href="/" className="mobile-home-btn" onClick={closeMobile} title="Back to Home">
          <span className="back-arrow">←</span>
        </Link>
      </div>
    </>
  );
}
