import nodemailer from "nodemailer";

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
<<<<<<< HEAD
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
=======
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: parseInt(process.env.SMTP_PORT || '465') === 465,
>>>>>>> 8ef9a32f7f6039c648c166a9ea4ee85d183819da
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendPasswordResetEmail(email: string, token: string, origin: string) {
  const resetLink = `${origin}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"WhyPals" <noreply@whypals.com>',
    to: email,
    subject: "Password Reset Request",
    html: `
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false;
  }
}

export async function sendParentVerificationEmail(
  parentEmail: string,
  code: string,
  token: string,
  origin: string = 'https://whypals.com',
) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP credentials not found in environment variables. Email sending skipped.');
    console.log(`Mock parent verification email to ${parentEmail}: code ${code}, token ${token}`);
    return false;
  }

  const verifyLink = `${origin}/verify-parent?token=${token}`;

  const mailOptions = {
    from: `"WhyPals Support" <${process.env.SMTP_USER}>`,
    replyTo: "admin@whypals.com",
    to: parentEmail,
    subject: 'WhyPals Parent or Guardian Email Verification',
    text: [
      'Your child requested to create a WhyPals learning account.',
      '',
      `To approve this account, either:`,
      `1. Click this link: ${verifyLink}`,
      `2. Or go to ${origin}/verify-parent and enter this code: ${code}`,
      '',
      'If you did not request this, you can ignore this email and no account will be created.',
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Parent or Guardian Verification</h2>
        <p>A child has requested to create a WhyPals learning account using your email address as the parent or legal guardian.</p>
        <p>To approve this account, you can either click the button below or enter the verification code on the WhyPals website.</p>
        <p style="margin: 16px 0;">
          <a href="${verifyLink}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">
            Approve Account
          </a>
        </p>
        <p>If you prefer to enter a code, use this one-time code:</p>
        <p style="font-size: 20px; font-weight: bold; letter-spacing: 4px;">${code}</p>
        <p>Enter it at <a href="${origin}/verify-parent">${origin}/verify-parent</a>.</p>
        <p>If you did not request this, you can safely ignore this email and no account will be created.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Parent verification email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending parent verification email:', error);
    return false;
  }
}
