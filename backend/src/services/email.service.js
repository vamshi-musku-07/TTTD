const nodemailer = require('nodemailer');
const { smtp, clientUrl, isDev } = require('../config/env');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (smtp.host && smtp.user && smtp.pass) {
    transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: { user: smtp.user, pass: smtp.pass },
    });
  }

  return transporter;
}

async function sendEmail({ to, subject, html, text }) {
  const mail = { from: smtp.from, to, subject, html, text };
  const transport = getTransporter();

  if (!transport) {
    if (isDev) {
      console.log('\n[email:dev] SMTP not configured — email logged below:');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(text || html);
      console.log('');
      return { messageId: 'dev-mode' };
    }
    throw new Error('Email service is not configured');
  }

  return transport.sendMail(mail);
}

async function sendVerificationEmail(user, token) {
  const verifyUrl = `${clientUrl}/verify-email?token=${token}`;

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 520px; margin: 0 auto; background: #0a0a0a; color: #f5f5f5; padding: 32px; border-radius: 12px; border: 1px solid #dc2626;">
      <h1 style="color: #ef4444; margin: 0 0 16px;">Verify your email</h1>
      <p>Hi ${user.firstName}, welcome to TTTD. Confirm your email to activate your account.</p>
      <a href="${verifyUrl}" style="display: inline-block; margin: 24px 0; padding: 12px 24px; background: #dc2626; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">Verify email</a>
      <p style="color: #a3a3a3; font-size: 14px;">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
    </div>
  `;

  const text = `Verify your TTTD account: ${verifyUrl}`;

  return sendEmail({
    to: user.email,
    subject: 'Verify your TTTD account',
    html,
    text,
  });
}

module.exports = { sendEmail, sendVerificationEmail };
