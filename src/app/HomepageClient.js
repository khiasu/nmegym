// src/app/HomepageClient.js — Client wrapper for the homepage
// Handles: Navbar, BookingModal, ScrollReveal, Plan glow
// Matches nmegym-main/public/assets/js/main.js behaviors
"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import BookingModal from "@/components/ui/BookingModal";

export default function HomepageClient({ children }) {
  const [bookingOpen, setBookingOpen] = useState(false);

  // ScrollReveal observer — matches old main.js lines 70-77
  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            // Stop observing once visible to save performance
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05 }
    );

    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
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
      <Navbar onOpenBooking={() => setBookingOpen(true)} />
      {children}
      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
}
