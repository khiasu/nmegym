// src/lib/mail.js — Email utility using Resend
import { Resend } from 'resend';
import prisma from '@/lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send welcome email to new member with login credentials
 */
export async function sendWelcomeEmail(email, name, memberId, password) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'NME GYM <onboarding@resend.dev>',
      to: email,
      subject: 'Welcome to NME GYM — Your Account is Active!',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: auto; padding: 0; background: #0a0a0a; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #e8001d, #b30017); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 32px; letter-spacing: 3px;">NME GYM</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px; letter-spacing: 2px;">MEMBERSHIP CONFIRMED</p>
          </div>
          
          <div style="padding: 30px;">
            <h2 style="color: #e8001d; margin: 0 0 15px;">Welcome to the Movement, ${name}!</h2>
            <p style="color: #ccc; line-height: 1.6;">Your payment has been verified and your NME GYM membership is now <strong style="color: #00ff64;">ACTIVE</strong>.</p>
            
            <div style="background: #1a1a1a; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #e8001d;">
              <p style="margin: 0; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Your Login Credentials</p>
              <div style="margin-top: 15px;">
                <p style="margin: 8px 0; color: #fff;"><strong>Member ID:</strong> <span style="color: #e8001d; font-family: monospace; font-size: 16px;">${memberId}</span></p>
                <p style="margin: 8px 0; color: #fff;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 8px 0; color: #fff;"><strong>Initial Password:</strong> <span style="font-family: monospace; background: #333; padding: 3px 8px; border-radius: 4px; color: #ffc800;">${password}</span></p>
              </div>
            </div>

            <p style="color: #888; font-size: 14px;">Please log in to your dashboard to manage your plan and change your password.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/auth/login" style="display: inline-block; background: #e8001d; color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; letter-spacing: 1px; margin-bottom: 10px;">LOGIN TO DASHBOARD →</a>
              <br/>
              <a href="${process.env.NEXTAUTH_URL}/auth/forgot-password" style="display: inline-block; color: #888; text-decoration: underline; font-size: 12px; margin-top: 10px;">Or Reset Your Password Here</a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #222; margin: 25px 0;" />
            <p style="font-size: 12px; color: #666; text-align: center;">
              If you have any questions, contact us on WhatsApp at +91 98637 65861
            </p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
}

/**
 * Send email notification to admin when a new payment is pending verification
 */
