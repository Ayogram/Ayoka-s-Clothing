import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { to, subject, html } = await req.json();

    // Defaults to the business owner if no ENV variable explicitly defines it
    const businessEmail = process.env.SMTP_EMAIL || 'ajumobiayomipo@gmail.com';
    const appPassword = process.env.GMAIL_APP_PASSWORD;

    if (!appPassword || appPassword === 'your_gmail_app_password') {
      console.warn("GMAIL_APP_PASSWORD is missing in .env.local! Email skipped, but logic succeeded.")
      return NextResponse.json({ message: 'Email skipped: No Gmail App Password configured' })
    }

    // Secure SMTP connection directly to Google servers bypassing third party blockers
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: businessEmail,
        pass: appPassword,
      },
    });

    const info = await transporter.sendMail({
      from: `"Ayoka Concierge" <${businessEmail}>`,
      to: to || businessEmail, // Fallback to notifying self if 'to' is undefined.
      subject: subject,
      html: html,
    });

    return NextResponse.json({ data: info.messageId, success: true });
  } catch (error: any) {
    console.error("Nodemailer send-email crash:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
