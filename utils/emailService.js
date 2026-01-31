const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "kshitizmaurya6@gmail.com", // Your Gmail address
    pass: "xuww szqh mjex dccp",       // Replace with your App Password
  },
});

const sendEmail = async (email, subject, text) => {
  try {
    await transporter.sendMail({
      from: '"Your App Name" <kshitizmaurya6@gmail.com>',
      to: email,
      subject,
      text,
    });
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

module.exports = { sendEmail };
