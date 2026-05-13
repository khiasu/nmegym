// src/lib/data.js — Server-side data fetching functions
// These run ONLY on the server (inside Server Components / Route Handlers)

import prisma from "./prisma";

/** Fetch all trainers, ordered by creation date */
export async function getTrainers() {
  try {
    return await prisma.trainer.findMany({
      orderBy: { createdAt: "asc" },
    });
  } catch (e) {
    console.error("Failed to fetch trainers:", e);
    return [];
  }
}

/** Fetch all plans, ordered by price ascending */
export async function getPlans() {
  try {
    return await prisma.plan.findMany({
      orderBy: { price: "asc" },
    });
  } catch (e) {
    console.error("Failed to fetch plans:", e);
    return [];
  }
}

/** Fetch the currently active offer (promo badge) */
export async function getActiveOffer() {
  try {
    return await prisma.offer.findFirst({
      where: { isActive: true },
    });
  } catch (e) {
    console.error("Failed to fetch offer:", e);
    return null;
  }
}

/** Fetch gym settings (name, logo, socials, etc.) */
export async function getSettings() {
  try {
    return await prisma.settings.findFirst();
  } catch (e) {
    console.error("Failed to fetch settings:", e);
    return null;
  }
}

/** Fetch all facilities */
export async function getFacilities() {
  try {
    return await prisma.facility.findMany({
      orderBy: { createdAt: "asc" },
    });
  } catch (e) {
    console.error("Failed to fetch facilities:", e);
    return [];
  }
}
