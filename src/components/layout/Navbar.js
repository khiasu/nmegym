// src/components/layout/Navbar.js — Main Navigation (Client Component)
// Matches nmegym-main/public/index.html lines 19-55 exactly
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar({ onOpenBooking }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
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
      <nav id="nav" className={scrolled ? "scrolled" : ""}>
        <Link href="/" style={{ display: "flex", alignItems: "center" }}>
          <img src="/newlogo.png" alt="NME GYM" className="nav-logo-img" />
        </Link>
        <div className="nav-links">
          <a href="#about">About</a>
          <a href="#facilities">Facilities</a>
          <a href="#plans">Plans</a>
          <a href="#trainers">Trainers</a>
          <a href="#contact">Contact</a>
          <Link href="/auth/login" className="nav-member-btn">Member Login</Link>
          <a href="#" className="nav-cta" onClick={(e) => { e.preventDefault(); onOpenBooking?.(); }}>
            Book Free Trial
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

      {/* MOBILE MENU — old index.html line 42-55 */}
      <div className={`mobile-menu ${mobileOpen ? "open" : ""}`} id="mobileMenu">
        <a href="#about" onClick={closeMobile}>About</a>
        <a href="#facilities" onClick={closeMobile}>Facilities</a>
        <a href="#plans" onClick={closeMobile}>Plans</a>
        <a href="#trainers" onClick={closeMobile}>Trainers</a>
        <a href="#testimonials" onClick={closeMobile}>Reviews</a>
        <a href="#contact" onClick={closeMobile}>Contact</a>
        <Link
          href="/auth/login"
          onClick={closeMobile}
          style={{ color: "rgba(255,255,255,0.5)", fontSize: "24px" }}
        >
          Member Login
        </Link>
        <a
          href="#"
          style={{ color: "var(--red)", fontSize: "26px" }}
          onClick={(e) => { e.preventDefault(); closeMobile(); onOpenBooking?.(); }}
        >
          ▶ Book Free Trial
        </a>
        <Link href="/" className="mobile-home-btn" onClick={closeMobile} title="Back to Home">
          <span className="back-arrow">←</span>
        </Link>
      </div>
    </>
  );
}
