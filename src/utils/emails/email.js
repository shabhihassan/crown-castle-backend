import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { emailTemplates } from "./emailTemplates.js";

dotenv.config();
// Email configuration
const emailConfig = {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
};

const transporter = nodemailer.createTransport(emailConfig);

// Verify connection
transporter.verify((error) => {
  if (error) {
    console.error("Email server connection error:", error);
  } else {
    console.log("Email server connected successfully");
  }
});

/**
 * Send email using specified template
 * @param {string|string[]} to - Recipient email(s) (string or array)
 * @param {string} templateType - Template type from enum
 * @param {object} data - Data for template
 * @returns {Promise<void>}
 */
export const sendEmail = async (to, templateType, data) => {
  try {
    if (!emailTemplates[templateType]) {
      throw new Error(`Email template ${templateType} not found`);
    }

    const template = emailTemplates[templateType]({
      appName: process.env.APP_NAME,
      ...data,
    });

    // Normalize recipients into an array
    const recipients = Array.isArray(to) ? to : [to];

    // Send email to each recipient individually
    for (const recipient of recipients) {
      const mailOptions = {
        from: `"${process.env.APP_NAME || "Our App"}" 
        <${"contact@crowncastleproperties.com"}>`,
        to: recipient,
        subject: template.subject,
        text: template.text,
        html: template.html,
      };
      console.log(`Email initiated to: ${recipient}`);
      await transporter.sendMail(mailOptions);
      console.log(`Email sent to: ${recipient}`);
    }
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
