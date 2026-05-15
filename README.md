# NME GYM Management Platform

A custom-built membership and facility management system for NME GYM, built with a high-performance Next.js 16 architecture. The platform handles member registration, renewal, payment verification, and automated notification workflows.

## Technical Architecture

*   **Framework:** Next.js 16 (App Router)
*   **Database:** PostgreSQL (Neon) with Prisma 7 ORM
*   **Authentication:** NextAuth.js
*   **Media Management:** Cloudinary SDK
*   **Email Engine:** Resend API
*   **Styling:** Vanilla CSS3 with a focus on immersive dark-themed UI and mobile responsiveness

## Project Structure

```text
/
├── prisma/
│   ├── schema.prisma         # Database models & relationships
│   └── seed.js               # Initial database seeding script
├── public/
│   └── newlogo.png           # Brand identity assets
└── src/
    ├── app/                  # Next.js App Router
    │   ├── admin/            # Admin Panel & Verification logic
    │   │   └── tabs/         # Specialized management modules
    │   ├── api/              # Secure Backend API Endpoints
    │   │   ├── admin/        # Admin-only operations
    │   │   ├── auth/         # Authentication & Password flows
    │   │   └── checkout/     # Payment & Enrollment processing
    │   ├── auth/             # Login, Register & Recovery pages
    │   └── dashboard/        # Member-exclusive dashboard interface
    ├── components/           # UI Component Library
    │   ├── home/             # Homepage-specific sections (Trainers, Plans, etc.)
    │   ├── layout/           # Shared global elements (Navbar, Footer)
    │   └── ui/               # Reusable primitives (Modals, Toasts, Loaders)
    ├── lib/                  # Core Utilities & Shared Logic
    │   ├── mail.js           # Resend Email integration
    │   ├── prisma.js         # Database client singleton
    │   └── data.js           # Global data fetching helpers
    └── styles/               # Design System
        └── nme-gym.css       # Master stylesheet & Design tokens
```

## Core Functionalities

### Member Management
*   **Onboarding:** New members can register, select plans, and upload payment proof.
*   **Dashboard:** Personalized member area showing membership status, expiry countdowns, and payment history.
*   **Renewals:** Existing members can renew their plans directly from their dashboard.

### Admin Operations
*   **Payment Verification:** A dedicated dashboard for administrators to review payment screenshots and approve or reject membership requests.
*   **Credential Generation:** Automated generation of Member IDs and temporary passwords upon registration approval.
*   **Trainer Management:** Full administrative control over trainer profiles and visibility on the frontend.

### Automated Workflows
*   **Email Notifications:** Automated welcome emails (with login credentials) and payment status updates sent via Resend.
*   **WhatsApp Integration:** A fallback notification system allowing administrators to send welcome details and payment confirmations directly to a member's WhatsApp.
*   **User Notifications:** Real-time feedback for members after submitting payments, including a direct link to notify the admin via WhatsApp.

## Development Setup

### Prerequisites
*   Node.js (LTS version)
*   PostgreSQL database (Neon.tech recommended)
*   Cloudinary account for media storage
*   Resend API key for email delivery

### Installation
1. Clone the repository
2. Install dependencies:
    ```bash
    npm install
    ```
3. Configure your environment variables (see `.env.example`)
4. Synchronize the database schema:
    ```bash
    npx prisma db push
    ```
5. Start the development server:
    ```bash
    npm run dev
    ```

## Environment Variables
The following keys are required in your `.env` file:
*   `DATABASE_URL`: PostgreSQL connection string
*   `DIRECT_URL`: Direct connection string for Prisma migrations
*   `NEXTAUTH_SECRET`: Secret key for session encryption
*   `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
*   `CLOUDINARY_API_KEY` & `CLOUDINARY_API_SECRET`: Cloudinary credentials
*   `RESEND_API_KEY`: API key for email notifications

## Deployment
The platform is optimized for deployment on Vercel. Ensure that all environment variables are correctly configured in the Vercel dashboard and the PostgreSQL database is accessible from the production environment.
