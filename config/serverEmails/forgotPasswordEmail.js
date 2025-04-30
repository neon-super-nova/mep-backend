import nodemailer from "nodemailer";

export async function sendPasswordResetEmail(to, token) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // link to the frontend page where user will be able to change their password
  const resetURL = `https://localhost:3000/reset-password/${token}`;
  const email = {
    from: "Mise en Plate <mep.miseeneplate@gmail.com>",
    to: to,
    subject: "Reset your password",
    html: `<p>Click the link to reset your password. Link expires in 1 hour.</p>
          <a href="${resetURL}"> ${resetURL} </a>`,
  };
  await transporter.sendMail(email);
}
