// src/app/HomepageClient.js — Client wrapper for the homepage
// Handles: Navbar, BookingModal, ScrollReveal, Plan glow
// Matches nmegym-main/public/assets/js/main.js behaviors
"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import BookingModal from "@/components/ui/BookingModal";

export default function HomepageClient({ children, settings }) {
  const [bookingOpen, setBookingOpen] = useState(false);

  // ScrollReveal observer — matches old main.js lines 70-77
  useEffect(() => {
    // Increase timeout to ensure all DOM elements and styles are fully loaded/applied
    const timer = setTimeout(() => {
      const reveals = document.querySelectorAll(".reveal");
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            entry.target.classList.toggle("visible", entry.isIntersecting);
          });
        },
        { 
          threshold: 0, 
          rootMargin: "0px 0px -50px 0px" // Trigger slightly after it enters for better visual effect
        }
      );

      reveals.forEach((el) => observer.observe(el));
    }, 500);

    // Safety Fallback: Forcibly reveal all elements after 3 seconds in case observer fails on mobile
    const fallbackTimer = setTimeout(() => {
      document.querySelectorAll(".reveal:not(.visible)").forEach(el => {
        el.classList.add("visible");
      });
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(fallbackTimer);
    };
  }, []);

  // Wire up booking buttons by ID — matches old main.js openModal()
  useEffect(() => {
    const heroBtn = document.getElementById("heroBookTrial");
    const trialBtn = document.getElementById("trialBookBtn");
    const footerLink = document.getElementById("footerTrialLink");

    const openBooking = (e) => { e.preventDefault(); setBookingOpen(true); };

    [heroBtn, trialBtn, footerLink].forEach((btn) => {
      if (btn) btn.addEventListener("click", openBooking);
    });

    return () => {
      [heroBtn, trialBtn, footerLink].forEach((btn) => {
        if (btn) btn.removeEventListener("click", openBooking);
      });
    };
  }, []);

  // Plan card glow effect — matches old main.js lines 239-244
  useEffect(() => {
    const cards = document.querySelectorAll(".plan-mini");
    const handleMove = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      e.currentTarget.style.setProperty("--x", `${e.clientX - rect.left}px`);
      e.currentTarget.style.setProperty("--y", `${e.clientY - rect.top}px`);
    };
    cards.forEach((card) => card.addEventListener("mousemove", handleMove));
    return () => cards.forEach((card) => card.removeEventListener("mousemove", handleMove));
  }, []);

  return (
    <>
      <Navbar onOpenBooking={() => setBookingOpen(true)} settings={settings} />
      {children}
      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
}
