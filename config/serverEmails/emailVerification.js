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
  const verificationURL = `http://localhost:3000/verify-email`;
  const email = {
    from: "Mise en Plate <mep.miseenplate@gmail.com>",
    to: to,
    subject: "Verify Your Email Address",
    html: `<p>Please verify your email address by clicking the link below:</p>
          <a href="${verificationURL}">${verificationURL}</a>
          <p>Use the following verification key if prompted:</p>
          <p><strong>${token}</strong></p>`,
  };
  await transporter.sendMail(email);
}
