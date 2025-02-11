// src/services/email.service.ts
import nodemailer from "nodemailer";
import { EmailTemplate } from "../types/auth.types";
import { logger } from "../utils/logger";

export class EmailService {
  private transporter!: nodemailer.Transporter;

  constructor() {
    if (process.env.NODE_ENV === "development") {
      // Use ethereal email for development
      this.createTestAccount();
    } else {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          // Do not fail on invalid certificates
          rejectUnauthorized: false,
        },
      });
    }
  }

  private async createTestAccount() {
    // Create test account for development
    const testAccount = await nodemailer.createTestAccount();

    this.transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  async sendEmail(emailData: EmailTemplate): Promise<void> {
    try {
      if (
        process.env.NODE_ENV === "development" &&
        process.env.EMAIL_VERIFICATION_REQUIRED !== "true"
      ) {
        logger.info("Email sending skipped in development mode", {
          to: emailData.to,
          subject: emailData.subject,
        });
        return;
      }

      const info = await this.transporter.sendMail({
        from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
      });

      logger.info(`Email sent: ${info.messageId}`, {
        to: emailData.to,
        subject: emailData.subject,
      });

      if (process.env.NODE_ENV === "development") {
        // Log ethereal URL for preview in development
        logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error) {
      logger.error("Error sending email:", error);
      throw new Error("Failed to send email");
    }
  }
}
