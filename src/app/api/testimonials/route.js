import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, rating } = await req.json();
    
    if (!content || content.length < 5) {
      return NextResponse.json({ error: "Testimonial too short" }, { status: 400 });
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        content,
        rating: parseInt(rating) || 5,
        userId: session.user.id,
        isPublic: false, // Requires admin moderation
      },
    });

    return NextResponse.json(testimonial);
  } catch (error) {
    console.error("Testimonial error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isPublic: true },
      include: { 
        user: { 
          select: { 
            firstName: true, 
            lastName: true,
            memberships: {
              select: { planTier: true },
              take: 1,
              orderBy: { createdAt: 'desc' }
            }
          } 
        } 
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(testimonials);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
