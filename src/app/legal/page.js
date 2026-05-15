// src/app/legal/page.js
import Link from "next/link";
import { getSettings } from "@/lib/data";

export default async function LegalPage() {
  const settings = await getSettings();

  const defaultTerms = `Health Warranty: You certify that you are in good physical health and have no medical conditions that would prevent safe exercise.
Conduct: Members must follow staff instructions and maintain respectful behavior towards others at all times.
Liability: NME GYM is not liable for personal injuries or lost/stolen items on the premises.
Termination: We reserve the right to cancel memberships for violation of safety or conduct rules without refund.`;

  const defaultPrivacy = `Collection: We collect your name, phone, email, and payment screenshots for verification and account management.
Usage: Data is used strictly for issuing Member IDs and sending status notifications via Email or WhatsApp.
Storage: Payment proofs are stored securely on Cloudinary. Passwords are encrypted using industry-standard hashing.
Sharing: We never sell your personal information to third-party marketing entities.`;

  const defaultRefund = `No Refunds: All payments for membership plans and admission fees are strictly non-refundable once submitted.
Non-Transferable: Memberships are tied to the registered individual and cannot be transferred to another person.
Freezing: Temporary membership freezing is only permitted for medical reasons with a valid doctor's certificate, subject to management approval.`;

  const terms = settings?.termsAndConditions || defaultTerms;
  const privacy = settings?.privacyPolicy || defaultPrivacy;
  const refund = settings?.refundPolicy || defaultRefund;

  const renderText = (text) => {
    return text.split('\n').map((line, i) => (
      <p key={i} style={{ marginBottom: '15px' }}>
        {line.includes(':') ? (
          <>
            <strong>{line.split(':')[0]}:</strong>
            {line.split(':').slice(1).join(':')}
          </>
        ) : line}
      </p>
    ));
  };

  return (
    <div style={{ 
      backgroundColor: '#000', 
      minHeight: '100vh', 
      color: 'white',
      padding: '100px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Decor */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(232,0,29,0.08) 0%, transparent 70%)',
        zIndex: 0
      }} />

      <div className="max-w" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: '60px' }}>
          <div className="section-label"><span>LEGAL</span></div>
          <h1 style={{ 
            fontFamily: "'Bebas Neue', sans-serif", 
            fontSize: 'clamp(3rem, 8vw, 5rem)', 
            lineHeight: '0.9',
            letterSpacing: '2px',
            margin: '20px 0'
          }}>
            TERMS & <br />
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>POLICIES.</span>
          </h1>
          <p style={{ 
            color: 'rgba(255,255,255,0.5)', 
            maxWidth: '600px', 
            fontSize: '15px', 
            lineHeight: '1.6' 
          }}>
            Official documentation regarding membership terms, data privacy, and refund policies for NME GYM.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '30px' 
        }}>
          {/* TERMS */}
          <div style={{ 
            background: 'rgba(255,255,255,0.02)', 
            border: '1px solid rgba(255,255,255,0.05)', 
            padding: '40px',
            borderRadius: '8px'
          }}>
            <h2 style={{ 
              fontFamily: "'Bebas Neue', sans-serif", 
              fontSize: '22px', 
              letterSpacing: '1px',
              color: 'var(--red)',
              marginBottom: '20px'
            }}>TERMS & CONDITIONS</h2>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: '1.8' }}>
              {renderText(terms)}
            </div>
          </div>

          {/* PRIVACY */}
          <div style={{ 
            background: 'rgba(255,255,255,0.02)', 
            border: '1px solid rgba(255,255,255,0.05)', 
            padding: '40px',
            borderRadius: '8px'
          }}>
            <h2 style={{ 
              fontFamily: "'Bebas Neue', sans-serif", 
              fontSize: '22px', 
              letterSpacing: '1px',
              color: 'var(--red)',
              marginBottom: '20px'
            }}>PRIVACY POLICY</h2>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: '1.8' }}>
              {renderText(privacy)}
            </div>
          </div>

          {/* REFUNDS */}
          <div style={{ 
            background: 'rgba(255,255,255,0.02)', 
            border: '1px solid rgba(255,255,255,0.05)', 
            padding: '40px',
            borderRadius: '8px'
          }}>
            <h2 style={{ 
              fontFamily: "'Bebas Neue', sans-serif", 
              fontSize: '22px', 
              letterSpacing: '1px',
              color: 'var(--red)',
              marginBottom: '20px'
            }}>REFUND POLICY</h2>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: '1.8' }}>
              {renderText(refund)}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '80px', textAlign: 'center' }}>
          <Link href="/" style={{ 
            color: 'white', 
            textDecoration: 'none', 
            borderBottom: '1px solid rgba(255,255,255,0.2)',
            paddingBottom: '5px',
            fontSize: '13px',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
