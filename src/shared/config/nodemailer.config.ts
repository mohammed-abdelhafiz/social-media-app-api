import nodemailer from "nodemailer";

const clientUrl = process.env.CLIENT_URL;
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

if (!clientUrl || !emailUser || !emailPass) {
  throw new Error("Missing email configuration (CLIENT_URL/EMAIL_USER/EMAIL_PASS)");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

transporter.options.from = emailUser;

export default transporter;