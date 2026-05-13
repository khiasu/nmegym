// src/components/ui/CustomCursor.js
"use client";

import { useEffect } from "react";

export default function CustomCursor() {
  useEffect(() => {
    // Only run on desktop
    if (window.innerWidth <= 768) return;

    const cursor = document.getElementById("cursor");
    const cursorRing = document.getElementById("cursorRing");
    
    if (!cursor || !cursorRing) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    const moveCursor = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.transform = `translate(${mouseX - 5}px, ${mouseY - 5}px)`;
    };

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      cursorRing.style.transform = `translate(${ringX - 18}px, ${ringY - 18}px)`;
      requestAnimationFrame(animateRing);
    };

    const handleHover = () => cursorRing.classList.add("expand");
    const handleLeave = () => cursorRing.classList.remove("expand");

    window.addEventListener("mousemove", moveCursor);
    animateRing();

    // Add hover effect to interactive elements
    const iterables = document.querySelectorAll("a, button, input, select, textarea, .plan-card, .testi-card, .class-card");
    iterables.forEach(el => {
      el.addEventListener("mouseenter", handleHover);
      el.addEventListener("mouseleave", handleLeave);
    });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      iterables.forEach(el => {
        el.removeEventListener("mouseenter", handleHover);
        el.removeEventListener("mouseleave", handleLeave);
      });
    };
  }, []);

  return (
    <>
      <div className="cursor" id="cursor"></div>
      <div className="cursor-ring" id="cursorRing"></div>
    </>
  );
}
