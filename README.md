# NME GYM — Full Technical Documentation

A premium, high-performance web platform for NME GYM. This project is built with a focus on cinematic aesthetics, robust administrative control, and automated member management.

---

## 🚀 Tech Stack & Infrastructure
*   **Framework:** Next.js 15+ (App Router, Server Actions where applicable)
*   **Language:** JavaScript (ES6+)
*   **Database:** Neon PostgreSQL (Serverless, hosted on AWS region `aws-ap-southeast-1`)
*   **ORM:** Prisma 7.x (Client-side generation for type-safety)
*   **Authentication:** NextAuth.js (JWT Strategy)
*   **Media Hosting:** Cloudinary (CDN for images & payment screenshots)
*   **Email:** Nodemailer (Transaction emails via Gmail SMTP)
*   **Styling:** Vanilla CSS (Modular design tokens in `nme-gym.css`)

---

## 📂 Deep Directory Structure
```bash
├── prisma/
│   └── schema.prisma        # Database models & relationships
├── public/                  # Static assets & brand identity
└── src/
    ├── app/                 # Next.js App Router
    │   ├── admin/           # Admin Portal (Secure)
    │   │   ├── client/      # Admin UI wrappers & tab logic
    │   │   └── tabs/        # Individual Admin Tabs (Registrations, Payments, Settings)
    │   ├── api/             # RESTful API Endpoints
    │   │   ├── admin/       # Protected Admin actions (Verify, Delete, Settings)
    │   │   ├── auth/        # NextAuth configuration & callbacks
    │   │   └── checkout/    # Plan selection & payment upload logic
    │   ├── auth/            # Client-side Auth pages (Login, Register, Reset)
    │   ├── dashboard/       # Member-only portal (Renewal, Status)
    │   └── legal/           # Dynamic policy rendering engine
    ├── components/
    │   ├── home/            # Interactive Hero, Trainers, Contact sections
    │   ├── providers/       # Auth & Theme context providers
    │   └── ui/              # Reusable components (Modals, UploadArea, Notifications)
    ├── lib/                 # Backend Utilities
    │   ├── db.js            # Prisma Singleton Client
    │   ├── mail.js          # SMTP Email Logic
    │   └── data.js          # Shared Server-side Data Fetching
    └── styles/
        └── nme-gym.css      # 1000+ line bespoke design system
```

---

## 🏗️ Core System Logic

### 1. Dynamic Admin Settings (Singleton Pattern)
The site uses a singleton `Settings` model. All global variables (WhatsApp number, UPI ID, Address, Hero Image, etc.) are stored here.
*   **Implementation:** The admin portal uses an `upsert` logic in `/api/admin/settings`.
*   **Formatting Engine:** The `legal/page.js` component includes a custom parser that converts "Bold: Text" lines from the database into formatted headers automatically.

### 2. Manual Payment Verification Workflow
This system bypasses payment gateways to save costs:
1.  **Selection:** User picks a plan (Admission fee added if new).
2.  **Payment:** User pays via UPI and uploads a screenshot.
3.  **Cloudinary:** The screenshot is uploaded to Cloudinary using an unsigned preset.
4.  **Pending State:** A `User` record is created with `status: PENDING`.
5.  **Admin Action:** Admin reviews the screenshot in `PaymentsTab.js`.
6.  **Activation:** Upon "Approve," the system:
    - Updates status to `ACTIVE`.
    - Calculates `startDate` (now) and `endDate` (based on plan duration).
    - Generates a 6-digit `memberId` (e.g., NME-101).
    - Triggers `welcomeEmail` with login credentials.

### 3. Admin Interaction Patterns
*   **Request Confirmation:** Critical actions (deleting users, resetting passwords) use a custom `requestConfirmation` modal.
*   **Undo Pattern:** Success actions (verifying payments) use an `executeWithUndo` pattern, allowing the admin to revert a mistake within a 5-second window.

### 4. Authentication & Security
*   **NextAuth:** Configured with `strategy: 'jwt'`.
*   **Middleware:** Protected routes (`/admin/**`, `/dashboard/**`) are secured via server-side checks.
*   **Role-Based:** Admin access is restricted to users with `role: ADMIN`.

---

## 📡 API Endpoints

### Public
*   `POST /api/auth/register`: Initial user registration and payment metadata capture.
*   `POST /api/checkout`: Renewal payment submissions.

### Admin (Protected)
*   `GET /api/admin/users`: Fetch all members with filtering.
*   `POST /api/admin/verify-payment`: Approves/Rejects a payment and activates membership.
*   `PUT /api/admin/settings`: Updates global gym configuration.
*   `DELETE /api/admin/users/[id]`: Securely removes a user and their history.

---

## 🛠️ Database Schema (Prisma)
*   **User:** Core identity, roles, and membership status.
*   **Plan:** Pricing tiers (Monthly, Quarterly, etc.).
*   **Payment:** Ledger of all transactions, linked to users and Cloudinary URLs.
*   **Settings:** Global site configuration.
*   **Trainer:** Dynamic coaching profiles.

---

## ⚙️ Maintenance & Future-Proofing

### Local Setup
1.  `npm install`
2.  `npx prisma generate`
3.  `npx prisma db push` (Syncs schema with Neon)
4.  `npm run dev`

### Domain Renewal
*   Domain: **nmegym.in**
*   Registrar: [User to fill]
*   Renewal Frequency: Annual. **Critical:** If the domain expires, all API routes and authentication will fail.

### Scaling
*   **Cloudinary:** If storage hits limits, cleanup old payment screenshots (`status: VERIFIED`).
*   **Database:** The free tier of Neon is sufficient for ~5,000 members. Beyond this, upgrade to the "Autoscale" tier.

---

## 🎨 Styling Guidelines
*   **Design Token System:** All colors are defined as CSS variables at the top of `nme-gym.css`.
*   **Animations:** Uses a mix of `reveal` observers (custom JS) and CSS keyframes for cinematic transitions.
*   **Responsiveness:** Grid-based layouts with specific breakpoints at `1024px`, `768px`, and `480px`.

---
**Lead Developer Note:** The primary design goal was "Zero Operational Cost." Do not introduce paid dependencies (Stripe, Twilio, etc.) without consulting the client.
