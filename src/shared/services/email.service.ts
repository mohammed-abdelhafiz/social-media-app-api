import transporter from "@/shared/config/nodemailer.config";

const clientUrl = process.env.CLIENT_URL;

export async function sendResetPasswordEmail(to: string, resetToken: string) {
  const resetUrl = `${clientUrl}/reset-password/${resetToken}`;
  await transporter.sendMail({
    to,
    subject: "Reset Password",
    html: `
      <p>You requested a password reset</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link expires in 15 minutes</p>
    `,
  });
}
