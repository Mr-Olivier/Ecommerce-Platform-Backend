// src/utils/email.templates.ts
interface EmailData {
  name: string;
  link?: string;
  otp?: string;
  device?: string;
  location?: string;
  timestamp?: string;
}

export const emailTemplates = {
  verifyEmail: (data: EmailData) => ({
    subject: "Verify Your Email - E-commerce Platform",
    html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px; background: #f8fafc; border-radius: 5px; margin-top: 20px; }
            .button { background: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Our Platform!</h1>
            </div>
            <div class="content">
              <h2>Hello ${data.name},</h2>
              <p>Thank you for registering with us. Please verify your email address to get started.</p>
              <div style="text-align: center;">
                <a href="${data.link}" class="button">Verify Email Address</a>
              </div>
              <p>This link will expire in 24 hours.</p>
              <p>If you didn't create an account, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Your E-commerce Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
  }),

  resetPassword: (data: EmailData) => ({
    subject: "Reset Your Password - E-commerce Platform",
    html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px; background: #f8fafc; border-radius: 5px; margin-top: 20px; }
            .button { background: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello ${data.name},</h2>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <div style="text-align: center;">
                <a href="${data.link}" class="button">Reset Password</a>
              </div>
              <p>This link will expire in 1 hour.</p>
              <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Your E-commerce Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
  }),

  loginAlert: (data: EmailData) => ({
    subject: "New Login Detected - E-commerce Platform",
    html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px; background: #f8fafc; border-radius: 5px; margin-top: 20px; }
            .alert-box { background: #fef2f2; border: 1px solid #fee2e2; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .button { background: #dc2626; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Login Alert</h1>
            </div>
            <div class="content">
              <h2>Hello ${data.name},</h2>
              <p>We detected a new login to your account from:</p>
              <div class="alert-box">
                <p><strong>Device:</strong> ${data.device}</p>
                <p><strong>Location:</strong> ${data.location}</p>
                <p><strong>Time:</strong> ${data.timestamp}</p>
              </div>
              <p>If this wasn't you, secure your account immediately:</p>
              <div style="text-align: center;">
                <a href="${data.link}" class="button">Secure My Account</a>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Your E-commerce Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
  }),

  mfaCode: (data: EmailData) => ({
    subject: "Your One-Time Password (OTP) - E-commerce Platform",
    html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px; background: #f8fafc; border-radius: 5px; margin-top: 20px; }
            .otp-box { background: #f1f5f9; padding: 20px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your One-Time Password</h1>
            </div>
            <div class="content">
              <h2>Hello ${data.name},</h2>
              <p>Here is your one-time password (OTP) for login verification:</p>
              <div class="otp-box">
                <strong>${data.otp}</strong>
              </div>
              <p>This code will expire in 5 minutes.</p>
              <p><strong>Important:</strong> Never share this code with anyone.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Your E-commerce Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
  }),
};
