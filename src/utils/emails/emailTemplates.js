export const emailTemplates = {
  /**
   * Contact Form – Admin Notification
   */
  CONTACT_MESSAGE_ADMIN: (data) => ({
    subject: `New Contact Message from ${data.firstName} ${data.lastName}`,
    text: `
You have received a new contact message.

Name: ${data.firstName} ${data.lastName}
Email: ${data.emailAddress}

Message:
${data.message}

Submitted on: ${new Date(data.createdAt).toLocaleString()}
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <!-- Logo -->
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${data.logoUrl || ""}" alt="${
      data.appName
    } Logo" style="height: 60px; object-fit: contain;" />
        </div>

        <h2 style="color: #9f6a2b; text-align: center; margin-bottom: 20px;">New Contact Message</h2>

        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
          You have received a new message from the website contact form.
        </p>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 10px; font-weight: bold; width: 140px; color: #9f6a2b;">Name:</td>
            <td style="padding: 10px;">${data.firstName} ${data.lastName}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; color: #9f6a2b;">Email:</td>
            <td style="padding: 10px;">
              <a href="mailto:${
                data.emailAddress
              }" style="color: #9f6a2b; text-decoration: none;">
                ${data.emailAddress}
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; vertical-align: top; color: #9f6a2b;">Message:</td>
            <td style="padding: 10px; white-space: pre-line;">${
              data.message
            }</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; color: #9f6a2b;">Submitted At:</td>
            <td style="padding: 10px;">${new Date(
              data.createdAt
            ).toLocaleString()}</td>
          </tr>
        </table>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

        <p style="font-size: 12px; color: #6b7280; text-align: center;">
          © ${new Date().getFullYear()} ${data.appName}. All rights reserved.
        </p>
      </div>
    `,
  }),
};
