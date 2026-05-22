// src/app/favicon.ico/route.js
import { getSettings } from "@/lib/data";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getSettings();
    const logoUrl = settings?.logoUrl;
    
    if (logoUrl) {
      const response = await fetch(logoUrl);
      if (response.ok) {
        const contentType = response.headers.get("content-type") || "image/png";
        const arrayBuffer = await response.arrayBuffer();
        return new Response(arrayBuffer, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        });
      }
    }
  } catch (error) {
    console.error("Favicon dynamic fetch error:", error);
  }
  
  // Fallback to local default logo from public directory
  try {
    const filePath = path.join(process.cwd(), "public", "newlogo.png");
    const fileBuffer = fs.readFileSync(filePath);
    return new Response(fileBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (fallbackError) {
    console.error("Favicon local fallback error:", fallbackError);
    return new Response("Not Found", { status: 404 });
  }
}

