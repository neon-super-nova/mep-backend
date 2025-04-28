import nodemailer from "nodemailer";

export async function sendVerificationEmail(to, token) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const verificationURL = `http://localhost:3000/api/users/verify-email/${token}`;
  const mail = {
    from: '"Your App" <no-reply@yourapp.com>',
    to,
    subject: "Verify Your Email",
    html: `<p>Click the link to verify your email:</p>
           <a href="${verificationURL}">${verificationURL}</a>`,
  };
  await transporter.sendMail(mail);
}
