// src/app/favicon.ico/route.js
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getSettings();
    const logoUrl = settings?.logoUrl;
    
    if (logoUrl) {
      return Response.redirect(logoUrl, 302);
    }
  } catch (error) {
    console.error("Favicon redirect error:", error);
  }
  
  // Fallback to local default logo if database query fails or logoUrl is empty
  return Response.redirect("https://nmegym.in/newlogo.png", 302);
}
