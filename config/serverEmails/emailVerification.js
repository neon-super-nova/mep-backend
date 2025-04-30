import nodemailer from "nodemailer";

export async function sendVerificationEmail(to, token) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // link to the frontend page
  const verificationURL = `http://localhost:3000/verify-email/${token}`;
  const email = {
    from: "Mise en Plate <mep.miseenplate@gmail.com>",
    to,
    subject: "Verify Your Email",
    html: `<p>Click the link to verify your email:</p>
           <a href="${verificationURL}">${verificationURL}</a>`,
  };
  await transporter.sendMail(email);
}