export async function sendAdminNotificationEmail({ memberName, email, phone, planName, totalAmount, isFirstTimer, paymentId }) {
  let adminEmail = process.env.ADMIN_EMAIL || 'nmegym.india@gmail.com';
  try {
    const settings = await prisma.settings.findFirst();
    if (settings?.email) {
      adminEmail = settings.email;
    }
  } catch (err) {
    console.error("Failed to fetch admin email from settings, using fallback:", err);
  }
  const subjectPrefix = isFirstTimer ? '🆕 New Registration' : '🔄 Payment Verification';
  const headerTitle = isFirstTimer ? '⚡ NEW REGISTRATION REQUEST' : '⚡ RENEWAL PAYMENT REQUEST';
  const headerSub = isFirstTimer ? 'A new member is waiting for approval' : 'An existing member payment requires verification';
  const ctaText = isFirstTimer ? 'REVIEW IN REGISTRATIONS →' : 'VERIFY IN PAYMENTS →';
  
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'NME GYM <onboarding@resend.dev>',
      to: adminEmail,
      subject: `${subjectPrefix} — ${memberName}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: auto; padding: 0; background: #0a0a0a; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, ${isFirstTimer ? '#00698f, #004d69' : '#1a1a2e, #16213e'}); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: 2px;">${headerTitle}</h1>
            <p style="color: rgba(255,255,255,0.6); margin: 8px 0 0; font-size: 13px;">${headerSub}</p>
          </div>
          
          <div style="padding: 30px;">
            <div style="background: #1a1a1a; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
              <table style="width: 100%; color: #ccc; font-size: 14px;">
                <tr><td style="padding: 8px 0; color: #888;">Member</td><td style="padding: 8px 0; font-weight: bold; color: white;">${memberName}</td></tr>
                <tr><td style="padding: 8px 0; color: #888;">Email</td><td style="padding: 8px 0;">${email}</td></tr>
                <tr><td style="padding: 8px 0; color: #888;">Phone</td><td style="padding: 8px 0;">${phone || 'Not provided'}</td></tr>
                <tr><td style="padding: 8px 0; color: #888;">Plan</td><td style="padding: 8px 0; font-weight: bold; color: #e8001d;">${planName}</td></tr>
                <tr><td style="padding: 8px 0; color: #888;">Amount</td><td style="padding: 8px 0; font-weight: bold; font-size: 18px; color: #00ff64;">₹${totalAmount}</td></tr>
                <tr><td style="padding: 8px 0; color: #888;">Type</td><td style="padding: 8px 0;">${isFirstTimer ? '🆕 First-Time Registration' : '🔄 Renewal / Monthly'}</td></tr>
              </table>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${process.env.NEXTAUTH_URL}/admin" style="display: inline-block; background: #e8001d; color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; letter-spacing: 1px;">${ctaText}</a>
            </div>
            
            <p style="font-size: 12px; color: #666; text-align: center;">
              Payment ID: ${paymentId}
            </p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send admin notification email:", error);
  }
}

/**
 * Send pending notification email to user when they submit a payment
 */
export async function sendUserPendingNotificationEmail(email, name, planName) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'NME GYM <onboarding@resend.dev>',
      to: email,
      subject: 'Registration Received — Waiting for Admin Confirmation',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: auto; padding: 0; background: #0a0a0a; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: 2px;">REGISTRATION RECEIVED</h1>
            <p style="color: rgba(255,255,255,0.6); margin: 8px 0 0; font-size: 13px;">We are reviewing your payment</p>
          </div>
          
          <div style="padding: 30px;">
            <h2 style="color: #e8001d; margin: 0 0 15px;">Hi ${name},</h2>
            <p style="color: #ccc; line-height: 1.6;">We have successfully received your payment submission for the <strong>${planName}</strong> plan.</p>
            
            <div style="background: #1a1a1a; padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #ffc800;">
              <p style="color: #ccc; font-size: 14px; margin: 0;">Our team will verify your payment shortly. Once verified, you will receive another email containing your Member ID and login credentials.</p>
            </div>
            
            <p style="font-size: 12px; color: #666; text-align: center; margin-top: 30px;">
              If you have any questions, contact us on WhatsApp at +91 98637 65861
            </p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send user pending notification email:", error);
  }
}

/**
 * Send confirmation email to existing member after payment verification
 */
export async function sendPaymentConfirmationEmail(email, name, planName, amount, memberId) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'NME GYM <onboarding@resend.dev>',
      to: email,
      subject: 'Payment Verified — NME GYM Membership Renewed!',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: auto; padding: 0; background: #0a0a0a; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #00a86b, #007a4d); padding: 35px 30px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">✓</div>
            <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: 2px;">PAYMENT VERIFIED</h1>
          </div>
          
          <div style="padding: 30px;">
            <p style="color: #ccc; line-height: 1.6;">Hi <strong style="color: white;">${name}</strong>, your payment has been successfully verified!</p>
            
            <div style="background: #1a1a1a; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <p style="margin: 5px 0; color: #888;">Plan: <strong style="color: white;">${planName}</strong></p>
              <p style="margin: 5px 0; color: #888;">Amount Paid: <strong style="color: #00ff64;">₹${amount}</strong></p>
              <p style="margin: 5px 0; color: #888;">Member ID: <strong style="color: #e8001d;">${memberId}</strong></p>
              <p style="margin: 5px 0; color: #888;">Status: <strong style="color: #00ff64;">ACTIVE</strong></p>
            </div>

            <div style="text-align: center; margin: 25px 0;">
              <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; background: #e8001d; color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: bold;">VIEW DASHBOARD →</a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #222; margin: 25px 0;" />
            <p style="font-size: 12px; color: #666; text-align: center;">
              Questions? Contact us on WhatsApp at +91 98637 65861
            </p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send payment confirmation email:", error);
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email, token) {
  const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
  
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'NME GYM <onboarding@resend.dev>',
      to: email,
      subject: 'Reset Your NME GYM Password',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: auto; padding: 0; background: #0a0a0a; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Password Reset</h1>
          </div>
          <div style="padding: 30px;">
            <p style="color: #ccc;">You requested to reset your password. Click the button below to set a new one:</p>
            <div style="text-align: center; margin: 25px 0;">
              <a href="${resetLink}" style="display: inline-block; background: #e8001d; color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: bold;">RESET PASSWORD</a>
            </div>
            <p style="color: #888; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send reset email:", error);
  }
}

/**
 * Send membership expiry reminder email
 */
export async function sendExpiryReminderEmail(email, name, daysLeft, endDate) {
  const expiryDate = new Date(endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const urgencyColor = daysLeft === 1 ? '#e8001d' : '#ffc800';
  
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'NME GYM <onboarding@resend.dev>',
      to: email,
      subject: `Action Required: Membership Expires in ${daysLeft} Day${daysLeft > 1 ? 's' : ''}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: auto; padding: 0; background: #0a0a0a; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, ${urgencyColor}, #111); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; text-transform: uppercase;">Membership Expiring Soon</h1>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: white; margin: 0 0 15px;">Hi ${name || 'Member'},</h2>
            <p style="color: #ccc; line-height: 1.6;">
              This is a quick reminder that your NME GYM membership is scheduled to expire in <strong style="color: ${urgencyColor};">${daysLeft} day${daysLeft > 1 ? 's' : ''}</strong> on <strong>${expiryDate}</strong>.
            </p>
            <p style="color: #ccc; line-height: 1.6;">
              Please renew your membership to maintain uninterrupted access to the gym. You can log in to your dashboard to complete the renewal process.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/auth/login" style="display: inline-block; background: #e8001d; color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: bold;">RENEW MEMBERSHIP</a>
            </div>
            <p style="color: #888; font-size: 13px;">If you've already renewed, please ignore this email while we verify your payment.</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send expiry reminder email:", error);
  }
}

