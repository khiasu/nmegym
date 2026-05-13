// src/lib/mail.js — Email utility using Resend
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email, name, memberId, password) {
  try {
    await resend.emails.send({
      from: 'NME GYM <onboarding@resend.dev>',
      to: email,
      subject: 'Welcome to NME GYM — Your Account is Active!',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #e8001d;">Welcome to the Movement, ${name}!</h2>
          <p>Your payment has been verified and your NME GYM membership is now <strong>ACTIVE</strong>.</p>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Member ID:</strong> ${memberId}</p>
            <p style="margin: 10px 0 0 0;"><strong>Initial Password:</strong> <span style="font-family: monospace; background: #eee; padding: 2px 5px; border-radius: 4px;">${password}</span></p>
          </div>

          <p>Please log in to your dashboard to manage your plan and change your password.</p>
          
          <a href="${process.env.NEXTAUTH_URL}/auth/login" style="display: inline-block; background: #e8001d; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Dashboard →</a>
          
          <p style="margin-top: 30px; font-size: 12px; color: #888;">
            If you have any questions, reply to this email or contact us on WhatsApp at +91 98637 65861.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
}

export async function sendPasswordResetEmail(email, token) {
  const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
  
  try {
    await resend.emails.send({
      from: 'NME GYM <onboarding@resend.dev>',
      to: email,
      subject: 'Reset Your NME GYM Password',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Click the button below to set a new one:</p>
          <a href="${resetLink}" style="display: inline-block; background: #e8001d; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send reset email:", error);
  }
}
