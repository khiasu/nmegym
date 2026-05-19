# NME GYM — Fitness Beyond Limits

This is the custom-built web platform for **NME GYM Nagaland**. It’s designed to be fast, premium, and zero-cost to run. No expensive payment gateways or subscription fees—just a direct, automated system for managing a modern gym.

---

## ⚡ What it Does

### 1. The Membership Flow (Automated)
Instead of paying a 3% fee to Stripe or Razorpay, we use a custom UPI verification system:
- **Join**: New members pick a plan, pay via your UPI QR code, and upload a screenshot.
- **Verify**: You get an email notification, review the screenshot in the Admin Portal, and click "Approve."
- **Onboard**: The system automatically creates their account, generates a Member ID, and emails them their login credentials instantly.

### 2. Full Admin Control Panel
You don't need to touch the code to update the site. The Admin Portal lets you:
- Change the **Gym Logo** and **Favicon** across the whole site.
- Update your **UPI ID** and **QR Code** for payments.
- Add/Edit **Trainers**, **Facilities**, and **Offers**.
- Manage **Memberships** (Track expiry, manual renewals, and deletions).
- Edit **About Us** text and **Policies** in real-time.

### 3. Mobile First
The entire admin dashboard and member portal are optimized for mobile. You can manage the whole gym from your phone while you're on the floor.

---

## 🛠 Tech Stack (The "Free" Engine)
- **Framework**: Next.js 16 (App Router)
- **Database**: Neon PostgreSQL (Free Tier)
- **Auth**: NextAuth.js (Secure member logins)
- **Images**: Cloudinary (Free hosting for photos and screenshots)
- **Email**: Resend (Reliable automated emails)
- **Styling**: Hand-written Vanilla CSS (Fast and clean)

---

## 🚀 Quick Start for Developers

1. **Setup Env**: Copy `.env.example` to `.env` and fill in your Neon and Cloudinary keys.
2. **Install**: `npm install`
3. **Sync DB**: `npx prisma db push`
4. **Seed**: `npm run db:seed` (Creates the default admin: `nmegym.india@gmail.com` / `nme2026`)
5. **Run**: `npm run dev`

---

## 💡 Important Notes

- **Zero Cost Policy**: The project is built to stay within the free tiers of Vercel, Neon, Cloudinary, and Resend. Don't add paid plugins unless the client explicitly asks.
- **Domain**: Keep an eye on **nmegym.in** renewal. If it expires, the emails and logins will stop working.
- **Email**: Currently using **Resend**. If you hit the daily limit, check the logs in the Resend dashboard.

---
**NME GYM — Fitness Beyond Limits.**
