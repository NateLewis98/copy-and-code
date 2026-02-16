const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Parse form data
app.use(express.urlencoded({ extended: false }));

// Serve static files (index.html, styles.css, etc.)
app.use(express.static(path.join(__dirname, "public")));

// Handle form submission
app.post("/send-form", async (req, res) => {
  const { first_name, last_name, email, message } = req.body;

  // Validate required fields
  if (!first_name || !last_name || !email) {
    return res.status(400).send("Required fields are missing.");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `Copy and Code <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO || "jokerthief55@gmail.com",
    replyTo: `${first_name} ${last_name} <${email}>`,
    subject: "New Lead from Copy and Code Website",
    text:
      `New contact form submission:\n\n` +
      `Name: ${first_name} ${last_name}\n` +
      `Email: ${email}\n\n` +
      `Message:\n${message || "No message"}\n`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.redirect("/thank-you.html");
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).send(
      `Error: ${error.message}\n\n` +
      `SMTP Host: ${process.env.SMTP_HOST}\n` +
      `SMTP Port: ${process.env.SMTP_PORT}\n` +
      `EMAIL_USER set: ${!!process.env.EMAIL_USER}\n` +
      `EMAIL_PASS set: ${!!process.env.EMAIL_PASS}\n` +
      `EMAIL_TO: ${process.env.EMAIL_TO}`
    );
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
