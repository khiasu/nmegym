import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const updated = await prisma.settings.upsert({
      where: { id: 1 },
      update: {
        gymName: data.gymName,
        logoUrl: data.logoUrl,
        whatsappNumber: data.whatsappNumber,
        email: data.email,
        address: data.address,
        instagramUrl: data.instagramUrl,
        upiId: data.upiId,
        upiQrUrl: data.upiQrUrl,
        aboutText: data.aboutText,
        aboutText2: data.aboutText2,
        openingHours: data.openingHours,
        heroBackgroundUrl: data.heroBackgroundUrl,
        aboutImage1Url: data.aboutImage1Url,
        aboutImage2Url: data.aboutImage2Url,
        aboutImage3Url: data.aboutImage3Url,
        termsAndConditions: data.termsAndConditions,
        privacyPolicy: data.privacyPolicy,
        refundPolicy: data.refundPolicy,
        admissionFee: data.admissionFee !== undefined ? (parseInt(data.admissionFee) >= 0 ? parseInt(data.admissionFee) : 0) : 1000,
        payPerSessionPrice: data.payPerSessionPrice !== undefined ? (parseInt(data.payPerSessionPrice) >= 0 ? parseInt(data.payPerSessionPrice) : 200) : 200,
        marqueeItem1: data.marqueeItem1,
        marqueeItem2: data.marqueeItem2,
        marqueeItem3: data.marqueeItem3,
        marqueeItem4: data.marqueeItem4,
        marqueeItem5: data.marqueeItem5,
        marqueeItem6: data.marqueeItem6,
        marqueeItem7: data.marqueeItem7,
      },
      create: {
        id: 1,
        gymName: data.gymName,
        logoUrl: data.logoUrl,
        whatsappNumber: data.whatsappNumber,
        email: data.email,
        address: data.address,
        instagramUrl: data.instagramUrl,
        upiId: data.upiId,
        upiQrUrl: data.upiQrUrl,
        aboutText: data.aboutText,
        aboutText2: data.aboutText2,
        openingHours: data.openingHours,
        heroBackgroundUrl: data.heroBackgroundUrl,
        aboutImage1Url: data.aboutImage1Url,
        aboutImage2Url: data.aboutImage2Url,
        aboutImage3Url: data.aboutImage3Url,
        termsAndConditions: data.termsAndConditions,
        privacyPolicy: data.privacyPolicy,
        refundPolicy: data.refundPolicy,
        admissionFee: data.admissionFee !== undefined ? (parseInt(data.admissionFee) >= 0 ? parseInt(data.admissionFee) : 0) : 1000,
        payPerSessionPrice: data.payPerSessionPrice !== undefined ? (parseInt(data.payPerSessionPrice) >= 0 ? parseInt(data.payPerSessionPrice) : 200) : 200,
        marqueeItem1: data.marqueeItem1,
        marqueeItem2: data.marqueeItem2,
        marqueeItem3: data.marqueeItem3,
        marqueeItem4: data.marqueeItem4,
        marqueeItem5: data.marqueeItem5,
        marqueeItem6: data.marqueeItem6,
        marqueeItem7: data.marqueeItem7,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
