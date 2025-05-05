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
  const resetURL = `http://localhost:3000/resetpassword`;
  const email = {
    from: "Mise en Plate <mep.miseeneplate@gmail.com>",
    to: to,
    subject: "Reset Your Password",
    html: `<p>To reset your password, please click the link below:</p>
          <a href="${resetURL}">${resetURL}</a>
          <p>Use the following temporary password to complete the reset process:</p>
          <p><strong>${token}</strong></p>`,
  };
  await transporter.sendMail(email);
}
