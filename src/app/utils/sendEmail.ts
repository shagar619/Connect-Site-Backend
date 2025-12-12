
import nodemailer from "nodemailer";
import { envVars } from "../config/env";

export const emailSender = async (email: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: envVars.EMAIL_SENDER.SMTP_USER,
      pass: envVars.EMAIL_SENDER.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const info = await transporter.sendMail({
    from: `"ProConnect" <${envVars.EMAIL_SENDER.SMTP_FROM}>`,
    to: email,
    subject: "Reset Password Link",
    html,
  });

  return info;
};
