// src/app/HomepageClient.js — Client wrapper for the homepage
// Handles: Navbar, ScrollReveal, Plan glow
// Matches nmegym-main/public/assets/js/main.js behaviors
"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";

export default function HomepageClient({ children, settings }) {
  const [pendingWaUrl, setPendingWaUrl] = useState(null);
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

  // WhatsApp Alert Effect
  useEffect(() => {
    const url = localStorage.getItem("nme_pending_whatsapp_url");
    if (url) {
      setPendingWaUrl(url);
    }
  }, []);

  return (
    <>
      <Navbar settings={settings} />
      {children}

      {/* COMPULSORY WHATSAPP FLOATING CARD */}
      {pendingWaUrl && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          zIndex: 9999,
          background: 'rgba(10,10,10,0.95)',
          border: '2px solid var(--elite-red, #e8001d)',
          borderRadius: '12px',
          padding: '20px',
          maxWidth: '350px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(10px)',
          fontFamily: "'Inter', sans-serif"
        }}>
          <h4 style={{ color: 'white', fontSize: '13px', fontWeight: 'bold', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{color: '#ffc800'}}>⚠️</span> Complete Registration
          </h4>
          <p style={{ color: '#ccc', fontSize: '11.5px', margin: '0 0 15px 0', lineHeight: '1.5' }}>
            Your transaction was submitted but you haven't notified the admin via WhatsApp. This is required to verify your payment.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <a 
              href={pendingWaUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => {
                localStorage.removeItem("nme_pending_whatsapp_url");
                setPendingWaUrl(null);
              }}
              style={{
                background: '#25D366',
                color: 'white',
                padding: '10px 16px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '11.5px',
                textAlign: 'center',
                flex: 1,
                boxShadow: '0 4px 12px rgba(37,211,102,0.2)'
              }}
            >
              💬 Send WhatsApp Now
            </a>
            <button 
              onClick={() => {
                localStorage.removeItem("nme_pending_whatsapp_url");
                setPendingWaUrl(null);
              }}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#888',
                padding: '10px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  );
}
