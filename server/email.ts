import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: parseInt(process.env.SMTP_PORT || '465') === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(email: string, token: string, origin: string = 'https://whypals.com') {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP credentials not found in environment variables. Email sending skipped.');
    console.log(`Mock email to ${email}: Token is ${token}`);
    return false;
  }

  const resetLink = `${origin}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"WhyPals Support" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Whypals Password Reset',
    text: `You requested a password reset. Please click the following link to reset your password: ${resetLink} . This link will expire in 15 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your WhyPals account.</p>
        <p>Please click the button below to reset your password:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>Or copy and paste this link into your browser:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>This link will expire in 15 minutes.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
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
