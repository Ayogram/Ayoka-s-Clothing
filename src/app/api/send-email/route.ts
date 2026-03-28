import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { to, subject, html } = await req.json();

    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your_resend_api_key') {
      console.warn("Resend API key is missing. Email skipped, but logic succeeded.")
      return NextResponse.json({ message: 'Email skipped: No API Key' })
    }

    const { data, error } = await resend.emails.send({
      from: 'Ayoka Concierge <ajumobiayomipo@gmail.com>',
      to: to || 'ajumobiayomipo@gmail.com',
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("Resend delivery failed:", error)
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("API send-email crash:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
