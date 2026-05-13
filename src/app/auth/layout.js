// src/app/auth/layout.js — Shared layout for all auth pages

export default function AuthLayout({ children }) {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #0a0a0a;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          min-height: 100vh;
        }

        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          background:
            radial-gradient(ellipse 80% 60% at 50% -20%, rgba(220,38,38,0.15), transparent),
            #0a0a0a;
        }

        .auth-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 1.25rem;
          padding: 2.5rem 2rem;
          width: 100%;
          max-width: 420px;
          backdrop-filter: blur(20px);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          box-shadow:
            0 0 0 1px rgba(220,38,38,0.1),
            0 24px 64px rgba(0,0,0,0.5);
        }

        .auth-logo img {
          height: 56px;
          width: auto;
          filter: brightness(0) invert(1);
        }

        .auth-verify-icon,
        .auth-error-icon {
          font-size: 2.5rem;
          line-height: 1;
        }

        .auth-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #fff;
          text-align: center;
          letter-spacing: -0.02em;
        }

        .auth-subtitle {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.55);
          text-align: center;
          line-height: 1.6;
        }

        .auth-subtitle strong {
          color: rgba(255,255,255,0.8);
        }

        .auth-error {
          background: rgba(220,38,38,0.12);
          border: 1px solid rgba(220,38,38,0.3);
          color: #fca5a5;
          font-size: 0.85rem;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          width: 100%;
          text-align: center;
        }

        .auth-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .auth-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .auth-field label {
          font-size: 0.8rem;
          font-weight: 600;
          color: rgba(255,255,255,0.6);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .auth-field input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 0.6rem;
          padding: 0.75rem 1rem;
          color: #fff;
          font-size: 0.95rem;
          width: 100%;
          outline: none;
          transition: border-color 0.2s;
        }

        .auth-field input:focus {
          border-color: rgba(220,38,38,0.6);
          background: rgba(255,255,255,0.07);
        }

        .auth-field input::placeholder {
          color: rgba(255,255,255,0.25);
        }

        .auth-btn {
          display: block;
          width: 100%;
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          color: #fff;
          border: none;
          border-radius: 0.6rem;
          padding: 0.85rem 1rem;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.02em;
        }

        .auth-btn:hover {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(220,38,38,0.3);
        }

        .auth-btn:active {
          transform: translateY(0);
        }

        .auth-note {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.35);
          text-align: center;
        }

        .auth-note a {
          color: #dc2626;
          text-decoration: none;
          font-weight: 600;
        }

        .auth-note a:hover {
          text-decoration: underline;
        }
      `}</style>
      {children}
    </>
  );
}
