import nodemailer from 'nodemailer';
import { getAllSettings } from './settings';

export interface SendMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
}

export async function sendEmail(options: SendMailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const settings = await getAllSettings();

    const host = settings.smtp_host || 'smtp.gmail.com';
    const port = Number(settings.smtp_port) || 587;
    // Port 465 uses direct SSL (secure: true). Port 587 uses STARTTLS (secure: false, requireTLS: true).
    const secure = port === 465;
    const requireTLS = port === 587 || settings.smtp_secure === 'tls';
    const user = settings.smtp_user?.trim();
    const pass = settings.smtp_pass?.trim();
    const fromName = settings.smtp_from_name || 'Moga Carpet & Flooring';
    const fromEmail = settings.smtp_from_email || user || 'info@mogacarpet.ca';

    if (!user || !pass) {
      console.warn('Google SMTP is not configured in Admin Settings. Email skipped for:', options.subject);
      return {
        success: false,
        error: 'Google SMTP credentials are not configured in Admin Settings. Please set your Gmail address and 16-character App Password.',
      };
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      requireTLS,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2',
      },
    });

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: options.to,
      replyTo: options.replyTo,
      subject: options.subject,
      text: options.text || options.subject,
      html: options.html || `<p>${options.text || options.subject}</p>`,
    });

    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error('SMTP Mail error:', err);
    return { success: false, error: err.message || 'Failed to send email via SMTP' };
  }
}
