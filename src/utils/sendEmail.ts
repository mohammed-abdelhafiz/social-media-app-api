import nodemailer from "nodemailer";

const clientUrl = process.env.CLIENT_URL;
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

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
  console.log("Email sent successfully" + to + resetToken);
}
