// src/app/auth/register/success/page.js
import Link from "next/link";

export default function JoinSuccessPage() {
  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: "center", padding: 60 }}>
        <div style={{ fontSize: 60, marginBottom: 20 }}>🎉</div>
        <h1 className="auth-title">Request Submitted!</h1>
        <p className="auth-subtitle">
          Your payment screenshot has been sent for verification.
        </p>
        
        <div style={{ background: "#111", border: "1px solid #222", padding: 25, borderRadius: 12, margin: "30px 0", textAlign: "left" }}>
          <h3 style={{ fontSize: 16, marginBottom: 10, color: "white" }}>What happens next?</h3>
          <ol style={{ fontSize: 14, color: "#888", paddingLeft: 20, lineHeight: 1.8 }}>
            <li>Admin will manually verify your payment screenshot.</li>
            <li>Once verified, an account will be created for you.</li>
            <li>You will receive your <strong>Member ID</strong> and <strong>Temporary Password</strong> via email.</li>
            <li>Check your inbox (and spam folder) within the next 12-24 hours.</li>
          </ol>
        </div>

        <Link href="/" className="btn-primary" style={{ display: "inline-block", textDecoration: "none" }}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
