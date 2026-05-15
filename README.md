# NME GYM — Technical Documentation

A premium, high-performance web platform for NME GYM. This project is built with a focus on cinematic aesthetics, robust administrative control, and automated member management.

---

## 🚀 Tech Stack
*   **Framework:** Next.js 15+ (App Router)
*   **Language:** JavaScript (ES6+)
*   **Database:** Neon PostgreSQL (Serverless)
*   **ORM:** Prisma 7.x
*   **Authentication:** NextAuth.js
*   **Media Hosting:** Cloudinary (CDN for images & payment screenshots)
*   **Email:** Nodemailer (Transaction emails)
*   **Styling:** Vanilla CSS (Global Design System in `nme-gym.css`)

---

## 📂 Project Structure
```bash
├── prisma/
│   └── schema.prisma        # Database models (User, Payment, Settings, Plan, Trainer)
├── public/                  # Static assets (logo, icons)
├── src/
│   ├── app/                 # Next.js App Router (Pages & API Routes)
│   │   ├── admin/           # Admin Portal (Tabs: Registrations, Payments, Settings)
│   │   ├── api/             # Backend API (Auth, Admin operations, Checkout)
│   │   ├── auth/            # Authentication (Login, Register, Reset Password)
│   │   ├── dashboard/       # Member Dashboard (Renewal, Plan status)
│   │   └── legal/           # Dynamic Legal Pages (Terms, Privacy, Refund)
│   ├── components/
│   │   ├── home/            # Interactive Home sections (Trainers, Contact, etc.)
│   │   ├── providers/       # Context Providers (Auth, Sessions)
│   │   └── ui/              # Reusable UI components (Modals, Inputs)
│   ├── lib/                 # Shared utilities (Database client, Mailer, Data fetching)
│   └── styles/
│       └── nme-gym.css      # Core Design System (1000+ lines of custom CSS)
```

---

## 🛠️ Key Features for Developers

### 1. Dynamic Settings System
The site uses a singleton `Settings` model in Prisma. Fields like `whatsappNumber`, `upiId`, and `termsAndConditions` are admin-editable via the Admin Portal. The public site fetches these values in real-time.

### 2. Manual Payment Verification
The system does not use a 3rd-party payment gateway to avoid transaction fees. Instead:
1.  User selects a plan and views the Admin UPI QR code.
2.  User uploads a screenshot of the payment (uploaded to Cloudinary).
3.  Admin verifies the screenshot in the portal.
4.  Upon verification, the system generates credentials and sends a "Welcome Email."

### 3. Automated Plan Expiry
Plans are tracked via `startDate` and `endDate`. The dashboard dynamically calculates remaining days and restricts access (showing a "Renew" prompt) if the plan has expired.

---

## ⚙️ Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL=         # Neon PostgreSQL connection string
NEXTAUTH_URL=         # Your production or local URL
NEXTAUTH_SECRET=      # Random string for auth encryption
CLOUDINARY_CLOUD_NAME= # Cloudinary credentials
CLOUDINARY_UPLOAD_PRESET=
EMAIL_USER=           # Gmail/SMTP credentials for Nodemailer
EMAIL_PASS=
```

---

## 💻 Local Development
1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Generate Prisma client:**
    ```bash
    npx prisma generate
    ```
3.  **Run migrations:**
    ```bash
    npx prisma db push
    ```
4.  **Start dev server:**
    ```bash
    npm run dev
    ```

---

## 🚢 Deployment
The project is optimized for **Vercel**.
*   **Database Migrations:** Ensure `npx prisma db push` is part of your build command or run manually after schema changes.
*   **Image Handling:** Ensure Cloudinary unsigned upload presets are correctly configured to match the frontend `UploadArea` logic.

---

## 📜 Maintenance Notes
*   **CSS:** Avoid adding Tailwind unless requested. The design system is highly specific and relies on the custom class names in `nme-gym.css`.
*   **Settings Tab:** Any new global configuration should be added to the `Settings` model in `schema.prisma` and integrated into the `SettingsTab.js` UI.
*   **Domain:** The domain `nmegym.in` requires annual renewal via the domain registrar.

---
**Developer Note:** This project was built for high performance and low operational costs. Stick to the "Free Tier" philosophy for database and image hosting unless the member count exceeds 5,000 active users.
