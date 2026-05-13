// src/app/auth/verify/page.js — Check Your Email page

export const metadata = {
  title: "Check Your Email — NME GYM",
  description: "A magic sign-in link has been sent to your email.",
};

export default function VerifyPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/newlogo.png" alt="NME GYM" />
        </div>

        <div className="auth-verify-icon">📬</div>
        <h1 className="auth-title">Check Your Email</h1>
        <p className="auth-subtitle">
          A magic sign-in link has been sent. Click the link in the email to
          sign in. The link expires in <strong>10 minutes</strong>.
        </p>

        <p className="auth-note">
          Didn't receive it? Check your spam folder or{" "}
          <a href="/auth/login">try again</a>.
        </p>
      </div>
    </div>
  );
}
